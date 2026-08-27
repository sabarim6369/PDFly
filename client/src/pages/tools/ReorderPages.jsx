import { useState, useMemo } from 'react'
import FileDropzone from '../../components/FileDropzone'
import PDFPreview from '../../components/PDFPreview'
import ProcessingState from '../../components/ProcessingState'
import CompletedState from '../../components/CompletedState'
import { reorderPages, getPDFPageCount, validatePDFFile, downloadBlob } from '../../lib/pdf/reorderPDF'
import * as pdfjsLib from 'pdfjs-dist'

// Set up worker with CDN URL matching installed version
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.2.108/pdf.worker.min.mjs'

export default function ReorderPages() {
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [pageOrder, setPageOrder] = useState([])
  const [pdf, setPdf] = useState(null)
  const [reorderedPdf, setReorderedPdf] = useState(null)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [error, setError] = useState(null)
  const [loadingPdf, setLoadingPdf] = useState(false)

  const pages = useMemo(() => {
    if (pageCount > 0) {
      return pageOrder.map((originalIndex, newIndex) => ({ 
        id: originalIndex + 1, 
        originalIndex,
        pageNumber: originalIndex + 1
      }))
    }
    return []
  }, [pageCount, pageOrder])

  const handleDrop = async (files) => {
    if (files.length > 0) {
      const validation = validatePDFFile(files[0])
      if (!validation.valid) {
        setError(validation.error)
        return
      }
      
      setFile(files[0])
      setError(null)
      setCompleted(false)
      setLoadingPdf(true)
      
      try {
        const count = await getPDFPageCount(files[0])
        setPageCount(count)
        // Initialize page order as [0, 1, 2, ...]
        setPageOrder(Array.from({ length: count }, (_, i) => i))
        
        // Load PDF with pdf.js for rendering
        const arrayBuffer = await files[0].arrayBuffer()
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
        const pdfDocument = await loadingTask.promise
        setPdf(pdfDocument)
      } catch (err) {
        setError('Failed to read PDF file')
        setFile(null)
      } finally {
        setLoadingPdf(false)
      }
    }
  }

  const handlePageReorder = (newOrder) => {
    setPageOrder(newOrder)
  }

  const handleApply = async () => {
    if (!file || pageOrder.length === 0) return
    
    setProcessing(true)
    setProgress(0)
    setError(null)
    
    try {
      const result = await reorderPages(file, pageOrder, (progress, message) => {
        setProgress(progress)
        setProgressMessage(message)
      })
      
      setReorderedPdf(result)
      setCompleted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setCompleted(false)
    setPageCount(0)
    setPageOrder([])
    setPdf(null)
    setReorderedPdf(null)
    setError(null)
    setProgress(0)
    setLoadingPdf(false)
  }

  const handleDownload = () => {
    if (!reorderedPdf || !file) return
    
    const filename = file.name.replace('.pdf', '-reordered.pdf')
    downloadBlob(reorderedPdf, filename)
  }

  if (completed) {
    const fileSize = reorderedPdf ? reorderedPdf.size : 0
    
    return (
      <CompletedState
        fileName={file ? file.name.replace('.pdf', '-reordered.pdf') : 'reordered-document.pdf'}
        fileSize={fileSize}
        onDownload={handleDownload}
        onReset={handleReset}
      />
    )
  }

  if (processing) {
    return (
      <ProcessingState progress={progress} message={progressMessage || 'Reordering pages...'} />
    )
  }

  if (loadingPdf) {
    return (
      <ProcessingState progress={50} message="Loading PDF..." />
    )
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      {!file ? (
        <FileDropzone onDrop={handleDrop} accept=".pdf" />
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Change file
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Drag and drop to reorder pages ({pageCount} pages total)
              </h3>
              <PDFPreview
                pages={pages}
                draggable={true}
                onPageReorder={handlePageReorder}
                pdf={pdf}
                scale={0.4}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Tip:</span> Drag pages to rearrange them in your preferred order.
              </p>
            </div>

            <button
              onClick={handleApply}
              disabled={pageOrder.length === 0}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Apply new order
            </button>
          </>
        )}
      </div>
  )
}
