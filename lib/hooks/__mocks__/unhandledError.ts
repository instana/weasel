// @flow

const reportedErrors: Array<ErrorLike> = [];

export function hookIntoGlobalErrorEvent() {
  // noop
}

export function reportError(error: ErrorLike) {
  reportedErrors.push(error);
}

export function getReportedErrors(): Array<ErrorLike> {
  return reportedErrors;
}

export function clearReportedErrors() {
  reportedErrors.length = 0;
}
