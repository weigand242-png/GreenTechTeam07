# Plug & Earn — V2G Dashboard

A web dashboard that helps electric-vehicle fleet operators decide when to **charge**,
**hold**, or **sell power back to the grid**, based on live German electricity prices,
grid load, and weather. Built for the LAUNCH Build Days GreenTech hackathon (Team 07).

This guide walks you through running the app on your own computer. **No programming
knowledge is required** — just follow the steps for your operating system.

---

## What you need to install

The app runs with one free tool: **Node.js**. It comes bundled with `npm`, the command
used to set up and start the app. You only have to install this once.

> **Which version?** Install **Node.js 20.9 or newer** — always pick the version
> labelled **"LTS"** (Long-Term Support). That is the safe, recommended choice.

### Windows

1. Go to **https://nodejs.org**.
2. Click the big button that says **"LTS"** to download the Windows installer
   (a `.msi` file).
3. Open the downloaded file and click **Next** through the installer, accepting the
   default options. (Leave every checkbox as it is.)
4. When it finishes, click **Finish**.

### macOS

1. Go to **https://nodejs.org**.
2. Click the big button that says **"LTS"** to download the macOS installer
   (a `.pkg` file).
3. Open the downloaded file and click **Continue / Install** through the installer,
   accepting the default options. You may be asked for your Mac password.
4. When it finishes, click **Close**.

### Check it worked (both systems)

Open a terminal:

- **Windows:** press the **Start** button, type `PowerShell`, and open **Windows
  PowerShell**.
- **macOS:** press **Cmd + Space**, type `Terminal`, and press **Enter**.

Type the following and press **Enter**:

```bash
node -v
```

You should see a version number like `v20.11.0` or higher. If you do, you're ready.

---

## Getting the app onto your computer

If you received this project as a **ZIP file**, unzip it first:

- **Windows:** right-click the ZIP → **Extract All…** → **Extract**.
- **macOS:** double-click the ZIP to unzip it.

Remember where you put the folder (for example, your **Desktop** or **Downloads**).

If you instead downloaded it with Git, the project folder is already on your computer.

---

## Running the app

You will type a few commands into the terminal. The first command moves into the project
folder; the others set up and start the app.

### Step 1 — Open the project folder in the terminal

In the same terminal window from before, type `cd ` (the letters **c** and **d**,
followed by a **space**), then **drag the `launch-v2g` folder from your file explorer
onto the terminal window** and press **Enter**. This fills in the folder path for you.

The folder you want is the one that contains this `README.md` file and a file called
`package.json`.

> Tip — if dragging doesn't work, type the path manually, for example:
> - **Windows:** `cd C:\Users\YourName\Desktop\GreenTechTeam07\launch-v2g`
> - **macOS:** `cd ~/Desktop/GreenTechTeam07/launch-v2g`

### Step 2 — Install the app's components

Run this command **once**. It downloads everything the app needs to run. This can take a
few minutes the first time — that's normal.

```bash
npm ci
```

Wait until you see the terminal prompt return (the cursor stops moving and you can type
again).

### Step 3 — Start the app

```bash
npm run dev
```

After a moment you'll see a message like:

```
✓ Ready on http://localhost:3000
```

### Step 4 — Open it in your browser

Open your web browser (Chrome, Edge, Safari, Firefox…) and go to:

**http://localhost:3000**

The dashboard should appear. 🎉

### Stopping the app

Go back to the terminal and press **Ctrl + C** (on macOS too — it's `Ctrl`, not `Cmd`).
To start it again later, just repeat **Step 1** and **Step 3** (you don't need to run
`npm ci` again unless the project files change).

---

## Optional: live data instead of sample data

Out of the box the dashboard uses **built-in sample data**, so it works with no extra
setup or internet access. If you'd like it to pull **live** German grid prices and
weather instead, you can switch it on:

1. In the `launch-v2g` folder, make a copy of the file `.env.example` and rename the
   copy to `.env.local`.
2. Open `.env.local` in any text editor (Notepad on Windows, TextEdit on macOS).
3. Change the line `LIVE_TIMESERIES=0` to `LIVE_TIMESERIES=1` and save.
4. Restart the app (stop it with **Ctrl + C**, then run `npm run dev` again).

No accounts or API keys are needed — the live data sources are public.

---

## Troubleshooting

| Problem | What to do |
| --- | --- |
| `node` or `npm` is "not recognized" / "command not found" | Node.js isn't installed correctly, or the terminal was open before you installed it. **Close and reopen the terminal**, then try `node -v` again. |
| `npm ci` fails with errors | Make sure you're in the right folder (it must contain `package.json`). Check your internet connection and try again. |
| "Port 3000 is already in use" | The app is probably already running in another window, or another program is using that address. Close other terminal windows running the app, then try again. |
| The browser shows "can't connect" | Make sure the terminal still shows the app running (Step 3). The app only works while that terminal window is open. |

---

## For developers

This is a [Next.js](https://nextjs.org) 16 app (App Router) using React 19, TypeScript,
and Tailwind CSS v4. Useful commands (run from `launch-v2g/`):

- `npm run dev` — start the dev server at http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

See `CLAUDE.md` and `AGENTS.md` in this folder for architecture and contribution notes.
