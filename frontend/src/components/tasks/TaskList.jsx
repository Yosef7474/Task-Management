import React from 'react';
import TaskCard from './TaskCard';

export default function TaskList({ tasks = [], teamMembers = [], userRole, onDelete }) {
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          teamMembers={teamMembers}
          userRole={userRole}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
