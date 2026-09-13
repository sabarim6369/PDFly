import { useState, useMemo } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import FileDropzone from '../../components/FileDropzone'
import PDFPreview from '../../components/PDFPreview'
import ProcessingState from '../../components/ProcessingState'
import CompletedState from '../../components/CompletedState'
import { deletePages, validatePDFFile, downloadBlob } from '../../lib/pdf/deletePDF'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.2.108/pdf.worker.min.mjs'

export default function DeletePages() {
  const [file, setFile] = useState(null)
  const [selectedPages, setSelectedPages] = useState([])
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [deletedPdf, setDeletedPdf] = useState(null)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [error, setError] = useState(null)

  const [pdfDoc, setPdfDoc] = useState(null)
  
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
      setCompleted(false)
      
      try {
        const arrayBuffer = await files[0].arrayBuffer()
        const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        
        setPdfDoc(loadedPdf)
        setPageCount(loadedPdf.numPages)
      } catch (err) {
        setError('Failed to read PDF file')
        setFile(null)
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

  const handleDelete = async () => {
    if (!file || selectedPages.length === 0) return
    
    setProcessing(true)
    setProgress(0)
    setError(null)
    
    try {
      const result = await deletePages(file, selectedPages, (progress, message) => {
        setProgress(progress)
        setProgressMessage(message)
      })
      
      setDeletedPdf(result)
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
    setCompleted(false)
    setPageCount(0)
    setDeletedPdf(null)
    setError(null)
    setProgress(0)
  }

  const handleDownload = () => {
    if (!deletedPdf || !file) return
    
    const filename = file.name.replace('.pdf', '-pages-removed.pdf')
    downloadBlob(deletedPdf, filename)
  }

  const handlePreview = () => {
    if (deletedPdf) {
      const url = URL.createObjectURL(deletedPdf)
      window.open(url, '_blank')
    }
  }

  if (completed) {
    const fileSize = deletedPdf ? deletedPdf.size : 0
    
    return (
      <CompletedState
        fileName={file ? file.name.replace('.pdf', '-pages-removed.pdf') : 'document-pages-removed.pdf'}
        fileSize={fileSize}
        onDownload={handleDownload}
        onReset={handleReset}
        onPreview={handlePreview}
      />
    )
  }

  if (processing) {
    return (
      <ProcessingState progress={progress} message={progressMessage || 'Deleting pages...'} />
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
                Select pages to delete ({pageCount} pages total)
              </h3>
              <PDFPreview
                pages={pages}
                selectedPages={selectedPages}
                onPageSelect={handlePageSelect}
                onPageDelete={(index) => handlePageSelect(index)}
                pdf={pdfDoc}
                scale={0.4}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Warning:</span> Selected pages will be permanently removed from the document.
              </p>
            </div>

            <button
              onClick={handleDelete}
              disabled={selectedPages.length === 0}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Delete selected pages
            </button>
          </>
        )}
      </div>
  )
}
