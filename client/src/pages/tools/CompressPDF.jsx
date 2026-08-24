import { useState } from 'react'
import ToolLayout from '../../components/ToolLayout'
import FileDropzone from '../../components/FileDropzone'
import ProcessingState from '../../components/ProcessingState'
import CompletedState from '../../components/CompletedState'
import { compressPDF, validatePDFFile, formatFileSize, downloadBlob, calculateCompressionRatio } from '../../lib/pdf/compressPDF'

export default function CompressPDF() {
  const [file, setFile] = useState(null)
  const [compressionLevel, setCompressionLevel] = useState('recommended')
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [compressedBlob, setCompressedBlob] = useState(null)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [error, setError] = useState(null)

  const compressionOptions = [
    {
      id: 'recommended',
      name: 'Recommended',
      description: 'Balanced compression with good quality',
      reduction: '60%',
      outputSize: '1.2 MB'
    },
    {
      id: 'balanced',
      name: 'Balanced',
      description: 'Higher compression, acceptable quality',
      reduction: '75%',
      outputSize: '800 KB'
    },
    {
      id: 'maximum',
      name: 'Maximum Compression',
      description: 'Smallest file size, lower quality',
      reduction: '85%',
      outputSize: '500 KB'
    }
  ]

  const handleDrop = (files) => {
    if (files.length > 0) {
      const validation = validatePDFFile(files[0])
      if (!validation.valid) {
        setError(validation.error)
        return
      }
      setFile(files[0])
      setError(null)
    }
  }

  const handleCompress = async () => {
    if (!file) return
    
    setProcessing(true)
    setProgress(0)
    setError(null)
    
    try {
      const blob = await compressPDF(file, compressionLevel, (progress, message) => {
        setProgress(progress)
        setProgressMessage(message)
      })
      
      setCompressedBlob(blob)
      setCompleted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setCompressionLevel('recommended')
    setCompleted(false)
    setCompressedBlob(null)
    setError(null)
    setProgress(0)
  }

  const handleDownload = () => {
    if (compressedBlob && file) {
      const originalName = file.name.replace('.pdf', '')
      downloadBlob(compressedBlob, `${originalName}-compressed.pdf`)
    }
  }

  if (completed) {
    const compressedSize = compressedBlob ? compressedBlob.size : 0
    const originalSize = file ? file.size : 0
    const reduction = calculateCompressionRatio(originalSize, compressedSize)
    
    return (
      <ToolLayout toolSlug="compress-pdf">
        <CompletedState
          fileName={file ? file.name.replace('.pdf', '-compressed.pdf') : 'compressed-document.pdf'}
          fileSize={compressedSize}
          originalSize={originalSize}
          reduction={reduction}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      </ToolLayout>
    )
  }

  if (processing) {
    return (
      <ToolLayout toolSlug="compress-pdf">
        <ProcessingState progress={progress} message={progressMessage || 'Compressing PDF...'} />
      </ToolLayout>
    )
  }

  return (
    <ToolLayout toolSlug="compress-pdf">
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
              <h3 className="text-sm font-medium text-gray-900 mb-4">Compression level</h3>
              <div className="space-y-3">
                {compressionOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`
                      block p-4 border rounded-lg cursor-pointer transition-all
                      ${compressionLevel === option.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="compression"
                          value={option.id}
                          checked={compressionLevel === option.id}
                          onChange={(e) => setCompressionLevel(e.target.value)}
                          className="mt-1 text-gray-900"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{option.name}</p>
                          <p className="text-sm text-gray-500">{option.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">{option.reduction} smaller</p>
                        <p className="text-xs text-gray-500">Est. {option.outputSize}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleCompress}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Compress PDF
            </button>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
