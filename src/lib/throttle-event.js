// https://developer.mozilla.org/en-US/docs/Web/Events/resize#requestAnimationFrame_customEvent
export default (originalEvent, handler) => {
  let running = false
  const newEvent = `optimized_raf_${originalEvent}`

  // Dispatch custom event using raf
  const rafDispatch = () => {
    if (running) return
    running = true
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent(newEvent))
      running = false
    })
  }

  // Add listeners for original and custom event
  window.addEventListener(originalEvent, rafDispatch)
  window.addEventListener(newEvent, handler)

  // Return function to remove both listeners
  return () => {
    window.removeEventListener(originalEvent, rafDispatch)
    window.removeEventListener(newEvent, handler)
  }
}
