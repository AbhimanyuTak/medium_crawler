const Crawler = require('./crawler')
const startUrl = "https://medium.com"


let crawler = new Crawler(startUrl)
crawler.startCrawling()


