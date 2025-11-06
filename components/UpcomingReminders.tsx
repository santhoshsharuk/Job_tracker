import React from 'react';
import { Application } from '../types';
import { Bell, Edit } from 'lucide-react';

interface UpcomingRemindersProps {
  applications: Application[];
  onEditApplication: (app: Application) => void;
}

const UpcomingReminders: React.FC<UpcomingRemindersProps> = ({ applications, onEditApplication }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  const upcomingReminders = applications
    .filter(app => {
        if (!app.reminderDate) return false;
        const reminderDate = new Date(app.reminderDate + 'T00:00:00');
        return reminderDate >= today && reminderDate <= sevenDaysLater;
    })
    .sort((a, b) => new Date(a.reminderDate!).getTime() - new Date(b.reminderDate!).getTime());

  if (upcomingReminders.length === 0) {
    return null; // Don't render anything if there are no reminders for this week
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center mb-3 sm:mb-4">
        <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mr-2 flex-shrink-0" />
        Reminders For This Week
      </h3>
      <div className="space-y-2 sm:space-y-3 max-h-48 overflow-y-auto pr-1 sm:pr-2">
        {upcomingReminders.map(app => (
          <div key={app.id} className="flex justify-between items-start sm:items-center p-2 sm:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base text-gray-800 truncate">{app.position} at {app.company}</p>
              <p className="text-xs sm:text-sm text-gray-500">
                Due: {new Date(app.reminderDate!+ 'T00:00:00').toLocaleDateString()}
              </p>
              {app.reminderNote && <p className="text-xs sm:text-sm text-gray-600 mt-1 italic line-clamp-2">"{app.reminderNote}"</p>}
            </div>
            <button
              onClick={() => onEditApplication(app)}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-primary-600 hover:bg-white rounded-full transition-colors flex-shrink-0"
              aria-label={`Edit reminder for ${app.position}`}
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingReminders;