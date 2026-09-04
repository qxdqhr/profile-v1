/**
 * tsx --import @profile/config/preload
 * 加载 config/app.config.*.yaml 并同步 process.env
 */
import { loadAppConfig } from 'sa2kit/common/config/bootstrap';
import { applyAiConfigFromYaml } from './apply-ai-env';
import { findMonorepoRoot } from './repo-root';

loadAppConfig({ logDoctor: false, cwd: findMonorepoRoot() });
applyAiConfigFromYaml();
