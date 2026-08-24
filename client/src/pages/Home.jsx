import { Link } from 'react-router-dom'
import { ArrowRight, Lock, Zap, X, FileText, Upload, Download } from 'lucide-react'
import ToolCard from '../components/ToolCard'
import { tools } from '../data/tools'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-semibold text-gray-900 mb-6">
                PDF tools. Simple. Private.
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Merge, split, compress, edit and organize your PDFs — directly in your browser.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/tools"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Explore PDF Tools
                  <ArrowRight size={20} className="ml-2" />
                </Link>
                <button className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  How it works
                </button>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Lock size={16} />
                <span>Your files stay on your device</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="w-80 h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileText size={64} className="text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <div className="w-48 h-3 bg-gray-200 rounded mx-auto" />
                      <div className="w-32 h-3 bg-gray-200 rounded mx-auto" />
                      <div className="w-40 h-3 bg-gray-200 rounded mx-auto" />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Upload size={24} className="text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-blue-600 font-medium">Upload</p>
                  </div>
                </div>
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-green-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Download size={24} className="text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-green-600 font-medium">Download</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-gray-100">
          <h2 className="text-3xl font-semibold text-gray-900 mb-12 text-center">
            Everything you need to work with PDFs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>

        <section className="py-16 border-t border-gray-100 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4 text-center">
              Your files stay yours.
            </h2>
            <p className="text-xl text-gray-600 mb-12 text-center max-w-2xl mx-auto">
              PDFly is designed around client-side processing. Your documents don't need to be uploaded to a server for the core PDF tools.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Lock size={32} className="text-gray-700" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Private</h3>
                <p className="text-gray-600">Your documents stay on your device.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Zap size={32} className="text-gray-700" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Fast</h3>
                <p className="text-gray-600">Process files directly in your browser.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <X size={32} className="text-gray-700" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Signup</h3>
                <p className="text-gray-600">Open a tool and start working immediately.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-gray-100">
          <h2 className="text-3xl font-semibold text-gray-900 mb-12 text-center">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-medium">
                01
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Choose your file</h3>
              <p className="text-gray-600">Select or drag your PDF into the tool.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-medium">
                02
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Process in your browser</h3>
              <p className="text-gray-600">The document is processed locally.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-medium">
                03
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Download the result</h3>
              <p className="text-gray-600">Download your processed document.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
