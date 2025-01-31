#!/bin/bash
# 保存为 rename_icons.sh

counter=0
for file in *.png; do
    if [ -f "$file" ]; then
        mv "$file" "icon_${counter}.png"
        echo "Renamed $file to icon_${counter}.png"
        ((counter++))
    fi
done
