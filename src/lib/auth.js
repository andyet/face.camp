const LS_KEY = 'facecamp-data'

const sortTeams = (teams) => teams.sort((a, b) => b.last_used - a.last_used)

const getTeams = () => {
  let teams = JSON.parse(localStorage.getItem(LS_KEY))
  if (teams) {
    if (Array.isArray(teams)) {
      teams = sortTeams(teams)
    } else {
      teams = [teams]
    }
  }
  return teams
}

const createTeamUpdater = (updater) => (team, ...args) => {
  let teams = getTeams() || []
  const index = teams.findIndex((t) => t.team_id === team.team_id)
  updater(teams, index, team, ...args)
  localStorage.setItem(LS_KEY, JSON.stringify(teams))
  return sortTeams(teams)
}

const addTeam = createTeamUpdater((teams, index, team) => {
  if (index > -1) {
    teams.splice(index, 1)
  }
  team.last_used = Date.now()
  teams.unshift(team)
})

export const authUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://auth.face.camp'
    : `http://${window.location.hostname}:3000`

export const deleteTeam = createTeamUpdater((teams, index) => {
  if (index > -1) {
    teams.splice(index, 1)
  }
})

export const updateTeam = createTeamUpdater((teams, index, team, values) => {
  if (index > -1) {
    teams[index] = Object.assign(team, values)
  }
})

export const deleteAllTeams = () => localStorage.removeItem(LS_KEY)

export const readTeams = () => {
  const { hash } = window.location
  if (hash && hash.length > 1) {
    try {
      const teams = addTeam(JSON.parse(decodeURIComponent(hash.slice(1))))
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
