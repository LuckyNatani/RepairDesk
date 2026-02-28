import React from 'react';
import KanbanColumn from './KanbanColumn';

const KanbanBoard = ({ tasks, onTaskClick, isOwner, staffMembers, onAssign }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <KanbanColumn
                title="Unassigned"
                status="unassigned"
                tasks={tasks}
                onTaskClick={onTaskClick}
                isOwner={isOwner}
                staffMembers={staffMembers}
                onAssign={onAssign}
            />
            <KanbanColumn
                title="In Progress"
                status="in_progress"
                tasks={tasks}
                onTaskClick={onTaskClick}
                isOwner={isOwner}
                staffMembers={staffMembers}
                onAssign={onAssign}
            />
            <KanbanColumn
                title="Completed"
                status="completed"
                tasks={tasks}
                onTaskClick={onTaskClick}
                isOwner={isOwner}
                staffMembers={staffMembers}
                onAssign={onAssign}
            />
        </div>
    );
};

export default KanbanBoard;
