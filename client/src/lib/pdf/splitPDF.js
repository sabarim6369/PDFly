import { PDFDocument } from 'pdf-lib'

export async function splitPDF(file, selectedPages, splitMode, onProgress) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const totalPages = pdf.getPageCount()

    if (onProgress) {
      onProgress(20, 'Loading PDF...')
    }

    if (splitMode === 'extract') {
      // Extract selected pages into a new PDF
      const newPdf = await PDFDocument.create()
      
      if (onProgress) {
        onProgress(40, 'Extracting pages...')
      }

      // Validate and filter page indices (already 0-based from UI)
      const pageIndices = selectedPages.filter(index => index >= 0 && index < totalPages)
      
      if (pageIndices.length === 0) {
        throw new Error('No valid pages selected')
      }

      const copiedPages = await newPdf.copyPages(pdf, pageIndices)
      copiedPages.forEach(page => newPdf.addPage(page))

      if (onProgress) {
        onProgress(80, 'Creating new PDF...')
      }

      const pdfBytes = await newPdf.save()

      if (onProgress) {
        onProgress(100, 'Complete')
      }

      return new Blob([pdfBytes], { type: 'application/pdf' })
    } else if (splitMode === 'range') {
      // Split by ranges - return array of blobs
      // selectedPages should already be an array of {start, end} objects
      const ranges = selectedPages
      const blobs = []

      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i]
        const newPdf = await PDFDocument.create()
        
        const pageIndices = []
        for (let j = range.start; j <= range.end; j++) {
          const index = j - 1 // Convert to 0-based index
          if (index >= 0 && index < totalPages) {
            pageIndices.push(index)
          }
        }
        
        if (pageIndices.length === 0) {
          throw new Error(`Invalid range: ${range.start}-${range.end}`)
        }
        
        const copiedPages = await newPdf.copyPages(pdf, pageIndices)
        copiedPages.forEach(page => newPdf.addPage(page))

        const pdfBytes = await newPdf.save()
        blobs.push(new Blob([pdfBytes], { type: 'application/pdf' }))

        if (onProgress) {
          const progress = Math.round(((i + 1) / ranges.length) * 100)
          onProgress(progress, `Processing range ${i + 1} of ${ranges.length}...`)
        }
      }

      return blobs
    }
  } catch (error) {
    console.error('Split PDF error:', error)
    throw new Error(`Failed to split PDF: ${error.message}`)
  }
}

function parsePageRanges(ranges, totalPages) {
  // Parse ranges like "1-3,5,7-9" into array of {start, end}
  const result = []
  
  for (const range of ranges) {
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(num => parseInt(num))
      result.push({ start: Math.max(1, start), end: Math.min(totalPages, end) })
    } else {
      const page = parseInt(range)
      result.push({ start: page, end: page })
    }
  }
  
  return result
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

export function downloadBlobs(blobs, baseFilename) {
  blobs.forEach((blob, index) => {
    const filename = `${baseFilename}-part-${index + 1}.pdf`
    downloadBlob(blob, filename)
  })
}
