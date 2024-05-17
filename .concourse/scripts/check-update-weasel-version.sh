#!/bin/bash
set -e
set -o pipefail
set -xb

# Check if weasel package.json contains valid version
if ! grep -q '"version": "[0-9.]*"' package.json; then
    echo "Error: 'version' field not found or not valid in package.json"
    exit 1
else
    echo "Version field is present in package.json and valid"
fi

# Extract the weasel version from package.json
VERSION=$(grep -o '"version": *"[^"]*"' package.json | grep -o '"[^"]*"$' | tr -d '"')

# Replace agentVersion variable in weasel
sed -i "s|agentVersion: '[0-9.]*'|agentVersion: '$VERSION'|g" lib/vars.ts
echo "Updated version from package.json in lib/vars.ts:"
grep "agentVersion: '[0-9.]*'" lib/vars.ts
