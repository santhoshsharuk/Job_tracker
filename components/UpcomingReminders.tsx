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
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
        <Bell className="h-5 w-5 text-amber-500 mr-2" />
        Reminders For This Week
      </h3>
      <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
        {upcomingReminders.map(app => (
          <div key={app.id} className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-gray-800 truncate">{app.position} at {app.company}</p>
              <p className="text-sm text-gray-500">
                Due: {new Date(app.reminderDate!+ 'T00:00:00').toLocaleDateString()}
              </p>
              {app.reminderNote && <p className="text-sm text-gray-600 mt-1 italic truncate">"{app.reminderNote}"</p>}
            </div>
            <button
              onClick={() => onEditApplication(app)}
              className="ml-4 p-2 text-gray-500 hover:text-primary-600 hover:bg-white rounded-full transition-colors flex-shrink-0"
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