import { tools } from '../data/tools'
import { Link } from 'react-router-dom'

export default function Tools() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            PDF Tools
          </h1>
          <p className="text-gray-600">
            Choose a tool to get started with your PDF files.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              to={`/tools/${tool.slug}`}
              className="group p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                  <tool.icon size={24} className="text-gray-700" />
                </div>
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors mb-2">
                {tool.name}
              </h3>
              <p className="text-sm text-gray-500">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
