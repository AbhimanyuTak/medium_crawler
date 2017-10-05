const fs = require('fs')

let fileName = 'results.csv'

function writeToCSV(data) {
	let stream = fs.createWriteStream(fileName);
    stream.once('open', function() {
      data.forEach(function(row) {
      	stream.write(row + ',\n')
      });
      stream.end();
    });
}


function appendToCSV(data) {
	fs.appendFile(fileName, data + ',\n', function (err) {
	  if (err) throw err;
	});
}

module.exports = {writeToCSV, appendToCSV}