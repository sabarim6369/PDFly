import { useState, useMemo } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import FileDropzone from '../../components/FileDropzone'
import PDFPreview from '../../components/PDFPreview'
import ProcessingState from '../../components/ProcessingState'
import CompletedState from '../../components/CompletedState'
import { watermarkPDF } from '../../lib/pdf/watermarkPDF'
import { validatePDFFile, downloadBlob, getPDFPageCount } from '../../lib/pdf/deletePDF' // Reuse validation/download

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.2.108/pdf.worker.min.mjs'

export default function WatermarkPDF() {
  const [file, setFile] = useState(null)
  const [watermarkText, setWatermarkText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [opacity, setOpacity] = useState(50)
  const [position, setPosition] = useState('center')
  const [rotation, setRotation] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [error, setError] = useState(null)
  
  const [pdfDoc, setPdfDoc] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [resultBlob, setResultBlob] = useState(null)

  const pages = useMemo(() => {
    if (pageCount > 0) {
      return Array.from({ length: pageCount }, (_, i) => ({ 
        id: i + 1,
        pageNumber: i + 1
      }))
    }
    return []
  }, [pageCount])

  const positionOptions = [
    { id: 'top-left', name: 'Top Left' },
    { id: 'top-center', name: 'Top Center' },
    { id: 'top-right', name: 'Top Right' },
    { id: 'center', name: 'Center' },
    { id: 'bottom-left', name: 'Bottom Left' },
    { id: 'bottom-center', name: 'Bottom Center' },
    { id: 'bottom-right', name: 'Bottom Right' }
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
      
      try {
        const count = await getPDFPageCount(files[0])
        setPageCount(count)
        
        const arrayBuffer = await files[0].arrayBuffer()
        const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        setPdfDoc(loadedPdf)
      } catch (err) {
        setError('Failed to read PDF file')
        setFile(null)
      }
    }
  }

  const handleApply = async () => {
    if (!file || !watermarkText) return
    
    setProcessing(true)
    setProgress(0)
    setError(null)
    
    try {
      const blob = await watermarkPDF(
        file, 
        watermarkText, 
        fontSize, 
        opacity, 
        position, 
        rotation, 
        (p, msg) => {
          setProgress(p)
          setProgressMessage(msg)
        }
      )
      
      setResultBlob(blob)
      setCompleted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setWatermarkText('')
    setFontSize(24)
    setOpacity(50)
    setPosition('center')
    setRotation(0)
    setCompleted(false)
    setPdfDoc(null)
    setPageCount(0)
    setResultBlob(null)
    setProgress(0)
  }

  const handleDownload = () => {
    if (!resultBlob || !file) return
    const filename = file.name.replace('.pdf', '-watermarked.pdf')
    downloadBlob(resultBlob, filename)
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
        fileName={file ? file.name.replace('.pdf', '-watermarked.pdf') : 'watermarked.pdf'}
        fileSize={resultBlob?.size || 0}
        onReset={handleReset}
        onDownload={handleDownload}
        onPreview={handlePreview}
      />
    )
  }

  if (processing) {
    return (
      <ProcessingState progress={progress} message={progressMessage || "Adding watermark..."} />
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
                <PDFPreview pages={pages} pdf={pdfDoc} scale={0.4} />
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
  )
}
