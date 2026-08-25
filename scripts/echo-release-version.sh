#!/usr/bin/env bash

set -euo pipefail

release_plan=$(mktemp)
trap 'rm -f "$release_plan"' EXIT

echo "Running 'changeset status' to know the next release version"

pnpm changeset status --output="$release_plan"

# All @promster/* packages release in lockstep through the "fixed" group in
# .changeset/config.json, so any one of them carries the release version. With no
# pending changesets the release plan holds no releases and the version already on
# disk is the one the release will carry.
release_version=$(node -e '
  const { readFileSync } = require("node:fs");

  const plan = JSON.parse(readFileSync(process.argv[1], "utf8"));
  const release = plan.releases.find(({ name }) => name === "@promster/metrics");

  console.log(release?.newVersion ?? require("./packages/metrics/package.json").version);
' "$release_plan")

echo "Release version is $release_version"

echo "RELEASE_VERSION=$release_version" >>"$GITHUB_OUTPUT"
