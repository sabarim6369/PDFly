import { PDFDocument, rgb, degrees } from 'pdf-lib'

self.onmessage = async (e) => {
  const { type, payload } = e.data

  const reportProgress = (progress, message) => {
    self.postMessage({ type: 'PROGRESS', progress, message })
  }

  try {
    let resultBuffer

    switch (type) {
      case 'COMPRESS': {
        const { buffer, compressionLevel } = payload
        resultBuffer = await handleCompress(buffer, compressionLevel, reportProgress)
        break
      }
      
      case 'MERGE': {
        const { buffers } = payload
        resultBuffer = await handleMerge(buffers, reportProgress)
        break
      }

      case 'JPG_TO_PDF': {
        const { buffers, fileTypes, pageSize, orientation } = payload
        resultBuffer = await handleJpgToPdf(buffers, fileTypes, pageSize, orientation, reportProgress)
        break
      }

      case 'WATERMARK': {
        const { buffer, text, fontSize, opacity, position, rotation } = payload
        resultBuffer = await handleWatermark(buffer, text, fontSize, opacity, position, rotation, reportProgress)
        break
      }

      case 'ADD_TEXT_SIGNATURE': {
        const { buffer, tool, textData, signatureData, pageIndex } = payload
        resultBuffer = await handleAddTextSignature(buffer, tool, textData, signatureData, pageIndex, reportProgress)
        break
      }

      default:
        throw new Error(`Unknown worker task type: ${type}`)
    }

    // Transfer the resulting ArrayBuffer back to the main thread
    self.postMessage({ type: 'SUCCESS', result: resultBuffer }, [resultBuffer])

  } catch (error) {
    self.postMessage({ type: 'ERROR', error: error.message })
  }
}

async function handleCompress(arrayBuffer, compressionLevel, reportProgress) {
  const pdf = await PDFDocument.load(arrayBuffer, { 
    ignoreEncryption: true,
    updateMetadata: false
  })

  reportProgress(20, 'Analyzing PDF structure...')

  const compressionSettings = {
    recommended: { quality: 0.8, removeMetadata: true },
    balanced: { quality: 0.6, removeMetadata: true, removeUnused: true },
    maximum: { quality: 0.4, removeMetadata: true, removeUnused: true }
  }

  const settings = compressionSettings[compressionLevel] || compressionSettings.recommended

  reportProgress(40, 'Removing metadata...')

  if (settings.removeMetadata) {
    pdf.setTitle('')
    pdf.setAuthor('')
    pdf.setSubject('')
    pdf.setKeywords([])
    pdf.setProducer('')
    pdf.setCreator('')
  }

  reportProgress(60, 'Optimizing PDF structure...')

  const compressedPdf = await PDFDocument.create()
  const copiedPages = await compressedPdf.copyPages(pdf, pdf.getPageIndices())
  copiedPages.forEach(page => compressedPdf.addPage(page))

  reportProgress(80, 'Applying compression...')

  const saveOptions = {
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 20,
  }

  const pdfBytes = await compressedPdf.save(saveOptions)
  reportProgress(100, 'Compression complete')

  return pdfBytes.buffer
}

async function handleMerge(buffers, reportProgress) {
  const mergedPdf = await PDFDocument.create()
  const total = buffers.length

  for (let i = 0; i < total; i++) {
    reportProgress(Math.round((i / total) * 80), `Processing PDF ${i + 1} of ${total}...`)
    
    const pdf = await PDFDocument.load(buffers[i])
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }

  reportProgress(90, 'Generating final PDF...')
  const pdfBytes = await mergedPdf.save()
  
  reportProgress(100, 'Complete')
  return pdfBytes.buffer
}

const PAGE_SIZES = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008]
}

async function handleJpgToPdf(buffers, fileTypes, pageSize, orientation, reportProgress) {
  const pdfDoc = await PDFDocument.create()
    
  let [width, height] = PAGE_SIZES[pageSize] || PAGE_SIZES.a4
  if (orientation === 'landscape') {
    [width, height] = [height, width]
  }

  const total = buffers.length

  for (let i = 0; i < total; i++) {
    reportProgress(Math.round((i / total) * 80), `Processing image ${i + 1} of ${total}...`)

    const arrayBuffer = buffers[i]
    const fileType = fileTypes[i]
    
    let image
    if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
      image = await pdfDoc.embedJpg(arrayBuffer)
    } else if (fileType === 'image/png') {
      image = await pdfDoc.embedPng(arrayBuffer)
    } else {
      throw new Error(`Unsupported image format: ${fileType}`)
    }

    const page = pdfDoc.addPage([width, height])
    
    const imgWidth = image.width
    const imgHeight = image.height

    const widthRatio = width / imgWidth
    const heightRatio = height / imgHeight
    const scaleFactor = Math.min(widthRatio, heightRatio)

    const scaledWidth = imgWidth * scaleFactor
    const scaledHeight = imgHeight * scaleFactor

    const x = (width - scaledWidth) / 2
    const y = (height - scaledHeight) / 2

    page.drawImage(image, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
    })
  }

  reportProgress(90, 'Generating PDF...')
  const pdfBytes = await pdfDoc.save()
  
  reportProgress(100, 'Complete')
  return pdfBytes.buffer
}

async function handleWatermark(buffer, text, fontSize, opacity, position, rotation, reportProgress) {
  const pdfDoc = await PDFDocument.load(buffer)
  const pages = pdfDoc.getPages()
  
  const totalPages = pages.length
  const opacityValue = opacity / 100
  const color = rgb(0.5, 0.5, 0.5) // Gray color for watermark

  for (let i = 0; i < totalPages; i++) {
    reportProgress(Math.round((i / totalPages) * 80), `Watermarking page ${i + 1} of ${totalPages}...`)
    const page = pages[i]
    const { width, height } = page.getSize()
    
    let x = width / 2
    let y = height / 2

    // Basic positioning (assuming text is roughly centered)
    // To do perfect centering we would need to measure font width, but pdf-lib standard fonts 
    // measurement is complex inside worker, so we use approximation or simple coordinates
    
    // As a simple approach for 'center', we just draw it at center and rotate
    // If we want corner placements:
    const margin = 50
    switch (position) {
      case 'top-left': x = margin; y = height - margin; break;
      case 'top-center': x = width / 2; y = height - margin; break;
      case 'top-right': x = width - margin * 3; y = height - margin; break; // approximate text width
      case 'bottom-left': x = margin; y = margin; break;
      case 'bottom-center': x = width / 2; y = margin; break;
      case 'bottom-right': x = width - margin * 3; y = margin; break;
      case 'center':
      default:
        x = width / 2 - (text.length * fontSize * 0.3); // Rough center alignment
        y = height / 2;
        break;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      color,
      opacity: opacityValue,
      rotate: degrees(rotation)
    })
  }

  reportProgress(90, 'Generating final PDF...')
  const pdfBytes = await pdfDoc.save()
  reportProgress(100, 'Complete')
  return pdfBytes.buffer
}

async function handleAddTextSignature(buffer, tool, textData, signatureData, pageIndex, reportProgress) {
  const pdfDoc = await PDFDocument.load(buffer)
  const pages = pdfDoc.getPages()
  
  if (pageIndex < 0 || pageIndex >= pages.length) {
    throw new Error('Invalid page index selected')
  }

  reportProgress(50, 'Applying annotations...')
  const page = pages[pageIndex]
  const { width, height } = page.getSize()

  if (tool === 'text') {
    const { text, fontSize, color: colorName } = textData
    
    let color = rgb(0, 0, 0)
    if (colorName === 'Red') color = rgb(1, 0, 0)
    if (colorName === 'Blue') color = rgb(0, 0, 1)
    if (colorName === 'Green') color = rgb(0, 1, 0)

    page.drawText(text, {
      x: 50, // default position
      y: height - 100, // default position near top
      size: fontSize,
      color
    })
  } else if (tool === 'signature' && signatureData) {
    let signatureImage
    if (signatureData.type === 'image/png') {
      signatureImage = await pdfDoc.embedPng(signatureData.buffer)
    } else {
      signatureImage = await pdfDoc.embedJpg(signatureData.buffer)
    }
    
    // Scale down signature to reasonable size
    const dims = signatureImage.scale(0.5)

    page.drawImage(signatureImage, {
      x: 50,
      y: 50, // Bottom left by default
      width: dims.width,
      height: dims.height,
    })
  }

  reportProgress(90, 'Generating final PDF...')
  const pdfBytes = await pdfDoc.save()
  reportProgress(100, 'Complete')
  return pdfBytes.buffer
}
