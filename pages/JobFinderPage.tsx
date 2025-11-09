import React from 'react';

const JobFinderPage: React.FC = () => {
  return (
    <div className="h-full w-full">
      <iframe
        src="https://linkedin-job-fetch.onrender.com"
        className="w-full h-full border-0"
        title="LinkedIn Job Finder"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
};

export default JobFinderPage;
