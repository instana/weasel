Web-vitals metrics
----------------------

Official Docs -

LCP - https://web.dev/articles/lcp

FID - https://web.dev/articles/fid

CLS - https://web.dev/articles/cls

INP - https://web.dev/articles/inp

TTFB - https://web.dev/articles/ttfb

FCP - https://web.dev/articles/fcp


##  Minimum versions in platform browser combination for LCP support

|                   | Chrome                  | Edge                            | FireFox                   | Safari                  |
| ----------------- | ----------------------- | ------------------------------- | ------------------------- | ----------------------- |
| Web-vital support | 77                      | 79                              | 122                       |  NO_SUPPORT             |
| SauceLab Config   | OS X 10.10 - chrome 78  | OS X 10.10 - microsoftEdge 80   | NO_SUPPORT - SauceLabs    |  NO_SUPPORT - webVital  |
|                   | macOS 10.12 - chrome 78 | macOS 10.12 - microsoftEdge 80  | macOS 10.15 - fireFox 124 |  NO_SUPPORT - webVital  |
|                   | windows 7 - chrome 78   | windows 10 - microsoftEdge 80   | windows 10 - fireFox 122  |  NO_SUPPORT - webVital  |


##  Minimum versions in platform browser combination for FID support
#### Deprecated and will be removed in next major release

|                   | Chrome                  | Edge                           | FireFox                  | Safari                  |
| ----------------- | ----------------------- | ------------------------------ | ------------------------ | ----------------------- |
| Web-vital support | 76                      | 79                             | 89                       |  NO_SUPPORT             |
| SauceLab Config   | OS X 10.10 - chrome 77  | OS X 10.10 - microsoftEdge 80  | NO_SUPPORT - SauceLabs   |  NO_SUPPORT - webVital  |
|                   | macOS 10.12 - chrome 77 | macOS 10.12 - microsoftEdge 80 | macOS 10.12 - fireFox 90 |  NO_SUPPORT - webVital  |
|                   | windows 7 - chrome 77   | windows 10 - microsoftEdge 80  | windows 7 - fireFox 90   |  NO_SUPPORT - webVital  |


##  Minimum versions in platform browser combination for CLS support

|                   | Chrome                  | Edge                            | FireFox                 | Safari                  |
| ----------------- | ----------------------- | ------------------------------- | ----------------------- | ----------------------- |
| Web-vital support | 77                      | 79                              |  NO_SUPPORT             |  NO_SUPPORT             |
| SauceLab Config   | OS X 10.10 - chrome 78  | OS X 10.10 - microsoftEdge 80   |  NO_SUPPORT - webVital  |  NO_SUPPORT - webVital  |
|                   | macOS 10.12 - chrome 78 | macOS 10.12 - microsoftEdge 80  |  NO_SUPPORT - webVital  |  NO_SUPPORT - webVital  |
|                   | windows 7 - chrome 78   | windows 10 - microsoftEdge 80   |  NO_SUPPORT - webVital  |  NO_SUPPORT - webVital  |


##  Minimum versions in platform browser combination for INP support

|                   | Chrome                  | Edge                            | FireFox                 | Safari                  |
| ----------------- | ----------------------- | ------------------------------- | ----------------------- | ----------------------- |
| Web-vital support | 96                      | 96                              |  NO_SUPPORT             |  NO_SUPPORT             |
| SauceLab Config   | OS X 10.11 - chrome 97  | NO_SUPPORT - SauceLabs          |  NO_SUPPORT - webVital  |  NO_SUPPORT - webVital  |
|                   | macOS 10.12 - chrome 97 | macOS 10.12 - microsoftEdge 97  |  NO_SUPPORT - webVital  |  NO_SUPPORT - webVital  |
|                   | windows 7 - chrome 97   | windows 10 - microsoftEdge 97   |  NO_SUPPORT - webVital  |  NO_SUPPORT - webVital  |


##  Minimum versions in platform browser combination for TTFB support

|                   | Chrome                  | Edge                            | FireFox                  | Safari                   |
| ----------------- | ----------------------- | ------------------------------- | ------------------------ | ------------------------ |
| Web-vital support | 43                      | 12                              | 35                       | 11                       |
| SauceLab Config   | OS X 10.10 - chrome 44  | OS X 10.10 - MicrosoftEdge 79   | OS X 10.10 - firefox 35  | NO_SUPPORT - SauceLabs   |
|                   | macOS 10.12 - chrome 44 | macOS 10.12 - MicrosoftEdge 13  | macOS 10.12 - firefox 35 | macOS 10.12 - safari 11  |
|                   | windows 7 - chrome 67   | windows 10 - MicrosoftEdge 13   | windows 7 - firefox 35   | NO_SUPPORT - SauceLabs   |


##  Minimum versions in platform browser combination for FCP support
FCP metrix is inconsistent

|                   | Chrome                  | Edge                           | FireFox                   | Safari                    |
| ----------------- | ----------------------- | ------------------------------ | ------------------------- | ------------------------- |
| Web-vital support | 60                      | 79                             | 84                        | 14.1                      |
| SauceLab Config   | OS X 10.10- chrome 84   | OS X 10.10- MicrosoftEdge 79   | NO_SUPPORT - SauceLabs    | NO_SUPPORT - SauceLabs    |
|                   | macOS 10.12 - chrome 60 | macOS 10.12 - MicrosoftEdge 79 | macOS 10.12 - firefox 84  | macOS 12 - safari  15     |
|                   | windows 7 - chrome 74   | windows 10 - MicrosoftEdge 92  | windows 7 - firefox 85    | NO_SUPPORT - SauceLabs    |

# Web Vitals Testing Results Across Multiple Browsers and Platforms Using Sauce Labs
|         | **Chrome**                                    | **Edge**                                                  | **FireFox**                           | **Safari**              |
| ------- | ---------------------------------------------- | --------------------------------------------------------- | -------------------------------------- | ----------------------- |
| **LCP** | **77**   OSX10.10, MACOS10.12, WIN 7                 | **79**   OSX10.10, MACOS10.12, WIN 10                          | **122**                                    | --                      |
| **FID** | **76**   OSX10.10, MACOS10.12, WIN 7                 | **79**   OSX10.10, MACOS10.12, WIN 10                          | **89**   MACOS10.12, WIN 7                 | --                      |
| **CLS** | **77**   OSX10.10, MACOS10.12, WIN 7                 | **79**   OSX10.10, MACOS10.12, WIN 10                          | --                                     | --                      |
| **INP** | **96**   OSX10.11, MACOS10.12, WIN 7                 | **96**   MACOS10.12, WIN 10                                    | --                                     | --                      |
| **TTFB**| **43**   OSX10.10, MACOS10.12, WIN 7                 | **12**   OSX10.10 - Edge 79, MACOS10.12 - Edge 13, WIN 10 - Edge 13 | **35**   OSX10.10, MACOS10.12, WIN 7      | **11**   MACOS10.12         |
| **FCP** | **60**   OSX10.10, MACOS10.12, WIN 7                 | **79**   OSX10.10, MACOS10.12, WIN 10                          | **84**   MACOS10.12, WIN 7                 | **14.1**   MACOS12          |





Reference -
------------------
Saucelabs platform-configurator - https://saucelabs.com/products/platform-configurator

PerformanceEventTiming - https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEventTiming/interactionId

INP for non-supporting browsers - https://github.com/GoogleChrome/web-vitals/issues/367
FID for non-supporting browsers - https://github.com/GoogleChrome/web-vitals/pull/368
