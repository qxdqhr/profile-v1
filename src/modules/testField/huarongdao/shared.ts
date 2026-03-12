export interface HuarongdaoLevelConfig {
  id: number;
  label: string;
  rows: number;
  cols: number;
  shuffleSteps: number;
  sourceImageUrl: string;
}

export const HUARONGDAO_CONFIG_KEY = 'huarongdao.levelConfigs';

export const DEFAULT_HUARONGDAO_LEVEL_CONFIGS: HuarongdaoLevelConfig[] = [
  {
    id: 1,
    label: '难度 1',
    rows: 3,
    cols: 3,
    shuffleSteps: 60,
    sourceImageUrl: '',
  },
  {
    id: 2,
    label: '难度 2',
    rows: 4,
    cols: 4,
    shuffleSteps: 110,
    sourceImageUrl: '',
  },
  {
    id: 3,
    label: '难度 3',
    rows: 5,
    cols: 5,
    shuffleSteps: 180,
    sourceImageUrl: '',
  },
];

export const normalizeLevelConfig = (input: Partial<HuarongdaoLevelConfig>, fallback: HuarongdaoLevelConfig): HuarongdaoLevelConfig => {
  const rows = Number(input.rows ?? fallback.rows);
  const cols = Number(input.cols ?? fallback.cols);
  const shuffleSteps = Number(input.shuffleSteps ?? fallback.shuffleSteps);
  return {
    id: fallback.id,
    label: String(input.label ?? fallback.label),
    rows: Number.isFinite(rows) && rows >= 2 ? rows : fallback.rows,
    cols: Number.isFinite(cols) && cols >= 2 ? cols : fallback.cols,
    shuffleSteps: Number.isFinite(shuffleSteps) && shuffleSteps >= 0 ? shuffleSteps : fallback.shuffleSteps,
    sourceImageUrl: String(input.sourceImageUrl ?? '').trim(),
  };
};

export const mergeWithDefaults = (input: Partial<HuarongdaoLevelConfig>[] | null | undefined): HuarongdaoLevelConfig[] => {
  const byId = new Map<number, Partial<HuarongdaoLevelConfig>>();
  (input || []).forEach((item) => {
    const id = Number(item?.id);
    if (!Number.isFinite(id)) return;
    byId.set(id, item);
  });

  return DEFAULT_HUARONGDAO_LEVEL_CONFIGS.map((fallback) =>
    normalizeLevelConfig(byId.get(fallback.id) || {}, fallback),
  );
};
