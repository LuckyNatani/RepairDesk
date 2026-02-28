import React from 'react';
import KanbanColumn from './KanbanColumn';
import { DragDropContext } from '@hello-pangea/dnd';

const KanbanBoard = ({ tasks, onTaskClick, onTaskDragEnd, isOwner, staffMembers, onAssign }) => {
    const handleDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (onTaskDragEnd) {
            onTaskDragEnd(draggableId, destination.droppableId);
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
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
        </DragDropContext>
    );
};

export default KanbanBoard;
