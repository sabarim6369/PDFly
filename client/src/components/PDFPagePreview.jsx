import { useRef, useEffect, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

// Set up worker with CDN URL matching installed version
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.2.108/pdf.worker.min.mjs'

export default function PDFPagePreview({ pdf, pageNumber, scale = 0.4 }) {
  console.log(`PDFPagePreview mounted: pageNumber=${pageNumber}, pdf=${!!pdf}, scale=${scale}`)
  const canvasRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function renderPage() {
      if (!pdf || !canvasRef.current) return

      setLoading(true)
      setError(false)

      try {
        console.log(`Starting render for page ${pageNumber}`)
        const page = await pdf.getPage(pageNumber)
        console.log(`Page ${pageNumber} fetched`)
        
        if (!isMounted) return

        const viewport = page.getViewport({ scale })
        console.log(`Viewport for page ${pageNumber}:`, viewport.width, 'x', viewport.height)
        
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        // Set white background for transparent PDFs
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }
        
        console.log(`Starting render for page ${pageNumber}`)
        await page.render(renderContext).promise
        console.log(`Page ${pageNumber} rendered successfully`)
        
        if (isMounted) {
          setLoading(false)
        }
      } catch (err) {
        console.error(`Error rendering page ${pageNumber}:`, err)
        if (isMounted) {
          setError(true)
          setLoading(false)
        }
      }
    }

    renderPage()

    return () => {
      isMounted = false
    }
  }, [pdf, pageNumber, scale])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500">Loading…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-xs text-gray-500 text-center px-2">Unable to preview page</p>
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-contain"
      style={{ display: 'block' }}
    />
  )
}
