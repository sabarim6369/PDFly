import { PDFDocument, degrees } from 'pdf-lib'

export async function rotatePDF(file, rotations, onProgress) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const totalPages = pdf.getPageCount()

    if (onProgress) {
      onProgress(20, 'Loading PDF...')
    }

    // Apply rotations to pages (rotations is an object with page indices as keys and degrees as values)
    for (let i = 0; i < totalPages; i++) {
      const rotation = rotations[i] || 0
      if (rotation !== 0) {
        const page = pdf.getPage(i)
        const currentRotation = page.getRotation().angle
        page.setRotation(degrees(currentRotation + rotation))
      }
    }

    if (onProgress) {
      onProgress(80, 'Saving rotated PDF...')
    }

    const pdfBytes = await pdf.save()

    if (onProgress) {
      onProgress(100, 'Complete')
    }

    return new Blob([pdfBytes], {
      type: 'application/pdf'
    })
  } catch (error) {
    console.error('Rotate PDF error:', error)
    throw new Error(`Failed to rotate PDF: ${error.message}`)
  }
}

export async function getPDFPageCount(file) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    return pdf.getPageCount()
  } catch (error) {
    throw new Error(`Failed to read PDF: ${error.message}`)
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
