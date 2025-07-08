import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

/**
 * Advanced web scraper using Playwright
 * Handles different websites, login flows, and anti-bot measures
 */
export class ScraperService {
    /**
     * Scrape website data based on provided configuration
     * @param {Object} config - Scraping configuration
     * @param {string} config.url - Target website URL
     * @param {Object} config.selectors - CSS selectors for data extraction
     * @param {Object} [config.login] - Login credentials and selectors
     * @param {boolean} [config.takeScreenshot] - Whether to capture screenshot
     * @param {Object} [config.proxy] - Proxy configuration
     * @returns {Promise<Object>} - Scraped data
     */
    async scrapeWebsite(config) {
        const {
            url,
            selectors,
            login,
            takeScreenshot = false,
            proxy = null,
            userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
        } = config;

        let browser = null;
        let context = null;
        let page = null;

        try {
            // Launch browser with appropriate options
            const launchOptions = {
                headless: true, // Set to false for debugging
                args: [
                    '--disable-blink-features=AutomationControlled'
                ]
            };
            // Only add proxy if it's a valid object and not null
            if (
                config.proxy &&
                typeof config.proxy === 'object' &&
                Object.keys(config.proxy).length > 0
            ) {
                launchOptions.proxy = config.proxy;
            }
            // Defensive: remove proxy if not valid
            if (
                !launchOptions.proxy ||
                typeof launchOptions.proxy !== 'object' ||
                Object.keys(launchOptions.proxy).length === 0
            ) {
                delete launchOptions.proxy;
            }
            // Debug: log launch options before launching browser
            console.log('Launching browser with options:', JSON.stringify(launchOptions, null, 2));
            browser = await chromium.launch(launchOptions);
            // Create a browser context with specific settings to avoid detection
            context = await browser.newContext({
                userAgent,
                viewport: { width: 1920, height: 1080 },
                deviceScaleFactor: 1,
                hasTouch: false,
                javaScriptEnabled: true,
                extraHTTPHeaders: {
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Sec-Fetch-Site': 'same-origin',
                    'Sec-Fetch-Mode': 'navigate'
                }
            });
            // Add human-like behavior script
            await context.addInitScript(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
                Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
                const originalQuerySelector = document.querySelector;
                document.querySelector = function (...args) {
                    const result = originalQuerySelector.apply(this, args);
                    if (result) {
                        const event = new MouseEvent('mouseover', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        result.dispatchEvent(event);
                    }
                    return result;
                };
            });
            page = await context.newPage();
            console.log(`Navigating to ${url}`);
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });
            await this.randomDelay(1000, 3000);
            // Debug: log login config for this job
            console.log('Login config for this job:', login);
            // Only run login if all required fields are present and login is a non-empty object
            if (
                login &&
                typeof login === 'object' &&
                Object.keys(login).length > 0 &&
                login.usernameSelector &&
                login.passwordSelector &&
                login.submitSelector &&
                login.username &&
                login.password
            ) {
                console.log('Handling login...');
                await this.handleLogin(page, login);
            }
            await this.handleCaptcha(page);
            const content = await page.content();
            const $ = cheerio.load(content);
            let selectorsObj = selectors;
            if (typeof selectors === 'string') {
                try {
                    selectorsObj = JSON.parse(selectors);
                } catch (error) {
                    selectorsObj = { content: selectors };
                }
            }
            const data = {};
            Object.entries(selectorsObj).forEach(([key, selector]) => {
                data[key] = [];
                $(selector).each((i, el) => {
                    const text = $(el).text().trim();
                    let href = null;
                    if ($(el).is('a') || $(el).find('a').length) {
                        href = $(el).is('a') ? $(el).attr('href') : $(el).find('a').attr('href');
                    }
                    let imageUrl = null;
                    if ($(el).is('img') || $(el).find('img').length) {
                        imageUrl = $(el).is('img') ? $(el).attr('src') : $(el).find('img').attr('src');
                    }
                    data[key].push({
                        text,
                        ...(href && { href }),
                        ...(imageUrl && { imageUrl })
                    });
                });
            });
            if (takeScreenshot) {
                const screenshotDir = path.join(process.cwd(), 'screenshots');
                await fs.mkdir(screenshotDir, { recursive: true });
                await page.screenshot({
                    path: path.join(screenshotDir, `screenshot-${Date.now()}.png`),
                    fullPage: true
                });
            }
            return data;
        } catch (error) {
            console.error('Scraping error:', error);
            if (page) {
                try {
                    const errorScreenshotDir = path.join(process.cwd(), 'error-screenshots');
                    await fs.mkdir(errorScreenshotDir, { recursive: true });
                    await page.screenshot({
                        path: path.join(errorScreenshotDir, `error-${Date.now()}.png`),
                        fullPage: true
                    });
                } catch (screenshotError) {
                    console.error('Failed to capture error screenshot:', screenshotError);
                }
            }
            throw error;
        } finally {
            if (page) {
                try { await page.close(); } catch (closeError) { console.error('Error closing page:', closeError); }
            }
            if (context) {
                try { await context.close(); } catch (closeError) { console.error('Error closing context:', closeError); }
            }
            if (browser) {
                try { await browser.close(); } catch (closeError) { console.error('Error closing browser:', closeError); }
            }
        }
    }

    /**
     * Handle login process
     * @param {Object} page - Playwright page
     * @param {Object} login - Login configuration
     */
    async handleLogin(page, login) {
        const { usernameSelector, passwordSelector, submitSelector, username, password, navigationTimeout = 30000 } = login;

        try {
            // Wait for the login form to be available
            await page.waitForSelector(usernameSelector, { timeout: 5000 });
            await page.waitForSelector(passwordSelector, { timeout: 5000 });

            // Type with random delays to appear human-like
            await page.fill(usernameSelector, username);
            await this.randomDelay(500, 1500);

            await page.fill(passwordSelector, password);
            await this.randomDelay(500, 1500);

            // Click the submit button
            await page.click(submitSelector);

            // Wait for navigation after login
            await page.waitForNavigation({ timeout: navigationTimeout });

            console.log('Login successful');
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error(`Login process failed: ${error.message}`);
        }
    }

    /**
     * Handle captcha challenges
     * @param {Object} page - Playwright page
     */
    async handleCaptcha(page) {
        // Check for common captcha patterns
        const recaptchaPresent = await page.$('iframe[src*="recaptcha"]');
        const hcaptchaPresent = await page.$('iframe[src*="hcaptcha"]');

        if (recaptchaPresent || hcaptchaPresent) {
            console.log('Captcha detected. Implementing bypass strategy...');

            // For a real application, you might:
            // 1. Use a captcha solving service
            // 2. Implement browser fingerprinting evasion
            // 3. Use IP rotation via proxies

            // For now, we'll just wait a moment and continue
            // In a production app, you'd need a more robust solution
            await this.randomDelay(2000, 5000);
        }
    }

    /**
     * Wait for a random duration to simulate human behavior
     * @param {number} min - Minimum delay in milliseconds
     * @param {number} max - Maximum delay in milliseconds
     */
    async randomDelay(min, max) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Extract structured data from specific website types
     * Can be extended for different website patterns
     * @param {Object} data - Raw scraped data
     * @param {string} websiteType - Type of website (e.g., 'ecommerce', 'blog')
     * @returns {Object} - Structured data
     */
    processScrapedData(data, websiteType) {
        switch (websiteType) {
            case 'ecommerce':
                return this.processEcommerceData(data);
            case 'blog':
                return this.processBlogData(data);
            default:
                return data;
        }
    }

    /**
     * Process e-commerce website data
     * @param {Object} data - Raw scraped data
     * @returns {Object} - Structured product data
     */
    processEcommerceData(data) {
        // Example implementation for e-commerce sites
        const products = [];

        // Match product names with prices
        if (data.productNames && data.prices && data.productNames.length === data.prices.length) {
            for (let i = 0; i < data.productNames.length; i++) {
                products.push({
                    name: data.productNames[i].text,
                    price: data.prices[i].text,
                    url: data.productNames[i].href,
                    image: data.productNames[i].imageUrl
                });
            }
        }

        return { products };
    }

    /**
     * Process blog website data
     * @param {Object} data - Raw scraped data
     * @returns {Object} - Structured blog data
     */
    processBlogData(data) {
        // Example implementation for blog sites
        const articles = [];

        if (data.titles) {
            for (const item of data.titles) {
                articles.push({
                    title: item.text,
                    url: item.href
                });
            }
        }

        return { articles };
    }

    /**
     * Extract data using CSS or XPath selectors
     */
    async extractDataWithSelectors(page, selectors) {
        const results = {};
        for (const [key, selector] of Object.entries(selectors)) {
            try {
                if (typeof selector === 'string' && selector.trim().startsWith('//')) {
                    // XPath selector
                    const elements = await page.$x(selector);
                    if (elements.length > 0) {
                        results[key] = await Promise.all(elements.map(async (el) => {
                            const textContent = await el.evaluate(node => node.textContent);
                            const href = await el.evaluate(node => node.getAttribute('href') || '');
                            return {
                                text: textContent?.trim(),
                                href: href || undefined
                            };
                        }));
                    } else {
                        results[key] = [];
                    }
                } else {
                    // CSS selector
                    const elements = await page.$$(selector);
                    if (elements.length > 0) {
                        results[key] = await Promise.all(elements.map(async (el) => {
                            const textContent = await el.textContent();
                            const href = await el.getAttribute('href');
                            return {
                                text: textContent?.trim(),
                                href: href || undefined
                            };
                        }));
                    } else {
                        results[key] = [];
                    }
                }
            } catch (error) {
                console.error(`Error extracting ${key} with selector ${selector}:`, error);
                results[key] = [];
            }
        }
        return results;
    }
}

// Export singleton instance
export const scraperService = new ScraperService();
