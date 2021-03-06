const LS_KEY = 'facecamp-data'

const sortTeams = (teams) =>
  teams.sort(({ team_name: a }, { team_name: b }) => {
    if (a > b) return 1
    if (a < b) return -1
    return 0
  })

const deleteAllTeams = () => localStorage.removeItem(LS_KEY)

const getTeams = () => {
  const teams = JSON.parse(localStorage.getItem(LS_KEY))
  if (teams) {
    if (Array.isArray(teams)) {
      return sortTeams(teams)
    } else {
      return [teams]
    }
  }
  return []
}

const createTeamUpdater = (updater) => (team, ...args) => {
  const teams = getTeams()
  const newTeams = updater(
    teams,
    teams.findIndex(({ team_id }) => team_id === team.team_id),
    team,
    ...args
  )
  localStorage.setItem(LS_KEY, JSON.stringify(newTeams))
  return sortTeams(newTeams)
}

const addTeam = createTeamUpdater((teams, index, team) => {
  if (index > -1) {
    teams[index] = team
  } else {
    teams.push(team)
  }
  teams.forEach((t) => {
    t.selected = t === team
  })
  return teams
})

const deleteTeam = createTeamUpdater((teams, index, team) => {
  if (index > -1) {
    teams.splice(index, 1)
    if (team.selected && teams.length) {
      const nextSelected = index < teams.length ? index : teams.length - 1
      teams[nextSelected].selected = true
    }
  }
  return teams
})

const updateTeam = createTeamUpdater((teams, index, team, values) => {
  if (index > -1) {
    teams[index] = { ...team, ...values }
  }
  return teams
})

// Dont use lib/slack-fetch here since it polyfills abortcontroller which adds
// a few kilobytes to the initial bundle and isnt needed here
const revokeTeam = (team) =>
  fetch(`https://slack.com/api/auth.revoke?token=${team.access_token}`)

const readTeams = () => {
  const { hash } = window.location
  if (hash && hash.length > 1) {
    try {
      const team = JSON.parse(decodeURIComponent(hash.slice(1)))
      const teams = addTeam(team)
      window.location.hash = ''
      return teams
    } catch (e) {
      return deleteAllTeams()
    }
  } else {
    try {
      return getTeams()
    } catch (e) {
      return deleteAllTeams()
    }
  }
}

const authUrl = `${window.location.origin}/_api/auth`

export { authUrl as url }
export { readTeams as read }
export { updateTeam as update }
export { deleteTeam as delete }
export { revokeTeam as revoke }
export { addTeam as add }
