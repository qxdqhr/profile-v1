"use client";

import { useState } from "react";
import { apiPath } from "@/lib/apiPath";

type Tab = "xianyu" | "baidu-pan" | "quark-pan" | "xiaohongshu" | "bilibili-mall";

type ApiResult = {
  ok?: boolean;
  code?: number;
  stdout?: string;
  stderr?: string;
  data?: Record<string, unknown>;
  error?: string;
};

async function callApi(path: string, body: Record<string, unknown>): Promise<ApiResult> {
  const res = await fetch(apiPath(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("xianyu");
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult | null>(null);

  // 闲鱼
  const [xyCookie, setXyCookie] = useState("");
  const [token, setToken] = useState("");
  const [signData, setSignData] = useState("{}");
  const [productName, setProductName] = useState("男士羊毛大衣 驼色长款");
  const [condition, setCondition] = useState("95新");
  const [price, setPrice] = useState("199");
  const [originalPrice, setOriginalPrice] = useState("599");
  const [publishTitle, setPublishTitle] = useState("");
  const [publishDesc, setPublishDesc] = useState("");
  const [shippingMode, setShippingMode] = useState("包邮");
  const [postPrice, setPostPrice] = useState("12");
  const [dryRun, setDryRun] = useState(true);

  // 百度网盘
  const [bdCookie, setBdCookie] = useState("");
  const [bdShareUrl, setBdShareUrl] = useState("https://pan.baidu.com/s/1xxxx?pwd=abcd");
  const [bdSharePwd, setBdSharePwd] = useState("abcd");
  const [bdSavePath, setBdSavePath] = useState("/转存调研");
  const [bdNewSharePwd, setBdNewSharePwd] = useState("x1y2");

  // 夸克网盘
  const [qkCookie, setQkCookie] = useState("");
  const [qkShareUrl, setQkShareUrl] = useState("https://pan.quark.cn/s/xxxxx?pwd=abcd");
  const [qkSharePwd, setQkSharePwd] = useState("abcd");
  const [qkSavePath, setQkSavePath] = useState("/转存调研");
  const [qkNewSharePwd, setQkNewSharePwd] = useState("x1y2");

  // 小红书
  const [xhsCookie, setXhsCookie] = useState("");
  const [xhsTopic, setXhsTopic] = useState("周末探店");
  const [xhsTitle, setXhsTitle] = useState("");
  const [xhsDesc, setXhsDesc] = useState("");
  const [xhsSignUri, setXhsSignUri] = useState("/api/sns/web/v2/user/me");
  const [xhsSignData, setXhsSignData] = useState("{}");
  const [xhsImage, setXhsImage] = useState("assets/sample.jpg");
  const [xhsDryRun, setXhsDryRun] = useState(true);

  // B 站会员购
  const [blCookie, setBlCookie] = useState("");
  const [blUrl, setBlUrl] = useState("https://show.bilibili.com/platform/detail.html?id=100000");
  const [blScreenId, setBlScreenId] = useState("");
  const [blSkuId, setBlSkuId] = useState("");
  const [blDryRun, setBlDryRun] = useState(true);

  async function run(action: string, fn: () => Promise<ApiResult>) {
    setLoading(action);
    try {
      const data = await fn();
      setResult(data);
    } catch (error) {
      setResult({ ok: false, error: String(error) });
    } finally {
      setLoading(null);
    }
  }

  return (
    <main>
      <h1>moneyResearch Demo 测试台</h1>
      <p className="subtitle">
        统一调用 <code>demo/</code> 下各平台 Python 脚本（闲鱼、网盘、小红书、B 站会员购等）。
      </p>

      <div className="tabs">
        <button className={tab === "xianyu" ? "tab active" : "tab"} onClick={() => setTab("xianyu")}>
          闲鱼
        </button>
        <button className={tab === "baidu-pan" ? "tab active" : "tab"} onClick={() => setTab("baidu-pan")}>
          百度网盘
        </button>
        <button className={tab === "quark-pan" ? "tab active" : "tab"} onClick={() => setTab("quark-pan")}>
          夸克网盘
        </button>
        <button className={tab === "xiaohongshu" ? "tab active" : "tab"} onClick={() => setTab("xiaohongshu")}>
          小红书
        </button>
        <button className={tab === "bilibili-mall" ? "tab active" : "tab"} onClick={() => setTab("bilibili-mall")}>
          B站会员购
        </button>
      </div>

      {tab === "xianyu" ? (
        <div className="grid">
          <section className="card">
            <h2>
              01 Cookie 登录 <span className="badge">xianyu/01_cookie_login.py</span>
            </h2>
            <label>Cookie（留空读 demo/xianyu/data/cookies.json）</label>
            <textarea value={xyCookie} onChange={(e) => setXyCookie(e.target.value)} placeholder="cookie2=...; unb=..." />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("xy-cookie", () =>
                    callApi("/api/xianyu/cookie-login", { cookie: xyCookie || undefined, refresh: true, save: true }),
                  )
                }
              >
                检测并刷新 Token
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              02 签名 <span className="badge">xianyu/02_sign.py</span>
            </h2>
            <label>Token</label>
            <input value={token} onChange={(e) => setToken(e.target.value)} />
            <label>data JSON</label>
            <textarea value={signData} onChange={(e) => setSignData(e.target.value)} />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("xy-sign", () =>
                    callApi("/api/xianyu/sign", { token: token || undefined, data: signData }),
                  )
                }
              >
                生成签名
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              03 商品文案 <span className="badge">xianyu/03_copywriting.py</span>
            </h2>
            <label>商品名称</label>
            <input value={productName} onChange={(e) => setProductName(e.target.value)} />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("xy-copy", () =>
                    callApi("/api/xianyu/copywriting", {
                      name: productName,
                      condition,
                      price: Number(price),
                      originalPrice: Number(originalPrice),
                    }),
                  )
                }
              >
                生成文案
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              04 上架 <span className="badge">xianyu/04_publish_item.py</span>
            </h2>
            <label>
              <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} /> dry-run
            </label>
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("xy-publish", () =>
                    callApi("/api/xianyu/publish", {
                      cookie: xyCookie || undefined,
                      name: productName,
                      price: Number(price),
                      dryRun,
                      saveCookie: true,
                    }),
                  )
                }
              >
                {dryRun ? "模拟上架" : "真实上架"}
              </button>
            </div>
          </section>

          <section className="card" style={{ gridColumn: "1 / -1" }}>
            <h2>
              05 发货 <span className="badge">xianyu/05_shipping.py</span>
            </h2>
            <select value={shippingMode} onChange={(e) => setShippingMode(e.target.value)}>
              <option value="包邮">包邮</option>
              <option value="按距离计费">按距离计费</option>
              <option value="一口价">一口价</option>
              <option value="无需邮寄">无需邮寄</option>
            </select>
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("xy-ship", () =>
                    callApi("/api/xianyu/shipping", {
                      mode: shippingMode,
                      price: Number(price),
                      title: productName,
                    }),
                  )
                }
              >
                生成发货配置
              </button>
            </div>
          </section>
        </div>
      ) : tab === "baidu-pan" ? (
        <div className="grid">
          <section className="card">
            <h2>
              01 Cookie 登录 <span className="badge">baidu-pan/01_cookie_login.py</span>
            </h2>
            <label>Cookie（留空读 demo/baidu-pan/data/cookies.json）</label>
            <textarea value={bdCookie} onChange={(e) => setBdCookie(e.target.value)} placeholder="BDUSS=...; STOKEN=..." />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("bd-cookie", () =>
                    callApi("/api/baidu-pan/cookie-login", { cookie: bdCookie || undefined, save: true }),
                  )
                }
              >
                检测登录 & bdstoken
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              02 解析分享 <span className="badge">baidu-pan/02_parse_share_link.py</span>
            </h2>
            <label>分享链接</label>
            <input value={bdShareUrl} onChange={(e) => setBdShareUrl(e.target.value)} />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("bd-parse", () =>
                    callApi("/api/baidu-pan/parse-share", {
                      url: bdShareUrl,
                      cookie: bdCookie || undefined,
                    }),
                  )
                }
              >
                解析链接
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              03 验证提取码 <span className="badge">baidu-pan/03_verify_extract_code.py</span>
            </h2>
            <label>提取码</label>
            <input value={bdSharePwd} onChange={(e) => setBdSharePwd(e.target.value)} />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("bd-verify", () =>
                    callApi("/api/baidu-pan/verify-pwd", {
                      url: bdShareUrl,
                      pwd: bdSharePwd,
                      cookie: bdCookie || undefined,
                    }),
                  )
                }
              >
                验证提取码
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              04 转存 <span className="badge">baidu-pan/04_transfer_save.py</span>
            </h2>
            <label>保存目录</label>
            <input value={bdSavePath} onChange={(e) => setBdSavePath(e.target.value)} />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("bd-transfer", () =>
                    callApi("/api/baidu-pan/transfer", {
                      url: bdShareUrl,
                      pwd: bdSharePwd,
                      path: bdSavePath,
                      cookie: bdCookie || undefined,
                    }),
                  )
                }
              >
                转存到网盘
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              05 创建分享 <span className="badge">baidu-pan/05_create_share.py</span>
            </h2>
            <label>新分享提取码</label>
            <input value={bdNewSharePwd} onChange={(e) => setBdNewSharePwd(e.target.value)} />
            <label>按文件名搜索 fs_id</label>
            <input placeholder="转存后的文件名关键词" id="bd-search" />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() => {
                  const search = (document.getElementById("bd-search") as HTMLInputElement)?.value;
                  run("bd-share", () =>
                    callApi("/api/baidu-pan/create-share", {
                      search,
                      pwd: bdNewSharePwd,
                      cookie: bdCookie || undefined,
                    }),
                  );
                }}
              >
                生成分享链接
              </button>
            </div>
          </section>

          <section className="card" style={{ gridColumn: "1 / -1" }}>
            <h2>
              06 全流程 <span className="badge">baidu-pan/06_pipeline.py</span>
            </h2>
            <p className="hint">分享链接 → 转存 → 自动生成新分享</p>
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("bd-pipeline", () =>
                    callApi("/api/baidu-pan/pipeline", {
                      url: bdShareUrl,
                      pwd: bdSharePwd,
                      path: bdSavePath,
                      sharePwd: bdNewSharePwd,
                      cookie: bdCookie || undefined,
                    }),
                  )
                }
              >
                一键转存并分享
              </button>
            </div>
          </section>
        </div>
      ) : tab === "quark-pan" ? (
        <div className="grid">
          <section className="card">
            <h2>
              01 Cookie 登录 <span className="badge">quark-pan/01_cookie_login.py</span>
            </h2>
            <label>Cookie（留空读 demo/quark-pan/data/cookies.json）</label>
            <textarea value={qkCookie} onChange={(e) => setQkCookie(e.target.value)} placeholder="__puus=...; __pus=..." />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("qk-cookie", () =>
                    callApi("/api/quark-pan/cookie-login", { cookie: qkCookie || undefined, save: true }),
                  )
                }
              >
                检测登录
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              02 解析分享 <span className="badge">quark-pan/02_parse_share_link.py</span>
            </h2>
            <label>分享链接</label>
            <input value={qkShareUrl} onChange={(e) => setQkShareUrl(e.target.value)} />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("qk-parse", () =>
                    callApi("/api/quark-pan/parse-share", {
                      url: qkShareUrl,
                      cookie: qkCookie || undefined,
                    }),
                  )
                }
              >
                解析链接
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              03 验证提取码 <span className="badge">quark-pan/03_verify_extract_code.py</span>
            </h2>
            <label>提取码</label>
            <input value={qkSharePwd} onChange={(e) => setQkSharePwd(e.target.value)} />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("qk-verify", () =>
                    callApi("/api/quark-pan/verify-pwd", {
                      url: qkShareUrl,
                      pwd: qkSharePwd,
                      cookie: qkCookie || undefined,
                    }),
                  )
                }
              >
                验证提取码
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              04 转存 <span className="badge">quark-pan/04_transfer_save.py</span>
            </h2>
            <label>保存目录</label>
            <input value={qkSavePath} onChange={(e) => setQkSavePath(e.target.value)} />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("qk-transfer", () =>
                    callApi("/api/quark-pan/transfer", {
                      url: qkShareUrl,
                      pwd: qkSharePwd,
                      path: qkSavePath,
                      cookie: qkCookie || undefined,
                    }),
                  )
                }
              >
                转存到网盘
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              05 创建分享 <span className="badge">quark-pan/05_create_share.py</span>
            </h2>
            <label>新分享提取码</label>
            <input value={qkNewSharePwd} onChange={(e) => setQkNewSharePwd(e.target.value)} />
            <label>按文件名搜索 fid</label>
            <input placeholder="转存后的文件名关键词" id="qk-search" />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() => {
                  const searchName = (document.getElementById("qk-search") as HTMLInputElement)?.value;
                  run("qk-share", () =>
                    callApi("/api/quark-pan/create-share", {
                      searchName,
                      pwd: qkNewSharePwd,
                      cookie: qkCookie || undefined,
                    }),
                  );
                }}
              >
                生成分享链接
              </button>
            </div>
          </section>

          <section className="card" style={{ gridColumn: "1 / -1" }}>
            <h2>
              06 全流程 <span className="badge">quark-pan/06_pipeline.py</span>
            </h2>
            <p className="hint">分享链接 → 转存 → 自动生成新分享</p>
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("qk-pipeline", () =>
                    callApi("/api/quark-pan/pipeline", {
                      url: qkShareUrl,
                      pwd: qkSharePwd,
                      path: qkSavePath,
                      sharePwd: qkNewSharePwd,
                      cookie: qkCookie || undefined,
                    }),
                  )
                }
              >
                一键转存并分享
              </button>
            </div>
          </section>
        </div>
      ) : tab === "xiaohongshu" ? (
        <div className="grid">
          <section className="card">
            <h2>
              01 Cookie 登录 <span className="badge">xiaohongshu/01_cookie_login.py</span>
            </h2>
            <label>Cookie（留空读 demo/xiaohongshu/data/cookies.json）</label>
            <textarea
              value={xhsCookie}
              onChange={(e) => setXhsCookie(e.target.value)}
              placeholder="a1=...; web_session=...; webId=..."
            />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("xhs-cookie", () =>
                    callApi("/api/xiaohongshu/cookie-login", { cookie: xhsCookie || undefined, save: true }),
                  )
                }
              >
                检测登录
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              02 请求签名 <span className="badge">xiaohongshu/02_sign.py</span>
            </h2>
            <label>API URI</label>
            <input value={xhsSignUri} onChange={(e) => setXhsSignUri(e.target.value)} />
            <label>Body JSON</label>
            <textarea value={xhsSignData} onChange={(e) => setXhsSignData(e.target.value)} rows={3} />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("xhs-sign", () =>
                    callApi("/api/xiaohongshu/sign", {
                      uri: xhsSignUri,
                      data: xhsSignData,
                      cookie: xhsCookie || undefined,
                    }),
                  )
                }
              >
                生成 x-s / x-t
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              03 文案生成 <span className="badge">xiaohongshu/03_copywriting.py</span>
            </h2>
            <label>主题</label>
            <input value={xhsTopic} onChange={(e) => setXhsTopic(e.target.value)} />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("xhs-copy", () => callApi("/api/xiaohongshu/copywriting", { topic: xhsTopic }))
                }
              >
                生成标题与正文
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              04 图片上传 <span className="badge">xiaohongshu/04_upload_image.py</span>
            </h2>
            <label>图片路径（相对 demo/xiaohongshu/）</label>
            <input value={xhsImage} onChange={(e) => setXhsImage(e.target.value)} />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("xhs-upload", () =>
                    callApi("/api/xiaohongshu/upload-image", {
                      image: xhsImage,
                      cookie: xhsCookie || undefined,
                    }),
                  )
                }
              >
                上传到素材库
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              05 发布笔记 <span className="badge">xiaohongshu/05_publish_note.py</span>
            </h2>
            <label>标题（留空用文案生成）</label>
            <input value={xhsTitle} onChange={(e) => setXhsTitle(e.target.value)} placeholder="≤20字" />
            <label>正文</label>
            <textarea value={xhsDesc} onChange={(e) => setXhsDesc(e.target.value)} rows={4} />
            <label className="checkbox">
              <input type="checkbox" checked={xhsDryRun} onChange={(e) => setXhsDryRun(e.target.checked)} />
              dry-run（仅预览，不真发）
            </label>
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("xhs-publish", () =>
                    callApi("/api/xiaohongshu/publish", {
                      topic: xhsTopic,
                      title: xhsTitle || undefined,
                      desc: xhsDesc || undefined,
                      images: [xhsImage],
                      dryRun: xhsDryRun,
                      cookie: xhsCookie || undefined,
                    }),
                  )
                }
              >
                发布图文笔记
              </button>
            </div>
          </section>

          <section className="card" style={{ gridColumn: "1 / -1" }}>
            <h2>
              06 全流程 <span className="badge">xiaohongshu/06_pipeline.py</span>
            </h2>
            <p className="hint">文案 → 上传 → 发布（默认 dry-run）</p>
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("xhs-pipeline", () =>
                    callApi("/api/xiaohongshu/pipeline", {
                      topic: xhsTopic,
                      title: xhsTitle || undefined,
                      desc: xhsDesc || undefined,
                      images: [xhsImage],
                      dryRun: xhsDryRun,
                      cookie: xhsCookie || undefined,
                    }),
                  )
                }
              >
                一键发帖流程
              </button>
            </div>
          </section>
        </div>
      ) : (
        <div className="grid">
          <section className="card">
            <h2>
              01 Cookie 登录 <span className="badge">bilibili-mall/01_cookie_login.py</span>
            </h2>
            <label>Cookie（留空读 demo/bilibili-mall/data/cookies.json）</label>
            <textarea
              value={blCookie}
              onChange={(e) => setBlCookie(e.target.value)}
              placeholder="SESSDATA=...; bili_jct=...; DedeUserID=..."
            />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("bl-cookie", () =>
                    callApi("/api/bilibili-mall/cookie-login", { cookie: blCookie || undefined, save: true }),
                  )
                }
              >
                检测登录
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              02 bili_ticket <span className="badge">bilibili-mall/02_bili_ticket.py</span>
            </h2>
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("bl-ticket", () =>
                    callApi("/api/bilibili-mall/bili-ticket", { cookie: blCookie || undefined }),
                  )
                }
              >
                生成 bili_ticket
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              03 解析链接 <span className="badge">bilibili-mall/03_parse_link.py</span>
            </h2>
            <label>票务/市集链接</label>
            <input value={blUrl} onChange={(e) => setBlUrl(e.target.value)} />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() => run("bl-parse", () => callApi("/api/bilibili-mall/parse-link", { url: blUrl }))}
              >
                解析链接
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              04 票档/市集 <span className="badge">bilibili-mall/04_list_inventory.py</span>
            </h2>
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("bl-list", () =>
                    callApi("/api/bilibili-mall/list-inventory", { url: blUrl, cookie: blCookie || undefined }),
                  )
                }
              >
                查询场次票档
              </button>
              <button
                disabled={loading !== null}
                onClick={() => run("bl-market", () => callApi("/api/bilibili-mall/list-inventory", { market: true }))}
              >
                市集列表
              </button>
            </div>
          </section>

          <section className="card">
            <h2>
              05 预下单 <span className="badge">bilibili-mall/05_prepare_order.py</span>
            </h2>
            <label>screen_id</label>
            <input value={blScreenId} onChange={(e) => setBlScreenId(e.target.value)} placeholder="从 04 结果复制" />
            <label>sku_id</label>
            <input value={blSkuId} onChange={(e) => setBlSkuId(e.target.value)} placeholder="从 04 结果复制" />
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() => {
                  if (!blScreenId || !blSkuId) return;
                  run("bl-prepare", () =>
                    callApi("/api/bilibili-mall/prepare-order", {
                      url: blUrl,
                      screenId: Number(blScreenId),
                      skuId: Number(blSkuId),
                      cookie: blCookie || undefined,
                    }),
                  );
                }}
              >
                预下单 prepare
              </button>
            </div>
          </section>

          <section className="card" style={{ gridColumn: "1 / -1" }}>
            <h2>
              06 全流程 <span className="badge">bilibili-mall/06_pipeline.py</span>
            </h2>
            <label className="checkbox">
              <input type="checkbox" checked={blDryRun} onChange={(e) => setBlDryRun(e.target.checked)} />
              dry-run（默认仅预览，不调用 prepare）
            </label>
            <div className="row">
              <button
                disabled={loading !== null}
                onClick={() =>
                  run("bl-pipeline", () =>
                    callApi("/api/bilibili-mall/pipeline", {
                      url: blUrl,
                      screenId: blScreenId ? Number(blScreenId) : undefined,
                      skuId: blSkuId ? Number(blSkuId) : undefined,
                      dryRun: blDryRun,
                      cookie: blCookie || undefined,
                    }),
                  )
                }
              >
                一键购票流程
              </button>
            </div>
          </section>
        </div>
      )}

      <section className="result">
        <h3>
          执行结果
          {loading && <span className="status">运行中: {loading}...</span>}
          {!loading && result && (
            <span className={`status ${result.ok ? "ok" : "err"}`}>
              {result.ok ? "成功" : `失败 (code ${result.code ?? "?"})`}
            </span>
          )}
        </h3>
        <pre>{result ? JSON.stringify(result.data ?? result, null, 2) : "选择主题后点击按钮测试"}</pre>
        {result?.stderr ? <pre style={{ color: "#ff9b9b", marginTop: "0.75rem" }}>{result.stderr}</pre> : null}
      </section>
    </main>
  );
}
