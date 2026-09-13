import { useState } from 'react'
import FileDropzone from '../../components/FileDropzone'
import FileList from '../../components/FileList'
import ProcessingState from '../../components/ProcessingState'
import CompletedState from '../../components/CompletedState'
import { GripVertical, Plus, AlertCircle } from 'lucide-react'
import { jpgToPdf, validateImageFiles, downloadBlob } from '../../lib/pdf/jpgToPdf'

export default function JPGToPDF() {
  const [files, setFiles] = useState([])
  const [pageSize, setPageSize] = useState('a4')
  const [orientation, setOrientation] = useState('portrait')
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [resultBlob, setResultBlob] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [draggedIndex, setDraggedIndex] = useState(null)

  const pageSizeOptions = [
    { id: 'a4', name: 'A4' },
    { id: 'letter', name: 'Letter' },
    { id: 'legal', name: 'Legal' }
  ]

  const handleDrop = (newFiles) => {
    setError(null)
    const validation = validateImageFiles(newFiles)
    if (!validation.valid) {
      setError(validation.error)
    }
    
    const validFiles = newFiles.filter(f => f.type.startsWith('image/'))
    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles])
    }
  }

  const handleRemove = (index) => {
    setFiles(files.filter((_, i) => i !== index))
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

  const handleConvert = async () => {
    if (files.length === 0) return
    
    setProcessing(true)
    setProgress(0)
    setError(null)

    try {
      const blob = await jpgToPdf(files, pageSize, orientation, (progress, message) => {
        setProgress(progress)
        setProgressMessage(message)
      })
      
      setResultBlob(blob)
      setCompleted(true)
    } catch (err) {
      console.error('Conversion error:', err)
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setFiles([])
    setCompleted(false)
    setResultBlob(null)
    setError(null)
    setProgress(0)
    setProgressMessage('')
  }

  const handleDownload = () => {
    if (resultBlob) {
      downloadBlob(resultBlob, 'images-to-pdf.pdf')
    }
  }

  const handlePreview = () => {
    if (resultBlob) {
      const url = URL.createObjectURL(resultBlob)
      window.open(url, '_blank')
    }
  }

  if (completed) {
    return (
      <CompletedState
        fileName="images-to-pdf.pdf"
        fileSize={resultBlob?.size || 0}
        onReset={handleReset}
        onDownload={handleDownload}
        onPreview={handlePreview}
      />
    )
  }

  if (processing) {
    return (
      <ProcessingState progress={progress} message={progressMessage || 'Creating PDF from images...'} />
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
          <FileDropzone onDrop={handleDrop} accept="image/*" multiple />
        ) : (
          <>
            <FileList files={files} onRemove={handleRemove} />
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => document.getElementById('file-input').click()}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus size={18} />
                <span>Add more images</span>
              </button>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleDrop(Array.from(e.target.files))}
                className="hidden"
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Image order (drag to reorder)
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
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Page size</h3>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Orientation</h3>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleConvert}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Create PDF
            </button>
          </>
        )}
      </div>
  )
}
