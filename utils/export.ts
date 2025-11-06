import { Application } from '../types';

// Let TypeScript know that jsPDF is available on the global window object
declare const jspdf: any;

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
const getFilename = (extension: string) => `job_applications_${new Date().toISOString().split('T')[0]}.${extension}`;

// Helper to escape CSV values
const escapeCSV = (value: string | undefined): string => {
    if (value === undefined || value === null) {
        return '""';
    }
    const str = String(value);
    // If the value contains a comma, a double quote, or a newline, wrap it in double quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        // Also, double up any existing double quotes
        return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
};

export const exportToCSV = (applications: Application[]) => {
    const headers = [
        'Company', 'Position', 'Status', 'Applied Date', 'Source', 
        'Job Link', 'Notes', 'Reminder Date', 'Reminder Note'
    ];
    const rows = applications.map(app => [
        escapeCSV(app.company),
        escapeCSV(app.position),
        escapeCSV(app.status),
        escapeCSV(app.appliedDate),
        escapeCSV(app.source),
        escapeCSV(app.jobLink),
        escapeCSV(app.notes),
        escapeCSV(app.reminderDate),
        escapeCSV(app.reminderNote),
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', getFilename('csv'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToPDF = (applications: Application[]) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    doc.text('Job Application Report', 14, 16);

    const tableColumn = ['Company', 'Position', 'Status', 'Applied Date'];
    const tableRows: (string | undefined)[][] = [];

    applications.forEach(app => {
        const appData = [
            app.company,
            app.position,
            app.status,
            formatDate(app.appliedDate),
        ];
        tableRows.push(appData);
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: 'striped',
        headStyles: { fillColor: [29, 78, 216] }, // primary-700 color
    });

    doc.save(getFilename('pdf'));
};
