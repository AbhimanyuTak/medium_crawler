// import requestPage from './crawler'
const scraper = require('./scraper')
const Queue = require('./queue')
const toCSV = require('./output_file')
const config = require('./config/crawler.json')

console.log(config.MAX_REQUESTS)


let Crawler = function(startUrl) {
	this.startUrl = startUrl
	this.allLinks = [startUrl]
	this.totalRequests = 0
	this.concurrentReq = 0
	this.crawlerPaused = false
	this.crawlerStopped = false
	this.queue = new Queue()
	this.initQueue(startUrl)
}

Crawler.prototype.getBaseURL = function (url) {
	if (url.indexOf("://") > -1) {
        return url.split('/')[0] + "//" + url.split('/')[2];
    }
    else {
        return null
    }
}

Crawler.prototype.finalLinks = function (link) {
	if(this.allLinks.indexOf(link) === -1) {
		this.allLinks.push(link)
	}
}

Crawler.prototype.initQueue = function (startUrl) {
	this.queue.enqueue(startUrl)
}

Crawler.prototype.mergeArrayUniqueValues = function (arr1, arr2) {
	let arr3 = []

	arr3 = arr3.concat(arr1)

	for(let i in arr2) {
		if(arr3.indexOf(arr2[i])) {
			arr3.push(arr2[i])
		}
	}
	return arr3
}

Crawler.prototype.traverse = function () {
	let self = this
	let crawlerPaused = this.crawlerPaused
	let concurrentReq = this.concurrentReq
	let totalRequests = this.totalRequests

	while(!self.queue.isEmpty() && totalRequests < config.MAX_REQUESTS) {
		crawlerPaused = false
		console.log("making", concurrentReq, "concurrent requests", totalRequests, "requests made")
		if(this.concurrentReq < config.MAX_CONCURRENT_REQUESTS) {
			let currentLink = this.queue.dequeue()
			this.finalLinks(currentLink)

			if(currentLink) {
				let baseURL = this.getBaseURL(currentLink)
				console.log("scraping...", currentLink)
				if(baseURL !== null) {
					console.log("woh")
					totalRequests++
					concurrentReq++
					scraper.requestPage(baseURL, currentLink)
						.then(function (links) {
				        	// console.log(links)
				        	concurrentReq--
				        	self.queue.enqueueArray(links)
				        	console.log(self.queue.getQueue())

				        	if(crawlerPaused) self.traverse()
					    })
					    .catch(function (err) {
					    	concurrentReq--
					    	self.queue.enqueue(currentLink)
					    });
				}
			}
		}
		else {
			crawlerPaused = true
			break;
		}
	}


	if(this.queue.isEmpty() && concurrentReq > 0) {
		crawlerPaused = true
	}

	if((concurrentReq === 0 && this.queue.isEmpty()) || totalRequests >= config.MAX_REQUESTS) {
		this.crawlerStopped = true
		this.allLinks = this.mergeArrayUniqueValues(this.allLinks, this.queue.getQueue())
		console.log("total links found", this.allLinks.length)
		toCSV.writeToCSV(this.allLinks)
	}


}

Crawler.prototype.startCrawling = function () {
	this.traverse()
}


module.exports = Crawler
