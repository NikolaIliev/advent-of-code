YEAR=$1
DAY=$2

FOLDER="./$YEAR/$DAY"

if [[ -f "$FOLDER/index.ts" ]]; then
    ts-node "$FOLDER"
elif [[ -f "$FOLDER/solution.py" ]]; then
    python3 "$FOLDER/solution.py"
fi