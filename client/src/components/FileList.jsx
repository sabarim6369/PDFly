import FileItem from './FileItem'

export default function FileList({ files, onRemove }) {
  if (files.length === 0) return null

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <FileItem
          key={index}
          file={file}
          onRemove={() => onRemove(index)}
        />
      ))}
    </div>
  )
}
