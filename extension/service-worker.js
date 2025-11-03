const API_BASE = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_APP_URL) || 'http://localhost:3000'

async function getToken() {
  return new Promise(resolve => chrome.storage.local.get(['deviceToken'], v => resolve(v.deviceToken)))
}

async function ensureTab(url) {
  const tabs = await chrome.tabs.query({ url: '*://*.tradingview.com/*' })
  if (tabs.length) return tabs[0]
  const created = await chrome.tabs.create({ url, active: true })
  return created
}

async function captureVisible(tabId) {
  await chrome.tabs.update(tabId, { active: true })
  const dataUrl = await chrome.tabs.captureVisibleTab()
  return dataUrl
}

async function uploadSigned(signedUrl, dataUrl) {
  const blob = await (await fetch(dataUrl)).blob()
  const res = await fetch(signedUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': 'image/png' } })
  return res.ok
}

async function poll() {
  const token = await getToken()
  if (!token) return
  try {
    const res = await fetch(`${API_BASE}/api/devices/next`, { headers: { 'device-token': token } })
    if (res.status === 204) return
    if (!res.ok) return
    const { command } = await res.json()
    const tab = await ensureTab(command.layoutUrl || 'https://www.tradingview.com/chart/')
    for (const tf of command.tfs) {
      const dataUrl = await captureVisible(tab.id)
      const target = command.uploadTargets[tf]
      await uploadSigned(target.signedUrl, dataUrl)
    }
    await fetch(`${API_BASE}/api/capture/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ captureId: command.captureId, images: Object.keys(command.uploadTargets).map(tf => ({ tf, object_key: command.uploadTargets[tf].path })) }) })
  } catch (e) {}
}

setInterval(poll, 5000)


