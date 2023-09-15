# Sub-Store Lite

> [免责声明](https://github.com/xream/scripts/blob/main/README.md)

> 欢迎加入群组 [https://t.me/zhetengsha_group](https://t.me/zhetengsha_group)

特点:

- 支持修改 `host` 混淆, `path` 路径, `port` 端口, `method` 请求方式(网络为 `http` 时, 可能需要设置此项)

- 兼容不同的 network(`vmess`, `vless` 的 `ws`, `h2`, `http` 和其他)

- 兼容 `vless` `reality` 的 `servername`

- 兼容 QuanX, Surge, Loon, Shadowrocket, Stash 等客户端和 Node.js 环境

## Sub-Store 脚本使用方法

打开 Sub-Store => 订阅 => 编辑 => 节点操作+ => 脚本操作 => 链接 => 粘贴 [https://raw.githubusercontent.com/xream/scripts/main/surge/modules/sub-store-scripts/lite/index.js](https://raw.githubusercontent.com/xream/scripts/main/surge/modules/sub-store-scripts/lite/index.js) => 保存

引用格式如下：

### 最简例子

设置 Host 混淆为 `a.189.cn`, 为修改了 Host 的节点名添加后缀 `[北停]`

`https://raw.githubusercontent.com/xream/scripts/main/surge/modules/sub-store-scripts/lite/index.js#host=a.189.cn&hostSuffix=[北停]`

### vmess `http` 节点(即所谓的 `tcp` 节点)

订阅同时包含了 `network` 为 `ws` 和 `http` 的节点. 你想统一设置混淆为 `tms.dingtalk.com`, 端口为 `80`

> 我在 Sub-Store 2.14.15+ 上修了数组的问题 `array` 参数应该没啥必要了

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
        const name = _.get(p, 'name') || '' // 演示一下 可以用 lodash

        _.set(p, 'name', name + '-后缀') // 名称 添加后缀 怕小白复制出问题 不使用反引号了
        _.set(p, 'port', 80)  // 改端口
        _.set(p, 'ws-opts.headers.Host', 'v9-dy.ixigua.com') // 改混淆

        _.set(p, 'xudp', true) // 开 xudp clash meta 核 vmess 支持 xudp

        // _.set(p, 'udp', true) // 开 udp 一般不用在脚本里改 可以界面上开
        // _.set(p, 'tfo', true) // 开 tfo 一般不用在脚本里改 可以界面上开
        return p
    })
}
```

### TROJAN 脚本最简示例

```JavaScript
async function operator(proxies = []) {
    const _ = lodash
    return proxies.map((p = {}) => {
      if(_.get(p, 'type') === 'trojan') {
        const name = _.get(p, 'name') || '' // 演示一下 可以用 lodash

        _.set(p, 'name', name + '-后缀') // 名称 添加后缀 怕小白复制出问题 不使用反引号了
        _.set(p, 'skip-cert-verify', true)  // 改跳过证书验证
        _.set(p, 'sni', 'v9-dy.ixigua.com') // 改混淆

        // _.set(p, 'udp', true) // 开 udp 一般不用在脚本里改 可以界面上开
        // _.set(p, 'tfo', true) // 开 tfo 一般不用在脚本里改 可以界面上开
      }
      return p
    })
}
```

### SS 脚本最简示例

> 注意: 如果服务端没开 客户端开了没用

```JavaScript
async function operator(proxies = []) {
    const _ = lodash
    return proxies.map((p = {}) => {
      if(_.get(p, 'type') === 'ss') {
        const name = _.get(p, 'name') || '' // 演示一下 可以用 lodash

        _.set(p, 'name', name + '-后缀') // 名称 添加后缀 怕小白复制出问题 不使用反引号了
        _.set(p, 'plugin', 'obfs')  // 改混淆插件
        _.set(p, 'plugin-opts', { "mode": "http", "host": "v9-dy.ixigua.com" })  // 改混淆

        // _.set(p, 'plugin-opts.mode', 'http')  // 改混淆插件
        // _.set(p, 'plugin-opts.host', 'v9-dy.ixigua.com')  // 改混淆

        // _.set(p, 'udp', true) // 开 udp 一般不用在脚本里改 可以界面上开
        // _.set(p, 'tfo', true) // 开 tfo 一般不用在脚本里改 可以界面上开
      }
      return p
    })
}
```

### 当你的来源是 QX 时, 把别的客户端不支持的 `chacha20-ietf-poly1305` 换成 `auto`

```JavaScript
async function operator(proxies = []) {
    const _ = lodash
    return proxies.map((p = {}) => {
        if (_.get(p, 'cipher') === 'chacha20-ietf-poly1305') {
            _.set(p, 'cipher', 'auto');
        }
        return p
    })
}
```
