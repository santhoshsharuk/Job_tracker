import React, { useState, useEffect } from 'react';
import { Application, Status } from '../types';
import { X } from 'lucide-react';

interface ApplicationFormProps {
  application: Application | null;
  onSave: (application: Application) => void;
  onClose: () => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ application, onSave, onClose }) => {
  const getInitialFormData = () => {
    const appliedDate = new Date().toISOString().split('T')[0];
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 7);
    const reminderDateStr = reminderDate.toISOString().split('T')[0];
    
    return {
      company: '',
      position: '',
      appliedDate: appliedDate,
      source: '',
      jobLink: '',
      status: Status.APPLIED,
      notes: '',
      reminderDate: reminderDateStr,
      reminderNote: '',
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company,
        position: application.position,
        appliedDate: application.appliedDate,
        source: application.source,
        jobLink: application.jobLink,
        status: application.status,
        notes: application.notes,
        reminderDate: application.reminderDate || '',
        reminderNote: application.reminderNote || '',
      });
    } else {
      setFormData(getInitialFormData());
    }
  }, [application]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newState = { ...prev, [name]: value };
        // For new applications, update the default reminder date when the applied date changes.
        if (!application && name === 'appliedDate' && value) {
            try {
                const applied = new Date(value);
                // Adjust for timezone to prevent the date from shifting
                applied.setMinutes(applied.getMinutes() + applied.getTimezoneOffset());
                applied.setDate(applied.getDate() + 7);
                newState.reminderDate = applied.toISOString().split('T')[0];
            } catch (e) {
                console.error("Invalid date provided for 'appliedDate'", e);
            }
        }
        return newState;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.company && formData.position) {
      onSave({
        ...formData,
        id: application ? application.id : ''
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{application ? 'Edit Application' : 'Add New Application'}</h2>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600">
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange} required className="mt-1 block w-full rounded-lg border-2 border-gray-300 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"/>
              </div>
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
                <input type="text" name="position" value={formData.position} onChange={handleChange} required className="mt-1 block w-full rounded-lg border-2 border-gray-300 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"/>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="appliedDate" className="block text-sm font-medium text-gray-700">Applied Date</label>
                <input type="date" name="appliedDate" value={formData.appliedDate} onChange={handleChange} required className="mt-1 block w-full rounded-lg border-2 border-gray-300 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"/>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-lg border-2 border-gray-300 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition">
                  {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
               <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source (e.g., LinkedIn)</label>
                <input type="text" name="source" value={formData.source} onChange={handleChange} className="mt-1 block w-full rounded-lg border-2 border-gray-300 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"/>
              </div>
              <div>
                <label htmlFor="jobLink" className="block text-sm font-medium text-gray-700">Job Post Link</label>
                <input type="url" name="jobLink" value={formData.jobLink} onChange={handleChange} className="mt-1 block w-full rounded-lg border-2 border-gray-300 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"/>
              </div>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-lg border-gray-200 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"></textarea>
            </div>
            
            <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Follow-up Reminder</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Set a date for a follow-up. Leave blank to disable.</p>
                <div className="space-y-4 sm:space-y-6">
                    <div>
                        <label htmlFor="reminderDate" className="block text-sm font-medium text-gray-700">Reminder Date</label>
                        <input type="date" name="reminderDate" value={formData.reminderDate} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-200 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"/>
                    </div>
                    <div>
                         <label htmlFor="reminderNote" className="block text-sm font-medium text-gray-700">Reminder Note (Optional)</label>
                        <textarea name="reminderNote" value={formData.reminderNote} onChange={handleChange} rows={2} placeholder="e.g., Follow up with recruiter" className="mt-1 block w-full rounded-lg border-gray-200 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"></textarea>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
              <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">Cancel</button>
              <button type="submit" className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">Save Application</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;