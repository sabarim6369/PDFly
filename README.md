# PDFly

PDFly is a comprehensive, open-source web application designed for all your PDF manipulation and sharing needs. It features a modern, responsive UI built with React and Vite, backed by a robust Node.js server for real-time file sharing and room management.

## 🌟 Features

### 🛠️ PDF Tools
Perform all essential PDF tasks directly in your browser securely and quickly:
- **Merge PDF:** Combine multiple PDFs into one.
- **Split PDF:** Extract pages from a PDF.
- **Compress PDF:** Reduce the file size of your PDFs.
- **JPG to PDF:** Convert images to PDF documents.
- **Rotate PDF:** Rotate pages to the correct orientation.
- **Delete Pages:** Remove unwanted pages from a document.
- **Reorder Pages:** Easily drag-and-drop pages to reorder them.
- **Watermark PDF:** Add custom text watermarks to your documents.
- **Add Text Signature:** Sign your PDFs digitally.

### 🔒 Secure & Private File Sharing (Rooms)
PDFly features a secure, real-time file-sharing mechanism built with Socket.io.
- **Private Rooms:** Create isolated rooms with unique 6-character codes.
- **Host Controls:** The room creator has exclusive ability to share files directly from their device.
- **Real-Time Transfers:** Participants receive shared files instantly via chunked socket streaming.
- **Mobile Friendly:** Generate QR codes or shareable links to let others join instantly.

### 📱 Progressive Web App (PWA)
PDFly is built as a Progressive Web App, offering a native-like experience.
- **Installable:** Add PDFly directly to your desktop or mobile home screen.
- **Fast & Reliable:** Service workers ensure lightning-fast load times and allow you to use core PDF tools even when offline.

## 🚀 Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- lucide-react (Icons)
- PDF manipulation libraries (`pdf-lib`, `pdfjs-dist`)
- Socket.io-client
- vite-plugin-pwa (Progressive Web App support)

**Backend:**
- Node.js & Express
- Socket.io (Real-time file relay and presence)
- MongoDB / Mongoose (Room and participant state management)

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sabarim6369/PDFly.git
   cd PDFly
   ```

2. **Setup the Backend:**
   ```bash
   cd server
   npm install
   # Create a .env file with your MONGO_URI and PORT
   node index.js
   ```

3. **Setup the Frontend:**
   ```bash
   cd ../client
   npm install
   # Create a .env file with VITE_API_URL (pointing to your server)
   npm run dev
   ```

4. Open your browser and navigate to the frontend URL (usually `http://localhost:5173`).

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>Engineered by Sabari M</b>
</p>
