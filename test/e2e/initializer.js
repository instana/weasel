/* eslint-disable */

(function() {
  var script = '/target/eum.min.js';

  if (window.location.href.indexOf('debug=true') !== -1) {
    script = '/target/eum.debug.js';
  }

  (function(i,s,o,g,r,a,m){i['EumObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script',script,'eum');

  eum('reportingUrl', '/beacon');

  if (window.onEumLoad) {
    window.onEumLoad(eum);
  }
})();
