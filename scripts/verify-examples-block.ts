import { isNodeProduction } from '../app_web/web/src/lib/runtime/is-node-production';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function main() {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  assert(isNodeProduction(), 'NODE_ENV=production');
  process.env.NODE_ENV = 'development';
  assert(!isNodeProduction(), 'NODE_ENV=development');
  process.env.NODE_ENV = prev;
  console.log('isNodeProduction checks passed');
}

main();
