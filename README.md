# Weasel &nbsp; [![Build Status](https://travis-ci.org/bripkens/weasel.svg?branch=master)](https://travis-ci.org/bripkens/weasel)

Gather end-user browser performance data.

---

[![Sauce Test Status](https://saucelabs.com/browser-matrix/bripkensweasel.svg)](https://saucelabs.com/u/bripkensweasel)

Weasel gathers browser performance data, e.g. navigation and resource timings, and sends it via beacons to an API endpoint. Weasel itself is the in-browser part. This means that it runs in the browsers of of websites and web applications users. This is typically called end-user monitoring (EUM).

Weasel takes a different approach than other popular EUM solutions, e.g. [Boomerang](https://github.com/soasta/boomerang). It restricts itself to the most important, efficiently collectible data points that are necessary to understand…

 1. Whether users have problems, e.g. errors.
 2. Whether the website or application is sufficiently fast.
 3. The correlation between end-user UI interactions and backend calls.
 4. To identify slow resources and resources with a low cache hit rate.

By design, this means that Weasel won't include all the metrics that tools such as Boomerang provide. This is because there are very many tools nowadays in use and available to engineers that can provide highly granular inspection from that point on, e.g. browser developer tools and [WebPageTest](https://www.webpagetest.org/). Weasel provides everything engineers needs in order to identify and start a first problem analysis without incurring an impact on monitored websites.

## Features
Features are categorized into beacon types that weasel is able to emit. Currently, it only supports one beacon type:

 - **Page load beacon:** The page load beacon will be transmitted once the page load (`window.onload`) event has fired. It includes various information, e.g. the API token, navigation and resource timings, first paint time and configurable meta data.
 - **In the future: Error beacon:** Transmitted when unhandled errors occur.
 - **In the future: SPA support:** Transmitted when navigating within single-page applications (SPAs).

## Weasel's approach to tracing
Weasel is designed from the ground up to support tracing. Every beacon is assigned a random ID that can easily be used to stitch on load and SPA beacons, as well as backend traces together. The ID concept is aligned to Zipkin's ID generation strategy, i.e. each ID is 64 lower-hex encoded bits (`/^[0-9a-f]{16}$/i`).
