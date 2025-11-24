import React from 'react';

export default function AttachmentList({ attachments = [] }) {
  return (
    <div className="attachments">
      <h4>Attachments</h4>
      <ul>
        {attachments.map((a) => (
          <li key={a.id}>{a.filename}</li>
        ))}
      </ul>
    </div>
  );
}
