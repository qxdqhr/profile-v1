'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TicketEvent, TicketSource, TicketStatus } from '@/modules/ticketMonitor/types';

interface TicketApiResponse {
  success: boolean;
  data: TicketEvent[];
  meta: {
    total: number;
    errors: string[];
    fetchedAt: string;
  };
}

interface TicketAccount {
  id: string;
  platform: TicketSource;
  label: string;
  username: string;
  password: string;
  note?: string;
  updatedAt: string;
}

interface TicketAccountFormState {
  platform: TicketSource;
  label: string;
  username: string;
  password: string;
  note: string;
}

interface FollowConditionConfig {
  onSaleStart: boolean;
  endingSoon: boolean;
  endingSoonMinutes: number;
}

interface FollowRuntimeState {
  lastStatus?: TicketStatus;
  lastEndAt?: string;
  notifiedOnSaleKey?: string;
  notifiedEndingSoonKey?: string;
}

interface FollowTicketItem {
  id: string;
  eventId: string;
  source: TicketSource;
  title: string;
  receptionTitle?: string;
  seatInfo?: string;
  eventUrl: string;
  enabled: boolean;
  qqPrivateUserIds: string;
  qqGroupIds: string;
  conditions: FollowConditionConfig;
  runtime?: FollowRuntimeState;
  createdAt: string;
  updatedAt: string;
}

const LOCAL_STORAGE_ACCOUNTS_KEY = 'ticket-monitor-accounts-v1';
const LOCAL_STORAGE_FOLLOW_KEY = 'ticket-monitor-follow-list-v1';

const allSources: TicketSource[] = ['eplus', 'asobistore', 'piapro', 'lawsonticket'];
const allStatuses: Array<{ value: '' | TicketStatus; label: string }> = [
  { value: '', label: '全部状态' },
  { value: 'upcoming', label: '未开票' },
  { value: 'on_sale', label: '售卖中' },
  { value: 'ended', label: '已结束' },
  { value: 'unknown', label: '未知' },
];

const statusLabelMap: Record<TicketStatus, string> = {
  upcoming: '未开票',
  on_sale: '售卖中',
  ended: '已结束',
  unknown: '未知',
};

const sourceLabelMap: Record<TicketSource, string> = {
  eplus: 'eplus',
  asobistore: 'asobistore',
  piapro: 'piapro',
  lawsonticket: 'LawsonTicket',
};

const statusColorMap: Record<TicketStatus, string> = {
  upcoming: 'bg-blue-100 text-blue-800',
  on_sale: 'bg-green-100 text-green-800',
  ended: 'bg-gray-100 text-gray-700',
  unknown: 'bg-yellow-100 text-yellow-800',
};

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function getFallbackCover(event: TicketEvent) {
  const label = sourceLabelMap[event.source].toUpperCase();
  const svg = `
<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675' viewBox='0 0 1200 675'>
<defs>
<linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
<stop offset='0%' stop-color='#111827'/>
<stop offset='100%' stop-color='#1f2937'/>
</linearGradient>
</defs>
<rect width='1200' height='675' fill='url(#g)'/>
<text x='60' y='110' font-size='44' fill='#93c5fd' font-family='Arial, sans-serif'>${label}</text>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getEmptyAccountFormState(platform: TicketSource = 'eplus'): TicketAccountFormState {
  return {
    platform,
    label: '',
    username: '',
    password: '',
    note: '',
  };
}

function parseIdList(raw: string): string[] {
  return raw
    .split(/[,\n，\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function TicketMonitorPage() {
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'' | TicketStatus>('');
  const [sortByEndAtDesc, setSortByEndAtDesc] = useState(false);
  const [selectedSources, setSelectedSources] = useState<TicketSource[]>(allSources);
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [brokenImageIds, setBrokenImageIds] = useState<Record<string, true>>({});
  const [accounts, setAccounts] = useState<TicketAccount[]>([]);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followItems, setFollowItems] = useState<FollowTicketItem[]>([]);
  const [followCheckRunning, setFollowCheckRunning] = useState(false);
  const [followLastCheckAt, setFollowLastCheckAt] = useState('');
  const [followLastError, setFollowLastError] = useState('');
  const [accountForm, setAccountForm] = useState<TicketAccountFormState>(getEmptyAccountFormState());
  const [accountFormError, setAccountFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [fetchedAt, setFetchedAt] = useState('');
  const followCheckLockRef = useRef(false);

  const buildQueryString = useCallback((
    nextQ: string,
    nextStatus: '' | TicketStatus,
    nextSources: TicketSource[],
    nextSortByEndAtDesc: boolean,
  ) => {
    const params = new URLSearchParams();

    if (nextQ.trim()) {
      params.set('q', nextQ.trim());
    }

    nextSources.forEach((source) => {
      params.append('source', source);
    });

    if (nextStatus) {
      params.set('status', nextStatus);
    }
    if (nextSortByEndAtDesc) {
      params.set('sortByEndAtDesc', '1');
    }

    params.set('limit', '50');
    return params.toString();
  }, []);

  const loadEvents = useCallback(async (
    next: {
      q?: string;
      status?: '' | TicketStatus;
      sources?: TicketSource[];
      sortByEndAtDesc?: boolean;
    } = {},
  ) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const requestQ = next.q ?? q;
      const requestStatus = next.status ?? status;
      const requestSources = next.sources ?? selectedSources;
      const requestSortByEndAtDesc = next.sortByEndAtDesc ?? sortByEndAtDesc;
      const queryString = buildQueryString(
        requestQ,
        requestStatus,
        requestSources,
        requestSortByEndAtDesc,
      );

      const response = await fetch(`/api/ticket-monitor/events?${queryString}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`request failed with status ${response.status}`);
      }

      const data = (await response.json()) as TicketApiResponse;
      setEvents(data.data || []);
      setBrokenImageIds({});
      setApiErrors(data.meta?.errors || []);
      setFetchedAt(data.meta?.fetchedAt || '');
    } catch (error) {
      const message = error instanceof Error ? error.message : '加载失败';
      setErrorMessage(message);
      setEvents([]);
      setBrokenImageIds({});
      setApiErrors([]);
      setFetchedAt('');
    } finally {
      setLoading(false);
    }
  }, [buildQueryString, q, selectedSources, sortByEndAtDesc, status]);

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_FOLLOW_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as FollowTicketItem[];
      if (!Array.isArray(parsed)) return;
      const valid = parsed.filter((item) => (
        item
        && typeof item.id === 'string'
        && typeof item.eventId === 'string'
        && allSources.includes(item.source)
      ));
      setFollowItems(valid);
    } catch {
      // ignore invalid localStorage data
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as TicketAccount[];
      if (!Array.isArray(parsed)) return;
      const valid = parsed.filter((item) => (
        item
        && allSources.includes(item.platform)
        && typeof item.label === 'string'
        && typeof item.username === 'string'
        && typeof item.password === 'string'
      ));
      setAccounts(valid);
    } catch {
      // ignore invalid localStorage data
    }
  }, []);

  const saveAccountsToLocalStorage = useCallback((nextAccounts: TicketAccount[]) => {
    setAccounts(nextAccounts);
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(nextAccounts));
  }, []);

  const saveFollowItemsToLocalStorage = useCallback((nextFollowItems: FollowTicketItem[]) => {
    setFollowItems(nextFollowItems);
    localStorage.setItem(LOCAL_STORAGE_FOLLOW_KEY, JSON.stringify(nextFollowItems));
  }, []);

  const addAccount = () => {
    const label = accountForm.label.trim();
    const username = accountForm.username.trim();
    const password = accountForm.password.trim();
    if (!label || !username || !password) {
      setAccountFormError('请至少填写平台、账号标签、登录账号、密码');
      return;
    }

    const newAccount: TicketAccount = {
      id:
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      platform: accountForm.platform,
      label,
      username,
      password,
      note: accountForm.note.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    const next = [newAccount, ...accounts];
    saveAccountsToLocalStorage(next);
    setAccountForm(getEmptyAccountFormState(accountForm.platform));
    setAccountFormError('');
  };

  const deleteAccount = (id: string) => {
    const next = accounts.filter((item) => item.id !== id);
    saveAccountsToLocalStorage(next);
  };

  const addFollowItemFromEvent = (event: TicketEvent) => {
    const exists = followItems.some((item) => item.eventId === event.id);
    if (exists) return;

    const now = new Date().toISOString();
    const followItem: FollowTicketItem = {
      id:
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      eventId: event.id,
      source: event.source,
      title: event.title,
      receptionTitle: event.receptionTitle,
      seatInfo: event.seatInfo,
      eventUrl: event.eventUrl,
      enabled: true,
      qqPrivateUserIds: '',
      qqGroupIds: '',
      conditions: {
        onSaleStart: true,
        endingSoon: true,
        endingSoonMinutes: 60,
      },
      runtime: {},
      createdAt: now,
      updatedAt: now,
    };

    saveFollowItemsToLocalStorage([followItem, ...followItems]);
  };

  const updateFollowItem = (id: string, updater: (item: FollowTicketItem) => FollowTicketItem) => {
    const next = followItems.map((item) => {
      if (item.id !== id) return item;
      const updated = updater(item);
      return { ...updated, updatedAt: new Date().toISOString() };
    });
    saveFollowItemsToLocalStorage(next);
  };

  const deleteFollowItem = (id: string) => {
    const next = followItems.filter((item) => item.id !== id);
    saveFollowItemsToLocalStorage(next);
  };

  const sendQqBotNotification = useCallback(async (
    followItem: FollowTicketItem,
    message: string,
  ) => {
    const privateIds = parseIdList(followItem.qqPrivateUserIds);
    const groupIds = parseIdList(followItem.qqGroupIds);
    const tasks: Array<Promise<unknown>> = [];

    privateIds.forEach((userId) => {
      const uid = Number(userId);
      if (!Number.isFinite(uid)) return;
      tasks.push(
        fetch('/api/examples/qqbot/action/send_private_msg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: uid, message }),
        }).then(async (res) => {
          if (!res.ok) throw new Error(`发送私聊消息失败: ${res.status}`);
          return res;
        }),
      );
    });

    groupIds.forEach((groupId) => {
      const gid = Number(groupId);
      if (!Number.isFinite(gid)) return;
      tasks.push(
        fetch('/api/examples/qqbot/action/send_group_msg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ group_id: gid, message }),
        }).then(async (res) => {
          if (!res.ok) throw new Error(`发送群消息失败: ${res.status}`);
          return res;
        }),
      );
    });

    if (!tasks.length) {
      throw new Error('未配置 QQ 接收对象（用户或群）');
    }

    await Promise.all(tasks);
  }, []);

  const runFollowCheckAndNotify = useCallback(async () => {
    if (followCheckLockRef.current) return;
    followCheckLockRef.current = true;
    setFollowCheckRunning(true);
    setFollowLastError('');

    try {
      const enabledItems = followItems.filter((item) => item.enabled);
      if (!enabledItems.length) {
        setFollowLastCheckAt(new Date().toISOString());
        return;
      }

      const params = new URLSearchParams();
      allSources.forEach((source) => params.append('source', source));
      params.set('limit', '100');

      const response = await fetch(`/api/ticket-monitor/events?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`检查关注列表失败: ${response.status}`);
      }

      const data = (await response.json()) as TicketApiResponse;
      const allEvents = data.data || [];
      const eventMap = new Map(allEvents.map((event) => [event.id, event]));
      let changed = false;

      const nextFollowItems = await enabledItems.reduce(
        async (promise, currentItem) => {
          const acc = await promise;
          const event = eventMap.get(currentItem.eventId);
          if (!event) return [...acc, currentItem];

          const runtime: FollowRuntimeState = { ...(currentItem.runtime || {}) };
          const now = Date.now();
          const nextItem: FollowTicketItem = {
            ...currentItem,
            title: event.title,
            receptionTitle: event.receptionTitle,
            seatInfo: event.seatInfo,
            eventUrl: event.eventUrl,
          };

          if (currentItem.conditions.onSaleStart) {
            const onSaleKey = `${event.id}:${event.ticketOpenAt}:on_sale`;
            if (runtime.lastStatus !== 'on_sale' && event.status === 'on_sale' && runtime.notifiedOnSaleKey !== onSaleKey) {
              const message = [
                '【票务关注提醒】',
                `演出: ${event.title}`,
                event.receptionTitle ? `受付: ${event.receptionTitle}` : '',
                event.seatInfo ? `席位: ${event.seatInfo}` : '',
                '触发条件: 开始售卖',
                `开票时间: ${formatDateTime(event.ticketOpenAt)}`,
                `链接: ${event.eventUrl}`,
              ].filter(Boolean).join('\n');
              await sendQqBotNotification(currentItem, message);
              runtime.notifiedOnSaleKey = onSaleKey;
              changed = true;
            }
          }

          if (currentItem.conditions.endingSoon && event.ticketEndAt) {
            const endAtMs = new Date(event.ticketEndAt).getTime();
            const thresholdMs = currentItem.conditions.endingSoonMinutes * 60 * 1000;
            const diffMs = endAtMs - now;
            const endingSoonKey = `${event.id}:${event.ticketEndAt}:${currentItem.conditions.endingSoonMinutes}`;
            if (diffMs > 0 && diffMs <= thresholdMs && runtime.notifiedEndingSoonKey !== endingSoonKey) {
              const message = [
                '【票务关注提醒】',
                `演出: ${event.title}`,
                event.receptionTitle ? `受付: ${event.receptionTitle}` : '',
                event.seatInfo ? `席位: ${event.seatInfo}` : '',
                `触发条件: 即将结束售卖（${currentItem.conditions.endingSoonMinutes} 分钟内）`,
                `结束售卖: ${formatDateTime(event.ticketEndAt)}`,
                `链接: ${event.eventUrl}`,
              ].filter(Boolean).join('\n');
              await sendQqBotNotification(currentItem, message);
              runtime.notifiedEndingSoonKey = endingSoonKey;
              changed = true;
            }
          }

          runtime.lastStatus = event.status;
          runtime.lastEndAt = event.ticketEndAt;
          nextItem.runtime = runtime;
          return [...acc, nextItem];
        },
        Promise.resolve([] as FollowTicketItem[]),
      );

      const disabledItems = followItems.filter((item) => !item.enabled);
      if (changed) {
        saveFollowItemsToLocalStorage([...nextFollowItems, ...disabledItems]);
      }

      setFollowLastCheckAt(new Date().toISOString());
    } catch (error) {
      setFollowLastError(error instanceof Error ? error.message : String(error));
    } finally {
      followCheckLockRef.current = false;
      setFollowCheckRunning(false);
    }
  }, [followItems, saveFollowItemsToLocalStorage, sendQqBotNotification]);

  useEffect(() => {
    const hasEnabled = followItems.some((item) => item.enabled);
    if (!hasEnabled) return undefined;
    const timer = setInterval(() => {
      void runFollowCheckAndNotify();
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, [followItems, runFollowCheckAndNotify]);

  const toggleSource = (source: TicketSource) => {
    setSelectedSources((prev) => {
      let next = prev;
      if (prev.includes(source)) {
        if (prev.length === 1) return prev;
        next = prev.filter((item) => item !== source);
      } else {
        next = [...prev, source];
      }
      // Switching source filter should refresh list immediately.
      void loadEvents({ sources: next });
      return next;
    });
  };

  const toggleSortByEndAtDesc = () => {
    const next = !sortByEndAtDesc;
    setSortByEndAtDesc(next);
    void loadEvents({ sortByEndAtDesc: next });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">开票信息聚合（测试）</h1>
          <p className="mt-1 text-sm text-gray-600">
            支持来源：eplus / asobistore / piapro / LawsonTicket
          </p>
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">关键词</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="如：初音未来 / LoveLive"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">状态</label>
              <select
                value={status}
                onChange={(e) => {
                  const nextStatus = e.target.value as '' | TicketStatus;
                  setStatus(nextStatus);
                  // Switching status filter should refresh list immediately.
                  void loadEvents({ status: nextStatus });
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                {allStatuses.map((item) => (
                  <option key={item.value || 'all'} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="flex w-full gap-2">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(true)}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  抢票账号（{accounts.length}）
                </button>
                <button
                  type="button"
                  onClick={() => setIsFollowModalOpen(true)}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  关注演出（{followItems.length}）
                </button>
                <button
                  type="button"
                  onClick={loadEvents}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? '加载中...' : '刷新'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-gray-700">来源平台</p>
            <div className="flex flex-wrap gap-2">
              {allSources.map((source) => {
                const checked = selectedSources.includes(source);
                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() => toggleSource(source)}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      checked
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    {sourceLabelMap[source]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={sortByEndAtDesc}
                onChange={toggleSortByEndAtDesc}
                className="h-4 w-4 rounded border-gray-300"
              />
              按结束售卖时间倒序
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
            <span>结果数：{events.length}</span>
            <div className="flex items-center gap-2">
              <span>最新抓取：{fetchedAt ? formatDateTime(fetchedAt) : '-'}</span>
              <div className="ml-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className={`rounded-md px-3 py-1.5 text-xs ${view === 'list' ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-700'}`}
                >
                  列表
                </button>
                <button
                  type="button"
                  onClick={() => setView('grid')}
                  className={`rounded-md px-3 py-1.5 text-xs ${view === 'grid' ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-700'}`}
                >
                  网格
                </button>
              </div>
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              接口请求失败：{errorMessage}
            </div>
          ) : null}

          {!errorMessage && apiErrors.length > 0 ? (
            <div className="mb-3 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
              部分来源获取失败：{apiErrors.join(' | ')}
            </div>
          ) : null}

          {!loading && !errorMessage && events.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
              未检索到符合条件的开票信息
            </div>
          ) : null}

          <div className={view === 'grid' ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
            {events.map((event) => (
              <article key={event.id} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                  <img
                    src={brokenImageIds[event.id] ? getFallbackCover(event) : (event.coverImage || getFallbackCover(event))}
                    alt={event.title}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      setBrokenImageIds((prev) => ({ ...prev, [event.id]: true }));
                    }}
                  />
                </div>

                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    {sourceLabelMap[event.source]}
                  </span>
                  <span className={`rounded px-2 py-0.5 text-xs ${statusColorMap[event.status]}`}>
                    {statusLabelMap[event.status]}
                  </span>
                </div>

                <h2 className="text-base font-semibold leading-snug text-gray-900">{event.title}</h2>

                {event.source === 'asobistore' && event.receptionTitle ? (
                  <div className="mt-1 space-y-0.5">
                    <p
                      className="text-lg leading-snug text-gray-900"
                      style={{ fontFamily: '"Noto Serif JP", "Hiragino Mincho ProN", serif' }}
                    >
                      {event.receptionTitle}
                    </p>
                    {event.seatInfo ? (
                      <p
                        className="text-sm leading-snug text-gray-600"
                        style={{ fontFamily: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif' }}
                      >
                        {event.seatInfo}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>开票时间：{formatDateTime(event.ticketOpenAt)}</p>
                  {event.ticketEndAt ? <p>结束售卖：{formatDateTime(event.ticketEndAt)}</p> : null}
                  <p>抓取时间：{formatDateTime(event.fetchedAt)}</p>
                  <p>地区：{event.location || '-'}</p>
                </div>

                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={event.eventUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-black"
                    >
                      前往官网
                    </a>
                    <button
                      type="button"
                      onClick={() => addFollowItemFromEvent(event)}
                      disabled={followItems.some((item) => item.eventId === event.id)}
                      className="inline-flex rounded-md border border-blue-300 bg-white px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {followItems.some((item) => item.eventId === event.id) ? '已关注' : '关注'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {isAccountModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">抢票账号预填信息</h2>
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  关闭
                </button>
              </div>

              <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">平台</label>
                  <select
                    value={accountForm.platform}
                    onChange={(e) => {
                      setAccountForm((prev) => ({ ...prev, platform: e.target.value as TicketSource }));
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    {allSources.map((source) => (
                      <option key={source} value={source}>
                        {sourceLabelMap[source]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">账号标签</label>
                  <input
                    value={accountForm.label}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, label: e.target.value }))}
                    placeholder="如：主号 / 备用号"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">登录账号</label>
                  <input
                    value={accountForm.username}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="邮箱 / 用户名 / 手机号"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">密码</label>
                  <input
                    type="password"
                    value={accountForm.password}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="登录密码"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">备注（可选）</label>
                  <input
                    value={accountForm.note}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, note: e.target.value }))}
                    placeholder="如：需要短信二次验证"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  {accountFormError ? (
                    <p className="mb-2 text-sm text-red-600">{accountFormError}</p>
                  ) : null}
                  <button
                    type="button"
                    onClick={addAccount}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    增加账号
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {allSources.map((source) => {
                  const sourceAccounts = accounts.filter((item) => item.platform === source);
                  return (
                    <section key={source} className="rounded-lg border border-gray-200 p-3">
                      <h3 className="mb-2 text-sm font-semibold text-gray-800">
                        {sourceLabelMap[source]}（{sourceAccounts.length}）
                      </h3>
                      {sourceAccounts.length === 0 ? (
                        <p className="text-sm text-gray-500">暂无账号</p>
                      ) : (
                        <div className="space-y-2">
                          {sourceAccounts.map((account) => (
                            <div key={account.id} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-gray-900">{account.label}</p>
                                  <p className="truncate text-xs text-gray-600">账号：{account.username}</p>
                                  <p className="truncate text-xs text-gray-600">密码：{account.password}</p>
                                  {account.note ? (
                                    <p className="truncate text-xs text-gray-500">备注：{account.note}</p>
                                  ) : null}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => deleteAccount(account.id)}
                                  className="rounded-md border border-red-200 bg-white px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                                >
                                  删除
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {isFollowModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">关注演出列表 & QQ 推送</h2>
                <button
                  type="button"
                  onClick={() => setIsFollowModalOpen(false)}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  关闭
                </button>
              </div>

              <div className="mb-4 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                <p>已开启关注：{followItems.filter((item) => item.enabled).length} 项</p>
                <p>最近检查：{followLastCheckAt ? formatDateTime(followLastCheckAt) : '-'}</p>
                {followLastError ? <p className="text-red-600">检查错误：{followLastError}</p> : null}
                <button
                  type="button"
                  onClick={() => {
                    void runFollowCheckAndNotify();
                  }}
                  disabled={followCheckRunning}
                  className="mt-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {followCheckRunning ? '检查中...' : '立即检查并推送'}
                </button>
              </div>

              <div className="space-y-3">
                {followItems.length === 0 ? (
                  <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                    暂无关注演出，请在卡片上点击“关注”
                  </div>
                ) : followItems.map((item) => (
                  <div key={item.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        {item.receptionTitle ? (
                          <p className="text-xs text-gray-600">
                            {item.receptionTitle}{item.seatInfo ? ` / ${item.seatInfo}` : ''}
                          </p>
                        ) : null}
                        <p className="text-xs text-gray-500">{sourceLabelMap[item.source]}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1 text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={(e) => updateFollowItem(item.id, (old) => ({ ...old, enabled: e.target.checked }))}
                          />
                          启用
                        </label>
                        <button
                          type="button"
                          onClick={() => deleteFollowItem(item.id)}
                          className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          删除
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                      <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                        <input
                          type="checkbox"
                          checked={item.conditions.onSaleStart}
                          onChange={(e) => updateFollowItem(item.id, (old) => ({
                            ...old,
                            conditions: { ...old.conditions, onSaleStart: e.target.checked },
                          }))}
                        />
                        开始售卖时推送
                      </label>
                      <div className="flex items-center gap-2 text-xs text-gray-700">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.conditions.endingSoon}
                            onChange={(e) => updateFollowItem(item.id, (old) => ({
                              ...old,
                              conditions: { ...old.conditions, endingSoon: e.target.checked },
                            }))}
                          />
                          即将结束售卖推送
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={item.conditions.endingSoonMinutes}
                          onChange={(e) => updateFollowItem(item.id, (old) => ({
                            ...old,
                            conditions: {
                              ...old.conditions,
                              endingSoonMinutes: Number(e.target.value) > 0 ? Number(e.target.value) : 60,
                            },
                          }))}
                          className="w-20 rounded-md border border-gray-300 px-2 py-1 text-xs"
                        />
                        <span>分钟</span>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-700">QQ用户ID（逗号分隔）</label>
                        <input
                          value={item.qqPrivateUserIds}
                          onChange={(e) => updateFollowItem(item.id, (old) => ({ ...old, qqPrivateUserIds: e.target.value }))}
                          placeholder="123456, 234567"
                          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-700">QQ群ID（逗号分隔）</label>
                        <input
                          value={item.qqGroupIds}
                          onChange={(e) => updateFollowItem(item.id, (old) => ({ ...old, qqGroupIds: e.target.value }))}
                          placeholder="987654321"
                          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
