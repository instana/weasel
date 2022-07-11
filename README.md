# Weasel &nbsp; [![Build Status](https://app.saucelabs.com/buildstatus/instanaweasel)](https://app.saucelabs.com/u/instanaweasel)

Gather end-user browser performance data.

---

[![Sauce Test Status](https://app.saucelabs.com/browser-matrix/instanaweasel.svg)](https://app.saucelabs.com/u/instanaweasel)

Weasel gathers browser performance data, e.g. navigation and resource timings, and sends it via beacons to an API endpoint. Weasel itself is the in-browser part. This means that it runs in the browsers of of websites and web applications users. This is typically called end-user monitoring (EUM).

Weasel takes a different approach than other popular EUM solutions, e.g. [Boomerang](https://github.com/soasta/boomerang). It restricts itself to the most important, efficiently collectible data points that are necessary to understand…

 1. Whether users have problems, e.g. errors.
 2. Whether the website or application is sufficiently fast.
 3. The correlation between end-user UI interactions and backend calls.
 4. To identify slow resources and resources with a low cache hit rate.

By design, this means that Weasel won't include all the metrics that tools such as Boomerang provide. This is because there are very many tools nowadays in use and available to engineers that can provide highly granular inspection from that point on, e.g. browser developer tools and [WebPageTest](https://www.webpagetest.org/). Weasel provides everything engineers needs in order to identify and start a first problem analysis without incurring an impact on monitored websites.

## Features
Features are categorized into beacon types that weasel is able to emit. Currently, it supports multiple beacon type:

 - **Page load beacon:** The page load beacon will be transmitted once the page load (`window.onload`) event has fired. It includes various information, e.g. the API token, navigation and resource timings, first paint time and configurable meta data.
 - **XHR beacon:** Transmitted for occurring `XMLHttpRequest`s and `fetch`s
 - **Error beacon:** Transmitted when unhandled errors occur
 - **SPA beacon:** Transmitted when navigating within single-page applications (SPAs).

## Usage
Usage of Weasel is different than that of many other libraries. Technically, this is because of its lack of a plugin system and compilation modes. This was done with a drastic **users first** design in mind (this means **developers later**). Weasel is shipped to a huge number of users on a variety of websites. As a result, its size and impact on the monitored websites must be minimal. To achieve this, Weasel does not include a plugin system or any optional code paths. Weasel is compiled using Rollup enabled tree shaking followed by Google Closure Compiler advanced mode compilation.

This being said, how would you go about using Weasel? We recommend the following way to adapt and use Weasel:

 1. Fork Weasel. Yes, really. The lack of a plugin system and the desire to remove optional code paths means that some things just aren't configurable. But don't worry about pulling improvements from upstream: The kind of changes that you have to make in your fork are pretty small.
 2. Update the following files within your fork as you see fit:
  - The global variables which define such values as the default reporting URL. To be found in [lib/vars.js](https://github.com/instana/weasel/blob/master/lib/vars.js).
  - Remove or adapt backend correlation headers as necessary within the [XMLHttpRequest](https://github.com/instana/weasel/blob/master/lib/hooks/XMLHttpRequest.js#L184-L186) hook.
 3. Install the necessary dependencies and build weasel:

    ```
    yarn

    yarn build
    ```

 4. The files within `target/` are the result of the build process. Serve these in whatever way you see fit. You want these to be accessible by (end-) users.
 5. Load Weasel on a website by embedding the following script tag. Take note of and replace the placeholders within this snippet!

    ```javascript
    <script>
      (function(i,s,o,g,r,a,m){i['{{vars.nameOfLongGlobal}}']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','{{urlToRetrieveWeaselFrom}}','{{nameOfShortGlobal}}');
      ineum('reportingUrl', '{{urlToSendBeaconsTo}}');
      ineum('apiKey', '{{optionalApiToken}}');
    </script>
    ```

 6. Accept the data on the server side. Weasel will send data either as HTTP `GET` requests with data being stored in query parameters, or as HTTP `POST` requests with data being available as the request body encoded as `application/x-www-form-urlencoded` (whether `GET` or `POST` is used depends on the amount of data). The data format is described in [lib/types.js](https://github.com/instana/weasel/blob/master/lib/types.js).
 7. Let us know about how you are using Weasel! This will help us get a better understanding for the community and the impact that our changes will have.
 8. Keep your fork up-to-date by periodically pulling from upstream.
 9. Have a great day ☀️!
