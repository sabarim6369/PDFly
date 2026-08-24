import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function ToolCard({ tool }) {
  const Icon = tool.icon

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="group p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
            <Icon size={24} className="text-gray-700" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
              {tool.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {tool.description}
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all"
        />
      </div>
    </Link>
  )
}
