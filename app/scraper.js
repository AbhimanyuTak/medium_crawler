const request = require('request');
const rp = require('request-promise');
const cheerio = require('cheerio');


/**
 * Trims all the query params from the url
 * 
 * @param  {String} link
 * @return {String}
 */
function trimQueryParams(link) {
	return link.split('?')[0]
}

/**
 * @function
 * Parses DOM to get all hyperlinks from page
 * 
 * @param  {String} body html body to be parsed
 * @return {Array}
 */
function extractLinksFromPage(body) {
	const $ = cheerio.load(body);
	const links = []
	
	$('a').each(function(i, elem) {
		const link = $(this).attr('href');
		// Check for duplication and add to array
		if(links.indexOf(link) === -1) {
			links.push(link)
		}
	});

	return links
}

/**
 * @function
 * Make request to get the link's content
 * @param  {String} baseUrl
 * @param  {String} pageLink
 * @return {Promise}
 */
function requestPage(baseUrl, pageLink) {

	// if(!pageLink.startsWith(baseUrl)) return null

	console.log("scraping...", pageLink)

	var options = {
	    uri: pageLink,
	    transform: function (body) {
			return extractLinksFromPage(body)
	    }
	};

	return rp(options)
}

module.exports = {requestPage}