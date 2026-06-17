// 模拟数据库，用于演示
let events = [
  {
    id: 1,
    title: '团队周会',
    description: '讨论项目进度',
    startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    allDay: false,
    location: '会议室 A',
    color: '#3B82F6',
    priority: 'normal',
    userId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: '项目发布',
    description: 'SA2Kit v1.0 发布',
    startTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    endTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    allDay: true,
    location: '线上',
    color: '#10B981',
    priority: 'high',
    userId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const calendarMockDb = {
  getEvents: (userId: number) => events.filter(e => e.userId === userId),
  getEvent: (id: number) => events.find(e => e.id === id),
  addEvent: (event: any) => {
    const newEvent = {
      ...event,
      id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    events.push(newEvent);
    return newEvent;
  },
  updateEvent: (id: number, data: any) => {
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return null;
    events[index] = { ...events[index], ...data, updatedAt: new Date().toISOString() };
    return events[index];
  },
  deleteEvent: (id: number) => {
    events = events.filter(e => e.id !== id);
    return true;
  },
  batchDelete: (ids: number[]) => {
    events = events.filter(e => !ids.includes(e.id));
    return true;
  }
};






