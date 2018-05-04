const LS_KEY = 'facecamp-data'

const getTeams = () => {
  const teams = JSON.parse(localStorage.getItem(LS_KEY))
  if (teams) {
    if (Array.isArray(teams)) {
      return teams
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
    teams.findIndex((t) => t.team_id === team.team_id),
    team,
    ...args
  )
  localStorage.setItem(LS_KEY, JSON.stringify(newTeams))
  return newTeams
}

const addTeam = createTeamUpdater((teams, index, team) => {
  if (index > -1) {
    teams.splice(index, 1)
  }
  teams.unshift(team)
  return teams
})

export const deleteTeam = createTeamUpdater((teams, index) => {
  if (index > -1) {
    teams.splice(index, 1)
  }
  return teams
})

export const updateTeam = createTeamUpdater((teams, index, team, values) => {
  if (index > -1) {
    teams[index] = { ...team, ...values }
  }
  return teams
})

export const selectTeam = createTeamUpdater((teams, index) =>
  teams.map((team, teamIndex) => {
    team.selected = index === teamIndex
    return team
  })
)

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

export const authUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://auth.face.camp'
    : `http://${window.location.hostname}:3000`
