# 网络信息

> [免责声明](https://github.com/xream/scripts/blob/main/README.md)

> 欢迎加入群组 [https://t.me/zhetengsha_group](https://t.me/zhetengsha_group)

🆕 新版:

国内外 IP, 运营商, ASN, ORG, 位置, 策略; IPv6; 入口落地; 隐私; LAN; SSID. 自己设置对应域名的分流. 支持网络变化时进行查询通知. 提供 https://net-lsp-x.com 数据接口

查看 👉🏻 [https://t.me/zhetengsha/1107](https://t.me/zhetengsha/1107)

参数说明:

1 为开启, 0 为关闭

· `LAN` 显示 LAN IP

· `SSID` 显示 SSID

· `IPv6` 显示 IPv6 地址

· `MASK` 打码 保护隐私

· `DOMESTIC_IPv4` 国内 IPv4 来源, 可选 spcn(请设置分流 DOMAIN-SUFFIX,speedtest.cn), cip, bilibili, 126, ipip, ip233, pingan, qixin, muhan, ipim(请设置分流 DOMAIN-SUFFIX,ip.im), ali(将阿里云 IP 服务的 APPCODE 填到 DOMESTIC_IPv4_KEY)

· `DOMESTIC_IPv4_KEY` 若接口需要就填(多个 key 用 , 分隔)

· `DOMESTIC_IPv6` 国内 IPv6 来源, 可选 ddnspod, neu6

· `LANDING_IPv4` 落地 IPv4 来源, 可选 ipapi, ipsb, ipinfo, ipscore, ipwhois

· `LANDING_IPv6` 落地 IPv6 来源, 可选 ipsb, ident, ipify

· `DNS` 解析域名, 可选 google, cf, ali, tencent

· `ASN` 显示 ASN 信息

· `ORG` 显示 ORG 信息

· `PRIVACY` (当落地为 ipwhois 时)显示 Privacy/Security 等信息

· `FLAG` 是否显示国旗

· `TIMEOUT` 超时设置(单位: 秒)

· `RETRIES` 请求重试次数

· `RETRY_DELAY` 请求重试等待时间(单位: 秒)

· `ENTRANCE_DELAY` 查询落地之后紧接着查询入口可能会导致请求太频繁而风控. 可适当调节此延时(单位: 秒)

· `EVENT_SCRIPT_NAME` 网络变化时进行查询通知的脚本名称. 若要禁用此脚本, 请输入 #

· `EVENT_DELAY` 网络变化时, 延后查询信息(单位: 秒)

· `PANEL_NAME` 网络信息面板名称. 若要禁用此面板, 请输入 #

· `UPDATE-INTERVAL` 面板刷新时间. 您可以在这里指定一个小的时间（例如 1），以使面板每次自动更新。

---

使用了 [chavyleung 大佬的 Env.js](https://github.com/chavyleung/scripts/blob/master/Env.js)

包含国内和国外

1. 在支持面板的 app 上将展示面板

2. 在支持 `network-changed` 的 app 上将在网络环境发生变化 IP 变化时, 发送通知

<table>
  <tr>
    <td valign="top"><img src="screenshots/1.jpg"></td>
    <td valign="top"><img src="screenshots/2.jpg"></td>
  </tr>
 </table>

## 使用 Surge 模块

[https://raw.githubusercontent.com/xream/scripts/main/surge/modules/network-info/network-info.sgmodule](https://raw.githubusercontent.com/xream/scripts/main/surge/modules/network-info/network-info.sgmodule)

## Stash 使用覆写

[https://raw.githubusercontent.com/xream/scripts/main/surge/modules/network-info/network-info.rewrite.stash.stoverride](https://raw.githubusercontent.com/xream/scripts/main/surge/modules/network-info/network-info.rewrite.stash.stoverride)

## Loon 使用插件

[一键添加插件](https://www.nsloon.com/openloon/import?plugin=https://raw.githubusercontent.com/xream/scripts/main/surge/modules/network-info/network-info.plugin)

[https://raw.githubusercontent.com/xream/scripts/main/surge/modules/network-info/network-info.plugin](https://raw.githubusercontent.com/xream/scripts/main/surge/modules/network-info/network-info.plugin)
