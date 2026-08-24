import { useState } from 'react'
import ToolLayout from '../../components/ToolLayout'
import FileDropzone from '../../components/FileDropzone'
import PDFPreview from '../../components/PDFPreview'
import ProcessingState from '../../components/ProcessingState'
import CompletedState from '../../components/CompletedState'
import { Type, PenTool } from 'lucide-react'

export default function AddTextSignature() {
  const [file, setFile] = useState(null)
  const [tool, setTool] = useState('text')
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(16)
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)

  const mockPages = Array.from({ length: 4 }, (_, i) => ({ id: i + 1 }))

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
    setTool('text')
    setText('')
    setFontSize(16)
    setCompleted(false)
  }

  if (completed) {
    return (
      <ToolLayout>
        <CompletedState
          fileName="annotated-document.pdf"
          fileSize={2.3 * 1024 * 1024}
          onReset={handleReset}
        />
      </ToolLayout>
    )
  }

  if (processing) {
    return (
      <ToolLayout>
        <ProcessingState progress={55} message="Adding annotation..." />
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
              <h3 className="text-sm font-medium text-gray-900 mb-4">Select tool</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => setTool('text')}
                  className={`
                    flex items-center space-x-2 px-4 py-3 border rounded-lg transition-all
                    ${tool === 'text'
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Type size={18} />
                  <span>Text</span>
                </button>
                <button
                  onClick={() => setTool('signature')}
                  className={`
                    flex items-center space-x-2 px-4 py-3 border rounded-lg transition-all
                    ${tool === 'signature'
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <PenTool size={18} />
                  <span>Signature</span>
                </button>
              </div>
            </div>

            {tool === 'text' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Text content
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text to add to PDF"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Font size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="48"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Font family</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200">
                      <option>Arial</option>
                      <option>Times New Roman</option>
                      <option>Helvetica</option>
                      <option>Georgia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Color</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200">
                      <option>Black</option>
                      <option>Blue</option>
                      <option>Red</option>
                      <option>Green</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {tool === 'signature' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Draw your signature
                  </label>
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <p className="text-gray-500 text-sm">Signature drawing area</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Clear
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Upload signature image
                  </button>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Position on page</h3>
              <PDFPreview pages={mockPages} />
            </div>

            <button
              onClick={handleApply}
              disabled={tool === 'text' && !text}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Apply {tool === 'text' ? 'text' : 'signature'}
            </button>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
