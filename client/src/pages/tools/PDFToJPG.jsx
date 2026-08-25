import { useState } from 'react'
import FileDropzone from '../../components/FileDropzone'
import PDFPreview from '../../components/PDFPreview'
import ProcessingState from '../../components/ProcessingState'
import CompletedState from '../../components/CompletedState'
import { convertPDFToJPG, getPDFPageCount, validatePDFFile, downloadImages } from '../../lib/pdf/pdfToJPG'

export default function PDFToJPG() {
  const [file, setFile] = useState(null)
  const [selectedPages, setSelectedPages] = useState([])
  const [quality, setQuality] = useState('high')
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [convertedImages, setConvertedImages] = useState(null)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [error, setError] = useState(null)

  const pages = pageCount > 0 
    ? Array.from({ length: pageCount }, (_, i) => ({ id: i + 1 }))
    : []

  const qualityOptions = [
    { id: 'low', name: 'Low', description: 'Smaller file size' },
    { id: 'medium', name: 'Medium', description: 'Balanced quality' },
    { id: 'high', name: 'High', description: 'Best quality' }
  ]

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

  const handleConvert = async () => {
    if (!file) return
    
    setProcessing(true)
    setProgress(0)
    setError(null)
    
    try {
      const images = await convertPDFToJPG(file, selectedPages, quality, (progress, message) => {
        setProgress(progress)
        setProgressMessage(message)
      })
      
      setConvertedImages(images)
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
    setQuality('high')
    setCompleted(false)
    setPageCount(0)
    setConvertedImages(null)
    setError(null)
    setProgress(0)
  }

  const handleDownload = () => {
    if (!convertedImages || !file) return
    
    const baseName = file.name.replace('.pdf', '')
    downloadImages(convertedImages, baseName)
  }

  if (completed) {
    const totalSize = convertedImages ? convertedImages.reduce((acc, img) => acc + img.blob.size, 0) : 0
    
    return (
      <CompletedState
        fileName={`${file.name.replace('.pdf', '')}-images.zip`}
        fileSize={totalSize}
        onDownload={handleDownload}
        onReset={handleReset}
      />
    )
  }

  if (processing) {
    return (
      <ProcessingState progress={progress} message={progressMessage || 'Converting to JPG...'} />
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
                Select pages to convert ({pageCount} pages total)
              </h3>
              <PDFPreview
                pages={pages}
                selectedPages={selectedPages}
                onPageSelect={handlePageSelect}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Image quality</h3>
              <div className="flex space-x-4">
                {qualityOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`
                      flex-1 p-4 border rounded-lg cursor-pointer text-center transition-all
                      ${quality === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="quality"
                      value={option.id}
                      checked={quality === option.id}
                      onChange={(e) => setQuality(e.target.value)}
                      className="sr-only"
                    />
                    <p className="font-medium text-gray-900">{option.name}</p>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={selectedPages.length === 0}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Convert to JPG
            </button>
          </>
        )}
      </div>
  )
}
