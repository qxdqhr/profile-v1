# 会员购市集 API（mall.bilibili.com）

## 市集列表

```
POST https://mall.bilibili.com/mall-magic-c/internet/c2c/v2/list
Content-Type: application/json
Cookie: （建议登录态，部分场景可匿名）

{
  "sortType": "TIME_DESC",
  "priceFilters": [],
  "discountFilters": [],
  "nextId": null
}
```

## 商品详情

```
GET https://mall.bilibili.com/mall-magic-c/internet/c2c/items/queryC2cItemsDetail?c2cItemsId={id}
```

## 链接格式

- 市集首页：`https://mall.bilibili.com/neul-next/index.html?page=magic-market_index`
- 商品详情：`...page=magic-market_detail&itemsId={c2cItemsId}`

## 与票务 Demo 的关系

市集接口主要用于**浏览与比价**；C2C 购买下单接口更复杂且风控严格，本 Demo 在 `04_list_inventory.py --market` 中仅演示列表/详情查询，不包含自动下单。

参考开源：[2513502304/bilibili-mall](https://github.com/2513502304/bilibili-mall)
