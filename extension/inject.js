// Runs in MAIN world — has access to the page's full DOM.
// Responds to postMessage requests from content.js (ISOLATED world).

console.log('[PoB] inject.js loaded')

const RARITY_MAP = {
    'item-popup--normal':     'Normal',
    'item-popup--magic':      'Magic',
    'item-popup--rare':       'Rare',
    'item-popup--unique':     'Unique',
    'item-popup--gem':        'Gem',
    'item-popup--currency':   'Currency',
    'item-popup--divination': 'Divination Card',
    'item-popup--quest':      'Quest',
    'item-popup--relic':      'Relic',
}

function getRarity(popup) {
    for (const [cls, rarity] of Object.entries(RARITY_MAP)) {
        if (popup.classList.contains(cls)) return rarity
    }
    return 'Normal'
}

function textOf(el) { return el ? el.textContent.trim() : '' }

function parseItemText(popup) {
    const lines = []

    // Item class — first .item-property .lc span
    const itemClassEl = popup.querySelector('.item-property .lc span')
    if (itemClassEl) lines.push('Item Class: ' + textOf(itemClassEl))

    lines.push('Rarity: ' + getRarity(popup))

    // Name / type lines
    popup.querySelectorAll('.item-popup__header-line').forEach(el => {
        const t = textOf(el)
        if (t) lines.push(t)
    })

    lines.push('--------')

    // Properties (Quality, Armour, etc.) — skip item class, requirements, item level
    let propAdded = false
    let skipFirst = !!itemClassEl
    popup.querySelectorAll('.item-property:not(.item-popup__property--requirements)').forEach(el => {
        if (skipFirst) { skipFirst = false; return }
        if (el.querySelector('[data-field="ilvl"]')) return
        const t = textOf(el)
        if (t) { lines.push(t); propAdded = true }
    })
    if (propAdded) lines.push('--------')

    // Requirements
    const reqEl = popup.querySelector('.item-popup__property--requirements')
    if (reqEl) {
        const raw = textOf(reqEl)
        const level = raw.match(/Level[:\s]+(\d+)/)?.[1]
        const str   = raw.match(/Str[:\s]+(\d+)/)?.[1]
        const dex   = raw.match(/Dex[:\s]+(\d+)/)?.[1]
        const int   = raw.match(/Int[:\s]+(\d+)/)?.[1]
        lines.push('Requirements:')
        if (level) lines.push('Level: ' + level)
        if (str)   lines.push('Str: '   + str)
        if (dex)   lines.push('Dex: '   + dex)
        if (int)   lines.push('Int: '   + int)
        lines.push('--------')
    }

    // Item level
    const ilvlEl = popup.querySelector('[data-field="ilvl"]')
    if (ilvlEl) {
        lines.push(textOf(ilvlEl))
        lines.push('--------')
    }

    // Mods — ordered to match PoB's parser expectations
    function addMods(selector, tag) {
        const mods = []
        popup.querySelectorAll(selector).forEach(el => {
            const t = textOf(el)
            if (t) mods.push(tag ? t + ' (' + tag + ')' : t)
        })
        return mods
    }

    const enchants   = addMods('.item-mod--enchant .s',   'enchant')
    const runes      = addMods('.item-mod--rune .s',      'rune')
    const implicits  = addMods('.item-mod--implicit .s',  'implicit')
    const fractured  = addMods('.item-mod--fractured .s', 'fractured')
    const explicits  = addMods('.item-mod--explicit .s',  null)
    const desecrated = addMods('.item-mod--desecrated .s','desecrated')

    if (enchants.length)   { enchants.forEach(m => lines.push(m));   lines.push('--------') }
    if (runes.length)      { runes.forEach(m => lines.push(m));      lines.push('--------') }
    if (implicits.length)  { implicits.forEach(m => lines.push(m));  lines.push('--------') }
    fractured.forEach(m  => lines.push(m))
    explicits.forEach(m  => lines.push(m))
    desecrated.forEach(m => lines.push(m))

    return lines.join('\n')
}

window.addEventListener('message', (e) => {
    if (e.source !== window) return
    if (!e.data || e.data.type !== 'pob:get-item') return

    const { rowId } = e.data
    console.log('[PoB] inject.js: pob:get-item for row', rowId)

    const row = document.querySelector(`.row[data-id="${CSS.escape(rowId)}"]`)
    if (!row) {
        console.warn('[PoB] inject.js: row not found:', rowId)
        window.postMessage({ type: 'pob:item-error', rowId, error: 'Row not found' }, '*')
        return
    }

    const popup = row.querySelector('.item-popup')
    if (!popup) {
        console.warn('[PoB] inject.js: no .item-popup in row', rowId)
        window.postMessage({ type: 'pob:item-error', rowId, error: 'Item popup not found' }, '*')
        return
    }

    const itemText = parseItemText(popup)
    console.log('[PoB] inject.js: extracted item text:\n' + itemText)

    window.postMessage({ type: 'pob:item-data', rowId, itemText }, '*')
})
