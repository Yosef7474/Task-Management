import React, { useState } from 'react';

export default function TaskForm({ onSubmit, initial = {} }) {
  const [title, setTitle] = useState(initial.title || '');
  const [description, setDescription] = useState(initial.description || '');

  const submit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ title, description });
  };

  return (
    <form onSubmit={submit}>
      <div>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <button type="submit">Save</button>
    </form>
  );
}
