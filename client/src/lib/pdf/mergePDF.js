import { runPDFWorker } from '../../webworker/workerClient'

export async function mergePDFs(files, onProgress) {
  try {
    const buffers = []
    
    // Read all files into ArrayBuffers
    for (let i = 0; i < files.length; i++) {
      const buffer = await files[i].arrayBuffer()
      buffers.push(buffer)
    }
    
    const blob = await runPDFWorker(
      'MERGE', 
      { buffers }, 
      onProgress
    )
    
    return blob
  } catch (error) {
    throw new Error(`Failed to merge PDFs: ${error.message}`)
  }
}

export function validatePDFFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }
  
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Please select valid PDF files only' }
  }
  
  return { valid: true }
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
