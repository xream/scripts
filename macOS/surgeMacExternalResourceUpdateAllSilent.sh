#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Surge: 更新全部外部资源(异步通知)
# @raycast.mode silent

# Optional parameters:
# @raycast.icon https://raw.githubusercontent.com/sub-store-org/Sub-Store-Front-End/refs/heads/master/src/assets/icons/surgeformac_text_color.png

# Documentation:
# @raycast.author xream
# @raycast.authorURL https://raycast.com/xream

/Applications/Surge.app/Contents/Applications/surge-cli external-resource update all


echo "更新外部资源完成 ✅"


