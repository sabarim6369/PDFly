import { useState, useMemo, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import FileDropzone from '../../components/FileDropzone'
import PDFPreview from '../../components/PDFPreview'
import ProcessingState from '../../components/ProcessingState'
import CompletedState from '../../components/CompletedState'
import { Type, PenTool } from 'lucide-react'
import { addTextSignature } from '../../lib/pdf/addTextSignature'
import { validatePDFFile, downloadBlob, getPDFPageCount } from '../../lib/pdf/deletePDF'
import SignaturePad from '../../components/SignaturePad'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.2.108/pdf.worker.min.mjs'

export default function AddTextSignature() {
  const [file, setFile] = useState(null)
  const [tool, setTool] = useState('text')
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [textColor, setTextColor] = useState('Black')
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [error, setError] = useState(null)
  
  const [pdfDoc, setPdfDoc] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [selectedPage, setSelectedPage] = useState(0) // Default to first page
  const [resultBlob, setResultBlob] = useState(null)
  
  const sigCanvas = useRef({})

  const pages = useMemo(() => {
    if (pageCount > 0) {
      return Array.from({ length: pageCount }, (_, i) => ({ 
        id: i + 1,
        pageNumber: i + 1
      }))
    }
    return []
  }, [pageCount])

  const handleDrop = async (files) => {
    if (files.length > 0) {
      const validation = validatePDFFile(files[0])
      if (!validation.valid) {
        setError(validation.error)
        return
      }
      
      setFile(files[0])
      setError(null)
      setSelectedPage(0)
      
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
    if (!file) return
    if (tool === 'text' && !text) return
    if (tool === 'signature' && sigCanvas.current.isEmpty()) return
    
    setProcessing(true)
    setProgress(0)
    setError(null)
    
    try {
      let signatureData = null
      if (tool === 'signature') {
        const dataURL = sigCanvas.current.toDataURL('image/png')
        const response = await fetch(dataURL)
        const blob = await response.blob()
        signatureData = { type: 'image/png', blob }
      }

      const textData = { text, fontSize, color: textColor }
      
      const blob = await addTextSignature(
        file, 
        tool, 
        textData, 
        signatureData, 
        selectedPage,
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
    setTool('text')
    setText('')
    setFontSize(24)
    setTextColor('Black')
    setCompleted(false)
    setPdfDoc(null)
    setPageCount(0)
    setResultBlob(null)
    setProgress(0)
    if (sigCanvas.current && sigCanvas.current.clear) sigCanvas.current.clear()
  }

  const handleDownload = () => {
    if (!resultBlob || !file) return
    const filename = file.name.replace('.pdf', '-annotated.pdf')
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
        fileName={file ? file.name.replace('.pdf', '-annotated.pdf') : 'annotated-document.pdf'}
        fileSize={resultBlob?.size || 0}
        onReset={handleReset}
        onDownload={handleDownload}
        onPreview={handlePreview}
      />
    )
  }

  if (processing) {
    return (
      <ProcessingState progress={progress} message={progressMessage || "Adding annotation..."} />
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

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Color</label>
                    <select 
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
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
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white">
                    <SignaturePad ref={sigCanvas} penColor="black" />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={() => sigCanvas.current.clear()}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Select page to sign/annotate</h3>
              <select 
                value={selectedPage}
                onChange={(e) => setSelectedPage(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 mb-4"
              >
                {pages.map(page => (
                  <option key={page.id} value={page.id - 1}>Page {page.id}</option>
                ))}
              </select>
              <PDFPreview pages={pages.filter(p => p.id - 1 === selectedPage)} pdf={pdfDoc} scale={0.6} />
            </div>

            <button
              onClick={handleApply}
              disabled={tool === 'text' ? !text : false}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Apply {tool === 'text' ? 'text' : 'signature'}
            </button>
          </>
        )}
      </div>
  )
}
