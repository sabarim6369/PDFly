import { PDFDocument } from 'pdf-lib'

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
