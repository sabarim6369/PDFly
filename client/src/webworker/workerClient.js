import PdfWorker from './pdf.worker?worker'

export function runPDFWorker(type, payload, onProgress) {
  return new Promise((resolve, reject) => {
    const worker = new PdfWorker()

    worker.onmessage = (e) => {
      const { type: msgType, progress, message, result, error } = e.data

      if (msgType === 'PROGRESS' && onProgress) {
        onProgress(progress, message)
      } else if (msgType === 'SUCCESS') {
        // result is an ArrayBuffer, convert it to a Blob
        const blob = new Blob([result], { type: 'application/pdf' })
        worker.terminate()
        resolve(blob)
      } else if (msgType === 'ERROR') {
        worker.terminate()
        reject(new Error(error))
      }
    }

    worker.onerror = (err) => {
      worker.terminate()
      reject(new Error(`Worker error: ${err.message}`))
    }

    // Determine what array buffers need to be transferred to avoid copying
    const transferables = []
    
    if (payload.buffers) {
      transferables.push(...payload.buffers)
    }

    worker.postMessage({ type, payload }, transferables)
  })
}
