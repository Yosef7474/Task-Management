import React, { useState } from 'react';

export default function CommentSection({ comments = [] }) {
  const [text, setText] = useState('');
  return (
    <section className="comments">
      <h4>Comments</h4>
      <ul>
        {comments.map((c) => (
          <li key={c.id}>{c.text}</li>
        ))}
      </ul>
      <form onSubmit={(e) => e.preventDefault()}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment" />
        <button type="submit">Add</button>
      </form>
    </section>
  );
}
