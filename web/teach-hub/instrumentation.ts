export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { ensureTeachHubAiTasksRegistered } = await import('@profile/teach-hub-core/server');
    ensureTeachHubAiTasksRegistered();
  }
}
