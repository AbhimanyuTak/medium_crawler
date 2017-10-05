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
	this.allLinks = {}
	this.allLinks[startUrl] = false
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
 * Checks if link is from the same target domain
 * 
 * @param  {String} baseUrl
 * @param  {String} link
 * @return {Boolean} 
 */
Crawler.prototype.linkFromDomain = function (baseUrl, link) {
	return baseUrl && link.startsWith(baseUrl)
}

/**
 * Trims trailing slash and spaces from URL
 * @param  {String} link
 */
Crawler.prototype.trimURL = function (link) {
	link = link.trim()
	if(link[link.length - 1] === "/") {
		link = link.substr(0, link.length - 1)
	}

	return link
}

/**
 * Seeding the queue to initialize crawler
 * @param  {String} startUrl
 */
Crawler.prototype.initQueue = function (startUrl) {
	this.queue.enqueue(startUrl)
}

/**
 * For merging arrays links into global pool
 * @param  {Object} obj
 * @param  {Array} arr
 * @return {Object}
 */
Crawler.prototype.mergeArrayWithObject = function (obj, arr) {
	for(let i in arr) { obj[arr[i]] = true }
	return obj
}

/**
 * Recursively processess the queue, and throttle the requests
 * @return {[type]}
 */
Crawler.prototype.traverse = function () {
	let self = this

	while(!self.queue.isEmpty() && (config.INFINTE_CRAWL || this.totalRequests < config.MAX_REQUESTS)) {
		crawlerPaused = false
		console.log("making", this.concurrentReq, "concurrent requests and", this.totalRequests, "requests made")
		if(this.concurrentReq < config.MAX_CONCURRENT_REQUESTS) {
			let currentLink = this.queue.dequeue()
			// this.finalLinks(currentLink)
			currentLink = this.trimURL(currentLink)

			if(!this.allLinks.hasOwnProperty(currentLink)) {
				this.allLinks[currentLink] = false
			}

			if(currentLink && this.allLinks[currentLink] === false) {
				let baseURL = this.getBaseURL(currentLink)
			
				if(baseURL !== null && this.linkFromDomain(baseURL, currentLink)) {
					this.totalRequests++
					this.concurrentReq++

					scraper.requestPage(baseURL, currentLink)
					.then(function (links) {
			        	// console.log(links)
			        	self.allLinks[currentLink] = true
			        	self.concurrentReq--
			        	self.queue.enqueueArray(links)

			        	// Invoke traverse function if crawler is paused
			        	if(self.crawlerPaused && !self.crawlerStopped) self.traverse()
				    })
				    .catch(function (err) {
				    	self.concurrentReq--
				    	self.queue.enqueue(currentLink)

				    	// Invoke traverse function if crawler is paused
			        	if(self.crawlerPaused && !self.crawlerStopped) self.traverse()
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
	if((this.concurrentReq === 0 && this.queue.isEmpty()) || (!config.INFINTE_CRAWL && this.totalRequests >= config.MAX_REQUESTS)) {
		this.crawlerStopped = true
		this.allLinks = this.mergeArrayWithObject(this.allLinks, this.queue.getQueue())
		let allLinksArray = Object.keys(this.allLinks)
		console.log("total links found", allLinksArray.length)
		toCSV.writeToCSV(allLinksArray)
	}


}


/**
 * @return {[type]}
 */
Crawler.prototype.startCrawling = function () {
	this.traverse()
}


module.exports = Crawler
