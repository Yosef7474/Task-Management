import React from 'react';
import TaskList from '../../components/tasks/TaskList';

export default function TasksPage() {
  const sample = [{ id: 1, title: 'Sample task', description: 'Example' }];
  return (
    <div>
      <h1>Tasks</h1>
      <TaskList tasks={sample} />
    </div>
  );
}
