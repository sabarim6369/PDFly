import PDFPageCard from './PDFPageCard'

export default function PDFPreview({ pages, onPageSelect, selectedPages, onPageDelete, onPageRotate, draggable = false }) {
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
        />
      ))}
    </div>
  )
}
