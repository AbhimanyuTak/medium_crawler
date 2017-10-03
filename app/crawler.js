const scraper = require('./scraper')
const Queue = require('./queue')
const toCSV = require('./output_file')
const config = require('./config/crawler.json')

/**
 * @constructor
 * A construct to crawl the website
 * @param {String} startUrl
 */
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

/**
 * @param  {[type]}
 * @return {[type]}
 */
Crawler.prototype.getBaseURL = function (url) {
	if (url.indexOf("://") > -1) {
        return url.split('/')[0] + "//" + url.split('/')[2];
    }
    else {
        return null
    }
}

/**
 * To generate a final list of gathered links
 * @param  {String} link
 */
Crawler.prototype.finalLinks = function (link) {
	if(this.allLinks.indexOf(link) === -1) {
		this.allLinks.push(link)
	}
}

/**
 * Seeding the queue to initialize crawler
 * @param  {String} startUrl
 */
Crawler.prototype.initQueue = function (startUrl) {
	this.queue.enqueue(startUrl)
}

/**
 * For merging arrays and suspending duplicates
 * @param  {Array}
 * @param  {Array}
 * @return {Array}
 */
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

/**
 * Recursively processess the queue, and throttle the requests
 * @return {[type]}
 */
Crawler.prototype.traverse = function () {
	let self = this

	while(!self.queue.isEmpty() && this.totalRequests < config.MAX_REQUESTS) {
		crawlerPaused = false
		console.log("making", this.concurrentReq, "concurrent requests and", this.totalRequests, "requests made")
		if(this.concurrentReq < config.MAX_CONCURRENT_REQUESTS) {
			let currentLink = this.queue.dequeue()
			this.finalLinks(currentLink)

			if(currentLink) {
				let baseURL = this.getBaseURL(currentLink)
				console.log("scraping...", currentLink)
				if(baseURL !== null) {
					this.totalRequests++
					this.concurrentReq++

					scraper.requestPage(baseURL, currentLink)
					.then(function (links) {
			        	// console.log(links)
			        	self.concurrentReq--
			        	self.queue.enqueueArray(links)

			        	// Invoke traverse function if crawler is paused
			        	if(self.crawlerPaused && !self.crawlerStopped) self.traverse()
				    })
				    .catch(function (err) {
				    	self.concurrentReq--
				    	self.queue.enqueue(currentLink)
				    });
				}
			}
		}
		else {
			this.crawlerPaused = true
			break;
		}
	}


	// Pause crawler if queue is exhausted
	if(this.queue.isEmpty() && this.concurrentReq > 0) {
		this.crawlerPaused = true
	}

	// Stop crawler if no more requests to be made
	if((this.concurrentReq === 0 && this.queue.isEmpty()) || this.totalRequests >= config.MAX_REQUESTS) {
		this.crawlerStopped = true
		this.allLinks = this.mergeArrayUniqueValues(this.allLinks, this.queue.getQueue())
		console.log(this.concurrentReq, " ", this.totalRequests)
		console.log("total links found", this.allLinks.length)
		toCSV.writeToCSV(this.allLinks)
	}


}


/**
 * @return {[type]}
 */
Crawler.prototype.startCrawling = function () {
	this.traverse()
}


module.exports = Crawler
