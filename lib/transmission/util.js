// @flow

import type { ReportingBackend } from '../types';
import { hasOwnProperty } from '../util';
import vars from '../vars';

export function isTransmitionRequest(url: string) {
  const lowerCaseUrl = url.toLowerCase();
  if (vars.reportingUrl && vars.reportingUrl.length > 0) {
    let lowerCaseReportingUrl = vars.reportingUrl.toLowerCase();
    if (lowerCaseUrl === lowerCaseReportingUrl || lowerCaseUrl === lowerCaseReportingUrl + '/') {
      return true;
    }
  }

  if (!vars.reportingBackends || vars.reportingBackends.length === 0) {
    return false;
  }

  for (let i = 0, len = vars.reportingBackends.length; i < len; i++) {
    let reportingBackend: ReportingBackend = vars.reportingBackends[i];
    if (hasOwnProperty(reportingBackend, 'reportingUrl')) {
      let lowerCaseReportingUrl = reportingBackend['reportingUrl'].toLowerCase();
      if (lowerCaseUrl === lowerCaseReportingUrl || lowerCaseUrl === lowerCaseReportingUrl + '/') {
        return true;
      }
    }
  }
  return false;
}
