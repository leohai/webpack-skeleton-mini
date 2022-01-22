const { resolve } = require('path')
const { readFileSync, writeFileSync } = require('fs-extra')
const Server = require('./Server')
const Skeleton = require('./Skeleton')
const PLUGIN_NAME = 'SkeletonPlugin'


class SkeletonPlugin {
    constructor(options) {
        this.options = options
    }
    // 代表webpack编译对象
    apply(compile) {
        // compile身上会有很多的钩子，我们可以通过tap来注册这些钩子函数的监听
        // 当这个钩子触发的时候，会调用我们的监听函数
        // done 整个编译流程走完了，dist目录下的文件都生成了就可以触发done的回调执行了
        compile.hooks.done.tap(PLUGIN_NAME, async()=>{
            await this.startServer() // 启动一个http服务器
            this.skeleton = new Skeleton(this.options)
            await this.skeleton.initialize() // 启动一个无头浏览器
            // 生成骨架屏的html和style
            const skeletonHTML = await this.skeleton.genHtml(this.options.origin)
            console.log("skeletonHTML", skeletonHTML)
            const originPath = resolve(this.options.staticDir, 'index.html')
            const originHtml = readFileSync(originPath, 'utf8')
            const finalHTML = originHtml.replace('<!-- shell-->', skeletonHTML)
            await writeFileSync(originPath, finalHTML)
            // await this.skeleton.destroy()
            // await this.server.close()
        })
    }
    async startServer() {
        this.server = new Server(this.options)
        await this.server.listener()
    }
}

module.exports = SkeletonPlugin