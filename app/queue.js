
let Queue = function () {
	this.requestQueue = []
}

Queue.prototype.getQueue = function () {
	return this.requestQueue
}

Queue.prototype.isEmpty = function () {
	return this.requestQueue.length === 0
}

Queue.prototype.enqueue = function (string) {
	if(this.requestQueue.indexOf(string) === -1) this.requestQueue.push(string)
}

/**
 * Add links to queue from the given array
 * @param  {Array}
 */
Queue.prototype.enqueueArray = function (array) {
	for(let i =0; i < array.length; i++) {
		this.enqueue(array[i])
	}
}

Queue.prototype.dequeue = function (string) {
	if(this.isEmpty()) return null
	return  this.requestQueue.shift()
}


module.exports = Queue