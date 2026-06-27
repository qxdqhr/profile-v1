# Web Cookie 转存协议

> 基于 pan.baidu.com Web 端抓包与开源项目归纳，非官方文档。

## 1. 网关

| 用途 | URL |
|------|-----|
| 分享页 | `GET https://pan.baidu.com/s/1{surl}` |
| 提取码验证 | `POST https://pan.baidu.com/share/verify?surl={surl}` |
| 分享文件列表 | `GET https://pan.baidu.com/share/list` |
| 转存 | `POST https://pan.baidu.com/share/transfer` |
| 创建分享 | `POST https://pan.baidu.com/share/set` |
| bdstoken | `GET https://pan.baidu.com/api/gettemplatevariable` |
| 创建目录 | `POST https://pan.baidu.com/api/create` |
| 文件搜索 | `GET https://pan.baidu.com/api/search` |
| 容量 | `GET https://pan.baidu.com/api/quota` |

## 2. 公共参数

多数接口需要：

```
channel=chunlei
web=1
app_id=250528
clienttype=0
bdstoken={登录账号bdstoken}
logid={Base64(BAIDUID)}
```

## 3. 子流程详解

### 3.1 解析分享页

分享页 HTML 含 `yunData` JSON：

```javascript
yunData = {
  shareid: "...",
  share_uk: "...",
  file_list: { list: [{ fs_id, server_filename, ... }] },
  bdstoken: "...",
  ...
}
```

提取：`surl`（链接路径）、`shareid`、`uk`、`fs_id` 列表。

### 3.2 提取码验证

```
POST /share/verify?surl={surl}
Body: pwd={提取码}
```

成功返回 `randsk`（即转存时的 `sekey`），响应 Set-Cookie 写入 `BDCLND`。

### 3.3 转存

```
POST /share/transfer
Query: shareid, from(uk), sekey, bdstoken, logid, ondup=newcopy, async=1
Body: fsidlist=[123,456], path=/目标目录
Header: Referer=分享页URL, Cookie=BDUSS+STOKEN+BDCLND
```

### 3.4 创建分享

```
POST /share/set
Query: bdstoken, channel, web, app_id, clienttype
Body: fid_list=[fs_id], pwd=提取码, period=7, schannel=4, channel_list=[]
```

成功返回 `shorturl`，完整链接：

```
https://pan.baidu.com/s/1{shorturl}?pwd={pwd}
```

## 4. 关键 Cookie

| Cookie | 作用 |
|--------|------|
| BDUSS | 登录态 |
| STOKEN | 安全校验 |
| BAIDUID | 设备 ID，用于 logid |
| BDCLND | 提取码验证后的 sekey 载体 |

## 5. 常见 errno

| errno | 含义 |
|-------|------|
| 0 | 成功 |
| -9 | 提取码错误 |
| -62 | 提取码错误 / 需要验证 |
| 12 | 空间不足 |
| -7 | shareid 不存在 |
| -21 | 分享已取消 |

## 6. 参考开源

- pybdc / BaiduPan_Spider — transfer + share/set
- CSDN MANX98 — verify + list + transfer 完整链路
