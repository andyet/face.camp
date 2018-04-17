const pad = (n) => (n.toString().length === 1 ? `0${n}` : n)

export default () => {
  const d = new Date()
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const time = `${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(
    d.getSeconds()
  )}`
  return `${date} ${time}`
}
