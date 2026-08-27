# 🚀 Next.js Full-Stack Kanban Board

A modern, highly interactive Kanban Board application designed to help you organize tasks, manage projects, and visualize workflows. Built with a focus on performance and seamless drag-and-drop mechanics.

## ✨ Features

- **Secure Authentication**: Custom email and password login system powered by NextAuth.js and bcrypt encryption.
- **Drag & Drop Workflows**: Smooth and responsive drag-and-drop task management powered by `@dnd-kit`.
- **Dynamic Board Management**: Create multiple personalized Kanban boards (Normal or Project types).
- **Task Prioritization**: Add custom priority tags (LOW, MEDIUM, HIGH, URGENT) to visually organize tasks.
- **Database Persistence**: Real-time saving and state management using MongoDB & Prisma ORM.
- **Modern UI/UX**: Fully responsive and beautiful interface styled with Tailwind CSS, including custom avatars and priority badges.
- **Trash Zone**: Quickly delete tasks by dragging them into the interactive trash zone.

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, Server Actions)
- **Database:** MongoDB Atlas
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **Drag & Drop:** @dnd-kit
- **Icons:** Lucide React

## 🚀 Getting Started

### 1. Clone the repository
`git clone https://github.com/your-username/Kanban-Board.git`
`cd Kanban-Board/next-app`

### 2. Install Dependencies
`npm install`

### 3. Environment Variables
Create a `.env` file in the root of the `next-app` directory and add the following:
`DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/kanban"`
`NEXTAUTH_SECRET="your-super-secret-key-here"`

### 4. Setup Prisma & Database
`npx prisma db push`

### 5. Run the Development Server
`npm run dev`

Open http://localhost:3000 with your browser to see the app.

## 🚢 Deployment (Vercel)

1. Import the repository into your Vercel dashboard.
2. Set the **Root Directory** to `next-app`.
3. Add `DATABASE_URL` and `NEXTAUTH_SECRET` to the Environment Variables.
4. Hit **Deploy**!
