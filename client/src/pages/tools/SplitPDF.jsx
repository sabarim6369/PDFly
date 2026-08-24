import { useState, useEffect } from 'react'
import ToolLayout from '../../components/ToolLayout'
import FileDropzone from '../../components/FileDropzone'
import PDFPreview from '../../components/PDFPreview'
import ProcessingState from '../../components/ProcessingState'
import CompletedState from '../../components/CompletedState'
import { splitPDF, getPDFPageCount, validatePDFFile, formatFileSize, downloadBlob, downloadBlobs } from '../../lib/pdf/splitPDF'

export default function SplitPDF() {
  const [file, setFile] = useState(null)
  const [selectedPages, setSelectedPages] = useState([])
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [splitMode, setSplitMode] = useState('extract')
  const [splitResult, setSplitResult] = useState(null)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [error, setError] = useState(null)

  const pages = pageCount > 0 
    ? Array.from({ length: pageCount }, (_, i) => ({ id: i + 1 }))
    : []

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
        const count = await getPDFPageCount(files[0])
        setPageCount(count)
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

  const handleSplit = async () => {
    if (!file || selectedPages.length === 0) return
    
    setProcessing(true)
    setProgress(0)
    setError(null)
    
    try {
      const result = await splitPDF(file, selectedPages, splitMode, (progress, message) => {
        setProgress(progress)
        setProgressMessage(message)
      })
      
      setSplitResult(result)
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
    setSplitResult(null)
    setError(null)
    setProgress(0)
  }

  const handleDownload = () => {
    if (!splitResult || !file) return
    
    const baseName = file.name.replace('.pdf', '')
    
    if (Array.isArray(splitResult)) {
      downloadBlobs(splitResult, baseName)
    } else {
      downloadBlob(splitResult, `${baseName}-extracted.pdf`)
    }
  }

  if (completed) {
    const fileSize = Array.isArray(splitResult) 
      ? splitResult.reduce((acc, blob) => acc + blob.size, 0)
      : splitResult?.size || 0
    
    return (
      <ToolLayout toolSlug="split-pdf">
        <CompletedState
          fileName={Array.isArray(splitResult) 
            ? `${file.name.replace('.pdf', '')}-split.zip` 
            : `${file.name.replace('.pdf', '')}-extracted.pdf`}
          fileSize={fileSize}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      </ToolLayout>
    )
  }

  if (processing) {
    return (
      <ToolLayout toolSlug="split-pdf">
        <ProcessingState progress={progress} message={progressMessage || 'Splitting PDF pages...'} />
      </ToolLayout>
    )
  }

  return (
    <ToolLayout toolSlug="split-pdf">
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
                Select pages to extract ({pageCount} pages total)
              </h3>
              <PDFPreview
                pages={pages}
                selectedPages={selectedPages}
                onPageSelect={handlePageSelect}
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Split options</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="split-option"
                    value="extract"
                    checked={splitMode === 'extract'}
                    onChange={(e) => setSplitMode(e.target.value)}
                    className="text-gray-900"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Extract selected pages</p>
                    <p className="text-sm text-gray-500">Create a new PDF with selected pages</p>
                  </div>
                </label>
                <label className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="split-option" 
                    value="range"
                    checked={splitMode === 'range'}
                    onChange={(e) => setSplitMode(e.target.value)}
                    className="text-gray-900" 
                  />
                  <div>
                    <p className="font-medium text-gray-900">Split by range</p>
                    <p className="text-sm text-gray-500">Divide PDF into page ranges</p>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handleSplit}
              disabled={selectedPages.length === 0}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Split PDF
            </button>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
