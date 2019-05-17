import delve from 'dlv'
import { paginate } from './slack-fetch'
import { conversation as conversationScopes } from './scopes'

export default async (
  { access_token, team_name, team_id, scope, user_id },
  options
) => {
  const scopes = scope.split(',')

  // Process our scopes into a list of types of conversations to fetch
  const types = conversationScopes
    .filter((type) => scopes.includes(type))
    .map((type) => {
      type = type.split(':')[0]
      // Private and public channels are named differently in scopes
      if (type === 'channels') return 'public_channel'
      if (type === 'groups') return 'private_channel'
      return type
    })

  // Fetch conversations and users if we are fetching IM as a type so that we
  // can match user ids to display names
  const [{ channels }, { members = [] } = {}] = await Promise.all([
    paginate(
      `conversations.list?exclude_archived=true&types=${types}&token=${access_token}`,
      options
    ),
    types.includes('im')
      ? paginate(`users.list?token=${access_token}`, options)
      : undefined
  ])

  // Make it easier to look up users by ID
  const membersById = {}
  const membersByName = {}
  members.forEach((member) => {
    membersById[member.id] = member
    membersByName[member.name] = member
  })

  const me = membersById[user_id]
  const filtered = channels.filter((conversation) =>
    filterConversation(conversation, membersById, membersByName)
  )

  const groups = groupConversationsByType(filtered, {
    public: ({ is_channel }) => is_channel,
    private: ({ is_group, is_mpim }) => is_group && !is_mpim,
    im: ({ is_im }) => is_im,
    mpim: ({ is_mpim }) => is_mpim
  })

  const all = []

  groups.forEach(({ list, name }) => {
    // Add a display name for each conversation
    list.forEach((conversation) => {
      conversation.display_name = getDisplayName(name, conversation, me)
    })

    // Sort each type of conversation individually
    list.sort(conversationSort)

    // Create an array of all conversations
    all.push(...list)
  })

  return {
    groups,
    all
  }
}

const conversationSort = (a, b) => {
  if (a.is_general || b.is_general) return a.is_general ? -1 : 1
  return alphaSort(a.display_name, b.display_name)
}

const alphaSort = (a, b) => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

const getUserName = (user) =>
  delve(user, 'profile.display_name_normalized') || delve(user, 'name')

const filterConversation = (conversation, membersById, membersByName) => {
  // Remove anything that is archived or referencing a deleted user or
  // that the current user is not a member of. All these are explicit boolean
  // checks to protect against removing items where the keys are not present
  if (
    conversation.is_archived === true ||
    conversation.is_user_deleted === true ||
    conversation.is_member === false
  ) {
    return false
  }

  // Remove anything that has a last_read property and hasnt been read
  // in a certain number of days. Hopefully removes some items from large lists
  // and makes it less likely that you'll revive an old MP DM with a bunch of
  // coworkers with a gif of you making a weird face
  if (conversation.last_read) {
    const lastReadDays =
      (Date.now() - new Date(conversation.last_read.split('.')[0] * 1000)) /
      (1000 * 60 * 60 * 24)
    if (lastReadDays > 60) {
      return false
    }
  }

  // Remove multiparty messages where any users have been deleted
  if (conversation.is_mpim) {
    const deletedMpimMembers = getMpimMembers(conversation)
      .map((name) => membersByName[name])
      .filter((user) => user && user.deleted)
    if (deletedMpimMembers.length) {
      return false
    }
  }

  // Remove direct messages that dont reference a current real person user
  if (conversation.is_im) {
    const user = membersById[conversation.user]
    if (user && !user.deleted && !user.is_bot) {
      // Also assign user object to conversation to make it easier to get a display name
      conversation.user = user
      return true
    }
    return false
  }

  return true
}

const groupConversationsByType = (items, checks) => {
  const grouped = Object.keys(checks).map((key) => ({ name: key, list: [] }))

  // For each item, place it in its group based on the first successful check
  items.forEach((item) => {
    grouped.forEach((group) => {
      if (checks[group.name](item)) {
        group.list.push(item)
        return true
      }
    })
  })

  // Remove any groups with no conversations
  return grouped.filter(({ list }) => list.length)
}

const getMpimMembers = (conversation) =>
  conversation.name_normalized
    .toLowerCase()
    .replace('mpdm-', '')
    .replace(/-\d+$/, '')
    .split('--')
    .sort(alphaSort)

const getDisplayName = (key, conversation, me) => {
  // Add a display name for each conversation based on type
  switch (key) {
    case 'public':
    case 'private':
      return `#${conversation.name_normalized.toLowerCase()}`
    case 'im':
      return `@${getUserName(conversation.user).toLowerCase()}`
    case 'mpim':
      return `@${getMpimMembers(conversation)
        .filter((name) => name !== getUserName(me))
        .join(' @')}`
    default:
      return ''
  }
}
