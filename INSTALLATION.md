
# 🌌 MyNova — Installation Guide (Beta Version)

This installation guide is intended for beta users who are comfortable using **Git**, **Terminal**, and **VS Code**.

> **Note:** A simpler installation method will be provided in the public release.

If you want a more comfortable reading experience, you can:
👉 Open [Markdown Live Preview](https://markdownlivepreview.com/) then copy & paste this entire file there.

---

## 🧩 Requirements (Install First)

Before starting, make sure you have these installed on your computer:

* **Git**
* **VS Code**
* **Node.js**

## 🔐 Accounts You Need (Free)

You will need to create these accounts:

* **GitHub**
* **Vercel** (Login using GitHub)
* **Clerk** (Authentication)
* **Neon DB** (Database)

---

## 📁 Step 1 — Extract the Project

1.  Extract the `mynova.zip` file to any folder you want. You will get the **MyNova** project folder.
2.  Open **VS Code**.
3.  Click **File** → **Open Folder**, then select the **MyNova** project folder.

## ⚠️ IMPORTANT — For First-Time VS Code Users

If this is your **first time using VS Code**, please read carefully.

### ✅ You MUST save files manually
Every time you edit a file:
- Press **Ctrl + S** to save

Unsaved files may look correct but are NOT actually applied.

### ✅ Strongly recommended: Enable Auto Save
This will prevent errors in future steps and updates.

In VS Code:
- Click **File**
- Make sure **Auto Save** is ✅ enabled

⚠️ If `.env` is not saved:
- Environment variables will be EMPTY
- Prisma may fail to connect
- Errors like `DATABASE_URL is empty` may appear

👉 Once Auto Save is enabled, you can safely continue.


## 🔧 Step 2 — Setup Environment Variables

1.  In the project folder, find the file `.env.example`.
2.  Open it, then copy all of its contents.
3.  Create a new file named `.env`.
4.  Paste everything from `.env.example` into `.env`.

⚠️ Reminder  
After editing `.env`, make sure the file is saved (`Ctrl + S`).
(You can ignore this if Auto Save is already enabled.)


## 🔑 Step 3 — Create Clerk Account & App

1.  Go to [Clerk.com](https://clerk.com/) and create an account.
2.  After login, you will be redirected to **Create Application**.
3.  Set the following:
    * **App Name:** anything you want.
    * **Authentication methods:**
        * ❌ Disable Email
        * ✅ Enable Google only
4.  Create the application.
5.  You will be redirected to the **API Keys** page.
6.  Scroll down until you see the `.env` section provided by Clerk.

7.  Copy:
    * `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
    * `CLERK_SECRET_KEY`
8.  Open `.env` in VS Code and paste them into:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
CLERK_SECRET_KEY=your_key_here

```

⚠️ Reminder  
Save the `.env` file after pasting the keys.
(`Ctrl + S` if Auto Save is not enabled.)


## 🗄 Step 4 — Create Neon Database

1. Go to [Neon.tech](https://neon.tech/) and create an account.
2. Create a new project.
3. Set the project name (anything you want).
4. Leave all other settings as default, then click **Create Project**.
5. Once inside the Neon dashboard:
* Click **Connect** (top right).
* Change dropdown from `psql` to **Connection String**.
* Click **Copy Snippet**.


6. Open `.env` in VS Code and paste it here:

```env
DATABASE_URL="PASTE_HERE"

```

🚨 IMPORTANT REMINDER

After pasting `DATABASE_URL`:
- Save the file (`Ctrl + S`)
- Do NOT run Prisma commands before saving

Unsaved `.env` will cause Prisma connection errors.


## 🧠 Step 5 — Create GitHub Repository

1. Go to [GitHub](https://github.com/).
2. Click the **+** icon (top right) → **New Repository**.
3. Fill in:
* **Repository name:** `mynova` (or anything you want).
* **Visibility:** Private (recommended).


4. Click **Create Repository**.
5. After creation, GitHub will show you a setup page.
6. 📌 **Copy this part only:**

```text
[https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git)

```

## 💻 Step 6 — Push Project via CLI

1. Open your project folder in VS Code.
2. Right click → **Open in Terminal**.

**First-time Git setup (run only if you haven't used Git before):**

```bash
git config --global user.name "Your Name"
git config --global user.email "youremail@gmail.com"

```

> ⚠️ **Note:** Use the same email as your GitHub account.

> ⚠️ **IMPORTANT** — Run these commands BEFORE pushing to GitHub:
> (This will initialize the database schema in Neon)

⚠️ Before running Prisma commands

Make sure:
- `.env` file is saved
- `DATABASE_URL` is not empty

If Auto Save is enabled, you can ignore this reminder.


```bash
npm install
npx prisma db push
npx prisma generate
```

**Push project to GitHub:**

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin [https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git)
git push -u origin main

```

*If GitHub asks you to log in, just follow the instructions.*

## 🚀 Step 7 — Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com/).
2. Sign up using **Continue with GitHub**.
3. In the dashboard:
* Click **Add New** → **Project**.
* Click **Import** on your `MyNova` repository.



## 🌱 Step 8 — Environment Variables on Vercel

> ⚠️ **Important:** Do this **BEFORE** clicking Deploy.

1. Open the **Environment Variables** section within the Vercel import page.
2. Open your `.env` file in VS Code.
3. Press `Ctrl + A` → Copy all.
4. Paste everything into the Vercel Environment Variables field.
5. **Make sure:**

```env
CLERK_ADMIN_ID=""

```

> ➡️ Leave `CLERK_ADMIN_ID` empty for now.

6. Click **Deploy**.

## 🔐 Step 9 — First Login (Very Important)

1. Open your deployed MyNova website (Vercel will provide the link).
2. **Log in** using the account you will use permanently.
* *This creates your user record in both Clerk and Neon.*



## 🔒 Step 10 — Lock MyNova (Admin Only)

1.  Go to **Clerk Dashboard**.
2.  Click **Users**.
3.  Click your user profile.
4.  Copy the **User ID**.
5.  **Update Vercel:**
    * Go to Vercel → Project → **Settings**.
    * Open **Environment Variables**.
    * ⚠️ **Note:** The `CLERK_ADMIN_ID` variable might have disappeared because it was empty.
    * Click **Add Environment Variable**.
    * **Key:** `CLERK_ADMIN_ID`
    * **Value:** (Paste your Clerk User ID here).
    * Click **Save**.
6.  **Redeploy:**
    * Go to **Deployments**.
    * Click **⋮** → **Redeploy**.



---

# ✅ Done

* ✔ Only you can log in.
* 🔐 App is fully locked.
* 🌌 MyNova is now yours.

### 💬 Beta Note

This beta version prioritizes stability and feedback over ease of installation. A beginner-friendly installation will be provided in the public release.