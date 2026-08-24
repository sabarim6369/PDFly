import { PDFDocument } from 'pdf-lib'

export async function mergePDFs(files, onProgress) {
  try {
    const mergedPdf = await PDFDocument.create()
    const totalFiles = files.length
    
    for (let i = 0; i < totalFiles; i++) {
      const file = files[i]
      
      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach((page) => {
          mergedPdf.addPage(page)
        })
        
        if (onProgress) {
          const progress = Math.round(((i + 1) / totalFiles) * 100)
          onProgress(progress, `Processing ${file.name}...`)
        }
      } catch (error) {
        throw new Error(`Failed to process ${file.name}: ${error.message}`)
      }
    }
    
    const pdfBytes = await mergedPdf.save()
    
    return new Blob([pdfBytes], {
      type: 'application/pdf'
    })
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
