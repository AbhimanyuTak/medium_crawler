const async = require("async");
const scraper = require('./scraper')
const toCSV = require('./output_file')
const config = require('./config/crawler.json')

const MAX_REQUESTS = config.MAX_REQUESTS
let startUrl = "https://medium.com"
let allLinks = {}
let totalRequests = 0

allLinks[startUrl] = false

// create a queue object with concurrency 2
let q = async.queue(function(link, callback) {
	console.log("total requests", totalRequests)
	let baseURL = getBaseURL(link)

	if(baseURL === null) return callback()

    if(!allLinks.hasOwnProperty(link)) {
    	allLinks[link] = false
    }

    if(allLinks[link] === false && totalRequests < MAX_REQUESTS) {
    	totalRequests++
  
	    scraper.requestPage(baseURL, link)
			.then(function (links) {
				allLinks[link] = true
	        	addBatchToQueue(links)
	        	callback()
		    })
		    .catch(function (err) {
		    	totalRequests--
		    	addToQueue(link)
		    });

    }
    else if(totalRequests >= MAX_REQUESTS) {
    	allLinks[link] = true
    	callback()

    }
    else {
    	callback()
    }

}, config.MAX_CONCURRENT_REQUESTS);

// assign a callback
q.drain = function() {
	// console.log(allLinks)
	console.log(Object.keys(allLinks).length)
	toCSV.writeToCSV(Object.keys(allLinks))
    console.log('all items have been processed');
};

let addToQueue = function(link) {
	q.push(link, function(err) {})
}

let addBatchToQueue = function(links) {
	q.push(links, function(err) {})
}

/**
 * @param  {[type]}
 * @return {[type]}
 */
let getBaseURL = function (url) {
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
let finalLinks = function (link) {
	if(allLinks.indexOf(link) === -1) {
		allLinks.push(link)
	}
}

/**
 * Seeding the queue to initialize crawler
 * @param  {String} startUrl
 */
let initAsyncQueue = function (startUrl) {
	addToQueue(startUrl)
}

/**
 * For merging arrays and suspending duplicates
 * @param  {Array}
 * @param  {Array}
 * @return {Array}
 */
let mergeArrayUniqueValues = function (arr1, arr2) {
	let arr3 = []

	arr3 = arr3.concat(arr1)

	for(let i in arr2) {
		if(arr3.indexOf(arr2[i])) {
			arr3.push(arr2[i])
		}
	}
	return arr3
}


let startCrawling = function () {
	initAsyncQueue(startUrl)
}


module.exports = {startCrawling}