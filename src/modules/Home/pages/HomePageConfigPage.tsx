'use client';

import 'animal-island-ui/style';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Divider,
  Input,
  Loading,
  Radio,
  Tabs,
  Title,
} from 'animal-island-ui';
import { DEFAULT_HOME_PAGE_CONFIG } from '../defaultConfig';
import {
  fetchHomePageConfig,
  saveHomePageConfig,
} from '../services/homePageConfigApi';
import type { HomePageConfig } from '../types';
import './home-config-page.css';

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

function parseTagsInput(value: string): string[] {
  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatTagsInput(tags: string[]): string {
  return tags.join(', ');
}

export function HomePageConfigPage() {
  const router = useRouter();
  const [config, setConfig] = useState<HomePageConfig>(DEFAULT_HOME_PAGE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [webhookConfigured, setWebhookConfigured] = useState(false);
  const [secretConfigured, setSecretConfigured] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await fetchHomePageConfig();
      const webhook = data.contactConfig.feishuWebhookUrl;
      const secret = data.contactConfig.feishuSignSecret;
      const webhookMasked = webhook?.includes('****') ?? false;
      const secretMasked = secret?.includes('****') ?? false;

      setWebhookConfigured(Boolean(webhook));
      setSecretConfigured(Boolean(secret));
      setConfig({
        ...data,
        contactConfig: {
          ...data.contactConfig,
          feishuWebhookUrl: webhookMasked ? '' : (webhook || ''),
          feishuSignSecret: secretMasked ? '' : (secret || ''),
        },
      });
    } catch (error) {
      setConfig(DEFAULT_HOME_PAGE_CONFIG);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '加载失败，已使用默认配置',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const data = await saveHomePageConfig(config);
      const webhook = data.contactConfig.feishuWebhookUrl;
      const secret = data.contactConfig.feishuSignSecret;
      const webhookMasked = webhook?.includes('****') ?? false;
      const secretMasked = secret?.includes('****') ?? false;

      setWebhookConfigured(Boolean(webhook));
      setSecretConfigured(Boolean(secret));
      setConfig({
        ...data,
        contactConfig: {
          ...data.contactConfig,
          feishuWebhookUrl: webhookMasked ? '' : (webhook || ''),
          feishuSignSecret: secretMasked ? '' : (secret || ''),
        },
      });
      setMessage({ type: 'success', text: '配置已保存，首页将读取最新内容。' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '保存失败',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_HOME_PAGE_CONFIG);
    setMessage({ type: 'success', text: '已恢复为默认配置（尚未保存）。' });
  };

  if (loading) {
    return (
      <div className="home-config-page home-config-page--loading">
        <Loading active />
      </div>
    );
  }

  return (
    <div className="home-config-page">
      <div className="home-config-page__inner">
        <header className="home-config-page__header">
          <div>
            <Title size="middle" color="app-teal">
              首页配置
            </Title>
            <p style={{ margin: '0.5rem 0 0', color: '#8a7b66', fontWeight: 500 }}>
              编辑 Hero、导航、经历、技能球与项目展示，保存后写入数据库
            </p>
          </div>
          <div className="home-config-page__actions">
            <Button type="default" onClick={() => router.push('/')}>
              返回首页
            </Button>
            <Button type="dashed" onClick={handleReset}>
              恢复默认
            </Button>
            <Button type="primary" loading={saving} onClick={handleSave}>
              保存配置
            </Button>
          </div>
        </header>

        {message ? (
          <p
            className={`home-config-page__message ${
              message.type === 'success' ? 'is-success' : 'is-error'
            }`}
            role="status"
          >
            {message.text}
          </p>
        ) : null}

        <Card>
          <Tabs
            defaultActiveKey="hero"
            items={[
              {
                key: 'hero',
                label: '首页 Hero',
                children: (
                  <div className="home-config-page__panel">
                    <label className="home-config-page__field">
                      <span>主标题</span>
                      <Input
                        shadow
                        value={config.homeConfig.title}
                        onChange={(event) =>
                          setConfig((prev) => ({
                            ...prev,
                            homeConfig: {
                              ...prev.homeConfig,
                              title: event.target.value,
                            },
                          }))
                        }
                      />
                    </label>
                    <label className="home-config-page__field">
                      <span>副标题</span>
                      <Input
                        shadow
                        value={config.homeConfig.subtitle}
                        onChange={(event) =>
                          setConfig((prev) => ({
                            ...prev,
                            homeConfig: {
                              ...prev.homeConfig,
                              subtitle: event.target.value,
                            },
                          }))
                        }
                      />
                    </label>
                    <label className="home-config-page__field">
                      <span>形象图片 URL</span>
                      <Input
                        shadow
                        value={config.homeConfig.imageSrc}
                        onChange={(event) =>
                          setConfig((prev) => ({
                            ...prev,
                            homeConfig: {
                              ...prev.homeConfig,
                              imageSrc: event.target.value,
                            },
                          }))
                        }
                      />
                    </label>
                    {config.homeConfig.buttons.map((button, index) => (
                      <Card key={`${button.link}-${index}`} type="dashed">
                        <div className="home-config-page__row home-config-page__row--2">
                          <label className="home-config-page__field">
                            <span>按钮文字 {index + 1}</span>
                            <Input
                              shadow
                              value={button.text}
                              onChange={(event) =>
                                setConfig((prev) => {
                                  const buttons = [...prev.homeConfig.buttons];
                                  buttons[index] = {
                                    ...buttons[index],
                                    text: event.target.value,
                                  };
                                  return {
                                    ...prev,
                                    homeConfig: { ...prev.homeConfig, buttons },
                                  };
                                })
                              }
                            />
                          </label>
                          <label className="home-config-page__field">
                            <span>跳转链接</span>
                            <Input
                              shadow
                              value={button.link}
                              onChange={(event) =>
                                setConfig((prev) => {
                                  const buttons = [...prev.homeConfig.buttons];
                                  buttons[index] = {
                                    ...buttons[index],
                                    link: event.target.value,
                                  };
                                  return {
                                    ...prev,
                                    homeConfig: { ...prev.homeConfig, buttons },
                                  };
                                })
                              }
                            />
                          </label>
                        </div>
                      </Card>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          homeConfig: {
                            ...prev.homeConfig,
                            buttons: [
                              ...prev.homeConfig.buttons,
                              { text: '新按钮', link: '#contact' },
                            ],
                          },
                        }))
                      }
                    >
                      添加按钮
                    </Button>
                  </div>
                ),
              },
              {
                key: 'nav',
                label: '导航',
                children: (
                  <div className="home-config-page__panel">
                    <label className="home-config-page__field">
                      <span>头像 URL</span>
                      <Input
                        shadow
                        value={config.navConfig.avatar}
                        onChange={(event) =>
                          setConfig((prev) => ({
                            ...prev,
                            navConfig: {
                              ...prev.navConfig,
                              avatar: event.target.value,
                            },
                          }))
                        }
                      />
                    </label>
                    <div className="home-config-page__field">
                      <span>导航方向</span>
                      <Radio
                        value={config.navConfig.direction}
                        onChange={(value) =>
                          setConfig((prev) => ({
                            ...prev,
                            navConfig: {
                              ...prev.navConfig,
                              direction: value as 'vertical' | 'horizontal',
                            },
                          }))
                        }
                        options={[
                          { label: '垂直侧栏', value: 'vertical' },
                          { label: '水平顶栏', value: 'horizontal' },
                        ]}
                      />
                    </div>
                    <Divider type="line-brown" />
                    {config.navConfig.items.map((item, index) => (
                      <Card key={item.id} className="home-config-page__item-card">
                        <div className="home-config-page__item-head">
                          <h3 className="home-config-page__item-title">
                            导航项 {index + 1}
                          </h3>
                          <Button
                            type="text"
                            danger
                            onClick={() =>
                              setConfig((prev) => ({
                                ...prev,
                                navConfig: {
                                  ...prev.navConfig,
                                  items: prev.navConfig.items.filter(
                                    (_, i) => i !== index,
                                  ),
                                },
                              }))
                            }
                          >
                            删除
                          </Button>
                        </div>
                        <div className="home-config-page__row home-config-page__row--3">
                          <label className="home-config-page__field">
                            <span>ID</span>
                            <Input
                              shadow
                              value={item.id}
                              onChange={(event) =>
                                setConfig((prev) => {
                                  const items = [...prev.navConfig.items];
                                  items[index] = {
                                    ...items[index],
                                    id: event.target.value,
                                  };
                                  return {
                                    ...prev,
                                    navConfig: { ...prev.navConfig, items },
                                  };
                                })
                              }
                            />
                          </label>
                          <label className="home-config-page__field">
                            <span>标签</span>
                            <Input
                              shadow
                              value={item.label}
                              onChange={(event) =>
                                setConfig((prev) => {
                                  const items = [...prev.navConfig.items];
                                  items[index] = {
                                    ...items[index],
                                    label: event.target.value,
                                  };
                                  return {
                                    ...prev,
                                    navConfig: { ...prev.navConfig, items },
                                  };
                                })
                              }
                            />
                          </label>
                          <label className="home-config-page__field">
                            <span>链接</span>
                            <Input
                              shadow
                              value={item.href}
                              onChange={(event) =>
                                setConfig((prev) => {
                                  const items = [...prev.navConfig.items];
                                  items[index] = {
                                    ...items[index],
                                    href: event.target.value,
                                  };
                                  return {
                                    ...prev,
                                    navConfig: { ...prev.navConfig, items },
                                  };
                                })
                              }
                            />
                          </label>
                        </div>
                      </Card>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          navConfig: {
                            ...prev.navConfig,
                            items: [
                              ...prev.navConfig.items,
                              {
                                id: createId('nav'),
                                label: '新导航',
                                href: '#home',
                              },
                            ],
                          },
                        }))
                      }
                    >
                      添加导航项
                    </Button>
                  </div>
                ),
              },
              {
                key: 'timeline',
                label: '经历',
                children: (
                  <div className="home-config-page__panel">
                    {config.timelineConfig.items.map((item, index) => (
                      <Card key={item.id} className="home-config-page__item-card">
                        <div className="home-config-page__item-head">
                          <h3 className="home-config-page__item-title">
                            经历 {index + 1}
                          </h3>
                          <Button
                            type="text"
                            danger
                            onClick={() =>
                              setConfig((prev) => ({
                                ...prev,
                                timelineConfig: {
                                  items: prev.timelineConfig.items.filter(
                                    (_, i) => i !== index,
                                  ),
                                },
                              }))
                            }
                          >
                            删除
                          </Button>
                        </div>
                        <div className="home-config-page__row home-config-page__row--2">
                          <label className="home-config-page__field">
                            <span>日期</span>
                            <Input
                              shadow
                              value={item.date}
                              onChange={(event) =>
                                setConfig((prev) => {
                                  const items = [...prev.timelineConfig.items];
                                  items[index] = {
                                    ...items[index],
                                    date: event.target.value,
                                  };
                                  return {
                                    ...prev,
                                    timelineConfig: { items },
                                  };
                                })
                              }
                            />
                          </label>
                          <label className="home-config-page__field">
                            <span>标题</span>
                            <Input
                              shadow
                              value={item.title}
                              onChange={(event) =>
                                setConfig((prev) => {
                                  const items = [...prev.timelineConfig.items];
                                  items[index] = {
                                    ...items[index],
                                    title: event.target.value,
                                  };
                                  return {
                                    ...prev,
                                    timelineConfig: { items },
                                  };
                                })
                              }
                            />
                          </label>
                        </div>
                        <label className="home-config-page__field">
                          <span>描述</span>
                          <Input
                            shadow
                            value={item.description}
                            onChange={(event) =>
                              setConfig((prev) => {
                                const items = [...prev.timelineConfig.items];
                                items[index] = {
                                  ...items[index],
                                  description: event.target.value,
                                };
                                return {
                                  ...prev,
                                  timelineConfig: { items },
                                };
                              })
                            }
                          />
                        </label>
                        <label className="home-config-page__field">
                          <span>标签（逗号分隔）</span>
                          <input
                            className="home-config-page__tags-input"
                            value={formatTagsInput(item.tags ?? [])}
                            onChange={(event) =>
                              setConfig((prev) => {
                                const items = [...prev.timelineConfig.items];
                                items[index] = {
                                  ...items[index],
                                  tags: parseTagsInput(event.target.value),
                                };
                                return {
                                  ...prev,
                                  timelineConfig: { items },
                                };
                              })
                            }
                          />
                        </label>
                      </Card>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          timelineConfig: {
                            items: [
                              ...prev.timelineConfig.items,
                              {
                                id: createId('timeline'),
                                date: '2026.01',
                                title: '新经历',
                                description: '填写经历描述',
                                tags: [],
                              },
                            ],
                          },
                        }))
                      }
                    >
                      添加经历
                    </Button>
                  </div>
                ),
              },
              {
                key: 'balls',
                label: '技能球',
                children: (
                  <div className="home-config-page__panel">
                    <div className="home-config-page__row home-config-page__row--2">
                      <label className="home-config-page__field">
                        <span>画布宽度</span>
                        <Input
                          shadow
                          value={String(config.collisionBallsConfig.width)}
                          onChange={(event) =>
                            setConfig((prev) => ({
                              ...prev,
                              collisionBallsConfig: {
                                ...prev.collisionBallsConfig,
                                width: Number(event.target.value) || 800,
                              },
                            }))
                          }
                        />
                      </label>
                      <label className="home-config-page__field">
                        <span>画布高度</span>
                        <Input
                          shadow
                          value={String(config.collisionBallsConfig.height)}
                          onChange={(event) =>
                            setConfig((prev) => ({
                              ...prev,
                              collisionBallsConfig: {
                                ...prev.collisionBallsConfig,
                                height: Number(event.target.value) || 600,
                              },
                            }))
                          }
                        />
                      </label>
                    </div>
                    {config.collisionBallsConfig.balls.map((ball, index) => (
                      <Card key={ball.id} className="home-config-page__item-card">
                        <div className="home-config-page__item-head">
                          <h3 className="home-config-page__item-title">
                            技能球 {index + 1}
                          </h3>
                          <Button
                            type="text"
                            danger
                            onClick={() =>
                              setConfig((prev) => ({
                                ...prev,
                                collisionBallsConfig: {
                                  ...prev.collisionBallsConfig,
                                  balls: prev.collisionBallsConfig.balls.filter(
                                    (_, i) => i !== index,
                                  ),
                                },
                              }))
                            }
                          >
                            删除
                          </Button>
                        </div>
                        <div className="home-config-page__row home-config-page__row--3">
                          <label className="home-config-page__field">
                            <span>名称</span>
                            <Input
                              shadow
                              value={ball.label}
                              onChange={(event) =>
                                setConfig((prev) => {
                                  const balls = [...prev.collisionBallsConfig.balls];
                                  balls[index] = {
                                    ...balls[index],
                                    label: event.target.value,
                                  };
                                  return {
                                    ...prev,
                                    collisionBallsConfig: {
                                      ...prev.collisionBallsConfig,
                                      balls,
                                    },
                                  };
                                })
                              }
                            />
                          </label>
                          <label className="home-config-page__field">
                            <span>颜色</span>
                            <Input
                              shadow
                              value={ball.color}
                              onChange={(event) =>
                                setConfig((prev) => {
                                  const balls = [...prev.collisionBallsConfig.balls];
                                  balls[index] = {
                                    ...balls[index],
                                    color: event.target.value,
                                  };
                                  return {
                                    ...prev,
                                    collisionBallsConfig: {
                                      ...prev.collisionBallsConfig,
                                      balls,
                                    },
                                  };
                                })
                              }
                            />
                          </label>
                          <label className="home-config-page__field">
                            <span>大小</span>
                            <Input
                              shadow
                              value={String(ball.size)}
                              onChange={(event) =>
                                setConfig((prev) => {
                                  const balls = [...prev.collisionBallsConfig.balls];
                                  balls[index] = {
                                    ...balls[index],
                                    size: Number(event.target.value) || 30,
                                  };
                                  return {
                                    ...prev,
                                    collisionBallsConfig: {
                                      ...prev.collisionBallsConfig,
                                      balls,
                                    },
                                  };
                                })
                              }
                            />
                          </label>
                        </div>
                      </Card>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          collisionBallsConfig: {
                            ...prev.collisionBallsConfig,
                            balls: [
                              ...prev.collisionBallsConfig.balls,
                              {
                                id: createId('ball'),
                                label: '新技能',
                                color: '#19c8b9',
                                size: 30,
                              },
                            ],
                          },
                        }))
                      }
                    >
                      添加技能球
                    </Button>
                  </div>
                ),
              },
              {
                key: 'contact',
                label: '联系通知',
                children: (
                  <div className="home-config-page__panel">
                    <p style={{ margin: 0, color: '#8a7b66', fontWeight: 500 }}>
                      首页「联系我」表单提交后，将通过飞书或 QQ 推送通知。至少配置其一。
                    </p>
                    <label className="home-config-page__field">
                      <span>飞书 Webhook URL</span>
                      <div className="home-config-page__secret-row">
                        <Input
                          shadow
                          type={showWebhook ? 'text' : 'password'}
                          value={config.contactConfig.feishuWebhookUrl ?? ''}
                          placeholder={
                            webhookConfigured
                              ? '已配置，留空则不修改'
                              : 'https://open.feishu.cn/open-apis/bot/v2/hook/...'
                          }
                          onChange={(event) =>
                            setConfig((prev) => ({
                              ...prev,
                              contactConfig: {
                                ...prev.contactConfig,
                                feishuWebhookUrl: event.target.value,
                              },
                            }))
                          }
                        />
                        <Button type="default" onClick={() => setShowWebhook((value) => !value)}>
                          {showWebhook ? '隐藏' : '显示'}
                        </Button>
                      </div>
                    </label>
                    <label className="home-config-page__field">
                      <span>飞书签名密钥（可选）</span>
                      <div className="home-config-page__secret-row">
                        <Input
                          shadow
                          type={showSecret ? 'text' : 'password'}
                          value={config.contactConfig.feishuSignSecret ?? ''}
                          placeholder={secretConfigured ? '已配置，留空则不修改' : '可选'}
                          onChange={(event) =>
                            setConfig((prev) => ({
                              ...prev,
                              contactConfig: {
                                ...prev.contactConfig,
                                feishuSignSecret: event.target.value,
                              },
                            }))
                          }
                        />
                        <Button type="default" onClick={() => setShowSecret((value) => !value)}>
                          {showSecret ? '隐藏' : '显示'}
                        </Button>
                      </div>
                    </label>
                    <div className="home-config-page__row home-config-page__row--2">
                      <label className="home-config-page__field">
                        <span>QQ 私聊用户 ID（可选）</span>
                        <Input
                          shadow
                          value={
                            config.contactConfig.qqUserId
                              ? String(config.contactConfig.qqUserId)
                              : ''
                          }
                          placeholder="123456789"
                          onChange={(event) =>
                            setConfig((prev) => ({
                              ...prev,
                              contactConfig: {
                                ...prev.contactConfig,
                                qqUserId: event.target.value
                                  ? Number(event.target.value) || null
                                  : null,
                              },
                            }))
                          }
                        />
                      </label>
                      <label className="home-config-page__field">
                        <span>QQ 群 ID（可选）</span>
                        <Input
                          shadow
                          value={
                            config.contactConfig.qqGroupId
                              ? String(config.contactConfig.qqGroupId)
                              : ''
                          }
                          placeholder="987654321"
                          onChange={(event) =>
                            setConfig((prev) => ({
                              ...prev,
                              contactConfig: {
                                ...prev.contactConfig,
                                qqGroupId: event.target.value
                                  ? Number(event.target.value) || null
                                  : null,
                              },
                            }))
                          }
                        />
                      </label>
                    </div>
                    <p style={{ margin: 0, color: '#8a7b66', fontSize: '0.9rem' }}>
                      NapCat 地址仍通过环境变量 NAPCAT_HTTP_URL / NAPCAT_TOKEN 配置。
                    </p>
                  </div>
                ),
              },
              {
                key: 'projects',
                label: '项目',
                children: (
                  <div className="home-config-page__panel">
                    {config.projectsConfig.projects.map((project, index) => (
                      <Card key={project.id} className="home-config-page__item-card">
                        <div className="home-config-page__item-head">
                          <h3 className="home-config-page__item-title">
                            项目 {index + 1}
                          </h3>
                          <Button
                            type="text"
                            danger
                            onClick={() =>
                              setConfig((prev) => ({
                                ...prev,
                                projectsConfig: {
                                  projects: prev.projectsConfig.projects.filter(
                                    (_, i) => i !== index,
                                  ),
                                },
                              }))
                            }
                          >
                            删除
                          </Button>
                        </div>
                        <label className="home-config-page__field">
                          <span>标题</span>
                          <Input
                            shadow
                            value={project.title}
                            onChange={(event) =>
                              setConfig((prev) => {
                                const projects = [...prev.projectsConfig.projects];
                                projects[index] = {
                                  ...projects[index],
                                  title: event.target.value,
                                };
                                return {
                                  ...prev,
                                  projectsConfig: { projects },
                                };
                              })
                            }
                          />
                        </label>
                        <label className="home-config-page__field">
                          <span>描述</span>
                          <Input
                            shadow
                            value={project.description}
                            onChange={(event) =>
                              setConfig((prev) => {
                                const projects = [...prev.projectsConfig.projects];
                                projects[index] = {
                                  ...projects[index],
                                  description: event.target.value,
                                };
                                return {
                                  ...prev,
                                  projectsConfig: { projects },
                                };
                              })
                            }
                          />
                        </label>
                        <div className="home-config-page__row home-config-page__row--2">
                          <label className="home-config-page__field">
                            <span>链接</span>
                            <Input
                              shadow
                              value={project.link ?? ''}
                              onChange={(event) =>
                                setConfig((prev) => {
                                  const projects = [...prev.projectsConfig.projects];
                                  projects[index] = {
                                    ...projects[index],
                                    link: event.target.value,
                                  };
                                  return {
                                    ...prev,
                                    projectsConfig: { projects },
                                  };
                                })
                              }
                            />
                          </label>
                          <label className="home-config-page__field">
                            <span>封面图 URL</span>
                            <Input
                              shadow
                              value={project.image ?? ''}
                              onChange={(event) =>
                                setConfig((prev) => {
                                  const projects = [...prev.projectsConfig.projects];
                                  projects[index] = {
                                    ...projects[index],
                                    image: event.target.value,
                                  };
                                  return {
                                    ...prev,
                                    projectsConfig: { projects },
                                  };
                                })
                              }
                            />
                          </label>
                        </div>
                        <label className="home-config-page__field">
                          <span>标签（逗号分隔）</span>
                          <input
                            className="home-config-page__tags-input"
                            value={formatTagsInput(project.tags)}
                            onChange={(event) =>
                              setConfig((prev) => {
                                const projects = [...prev.projectsConfig.projects];
                                projects[index] = {
                                  ...projects[index],
                                  tags: parseTagsInput(event.target.value),
                                };
                                return {
                                  ...prev,
                                  projectsConfig: { projects },
                                };
                              })
                            }
                          />
                        </label>
                      </Card>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          projectsConfig: {
                            projects: [
                              ...prev.projectsConfig.projects,
                              {
                                id: createId('project'),
                                title: '新项目',
                                description: '填写项目描述',
                                tags: [],
                                link: '',
                              },
                            ],
                          },
                        }))
                      }
                    >
                      添加项目
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
