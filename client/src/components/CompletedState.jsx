import { Download, RefreshCw } from 'lucide-react'

export default function CompletedState({ fileName, fileSize, onReset, onDownload }) {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h3 className="text-xl font-medium text-gray-900 mb-2">
        PDF is ready
      </h3>

      <div className="text-center mb-6">
        <p className="text-lg font-medium text-gray-900">{fileName}</p>
        <p className="text-sm text-gray-500">{formatFileSize(fileSize)}</p>
      </div>

      <div className="flex space-x-4">
        <button 
          onClick={onDownload}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Download size={20} />
          <span>Download PDF</span>
        </button>
        
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={20} />
          <span>Merge more PDFs</span>
        </button>
      </div>
    </div>
  )
}
