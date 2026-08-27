import { Trash2, RotateCw, GripVertical } from 'lucide-react'
import PDFPagePreview from './PDFPagePreview'

export default function PDFPageCard({ page, index, selected, onSelect, onDelete, onRotate, draggable = false, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, pdf, scale }) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`
        relative group bg-white border rounded-lg overflow-hidden transition-all
        ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      {draggable && (
        <div className="absolute top-2 left-2 p-1 bg-white/80 rounded cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <GripVertical size={16} className="text-gray-400" />
        </div>
      )}

      <div
        className="aspect-[3/4] bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden"
        onClick={() => onSelect?.(index)}
      >
        {pdf ? (
          <PDFPagePreview
            pdf={pdf}
            pageNumber={page.pageNumber}
            scale={scale}
          />
        ) : (
          <div className="text-center">
            <div className="w-16 h-20 bg-gray-200 rounded mx-auto mb-2" />
            <p className="text-xs text-gray-500">Page {index + 1}</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
        Page {page.id}
      </div>

      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {onRotate && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRotate(index)
            }}
            className="p-1.5 bg-white rounded shadow-sm hover:bg-gray-50 transition-colors"
            aria-label="Rotate page"
          >
            <RotateCw size={14} className="text-gray-600" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(index)
            }}
            className="p-1.5 bg-white rounded shadow-sm hover:bg-red-50 transition-colors"
            aria-label="Delete page"
          >
            <Trash2 size={14} className="text-gray-600 hover:text-red-600" />
          </button>
        )}
      </div>
    </div>
  )
}
