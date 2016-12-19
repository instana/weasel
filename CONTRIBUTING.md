# Contributing

## Local development environment

```
git clone https://github.com/instana/weasel.git
cd weasel
npm install
./node_modules/.bin/webdriver-manager update
./node_modules/.bin/webdriver-manager start
npm run verify
```

## Configure Travis CI

```
$ travis encrypt --add env.global SAUCE_USERNAME=…
$ travis encrypt --add env.global SAUCE_ACCESS_KEY=…
```
