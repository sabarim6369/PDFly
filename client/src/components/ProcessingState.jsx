export default function ProcessingState({ progress = 0, message = 'Processing...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-6" />
      
      <h3 className="text-xl font-medium text-gray-900 mb-2">
        Processing PDF...
      </h3>
      
      <div className="w-64 bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
