#!/bin/sh
YEAR=$1
DAY=$2
LANG=$3

SHORT_DAY=$([[ ${#DAY} = 1 ]] && echo "$DAY" || echo "$DAY" | cut -c2)
LONG_DAY=$([[ ${#DAY} = 1 ]] && echo "0$DAY" || echo "$DAY")

FOLDER="$YEAR/$LONG_DAY"

mkdir -p "$FOLDER"
cp ./template/$LANG/* "$FOLDER"

if [[ $LANG = 'ts' ]]; then
    sed -i '' "s/%year%/$YEAR/" "$FOLDER/index.ts"
    sed -i '' "s/%day%/$SHORT_DAY/" "$FOLDER/index.ts"
elif [[ $LANG = 'python' ]]; then
    sed -i '' "s/%year%/$YEAR/" "$FOLDER/solution.py"
    sed -i '' "s/%day%/$SHORT_DAY/" "$FOLDER/solution.py"
fi