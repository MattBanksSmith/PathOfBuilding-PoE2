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

-- Mirrors the "else" branch of ItemsTab:AddItemTooltip (ItemsTab.lua, the part
-- after the flask/charm special cases). An item is often valid in more than one
-- slot/socket — e.g. a jewel fits several tree sockets, a ring fits Ring 1 or
-- Ring 2 — and the real Items page shows one stat-compare block per valid slot,
-- sorted (empty sockets first, then same-base/same-unique, then by DPS/EHP).
-- Returns the number of comparison blocks added to the tooltip.
local function addItemComparisons(item, build, calcFunc, calcBase, tooltip)
    local itemsTab = build.itemsTab
    itemsTab:UpdateSockets()

    -- The main skill may use a different weapon set than the one active in the UI
    local mainEnv = build.calcsTab.mainEnv
    local weaponSet = mainEnv and mainEnv.weaponSet or (itemsTab.activeItemSet.useSecondWeaponSet and 2 or 1)
    local compareSlots = {}
    for slotName, slot in pairs(itemsTab.slots) do
        if itemsTab:IsItemValidForSlot(item, slotName)
            and not slot.inactive
            and (not slot.weaponSet or slot.weaponSet == weaponSet)
            and (slot.weaponSet or slot.shown())
        then
            table.insert(compareSlots, slot)
        end
    end
    if #compareSlots == 0 then
        return 0
    end

    local function getReplacedItemAndOutput(compareSlot)
        local selItem = itemsTab.items[compareSlot.selItemId]
        local output = calcFunc({ repSlotName = compareSlot.slotName, repItem = item ~= selItem and item or nil })
        return selItem, output
    end
    local function addCompareForSlot(compareSlot, selItem, output)
        if not selItem or not output then
            selItem, output = getReplacedItemAndOutput(compareSlot)
        end
        local label = compareSlot.label or compareSlot.slotName
        local header
        if item == selItem then
            header = string.format("Removing this item from %s will give you:", label)
        else
            header = string.format("Equipping this item in %s will give you:%s",
                label, selItem and ("\n(replacing " .. selItem.name .. ")") or "")
        end
        build:AddStatComparesToTooltip(tooltip, calcBase, output, header)
    end

    local slots = {}
    local isUnique = item.rarity == "UNIQUE" or item.rarity == "RELIC"
    local currentSameUniqueCount = 0
    for _, compareSlot in ipairs(compareSlots) do
        local selItem, output = getReplacedItemAndOutput(compareSlot)
        local isSameUnique = isUnique and selItem and item.name == selItem.name
        if isUnique and isSameUnique and item.limit then
            currentSameUniqueCount = currentSameUniqueCount + 1
        end
        table.insert(slots, { selItem = selItem, output = output, compareSlot = compareSlot, isSameUnique = isSameUnique })
    end

    -- Limited uniques (e.g. "Limited to 1"): once the limit is already met by
    -- other equipped copies, only show the slots holding those copies.
    if item.limit and currentSameUniqueCount == item.limit then
        local count = 0
        for _, slotEntry in ipairs(slots) do
            if slotEntry.isSameUnique then
                addCompareForSlot(slotEntry.compareSlot, slotEntry.selItem, slotEntry.output)
                count = count + 1
            end
        end
        return count
    end

    local function similar(compareItem, sameUnique)
        if not compareItem then return 0 end
        local sameBaseType = not isUnique
            and compareItem.rarity ~= "UNIQUE" and compareItem.rarity ~= "RELIC"
            and item.base.type == compareItem.base.type
            and item.base.subType == compareItem.base.subType
        return (sameBaseType or sameUnique) and 1 or 0
    end
    local function sortFunc(a, b)
        if a == b then return end
        local aParams = { a.compareSlot.selItemId == 0 and 1 or 0, similar(a.selItem, a.isSameUnique),
            a.output.FullDPS, a.output.CombinedDPS, a.output.TotalEHP, a.compareSlot.label, a.compareSlot.slotName }
        local bParams = { b.compareSlot.selItemId == 0 and 1 or 0, similar(b.selItem, b.isSameUnique),
            b.output.FullDPS, b.output.CombinedDPS, b.output.TotalEHP, b.compareSlot.label, b.compareSlot.slotName }
        for i = 1, #aParams do
            if aParams[i] == nil or bParams[i] == nil then
                -- continue
            elseif aParams[i] > bParams[i] then
                return true
            elseif aParams[i] < bParams[i] then
                return false
            end
        end
        return false
    end
    table.sort(slots, sortFunc)

    for _, slotEntry in ipairs(slots) do
        addCompareForSlot(slotEntry.compareSlot, slotEntry.selItem, slotEntry.output)
    end
    return #slots
end

local function evaluateItem(rawText, build)
    local t = socket.gettime()
    ConPrintf("[PoB Trade] evaluateItem: %d chars", #rawText)

    if not build.calcsTab or not build.calcsTab.mainOutput then
        return nil, "build has not finished calculating — try again in a moment"
    end

    -- Parse the item text (same path as pasting an item into PoB)
    local ok, item = pcall(function() return new("Item"):Item(rawText) end)
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

    -- Match ItemsTab:CreateDisplayItemFromRaw(raw, true) — the function that
    -- actually runs when pasting an item into the Items page (ItemsTab.lua
    -- Ctrl+V handler). Without these two steps the evaluated item silently
    -- differs from what the Items page would show:
    --   * CopyAnointsAndAugments carries over the anoint/runes from whatever
    --     is currently equipped in the matching slot, if this item has none.
    --   * The second NormaliseQuality() call bumps quality from 0 up to
    --     main.defaultItemQuality when the pasted text had no Quality: line
    --     (the first NormaliseQuality, inside the constructor's ParseRaw,
    --     only sets it to 0).
    build.itemsTab:CopyAnointsAndAugments(item, main.migrateAugments, false)
    item:NormaliseQuality()
    item:BuildModList()
    t = lap(t, "BuildModList()")

    -- Use the same calculator every other comparison tooltip in PoB uses
    -- (ItemsTab, CompareTab, PassiveTreeView, ...). calcBase and the override
    -- calc are both produced via calcs.initEnv(build, "CALCULATOR"), so the
    -- two output tables are symmetric. Using build.calcsTab.mainOutput (built
    -- via mode "MAIN") as the base while comparing against a "CALCULATOR"-less
    -- override previously caused phantom diffs on MAIN-only fields like
    -- Spec:EnergyShieldInc ("%Inc ES from Tree"), which only get populated by
    -- calcs.buildOutput's mode == "MAIN" branch and were missing/0 on one side.
    local calcFunc, calcBase = build.calcsTab:GetMiscCalculator()

    -- Compare against every slot/socket the item is actually valid for (same
    -- as ItemsTab:AddItemTooltip), not just GetPrimarySlot()'s single guess —
    -- GetPrimarySlot() returns the literal string "Jewel" for jewels, which
    -- isn't a real socket name, so a single-slot override would never match
    -- anything and silently no-op. A ring, for example, may also be valid in
    -- both Ring 1 and Ring 2. No slot/socket state is mutated; this only
    -- reads itemsTab.slots/sockets and runs the read-only calc override.
    local tooltip = newHtmlTooltip()
    local count = addItemComparisons(item, build, calcFunc, calcBase, tooltip)
    t = lap(t, "addItemComparisons()")
    ConPrintf("[PoB Trade]   slots compared: %d", count)

    if tooltip:isEmpty() then
        -- No measurable changes — still return a valid fragment so the
        -- extension has something to display.
        return '<div class="pob-tooltip"><div class="pob-line pob-header">'
            .. htmlEscape(count == 0
                and "No valid equip slot/socket found for this item"
                or "No stat changes detected")
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
