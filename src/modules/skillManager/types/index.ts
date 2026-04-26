export type SkillSource = 'local_cursor' | 'manual_upload' | 'remote';
export type SkillStatus = 'draft' | 'published' | 'archived';

export type SkillSummary = {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  tags: string[];
  source: SkillSource;
  status: SkillStatus;
};

export type SkillDetail = SkillSummary & {
  content: string;
  files: string[];
};

export type SkillListResponse = {
  items: SkillSummary[];
};
