export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { configureCalendarApiAuth } = await import('sa2kit/calendar/routes');
    const { validateApiAuth } = await import('@/lib/auth/legacy');

    configureCalendarApiAuth(async (request) => {
      const user = await validateApiAuth(request);
      if (!user) return null;
      const parsed = Number.parseInt(user.id, 10);
      if (!Number.isNaN(parsed)) {
        return { id: parsed };
      }
      return null;
    });
  }
}
