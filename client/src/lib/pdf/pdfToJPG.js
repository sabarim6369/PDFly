import * as pdfjsLib from 'pdfjs-dist'

// Set up worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export async function convertPDFToJPG(file, selectedPages, quality, onProgress) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument(arrayBuffer)
    const pdf = await loadingTask.promise
    const totalPages = pdf.getPageCount()

    if (onProgress) {
      onProgress(10, 'Loading PDF...')
    }

    // Quality settings
    const qualitySettings = {
      low: { scale: 1.0, quality: 0.6 },
      medium: { scale: 1.5, quality: 0.8 },
      high: { scale: 2.0, quality: 0.95 }
    }

    const settings = qualitySettings[quality] || qualitySettings.high

    // Convert selected pages (0-based indices)
    const pagesToConvert = selectedPages.length > 0 ? selectedPages : Array.from({ length: totalPages }, (_, i) => i)
    const images = []

    for (let i = 0; i < pagesToConvert.length; i++) {
      const pageIndex = pagesToConvert[i]
      const page = await pdf.getPage(pageIndex + 1)

      if (onProgress) {
        const progress = Math.round(((i + 1) / pagesToConvert.length) * 100)
        onProgress(progress, `Converting page ${pageIndex + 1}...`)
      }

      const viewport = page.getViewport({ scale: settings.scale })
      
      // Create canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise

      // Convert canvas to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob)
        }, 'image/jpeg', settings.quality)
      })

      images.push({
        blob,
        pageNumber: pageIndex + 1
      })

      // Clean up
      canvas.remove()
    }

    return images
  } catch (error) {
    console.error('PDF to JPG conversion error:', error)
    throw new Error(`Failed to convert PDF to JPG: ${error.message}`)
  }
}

export async function getPDFPageCount(file) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument(arrayBuffer)
    const pdf = await loadingTask.promise
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

export function downloadImages(images, baseFilename) {
  images.forEach((image, index) => {
    const filename = `${baseFilename}-page-${image.pageNumber}.jpg`
    downloadBlob(image.blob, filename)
  })
}
