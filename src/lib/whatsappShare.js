/** Generate wa.me deep link for a task */
export function generateWhatsAppMessage(task, assignedStaffName = null) {
  const statusLabel = { unassigned: 'Unassigned', in_progress: 'In Progress', completed: 'Completed' }
  const lines = [
    `📋 *TaskPod — Task #${task.task_number}*`,
    `Status: ${statusLabel[task.status] || task.status}`,
    task.is_urgent ? '🔴 *URGENT*' : null,
    '',
    `Customer: ${task.customer_name}`,
    `Phone: ${task.customer_phone}`,
    task.customer_address ? `Address: ${task.customer_address}` : null,
    task.service_description ? `Service: ${task.service_description}` : null,
    assignedStaffName ? `Assigned to: ${assignedStaffName}` : null,
    task.due_at ? `Due: ${new Date(task.due_at).toLocaleString('en-IN')}` : null,
    '',
    '_Sent from TaskPod_',
  ]
  return lines.filter(Boolean).join('\n')
}

export function openWhatsApp(message, phone = null) {
  const encoded = encodeURIComponent(message)
  const url = phone
    ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
