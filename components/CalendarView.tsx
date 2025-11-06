import React, { useState } from 'react';
import { Application } from '../types';
import { ChevronLeft, ChevronRight, Send, Bell } from 'lucide-react';

interface CalendarViewProps {
  applications: Application[];
  onEditApplication: (app: Application) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ applications, onEditApplication }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4 px-2">
      <h2 className="text-xl font-bold text-gray-800">
        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h2>
      <div className="flex items-center gap-2">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const renderDaysOfWeek = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rows = [];
    let days = [];
    let day = new Date(startDate);

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const dayKey = cloneDay.toISOString().split('T')[0];
        
        const isCurrentMonth = cloneDay.getMonth() === currentDate.getMonth();
        const isToday = cloneDay.getTime() === today.getTime();

        const dayApplications = applications.filter(app => {
            // Adjust for timezone differences
            const applied = new Date(app.appliedDate);
            applied.setMinutes(applied.getMinutes() + applied.getTimezoneOffset());
            return applied.toISOString().split('T')[0] === dayKey;
        });

        const dayReminders = applications.filter(app => {
           if (!app.reminderDate) return false;
           const reminder = new Date(app.reminderDate);
           reminder.setMinutes(reminder.getMinutes() + reminder.getTimezoneOffset());
           return reminder.toISOString().split('T')[0] === dayKey;
        });

        days.push(
          <div
            key={dayKey}
            className={`border border-gray-200 p-2 h-32 flex flex-col ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}`}
          >
            <span className={`font-medium self-start px-2 py-0.5 rounded-full text-sm ${
              isToday ? 'bg-primary-600 text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
            }`}>
              {cloneDay.getDate()}
            </span>
            <div className="mt-1 space-y-1 overflow-y-auto">
              {dayApplications.map(app => (
                <div key={`${app.id}-applied`} onClick={() => onEditApplication(app)} className="bg-blue-100 text-blue-800 p-1 rounded-md text-xs cursor-pointer hover:bg-blue-200 transition-colors flex items-center gap-1.5">
                    <Send className="h-3 w-3 flex-shrink-0"/>
                    <span className="truncate">{app.company}</span>
                </div>
              ))}
              {dayReminders.map(app => (
                 <div key={`${app.id}-reminder`} onClick={() => onEditApplication(app)} className="bg-amber-100 text-amber-800 p-1 rounded-md text-xs cursor-pointer hover:bg-amber-200 transition-colors flex items-center gap-1.5">
                     <Bell className="h-3 w-3 flex-shrink-0"/>
                     <span className="truncate">{app.company}</span>
                 </div>
              ))}
            </div>
          </div>
        );
        day.setDate(day.getDate() + 1);
      }
      rows.push(
        <div key={day.getTime()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-1">{rows}</div>;
  };


  return (
    <div>
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
};

export default CalendarView;