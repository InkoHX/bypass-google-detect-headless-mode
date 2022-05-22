require('dotenv').config()

const puppeteer = require('puppeteer')

async function main() {
  const browser = await puppeteer.launch({
    headless: process.argv.includes('--headless'),
    args: [
      '--start-maximized',
      '--disable-extensions',
      '--disable-default-apps',
      '--disable-blink-features=AutomationControlled',
      '--disable-component-extensions-with-background-pages',
    ],
  })
  const page = await browser.newPage()

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36')
  await page.evaluateOnNewDocument(() => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/webdriver
    delete Object.getPrototypeOf(navigator).webdriver
    
    // Mock chrome.runtime
    window.chrome = {
      runtime: {},
    }
  })

  await page.goto('https://accounts.google.com')

  await page.type('input[type="email"]', process.env.EMAIL)
  await page.click('#identifierNext > div > button')

  try {
    await page.waitForSelector('input[type="password"]', { timeout: 3000 })

    console.log('PASS!')
  } catch (_) {
    console.error('FAILED!')
  } finally {
    await browser.close()
  }
}

main().catch(console.error)

