import dayjs, { Dayjs } from 'dayjs';
import { Person, Holiday } from '../types';

interface DateControlsProps {
  startDate: Dayjs;
  endDate: Dayjs;
  numberOfPeople: number;
  people: Person[];
  onStartDateChange: (date: Dayjs) => void;
  onEndDateChange: (date: Dayjs) => void;
  onNumberOfPeopleChange: (num: number) => void;
  onPersonNameChange: (personId: number, newName: string) => void;
  onPersonHolidayChange: (personId: number, date: string, isHoliday: boolean, name?: string) => void;
}

export function DateControls({
  startDate,
  endDate,
  numberOfPeople,
  people,
  onStartDateChange,
  onEndDateChange,
  onNumberOfPeopleChange,
  onPersonNameChange,
  onPersonHolidayChange,
}: DateControlsProps) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = dayjs(e.target.value);
    if (newDate.isValid()) {
      if (newDate.isAfter(endDate)) {
        // 如果开始日期晚于结束日期，将结束日期设置为开始日期后7天
        onStartDateChange(newDate);
        onEndDateChange(newDate.add(7, 'day'));
      } else {
        onStartDateChange(newDate);
      }
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = dayjs(e.target.value);
    if (newDate.isValid()) {
      if (newDate.isBefore(startDate)) {
        // 如果结束日期早于开始日期，将开始日期设置为结束日期前7天
        onEndDateChange(newDate);
        onStartDateChange(newDate.subtract(7, 'day'));
      } else {
        onEndDateChange(newDate);
      }
    }
  };

  const handleHolidayToggle = (personId: number, date: string) => {
    const person = people.find(p => p.id === personId);
    const hasHoliday = person?.holidays.some(h => h.date === date);
    if (!hasHoliday) {
      onPersonHolidayChange(personId, date, true, '其他占用');
    }
  };

  const handleHolidayNameChange = (personId: number, date: string, newName: string) => {
    const person = people.find(p => p.id === personId);
    if (person) {
      const holiday = person.holidays.find(h => h.date === date);
      if (holiday) {
        onPersonHolidayChange(personId, date, true, newName);
      }
    }
  };

  return (
    <div>
      <div className="controls">
        <h4>开始日期</h4>
        <input
          type="date"
          value={startDate.format('YYYY-MM-DD')}
          onChange={handleStartDateChange}
          className="date-input"
        />
        <h4>结束日期</h4>
        <input
          type="date"
          value={endDate.format('YYYY-MM-DD')}
          onChange={handleEndDateChange}
          className="date-input"
        />
        <input
          type="number"
          placeholder="可用人数"
          value={numberOfPeople}
          onChange={(e) => onNumberOfPeopleChange(parseInt(e.target.value) || 1)}
          className="number-input"
          min="1"
        />
      </div>
      
      <div className="people-list">
        <h3>当前人员列表</h3>
        <div className="people-grid">
          {people.map((person) => (
            <div key={person.id} className="person-card">
              <div className="person-info">
                <input
                  type="text"
                  value={person.name}
                  onChange={(e) => onPersonNameChange(person.id, e.target.value)}
                  className="person-name-input"
                  placeholder={`人员 ${person.id + 1}`}
                />
                <div className="holiday-picker">
                  <input
                    type="date"
                    min={startDate.format('YYYY-MM-DD')}
                    max={endDate.format('YYYY-MM-DD')}
                    onChange={(e) => handleHolidayToggle(person.id, e.target.value)}
                    className="holiday-date-input"
                  />
                  <div className="holiday-dates">
                    {person.holidays.map((holiday) => (
                      <div key={holiday.date} className="holiday-tag">
                        <input
                          type="text"
                          value={holiday.name}
                          onChange={(e) => handleHolidayNameChange(person.id, holiday.date, e.target.value)}
                          className="holiday-name-input"
                          placeholder="其他占用"
                        />
                        <span className="holiday-date">{dayjs(holiday.date).format('MM/DD')}</span>
                        <button
                          className="remove-holiday"
                          onClick={() => onPersonHolidayChange(person.id, holiday.date, false)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 