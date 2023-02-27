
$httpClient.get( { url: 'http://localhost:9090/connections', }, (error, response, data) => {
    if (error) {
        done({});
    }
    else {
        try {
          const json_data = JSON.parse(data)

          // 当最终出站策略不为'DIRECT'时，最优的策略就是没有DNS解析时间，所以这个DNS解析是多余的
          // 此计数越低越好，当数值比较高时建议对规则进行优化
          json_data.connections.forEach(c => {
            if (c.metadata.tracing.hasOwnProperty("dnsQuery") && c.metadata.tracing.dnsQuery > 1) {
              console.log(`⚠️ ${c.metadata.host}\n\n⏳ ${c.metadata.tracing.dnsQuery}\n\nℹ️ ${c.metadata.rulePayload}\n\nℹ️ ${c.chains.join('\n')}\n\n`)
            }
          })

          $done({});
        } catch (e) {
          console.error(e);
          $done({});
        }
    }
});