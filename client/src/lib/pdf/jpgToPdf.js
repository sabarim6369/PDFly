import { PDFDocument } from 'pdf-lib'

const PAGE_SIZES = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008]
}

export async function jpgToPdf(files, pageSize = 'a4', orientation = 'portrait', onProgress) {
  try {
    const pdfDoc = await PDFDocument.create()
    
    let [width, height] = PAGE_SIZES[pageSize] || PAGE_SIZES.a4
    if (orientation === 'landscape') {
      [width, height] = [height, width]
    }

    const total = files.length

    for (let i = 0; i < total; i++) {
      if (onProgress) {
        onProgress(Math.round((i / total) * 80), `Processing image ${i + 1} of ${total}...`)
      }

      const file = files[i]
      const arrayBuffer = await file.arrayBuffer()
      
      let image
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        image = await pdfDoc.embedJpg(arrayBuffer)
      } else if (file.type === 'image/png') {
        image = await pdfDoc.embedPng(arrayBuffer)
      } else {
        throw new Error(`Unsupported image format: ${file.type}`)
      }

      const page = pdfDoc.addPage([width, height])
      
      const imgWidth = image.width
      const imgHeight = image.height

      // Scale image to fit within the page while maintaining aspect ratio
      const widthRatio = width / imgWidth
      const heightRatio = height / imgHeight
      const scaleFactor = Math.min(widthRatio, heightRatio)

      const scaledWidth = imgWidth * scaleFactor
      const scaledHeight = imgHeight * scaleFactor

      // Center the image on the page
      const x = (width - scaledWidth) / 2
      const y = (height - scaledHeight) / 2

      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      })
    }

    if (onProgress) {
      onProgress(90, 'Generating PDF...')
    }

    const pdfBytes = await pdfDoc.save()

    if (onProgress) {
      onProgress(100, 'Complete')
    }

    return new Blob([pdfBytes], { type: 'application/pdf' })
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
