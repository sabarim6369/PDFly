import { Document, Packer, Paragraph, TextRun } from 'docx'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.2.108/pdf.worker.min.mjs'

export async function pdfToWord(file, onProgress) {
  try {
    if (onProgress) onProgress(20, 'Loading PDF...')
    
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    const numPages = pdf.numPages
    const paragraphs = []

    for (let i = 1; i <= numPages; i++) {
      if (onProgress) {
        onProgress(20 + Math.round((i / numPages) * 50), `Extracting text from page ${i} of ${numPages}...`)
      }
      
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      
      // Basic text extraction, grouped roughly by blocks/lines
      let currentY = null
      let lineText = ''
      
      for (const item of textContent.items) {
        if (currentY !== null && Math.abs(currentY - item.transform[5]) > 5 && lineText.trim().length > 0) {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun(lineText.trim())],
            })
          )
          lineText = ''
        }
        lineText += item.str
        if (item.hasEOL) {
          lineText += ' '
        }
        currentY = item.transform[5]
      }
      
      if (lineText.trim().length > 0) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun(lineText.trim())],
          })
        )
      }
      
      // Page break if not the last page
      if (i < numPages) {
        paragraphs.push(new Paragraph({ text: '', pageBreakBefore: true }))
      }
    }

    if (onProgress) onProgress(80, 'Generating Word Document...')

    const doc = new Document({
      creator: "PDFly",
      description: "Extracted from PDF",
      sections: [{
        properties: {},
        children: paragraphs.length > 0 ? paragraphs : [new Paragraph("No text found in PDF.")],
      }],
    })

    const blob = await Packer.toBlob(doc)

    if (onProgress) onProgress(100, 'Complete')

    return blob
  } catch (error) {
    console.error('PDF to Word error:', error)
    throw new Error(`Failed to convert PDF to Word: ${error.message}`)
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
