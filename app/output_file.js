const fs = require('fs')

function writeToCSV(data) {
	let stream = fs.createWriteStream('results.csv');
    stream.once('open', function() {
      data.forEach(function(row) {
      	stream.write(row + ', \n')
      });
      stream.end();
    });
}

module.exports = {writeToCSV}