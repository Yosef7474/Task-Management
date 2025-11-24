import React, { useRef } from 'react'
import { useUploadAttachmentMutation, useDeleteAttachmentMutation } from '../../store/api/attachmentsApi'
import { useAuth } from '../../context/authContext'

const AttachmentList = ({ taskId, attachments, onAttachmentChange }) => {
  const { user } = useAuth()
  const fileInputRef = useRef()
  const [uploadAttachment, { isLoading: uploading }] = useUploadAttachmentMutation()
  const [deleteAttachment] = useDeleteAttachmentMutation()

  const canUpload = user.role !== 'USER'

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      await uploadAttachment({ taskId, file }).unwrap()
      onAttachmentChange()
      event.target.value = '' // Reset file input
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload file')
    }
  }

  const handleDeleteAttachment = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteAttachment(attachmentId).unwrap()
        onAttachmentChange()
      } catch (error) {
        console.error('Delete failed:', error)
        alert('Failed to delete file')
      }
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Attachments</h3>
        {canUpload && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {attachments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-4xl mb-2">📎</div>
          <p>No attachments yet</p>
          {canUpload && (
            <p className="text-sm mt-2">Click "Upload File" to add attachments</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600">📎</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{attachment.filename}</p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(attachment.fileSize)} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <a
                  href={`http://localhost:5000${attachment.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Download
                </a>
                {canUpload && (
                  <button
                    onClick={() => handleDeleteAttachment(attachment.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AttachmentList