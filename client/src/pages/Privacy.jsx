import { Lock, Shield, EyeOff } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600">
            Your files stay on your device. Always.
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Client-Side Processing
            </h2>
            <p className="text-gray-600 mb-4">
              PDFly is designed around client-side processing. When you use our tools, your documents are processed directly in your browser. Your files never need to be uploaded to our servers for the core PDF operations.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <Lock size={24} className="text-gray-700 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">No Server Upload</h3>
                  <p className="text-gray-600 text-sm">
                    Your PDF files remain on your device throughout the entire process. We don't store, transmit, or have access to your documents.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              What We Don't Do
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <EyeOff size={20} className="text-gray-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">We don't store your files</p>
                  <p className="text-gray-600 text-sm">All processing happens locally in your browser.</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <EyeOff size={20} className="text-gray-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">We don't require account creation</p>
                  <p className="text-gray-600 text-sm">Use our tools immediately without signing up.</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <EyeOff size={20} className="text-gray-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">We don't track your documents</p>
                  <p className="text-gray-600 text-sm">We have no visibility into what files you process.</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <EyeOff size={20} className="text-gray-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">We don't sell your data</p>
                  <p className="text-gray-600 text-sm">We have no data to sell because we never receive it.</p>
                </div>
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              How It Works
            </h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">You select a file</h3>
                  <p className="text-gray-600 text-sm">
                    Choose a PDF from your device or drag and drop it into the tool.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Processing happens locally</h3>
                  <p className="text-gray-600 text-sm">
                    JavaScript running in your browser performs the PDF operations. No data leaves your device.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">You download the result</h3>
                  <p className="text-gray-600 text-sm">
                    The processed file is generated locally and saved to your device.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Technical Details
            </h2>
            <p className="text-gray-600 mb-4">
              PDFly uses modern web technologies to process PDFs entirely in the browser:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• All PDF processing uses JavaScript libraries that run in your browser</li>
                <li>• No data is transmitted to external servers</li>
                <li>• Files are processed in memory and never written to disk on our servers</li>
                <li>• The application works offline after initial load</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Contact
            </h2>
            <p className="text-gray-600 mb-4">
              If you have questions about privacy or how PDFly works, please reach out through our GitHub repository.
            </p>
            <a
              href="https://github.com/sabarim6369/PDFly"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-gray-900 hover:text-gray-700 transition-colors"
            >
              <Shield size={18} />
              <span>View on GitHub</span>
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
