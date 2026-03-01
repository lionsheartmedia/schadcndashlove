# Adnova Dashboard — Local Dev Startup

## Start the dev server

```powershell
cd "C:\Users\ryanp\OneDrive\Desktop\LOVE THIS DASH\schadcndashlove"
npx vite --port 8001
```

Then open **http://localhost:8001** in your browser.

---

## Pull latest changes from GitHub

```powershell
cd "C:\Users\ryanp\OneDrive\Desktop\LOVE THIS DASH\schadcndashlove"
git pull origin main
npm install
npx vite --port 8001
```

> Run `npm install` after a pull in case any new packages were added.

---

## Add new/changed files and push to GitHub

```powershell
cd "C:\Users\ryanp\OneDrive\Desktop\LOVE THIS DASH\schadcndashlove"
git add .
git commit -m "describe your changes here"
git push origin main
```

---

## Stop the server

Press `Ctrl + C` in the terminal.

---

## Notes

- Vite hot-reloads automatically when you save a file — no restart needed.
- If you ever need to rebuild: `npm run build`
- GitHub: https://github.com/lionsheartmedia/schadcndashlove
