#!/bin/bash

# Default threshold of 300 lines
THRESHOLD=${1:-300}
OUTPUT_FILE="docs/code_metrics.csv"

echo "Counting files with more than $THRESHOLD lines..."
echo "File,Lines" > $OUTPUT_FILE
find src -type f -name "*.ts" | xargs wc -l | sort -nr | awk -v threshold=$THRESHOLD '$1 > threshold {print $2 "," $1}' | grep -v "total" >> $OUTPUT_FILE

echo "Results saved to $OUTPUT_FILE"
echo "Top offenders:"
head -10 $OUTPUT_FILE