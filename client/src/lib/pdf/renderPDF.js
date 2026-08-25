import * as pdfjsLib from 'pdfjs-dist'

// Set up worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export async function renderAllPDFPages(file, scale = 1.0) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument(arrayBuffer)
    const pdf = await loadingTask.promise
    const pageCount = pdf.getPageCount()
    
    const images = []
    
    for (let i = 0; i < pageCount; i++) {
      try {
        const page = await pdf.getPage(i + 1) // pdf.js uses 1-based indexing
        const viewport = page.getViewport({ scale })
        
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width
        
        // Set white background for transparent PDFs
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        
        // Clean up after data URL is created
        canvas.remove()
        
        images.push(dataUrl)
      } catch (pageError) {
        console.error(`Error rendering page ${i + 1}:`, pageError)
        images.push(null)
      }
    }
    
    return images
  } catch (error) {
    console.error('Error rendering PDF pages:', error)
    return []
  }
}
