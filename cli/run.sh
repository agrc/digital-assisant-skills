#!/usr/bin/env bash
exec node --experimental-modules --no-warnings "$(dirname "$0")/$(dirname $(readlink "$0"))/main.mjs" "$@"
