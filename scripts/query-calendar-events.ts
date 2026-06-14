#!/usr/bin/env tsx
import { desc } from 'drizzle-orm';
import { db } from '../src/db/index';
import { calendarEvents } from '../src/modules/calendar/db/schema';

async function main() {
  const rows = await db
    .select()
    .from(calendarEvents)
    .orderBy(desc(calendarEvents.updatedAt))
    .limit(15);

  console.log(`共查询最近 ${rows.length} 条日历事件:\n`);
  for (const r of rows) {
    console.log(
      JSON.stringify(
        {
          id: r.id,
          title: r.title,
          startTime: r.startTime,
          endTime: r.endTime,
          allDay: r.allDay,
          updatedAt: r.updatedAt,
        },
        null,
        2
      )
    );
    console.log('---');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
