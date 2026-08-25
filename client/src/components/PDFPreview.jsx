import { useState } from 'react'
import PDFPageCard from './PDFPageCard'

export default function PDFPreview({ pages, onPageSelect, selectedPages, onPageDelete, onPageRotate, draggable = false, onPageReorder }) {
  const [draggedIndex, setDraggedIndex] = useState(null)

  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return
    
    if (onPageReorder) {
      const newOrder = [...pages.map((_, i) => i)]
      const draggedItem = newOrder[draggedIndex]
      newOrder.splice(draggedIndex, 1)
      newOrder.splice(dropIndex, 0, draggedItem)
      onPageReorder(newOrder)
    }
    
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {pages.map((page, index) => (
        <PDFPageCard
          key={index}
          page={page}
          index={index}
          selected={selectedPages?.includes(index)}
          onSelect={onPageSelect}
          onDelete={onPageDelete}
          onRotate={onPageRotate}
          draggable={draggable}
          onDragStart={draggable ? () => handleDragStart(index) : undefined}
          onDragOver={draggable ? handleDragOver : undefined}
          onDrop={draggable ? () => handleDrop(index) : undefined}
          onDragEnd={draggable ? handleDragEnd : undefined}
          isDragging={draggedIndex === index}
        />
      ))}
    </div>
  )
}
