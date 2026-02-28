import React from 'react';

const StatusBadge = ({ status }) => {
    const styles = {
        unassigned: 'bg-slate-100 text-slate-600 border-slate-200',
        in_progress: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
        completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    };

    const labels = {
        unassigned: 'Unassigned',
        in_progress: 'In Progress',
        completed: 'Completed',
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};

export default StatusBadge;
