type ApiNode = {
  class_type?: string;
  inputs?: Record<string, unknown>;
};

function isApiWorkflow(workflow: Record<string, unknown>): boolean {
  if ('nodes' in workflow && Array.isArray(workflow.nodes)) {
    return false;
  }
  return Object.values(workflow).some(
    (value) => value && typeof value === 'object' && 'class_type' in (value as object),
  );
}

function setNodeInput(
  workflow: Record<string, ApiNode>,
  nodeId: string | null | undefined,
  field: string,
  value: unknown,
) {
  if (!nodeId) return;
  const node = workflow[nodeId];
  if (!node) {
    throw new Error(`工作流中不存在节点 ${nodeId}`);
  }
  node.inputs = { ...(node.inputs ?? {}), [field]: value };
}

export function injectWorkflowPrompt(
  workflowJson: Record<string, unknown>,
  options: {
    positivePrompt?: string;
    negativePrompt?: string;
    positiveNodeId?: string | null;
    negativeNodeId?: string | null;
    seedNodeId?: string | null;
    seed?: number;
  },
): Record<string, unknown> {
  if (!isApiWorkflow(workflowJson)) {
    throw new Error('请使用 ComfyUI API 格式的工作流 JSON（非界面导出的 nodes 数组格式）');
  }

  const workflow = structuredClone(workflowJson) as Record<string, ApiNode>;

  if (options.positivePrompt?.trim()) {
    setNodeInput(workflow, options.positiveNodeId, 'text', options.positivePrompt.trim());
  }
  if (options.negativePrompt?.trim()) {
    setNodeInput(workflow, options.negativeNodeId, 'text', options.negativePrompt.trim());
  }
  if (options.seed !== undefined && options.seedNodeId) {
    setNodeInput(workflow, options.seedNodeId, 'seed', options.seed);
  }

  return workflow;
}
