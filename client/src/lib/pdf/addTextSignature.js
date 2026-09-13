import { runPDFWorker } from '../../webworker/workerClient'

export async function addTextSignature(file, tool, textData, signatureData, pageIndex, onProgress) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    
    // For signature data, we pass a type and an array buffer
    let signaturePayload = null
    if (signatureData) {
      signaturePayload = {
        type: signatureData.type,
        buffer: await signatureData.blob.arrayBuffer()
      }
    }
    
    const blob = await runPDFWorker(
      'ADD_TEXT_SIGNATURE', 
      { 
        buffer: arrayBuffer,
        tool,
        textData,
        signatureData: signaturePayload,
        pageIndex
      },
      onProgress
    )
    
    return blob
  } catch (error) {
    console.error('Add text/signature error:', error)
    throw new Error(`Failed to add text/signature: ${error.message}`)
  }
}
