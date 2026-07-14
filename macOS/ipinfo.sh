#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title IP Info
# @raycast.mode fullOutput

# Optional parameters:
# @raycast.icon 📍
# @raycast.argument1 { "type": "text", "placeholder": "IP/Domain" }

# Documentation:
# @raycast.author xream
# @raycast.authorURL https://raycast.com/xream

# 1. ⚠️ 需要安装 jq
# 2. 可选: 在 https://ipinfo.io 注册账号并获取 token, 将 token 填写到 IPINFO_TOKEN
# 3. 可选: 安装 https://github.com/nxtrace/nali, 将 nali 路径填写到 NALI_PATH

IPINFO_TOKEN=""
NALI_PATH=""

# 获取输入, 去掉前后空格/制表符/换行符
input=$(echo "$1" | xargs)

IPAPI_RESULT=$(curl -s "http://ip-api.com/json/$input?lang=zh-CN")

# 换行打印出 query, country, countryCode, region, regionName, city, isp, org, as
echo "[IP-API]"
echo "$IPAPI_RESULT" | jq -r '"query: \(.query)\ncountry: \(.country)\ncountryCode: \(.countryCode)\nregion: \(.region)\nregionName: \(.regionName)\ncity: \(.city)\nisp: \(.isp)\norg: \(.org)\nas: \(.as)"'

# 获取 IP
IP=$(echo "$IPAPI_RESULT" | jq -r ".query")

# 如果填写了 IPINFO_TOKEN
if [ "$IPINFO_TOKEN" ]; then
  IPINFO_RESULT=$(curl -s "https://ipinfo.io/$IP/json?token=$IPINFO_TOKEN")
  echo
  echo "[IPINFO]"
  echo "$IPINFO_RESULT" | jq -r '"country: \(.country)\nregion: \(.region)\ncity: \(.city)\norg: \(.org)"'
fi


if [ "$NALI_PATH" ]; then
  echo
  echo "[Nali]"
  $NALI_PATH $IP
fi
