# 联通余量

<table style="padding: 10px">
 
  <tr>
    <td><img src="https://i.loli.net/2021/07/24/XeZEUqbjJgC7RFV.jpg" width="400px"></td>
    <td><img src="https://i.loli.net/2021/07/24/yYrJmK7znEwiDsT.jpg" width="400px"></td>
  </tr>
   <tr>
    <td><img src="https://i.loli.net/2021/07/24/JWC21sOSPrp3duR.jpg" height="200px"></td>
  </tr>
</table>

## 懒人 Surge Module

[联通余量](https://raw.githubusercontent.com/xream/scripts/main/surge/modules/10010/10010.sgmodule)

## 手动设置 Scripts

```
[MITM]
hostname = m.client.10010.com

[Script]
# Surge
联通余量: Cookie = type=http-request,pattern=^https?:\/\/m\.client\.10010\.com\/servicequerybusiness,requires-body=1,max-size=0,timeout=30,script-path=https://raw.githubusercontent.com/xream/scripts/main/surge/modules/10010/cookie.js,debug=true
联通余量: 查询 = type=cron,cronexp=*/5 * * * *,timeout=30,script-path=https://raw.githubusercontent.com/xream/scripts/main/surge/modules/10010/check.js,wake-system=true

# Loon
http-request ^https?:\/\/m\.client\.10010\.com\/servicequerybusiness script-path=https://raw.githubusercontent.com/xream/scripts/main/surge/modules/10010/cookie.js, tag=联通余量Cookie
cron "*/5 * * * *" script-path=https://raw.githubusercontent.com/xream/scripts/main/surge/modules/10010/check.js

# QuanX(未测试 不清楚如何判断当前网络是否为 WiFi)
^https?:\/\/m\.client\.10010\.com\/servicequerybusiness url script-request-header https://raw.githubusercontent.com/xream/scripts/main/surge/modules/10010/cookie.js
*/5 * * * * https://raw.githubusercontent.com/xream/scripts/main/surge/modules/10010/check.js, tag=联通余量查询
```

## BoxJs 订阅(可跳过)

使用 [BoxJs](https://chavyleung.gitbook.io/boxjs) 添加 [订阅](https://raw.githubusercontent.com/xream/scripts/main/boxjs/boxjs.json) 后, Scriptable 脚本可支持缓存 Cookie

可设置:

- 使用 WiFi 时, 也进行检查(Surge/Loon 默认不检查; 其他 app 总是检查)

- 当前时间段内无用量时, 也进行通知(默认不通知)

- 获取 cookie 时, 自动通过 V2P webhook 同步 cookie

<table style="padding: 10px">
  <tr>
    <td><img src="https://i.loli.net/2021/07/24/NIRaCkPWGOy2XAT.jpg" height="600px"></td>
    <td><img src="https://i.loli.net/2021/07/24/ZHJ8ejLCDTOzbrp.jpg" height="600px"></td>
  </tr>
</table>

## 获取 Cookie

登录中国联通 app, 打开余量查询, 获取 Cookie

## V2P

在 `TASK(定时任务)` 中, 点击`添加单个任务`, 设置 `联通余量`, `cron定时`, `30 */5 * * * *`, `运行JS`, `https://raw.githubusercontent.com/xream/scripts/main/surge/modules/10010/check.js`

<table style="padding: 10px">
  <tr>
    <td><img src="https://i.loli.net/2021/07/24/DgyX5KPFquhRMeZ.png" height="300px"></td>
  </tr>
</table>

### 配置

正确设置 BoxJs 后, Cookie 会自动同步到 V2P

其他配置可在 `JSMANAGE(JS 文件管理)` 中的 `store/cookie 常量储存管理` 中手动设置, 参考以下内容(摘自 BoxJs), 自行设置 KEY 和 VALUE 即可

```JSON
[{
  "id": "10010_same",
  "name": "当前时间段内无用量时, 也进行通知",
  "val": false,
  "type": "boolean",
  "desc": "默认不通知"
},
{
  "id": "10010_ignore_flow",
  "name": "流量变化忽略阈值(单位 M)",
  "val": 0,
  "type": "number",
  "desc": "忽略小于此数值的流量变化"
},
{
  "id": "10010_no_url",
  "name": "不在通知中附加 URL",
  "val": false,
  "type": "boolean",
  "desc": "默认附加"
}]
```

## Scriptable

## 脚本

依赖: [「小件件」开发环境.js](https://raw.githubusercontent.com/xream/scripts/main/scriptable/「小件件」开发环境.js)

[联通余量.js](https://raw.githubusercontent.com/xream/scripts/main/scriptable/10010/联通余量.js)

<table style="padding: 10px">
  <tr>
    <td><img src="https://i.loli.net/2021/07/22/vFj9uLMp6BbZmWP.jpg" height="200px"></td>
    <td><img src="https://i.loli.net/2021/07/22/3mnxdtJ8TFMfazu.jpg" height="200px"></td>
  </tr>
</table>
