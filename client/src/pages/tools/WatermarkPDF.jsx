import { useState } from 'react'
import ToolLayout from '../../components/ToolLayout'
import FileDropzone from '../../components/FileDropzone'
import PDFPreview from '../../components/PDFPreview'
import ProcessingState from '../../components/ProcessingState'
import CompletedState from '../../components/CompletedState'

export default function WatermarkPDF() {
  const [file, setFile] = useState(null)
  const [watermarkText, setWatermarkText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [opacity, setOpacity] = useState(50)
  const [position, setPosition] = useState('center')
  const [rotation, setRotation] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)

  const mockPages = Array.from({ length: 4 }, (_, i) => ({ id: i + 1 }))

  const positionOptions = [
    { id: 'top-left', name: 'Top Left' },
    { id: 'top-center', name: 'Top Center' },
    { id: 'top-right', name: 'Top Right' },
    { id: 'center', name: 'Center' },
    { id: 'bottom-left', name: 'Bottom Left' },
    { id: 'bottom-center', name: 'Bottom Center' },
    { id: 'bottom-right', name: 'Bottom Right' }
  ]

  const handleDrop = (files) => {
    if (files.length > 0) {
      setFile(files[0])
    }
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
    setWatermarkText('')
    setFontSize(24)
    setOpacity(50)
    setPosition('center')
    setRotation(0)
    setCompleted(false)
  }

  if (completed) {
    return (
      <ToolLayout>
        <CompletedState
          fileName="watermarked-document.pdf"
          fileSize={2.5 * 1024 * 1024}
          onReset={handleReset}
        />
      </ToolLayout>
    )
  }

  if (processing) {
    return (
      <ToolLayout>
        <ProcessingState progress={60} message="Adding watermark..." />
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

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Watermark text
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter watermark text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Font size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Opacity: {opacity}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Position
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    {positionOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Rotation: {rotation}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Preview</h3>
                <PDFPreview pages={mockPages} />
              </div>
            </div>

            <button
              onClick={handleApply}
              disabled={!watermarkText}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Apply watermark
            </button>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
