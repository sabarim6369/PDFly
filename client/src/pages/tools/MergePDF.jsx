import { useState } from 'react'
import FileDropzone from '../../components/FileDropzone'
import FileList from '../../components/FileList'
import ProcessingState from '../../components/ProcessingState'
import CompletedState from '../../components/CompletedState'
import { GripVertical, Plus, Lock, AlertCircle } from 'lucide-react'
import { mergePDFs, validatePDFFile, formatFileSize, downloadBlob } from '../../lib/pdf/mergePDF'

export default function MergePDF() {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [resultBlob, setResultBlob] = useState(null)
  const [draggedIndex, setDraggedIndex] = useState(null)

  const handleDrop = (newFiles) => {
    setError(null)
    const validFiles = []
    const invalidFiles = []

    newFiles.forEach((file) => {
      const validation = validatePDFFile(file)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        invalidFiles.push(file.name)
      }
    })

    if (invalidFiles.length > 0) {
      setError(`Invalid files: ${invalidFiles.join(', ')}. Please select valid PDF files only.`)
    }

    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles])
    }
  }

  const handleRemove = (index) => {
    setFiles(files.filter((_, i) => i !== index))
    setError(null)
  }

  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDropOnItem = (e, targetIndex) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === targetIndex) return

    const newFiles = [...files]
    const [draggedFile] = newFiles.splice(draggedIndex, 1)
    newFiles.splice(targetIndex, 0, draggedFile)

    setFiles(newFiles)
    setDraggedIndex(null)
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge.')
      return
    }

    setError(null)
    setProcessing(true)
    setProgress(0)
    setProgressMessage('Starting merge...')

    try {
      const blob = await mergePDFs(files, (progress, message) => {
        setProgress(progress)
        setProgressMessage(message)
      })

      setResultBlob(blob)
      setProcessing(false)
      setCompleted(true)
    } catch (err) {
      console.error('Merge error:', err)
      setError('Something went wrong while merging your PDFs. Please try again.')
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (resultBlob) {
      downloadBlob(resultBlob, 'merged.pdf')
    }
  }

  const handleReset = () => {
    setFiles([])
    setCompleted(false)
    setError(null)
    setProgress(0)
    setProgressMessage('')
    setResultBlob(null)
  }

  if (completed) {
    return (
      <CompletedState
        fileName="merged.pdf"
        fileSize={resultBlob?.size || 0}
        onReset={handleReset}
        onDownload={handleDownload}
      />
    )
  }

  if (processing) {
    return (
      <ProcessingState progress={progress} message={progressMessage} />
    )
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {files.length === 0 ? (
        <FileDropzone onDrop={handleDrop} accept="application/pdf" multiple />
      ) : (
        <>
          <FileList files={files} onRemove={handleRemove} />
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => document.getElementById('file-input').click()}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus size={18} />
              <span>Add more PDFs</span>
            </button>
            <input
              id="file-input"
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => handleDrop(Array.from(e.target.files))}
              className="hidden"
            />
            
            <button
              onClick={handleMerge}
              disabled={files.length < 2}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {files.length < 2 ? 'Add at least 2 PDFs' : 'Merge PDF'}
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              File order (drag to reorder)
            </h3>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnItem(e, index)}
                  className={`
                    flex items-center space-x-3 p-3 bg-white border rounded-lg transition-all
                    ${draggedIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    ${draggedIndex !== null && draggedIndex !== index ? 'opacity-50' : ''}
                  `}
                >
                  <GripVertical size={18} className="text-gray-400 cursor-grab" />
                  <span className="text-sm text-gray-600">{index + 1}.</span>
                  <span className="flex-1 text-sm font-medium text-gray-900">{file.name}</span>
                  <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Lock size={14} />
            <span>Your files are processed locally in your browser.</span>
          </div>
        </>
      )}
    </div>
  )
}
