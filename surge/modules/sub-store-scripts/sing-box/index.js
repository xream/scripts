async function operator(proxies = []) {
    const _ = lodash

    return proxies.filter(p => {
        if (!_.includes(['vmess', 'trojan'], p.type)) return
        if (p.type === 'vmess' && p.network !== 'ws') return
        return true
    })
        .map((p = {}) => {
            // vmess ws
            if (p.type === 'vmess' && p.network === 'ws') {
                return {
                    tag: p.name,
                    type: 'vmess',
                    server: p.server,
                    server_port: p.port,
                    uuid: p.uuid,
                    security: p.cipher,
                    alter_id: p.alterId,
                    transport: {
                        type: 'ws',
                        path: _.get(p, 'ws-opts.path'),
                        headers: _.get(p, 'ws-opts.headers'),
                        max_early_data: p.ws0rtt ? 2048 : undefined,
                        early_data_header_name: p.ws0rtt ? 'Sec-WebSocket-Protocol' : undefined
                    }
                }
            } else {
                // trojan
                return {
                    tag: p.name,
                    type: 'trojan',
                    server: p.server,
                    server_port: p.port,
                    password: p.password,
                    tls: {
                        enabled: true,
                        insecure: p['skip-cert-verify'],
                        server_name: p.sni
                    }
                }
            }
        })
}