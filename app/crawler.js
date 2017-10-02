// import requestPage from './crawler'
const scraper = require('./scraper')
const queue = require('./queue').queue()
const toCSV = require('./output_file')

let startUrl = "https://medium.com"
let requestQueue = []
let allLinks = [startUrl]
const maxRequests = 100;
const maxConcurrentRequests = 5
let totalRequests = 0
let concurrentReq = 0
let crawlerPaused = false
let crawlerStopped = false

queue.enqueue(startUrl)

function getBaseURL(url) {
	if (url.indexOf("://") > -1) {
        return url.split('/')[0] + "//" + url.split('/')[2];
    }
    else {
        return null
    }
}

function finalLinks(link) {
	if(allLinks.indexOf(link) === -1) {
		allLinks.push(link)
	}
}

function mergeArrayUniqueValues(arr1, arr2) {
	let arr3 = []

	arr3 = arr3.concat(arr1)

	for(let i in arr2) {
		if(arr3.indexOf(arr2[i])) {
			arr3.push(arr2[i])
		}
	}
	return arr3
}

function startTraversing() {
	// for(let i = index; i < linksToTraverse.length; i++) {
	while(!queue.isEmpty() && totalRequests < maxRequests) {
		crawlerPaused = false
	// if(!queue.isEmpty() && totalRequests < maxRequests) {
		console.log("making", concurrentReq, "concurrent requests", totalRequests, "requests made")
		if(concurrentReq < maxConcurrentRequests) {
			let currentLink = queue.dequeue()
			finalLinks(currentLink)

			if(currentLink) {
				let baseURL = getBaseURL(currentLink)
				console.log("scraping...", currentLink)
				if(baseURL !== null) {
					console.log("woh")
					totalRequests++;
					concurrentReq++;
					scraper.requestPage(baseURL, currentLink)
						.then(function (links) {
				        	// console.log(links)
				        	concurrentReq--
				        	queue.enqueueArray(links)
				        	// console.log(queue.getQueue())

				        	if(crawlerPaused) startTraversing()
					    })
					    .catch(function (err) {
					    	concurrentReq--
					    	queue.enqueue(currentLink)
					    });
				}
			}
		}
		else {
			crawlerPaused = true
			break;
		}
	}


	if(queue.isEmpty() && concurrentReq > 0) {
		crawlerPaused = true
	}

	if((concurrentReq === 0 && queue.isEmpty()) || totalRequests >= maxRequests) {
		crawlerStopped = true
		allLinks = mergeArrayUniqueValues(allLinks, queue.getQueue())
		console.log("total links found", allLinks.length)
		toCSV.writeToCSV(allLinks)
	}


}

startTraversing()
