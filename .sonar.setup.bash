#!/usr/bin/env bash

# yarn install --immutable

# create unit-test coverage report - fail on any errors
#yarn coverage
npm uninstall yarn
corepack enable
yarn init
yarn
yarn test:quick
