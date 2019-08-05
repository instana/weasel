/* eslint-disable */

(function() {
  var script = '/target/eum.min.js';

  if (window.location.href.indexOf('debug=true') !== -1) {
    script = '/target/eum.debug.js';
  }

  window.config = getGlobalConfigObject();

  (function(c,e,f,k,g,h,b,a,d){c[g]||(c[g]=h,b=c[h]=function(){
  b.q.push(arguments)},b.q=[],b.l=1*new Date,a=e.createElement(f),a.async=1,
  a.src=k,a.setAttribute("crossorigin", "anonymous"),d=e.getElementsByTagName(f)[0],
  d.parentNode.insertBefore(a,d))})(window,document,"script",
  script,"EumObject","eum");

  eum('reportingUrl', '/beacon');
  eum('ignoreUrls', [/.*pleaseIgnoreThis.*/]);
  eum('ignoreErrorMessages', [/.*pleaseIgnoreThisError.*/]);

  // Set a rather low batching / waiting times as the tests will otherwise take ages.
  eum('beaconBatchingTime', 100);
  eum('maxWaitForResourceTimingsMillis', 1000);

  if (window.location.href.indexOf('debug=true') !== -1) {
    eum('autoClearResourceTimings', false);
  }

  if (window.onEumLoad) {
    window.onEumLoad(eum);
  }

  function getGlobalConfigObject() {
    var ownPort = parseInt(window.location.port || '80', 10);
    var ports = [ownPort];
    var otherPort = 'noCrossOriginPortDefinedViaPortsQueryString';

    var portsMatch = window.location.href.match(/(\?|\&)ports=([^$&#]+)/i);
    if (portsMatch) {
      var portsRaw = decodeURIComponent(portsMatch[2]).split(',');
      for (var i = 0; i < portsRaw.length; i++) {
        ports[i] = parseInt(portsRaw[i], 10);
        if (ports[i] !== ownPort) {
          otherPort = ports[i];
        }
      }
    }

    return {
      sameOrigin: 'http://' + window.location.hostname + ':' + ownPort,
      crossOrigin: 'http://' + window.location.hostname + ':' + otherPort
    };
  }

  window.addCrossOriginScript = function addCrossOriginScript(absolutePath) {
    var script = document.createElement('script');
    script.src = window.config.crossOrigin + absolutePath;
    document.body.appendChild(script);
  }
})();
