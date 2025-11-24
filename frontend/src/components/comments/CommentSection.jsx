import React, { useState } from 'react'
import { useAddCommentMutation, useDeleteCommentMutation } from '../../store/api/commentsApi'
import { useAuth } from '../../context/authContext'

const CommentSection = ({ taskId, comments, onCommentAdded }) => {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [addComment, { isLoading: adding }] = useAddCommentMutation()
  const [deleteComment] = useDeleteCommentMutation()

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await addComment({ taskId, content: newComment }).unwrap()
      setNewComment('')
      onCommentAdded()
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert('Failed to add comment')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(commentId).unwrap()
        onCommentAdded()
      } catch (error) {
        console.error('Failed to delete comment:', error)
        alert('Failed to delete comment')
      }
    }
  }

  const canDeleteComment = (comment) => {
    return user.role === 'ADMIN' || comment.userId === user.id
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Comments</h3>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={adding || !newComment.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p>No comments yet</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {comment.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-800">{comment.user.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                  {canDeleteComment(comment) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CommentSection