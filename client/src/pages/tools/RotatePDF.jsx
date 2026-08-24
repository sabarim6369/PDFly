import { useState } from 'react'
import ToolLayout from '../../components/ToolLayout'
import FileDropzone from '../../components/FileDropzone'
import PDFPreview from '../../components/PDFPreview'
import ProcessingState from '../../components/ProcessingState'
import CompletedState from '../../components/CompletedState'
import { RotateCw, RotateCcw } from 'lucide-react'

export default function RotatePDF() {
  const [file, setFile] = useState(null)
  const [selectedPages, setSelectedPages] = useState([])
  const [rotations, setRotations] = useState({})
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)

  const mockPages = Array.from({ length: 6 }, (_, i) => ({ id: i + 1 }))

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
      mockPages.forEach((_, i) => {
        newRotations[i] = (newRotations[i] || 0) + adjustment
      })
      return newRotations
    })
  }

  const handleApply = () => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setCompleted(true)
    }, 2000)
  }

  const handleReset = () => {
    setFile(null)
    setSelectedPages([])
    setRotations({})
    setCompleted(false)
  }

  if (completed) {
    return (
      <ToolLayout>
        <CompletedState
          fileName="rotated-document.pdf"
          fileSize={2.4 * 1024 * 1024}
          onReset={handleReset}
        />
      </ToolLayout>
    )
  }

  if (processing) {
    return (
      <ToolLayout>
        <ProcessingState progress={55} message="Rotating pages..." />
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
                Select pages to rotate
              </h3>
              <PDFPreview
                pages={mockPages}
                selectedPages={selectedPages}
                onPageSelect={handlePageSelect}
                onPageRotate={handleRotate}
              />
            </div>

            <button
              onClick={handleApply}
              disabled={selectedPages.length === 0}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Apply rotation
            </button>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
