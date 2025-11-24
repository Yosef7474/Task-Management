import React from 'react';

export default function TaskFilters({ onChange }) {
  return (
    <div className="task-filters">
      <select onChange={(e) => onChange && onChange(e.target.value)}>
        <option value="all">All</option>
        <option value="open">Open</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}
