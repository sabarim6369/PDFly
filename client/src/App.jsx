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

function ToolWrapper({ children }) {
  return (
    <div className="flex">
      <ToolSidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}

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
          
          <Route path="/tools/merge-pdf" element={
            <ToolWrapper>
              <ToolLayout toolSlug="merge-pdf"><MergePDF /></ToolLayout>
            </ToolWrapper>
          } />
          <Route path="/tools/split-pdf" element={
            <ToolWrapper>
              <ToolLayout toolSlug="split-pdf"><SplitPDF /></ToolLayout>
            </ToolWrapper>
          } />
          <Route path="/tools/compress-pdf" element={
            <ToolWrapper>
              <ToolLayout toolSlug="compress-pdf"><CompressPDF /></ToolLayout>
            </ToolWrapper>
          } />
          <Route path="/tools/pdf-to-jpg" element={
            <ToolWrapper>
              <ToolLayout toolSlug="pdf-to-jpg"><PDFToJPG /></ToolLayout>
            </ToolWrapper>
          } />
          <Route path="/tools/jpg-to-pdf" element={
            <ToolWrapper>
              <ToolLayout toolSlug="jpg-to-pdf"><JPGToPDF /></ToolLayout>
            </ToolWrapper>
          } />
          <Route path="/tools/rotate-pdf" element={
            <ToolWrapper>
              <ToolLayout toolSlug="rotate-pdf"><RotatePDF /></ToolLayout>
            </ToolWrapper>
          } />
          <Route path="/tools/delete-pages" element={
            <ToolWrapper>
              <ToolLayout toolSlug="delete-pages"><DeletePages /></ToolLayout>
            </ToolWrapper>
          } />
          <Route path="/tools/reorder-pages" element={
            <ToolWrapper>
              <ToolLayout toolSlug="reorder-pages"><ReorderPages /></ToolLayout>
            </ToolWrapper>
          } />
          <Route path="/tools/watermark-pdf" element={
            <ToolWrapper>
              <ToolLayout toolSlug="watermark-pdf"><WatermarkPDF /></ToolLayout>
            </ToolWrapper>
          } />
          <Route path="/tools/add-text-signature" element={
            <ToolWrapper>
              <ToolLayout toolSlug="add-text-signature"><AddTextSignature /></ToolLayout>
            </ToolWrapper>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
