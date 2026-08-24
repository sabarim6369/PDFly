import { useState } from 'react'
import ToolLayout from '../../components/ToolLayout'
import FileDropzone from '../../components/FileDropzone'
import PDFPreview from '../../components/PDFPreview'
import ProcessingState from '../../components/ProcessingState'
import CompletedState from '../../components/CompletedState'

export default function PDFToJPG() {
  const [file, setFile] = useState(null)
  const [selectedPages, setSelectedPages] = useState([])
  const [quality, setQuality] = useState('high')
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)

  const mockPages = Array.from({ length: 6 }, (_, i) => ({ id: i + 1 }))

  const qualityOptions = [
    { id: 'low', name: 'Low', description: 'Smaller file size' },
    { id: 'medium', name: 'Medium', description: 'Balanced quality' },
    { id: 'high', name: 'High', description: 'Best quality' }
  ]

  const handleDrop = (files) => {
    if (files.length > 0) {
      setFile(files[0])
    }
  }

  const handlePageSelect = (index) => {
    setSelectedPages(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const handleConvert = () => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setCompleted(true)
    }, 2000)
  }

  const handleReset = () => {
    setFile(null)
    setSelectedPages([])
    setQuality('high')
    setCompleted(false)
  }

  if (completed) {
    return (
      <ToolLayout>
        <CompletedState
          fileName="converted-images.zip"
          fileSize={4.2 * 1024 * 1024}
          onReset={handleReset}
        />
      </ToolLayout>
    )
  }

  if (processing) {
    return (
      <ToolLayout>
        <ProcessingState progress={70} message="Converting to JPG..." />
      </ToolLayout>
    )
  }

  return (
    <ToolLayout>
      <div className="space-y-8">
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
                Select pages to convert
              </h3>
              <PDFPreview
                pages={mockPages}
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
    </ToolLayout>
  )
}
