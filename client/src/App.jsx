import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Tools from './pages/Tools'
import Privacy from './pages/Privacy'
import ToolSidebar from './components/ToolSidebar'
import ToolLayout from './components/ToolLayout'
import MergePDF from './pages/tools/MergePDF'
import SplitPDF from './pages/tools/SplitPDF'
import CompressPDF from './pages/tools/CompressPDF'
import PDFToJPG from './pages/tools/PDFToJPG'
import JPGToPDF from './pages/tools/JPGToPDF'
import RotatePDF from './pages/tools/RotatePDF'
import DeletePages from './pages/tools/DeletePages'
import ReorderPages from './pages/tools/ReorderPages'
import WatermarkPDF from './pages/tools/WatermarkPDF'
import AddTextSignature from './pages/tools/AddTextSignature'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/" element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          } />
          
          <Route path="/tools" element={
            <>
              <Navbar />
              <Tools />
            </>
          } />
          
          <Route path="/privacy" element={
            <>
              <Navbar />
              <Privacy />
              <Footer />
            </>
          } />
          
          <Route path="/tools/:slug" element={
            <div className="flex">
              <ToolSidebar />
              <main className="flex-1 lg:ml-64">
                <Routes>
                  <Route path="merge-pdf" element={<ToolLayout><MergePDF /></ToolLayout>} />
                  <Route path="split-pdf" element={<ToolLayout><SplitPDF /></ToolLayout>} />
                  <Route path="compress-pdf" element={<ToolLayout><CompressPDF /></ToolLayout>} />
                  <Route path="pdf-to-jpg" element={<ToolLayout><PDFToJPG /></ToolLayout>} />
                  <Route path="jpg-to-pdf" element={<ToolLayout><JPGToPDF /></ToolLayout>} />
                  <Route path="rotate-pdf" element={<ToolLayout><RotatePDF /></ToolLayout>} />
                  <Route path="delete-pages" element={<ToolLayout><DeletePages /></ToolLayout>} />
                  <Route path="reorder-pages" element={<ToolLayout><ReorderPages /></ToolLayout>} />
                  <Route path="watermark-pdf" element={<ToolLayout><WatermarkPDF /></ToolLayout>} />
                  <Route path="add-text-signature" element={<ToolLayout><AddTextSignature /></ToolLayout>} />
                </Routes>
              </main>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
