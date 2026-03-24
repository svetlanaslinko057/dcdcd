import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';

@Injectable()
export class BrowserService implements OnModuleInit, OnModuleDestroy {
  private browser: Browser | null = null;
  private pagePool: Page[] = [];
  private readonly maxPages = 5;
  private readonly minInterval = 1000; // 1 second between requests
  private lastRequest = 0;

  async onModuleInit() {
    await this.initBrowser();
  }

  async onModuleDestroy() {
    await this.closeBrowser();
  }

  private async initBrowser(): Promise<void> {
    if (this.browser) return;
    
    // Find Chromium executable
    const executablePath = process.env.CHROMIUM_PATH || '/usr/lib/chromium/chromium';
    
    this.browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--single-process',
      ],
    });
    
    console.log('[BrowserService] Puppeteer browser initialized');
  }

  async getPage(): Promise<Page> {
    if (!this.browser) {
      await this.initBrowser();
    }

    // Reuse page from pool if available
    if (this.pagePool.length > 0) {
      return this.pagePool.pop()!;
    }

    const page = await this.browser!.newPage();
    
    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    // Block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    return page;
  }

  async releasePage(page: Page): Promise<void> {
    if (this.pagePool.length < this.maxPages) {
      this.pagePool.push(page);
    } else {
      await page.close();
    }
  }

  async rateLimit(): Promise<void> {
    const now = Date.now();
    const diff = now - this.lastRequest;
    if (diff < this.minInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minInterval - diff));
    }
    this.lastRequest = Date.now();
  }

  async fetchPage(url: string, waitForSelector?: string): Promise<string | null> {
    const page = await this.getPage();
    
    try {
      await this.rateLimit();
      
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      
      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { timeout: 10000 });
      }
      
      const html = await page.content();
      console.log(`[BrowserService] Fetched ${url} (${html.length} bytes)`);
      
      return html;
    } catch (error) {
      console.error(`[BrowserService] Error fetching ${url}:`, error.message);
      return null;
    } finally {
      await this.releasePage(page);
    }
  }

  async extractNextData(url: string): Promise<any | null> {
    const page = await this.getPage();
    
    try {
      await this.rateLimit();
      
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      
      // Extract __NEXT_DATA__ from script tag
      const nextData = await page.evaluate(() => {
        const script = document.getElementById('__NEXT_DATA__');
        if (script && script.textContent) {
          try {
            return JSON.parse(script.textContent);
          } catch {
            return null;
          }
        }
        return null;
      });
      
      if (nextData) {
        console.log(`[BrowserService] Extracted __NEXT_DATA__ from ${url}`);
      }
      
      return nextData;
    } catch (error) {
      console.error(`[BrowserService] Error extracting data from ${url}:`, error.message);
      return null;
    } finally {
      await this.releasePage(page);
    }
  }

  async fetchHtml(url: string): Promise<string | null> {
    const page = await this.getPage();
    
    try {
      await this.rateLimit();
      
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      
      const html = await page.content();
      console.log(`[BrowserService] Fetched HTML from ${url} (${html.length} bytes)`);
      
      return html;
    } catch (error) {
      console.error(`[BrowserService] Error fetching HTML from ${url}:`, error.message);
      return null;
    } finally {
      await this.releasePage(page);
    }
  }

  async closeBrowser(): Promise<void> {
    for (const page of this.pagePool) {
      await page.close();
    }
    this.pagePool = [];
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    
    console.log('[BrowserService] Browser closed');
  }
}
