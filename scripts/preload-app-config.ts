#!/usr/bin/env tsx
/**
 * 在脚本入口 import，加载 config/app.config.*.yaml 并同步 process.env
 */
import { loadAppConfig } from 'sa2kit/common/config/bootstrap';

loadAppConfig({ logDoctor: false });
