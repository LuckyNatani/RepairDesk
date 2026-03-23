import { Plus } from 'lucide-react'

export default function FAB({ onClick, visible = true }) {
  return (
    <button className={`fab${!visible ? ' hidden' : ''}`} onClick={onClick} aria-label="New Task">
      <Plus size={24} strokeWidth={2.5} />
    </button>
  )
}
