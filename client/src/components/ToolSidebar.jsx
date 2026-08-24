import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Lock, Home, ExternalLink } from 'lucide-react'
import { tools } from '../data/tools'

export default function ToolSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <>
      <button
        className="lg:hidden fixed top-20 left-4 z-40 p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white border-r border-gray-200
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100">
            <Link to="/" className="text-xl font-semibold text-gray-900">
              PDFly
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-3">
                PDF Tools
              </h2>
              <nav className="space-y-1">
                {tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    to={`/tools/${tool.slug}`}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors
                      ${isActive(`/tools/${tool.slug}`)
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <tool.icon size={18} />
                    <span>{tool.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <nav className="space-y-1">
                <Link
                  to="/privacy"
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors
                    ${isActive('/privacy')
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <Lock size={18} />
                  <span>Privacy</span>
                </Link>
                <a
                  href="https://github.com/sabarim6369/PDFly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <ExternalLink size={18} />
                  <span>GitHub</span>
                </a>
                <Link
                  to="/"
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors
                    ${isActive('/')
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <Home size={18} />
                  <span>Back to Home</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
