/* eslint-disable */

(function() {
  var script = '/target/eum.min.js';

  if (window.location.href.indexOf('debug=true') !== -1) {
    script = '/target/eum.debug.js';
  }

  window.config = getGlobalConfigObject();

  (function(i,s,o,g,r,a,m){i['EumObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script',script,'eum');

  eum('reportingUrl', '/beacon');
  eum('ignoreUrls', [/.*pleaseIgnoreThis.*/]);
  eum('ignoreErrorMessages', [/.*pleaseIgnoreThisError.*/]);

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
