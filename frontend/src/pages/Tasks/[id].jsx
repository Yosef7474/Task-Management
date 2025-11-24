import React from 'react'
import { useParams } from 'react-router-dom'

const TaskDetail = () => {
  const { id } = useParams()
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Task Details</h1>
      <p>Task ID: {id}</p>
      {/* Task details will go here */}
    </div>
  )
}

export default TaskDetail