import React from 'react';

export default function TaskCard({ task }) {
  if (!task) return null;
  return (
    <article className="task-card">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
    </article>
  );
}
