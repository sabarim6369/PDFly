import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div>
            <Link to="/" className="text-xl font-semibold text-gray-900">
              PDFly
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              PDF tools. Simple. Private.
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              to="/tools"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Tools
            </Link>
            <Link
              to="/privacy"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Privacy
            </Link>
            <a
              href="https://github.com/sabarim6369/PDFly"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
