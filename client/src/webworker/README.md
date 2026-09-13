# PDFly Web Worker Architecture

This directory contains the background Web Worker implementation for PDFly.

## Overview
PDFly performs heavy computational tasks (like compressing, merging, and image embedding) directly in the browser. When these tasks run on the main JavaScript thread, they can freeze the UI and prevent animations from rendering smoothly. 

To solve this, we use **Web Workers** to offload these heavy PDF operations into background threads.

## Architecture

Our Web Worker architecture consists of two main pieces:

### 1. `workerClient.js`
This file runs on the **main UI thread**. 
It acts as a bridge between the React components (like the tools pages) and the background worker. 
- It initializes the worker using Vite's `?worker` syntax.
- It provides a simple Promise-based function (`runPDFWorker()`) for React components to call.
- It handles transferring memory (`ArrayBuffer`s) back and forth efficiently without unnecessarily duplicating data in memory.
- It parses progress updates sent from the worker and invokes an `onProgress` callback to update the UI (loading bars).

### 2. `pdf.worker.js`
This file runs in an isolated **background thread**.
It cannot access the DOM or any UI elements.
- It listens for incoming task payloads (e.g., `COMPRESS`, `MERGE`, `JPG_TO_PDF`).
- It uses `pdf-lib` to execute the heavy document processing logic.
- It continuously posts progress updates back to `workerClient.js`.
- Once finished, it sends the final processed PDF bytes back to the main thread and terminates.

## How to add a new worker task

1. Add your new operation logic as a function inside `pdf.worker.js`.
2. Add a new `case` to the `switch` statement inside the `self.onmessage` handler in `pdf.worker.js` to parse incoming payloads and trigger your function.
3. In your main React component or tool library (e.g., `src/lib/pdf/myTool.js`), call `runPDFWorker('YOUR_TASK_NAME', payload, onProgress)`. Ensure you pass any raw file data as an `ArrayBuffer` in the payload.