#!/usr/bin/env tsx
/**
 * 验证 MiMo / AI 配置是否可用（连通性 + 视觉模型列表）
 * 用法：pnpm ai:test-mimo
 */
import { applyAiConfigFromYaml } from '../src/lib/config/apply-ai-env';
import {
  coreConnectivityTestTask,
  listOpenAiCompatibleModels,
  requireAiConnectionConfig,
} from 'sa2kit/common/aiApi';

async function main() {
  applyAiConfigFromYaml();

  const config = requireAiConnectionConfig();
  console.log('AI 配置:');
  console.log(`  baseUrl: ${config.baseUrl}`);
  console.log(`  visionModel: ${config.visionModel}`);
  console.log(`  textModel: ${config.textModel}`);
  console.log(`  apiKey: ${config.apiKey.slice(0, 8)}... (${config.apiKey.length} chars)`);

  console.log('\n拉取模型列表…');
  try {
    const { models, visionModels, suggestedVisionModel } = await listOpenAiCompatibleModels(undefined);
    console.log(`  共 ${models.length} 个模型，视觉候选 ${visionModels.length} 个`);
    if (suggestedVisionModel) {
      console.log(`  推荐视觉模型: ${suggestedVisionModel}`);
    }
    if (visionModels.length > 0) {
      console.log(
        `  视觉模型: ${visionModels.slice(0, 8).join(', ')}${visionModels.length > 8 ? '...' : ''}`
      );
    } else {
      console.log(`  模型示例: ${models.slice(0, 6).join(', ')}${models.length > 6 ? '...' : ''}`);
    }
  } catch (err) {
    console.warn(
      '  模型列表获取失败（可忽略，继续连通性测试）:',
      err instanceof Error ? err.message : err
    );
  }

  console.log('\n连通性探测…');
  const result = await coreConnectivityTestTask.execute({}, {});
  if (!result.data?.ok) {
    console.error('连通性失败');
    process.exit(1);
  }

  console.log(`连通性 OK — 模型 ${result.meta?.model ?? config.textModel}`);
  console.log(`回复: ${result.data.reply?.slice(0, 120) ?? '(empty)'}`);

  console.log('\n多模态识图探测（1x1 PNG）…');
  const { mimoAwareStructuredMultimodalTask } = await import(
    '../src/modules/aiApi/server/mimoStructuredMultimodalTask'
  );
  const png =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const vision = await mimoAwareStructuredMultimodalTask.execute(
    {
      systemPrompt: 'Analyze images. JSON only.',
      userPrompt: 'Dominant color? JSON: {"color":"string"}',
      jsonSchemaHint: '{"color":"string"}',
      media: [{ kind: 'image', base64: png, mimeType: 'image/png' }],
      temperature: 0.1,
    },
    {}
  );
  console.log(`识图 OK — ${JSON.stringify(vision.data?.json).slice(0, 120)}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
