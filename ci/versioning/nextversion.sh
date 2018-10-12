#!/bin/bash
#
# Determines the next version based on the given one
# Merely updates the last part of the version number
#

# Parse the version number
IFS='.' read -r -a VERSION <<< "$1"

printf "%d.%d.%d\n" ${VERSION[0]} ${VERSION[1]} $((VERSION[2] + 1))

