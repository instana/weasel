#!/usr/bin/env bash

set -eo pipefail

yarn install --immutable

# create unit-test coverage report - fail on any errors
nvm install
nvm use
nvm version

corepack enable

yarn
yarn test:quick
