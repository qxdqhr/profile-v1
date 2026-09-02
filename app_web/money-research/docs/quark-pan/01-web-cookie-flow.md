# 夸克网盘 Web Cookie 协议

> 网关：`https://drive-pc.quark.cn`，页面：`https://pan.quark.cn`

## 1. 公共参数

多数接口 Query：

```
pr=ucpro
fr=pc
uc_param_str=
```

请求头需带完整 `Cookie` 与 `Content-Type: application/json`。

## 2. 核心接口

| 步骤 | 方法 | 路径 |
|------|------|------|
| 登录检测 | GET | `https://pan.quark.cn/account/info` |
| 获取 stoken | POST | `/1/clouddrive/share/sharepage/token` |
| 分享文件列表 | GET | `/1/clouddrive/share/sharepage/detail` |
| 转存 | POST | `/1/clouddrive/share/sharepage/save` |
| 任务查询 | GET | `/1/clouddrive/task` |
| 路径→fid | POST | `/1/clouddrive/file/info/path_list` |
| 创建目录 | POST | `/1/clouddrive/file` |
| 创建分享 | POST | `/1/clouddrive/share` |
| 分享链接详情 | POST | `/1/clouddrive/share/password` |

## 3. 转存请求体

```json
{
  "fid_list": ["文件fid"],
  "fid_token_list": ["share_fid_token"],
  "to_pdir_fid": "目标目录fid",
  "pwd_id": "分享pwd_id",
  "stoken": "验证后stoken",
  "pdir_fid": "0",
  "scene": "link"
}
```

## 4. 创建分享

```json
{
  "fid_list": ["已转存文件fid"],
  "title": "分享标题",
  "url_type": 2,
  "expired_type": 2,
  "expire_time": 604800,
  "passcode": "x1y2"
}
```

异步任务通过 `/1/clouddrive/task?task_id=...` 轮询，`status`: 1 进行中、2 成功、3 失败。

## 5. 与百度网盘对比

| 维度 | 百度网盘 | 夸克网盘 |
|------|----------|----------|
| 分享 ID | shareid + uk | pwd_id |
| 验证 | randsk / BDCLND | stoken |
| 文件标识 | fs_id | fid + share_fid_token |
| 转存 | 同步为主 | 异步 task 为主 |
| 目录 | path 字符串 | fid + dir_path |

## 6. 参考开源

- [Cp0204/quark-auto-save](https://github.com/Cp0204/quark-auto-save)
- [ihmily/QuarkPanTool](https://github.com/ihmily/QuarkPanTool)
- [quarkpan (PyPI)](https://pypi.org/project/quarkpan/)
