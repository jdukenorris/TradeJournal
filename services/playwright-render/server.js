const express = require('express')
const { chromium } = require('playwright')

const app = express()
app.use(express.json({ limit: '1mb' }))

const PORT = process.env.PORT || 8787
const TOKEN = process.env.PLAYWRIGHT_SERVICE_TOKEN || 'change-me'

app.get('/health', (_req, res) => res.json({ ok: true }))

app.post('/render', async (req, res) => {
  if ((req.headers.authorization || '').replace('Bearer ', '') !== TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const { layoutUrl, symbol, tfs = ['1h','5m'], zoomProfile } = req.body || {}
  if (!layoutUrl) return res.status(400).json({ error: 'layoutUrl required' })

  const browser = await chromium.launch()
  const page = await browser.newPage()
  const out = {}
  try {
    await page.goto(layoutUrl, { waitUntil: 'networkidle' })
    for (const tf of tfs) {
      const buf = await page.screenshot({ fullPage: false })
      out[tf] = `data:image/png;base64,${buf.toString('base64')}`
    }
    res.json({ images: out })
  } catch (e) {
    res.status(500).json({ error: e.message })
  } finally {
    await browser.close()
  }
})

app.listen(PORT, () => console.log('Render service on :' + PORT))


