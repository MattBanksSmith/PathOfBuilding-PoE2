-- PoB Trade Evaluator — persistent non-blocking HTTP server
-- Polled once per frame from Main.lua.
-- POST /evaluate  — body = raw PoE item text → text/html tooltip fragment
-- GET  /status    — application/json { ok, buildLoaded, buildName }

local socket = require("socket")

local M = {}
local server = nil
local PORT = 10600

-- ── JSON (used only for /status and error responses) ─────────────────────────

local function jsonStr(s)
    return '"' .. tostring(s)
        :gsub('\\', '\\\\'):gsub('"', '\\"')
        :gsub('\n', '\\n'):gsub('\r', '\\r'):gsub('\t', '\\t') .. '"'
end

local function jsonVal(v)
    local t = type(v)
    if     t == "nil"     then return "null"
    elseif t == "boolean" then return tostring(v)
    elseif t == "number"  then return v ~= v and "null" or string.format("%.6g", v)
    elseif t == "string"  then return jsonStr(v)
    elseif t == "table"   then
        if #v > 0 then
            local p = {}
            for _, x in ipairs(v) do p[#p+1] = jsonVal(x) end
            return "[" .. table.concat(p, ",") .. "]"
        end
        local p = {}
        for k, x in pairs(v) do p[#p+1] = jsonStr(tostring(k)) .. ":" .. jsonVal(x) end
        return "{" .. table.concat(p, ",") .. "}"
    end
    return "null"
end

-- ── HTTP helpers ──────────────────────────────────────────────────────────────

local CORS =
    "Access-Control-Allow-Origin: *\r\n" ..
    "Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n" ..
    "Access-Control-Allow-Headers: Content-Type\r\n" ..
    "Access-Control-Allow-Private-Network: true\r\n"

local function respond(client, status, body, mime)
    mime = mime or "application/json"
    client:send(string.format(
        "HTTP/1.1 %s\r\nContent-Type: %s; charset=utf-8\r\n%sContent-Length: %d\r\nConnection: close\r\n\r\n%s",
        status, mime, CORS, #body, body
    ))
end

local function readRequest(client)
    -- 20ms for first line: long enough for loopback to deliver data (<1ms
    -- typical), short enough to drop phantom pre-connect probes quickly.
    client:settimeout(0.02)
    local line, err = client:receive("*l")
    if not line then return nil, nil end  -- nil sentinel = phantom, close silently

    client:settimeout(0.5)
    local method, path = line:match("^(%S+) (%S+) HTTP")
    if not method then return nil, "bad request line" end
    local contentLength = 0
    while true do
        line = client:receive("*l")
        if not line or line == "" then break end
        local k, v = line:match("^([^:]+):%s*(.+)")
        if k and k:lower() == "content-length" then contentLength = tonumber(v) or 0 end
    end
    local body = ""
    if contentLength > 0 then body = client:receive(contentLength) or "" end
    return { method = method, path = path, body = body }
end

-- ── HTML tooltip builder ──────────────────────────────────────────────────────
-- Wraps PoB's existing CompareStatList / AddStatComparesToTooltip logic.
-- Those functions call tooltip:AddLine(size, text) where `text` is a PoB
-- colour-coded string.  We intercept AddLine, detect POSITIVE/NEGATIVE prefixes
-- (^x33FF77 / ^xDD0022 from Global.lua), strip all other colour codes, and
-- emit plain HTML spans that the extension styles with CSS.

local POS_CODE = colorCodes.POSITIVE  -- "^x33FF77"
local NEG_CODE = colorCodes.NEGATIVE  -- "^xDD0022"

local function stripPobCodes(s)
    s = s:gsub("%^x%x%x%x%x%x%x", "")  -- ^xRRGGBB
    s = s:gsub("%^%d", "")              -- ^0 … ^9
    s = s:gsub("%^[a-z]", "")           -- ^r, ^s, ^b, …
    return s
end

local function htmlEscape(s)
    return (s:gsub("&","&amp;"):gsub("<","&lt;"):gsub(">","&gt;"):gsub('"',"&quot;"))
end

local function newHtmlTooltip()
    local parts = {}
    return {
        -- Called by CompareStatList for every line it wants to emit
        AddLine = function(self, size, text)
            if not text or text == "" then return end
            local cls
            if text:sub(1, #POS_CODE) == POS_CODE then
                cls = "pob-pos"
            elseif text:sub(1, #NEG_CODE) == NEG_CODE then
                cls = "pob-neg"
            else
                cls = "pob-header"
            end
            -- Newlines inside a single AddLine call (e.g. minion header) → <br>
            local clean = htmlEscape(stripPobCodes(text)):gsub("\n", "<br>")
            parts[#parts + 1] = '<div class="pob-line ' .. cls .. '">' .. clean .. '</div>'
        end,
        isEmpty = function(self) return #parts == 0 end,
        toHTML  = function(self)
            return '<div class="pob-tooltip">' .. table.concat(parts) .. '</div>'
        end,
    }
end

-- ── Item evaluation ───────────────────────────────────────────────────────────

local function lap(t0, label)
    local dt = socket.gettime() - t0
    ConPrintf("[PoB Trade]   %-26s %.0f ms", label, dt * 1000)
    return socket.gettime()
end

local function evaluateItem(rawText, build)
    local t = socket.gettime()
    ConPrintf("[PoB Trade] evaluateItem: %d chars", #rawText)

    if not build.calcsTab or not build.calcsTab.mainOutput then
        return nil, "build has not finished calculating — try again in a moment"
    end
    local calcs = build.calcsTab.calcs

    -- Parse the item text (same path as pasting an item into PoB)
    local ok, item = pcall(new, "Item", rawText)
    t = lap(t, "new Item()")
    if not ok or not item then
        return nil, "item parse error: " .. tostring(item)
    end
    if not item.base then
        return nil, string.format(
            "unrecognised item base '%s' — check PoB data is up to date",
            item.baseName or "?"
        )
    end

    item:BuildModList()
    t = lap(t, "BuildModList()")

    local slotName = item:GetPrimarySlot()
    ConPrintf("[PoB Trade]   slot: %s", tostring(slotName))

    -- Run a "what-if" calc using the existing override mechanism in CalcSetup
    -- (repSlotName / repItem are read at line 806 of CalcSetup.lua).
    -- No slot state is mutated; this is entirely side-effect-free.
    local override = { repSlotName = slotName, repItem = item }
    local afterEnv = calcs.initEnv(build, "MAIN", override)
    t = lap(t, "calcs.initEnv()")

    calcs.perform(afterEnv)
    t = lap(t, "calcs.perform()")

    -- Delegate ALL comparison logic to the existing PoB function.
    -- build.displayStats is loaded by Build:Init from BuildDisplayStats.lua and
    -- contains every stat PoB knows how to compare, including condFuncs,
    -- lowerIsBetter flags, compPercent formatting, skill-flag guards, etc.
    local header = string.format("Equipping this item in %s will give you:", slotName)
    local tooltip = newHtmlTooltip()
    build:AddStatComparesToTooltip(tooltip, build.calcsTab.mainOutput, afterEnv.player.output, header)
    t = lap(t, "AddStatComparesToTooltip()")

    if tooltip:isEmpty() then
        -- No measurable changes — still return a valid fragment so the
        -- extension has something to display.
        return '<div class="pob-tooltip"><div class="pob-line pob-header">'
            .. htmlEscape(string.format("No stat changes detected (%s)", slotName))
            .. '</div></div>'
    end

    return tooltip:toHTML()
end

-- ── Request routing ───────────────────────────────────────────────────────────

local function handleClient(client, build)
    local t0 = socket.gettime()
    local req, err = readRequest(client)
    if not req then
        if err then  -- nil err = phantom pre-connect, close silently
            ConPrintf("[PoB Trade] Bad request: %s", err)
            respond(client, "400 Bad Request", jsonVal({ error = err }))
        end
        return
    end
    ConPrintf("[PoB Trade] %s %s  body=%d bytes  read=%.0f ms",
        req.method, req.path, #req.body, (socket.gettime() - t0) * 1000)

    if req.method == "OPTIONS" then
        respond(client, "200 OK", "")
        return
    end

    if req.method == "GET" and req.path == "/status" then
        respond(client, "200 OK", jsonVal({
            ok          = true,
            buildLoaded = build ~= nil,
            buildName   = (build and build.buildName) or nil,
        }))
        return
    end

    if req.method == "POST" and req.path == "/evaluate" then
        if not build then
            respond(client, "503 Service Unavailable",
                jsonVal({ error = "No build loaded in PoB" }))
            return
        end
        if req.body == "" then
            respond(client, "400 Bad Request",
                jsonVal({ error = "Empty body — send raw PoE item text" }))
            return
        end

        local evalStart = socket.gettime()
        local html, errMsg = evaluateItem(req.body, build)
        local evalMs = (socket.gettime() - evalStart) * 1000
        if html then
            ConPrintf("[PoB Trade] 200 OK  html=%d bytes  total=%.0f ms", #html, evalMs)
            respond(client, "200 OK", html, "text/html")
        else
            ConPrintf("[PoB Trade] 422  error=%s  total=%.0f ms", tostring(errMsg), evalMs)
            respond(client, "422 Unprocessable Entity", jsonVal({ error = errMsg }))
        end
        return
    end

    respond(client, "404 Not Found", jsonVal({ error = "unknown endpoint: " .. req.path }))
end

-- ── Public API ────────────────────────────────────────────────────────────────

function M.start()
    local ok, srv = pcall(socket.bind, "*", PORT)
    if ok and srv then
        srv:settimeout(0)  -- non-blocking: accept() returns nil immediately when idle
        server = srv
        ConPrintf("[PoB Trade] Item server listening on http://localhost:%d", PORT)
    else
        ConPrintf("[PoB Trade] Failed to start item server on port %d: %s", PORT, tostring(srv))
    end
end

function M.stop()
    if server then
        server:close()
        server = nil
        ConPrintf("[PoB Trade] Item server stopped")
    end
end

-- Called once per frame from Main.lua.
-- settimeout(0) makes accept() return nil instantly when no client is waiting,
-- so this costs essentially nothing on frames where no request arrives.
local lastPollTime = nil

function M.poll(build)
    if not server then return end
    local now = socket.gettime()
    if lastPollTime then
        local gap = (now - lastPollTime) * 1000
        if gap > 100 then
            ConPrintf("[PoB Trade] poll() gap: %.0f ms", gap)
        end
    end
    lastPollTime = now

    -- Drain all queued connections each frame so backlog doesn't accumulate.
    for _ = 1, 16 do
        local client = server:accept()
        if not client then return end
        local ok, err = pcall(handleClient, client, build)
        if not ok then
            ConPrintf("[PoB Trade] Handler error: %s", tostring(err))
        end
        client:close()
    end
end

return M
