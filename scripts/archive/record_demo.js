const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

(async () => {
  console.log('Starting browser...');
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1280, height: 720 },
    args: ['--window-size=1280,720']
  });
  const page = await browser.newPage();
  
  const Config = {
    followNewTab: false,
    fps: 25,
    videoFrame: {
      width: 1280,
      height: 720,
    },
    aspectRatio: '16:9',
  };
  const recorder = new PuppeteerScreenRecorder(page, Config);
  const savePath = './public/demo.mp4';
  
  console.log('Starting recording...');
  await recorder.start(savePath);

  try {
    console.log('Navigating to POS...');
    await page.goto('http://localhost:3000/pos', { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2000));
    
    // Simulate user clicking around
    // 1. Click the first product
    console.log('Clicking product...');
    await page.evaluate(() => {
      const cards = document.querySelectorAll('.pos-grid > div > div:nth-child(3) > div');
      if(cards.length > 0) cards[0].click();
      if(cards.length > 1) cards[1].click();
    });
    await new Promise(r => setTimeout(r, 1500));
    
    // 2. Select Cash Payment
    console.log('Selecting payment method...');
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const cashBtn = Array.from(buttons).find(b => b.textContent && b.textContent.includes('เงินสด'));
      if(cashBtn) cashBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    
    // 3. Click Checkout
    console.log('Checking out...');
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const checkoutBtn = Array.from(buttons).find(b => b.textContent && b.textContent.includes('ชำระเงิน'));
      if(checkoutBtn) checkoutBtn.click();
    });
    await new Promise(r => setTimeout(r, 3000));

    // 4. Print receipt / Close
    console.log('Closing receipt...');
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const closeBtn = Array.from(buttons).find(b => b.textContent && b.textContent.includes('เสร็จสิ้น'));
      if(closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

  } catch (err) {
    console.error(err);
  }

  console.log('Stopping recording...');
  await recorder.stop();
  await browser.close();
  console.log('Video saved to', savePath);
})();