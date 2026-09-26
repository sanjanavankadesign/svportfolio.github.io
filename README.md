# Sanjana Vanka — UI/UX Product Design Portfolio

A clean, responsive, multi-page case study portfolio website built with HTML5, Tailwind CSS, and JavaScript. Optimized for instant zero-configuration hosting on **GitHub Pages**.

---

## 📁 Repository Structure

```
├── index.html                  # Main Portfolio Landing Page
├── case-studies/
│   ├── case-study-1.html       # Case Study 1 Page
│   ├── case-study-2.html       # Case Study 2 Page
│   └── template.html           # Reusable HTML template for future case studies
├── assets/
│   ├── css/
│   │   └── styles.css          # Custom styles & Lightbox modal styles
│   ├── js/
│   │   └── main.js            # Dark/light theme toggle, mobile menu, and Lightbox image viewer
│   └── images/                 # Image assets, UI wireframes, and screenshots
└── README.md                   # Setup and GitHub Pages hosting instructions
```

---

## 🚀 How to Host on GitHub Pages

Follow these simple steps to publish your portfolio site live on the web:

### Step 1: Create a GitHub Repository
1. Go to [GitHub.com](https://github.com/new) and log in to your account.
2. Click **New Repository**.
3. Name your repository (e.g. `portfolio` or `sanjanavanka.github.io`).
4. Set visibility to **Public**.
5. Do NOT initialize with a README (since this repository already has one).
6. Click **Create Repository**.

### Step 2: Upload Files to GitHub
You can upload files in two ways:

#### Option A: Direct Web Upload (No Git required)
1. On your newly created GitHub repository page, click **uploading an existing file**.
2. Drag and drop all files and folders (`index.html`, `case-studies/`, `assets/`, `README.md`) into the repository window.
3. Scroll down and click **Commit changes**.

#### Option B: GitHub Desktop or Git CLI
If you use GitHub Desktop or Git command line:
```bash
git init
git add .
git commit -m "Initial portfolio release"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. In your GitHub repository, go to **Settings** (top navigation tab).
2. On the left sidebar, click **Pages** (under Code and automation).
3. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Choose `main` and root directory `/ (root)`.
4. Click **Save**.
5. Wait 1–2 minutes! GitHub will generate your live website URL (e.g., `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`).

---

## 🎨 Adding New Case Studies
1. Duplicate `case-studies/template.html` and save it as `case-studies/your-new-project.html`.
2. Add your content, project visuals, and metrics.
3. Link the new case study card on `index.html`.
