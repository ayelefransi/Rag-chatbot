# Gemini RAG Chatbot

<img width="2816" height="1536" alt="Gemini_Generated_Image_y7vhuwy7vhuwy7vh" src="https://github.com/user-attachments/assets/8e5d31bd-7a65-437d-bc5b-f5046467f36c" />

A powerful, client-side Retrieval-Augmented Generation (RAG) chatbot built with React and the Google Gemini API. This application allows users to upload documents (PDF, TXT, MD, etc.), creates a context-aware knowledge base, and answers questions based *specifically* on those documents using Gemini's massive context window.

##  Features

*   **Document Ingestion:** Upload and parse PDF, text, markdown, CSV, and code files.
*   **Client-Side RAG:** No complex backend vector database required. Uses Gemini's long context window to process documents on the fly.
*   **Multi-Language Support:** Fully localized interface and responses for **English** and **Amharic**.
*   **Modern UI:** Responsive design with animations, glassmorphism effects, and mobile drawer navigation.
*   **Secure:** API Keys are loaded via environment variables
*   **Smart Token Management:** Automatically estimates token usage and truncates content to prevent API quota errors (handling `429` and `400` errors gracefully).

##  Tech Stack

*   **Frontend:** React 18, TypeScript, Vite (implied toolchain)
*   **Styling:** Tailwind CSS
*   **Animations:** Framer Motion
*   **AI Integration:** Google GenAI SDK (`@google/genai`)
*   **PDF Processing:** PDF.js (`pdfjs-dist`)
*   **Icons:** Lucide React

##  Prerequisites

1.  **Node.js**: v16 or higher.

##  Installation & Setup

1.  **Clone the repository** (or download source):
    ```bash
    git clone <repository-url>
    cd gemini-rag-chatbot
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    *   Create a file named `.env` in the root directory.
    *   Add your Gemini API Key:
        ```env
        API_KEY=your_actual_api_key_here
        ```
    *   *Note: In some bundlers (like Vite), you might need to prefix this as `VITE_API_KEY`, but the current code uses `process.env.API_KEY`.*

4.  **Run the application**:
    ```bash
    npm start
    # or
    npm run dev
    ```

5.  **Open in Browser**:
    Navigate to `http://localhost:3000` (or the port shown in your terminal).

## 📖 Usage Guide

1.  **Upload Documents**:
    *   Click the **Upload Documents** button in the sidebar.
    *   Select `.pdf`, `.txt`, `.md`, or code files.
    *   Watch the "Total Context" meter to ensure you stay within the 240k token safety limit.

2.  **Select Language**:
    *   Use the toggle in the sidebar to switch between **English** and **Amharic** (አማርኛ).
    *   The AI instructions will update automatically to respond in your chosen language.

3.  **Chat**:
    *   Type your question in the input box.
    *   The bot will analyze the uploaded documents and provide a sourced answer.
    *   Citations (e.g., "3 sources") will appear below the response.

##  Troubleshooting

*   **Error 429 (Quota Exceeded):**
    *   The app has a safety limit of ~240,000 tokens per request to fit within the Gemini Flash free tier.
    *   If you see this error, wait ~30 seconds and try again.

*   **PDF Content Unreadable:**
    *   Ensure the PDF is text-based (selectable text), not just scanned images.
    *   The app uses `pdfjs-dist` to extract text layers.

*   **API Key Missing:**
    *   Ensure your `.env` file exists and the key is correct.
    *   Restart your development server after creating the `.env` file.

## 📄 License

This project is open-source and available under the MIT License.


A powerful, client-side Retrieval-Augmented Generation (RAG) chatbot built with React and the Google Gemini API. This application allows users to upload documents (PDF, TXT, MD, etc.), creates a context-aware knowledge base, and answers questions based *specifically* on those documents using Gemini's massive context window.

##  Features

*   **Document Ingestion:** Upload and parse PDF, text, markdown, CSV, and code files.
*   **Client-Side RAG:** No complex backend vector database required. Uses Gemini's long context window to process documents on the fly.
*   **Multi-Language Support:** Fully localized interface and responses for **English** and **Amharic**.
*   **Modern UI:** Responsive design with animations, glassmorphism effects, and mobile drawer navigation.
*   **Secure:** API Keys are loaded via environment variables
*   **Smart Token Management:** Automatically estimates token usage and truncates content to prevent API quota errors (handling `429` and `400` errors gracefully).

##  Tech Stack

*   **Frontend:** React 18, TypeScript, Vite (implied toolchain)
*   **Styling:** Tailwind CSS
*   **Animations:** Framer Motion
*   **AI Integration:** Google GenAI SDK (`@google/genai`)
*   **PDF Processing:** PDF.js (`pdfjs-dist`)
*   **Icons:** Lucide React

##  Prerequisites

1.  **Node.js**: v16 or higher.

##  Installation & Setup

1.  **Clone the repository** (or download source):
    ```bash
    git clone <repository-url>
    cd gemini-rag-chatbot
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    *   Create a file named `.env` in the root directory.
    *   Add your Gemini API Key:
        ```env
        API_KEY=your_actual_api_key_here
        ```
    *   *Note: In some bundlers (like Vite), you might need to prefix this as `VITE_API_KEY`, but the current code uses `process.env.API_KEY`.*

4.  **Run the application**:
    ```bash
    npm start
    # or
    npm run dev
    ```

5.  **Open in Browser**:
    Navigate to `http://localhost:3000` (or the port shown in your terminal).

## 📖 Usage Guide

1.  **Upload Documents**:
    *   Click the **Upload Documents** button in the sidebar.
    *   Select `.pdf`, `.txt`, `.md`, or code files.
    *   Watch the "Total Context" meter to ensure you stay within the 240k token safety limit.

2.  **Select Language**:
    *   Use the toggle in the sidebar to switch between **English** and **Amharic** (አማርኛ).
    *   The AI instructions will update automatically to respond in your chosen language.

3.  **Chat**:
    *   Type your question in the input box.
    *   The bot will analyze the uploaded documents and provide a sourced answer.
    *   Citations (e.g., "3 sources") will appear below the response.

##  Troubleshooting

*   **Error 429 (Quota Exceeded):**
    *   The app has a safety limit of ~240,000 tokens per request to fit within the Gemini Flash free tier.
    *   If you see this error, wait ~30 seconds and try again.

*   **PDF Content Unreadable:**
    *   Ensure the PDF is text-based (selectable text), not just scanned images.
    *   The app uses `pdfjs-dist` to extract text layers.

*   **API Key Missing:**
    *   Ensure your `.env` file exists and the key is correct.
    *   Restart your development server after creating the `.env` file.

## 📄 License

This project is open-source and available under the MIT License.

