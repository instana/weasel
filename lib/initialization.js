// @flow

import vars from './vars';

// We are using a similar appraoch as Google Analytics when it comes to
// initialization. In fact, the initialization object looks something
// like this
//
// (function(i,s,o,g,r,a,m){i['EumObject']=r;i[r]=i[r]||function(){
// (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
// m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
// })(window,document,'script','//eum.example.com/eum.js','eum');
//
// Users may decide to change the default global object. By default, this is
// eum. The global EumObject variable will contain the short form
// which actually contains all the interesting initialization options.

export function initialize() {
  var globalObjectName = window['EumObject'];
  var globalObject = window[globalObjectName];
  if (globalObject) {
    processQueue(globalObject.q);
  }
}

function processQueue(queue) {
  for (var i = 0, len = queue.length; i < len; i++) {
    var item = queue[i];

    switch (item[0]) {
    case 'apiKey':
      vars.apiKey = item[1];
      break;
    case 'reportingUrl':
      vars.reportingUrl = item[1];
      break;
    case 'meta':
      vars.meta[item[1]] = item[2];
      break;
    case 'traceId':
      vars.pageLoadBackendTraceId = item[1];
      break;
    default:
      continue;
    }
  }
}
