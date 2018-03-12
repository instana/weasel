# Contributing

## Local development environment

```
git clone https://github.com/instana/weasel.git
cd weasel
yarn
./node_modules/.bin/webdriver-manager update
./node_modules/.bin/webdriver-manager start
yarn test
```

## Configure Travis CI

```
$ travis encrypt --add env.global SAUCE_USERNAME=…
$ travis encrypt --add env.global SAUCE_ACCESS_KEY=…
```

## Executing a Single E2E Test
To execute a single E2E test, change the `describe` or `it` function to `fdescribe` or `fit` respectively.
