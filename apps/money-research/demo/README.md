# moneyResearch Demo

统一测试目录：闲鱼、网盘、小红书、B 站会员购等自动化脚本，以及 Next.js 联调面板。

## 目录结构

```
demo/
├── requirements.txt
├── xianyu/
├── baidu-pan/
├── quark-pan/
├── xiaohongshu/
├── bilibili-mall/         # B 站会员购/票务
│   ├── lib/
│   ├── scripts/           # 01~06
│   └── data/cookies.json
└── web/
```

## Cookie 配置

| 主题 | 文件 | 关键字段 |
|------|------|----------|
| B 站会员购 | `bilibili-mall/data/cookies.json` | SESSDATA, bili_jct, DedeUserID |

## 命令行测试（B 站会员购）

```bash
python bilibili-mall/scripts/02_bili_ticket.py
python bilibili-mall/scripts/03_parse_link.py --url "https://show.bilibili.com/platform/detail.html?id=100000"
python bilibili-mall/scripts/04_list_inventory.py --market
python bilibili-mall/scripts/06_pipeline.py --url "https://show.bilibili.com/platform/detail.html?id=100000" --dry-run
```

> ⚠️ 仅供调研自用。购票全流程默认 `--dry-run`；真下单易触发极验风控。
