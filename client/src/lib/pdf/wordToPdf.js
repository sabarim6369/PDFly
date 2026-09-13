import mammoth from 'mammoth'
import html2pdf from 'html2pdf.js'

export async function wordToPdf(file, onProgress) {
  try {
    if (onProgress) onProgress(20, 'Reading Word Document...')
    
    const arrayBuffer = await file.arrayBuffer()
    
    if (onProgress) onProgress(40, 'Parsing Document Content...')
    const result = await mammoth.convertToHtml({ arrayBuffer })
    const htmlContent = result.value
    
    if (onProgress) onProgress(60, 'Preparing PDF Renderer...')
    
    const styledHtml = `
      <div style="padding: 40px; font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: black; background: white;">
        ${htmlContent}
      </div>
    `
    
    if (onProgress) onProgress(80, 'Generating PDF...')
    
    const opt = {
      margin:       [20, 20, 20, 20],
      filename:     file.name.replace('.docx', '.pdf').replace('.doc', '.pdf'),
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    
    const pdfBlob = await html2pdf().set(opt).from(styledHtml).output('blob')
    
    
    if (onProgress) onProgress(100, 'Complete')
    
    return pdfBlob
  } catch (error) {
    console.error('Word to PDF error:', error)
    throw new Error(`Failed to convert Word to PDF: ${error.message}`)
  }
}

export function validateWordFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }
  
  if (!file.name.endsWith('.docx')) {
    return { valid: false, error: 'Please select a valid .docx file' }
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
