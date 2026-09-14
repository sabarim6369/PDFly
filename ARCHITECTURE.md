# PDFly: End-to-End Technical Architecture

This document provides a comprehensive technical overview of how PDFly works under the hood, detailing the role of each technology and the end-to-end data flow for core features.

---

## 1. Core Technology Stack

### Frontend (Client)
- **React.js:** The core UI library. Handles state management and component rendering.
- **Vite:** The build tool. Provides ultra-fast Hot Module Replacement (HMR) during development and optimized bundling for production.
- **Tailwind CSS:** Utility-first CSS framework used for all styling, enabling a responsive, modern UI without writing custom CSS files.
- **React Router DOM:** Manages client-side routing (e.g., navigating from `/` to `/rooms/:code`).
- **pdf-lib:** The powerhouse library for PDF manipulation. It allows the browser to read, modify, and write PDF documents directly in client-side memory without sending files to the server.
- **Socket.io-client:** Establishes a persistent WebSocket connection to the backend for real-time room communication and file streaming.

### Backend (Server)
- **Node.js:** JavaScript runtime environment.
- **Express.js:** Web framework used to set up API routes (e.g., creating a room) and serve middleware.
- **Socket.io:** Real-time engine. Handles broadcasting messages, managing room connections, and relaying file chunks between peers.
- **MongoDB & Mongoose:** NoSQL database used to persistently store room metadata (room name, code, participant lists) so rooms survive server restarts.

---

## 2. End-to-End Workflows

### A. PDF Manipulation (Client-Side Only)
*Tools involved: React, Tailwind, pdf-lib, FileReader API*

1. **User Action:** The user selects a tool (e.g., "Merge PDFs") and uploads two or more PDF files via an HTML `<input type="file">`.
2. **File Reading:** The browser uses the native `FileReader` API to read the selected files into an `ArrayBuffer` in memory. **No files are uploaded to the backend.**
3. **Processing (`pdf-lib`):**
   - The React component loads the `ArrayBuffer` into `pdf-lib`'s `PDFDocument` object.
   - For a merge operation, it creates a *new* empty `PDFDocument`, iterates over the uploaded documents, copies their pages, and appends them to the new document.
4. **Export & Download:**
   - `pdf-lib` serializes the new document back into a binary `Uint8Array`.
   - A `Blob` is created from this array, and `URL.createObjectURL()` generates a temporary, hidden download link.
   - The app programmatically clicks this link, triggering a secure download directly to the user's local machine.

### B. Room Creation & Joining (Client + Server + Database)
*Tools involved: React, Axios, Express, MongoDB*

1. **Host Creates Room:** 
   - User enters a room name and clicks "Create".
   - React sends a `POST /api/rooms` request via Axios.
   - Express receives the request, generates a unique 6-character room code, and saves a new `Room` document in MongoDB.
   - The backend responds with the room code. The frontend saves this room code in `localStorage` (so the user is remembered as the Host) and navigates to `/rooms/:code`.
2. **Participant Joins Room:**
   - Participant navigates to `/rooms/:code` (often via QR code or shared link).
   - React sends a `GET /api/rooms/:code` request to verify the room exists.
   - The participant's device info (Browser/OS) is generated to identify them.

### C. Real-Time File Sharing (Client + Socket.io + Server Relay)
*Tools involved: Socket.io, FileReader, Blob API*

This is the most complex data flow, designed to bypass firewall restrictions by relaying traffic through the server instead of requiring complex STUN/TURN WebRTC setups.

1. **Socket Handshake:** Both Host and Participant open the room page. The React `useEffect` hook initializes a Socket.io connection and emits a `join_room` event with the room code. The Node.js server places both sockets into the same Socket.io room channel.
2. **Host Selects File:** The Host selects a PDF to share. The UI changes to a progress bar state.
3. **Initialization Emission:** Host emits `file_share_start`, passing metadata (filename, size, total chunks) to the server. The server broadcasts this to the participants, and the participants' UI updates to "Receiving...".
4. **Chunking & Streaming:**
   - The Host uses `FileReader` to read the PDF file in small **64KB chunks** sequentially.
   - Each chunk is emitted over the socket as an `ArrayBuffer` (`file_chunk` event).
   - The server instantly broadcasts each chunk to the room.
   - The Host reads the next chunk only after the previous one is processed.
5. **Reassembly (Participant side):**
   - Participants receive `file_chunk` events and push the binary chunks into a React `useRef` array.
   - Their progress bar updates based on `chunks_received / total_chunks`.
6. **Completion:**
   - Host finishes reading the file and emits `file_share_complete`.
   - Participants receive this event, combine all chunks in the array into a single native `Blob` (of type `application/pdf`).
   - A `URL.createObjectURL()` is generated for the Blob, and it is added to a list of shared files in the UI, allowing the user to click "Download".
