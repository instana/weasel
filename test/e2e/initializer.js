/* eslint-disable */

(function() {
  window.config = getGlobalConfigObject();

  (function(win, longGlobalName, shortGlobalName, globalApi) {
    if (win[longGlobalName]) {
      return;
    }

    win[longGlobalName] = shortGlobalName;
    globalApi = win[shortGlobalName] = function() {
      globalApi['q'].push(arguments);
    };
    globalApi['q'] = [];
    globalApi['l'] = 1 * new Date();
    globalApi['v'] = 2;
  })(window, 'EumObject', 'eum');

  eum('reportingUrl', '/beacon');
  eum('ignoreUrls', [/.*pleaseIgnoreThis.*/]);
  eum('ignoreErrorMessages', [/.*pleaseIgnoreThisError.*/]);

  // Set a rather low batching / waiting times as the tests will otherwise take ages.
  eum('beaconBatchingTime', 100);
  eum('maxWaitForResourceTimingsMillis', 1000);
  eum('maxMaitForPageLoadMetricsMillis', 100);

  // most existing tests does not expect extra custom events
  eum('webvitalsInCustomEvent', false);

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
  };
})();
