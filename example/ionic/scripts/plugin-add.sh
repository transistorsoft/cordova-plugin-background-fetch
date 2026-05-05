#!/bin/bash

PLUGIN_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"

cordova plugin add "$PLUGIN_DIR" --link --nofetch
