const request = require('request');
const rp = require('request-promise');
const cheerio = require('cheerio');

function linkFromDomain(baseUrl, link) {
	return baseUrl && link.startsWith(baseUrl)
}

function trimQueryParams(link) {
	return link.split('?')[0]
}

function extractLinksFromPage(baseUrl, body) {
	const $ = cheerio.load(body);
	const links = []
	
	$('a').each(function(i, elem) {
		const link = $(this).attr('href');
		if(links.indexOf(link) === -1) {
			links.push(link)
		}
	});

	return links
}


function requestPage(baseUrl, pageLink) {

	if(!pageLink.startsWith(baseUrl)) return

	var options = {
	    uri: pageLink,
	    transform: function (body) {
			return extractLinksFromPage(baseUrl, body)
	    }
	};

	return rp(options)
}

module.exports = {requestPage}