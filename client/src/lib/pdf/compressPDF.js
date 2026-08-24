import { PDFDocument } from 'pdf-lib'

export async function compressPDF(file, compressionLevel, onProgress) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer, { 
      ignoreEncryption: true,
      updateMetadata: false
    })

    if (onProgress) {
      onProgress(30, 'Analyzing PDF structure...')
    }

    // Get original page count for progress tracking
    const pageCount = pdf.getPageCount()

    // Compression settings based on level
    const compressionSettings = {
      recommended: { useObjectStreams: true, compress: true },
      balanced: { useObjectStreams: true, compress: true, removeUnused: true },
      maximum: { useObjectStreams: true, compress: true, removeUnused: true, flatten: true }
    }

    const settings = compressionSettings[compressionLevel] || compressionSettings.recommended

    if (onProgress) {
      onProgress(50, 'Optimizing PDF content...')
    }

    // Remove unused objects if specified
    if (settings.removeUnused) {
      // pdf-lib doesn't have direct removeUnused, but we can optimize by re-saving
    }

    // Flatten forms if specified (convert form fields to regular content)
    if (settings.flatten) {
      try {
        const form = pdf.getForm()
        const fields = form.getFields()
        if (fields.length > 0) {
          form.flatten()
        }
      } catch (error) {
        // Form flattening might fail if no form exists, that's okay
      }
    }

    if (onProgress) {
      onProgress(70, 'Applying compression...')
    }

    // Save with compression settings
    const saveOptions = {
      useObjectStreams: settings.useObjectStreams,
      addDefaultPage: false,
    }

    const pdfBytes = await pdf.save(saveOptions)

    if (onProgress) {
      onProgress(100, 'Compression complete')
    }

    return new Blob([pdfBytes], {
      type: 'application/pdf'
    })
  } catch (error) {
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
