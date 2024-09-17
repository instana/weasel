#!/usr/bin/env bash

set -eo pipefail

yarn install --immutable

# create unit-test coverage report - fail on any errors
yarn
yarn test:quick
