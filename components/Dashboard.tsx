import React from 'react';
import { Application, Status } from '../types';
import { BarChart, CheckCircle, Clock, FileText, Send, Sparkles } from 'lucide-react';

interface DashboardProps {
  applications: Application[];
  onGenerateSummary: () => void;
  summary: string;
  isSummaryLoading: boolean;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number; color: string }> = ({ icon, title, value, color }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex items-center space-x-3 sm:space-x-4">
    <div className={`p-2 sm:p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs sm:text-sm font-medium text-gray-500">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ applications, onGenerateSummary, summary, isSummaryLoading }) => {
  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === Status.APPLIED).length,
    interviewing: applications.filter(a => a.status === Status.INTERVIEWING).length,
    offers: applications.filter(a => a.status === Status.OFFER).length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard icon={<FileText className="h-6 w-6 text-blue-800"/>} title="Total Applied" value={stats.total} color="bg-blue-100"/>
        <StatCard icon={<Send className="h-6 w-6 text-indigo-800"/>} title="Pending Reply" value={stats.applied} color="bg-indigo-100"/>
        <StatCard icon={<Clock className="h-6 w-6 text-amber-800"/>} title="Interviewing" value={stats.interviewing} color="bg-amber-100"/>
        <StatCard icon={<CheckCircle className="h-6 w-6 text-green-800"/>} title="Offers" value={stats.offers} color="bg-green-100"/>
      </div>
      
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
              <Sparkles className="h-5 w-5 text-primary-500 mr-2" />
              AI-Powered Summary
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Get a quick overview of your job search progress.</p>
          </div>
          <button 
            onClick={onGenerateSummary}
            disabled={isSummaryLoading}
            className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-primary-600 text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSummaryLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Summary'
            )}
          </button>
        </div>
        {summary && (
          <div className="mt-4 p-3 sm:p-4 bg-primary-50 border-l-4 border-primary-400 rounded-r-lg">
            <p className="text-sm sm:text-base text-primary-800">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;