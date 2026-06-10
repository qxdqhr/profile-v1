export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { configureCalendarApiAuth } = await import('sa2kit/business/calendar/routes');
    const { getApiSessionUser } = await import('@/lib/auth/session');

    configureCalendarApiAuth(async (request) => {
      const user = await getApiSessionUser(request);
      if (!user) return null;
      const parsed = Number.parseInt(user.id, 10);
      if (!Number.isNaN(parsed)) {
        return { id: parsed };
      }
      return null;
    });
  }
}
