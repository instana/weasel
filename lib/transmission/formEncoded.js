// @flow

import {XMLHttpRequest, encodeURIComponent, executeImageRequest} from '../browser';
import { disableMonitoringForXMLHttpRequest } from '../hooks/xhrHelpers';
import {hasOwnProperty} from '../util';
import type {Beacon, ReportingBackend} from '../types';
import vars from '../vars';

const maxLengthForImgRequest = 2000;

export function sendBeacon(data: Beacon) {
  if (vars.reportingUrl && vars.reportingUrl.length > 0) {
    const str = stringify(data);
    if (str.length != 0) {
      transmit(str, String(vars.reportingUrl));
    }
    return;
  }

  if (!vars.reportingBackends || vars.reportingBackends.length === 0) {
    return;
  }

  for (let i = 0, len = vars.reportingBackends.length; i < len; i++) {
    let reportingBackend: ReportingBackend = vars.reportingBackends[i];
    if (hasOwnProperty(reportingBackend, 'reportingUrl')) {
      if (i > 0) {
        data['k'] = reportingBackend['key'];
      }
      const str = stringify(data);
      if (str.length != 0) {
        transmit(str, reportingBackend['reportingUrl']);
      }
    }
  }
}

function transmit(str: string, reportingUrl: string) {
  if (XMLHttpRequest && str.length > maxLengthForImgRequest) {
    const xhr = new XMLHttpRequest();
    disableMonitoringForXMLHttpRequest(xhr);
    xhr.open('POST', String(reportingUrl), true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
    // Ensure that browsers do not try to automatically parse the response.
    xhr.responseType = 'text';
    xhr.timeout = vars.xhrTransmissionTimeout;
    xhr.send(str);
  } else {
    // Older browsers do not support the XMLHttpRequest API. This sucks and may
    // result in a variety of issues, e.g. URL length restrictions. "Luckily", older
    // browsers also lack support for advanced features such as resource timing.
    // This should make this transmission via a GET request possible.
    executeImageRequest(String(reportingUrl) + '?' + str);
  }
}

function stringify(data: Beacon) {
  let str = '';

  for (let key in data) {
    if (hasOwnProperty(data, key)) {
      const value = data[key];
      if (value != null) {
        str += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(String(data[key]));
      }
    }
  }

  return str.substring(1);
}
