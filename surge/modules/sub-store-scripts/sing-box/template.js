// https://raw.githubusercontent.com/xream/scripts/main/surge/modules/sub-store-scripts/sing-box/template.js#type=组合订阅&name=机场&outbound=🕳ℹ️all|all-auto🕳ℹ️hk|hk-auto🏷ℹ️港|hk|hongkong|kong kong|🇭🇰🕳ℹ️tw|tw-auto🏷ℹ️台|tw|taiwan|🇹🇼🕳ℹ️jp|jp-auto🏷ℹ️日本|jp|japan|🇯🇵🕳ℹ️sg|sg-auto🏷ℹ️^(?!.*(?:us)).*(新|sg|singapore|🇸🇬)🕳ℹ️us|us-auto🏷ℹ️美|us|unitedstates|united states|🇺🇸

// 示例表示:
// 读取 名称为 机场 的组合订阅 中的节点
// 把 所有节点插入 /all|all-auto/i 的 outbound 中
// 把 /港|hk|hongkong|kong kong|🇭🇰/i 节点插入 /hk|hk-auto/i 的 outbound 中
// ...

const { type, name, outbound } = $arguments

let config = JSON.parse($files[0])
let proxies = await produceArtifact({
  name,
  type: /^1$|col|组合/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
})
const outbounds = outbound
  .split('🕳')
  .filter(i => i)
  .map(i => {
    let [outbound, tag = '.*'] = i.split('🏷')
    return [outbound, new RegExp(tag.replace('ℹ️', ''), tag.includes('ℹ️') ? 'i' : undefined)]
  })
config.outbounds.map(outbound => {
  outbounds.map(([outboundPattern, tagRegex]) => {
    const outboundRegex = new RegExp(
      outboundPattern.replace('ℹ️', ''),
      outboundPattern.includes('ℹ️') ? 'i' : undefined
    )
    if (outboundRegex.test(outbound.tag)) {
      outbound.outbounds.push(...getTags(proxies, tagRegex))
    }
  })
})

config.outbounds.push(...proxies)

$content = JSON.stringify(config, null, 2)

function getTags(proxies, regex) {
  return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag)
}
function getTags(proxies, regex) {
  return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag)
}
