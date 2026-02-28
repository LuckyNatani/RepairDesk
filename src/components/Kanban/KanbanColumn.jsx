import React from 'react';
import TaskCard from './TaskCard';
import { Droppable } from '@hello-pangea/dnd';

const KanbanColumn = ({ title, status, tasks, onTaskClick, isOwner, staffMembers, onAssign }) => {
    const filteredTasks = tasks.filter(task => task.status === status);

    return (
        <div className="flex flex-col w-full min-h-[400px] bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-sm font-bold text-gray-900 flex items-center">
                    {title}
                    <span className="ml-2 px-2 py-0.5 bg-white border border-gray-200 rounded-full text-[10px] text-gray-500 font-medium shadow-sm">
                        {filteredTasks.length}
                    </span>
                </h2>
            </div>

            <Droppable droppableId={status}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-250px)] no-scrollbar pb-4 transition-colors ${snapshot.isDraggingOver ? 'bg-gray-100/50 rounded-xl' : ''}`}
                    >
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task, index) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    index={index}
                                    onClick={onTaskClick}
                                    isOwner={isOwner}
                                    staffMembers={staffMembers}
                                    onAssign={onAssign}
                                />
                            ))
                        ) : (
                            <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400 font-medium">
                                No tasks here
                            </div>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default KanbanColumn;
