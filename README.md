# Medium Crawler
A crawler to scrape hyperlinks from Medium.com

For running crawler, user command "npm start"

Checkout to v2-async branch for the Async version of the crawler

For config related to throttling and maximum number of requests, see crawler.json under app/config.

## More on config

- INFINTE_CRAWL : true/false (No upper limit on total requests made)

- MAX_REQUESTS : Restrict the number of requests made to the medium.com's server

- MAX_CONCURRENT_REQUESTS : Defines the number of maximum concurrent requests at any time

