
let queue = function() {
	let requestQueue = []

	let getQueue = function() {
		return requestQueue
	}

	let isEmpty = function() {
		return requestQueue.length === 0
	}

	let enqueue = function(string) {
		if(requestQueue.indexOf(string) === -1) requestQueue.push(string)
	}

	let enqueueArray = function(array) {
		for(let i =0; i < array.length; i++) {
			enqueue(array[i])
		}
	}

	let dequeue = function(string) {
		if(isEmpty()) return null
		return  requestQueue.shift()
	}

	return {
		getQueue,
		isEmpty,
		enqueue,
		enqueueArray,
		dequeue
	}
}

module.exports = {queue}