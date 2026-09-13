import { runPDFWorker } from '../../webworker/workerClient'

export async function watermarkPDF(file, text, fontSize, opacity, position, rotation, onProgress) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    
    const blob = await runPDFWorker(
      'WATERMARK', 
      { 
        buffer: arrayBuffer, 
        text, 
        fontSize, 
        opacity, 
        position, 
        rotation 
      },
      onProgress
    )
    
    return blob
  } catch (error) {
    console.error('Watermark error:', error)
    throw new Error(`Failed to watermark PDF: ${error.message}`)
  }
}
