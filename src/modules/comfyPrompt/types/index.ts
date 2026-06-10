export type PromptKind = 'positive' | 'negative';

export interface ComfyPromptGroup {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  kind: PromptKind;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComfyPrompt {
  id: number;
  userId: string;
  groupId: number | null;
  title: string;
  content: string;
  kind: PromptKind;
  tags: string[];
  weight: string | null;
  order: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComfyPromptSetItem {
  id: number;
  setId: number;
  promptId: number;
  order: number;
  enabled: boolean;
  customPrefix: string | null;
  customSuffix: string | null;
  prompt?: ComfyPrompt;
}

export interface ComfyPromptSet {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  kind: PromptKind;
  separator: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  items?: ComfyPromptSetItem[];
}

export interface ComfyWorkflow {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  workflowJson: Record<string, unknown>;
  tags: string[];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptGroupFormData {
  name: string;
  description?: string;
  color?: string;
  kind?: PromptKind;
}

export interface PromptFormData {
  title: string;
  content: string;
  kind?: PromptKind;
  groupId?: number | null;
  tags?: string[];
  weight?: number | null;
  notes?: string;
}

export interface PromptSetFormData {
  name: string;
  description?: string;
  kind?: PromptKind;
  separator?: string;
  tags?: string[];
  promptIds?: number[];
}

export interface WorkflowFormData {
  name: string;
  description?: string;
  workflowJson: Record<string, unknown>;
  tags?: string[];
  notes?: string;
}

export interface BuildPromptOptions {
  separator?: string;
  wrapWeight?: boolean;
}
