export async function enterFullscreen(el: any): Promise<void> {
  try {
    if (el?.requestFullscreen) {
      await el.requestFullscreen()
    } else if (el?.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen()
    }
  } catch {}
}

export async function exitFullscreen(doc: Document & any): Promise<void> {
  try {
    if (doc.exitFullscreen) {
      await doc.exitFullscreen()
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen()
    }
  } catch {}
}

export async function toggleFullscreen(el: any, doc: Document & any): Promise<void> {
  if (doc.fullscreenElement) {
    await exitFullscreen(doc)
  } else {
    await enterFullscreen(el)
  }
}

