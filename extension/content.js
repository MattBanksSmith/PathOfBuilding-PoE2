// Runs in ISOLATED world — fetches from PoB localhost server, injects HTML.
// Communicates with inject.js (MAIN world) via window.postMessage to read
// itemText from the DOM.

console.log('[PoB] content.js loaded on', location.href)

const POB_URL = 'http://localhost:10600'
const BUTTON_CLASS = 'pob-eval-btn'
const EDIT_BUTTON_CLASS = 'pob-edit-btn'
const RESULT_CLASS = 'pob-eval-result'
const EDITOR_CLASS = 'pob-item-editor'

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

function removeEditor(row) {
    row.querySelector(`.${EDITOR_CLASS}`)?.remove()
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

function showEditor(row, initialText) {
    removeEditor(row)

    const container = document.createElement('div')
    container.className = EDITOR_CLASS

    const textarea = document.createElement('textarea')
    textarea.className = 'pob-editor-textarea'
    textarea.value = initialText
    // Auto-size rows to content
    textarea.rows = initialText.split('\n').length + 1

    const actions = document.createElement('div')
    actions.className = 'pob-editor-actions'

    const evalBtn = document.createElement('button')
    evalBtn.className = 'pob-editor-eval'
    evalBtn.textContent = 'Evaluate'
    evalBtn.addEventListener('click', async () => {
        removeEditor(row)
        showLoading(row)
        try {
            const html = await evaluate(textarea.value)
            showResult(row, html)
        } catch (err) {
            showError(row, err.message)
        }
    })

    const cancelBtn = document.createElement('button')
    cancelBtn.className = 'pob-editor-cancel'
    cancelBtn.textContent = 'Cancel'
    cancelBtn.addEventListener('click', () => removeEditor(row))

    actions.appendChild(evalBtn)
    actions.appendChild(cancelBtn)
    container.appendChild(textarea)
    container.appendChild(actions)
    row.querySelector('.middle')?.appendChild(container)
    textarea.focus()
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

async function handleEdit(row) {
    const rowId = row.dataset.id
    if (!rowId) return

    // Toggle: if editor already open, close it
    if (row.querySelector(`.${EDITOR_CLASS}`)) {
        removeEditor(row)
        return
    }

    removeResult(row)
    try {
        const itemText = await requestItemText(rowId)
        showEditor(row, itemText)
    } catch (err) {
        showError(row, err.message)
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

    const editBtn = document.createElement('button')
    editBtn.className = EDIT_BUTTON_CLASS
    editBtn.title = 'Edit item text before evaluating'
    editBtn.textContent = 'Edit'
    editBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        handleEdit(row)
    })

    const left = row.querySelector('.left')
    left?.appendChild(btn)
    left?.appendChild(editBtn)
}

function injectButtons(root) {
    root.querySelectorAll?.('.row[data-id]').forEach(injectButton)
}

// ── Evaluate-all button ───────────────────────────────────────────────────────

function injectEvaluateAllButton() {
    if (document.querySelector('.pob-eval-all-btn')) return
    const btn = document.createElement('button')
    btn.className = 'pob-eval-all-btn'
    btn.textContent = 'PoB All'
    btn.title = 'Evaluate all items in Path of Building'
    btn.addEventListener('click', async () => {
        const rows = [...document.querySelectorAll('.row[data-id]')]
        for (const row of rows) {
            await handleEvaluate(row)
        }
    })
    document.body.appendChild(btn)
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
injectEvaluateAllButton()
