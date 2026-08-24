import { useState } from 'react'
import { Upload, Lock } from 'lucide-react'

export default function FileDropzone({ onDrop, accept = '.pdf', multiple = false }) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    onDrop(files)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    onDrop(files)
  }

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-12 text-center transition-all
        ${isDragOver
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className={`
          p-4 rounded-full transition-colors
          ${isDragOver ? 'bg-blue-100' : 'bg-gray-100'}
        `}>
          <Upload size={32} className={isDragOver ? 'text-blue-600' : 'text-gray-600'} />
        </div>

        <div>
          <p className="text-lg font-medium text-gray-900 mb-1">
            Drop your {accept === '.pdf' ? 'PDF' : 'files'} here
          </p>
          <p className="text-gray-500 mb-4">or</p>
          <label className="inline-block px-6 py-2 bg-gray-900 text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
            Choose Files
            <input
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Lock size={14} />
          <span>Your files stay on your device</span>
        </div>
      </div>
    </div>
  )
}
