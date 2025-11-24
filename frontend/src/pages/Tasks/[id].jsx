import React from 'react';
import { useParams } from 'react-router-dom';
import CommentSection from '../../components/comments/CommentSection';
import AttachmentList from '../../components/attachments/AttachmentList';

export default function TaskDetails() {
  const { id } = useParams();
  return (
    <div>
      <h1>Task {id}</h1>
      <p>Details for task {id} (placeholder).</p>
      <AttachmentList attachments={[]} />
      <CommentSection comments={[]} />
    </div>
  );
}
