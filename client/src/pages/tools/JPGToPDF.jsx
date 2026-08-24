import { useState } from 'react'
import ToolLayout from '../../components/ToolLayout'
import FileDropzone from '../../components/FileDropzone'
import FileList from '../../components/FileList'
import ProcessingState from '../../components/ProcessingState'
import CompletedState from '../../components/CompletedState'
import { GripVertical, Plus } from 'lucide-react'

export default function JPGToPDF() {
  const [files, setFiles] = useState([])
  const [pageSize, setPageSize] = useState('a4')
  const [orientation, setOrientation] = useState('portrait')
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)

  const pageSizeOptions = [
    { id: 'a4', name: 'A4' },
    { id: 'letter', name: 'Letter' },
    { id: 'legal', name: 'Legal' }
  ]

  const handleDrop = (newFiles) => {
    setFiles([...files, ...newFiles])
  }

  const handleRemove = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleConvert = () => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setCompleted(true)
    }, 2000)
  }

  const handleReset = () => {
    setFiles([])
    setCompleted(false)
  }

  if (completed) {
    return (
      <ToolLayout>
        <CompletedState
          fileName="images-to-pdf.pdf"
          fileSize={3.8 * 1024 * 1024}
          onReset={handleReset}
        />
      </ToolLayout>
    )
  }

  if (processing) {
    return (
      <ToolLayout>
        <ProcessingState progress={65} message="Creating PDF from images..." />
      </ToolLayout>
    )
  }

  return (
    <ToolLayout>
      <div className="space-y-8">
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
                    className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg"
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
    </ToolLayout>
  )
}
