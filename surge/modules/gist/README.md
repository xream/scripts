# Gist 备份/恢复 BoxJs 数据

> [免责声明](https://github.com/xream/scripts/blob/main/README.md)

> 欢迎加入群组 [https://t.me/zhetengsha_group](https://t.me/zhetengsha_group)

🆕 也可以删除远程 Gist 备份

使用了 [chavyleung 大佬的 Env.js](https://github.com/chavyleung/scripts/blob/master/Env.js). 兼容 QuanX, Surge, Loon, Shadowrocket, Stash 等客户端

特点:

🐶 原脚本由 [@dompling](https://github.com/dompling) 提供, 感谢!

⚠️ 本脚本涉及大量对 BoxJs 以及原脚本的复制粘贴 侵删

🚀 本脚本直接复用 BoxJs 的全局备份/全局恢复逻辑

🐶 本脚本暂时不支持分页. Gist API 默认取第一页(30 项)

⚠️ 使用前, 请务必进行全局备份并复制粘贴到安全的地方

> 数据不备份 亲人两行泪

## 本脚本对数据的任何形式的丢失、删除、损坏或篡改都不负责, 亦不承担任何法律责任

## BoxJs

使用 [BoxJs 测试版](https://chavyleung.gitbook.io/boxjs) 添加 订阅 [https://raw.githubusercontent.com/xream/scripts/main/boxjs/boxjs.json](https://raw.githubusercontent.com/xream/scripts/main/boxjs/boxjs.json)

BoxJs v0.10.0 后 支持一键添加订阅 可点击尝试 [http://boxjs.com/#/sub/add/https%3A%2F%2Fraw.githubusercontent.com%2Fxream%2Fscripts%2Fmain%2Fboxjs%2Fboxjs.json](http://boxjs.com/#/sub/add/https%3A%2F%2Fraw.githubusercontent.com%2Fxream%2Fscripts%2Fmain%2Fboxjs%2Fboxjs.json)

## 配置

基本上打开 BoxJs 都能看明白

## Stash

Stash 目前不支持手动执行, 请在完成 BoxJs 配置后

添加覆写 [https://raw.githubusercontent.com/xream/scripts/main/surge/modules/gist/gist.rewrite.stash.stoverride](https://raw.githubusercontent.com/xream/scripts/main/surge/modules/gist/gist.rewrite.stash.stoverride)

在浏览器中 手动访问

`http://gist.json/restore` 进行恢复

`http://gist.json/backup` 进行备份

`http://gist.json/delete` 进行删除

⚠️ 使用前, 请务必进行全局备份并复制粘贴到安全的地方

并在使用后 关闭覆写

> 数据不备份 亲人两行泪
