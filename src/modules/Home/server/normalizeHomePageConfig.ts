import { DEFAULT_HOME_PAGE_CONFIG } from '../defaultConfig';
import type { HomeContactConfig, HomePageConfig, NavItem, ProjectItem } from '../types';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((tag) => asString(tag))
    .filter(Boolean);
}

function normalizeNavItems(value: unknown): NavItem[] {
  if (!Array.isArray(value)) return DEFAULT_HOME_PAGE_CONFIG.navConfig.items;

  const items = value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const id = asString(record.id, `nav-${index + 1}`);
      const label = asString(record.label);
      const href = asString(record.href);
      if (!label || !href) return null;
      return { id, label, href };
    })
    .filter((item): item is NavItem => item !== null);

  return items.length > 0 ? items : DEFAULT_HOME_PAGE_CONFIG.navConfig.items;
}

function normalizeTimelineItems(value: unknown) {
  if (!Array.isArray(value)) return DEFAULT_HOME_PAGE_CONFIG.timelineConfig.items;

  const items = value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const title = asString(record.title);
      const description = asString(record.description);
      if (!title || !description) return null;

      return {
        id: asString(record.id, `timeline-${index + 1}`),
        date: asString(record.date, '未知'),
        title,
        description,
        tags: normalizeTags(record.tags),
      };
    })
    .filter((item) => item !== null);

  return items.length > 0
    ? items
    : DEFAULT_HOME_PAGE_CONFIG.timelineConfig.items;
}

function normalizeProjects(value: unknown): ProjectItem[] {
  if (!Array.isArray(value)) return DEFAULT_HOME_PAGE_CONFIG.projectsConfig.projects;

  const projects = value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const title = asString(record.title);
      const description = asString(record.description);
      if (!title || !description) return null;

      const link = asString(record.link);
      const image = asString(record.image);

      return {
        id: asString(record.id, `project-${index + 1}`),
        title,
        description,
        tags: normalizeTags(record.tags),
        ...(link ? { link } : {}),
        ...(image ? { image } : {}),
      };
    })
    .filter((item): item is ProjectItem => item !== null);

  return projects.length > 0
    ? projects
    : DEFAULT_HOME_PAGE_CONFIG.projectsConfig.projects;
}

function parseNullablePositiveInt(value: unknown): number | null {
  if (value === null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function normalizeContactConfig(value: unknown): HomeContactConfig {
  const source = value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};

  const feishuWebhookUrl = typeof source.feishuWebhookUrl === 'string'
    ? source.feishuWebhookUrl.trim() || null
    : source.feishuWebhookUrl === null
      ? null
      : DEFAULT_HOME_PAGE_CONFIG.contactConfig.feishuWebhookUrl;

  const feishuSignSecret = typeof source.feishuSignSecret === 'string'
    ? source.feishuSignSecret.trim() || null
    : source.feishuSignSecret === null
      ? null
      : DEFAULT_HOME_PAGE_CONFIG.contactConfig.feishuSignSecret;

  if (feishuWebhookUrl && !feishuWebhookUrl.startsWith('https://')) {
    throw new Error('飞书 Webhook URL 必须以 https:// 开头');
  }

  return {
    feishuWebhookUrl,
    feishuSignSecret,
    qqUserId: source.qqUserId !== undefined
      ? parseNullablePositiveInt(source.qqUserId)
      : DEFAULT_HOME_PAGE_CONFIG.contactConfig.qqUserId,
    qqGroupId: source.qqGroupId !== undefined
      ? parseNullablePositiveInt(source.qqGroupId)
      : DEFAULT_HOME_PAGE_CONFIG.contactConfig.qqGroupId,
  };
}

function normalizeBalls(value: unknown) {
  if (!Array.isArray(value)) return DEFAULT_HOME_PAGE_CONFIG.collisionBallsConfig.balls;

  const balls = value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const label = asString(record.label);
      if (!label) return null;

      return {
        id: asString(record.id, `ball-${index + 1}`),
        label,
        color: asString(record.color, '#19c8b9'),
        size: Math.max(10, asNumber(record.size, 30)),
      };
    })
    .filter((item) => item !== null);

  return balls.length > 0
    ? balls
    : DEFAULT_HOME_PAGE_CONFIG.collisionBallsConfig.balls;
}

export function normalizeHomePageConfig(input: unknown): HomePageConfig {
  const source = input && typeof input === 'object'
    ? (input as Record<string, unknown>)
    : {};

  const homeSource = source.homeConfig && typeof source.homeConfig === 'object'
    ? (source.homeConfig as Record<string, unknown>)
    : {};

  const navSource = source.navConfig && typeof source.navConfig === 'object'
    ? (source.navConfig as Record<string, unknown>)
    : {};

  const timelineSource = source.timelineConfig && typeof source.timelineConfig === 'object'
    ? (source.timelineConfig as Record<string, unknown>)
    : {};

  const ballsSource = source.collisionBallsConfig && typeof source.collisionBallsConfig === 'object'
    ? (source.collisionBallsConfig as Record<string, unknown>)
    : {};

  const projectsSource = source.projectsConfig && typeof source.projectsConfig === 'object'
    ? (source.projectsConfig as Record<string, unknown>)
    : {};

  const buttons = Array.isArray(homeSource.buttons)
    ? homeSource.buttons
        .map((button) => {
          if (!button || typeof button !== 'object') return null;
          const record = button as Record<string, unknown>;
          const text = asString(record.text);
          const link = asString(record.link);
          if (!text || !link) return null;
          return { text, link };
        })
        .filter((button): button is { text: string; link: string } => button !== null)
    : DEFAULT_HOME_PAGE_CONFIG.homeConfig.buttons;

  const direction = navSource.direction === 'horizontal' ? 'horizontal' : 'vertical';

  return {
    homeConfig: {
      title: asString(homeSource.title, DEFAULT_HOME_PAGE_CONFIG.homeConfig.title),
      subtitle: asString(
        homeSource.subtitle,
        DEFAULT_HOME_PAGE_CONFIG.homeConfig.subtitle,
      ),
      buttons: buttons.length > 0
        ? buttons
        : DEFAULT_HOME_PAGE_CONFIG.homeConfig.buttons,
      imageSrc: asString(
        homeSource.imageSrc,
        DEFAULT_HOME_PAGE_CONFIG.homeConfig.imageSrc,
      ),
    },
    navConfig: {
      avatar: asString(navSource.avatar, DEFAULT_HOME_PAGE_CONFIG.navConfig.avatar),
      direction,
      items: normalizeNavItems(navSource.items),
    },
    timelineConfig: {
      items: normalizeTimelineItems(timelineSource.items),
    },
    collisionBallsConfig: {
      balls: normalizeBalls(ballsSource.balls),
      width: Math.max(
        300,
        asNumber(ballsSource.width, DEFAULT_HOME_PAGE_CONFIG.collisionBallsConfig.width),
      ),
      height: Math.max(
        300,
        asNumber(ballsSource.height, DEFAULT_HOME_PAGE_CONFIG.collisionBallsConfig.height),
      ),
    },
    projectsConfig: {
      projects: normalizeProjects(projectsSource.projects),
    },
    contactConfig: normalizeContactConfig(source.contactConfig),
  };
}
