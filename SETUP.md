# ecogen-v2 — setup & deploy

This folder is currently sitting **inside** the V1 repo at `~/Desktop/26-1/hci/ecogen-v2/`. Get it out, make it its own Git repo, and deploy it as a new Vercel project.

> Note: the PNG/APNG assets in `public/seal/` could not be copied automatically (file-lock issue). You'll copy them manually in step 2.

---

## Step 1 — Move it out of the V1 folder

```bash
# Move v2 to its own folder next to V1
mv ~/Desktop/26-1/hci/ecogen-v2 ~/Desktop/26-1/ecogen-v2
```

You should now have:
```
~/Desktop/26-1/
├── hci/             ← V1 (eco-prompt repo)
└── ecogen-v2/       ← V2 (this new project)
```

---

## Step 2 — Copy the seal assets from V1

```bash
mkdir -p ~/Desktop/26-1/ecogen-v2/public/seal/anim
cp ~/Desktop/26-1/hci/public/seal/*.png ~/Desktop/26-1/ecogen-v2/public/seal/
cp ~/Desktop/26-1/hci/public/seal/anim/*.png ~/Desktop/26-1/ecogen-v2/public/seal/anim/
```

Verify:
```bash
ls ~/Desktop/26-1/ecogen-v2/public/seal/
ls ~/Desktop/26-1/ecogen-v2/public/seal/anim/
```
You should see `seal-1.png` … `seal-5.png` and `stage1.png` … `stage5.png` + `final_celebration.png`.

---

## Step 3 — Install + run locally

```bash
cd ~/Desktop/26-1/ecogen-v2
npm install
cp .env.example .env
# edit .env and paste your Gemini key
npm run dev
```

Open http://localhost:5173 (or whichever port Vite picks).

You should see:
- All sections as free text + 더보기 buttons, EXCEPT COMPOSITION and LIGHTING which still have clickable chips.
- A new `추가/기타 항목` section at the bottom of the OPTIONAL column.
- The seal floating on the right side, slowly chasing your scroll position with a subtle pulse ring (so people actually notice it).
- Generated prompt comes out in Korean.

---

## Step 4 — New GitHub repo

```bash
cd ~/Desktop/26-1/ecogen-v2

# initialize git
git init
git add -A
git commit -m "feat: initial ecogen-v2 (free-text + floating seal + Korean output)"

# create a new GitHub repo via gh CLI (easiest)
gh repo create ecogen-v2 --public --source=. --remote=origin --push

# OR manually:
#   1. https://github.com/new → name: ecogen-v2 → Public → Create
#   2. git remote add origin https://github.com/5jseung/ecogen-v2.git
#   3. git branch -M main
#   4. git push -u origin main
```

---

## Step 5 — New Vercel project

1. Go to https://vercel.com/dashboard → **Add New** → **Project**
2. Find `ecogen-v2` in the import list → **Import**
3. On the configure screen:
   - **Project Name:** `ecogen-v2`
   - **Framework Preset:** Vite (auto-detected)
   - Expand **Environment Variables** → add `GEMINI_API_KEY` with your key value
4. Click **Deploy**.
5. Live URL will be `ecogen-v2.vercel.app` (or `ecogen-v2-5jseung.vercel.app` fallback).

Now you have two separate live URLs for the user study:
- **V1 (chips everywhere):** ecogen.vercel.app
- **V2 (free text + 더보기):** ecogen-v2.vercel.app

---

## What's different from V1 (quick reference)

| Section | V1 | V2 |
|---|---|---|
| PURPOSE | chips | textarea + 더보기 |
| SUBJECT | group (chips + textarea) | textarea + 더보기 |
| STYLE | group (chips × 3) | textarea + 더보기 |
| CONTEXT | group (single + chips × 2) | textarea + 더보기 |
| **LIGHTING** | **chips** | **chips (same as V1)** |
| **COMPOSITION** | **group (chips × 2)** | **group (chips × 2, same as V1)** |
| MOOD | chips + custom | textarea + 더보기 |
| NEGATIVE | textinput | textarea + 더보기 |
| **추가/기타 항목** | (none) | **NEW — textarea + 더보기** |
| Generated prompt | English paragraph | **Korean paragraph** |
| Seal placement | fixed bottom-right | **floating top-right, chases scroll with lag + pulse ring** |
