let stream = null

export async function startCamera(videoElement, facingMode = 'environment') {
  try {
    stopCamera()
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        aspectRatio: { ideal: 16/9 }
      },
      audio: false
    })
    videoElement.srcObject = stream
    await videoElement.play()
    return stream
  } catch (error) {
    console.error('Camera error:', error)
    throw error
  }
}

export function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
}

export function captureFrame(videoElement) {
  const canvas = document.createElement('canvas')
  canvas.width = videoElement.videoWidth || 640
  canvas.height = videoElement.videoHeight || 480
  const ctx = canvas.getContext('2d')
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.85)
}

export function hasCamera() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}
