
const { readFileSync } = require('fs-extra')
const puppeteer = require('puppeteer')
const { resolve } = require('path')
const { sleep } = require('./utils')
class Skeleton {
    constructor(options) {
        this.options = options
    }
    async initialize() {
         // 打开一个浏览器
       this.browser = await puppeteer.launch({ headless: false }) // 无头
    }
    async newPage() {
        let page = await this.browser.newPage()
        await page.emulate(puppeteer.devices[this.options.device])
        return page
    }
    async makeSkeleton(page) {
        const { defer = 3000 } = this.options;
        let scriptContent = await readFileSync(resolve(__dirname, 'skeletonScript.js'), 'utf8')
        await page.addScriptTag({ content: scriptContent })
        sleep(defer)
        await page.evaluate((options) => {
            Skeleton.genSkeleton(options)
        }, this.options)
    }
    async genHtml(url) {
        let page = await this.newPage(url)
        let response =  await page.goto(url, { waitUntil: 'networkidle2' })
        if (response && !response.ok()) {
            // 如果访问不成功
            throw new Error(`${response.status} on ${url}`);
        }
        // 创建骨架屏
        await this.makeSkeleton(page)
        const { html, styles } = await page.evaluate(() => Skeleton.getHtmlAndStyle())
        console.log(styles)
        let result = `
            <style>${styles.join('\n')}</style>
            ${html}
        `
        return result
    }
    async destroy() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

module.exports = Skeleton