#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Surge: 切换系统代理和增强模式
# @raycast.mode silent

# Optional parameters:
# @raycast.icon https://raw.githubusercontent.com/sub-store-org/Sub-Store-Front-End/refs/heads/master/src/assets/icons/surgeformac_text_color.png

# Documentation:
# @raycast.author xream
# @raycast.authorURL https://raycast.com/xream

KEY="" # 改成你的 Surge 的 HTTP API 的 Key
API="http://127.0.0.1:6171" # 改成你的 Surge 的 HTTP API

response=$(curl --silent --location "$API/v1/features/system_proxy" --header "x-key: $KEY")

if echo "$response" | grep 'true'; then
  new_enabled="false"
else
  new_enabled="true"
fi

curl --silent --location "$API/v1/features/system_proxy" \
     --header "x-key: $KEY" \
     --header 'Content-Type: application/json' \
     --data "{\"enabled\":$new_enabled}" > /dev/null 2>&1

# response=$(curl --silent --location '127.0.0.1:6171/v1/features/enhanced_mode' --header "x-key: $KEY")

# if echo "$response" | grep 'true'; then
#   new_enabled="false"
# else
#   new_enabled="true"
# fi

curl --silent --location "$API/v1/features/enhanced_mode" \
     --header "x-key: $KEY" \
     --header 'Content-Type: application/json' \
     --data "{\"enabled\":$new_enabled}" > /dev/null 2>&1

if [ "$new_enabled" = "true" ]; then
  echo "系统代理和增强模式已开启 ✅"
else
  echo "系统代理和增强模式已关闭 🚫" 
fi


