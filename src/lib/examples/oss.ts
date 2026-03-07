import { AliyunOSSProvider, loadOSSConfigFromEnv } from 'sa2kit/universalFile/server';

let ossProvider: AliyunOSSProvider | null = null;

export async function getOSSProvider() {
  if (ossProvider) return ossProvider;

  const config = loadOSSConfigFromEnv();
  if (!config) {
    throw new Error('OSS configuration not found in environment variables');
  }

  ossProvider = new AliyunOSSProvider();
  await ossProvider.initialize(config);
  return ossProvider;
}
