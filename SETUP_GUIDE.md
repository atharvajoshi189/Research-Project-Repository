# Project Setup Guide for Collaborators

Welcome to the Research Project Repository! Follow these steps to set up the project on your local machine.

## 1. Prerequisites
Make sure you have the following installed:
- **Node.js**: [Download here](https://nodejs.org/) (Recommended: LTS version)
- **Git**: [Download here](https://git-scm.com/)
- **VS Code**: [Download here](https://code.visualstudio.com/)

## 2. Clone the Repository
Open your terminal (Command Prompt, PowerShell, or Git Bash) and run:

```bash
git clone https://github.com/atharvajoshi189/Research-Project-Repository.git
cd Research-Project-Repository
```

## 3. Install Dependencies
Install the required project libraries by running:

```bash
npm install
```

## 4. Environment Keys (Important!)
This project uses Supabase and requires environment variables to work.
- Create a new file in the root folder named `.env.local`.
- Ask **Atharva** (the project owner) to send you the contents of this file.
- Paste the content into your `.env.local` file and save it.

It should look something like this (but with real keys):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. Run the Project
Start the development server:

```bash
npm run dev
```

Open your browser and go to [http://localhost:3000](http://localhost:3000) to see the app.

## Summary of Commands
```bash
git clone https://github.com/atharvajoshi189/Research-Project-Repository.git
cd Research-Project-Repository
npm install
# (Create .env.local file manually here)
npm run dev
```
