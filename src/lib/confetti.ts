/** Launch a confetti burst from the top of the screen */
export function launchConfetti(count = 60) {
  const colors = ['#2d5a27', '#4ade80', '#fbbf24', '#f87171', '#60a5fa', '#c084fc', '#fb923c']

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    el.className = 'confetti-piece'
    el.style.left = `${Math.random() * 100}vw`
    el.style.top = `-20px`
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    el.style.animationDelay = `${Math.random() * 0.6}s`
    el.style.animationDuration = `${0.8 + Math.random() * 0.8}s`
    el.style.transform = `rotate(${Math.random() * 360}deg)`
    el.style.width = `${6 + Math.random() * 6}px`
    el.style.height = `${6 + Math.random() * 10}px`
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 2000)
  }
}
