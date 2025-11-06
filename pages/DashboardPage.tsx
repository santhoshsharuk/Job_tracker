import React, { useState, useMemo } from 'react';
import { Application, Filter } from '../types';
import Dashboard from '../components/Dashboard';
import FilterControls from '../components/FilterControls';
import ApplicationList from '../components/ApplicationList';
import UpcomingReminders from '../components/UpcomingReminders';
import { generateSummary } from '../services/geminiService';
import { PlusCircle } from 'lucide-react';

interface DashboardPageProps {
    applications: Application[];
    onAddApplication: () => void;
    onEditApplication: (app: Application) => void;
    onDeleteApplication: (id: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
    applications,
    onAddApplication,
    onEditApplication,
    onDeleteApplication
}) => {
    const [filter, setFilter] = useState<Filter>({ search: '', status: 'All', startDate: '', endDate: '' });
    const [aiSummary, setAiSummary] = useState<string>('');
    const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);

    const handleGenerateSummary = async () => {
        setIsSummaryLoading(true);
        setAiSummary('');
        try {
            const summary = await generateSummary(applications);
            setAiSummary(summary);
        } catch (error) {
            console.error("Failed to generate AI summary:", error);
            setAiSummary("Sorry, I couldn't generate a summary right now. Please try again later.");
        } finally {
            setIsSummaryLoading(false);
        }
    };

    const filteredApplications = useMemo(() => {
        return applications
            .filter(app => {
                const searchLower = filter.search.toLowerCase();
                const matchesSearch =
                    app.company.toLowerCase().includes(searchLower) ||
                    app.position.toLowerCase().includes(searchLower) ||
                    (app.notes && app.notes.toLowerCase().includes(searchLower));

                const matchesStatus = filter.status === 'All' || app.status === filter.status;
                
                const appDate = new Date(app.appliedDate);
                const startDate = filter.startDate ? new Date(filter.startDate) : null;
                const endDate = filter.endDate ? new Date(filter.endDate) : null;

                if (endDate) {
                    endDate.setUTCHours(23, 59, 59, 999);
                }

                const matchesDate =
                    (!startDate || appDate >= startDate) &&
                    (!endDate || appDate <= endDate);

                return matchesSearch && matchesStatus && matchesDate;
            })
            .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
    }, [applications, filter]);

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <Dashboard
                applications={applications}
                onGenerateSummary={handleGenerateSummary}
                summary={aiSummary}
                isSummaryLoading={isSummaryLoading}
            />

            <UpcomingReminders
                applications={applications}
                onEditApplication={onEditApplication}
            />

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                    <div className="flex-grow">
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">My Applications</h2>
                        <FilterControls filter={filter} setFilter={setFilter} />
                    </div>
                </div>
                {filteredApplications.length > 0 ? (
                    <ApplicationList
                        applications={filteredApplications}
                        onEdit={onEditApplication}
                        onDelete={onDeleteApplication}
                    />
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-500">No matching applications found.</h3>
                        <p className="text-gray-400 mt-2">Try adjusting your filters or adding a new application.</p>
                        <button
                            onClick={onAddApplication}
                            className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                        >
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Add Application
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
