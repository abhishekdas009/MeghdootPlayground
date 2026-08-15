<div align="center">

<!-- Logo Placeholder (Can be replaced with actual logo) -->
<img src="https://via.placeholder.com/150/000000/FFFFFF/?text=☁️+Meghdoot" alt="Meghdoot Logo" width="150" height="150" style="border-radius: 20px;" />

# ☁️ Meghdoot 

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=3B82F6&center=true&vCenter=true&width=600&lines=Intelligent+SOQL+Template+Engine;Excel+Automation+Platform;Streamline+your+Workflows;Cloud+Messenger)](https://git.io/typing-svg)

**Intelligent SOQL Template Engine & Excel Automation Platform**

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

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 About The Project

**Meghdoot** (Sanskrit for "Cloud Messenger") is a cutting-edge platform designed to bridge the gap between complex Salesforce Object Query Language (SOQL) operations and intuitive Excel-based reporting. It serves as an intelligent template engine and automation suite that significantly reduces the manual effort required for data extraction and formatting.

<div align="center">
  <!-- Placeholder for a demo animation GIF -->
  <img src="https://via.placeholder.com/800x400/1E1E1E/FFFFFF/?text=Demo+Animation+GIF+Goes+Here" alt="Meghdoot Demo" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/>
  <p><i>Dashboard & SOQL Editor Preview</i></p>
</div>

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 🧠 **Intelligent SOQL Engine** | Advanced parser and executor for SOQL with dynamic template variable injection. |
| 📊 **Excel Automation** | One-click export of complex relational data into beautifully formatted Excel reports. |
| ⚡ **Real-time Editor** | Integrated Monaco Editor for code-editing experience with syntax highlighting. |
| 🎨 **Modern UI/UX** | Built with Tailwind CSS and Radix UI for a highly responsive, accessible interface. |
| 🔐 **Secure & Scalable** | FastAPI backend with Postgres ensures high performance and data integrity. |

---

## 🏗 Architecture

```mermaid
graph TD;
    Client([💻 Web Client / Next.js])
    Backend([⚙️ FastAPI Backend])
    DB[(🗄️ PostgreSQL)]
    Prisma([ORM / Prisma])
    SF([☁️ Salesforce API])

    Client <-->|REST API / JSON| Backend
    Backend <-->|SQL| Prisma
    Prisma <--> DB
    Backend <-->|SOQL Queries| SF
```

---

## 💻 Tech Stack

### Frontend
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS, Radix UI Primitives, Framer Motion (Animations)
- **State Management:** Zustand, React Query
- **Editor:** Monaco Editor
- **Charts:** Recharts

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL
- **ORM:** Prisma (using `@prisma/adapter-pg`)
- **Server:** Uvicorn

---

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL (v14+)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/meghdoot.git
   cd meghdoot
   ```

2. **Setup Frontend**
   ```bash
   # Install dependencies
   npm install
   
   # Generate Prisma Client
   npm run prisma:generate
   ```

3. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Environment Variables**
   Create a `.env` file in the root directory based on `.env.example`.
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/meghdoot"
   ```

5. **Run the Application**
   ```bash
   # Terminal 1: Run Frontend
   npm run dev
   
   # Terminal 2: Run Backend
   npm run backend:dev
   ```

---

## 💡 Usage

1. **Create Templates**: Navigate to the Template Builder to design your SOQL queries.
2. **Bind Variables**: Use the interactive UI to bind dynamic variables to your SOQL clauses.
3. **Execute & Export**: Run the queries against your connected Salesforce environment and export the results directly to customized Excel sheets.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <p>Built with ❤️ by the Meghdoot Team</p>
</div>
