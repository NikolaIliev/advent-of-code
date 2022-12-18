#!/bin/sh
YEAR=$1
DAY=$2

FOLDER="$YEAR/$([[ ${#DAY} = 1 ]] && echo "0$DAY" || echo $DAY)"

mkdir -p "$FOLDER"
cp ./template/* "$FOLDER"
sed -i '' "s/%year%/$YEAR/" "$FOLDER/index.ts"
sed -i '' "s/%day%/$DAY/" "$FOLDER/index.ts"