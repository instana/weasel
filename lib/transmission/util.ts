import type { ReportingBackend } from '../types';
import vars from '../vars';

export function isTransmitionRequest(url: string) {
  const lowerCaseUrl = url.toLowerCase();

  if (vars.reportingBackends && vars.reportingBackends.length > 0) {
    for (let i = 0, len = vars.reportingBackends.length; i < len; i++) {
      const reportingBackend: ReportingBackend = vars.reportingBackends[i];
      if (reportingBackend['reportingUrl'] && reportingBackend['reportingUrl'].length > 0) {
        const lowerCaseReportingUrl = reportingBackend['reportingUrl'].toLowerCase();
        if (lowerCaseUrl === lowerCaseReportingUrl || lowerCaseUrl === lowerCaseReportingUrl + '/') {
          return true;
        }
      }
    }
  } else if (vars.reportingUrl) {
    const lowerCaseReportingUrl = vars.reportingUrl.toLowerCase();
    return lowerCaseUrl === lowerCaseReportingUrl || lowerCaseUrl === lowerCaseReportingUrl + '/';
  }
  return false;
}
