# Demo 子任务设计

| 步骤 | 脚本 | 说明 |
|------|------|------|
| 01 | `01_cookie_login.py` | SESSDATA 登录检测 |
| 02 | `02_bili_ticket.py` | GenWebTicket |
| 03 | `03_parse_link.py` | 解析票务/市集链接 |
| 04 | `04_list_inventory.py` | 场次票档 或 市集商品 |
| 05 | `05_prepare_order.py` | 预下单获取 token |
| 06 | `06_pipeline.py` | 全流程（默认 dry-run） |

## Web API 路由

- `/api/bilibili-mall/cookie-login`
- `/api/bilibili-mall/bili-ticket`
- `/api/bilibili-mall/parse-link`
- `/api/bilibili-mall/list-inventory`
- `/api/bilibili-mall/prepare-order`
- `/api/bilibili-mall/pipeline`
