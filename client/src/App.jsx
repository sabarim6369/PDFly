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
import JPGToPDF from './pages/tools/JPGToPDF'
import RotatePDF from './pages/tools/RotatePDF'
import DeletePages from './pages/tools/DeletePages'
import ReorderPages from './pages/tools/ReorderPages'
import WatermarkPDF from './pages/tools/WatermarkPDF'
import AddTextSignature from './pages/tools/AddTextSignature'
import RoomsList from './pages/rooms/RoomsList'
import CreateRoom from './pages/rooms/CreateRoom'
import RoomView from './pages/rooms/RoomView'

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
          
          <Route path="/rooms" element={
            <ToolWrapper>
              <RoomsList />
            </ToolWrapper>
          } />
          
          <Route path="/rooms/create" element={
            <ToolWrapper>
              <CreateRoom />
            </ToolWrapper>
          } />
          
          <Route path="/rooms/:code" element={
            <ToolWrapper>
              <RoomView />
            </ToolWrapper>
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
        <a 
          href="https://github.com/sabarim6369" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="fixed bottom-4 right-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:shadow-xl transition-all z-50 flex items-center gap-2"
        >
          Engineered by Sabari M
        </a>
      </div>
    </Router>
  )
}

export default App
