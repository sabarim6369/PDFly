import { useState, useEffect } from 'react'
import FileDropzone from '../../components/FileDropzone'
import PDFPreview from '../../components/PDFPreview'
import ProcessingState from '../../components/ProcessingState'
import CompletedState from '../../components/CompletedState'
import { splitPDF, getPDFPageCount, validatePDFFile, formatFileSize, downloadBlob, downloadBlobs } from '../../lib/pdf/splitPDF'

export default function SplitPDF() {
  const [file, setFile] = useState(null)
  const [selectedPages, setSelectedPages] = useState([])
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [splitMethod, setSplitMethod] = useState('selectPages')
  const [pageRangesInput, setPageRangesInput] = useState('')
  const [mergeIntoSinglePdf, setMergeIntoSinglePdf] = useState(false)
  const [splitResult, setSplitResult] = useState(null)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [error, setError] = useState(null)

  const pages = pageCount > 0 
    ? Array.from({ length: pageCount }, (_, i) => ({ id: i + 1 }))
    : []

  const handleDrop = async (files) => {
    if (files.length > 0) {
      const validation = validatePDFFile(files[0])
      if (!validation.valid) {
        setError(validation.error)
        return
      }
      
      setFile(files[0])
      setError(null)
      setSelectedPages([])
      setCompleted(false)
      
      try {
        const count = await getPDFPageCount(files[0])
        setPageCount(count)
      } catch (err) {
        setError('Failed to read PDF file')
        setFile(null)
      }
    }
  }

  const handlePageSelect = (index) => {
    setSelectedPages(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const parsePageRanges = (input) => {
    const ranges = []
    const parts = input.split(',').map(p => p.trim()).filter(p => p)
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()))
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            const index = i - 1 // Convert to 0-based index
            if (index >= 0 && index < pageCount && !ranges.includes(index)) {
              ranges.push(index)
            }
          }
        }
      } else {
        const page = parseInt(part)
        const index = page - 1 // Convert to 0-based index
        if (!isNaN(page) && page >= 1 && page <= pageCount && !ranges.includes(index)) {
          ranges.push(index)
        }
      }
    }
    
    return ranges.sort((a, b) => a - b)
  }

  const parseRangeGroups = (input) => {
    const groups = []
    const parts = input.split(',').map(p => p.trim()).filter(p => p)
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()))
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          groups.push({ start: Math.max(1, start), end: Math.min(pageCount, end) })
        }
      } else {
        const page = parseInt(part)
        if (!isNaN(page) && page >= 1 && page <= pageCount) {
          groups.push({ start: page, end: page })
        }
      }
    }
    
    return groups
  }

  const addQuickRange = (range) => {
    const current = pageRangesInput.trim()
    const newInput = current ? `${current}, ${range}` : range
    setPageRangesInput(newInput)
  }

  const addAllPages = () => {
    setPageRangesInput(`1-${pageCount}`)
  }

  const splitAllPages = () => {
    // Create a comma-separated list of all individual pages
    const allPages = Array.from({ length: pageCount }, (_, i) => i + 1).join(', ')
    setPageRangesInput(allPages)
  }

  const handleSplit = async () => {
    if (!file) return
    
    setProcessing(true)
    setProgress(0)
    setError(null)
    
    try {
      let result
      
      if (splitMethod === 'selectPages') {
        if (selectedPages.length === 0) {
          setError('Please select at least one page')
          setProcessing(false)
          return
        }
        console.log('Splitting with selected pages:', selectedPages)
        result = await splitPDF(file, selectedPages, 'extract', (progress, message) => {
          setProgress(progress)
          setProgressMessage(message)
        })
      } else {
        if (!pageRangesInput.trim()) {
          setError('Please enter page ranges')
          setProcessing(false)
          return
        }
        
        if (mergeIntoSinglePdf) {
          const pages = parsePageRanges(pageRangesInput)
          console.log('Parsed pages for merge:', pages)
          if (pages.length === 0) {
            setError('Invalid page ranges')
            setProcessing(false)
            return
          }
          result = await splitPDF(file, pages, 'extract', (progress, message) => {
            setProgress(progress)
            setProgressMessage(message)
          })
        } else {
          const rangeGroups = parseRangeGroups(pageRangesInput)
          console.log('Parsed range groups:', rangeGroups)
          if (rangeGroups.length === 0) {
            setError('Invalid page ranges')
            setProcessing(false)
            return
          }
          result = await splitPDF(file, rangeGroups, 'range', (progress, message) => {
            setProgress(progress)
            setProgressMessage(message)
          })
        }
      }
      
      setSplitResult(result)
      setCompleted(true)
    } catch (err) {
      console.error('Split error:', err)
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setSelectedPages([])
    setCompleted(false)
    setPageCount(0)
    setSplitMethod('selectPages')
    setPageRangesInput('')
    setMergeIntoSinglePdf(false)
    setSplitResult(null)
    setError(null)
    setProgress(0)
  }

  const handleDownload = () => {
    if (!splitResult || !file) return
    
    const baseName = file.name.replace('.pdf', '')
    
    if (Array.isArray(splitResult)) {
      downloadBlobs(splitResult, baseName)
    } else {
      downloadBlob(splitResult, `${baseName}-extracted.pdf`)
    }
  }

  if (completed) {
    const fileSize = Array.isArray(splitResult) 
      ? splitResult.reduce((acc, blob) => acc + blob.size, 0)
      : splitResult?.size || 0
    
    return (
      <CompletedState
        fileName={Array.isArray(splitResult) 
          ? `${file.name.replace('.pdf', '')}-split.zip` 
          : `${file.name.replace('.pdf', '')}-extracted.pdf`}
        fileSize={fileSize}
        onDownload={handleDownload}
        onReset={handleReset}
      />
    )
  }

  if (processing) {
    return (
      <ProcessingState progress={progress} message={progressMessage || 'Splitting PDF pages...'} />
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

          <div className="flex space-x-3 mb-6">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${splitMethod === 'selectPages' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setSplitMethod('selectPages')}
            >
              Select Pages
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${splitMethod === 'typeRanges' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setSplitMethod('typeRanges')}
            >
              Type Ranges
            </button>
          </div>

          {splitMethod === 'selectPages' ? (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Select pages to extract ({pageCount} pages total)
              </h3>
              <PDFPreview
                pages={pages}
                selectedPages={selectedPages}
                onPageSelect={handlePageSelect}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={mergeIntoSinglePdf}
                    onChange={(e) => setMergeIntoSinglePdf(e.target.checked)}
                    className="w-4 h-4 text-gray-900 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900">Merge into single PDF</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Page Ranges</label>
                <textarea
                  value={pageRangesInput}
                  onChange={(e) => setPageRangesInput(e.target.value)}
                  placeholder="e.g., 1-20, 21-40, 41-9"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Formats: 1-20 range, 5 single, 1-20, 21-40 multiple
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Quick Splits</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => addQuickRange('1-4')}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    + 1-4
                  </button>
                  <button
                    onClick={() => addQuickRange('5-9')}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    + 5-9
                  </button>
                  <button
                    onClick={() => addQuickRange('1-3')}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    + 1-3
                  </button>
                  <button
                    onClick={() => addQuickRange('4-6')}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    + 4-6
                  </button>
                  <button
                    onClick={addAllPages}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    + All pages
                  </button>
                  <button
                    onClick={splitAllPages}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                  >
                    Split All Pages
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSplit}
            disabled={
              splitMethod === 'selectPages' 
                ? selectedPages.length === 0 
                : !pageRangesInput.trim()
            }
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {splitMethod === 'typeRanges' ? 'Enter Page Ranges Above' : 'Split PDF'}
          </button>
        </>
      )}
    </div>
  )
}
