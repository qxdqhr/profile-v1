'use client';

import { useState } from 'react';
import { BackButton } from '@/app/_components/BackButton';
import dayjs, { Dayjs } from 'dayjs';
import { WorkItem, Assignment, Person } from './types';
import { DateControls } from './components/DateControls';
import { WorkInput } from './components/WorkInput';
import { WorkList } from './components/WorkList';
import { Timeline } from './components/Timeline';
import { ToolControls } from './components/ToolControls';
import { Toaster, toast } from 'react-hot-toast';
import './styles.css';

export default function WorkCalculate() {
  const [startDate, setStartDate] = useState<Dayjs>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs>(dayjs().add(7, 'day'));
  const [numberOfPeople, setNumberOfPeople] = useState(3);
  const [isHighLightWeekend, setIsHighLightWeekend] = useState(false);
  const [isShowHolidays, setIsShowHolidays] = useState(true);
  const [people, setPeople] = useState<Person[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newWork, setNewWork] = useState({ title: '', manDays: 0 });
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);
  const [draggedAssignment, setDraggedAssignment] = useState<Assignment | null>(null);

  const handleAddWork = () => {
    if (newWork.title && newWork.manDays > 0) {
      if (editingWork) {
        // 更新现有工作
        setWorkItems(workItems.map(item => 
          item.id === editingWork.id 
            ? { ...item, title: newWork.title, manDays: newWork.manDays }
            : item
        ));
        setEditingWork(null);
      } else {
        // 添加新工作
        setWorkItems([
          ...workItems,
          {
            id: `work-${Date.now()}`,
            title: newWork.title,
            manDays: newWork.manDays,
          },
        ]);
      }
      setNewWork({ title: '', manDays: 0 });
    }
  };

  const handleEditWork = (workId: string) => {
    const workItem = workItems.find(item => item.id === workId);
    if (workItem) {
      setEditingWork(workItem);
      setNewWork({ title: workItem.title, manDays: workItem.manDays });
    }
  };

  const handleDeleteWork = (workId: string) => {
    if (confirm('确定要删除这个工作吗？')) {
      setWorkItems(workItems.filter(item => item.id !== workId));
    }
  };

  const handlePersonHolidayChange = (personId: number, date: string, isHoliday: boolean, name?: string) => {
    setPeople(people.map(person => {
      if (person.id === personId) {
        if (isHoliday) {
          // 添加或更新假期
          const existingHolidayIndex = person.holidays.findIndex(h => h.date === date);
          if (existingHolidayIndex >= 0) {
            // 更新现有假期的名称
            const updatedHolidays = [...person.holidays];
            updatedHolidays[existingHolidayIndex] = { date, name: name || '其他占用' };
            return {
              ...person,
              holidays: updatedHolidays
            };
          } else {
            // 添加新假期
            return {
              ...person,
              holidays: [...person.holidays, { date, name: name || '其他占用' }]
            };
          }
        } else {
          // 移除假期
          return {
            ...person,
            holidays: person.holidays.filter(h => h.date !== date)
          };
        }
      }
      return person;
    }));
  };

  const handleNumberOfPeopleChange = (num: number) => {
    const newNum = Math.max(1, num);
    setNumberOfPeople(newNum);
    
    // 更新人员列表
    if (newNum > people.length) {
      // 添加新人员
      const newPeople = [...people];
      for (let i = people.length; i < newNum; i++) {
        newPeople.push({ id: i, name: `人员 ${i + 1}`, holidays: [] });
      }
      setPeople(newPeople);
    } else if (newNum < people.length) {
      // 移除多余人员，同时移除相关的工作分配
      setPeople(people.slice(0, newNum));
      setAssignments(assignments.filter(a => a.personIndex < newNum));
    }
  };

  const handlePersonNameChange = (personId: number, newName: string) => {
    setPeople(people.map(p => 
      p.id === personId ? { ...p, name: newName } : p
    ));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, personIndex: number, dayIndex: number) => {
    e.preventDefault();
    const workId = e.dataTransfer.getData('text/plain');
    let workItem: WorkItem | undefined;

    // 如果是从已分配区域拖动的
    if (draggedAssignment) {
      workItem = draggedAssignment.work;
      // 如果放回原位，不做任何操作
      if (draggedAssignment.personIndex === personIndex && draggedAssignment.startDay === dayIndex) {
        setDraggedAssignment(null);
        return;
      }
      // 移除原来的分配
      setAssignments(assignments.filter(a => a.workId !== workItem!.id));
    } else {
      // 从待分配区域拖动的
      workItem = workItems.find(w => w.id === workId);
      if (!workItem) return;
    }

    // 检查是否超出时间范围
    const endDayIndex = dayIndex + workItem.manDays - 1;
    const totalDays = endDate.diff(startDate, 'day') + 1;
    
    if (endDayIndex >= totalDays) {
      toast.error('工作超出计划时间范围，请调整工期或选择其他时间');
      // 如果是从已分配区域拖动的，需要恢复原来的分配
      if (draggedAssignment) {
        setAssignments([...assignments, draggedAssignment]);
      }
      setDraggedAssignment(null);
      return;
    }

    // 检查是否有足够的空间
    const hasSpace = Array.from({ length: workItem.manDays }).every((_, i) => {
      const day = dayIndex + i;
      return !assignments.some(a => 
        a.workId !== workItem!.id && // 排除自己
        a.personIndex === personIndex &&
        ((day >= a.startDay && day < a.startDay + a.work.manDays) ||
         (a.startDay >= day && a.startDay < day + workItem!.manDays))
      );
    });

    if (!hasSpace) {
      toast.error('所选时间段已有其他工作安排');
      // 如果是从已分配区域拖动的，需要恢复原来的分配
      if (draggedAssignment) {
        setAssignments([...assignments, draggedAssignment]);
      } else {
        // 如果是从待分配区域拖动的，自动返回到待分配列表
        setWorkItems([...workItems]);
      }
      setDraggedAssignment(null);
      return;
    }

    // 如果是从待分配区域拖动的，需要从待分配列表中移除
    if (!draggedAssignment) {
      setWorkItems(workItems.filter(w => w.id !== workId));
    }
    
    // 更新分配
    setAssignments([
      ...assignments.filter(a => a.workId !== workItem!.id),
      {
        workId: workItem.id,
        personIndex,
        startDay: dayIndex,
        work: workItem,
      },
    ]);

    setDraggedAssignment(null);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, assignment?: Assignment) => {
    if (assignment) {
      e.dataTransfer.setData('text/plain', assignment.workId);
      setDraggedAssignment(assignment);
    } else {
      const workId = e.currentTarget.getAttribute('data-work-id');
      if (workId) {
        e.dataTransfer.setData('text/plain', workId);
      }
    }
  };

  const handleWorkListDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedAssignment) return;

    // 将工作项添加回待分配列表
    setWorkItems([...workItems, draggedAssignment.work]);
    // 从分配中移除
    setAssignments(assignments.filter(a => a.workId !== draggedAssignment.workId));
    setDraggedAssignment(null);
  };

  return (
    <div className="container">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '12px 20px',
          },
          success: {
            style: {
              border: '1px solid #86efac',
              background: '#f0fdf4',
            },
          },
          error: {
            style: {
              border: '1px solid #fca5a5',
              background: '#fef2f2',
            },
          },
        }}
      />
      <BackButton />
      <h1>工作分配计划</h1>
      
      <div className="section-card">
        <h2>📅 工作日程范围</h2>
        <DateControls
          startDate={startDate}
          endDate={endDate}
          numberOfPeople={numberOfPeople}
          people={people}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onNumberOfPeopleChange={handleNumberOfPeopleChange}
          onPersonNameChange={handlePersonNameChange}
          onPersonHolidayChange={handlePersonHolidayChange}
        />
      </div>

      <div className="section-card">
        <h2>✏️ 添加工作</h2>
        <WorkInput
          title={newWork.title}
          manDays={newWork.manDays}
          onTitleChange={(title: string) => setNewWork({ ...newWork, title })}
          onManDaysChange={(manDays: number) => setNewWork({ ...newWork, manDays })}
          onAdd={handleAddWork}
          isEditing={!!editingWork}
        />
      </div>

      <div className="section-card">
        <h2>🛠 工具设置</h2>
        <ToolControls
          isHighLightWeekend={isHighLightWeekend}
          isShowHolidays={isShowHolidays}
          onHighLightWeekendChange={setIsHighLightWeekend}
          onShowHolidaysChange={setIsShowHolidays}
        />
      </div>

      <div className="section-card">
        <h2>📋 工作分配</h2>
        <div className="work-area">
          <WorkList
            workItems={workItems}
            onDragStart={handleDragStart}
            onDrop={handleWorkListDrop}
            onEdit={handleEditWork}
            onDelete={handleDeleteWork}
          />

          <Timeline
            startDate={startDate}
            endDate={endDate}
            people={people}
            assignments={assignments}
            isHighLightWeekend={isHighLightWeekend}
            isShowHolidays={isShowHolidays}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onPersonNameChange={handlePersonNameChange}
          />
        </div>
      </div>
    </div>
  );
} 