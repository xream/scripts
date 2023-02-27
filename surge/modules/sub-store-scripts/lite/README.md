# Sub-Store Lite

> [免责声明](https://github.com/xream/scripts/blob/main/README.md)

> 欢迎加入群组 [https://t.me/zhetengsha_group](https://t.me/zhetengsha_group)

特点:

- 支持修改 `host` 混淆, `path` 路径, `port` 端口, `method` 请求方式(网络为 `http` 时, 可能需要设置此项)

- 兼容不同的 network(`vmess`, `vless` 的 `ws`, `h2`, `http` 和其他)

- 兼容 QuanX, Surge, Loon, Shadowrocket, Stash 等客户端和 Node.js 环境

- Sub-Store 内部暂时并不支持 `http-opts` 里的 `host`, `path` 为数组. 本脚本增加了一个选择来控制数组的输出.

## Sub-Store 脚本使用方法

打开 Sub-Store => 订阅 => 编辑 => 节点操作+ => 脚本操作 => 链接 => 粘贴 [https://raw.githubusercontent.com/xream/scripts/main/surge/modules/sub-store-scripts/lite/index.js](https://raw.githubusercontent.com/xream/scripts/main/surge/modules/sub-store-scripts/lite/index.js) => 保存

引用格式如下：

### 最简例子

设置 Host 混淆为 `a.189.cn`, 为修改了 Host 的节点名添加后缀 `[北停]`

`https://raw.githubusercontent.com/xream/scripts/main/surge/modules/sub-store-scripts/lite/index.js#host=a.189.cn&hostSuffix=[北停]`

### vmess `http` 节点(即所谓的 `tcp` 节点)

订阅同时包含了 `network` 为 `ws` 和 `http` 的节点. 你想统一设置混淆为 `tms.dingtalk.com`, 端口为 `80`

1. 输出给 Clash 系的客户端, 请加上 `array` `true`

`https://raw.githubusercontent.com/xream/scripts/main/surge/modules/sub-store-scripts/lite/index.js#hostPrefix=[钉钉]&host=tms.dingtalk.com&port=80&array=true`

2. 输出给 非 Clash 系的客户端, 应该不用加上 `array`

`https://raw.githubusercontent.com/xream/scripts/main/surge/modules/sub-store-scripts/lite/index.js#hostPrefix=[钉钉]&host=tms.dingtalk.com&port=80`

### 注意

部分用户的环境拉取不到脚本

建议套一下 github 加速服务, 例如

`https://ghproxy.com/https://raw.githubusercontent.com/xream/scripts/main/surge/modules/sub-store-scripts/lite/index.js`

## 参数列表

`host` 修改 Host 混淆. 默认为空 不修改. 例 a.189.cn

`hostPrefix` 为修改了 Host 的节点名添加前缀. 默认为空

`hostSuffix` 为修改了 Host 的节点名添加后缀. 默认为空. 例 [微博混淆]

`path` 修改 Path 路径. 默认为空 不修改. 例 /TS/recharge/tzUrl.html

`pathPrefix` 为修改了 Path 的节点名添加前缀. 默认为空

`pathSuffix` 为修改了 Path 的节点名添加后缀. 默认为空. 例 [广停路径]

`port` 修改 Port 端口 默认为空 不修改. 例 80

`portPrefix` 为修改了 Port 的节点名添加前缀. 默认为空

`portSuffix` 为修改了 Port 的节点名添加前缀. 默认为空. 例 [80]

`method` method 默认为空 不修改. 例 `GET`. 网络为 `http` 时, 可能需要设置此项

`array` 是否把 `host`, `path` 设为数组. 默认不是数组. 如果要用于 Clash 系的客户端输出, 应设为 `true`. 不需要的时候, 请不要传这个字段

`defaultNetwork` 默认的 `network`. 节点无 `network` 时, 将设置为此值. 最新版已默认为 `http`

当 `network` 为 `http` 时:

`defaultPath` 默认的 `path`. 节点无 `network` 时, 将设置为此值. 最新版已默认为 `/`

`defaultMethod` 默认的 `method`. 节点无 `method` 时, 将设置为此值. 最新版已默认为 `GET`

## 如果怕拉不下来脚本导致没改成成功...可以不使用链接, 而是复制修改代码

> 可能你的需求很简单 根本不需要用这么复杂的逻辑 先看看这俩脚本吧:

### VMESS WS 脚本最简示例

```JavaScript
async function operator(proxies = []) {
    const _ = lodash
    return proxies.map((p = {}) => {
        _.set(p, 'name', `${_.get(p, 'name')}-西瓜`) // 名称添加后缀
        _.set(p, 'port', 80)  // 改端口
        _.set(p, 'ws-opts.headers.Host', 'v9-dy.ixigua.com') // 改混淆
        return p
    })
}
```

### TROJAN 脚本最简示例

```JavaScript
async function operator(proxies = []) {
    const _ = lodash
    return proxies.map((p = {}) => {
        _.set(p, 'name', `${_.get(p, 'name')}-西瓜`) // 名称添加后缀
        _.set(p, 'skip-cert-verify', true)  // 改跳过证书验证
        _.set(p, 'sni', 'v9-dy.ixigua.com') // 改混淆
        return p
    })
}
```

### SS 脚本最简示例

```JavaScript
async function operator(proxies = []) {
    const _ = lodash
    return proxies.map((p = {}) => {
        _.set(p, 'name', `${_.get(p, 'name')}-西瓜`) // 名称添加后缀
        _.set(p, 'plugin', 'obfs')  // 改混淆插件
        _.set(p, 'plugin-opts', { "mode": "http", "host": "v9-dy.ixigua.com" })  // 改混淆

        // _.set(p, 'plugin-opts.mode', 'http')  // 改混淆插件
        // _.set(p, 'plugin-opts.host', 'v9-dy.ixigua.com')  // 改混淆

        return p
    })
}
```

> 以下为完整脚本的举例 不一定会按最新代码更新

```JavaScript
async function operator(proxies = []) {
    return proxies.map((p = {}) => {
        const _ = lodash

        const host = _.get($arguments, 'host') || 'dm.toutiao.com'
        const hostPrefix = _.get($arguments, 'hostPrefix')
        const hostSuffix = _.get($arguments, 'hostSuffix') || '[头条]'
        // 注意我这里没改端口
        // 要改的话 是这样改 const port = _.get($arguments, 'port') || 80
        const port = _.get($arguments, 'port')

        const portPrefix = _.get($arguments, 'portPrefix')
        const portSuffix = _.get($arguments, 'portSuffix')
        const path = _.get($arguments, 'path') || '/'
        const pathPrefix = _.get($arguments, 'pathPrefix')
        const pathSuffix = _.get($arguments, 'pathSuffix')
        const method = _.get($arguments, 'method') || 'GET'
        const array = _.get($arguments, 'array') || true
        const defaultNetwork = _.get($arguments, 'defaultNetwork') || 'http'

        // 沃音乐 公免
        // 名称判断 _.includes(p.name, '沃音乐') || _.includes(p.name, '公免')
        // 或 path 判断
        if(_.chain(p).get('ws-opts.path').includes('gd.unicommusic.gtimg.com').value()){
            // 沃音乐的好像有点问题
            // 我看了 "host":"1.1.1.1\nUser-Agent:ANDROIDQQMUSIC" 这种格式
            // shadowrocket支持 可用
            // 但是 clash 不支持
            // clash需要这样的
            // "headers":{ "Host": "1.1.1.1", "User-Agent": "ANDROIDQQMUSIC" }

            // 以下方式二选一

            // 方式一: 强制设置 User-Agent 为 ANDROIDQQMUSIC
            _.set(p, 'ws-opts.headers.User-Agent', 'ANDROIDQQMUSIC')

            // 方式二: Sub-Store 编辑订阅, User-Agent 设为  Shadowrocket/1598 CFNetwork/1331.0.7 Darwin/21.4.0
            // 以下逻辑将自动转换并添加字段
            _.chain(p).get('ws-opts.headers.Host').split('\n').each(i => {
                const [key, value] = _.split(i, ':')
                if(_.isNil(value)){
                _.set(p, ['ws-opts', 'headers', 'Host'], key)
                } else {
                _.set(p, ['ws-opts', 'headers', key], value)
                }
            }).value()
            return p
        }
        let network = _.get(p, 'network')
        const type = _.get(p, 'type')
        /* 只修改 vmess 和 vless */
        if (_.includes(['vmess', 'vless'], type)) {
            if (!network) {
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
                    _.set(p, 'tls-hostname', host)
                    _.set(p, 'sni', host)
                }

                if (network === 'ws') {
                    _.set(p, 'ws-opts.headers.Host', host)
                } else if (network === 'h2') {
                    _.set(p, 'h2-opts.host', array ? [host] : host)
                } else if (network === 'http') {
                    _.set(p, 'http-opts.headers.Host', array ? [host] : host)
                } else {
                    // 其他? 谁知道是数组还是字符串...先按数组吧
                    _.set(p, `${network}-opts.headers.Host`, array ? [host] : host)
                }
            }
            if (network === 'http') {
              if (!_.get(p, 'http-opts.method') && !method) {
                method = defaultMethod
              }
              _.set(p, 'http-opts.method', method)
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

        // 如果不是 80 端口, 加个前缀标明
        // 一般用不到 测某些端口免不免的时候可能会用到
        if (String(p.port) !== '80'){
            _.set(p, 'name', `[${p.port}]${p.name}`)
        }
        // 如果是 VMESS HTTP, 加个前缀标明
        // 一般用不到 想单独测 HTTP 的时候可能会用到
        if (network === 'http') {
            _.set(p, 'name', `[HTTP]${p.name}`)
        }

        // 一个排序的例子 港>日>台>新>韩
        let sort = 0;
        if (p.name.includes('港')) {
            sort = 20;
        } else if (p.name.includes('日')) {
            sort = 19;
        } else if (p.name.includes('台')) {
            sort = 12;
        } else if (p.name.includes('新')) {
            sort = 11;
        } else if (p.name.includes('韩')) {
            sort = 10;
        }
        p._sort = sort;
        return p
    }).sort((a, b) => b._sort - a._sort);
}
```
