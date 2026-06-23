const POB_URL = 'http://localhost:10600'

const dotEl    = document.getElementById('dot-pob')
const statusEl = document.getElementById('pob-status')
const buildRow = document.getElementById('build-row')
const buildEl  = document.getElementById('build-name')

async function checkStatus() {
    try {
        const res = await fetch(`${POB_URL}/status`, { signal: AbortSignal.timeout(2000) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        dotEl.className = 'dot ok'
        statusEl.textContent = 'Connected'

        if (data.buildLoaded && data.buildName) {
            buildRow.style.display = 'flex'
            buildEl.textContent = data.buildName
        } else {
            buildRow.style.display = 'none'
            statusEl.textContent = 'Connected (no build loaded)'
            dotEl.className = 'dot warn'
        }
    } catch {
        dotEl.className = 'dot error'
        statusEl.textContent = 'Not running'
        buildRow.style.display = 'none'
    }
}

checkStatus()
