# Contributing

## Local development environment

```sh
git clone https://github.com/instana/weasel.git
cd weasel
yarn
# Does this fail for you?
yarn webdriver-manager update
yarn webdriver:start
yarn build
yarn test
```

## Executing a Single E2E Test
To execute a single E2E test, change the `describe` or `it` function to `fdescribe` or `fit` respectively.

## Executing local tests against specific browsers on Saucelabs
You will need [sauce connect](https://wiki.saucelabs.com/display/DOCS/Basic+Sauce+Connect+Proxy+Setup).

```shell
export SAUCE_USERNAME="…"
export SAUCE_ACCESS_KEY="…"
export SAUCE_IDENTIFIER="manual_tests"

# Start the sauce connect proxy in one terminal window:
bin/sc -u "$SAUCE_USERNAME" -k "$SAUCE_ACCESS_KEY" -P 4445 -i "$SAUCE_IDENTIFIER"

# In another window, start the tests
IS_TEST=true TRAVIS=true TRAVIS_JOB_NUMBER="$SAUCE_IDENTIFIER" yarn run test:e2e
```

## Configure Travis CI

```
$ travis encrypt --add env.global SAUCE_USERNAME=…
$ travis encrypt --add env.global SAUCE_ACCESS_KEY=…
```
