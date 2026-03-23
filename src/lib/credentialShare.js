const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin

export function generateOwnerCredentials({ businessName, ownerName, email, tempPassword }) {
  return [
    `🔧 *TaskPod — Your Account is Ready*`,
    '',
    `Business: ${businessName}`,
    `Name: ${ownerName}`,
    `Login: ${email}`,
    `Password: ${tempPassword}`,
    `App: ${APP_URL}`,
    '',
    '⚠ Please change your password after first login.',
    '_Sent from TaskPod Admin_',
  ].join('\n')
}

export function generateStaffCredentials({ staffName, email, tempPassword, businessName }) {
  return [
    `📋 *TaskPod — Staff Account Ready*`,
    '',
    `Name: ${staffName}`,
    `Business: ${businessName}`,
    `Login: ${email}`,
    `Password: ${tempPassword}`,
    `App: ${APP_URL}`,
    '',
    '⚠ Please change your password after first login.',
    '_Sent from TaskPod_',
  ].join('\n')
}
