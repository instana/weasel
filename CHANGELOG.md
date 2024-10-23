# Changelog


## 1.7.3

- Upgrade dev packages to address security issues
- Refactored code for autoPageDetection
- Fix autoPageDetection to set page name for initial page load
- Remove backendTraceId for cached responses

## 1.7.2

- Fix autoPageDetection command error caused by closure-compiler.

## 1.7.1

- Auto detect page transitions on route change.

## 1.7.0

- Migrate the project to typescript.

## 1.6.6

- Read version from package.json to update agentVersion variable.

## 1.6.5

- Added fragment as user configurable. Support for case when user wants to redact sensitive information in url fragment.

## 1.6.4

- Added maxToleranceForResourceTimingsMillis(default 3000ms) as user configurable. Support for case where Backend Trace Id is not available in xhr beacons.

## 1.6.3

- Support user defined metric in custom event.

## 1.6.2

- Upgrade web-vitals to 3.5.2, support new metric Interaction to Next Paint.
