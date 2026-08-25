import { PDFDocument } from 'pdf-lib'

export async function compressPDF(file, compressionLevel, onProgress) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer, { 
      ignoreEncryption: true,
      updateMetadata: false
    })

    if (onProgress) {
      onProgress(20, 'Analyzing PDF structure...')
    }

    // Get original page count for progress tracking
    const pageCount = pdf.getPageCount()

    // Compression settings based on level
    const compressionSettings = {
      recommended: { quality: 0.8, removeMetadata: true },
      balanced: { quality: 0.6, removeMetadata: true, removeUnused: true },
      maximum: { quality: 0.4, removeMetadata: true, removeUnused: true }
    }

    const settings = compressionSettings[compressionLevel] || compressionSettings.recommended

    if (onProgress) {
      onProgress(40, 'Removing metadata...')
    }

    // Remove metadata
    if (settings.removeMetadata) {
      pdf.setTitle('')
      pdf.setAuthor('')
      pdf.setSubject('')
      pdf.setKeywords([])
      pdf.setProducer('')
      pdf.setCreator('')
    }

    if (onProgress) {
      onProgress(60, 'Optimizing PDF structure...')
    }

    // For better compression, we need to recreate the PDF
    // This helps remove unused objects and compress the structure
    const compressedPdf = await PDFDocument.create()
    
    // Copy all pages to the new PDF
    const copiedPages = await compressedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach(page => compressedPdf.addPage(page))

    if (onProgress) {
      onProgress(80, 'Applying compression...')
    }

    // Save with maximum compression options
    const saveOptions = {
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 20,
    }

    const pdfBytes = await compressedPdf.save(saveOptions)

    if (onProgress) {
      onProgress(100, 'Compression complete')
    }

    return new Blob([pdfBytes], {
      type: 'application/pdf'
    })
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
