#!/usr/bin/env bash
echo "current working directory is $(pwd)"
echo "package root is $(dirname "$0")/$(dirname $(readlink "$0"))"
exec node --experimental-modules --no-warnings "$(dirname "$0")/$(dirname $(readlink "$0"))/main.mjs" "$@"
