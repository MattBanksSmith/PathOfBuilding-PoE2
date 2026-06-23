// Runs in ISOLATED world — fetches from PoB localhost server, injects HTML.
// Communicates with inject.js (MAIN world) via window.postMessage to read
// itemText from the DOM.

console.log('[PoB] content.js loaded on', location.href)

const POB_URL = 'http://localhost:10600'
const BUTTON_CLASS = 'pob-eval-btn'
const RESULT_CLASS = 'pob-eval-result'

// Pending callbacks keyed by rowId, resolved when inject.js posts back item text
const pending = new Map()

// ── postMessage bridge to inject.js (MAIN world) ─────────────────────────────

window.addEventListener('message', (e) => {
    const { type, rowId, itemText, error } = e.data || {}
    // Log every pob: message to help diagnose bridge issues
    if (type && type.startsWith('pob:')) {
        console.log('[PoB] content.js message received:', type, rowId,
            '| source===window:', e.source === window,
            '| pending has rowId:', pending.has(rowId))
    }

    if (e.source !== window) return
    if (type !== 'pob:item-data' && type !== 'pob:item-error') return
    if (!pending.has(rowId)) return

    const { resolve, reject } = pending.get(rowId)
    pending.delete(rowId)

    if (type === 'pob:item-data')  resolve(itemText)
    if (type === 'pob:item-error') reject(new Error(error))
})

function requestItemText(rowId) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            pending.delete(rowId)
            reject(new Error('Timed out reading item text from page'))
        }, 5000)
        pending.set(rowId, {
            resolve: (t) => { clearTimeout(timer); resolve(t) },
            reject:  (e) => { clearTimeout(timer); reject(e)  },
        })
        console.log('[PoB] content.js: sending pob:get-item for row', rowId)
        window.postMessage({ type: 'pob:get-item', rowId }, '*')
    })
}

// ── PoB server call ───────────────────────────────────────────────────────────

async function evaluate(itemText) {
    console.log('[PoB] POST /evaluate — body (%d chars):\n%s', itemText.length, itemText)
    const res = await fetch(`${POB_URL}/evaluate`, {
        method: 'POST',
        body: itemText,
        headers: { 'Content-Type': 'text/plain' },
    })
    const bodyText = await res.text()
    console.log('[PoB] /evaluate response: HTTP %d (%d chars):\n%s',
        res.status, bodyText.length,
        bodyText.length > 500 ? bodyText.slice(0, 500) + '…' : bodyText)
    if (!res.ok) {
        let errMsg
        try { errMsg = JSON.parse(bodyText).error } catch (_) {}
        throw new Error(errMsg || `HTTP ${res.status}`)
    }
    return bodyText
}

// ── DOM helpers ───────────────────────────────────────────────────────────────

function removeResult(row) {
    row.querySelector(`.${RESULT_CLASS}`)?.remove()
}

function showResult(row, html) {
    removeResult(row)
    const el = document.createElement('div')
    el.className = RESULT_CLASS
    el.innerHTML = html   // server-generated, trusted local content
    row.querySelector('.middle')?.appendChild(el)
}

function showError(row, message) {
    removeResult(row)
    const el = document.createElement('div')
    el.className = `${RESULT_CLASS} pob-error`
    el.textContent = message
    row.querySelector('.middle')?.appendChild(el)
}

function showLoading(row) {
    removeResult(row)
    const el = document.createElement('div')
    el.className = `${RESULT_CLASS} pob-loading`
    el.textContent = 'Evaluating…'
    row.querySelector('.middle')?.appendChild(el)
}

// ── Button logic ──────────────────────────────────────────────────────────────

async function handleEvaluate(row) {
    const rowId = row.dataset.id
    if (!rowId) return

    showLoading(row)
    try {
        const itemText = await requestItemText(rowId)
        console.log('[PoB] item text for row', rowId, ':\n' + itemText)
        const html = await evaluate(itemText)
        showResult(row, html)
    } catch (err) {
        const msg = err.message.includes('Failed to fetch')
            ? 'PoB not running — open PoB with a build loaded'
            : err.message
        showError(row, msg)
    }
}

function injectButton(row) {
    if (row.querySelector(`.${BUTTON_CLASS}`)) return
    const btn = document.createElement('button')
    btn.className = BUTTON_CLASS
    btn.title = 'Evaluate in Path of Building'
    btn.textContent = 'PoB'
    btn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log('[PoB] button clicked for row', row.dataset.id)
        handleEvaluate(row)
    })
    row.querySelector('.left')?.appendChild(btn)
}

function injectButtons(root) {
    root.querySelectorAll?.('.row[data-id]').forEach(injectButton)
}

// ── DOM watcher ───────────────────────────────────────────────────────────────

new MutationObserver((mutations) => {
    for (const m of mutations) {
        for (const node of m.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue
            if (node.matches?.('.row[data-id]')) injectButton(node)
            else injectButtons(node)
        }
    }
}).observe(document.body, { childList: true, subtree: true })

injectButtons(document)
