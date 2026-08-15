<div align="center">

<!-- Animated Header Image / Banner (SVG animation) -->
<a href="https://github.com/AbhishekDas">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=250&section=header&text=☁️%20Meghdoot&fontSize=70&fontAlignY=35&animation=twinkling" width="100%" alt="Meghdoot Header" />
</a>

<br/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=24&pause=1000&color=00F0FF&center=true&vCenter=true&width=800&lines=Intelligent+SOQL+Template+Engine...;Advanced+Excel+Automation+Platform...;Streamlining+Data+Workflows...;Sanskrit+for+"Cloud+Messenger"...)](https://git.io/typing-svg)

<br/>

**The Ultimate Solution for Salesforce SOQL Operations & Excel Reporting Automation**

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[Explore Docs](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Deep Dive: Core Components](#-deep-dive-core-components)
  - [Frontend Ecosystem](#1-frontend-ecosystem-nextjs)
  - [Backend Ecosystem](#2-backend-ecosystem-fastapi)
  - [Database & ORM](#3-database--orm)
- [Architecture Flow](#-architecture-flow)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Future Roadmap](#-future-roadmap)
- [Author](#-author)

---

## 🚀 Overview

**Meghdoot** is an enterprise-grade web application engineered to solve complex Salesforce data extraction and reporting challenges. By combining a highly responsive frontend with a blazing-fast Python backend, Meghdoot allows users to:
1. Write dynamic **SOQL queries** with template variables.
2. Bind these variables visually.
3. Automatically execute and map the results into **complex Excel files** with one click.

<div align="center">
  <img src="https://raw.githubusercontent.com/abhisheknaiidu/abhisheknaiidu/master/code.gif" width="70%" alt="Coding Animation" style="border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.2);"/>
  <br/>
  <i>(Real-time SOQL parsing & dynamic variable mapping in action)</i>
</div>

---

## 🧩 Deep Dive: Core Components

Here is a detailed breakdown of how each component within Meghdoot is orchestrated to deliver a seamless experience.

### 1. Frontend Ecosystem (Next.js)
The client-side application is designed for absolute performance and developer experience.
* ⚛️ **Next.js 15+ (App Router):** Utilizes server-side rendering (SSR) and optimized routing for lightning-fast page loads.
* 🎨 **Tailwind CSS & Radix UI:** A meticulously crafted, accessible, and highly customizable UI component system. Unstyled Radix primitives provide the accessibility layer (Dialogs, Dropdowns, Tooltips), while Tailwind handles the visual polish.
* 🧠 **Zustand & React Query:** 
  * `Zustand` manages global UI state (like active editor themes and user preferences) without boilerplate.
  * `React Query (@tanstack/react-query)` handles robust server-state management, caching, and background data fetching for API endpoints.
* 📝 **Monaco Editor:** Integrates the VS Code engine directly into the browser, providing syntax highlighting, autocomplete, and a premium code-editing feel for SOQL templates.
* 📈 **Recharts:** Renders dynamic, responsive data visualizations and dashboards directly in the browser.

### 2. Backend Ecosystem (FastAPI)
The backend is a high-performance RESTful API built to handle heavy data processing.
* 🐍 **FastAPI:** Built on Starlette and Pydantic, it provides automatic interactive API documentation (Swagger UI/ReDoc) and incredible async performance.
* ⚙️ **Uvicorn:** A lightning-fast ASGI server implementation used to run the FastAPI application.
* 🛠️ **SOQL Engine:** A custom-built parser that processes template tags within SOQL strings, safely injects user-bound variables, and validates queries before hitting the Salesforce API.
* 📊 **Excel Automation Layer:** Processes raw relational JSON data from Salesforce and maps it dynamically into highly formatted `.xlsx` files using specialized Python libraries.

### 3. Database & ORM
Data persistence is handled with safety and scalability in mind.
* 🐘 **PostgreSQL:** The world's most advanced open-source relational database, ensuring ACID compliance and robust relational data storage.
* ⬡ **Prisma ORM (`@prisma/client` & `@prisma/adapter-pg`):** Provides type-safe database access. It auto-generates TypeScript types based on the schema, ensuring that database queries in Next.js API routes (or backend syncs) are strictly typed and error-free.

---

## 🏗 Architecture Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (Next.js)
    participant B as Backend (FastAPI)
    participant DB as PostgreSQL
    participant SF as Salesforce API

    U->>F: Writes Template SOQL in Monaco Editor
    F->>B: POST /api/v1/templates (Save Template)
    B->>DB: Prisma Client inserts Template Record
    DB-->>B: Success
    B-->>F: Template Saved

    U->>F: Bind Variables & Click "Export to Excel"
    F->>B: POST /api/v1/execute (With bound variables)
    B->>B: Parse Template & Inject Variables
    B->>SF: Execute Final SOQL Query
    SF-->>B: Returns JSON Data
    B->>B: Process JSON into Formatted Excel buffer
    B-->>F: Returns .xlsx File Stream
    F-->>U: Triggers File Download
```

---

## 🗂️ Project Structure

```text
MeghdootPlayground/
├── backend/                   # FastAPI Python Server
│   ├── app/                   # Core application logic
│   │   ├── api/               # REST API Routes
│   │   ├── core/              # Config, Database setup, Security
│   │   └── main.py            # FastAPI Entry Point
│   └── requirements.txt       # Python dependencies
├── frontend/                  # Next.js React Client
│   ├── app/                   # Next.js App Router (Pages & Layouts)
│   ├── components/            # Reusable UI components (Radix + Tailwind)
│   ├── lib/                   # Utility functions & helpers
│   ├── prisma/                # Database schema & migrations
│   ├── public/                # Static assets
│   ├── store/                 # Zustand state management
│   ├── package.json           # Node dependencies
│   └── tailwind.config.ts     # Tailwind design system tokens
└── README.md                  # Project Documentation
```

---

## 🏁 Getting Started

Follow these precise steps to spin up the entire Meghdoot stack locally.

### 1. Prerequisites
Ensure your development environment meets these requirements:
* **Node.js** v18.0.0 or higher
* **Python** v3.10 or higher
* **PostgreSQL** v14+ running locally or in Docker

### 2. Repository Setup
```bash
git clone https://github.com/AbhishekDas/meghdoot.git
cd meghdoot
```

### 3. Frontend Initialization
```bash
# Install Node modules
npm install

# Setup Prisma and push schema to database
npm run prisma:generate
npx prisma db push
```

### 4. Backend Initialization
```bash
cd backend

# Create & activate a virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install Python requirements
pip install -r requirements.txt
```

### 5. Launch Development Servers
You will need two terminal windows to run both services simultaneously:

**Terminal 1 (Root Directory):**
```bash
# Starts Next.js on http://localhost:3000
npm run dev
```

**Terminal 2 (Root Directory):**
```bash
# Starts FastAPI on http://localhost:8000
npm run backend:dev
```

---

## 🌟 Future Roadmap

- [ ] **AI-Powered Query Suggestions:** Integrate LLMs to help users write SOQL faster.
- [ ] **Automated Email Reports:** Schedule and dispatch Excel reports directly to stakeholders.
- [ ] **Multi-Tenant Support:** Allow distinct organizations to have isolated workspaces.

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer" width="100%" alt="Footer" />
  
  <h3>Built with ❤️ and ☕ by <b>Abhishek Das</b></h3>
  <p>
    <a href="https://github.com/AbhishekDas">
      <img src="https://img.shields.io/github/followers/AbhishekDas?label=Follow&style=social" alt="GitHub" />
    </a>
  </p>
</div>
