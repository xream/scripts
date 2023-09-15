/**
 * @Sub-Store-Page
 * 混淆转换
 *
 * - 支持修改 `host` 混淆, `path` 路径, `port` 端口, `method` 请求方式(网络为 `http` 时, 可能需要设置此项)
 * - 兼容不同的 network(`vmess`, `vless` 的 `ws`, `h2`, `http` 和其他)
 * - 兼容 `vless` `reality` 的 `servername`
 * - 兼容 QuanX, Surge, Loon, Shadowrocket, Stash 等客户端和 Node.js 环境
 */

const SUB_STORE_SCHEMA = {
  title: '混淆转换',
  description: '支持修改 `host` 混淆, `path` 路径, `port` 端口, `method` 请求方式',
  scope: ['Node', 'Surge', 'QX', 'Loon', 'Stash', 'ShadowRocket', 'Clash'],
  author: '@xream',
  updateTime: '2023-09-15 17:12:00',
  version: '1.0.0',
  params: {
    host: {
      dataType: 'string',
      description: '修改 Host 混淆',
    },
    hostPrefix: {
      dataType: 'string',
      description: '为修改了 Host 的节点名添加前缀',
    },
    hostSuffix: {
      dataType: 'string',
      description: '为修改了 Host 的节点名添加后缀',
    },
    path: {
      dataType: 'string',
      description: '修改 Path 路径',
    },
    pathPrefix: {
      dataType: 'string',
      description: '为修改了 Path 的节点名添加前缀',
    },
    pathSuffix: {
      dataType: 'string',
      description: '为修改了 Path 的节点名添加后缀',
    },
    port: {
      dataType: 'number',
      description: '修改 Port 端口',
    },
    portPrefix: {
      dataType: 'string',
      description: '为修改了 Port 的节点名添加前缀',
    },
    portSuffix: {
      dataType: 'string',
      description: '为修改了 Port 的节点名添加前缀',
    },
    method: {
      dataType: 'string',
      description: '修改 Method(例如 传输层为 HTTP 时)',
    },
    defaultMethod: {
      dataType: 'string',
      description: '默认的 `method`. 节点无 `method` 时, 将设置为此值',
      defaultValue: 'GET',
    },
    defaultNetwork: {
      dataType: 'string',
      description: '默认的 `network`. 节点无 `network` 时, 将设置为此值',
      defaultValue: 'http',
    },
    defaultPath: {
      dataType: 'string',
      description: '默认的 `path`. 节点无 `network` 时, 将设置为此值',
      defaultValue: '/',
    },
    array: {
      dataType: 'select',
      description:
        '是否把 `host`, `path` 设为数组(后端版本低于 2.14.15 且目标为 Clash/Stash/Shadowrocket 等 Clash 系格式时需要',
      defaultValue: true,
      options: [
        { value: true, label: '是' },
        { value: false, label: '否' },
      ],
    },
  },
}
function operator(proxies = []) {
  return proxies.map((p = {}) => {
    const _ = lodash

    const host = _.get($arguments, 'host')
    const hostPrefix = _.get($arguments, 'hostPrefix')
    const hostSuffix = _.get($arguments, 'hostSuffix')
    const port = _.get($arguments, 'port')
    const portPrefix = _.get($arguments, 'portPrefix')
    const portSuffix = _.get($arguments, 'portSuffix')
    const defaultPath = _.get($arguments, 'defaultPath') ?? SUB_STORE_SCHEMA.params.defaultPath.defaultValue
    let path = _.get($arguments, 'path')
    const pathPrefix = _.get($arguments, 'pathPrefix')
    const pathSuffix = _.get($arguments, 'pathSuffix')
    const defaultMethod = _.get($arguments, 'defaultMethod') ?? SUB_STORE_SCHEMA.params.defaultMethod.defaultValue
    let method = _.get($arguments, 'method')
    const array = _.get($arguments, 'array')
    const defaultNetwork = _.get($arguments, 'defaultNetwork') ?? SUB_STORE_SCHEMA.params.defaultNetwork.defaultValue

    let network = _.get(p, 'network')
    const type = _.get(p, 'type')
    const isReality = _.get(p, 'reality-opts')

    /* 只修改 vmess 和 vless */
    if (_.includes(['vmess', 'vless'], type)) {
      if (!network && !isReality) {
        network = defaultNetwork
        _.set(p, 'network', defaultNetwork)
      }
      if (host) {
        if (hostPrefix) {
          _.set(p, 'name', `${hostPrefix}${p.name}`)
        }
        if (hostSuffix) {
          _.set(p, 'name', `${p.name}${hostSuffix}`)
        }
        /* 把 非 server 的部分都设置为 host */
        _.set(p, 'servername', host)
        if (_.get(p, 'tls')) {
          /* skip-cert-verify 在这里设为 true 有需求就再加一个节点操作吧 */
          _.set(p, 'skip-cert-verify', true)
          // 这个应该没用了
          // _.set(p, 'tls-hostname', host)
          _.set(p, 'sni', host)
        }

        if (!isReality) {
          if (network === 'ws') {
            _.set(p, 'ws-opts.headers.Host', host)
          } else if (network === 'h2') {
            _.set(p, 'h2-opts.host', array ? [host] : host)
          } else if (network === 'http') {
            _.set(p, 'http-opts.headers.Host', array ? [host] : host)
          } else {
            // 其他? 谁知道是数组还是字符串...先按字符串吧
            _.set(p, `${network}-opts.headers.Host`, host)
          }
        }
        if (network === 'http') {
          if (!_.get(p, 'http-opts.method') && !method) {
            method = defaultMethod
          }
          _.set(p, 'http-opts.method', method)
        }
      }

      if (port) {
        _.set(p, 'port', port)
        if (portPrefix) {
          _.set(p, 'name', `${portPrefix}${p.name}`)
        }
        if (portSuffix) {
          _.set(p, 'name', `${p.name}${portSuffix}`)
        }
      }
      if (!isReality) {
        if (network === 'http') {
          let currentPath = _.get(p, 'http-opts.path')
          if (_.isArray(currentPath)) {
            currentPath = _.find(currentPath, i => _.startsWith(i, '/'))
          } else {
            path = currentPath
          }
          if (!_.startsWith(currentPath, '/') && !path) {
            path = defaultPath
          }
        }
        if (path) {
          if (pathPrefix) {
            _.set(p, 'name', `${pathPrefix}${p.name}`)
          }
          if (pathSuffix) {
            _.set(p, 'name', `${p.name}${pathSuffix}`)
          }
          if (network === 'ws') {
            _.set(p, 'ws-opts.path', path)
          } else if (network === 'h2') {
            _.set(p, 'h2-opts.path', path)
          } else if (network === 'http') {
            _.set(p, 'http-opts.path', array ? [path] : path)
          } else {
            // 其他? 谁知道是数组还是字符串...先按字符串吧
            _.set(p, `${network}-opts.path`, path)
          }
        }
      }
    }
    return p
  })
}
