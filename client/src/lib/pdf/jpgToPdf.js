import { runPDFWorker } from '../../webworker/workerClient'

const PAGE_SIZES = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008]
}

export async function jpgToPdf(files, pageSize = 'a4', orientation = 'portrait', onProgress) {
  try {
    const buffers = []
    const fileTypes = []
    
    // Read all files into ArrayBuffers and get their types
    for (let i = 0; i < files.length; i++) {
      const buffer = await files[i].arrayBuffer()
      buffers.push(buffer)
      fileTypes.push(files[i].type)
    }
    
    const blob = await runPDFWorker(
      'JPG_TO_PDF', 
      { buffers, fileTypes, pageSize, orientation }, 
      onProgress
    )
    
    return blob
  } catch (error) {
    console.error('JPG to PDF error:', error)
    throw new Error(`Failed to convert images to PDF: ${error.message}`)
  }
}

export function validateImageFiles(files) {
  if (!files || files.length === 0) {
    return { valid: false, error: 'No files provided' }
  }
  
  const invalidFiles = files.filter(f => !f.type.startsWith('image/'))
  if (invalidFiles.length > 0) {
    return { valid: false, error: 'Please select valid image files only (JPG, PNG)' }
  }
  
  return { valid: true }
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
