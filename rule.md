# Contributing to PDFly (Rules & Guidelines)

Thank you for your interest in contributing to PDFly! We welcome contributions from the community. To ensure a smooth collaboration, please follow the guidelines and rules outlined below.

## 🛠️ Prerequisites & Required Setup

Before contributing, make sure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Git**

## 📜 Code of Conduct

- Be respectful and constructive in your feedback and discussions.
- Do not submit code that compromises user privacy or security.
- Adhere to the existing code style and architecture.

## 🏗️ Architectural Guidelines

PDFly consists of two main components:
1. **Client (React + Vite + TailwindCSS)**
2. **Server (Node.js + Express + Socket.io + MongoDB)**

### Frontend Rules
- **Styling:** Use standard Tailwind CSS utility classes. Avoid writing custom CSS in `index.css` or `App.css` unless strictly necessary.
- **Components:** Create reusable, functional React components inside the `src/components/` directory. Keep components small and focused.
- **State Management:** Use standard React hooks (`useState`, `useEffect`, `useRef`).
- **Icons:** We use `lucide-react`. Do not introduce new icon libraries unless heavily justified.

### Backend Rules
- **Structure:** Keep routes in the `routes/` directory and business logic in the `controllers/` directory.
- **Real-Time features:** For real-time updates (like the Room file sharing), always use the existing `Socket.io` instance rather than polling the REST API.
- **Security:** Ensure any new endpoints validate inputs and handle errors gracefully using try/catch blocks. Do not expose sensitive room or participant data.

## 📝 Pull Request Process

1. **Fork the repository** and create your branch from `main`.
2. **Branch Naming:** Use descriptive branch names (e.g., `feature/add-dark-mode`, `fix/room-join-bug`).
3. **Commit Messages:** Write clear, concise commit messages. E.g., `Fix: Resolved issue where QR code did not render` or `Feat: Added new JPG to PDF conversion tool`.
4. **Testing:** Test your changes locally. Start both the client (`npm run dev`) and server (`node index.js`) and ensure your changes do not break existing functionality (especially file sharing).
5. **Review:** Open a Pull Request (PR) and describe what your changes do and why they are necessary.

## 🐛 Bug Reports & Feature Requests

If you find a bug or have a feature idea, please open an issue in the GitHub repository. Provide as much detail as possible:
- Steps to reproduce the bug.
- Browser and OS environment.
- Any relevant console logs or errors.

---
By contributing to PDFly, you agree that your contributions will be licensed under its MIT License.
