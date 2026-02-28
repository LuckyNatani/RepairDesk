import React from 'react';

const StatusBadge = ({ status }) => {
    const styles = {
        unassigned: 'bg-gray-100 text-gray-700 border-gray-200',
        in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
        completed: 'bg-green-50 text-green-700 border-green-200',
    };

    const labels = {
        unassigned: 'Unassigned',
        in_progress: 'In Progress',
        completed: 'Completed',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};

export default StatusBadge;
