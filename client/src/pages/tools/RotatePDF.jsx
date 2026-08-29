import { useState, useMemo } from 'react'
import FileDropzone from '../../components/FileDropzone'
import PDFPreview from '../../components/PDFPreview'
import ProcessingState from '../../components/ProcessingState'
import CompletedState from '../../components/CompletedState'
import { RotateCw, RotateCcw } from 'lucide-react'
import { rotatePDF, getPDFPageCount, validatePDFFile, downloadBlob } from '../../lib/pdf/rotatePDF'
import * as pdfjsLib from 'pdfjs-dist'

// Set up worker with CDN URL matching installed version
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.2.108/pdf.worker.min.mjs'

export default function RotatePDF() {
  const [file, setFile] = useState(null)
  const [selectedPages, setSelectedPages] = useState([])
  const [rotations, setRotations] = useState({})
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [pdf, setPdf] = useState(null)
  const [rotatedPdf, setRotatedPdf] = useState(null)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [error, setError] = useState(null)
  const [loadingPdf, setLoadingPdf] = useState(false)

  const pages = useMemo(() => {
    if (pageCount > 0) {
      return Array.from({ length: pageCount }, (_, i) => ({ 
        id: i + 1,
        pageNumber: i + 1
      }))
    }
    return []
  }, [pageCount])

  const handleDrop = async (files) => {
    if (files.length > 0) {
      const validation = validatePDFFile(files[0])
      if (!validation.valid) {
        setError(validation.error)
        return
      }
      
      setFile(files[0])
      setError(null)
      setSelectedPages([])
      setRotations({})
      setCompleted(false)
      setLoadingPdf(true)
      
      try {
        const count = await getPDFPageCount(files[0])
        setPageCount(count)
        
        // Load PDF with pdf.js for rendering
        const arrayBuffer = await files[0].arrayBuffer()
        console.log('ArrayBuffer size:', arrayBuffer.byteLength)
        
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
        console.log('Loading task created')
        
        const pdfDocument = await loadingTask.promise
        console.log('PDF loaded successfully, pages:', pdfDocument.numPages)
        
        setPdf(pdfDocument)
        console.log('PDF state set')
      } catch (err) {
        console.error('PDF loading error:', err)
        setError(`Failed to read PDF file: ${err.message || err}`)
        setFile(null)
      } finally {
        setLoadingPdf(false)
      }
    }
  }

  const handlePageSelect = (index) => {
    setSelectedPages(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const handleRotate = (index, direction) => {
    setRotations(prev => ({
      ...prev,
      [index]: (prev[index] || 0) + (direction === 'right' ? 90 : -90)
    }))
  }

  const handleRotateAll = (direction) => {
    const adjustment = direction === 'right' ? 90 : -90
    setRotations(prev => {
      const newRotations = { ...prev }
      for (let i = 0; i < pageCount; i++) {
        newRotations[i] = (newRotations[i] || 0) + adjustment
      }
      return newRotations
    })
  }

  const handleApply = async () => {
    if (!file) return
    
    setProcessing(true)
    setProgress(0)
    setError(null)
    
    try {
      const result = await rotatePDF(file, rotations, (progress, message) => {
        setProgress(progress)
        setProgressMessage(message)
      })
      
      setRotatedPdf(result)
      setCompleted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setSelectedPages([])
    setRotations({})
    setCompleted(false)
    setPageCount(0)
    setPdf(null)
    setRotatedPdf(null)
    setError(null)
    setProgress(0)
    setLoadingPdf(false)
  }

  const handleDownload = () => {
    if (!rotatedPdf || !file) return
    
    const filename = file.name.replace('.pdf', '-rotated.pdf')
    downloadBlob(rotatedPdf, filename)
  }

  if (completed) {
    const fileSize = rotatedPdf ? rotatedPdf.size : 0
    
    return (
      <CompletedState
        fileName={file ? file.name.replace('.pdf', '-rotated.pdf') : 'rotated-document.pdf'}
        fileSize={fileSize}
        onDownload={handleDownload}
        onReset={handleReset}
      />
    )
  }

  if (processing) {
    return (
      <ProcessingState progress={progress} message={progressMessage || 'Rotating pages...'} />
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

            <div className="flex space-x-4">
              <button
                onClick={() => handleRotateAll('left')}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw size={18} />
                <span>Rotate all left</span>
              </button>
              <button
                onClick={() => handleRotateAll('right')}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCw size={18} />
                <span>Rotate all right</span>
              </button>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Select pages to rotate ({pageCount} pages total)
              </h3>
              <PDFPreview
                pages={pages}
                selectedPages={selectedPages}
                onPageSelect={handlePageSelect}
                onPageRotate={handleRotate}
                pdf={pdf}
                scale={0.4}
              />
            </div>

            <button
              onClick={handleApply}
              disabled={Object.keys(rotations).length === 0}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Apply rotation
            </button>
          </>
        )}
      </div>
  )
}
