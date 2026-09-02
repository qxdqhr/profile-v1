export function isNodeProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
