import { runPDFWorker } from '../../webworker/workerClient'

export async function compressPDF(file, compressionLevel, onProgress) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    
    // Pass the buffer and compressionLevel to the worker
    const blob = await runPDFWorker(
      'COMPRESS', 
      { buffer: arrayBuffer, compressionLevel },
      onProgress
    )
    
    return blob
  } catch (error) {
    console.error('Compression error:', error)
    throw new Error(`Failed to compress PDF: ${error.message}`)
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

export function calculateCompressionRatio(originalSize, compressedSize) {
  if (originalSize === 0) return 0
  const reduction = ((originalSize - compressedSize) / originalSize) * 100
  return Math.max(0, reduction).toFixed(1)
}
