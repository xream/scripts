#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Surge: 更新全部外部资源(完整输出)
# @raycast.mode fullOutput

# Optional parameters:
# @raycast.icon https://raw.githubusercontent.com/sub-store-org/Sub-Store-Front-End/refs/heads/master/src/assets/icons/surgeformac_text_color.png

# Documentation:
# @raycast.author xream
# @raycast.authorURL https://raycast.com/xream

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 开始更新外部资源..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

/Applications/Surge.app/Contents/Applications/surge-cli external-resource update all

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 更新外部资源完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


