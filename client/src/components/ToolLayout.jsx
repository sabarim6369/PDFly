import { Link } from 'react-router-dom'
import { getToolBySlug } from '../data/tools'

export default function ToolLayout({ children, toolSlug }) {
  console.log('ToolLayout received toolSlug:', toolSlug)
  const tool = getToolBySlug(toolSlug)
  console.log('Found tool:', tool)

  if (!tool) {
    return <div>Tool not found: {toolSlug}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-8">
          <Link
            to="/tools"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Tools
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-sm text-gray-900 font-medium">{tool.name}</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            {tool.name}
          </h1>
          <p className="text-gray-600">
            {tool.description}
          </p>
        </div>

        {children}
      </div>
    </div>
  )
}
