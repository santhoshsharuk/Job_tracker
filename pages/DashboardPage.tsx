import React, { useState, useMemo, useEffect } from 'react';
import { Application, Filter } from '../types';
import Dashboard from '../components/Dashboard';
import FilterControls from '../components/FilterControls';
import ApplicationList from '../components/ApplicationList';
import UpcomingReminders from '../components/UpcomingReminders';
import CalendarView from '../components/CalendarView';
import PaginationControls from '../components/PaginationControls';
import { generateSummary } from '../services/geminiService';
import { PlusCircle, List, Calendar as CalendarIcon } from 'lucide-react';

interface DashboardPageProps {
    applications: Application[];
    onAddApplication: () => void;
    onEditApplication: (app: Application) => void;
    onDeleteApplication: (id: string) => void;
}

const ITEMS_PER_PAGE = 10;

const DashboardPage: React.FC<DashboardPageProps> = ({
    applications,
    onAddApplication,
    onEditApplication,
    onDeleteApplication
}) => {
    const [filter, setFilter] = useState<Filter>({ search: '', status: 'All', startDate: '', endDate: '' });
    const [aiSummary, setAiSummary] = useState<string>('');
    const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [currentPage, setCurrentPage] = useState(1);

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
    
    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    // Pagination logic
    const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
    const paginatedApplications = filteredApplications.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );


    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
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

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                 <div className="flex flex-col md:flex-row justify-between items-start mb-4 sm:mb-6 gap-4">
                    <div className="flex-grow w-full">
                        <div className="flex justify-between items-center mb-2">
                             <h2 className="text-xl sm:text-2xl font-bold text-gray-700">My Applications</h2>
                            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                                <button onClick={() => setView('list')} className={`px-2 sm:px-3 py-1 text-sm font-medium rounded-md transition-colors ${view === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                    <List className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                                <button onClick={() => setView('calendar')} className={`px-2 sm:px-3 py-1 text-sm font-medium rounded-md transition-colors ${view === 'calendar' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                    <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                            </div>
                        </div>
                        {view === 'list' && <FilterControls filter={filter} setFilter={setFilter} />}
                    </div>
                </div>

                {view === 'list' ? (
                     <>
                        {filteredApplications.length > 0 ? (
                            <>
                                <ApplicationList
                                    applications={paginatedApplications}
                                    onEdit={onEditApplication}
                                    onDelete={onDeleteApplication}
                                />
                                {totalPages > 1 && (
                                    <PaginationControls
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 sm:py-16 border-2 border-dashed border-gray-200 rounded-lg">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-500">No matching applications found.</h3>
                                <p className="text-sm sm:text-base text-gray-400 mt-2 px-4">Try adjusting your filters or adding a new application.</p>
                                <button
                                    onClick={onAddApplication}
                                    className="mt-4 inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    Add Application
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <CalendarView 
                        applications={filteredApplications} 
                        onEditApplication={onEditApplication} 
                    />
                )}
            </div>
        </div>
    );
};

export default DashboardPage;