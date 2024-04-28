/**
 * 感谢 群友 @utopter 投稿
 *
 * whitelist 正则表示不删除的白名单
 * threshold 表示超出阈值后删除，默认为0.5
 * gptPattern 正则表示需要删除的项目，默认为\[GPT\]
 * node_name_regex 用于匹配节点名称的正则表达式
 */
function operator(proxies, targetPlatform, context) {
  const whitelist = ($arguments.whitelist || '').split(',').filter(Boolean)
  const threshold = parseFloat($arguments.threshold || 0.5)
  const gptPattern = $arguments.gptPattern || '\\[GPT\\]'
  const nodeNameRegex = new RegExp($arguments.node_name_regex || '.*') // 添加正则表达式匹配

  const $ = $substore
  const gptRegex = new RegExp(gptPattern)
  const whitelistRegexes = whitelist.map(pattern => new RegExp(pattern))

  // 过滤节点列表，仅保留匹配正则表达式的节点
  const filteredProxies = proxies.filter(proxy => nodeNameRegex.test(proxy.name))

  const gptProxies = filteredProxies.filter(proxy => gptRegex.test(proxy.name))
  const gptRatio = gptProxies.length / filteredProxies.length

  $.info(`GPT 代理节点数量: ${gptProxies.length}/${filteredProxies.length}`)
  $.info(`GPT 代理节点比例: ${(gptRatio * 100).toFixed(2)}%`)

  if (gptRatio >= threshold) {
    $.info(`GPT 代理节点比例达到 ${(threshold * 100).toFixed(2)}%,认为上一次检测脚本运行正常`)
    const validProxies = filteredProxies.filter(
      proxy => gptRegex.test(proxy.name) || whitelistRegexes.some(regex => regex.test(proxy.name))
    )
    const invalidProxies = filteredProxies.filter(proxy => !validProxies.includes(proxy))

    $.info(`有效代理节点数量: ${validProxies.length}`)
    $.info(`无效代理节点数量: ${invalidProxies.length}`)

    if (validProxies.length > 0) {
      $.info(`保留有效代理节点: ${validProxies.map(proxy => proxy.name).join(', ')}`)
      // 将 filteredProxies 替换为 validProxies
      proxies = proxies.map(proxy => filteredProxies.find(p => p.name === proxy.name) || proxy)
    } else {
      $.info('没有需要保留的有效代理节点')
    }
  } else {
    $.info(`GPT 代理节点比例未达到 ${(threshold * 100).toFixed(2)}%,认为上一次检测脚本运行异常,不进行删除操作`)
  }

  // 从所有节点的名称中删除 "[GPT]" 字样
  const Proxies = proxies.map(proxy => ({
    ...proxy,
    name: proxy.name.replace(gptRegex, '').trim(),
  }))

  $.info('已从所有节点的名称中删除 "[GPT]" 字样')
  return Proxies
}
