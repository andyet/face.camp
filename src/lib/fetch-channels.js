import slackFetch from './slack-fetch'

export class AbortChannelsError extends Error {}

export default ({ access_token, team_name, team_id }, currentTeam) =>
  slackFetch(
    `https://slack.com/api/channels.list?exclude_members=true&exclude_archived=true&token=${access_token}`
  ).then((data) => {
    if (team_id !== currentTeam().team_id) throw new AbortChannelsError()

    return data.channels.filter(({ is_member }) => is_member).sort((a, b) => {
      if (a.is_general) return -1
      if (b.is_general) return 1
      return a.name_normalized - b.name_normalized
    })
  })
