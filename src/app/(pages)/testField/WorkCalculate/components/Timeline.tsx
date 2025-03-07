import { Dayjs } from 'dayjs';
import { Assignment, WorkItem, Person } from '../types';

interface TimelineProps {
  startDate: Dayjs;
  endDate: Dayjs;
  people: Person[];
  assignments: Assignment[];
  isHighLightWeekend: boolean;
  isShowHolidays: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, assignment: Assignment) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, personIndex: number, dayIndex: number) => void;
  onPersonNameChange: (personId: number, newName: string) => void;
}

export function Timeline({
  startDate,
  endDate,
  people,
  assignments,
  isHighLightWeekend,
  isShowHolidays,
  onDragStart,
  onDrop,
  onPersonNameChange,
}: TimelineProps) {
  // 检查某个时间格是否已被分配工作
  const getAssignmentForCell = (personIndex: number, dayIndex: number) => {
    return assignments.find(a => 
      a.personIndex === personIndex && 
      dayIndex >= a.startDay && 
      dayIndex < a.startDay + a.work.manDays
    );
  };

  // 获取星期几的显示文本
  const getWeekDay = (date: Dayjs) => {
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    return weekDays[date.day()];
  };

  // 检查是否为周末
  const isWeekend = (date: Dayjs) => {
    const day = date.day();
    return day === 0 || day === 6;
  };

  // 检查是否为假期
  const isHoliday = (person: Person, date: Dayjs) => {
    return person.holidays.some(h => h.date === date.format('YYYY-MM-DD'));
  };

  return (
    <div className="timeline">
      {people.map((person) => (
        <div key={person.id} className="timeline-row">
          <div className="person-name">
            <input
              type="text"
              value={person.name}
              onChange={(e) => onPersonNameChange(person.id, e.target.value)}
              className="person-name-input"
            />
          </div>
          <div className="day-cells">
            {Array.from({ length: endDate.diff(startDate, 'day') + 1 }).map((_, dayIndex) => {
              const assignment = getAssignmentForCell(person.id, dayIndex);
              const isFirstDayOfAssignment = assignment?.startDay === dayIndex;
              const date = startDate.add(dayIndex, 'day');
              const weekend = isWeekend(date);
              const holiday = isShowHolidays && isHoliday(person, date);
              
              return (
                <div
                  key={`${person.id}-${dayIndex}`}
                  className={`day-cell ${assignment ? 'assigned' : ''} ${isHighLightWeekend && weekend ? 'weekend' : ''} ${holiday ? 'holiday' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDrop(e, person.id, dayIndex)}
                >
                  <div className="date-label">
                    <div>{date.format('MM/DD')}</div>
                    <div className="weekday">周{getWeekDay(date)}</div>
                    {holiday && <div className="holiday-indicator">休</div>}
                  </div>
                  {isFirstDayOfAssignment && (
                    <div 
                      className="assignment"
                      draggable
                      onDragStart={(e) => onDragStart(e, assignment)}
                      style={{
                        width: `calc(100% * ${assignment.work.manDays})`,
                      }}
                    >
                      <div className="assignment-title">
                        {assignment.work.title}
                      </div>
                      <div className="assignment-days">
                        人天: {assignment.work.manDays}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
} 