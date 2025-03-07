export interface WorkItem {
  id: string;
  title: string;
  manDays: number;
}

export interface Assignment {
  workId: string;
  personIndex: number;
  startDay: number;
  work: WorkItem;
}

export interface Holiday {
  date: string; // YYYY-MM-DD 格式
  name: string; // 假期名称
}

export interface Person {
  id: number;
  name: string;
  holidays: Holiday[];
} 