const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--window-size=390,844', '--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');
  
  page.on('dialog', async dialog => {
    await dialog.accept('664749');
  });

  const recorder = new PuppeteerScreenRecorder(page, { followNewTab: false, fps: 30, videoFrame: { width: 390, height: 844 } });
  const savePath = 'D:/All Ai/IOS,Asset/public/demo.mp4';
  
  await recorder.start(savePath);

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 1500));
    
    await page.mouse.wheel({ deltaY: 250 });
    await new Promise(r => setTimeout(r, 1000));
    await page.mouse.wheel({ deltaY: -250 });
    await new Promise(r => setTimeout(r, 1000));

    await page.evaluate(() => {
        const btn = document.getElementById('sb-assets-registered');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    
    await page.evaluate(() => {
        const btn = document.getElementById('btn-show-add-asset');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    await page.evaluate(() => {
        const nameInput = document.getElementById('new-asset-name');
        if(nameInput) nameInput.value = 'MacBook Pro M2';
        const catInput = document.getElementById('new-asset-category');
        if(catInput) catInput.value = 'IT Equipment';
        const snInput = document.getElementById('new-asset-sn');
        if(snInput) snInput.value = 'C02ABCDEF123';
    });
    await new Promise(r => setTimeout(r, 1500));
    
    await page.evaluate(() => {
       const backBtn = document.getElementById('gsap-back-btn');
       if(backBtn) backBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    await page.evaluate(() => {
        const btn = document.getElementById('sb-scan-qr');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 2500));
    
  } catch (err) {
    console.error('Error:', err);
  }

  await recorder.stop();
  await browser.close();
})();
