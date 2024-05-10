import * as puppeteer from 'puppeteer';

export class Puppeteer {
  browser: puppeteer.Browser | null;
  options: puppeteer.LaunchOptions;
  pageOptions: { networkIdle2Timeout: number; waitUntil: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2'; timeout: number };

  constructor() {
    this.browser = null;
    this.options = {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    } as puppeteer.LaunchOptions;
        
    this.pageOptions = {
      networkIdle2Timeout: 5000,
      waitUntil: 'networkidle2',
      timeout: 3000000
    };
  }

  async initBrowser() {
    this.browser = await puppeteer.launch(this.options);
  }

  closeBrowser() {
    if(this.browser){
      this.browser.close();
    }
  }

  async getHTML(url: string) {
    if (!this.browser) {
      await this.initBrowser();
    }

    const page = await this.browser!.newPage();
    await page.goto(url, this.pageOptions);
    const content = await page.content();
    await page.close()
    return content;
  }
}
