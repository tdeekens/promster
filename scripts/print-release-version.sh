#!/usr/bin/env bash

set -e

# Running "changeset version" to know the new release version
pnpm changeset version &>/dev/null

release_version=$(node -e "console.log(require('./packages/metrics/package.json').version)")

git reset --hard &>/dev/null

echo "$release_version"
