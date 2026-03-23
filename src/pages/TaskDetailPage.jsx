import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import TaskDetail from '../components/Tasks/TaskDetail'

export default function TaskDetailPage() {
  const { taskId } = useParams()
  const { profile } = useAuth()
  return <TaskDetail taskId={taskId} currentUser={profile} />
}
