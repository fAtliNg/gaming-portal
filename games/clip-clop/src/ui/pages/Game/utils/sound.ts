export function playSound(src: string, volume: number) {
  try {
    const a = new Audio(src)
    a.volume = volume
    a.play()
  } catch {}
}

