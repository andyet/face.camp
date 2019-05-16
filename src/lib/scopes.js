export const conversation = [
  'channels:read',
  'groups:read',
  'im:read',
  'mpim:read'
]

export default [...conversation, 'identify', 'users:read', 'files:write:user']
