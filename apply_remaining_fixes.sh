#!/usr/bin/env bash
set -e

echo "== Step 4: Fix doubled search bar =="
cat >> frontend/src/styles/dashboard.css << 'EOF'

/*==========================================================
SEARCH BAR — remove the "doubled" hard-shadow look
==========================================================*/

.search-box{
    box-shadow: none;
}

.search-box:focus-within{
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(250,204,21,.18);
}
EOF
echo "dashboard.css: search bar shadow fixed"

echo ""
echo "== Step 5: Remove duplicate 'Dashboard' heading =="
python3 << 'PYEOF'
path = "frontend/src/pages/DashboardPage.jsx"
with open(path, "r") as f:
    content = f.read()

old = '''          <div className="dashboard-hero">
            <div>
              <h1>Dashboard</h1>
              <p>Manage all your encrypted secrets in one place.</p>
            </div>
          </div>'''

new = '''          <div className="dashboard-hero">
            <div>
              <h1>Welcome back 👋</h1>
              <p>Manage all your encrypted secrets in one place.</p>
            </div>
          </div>'''

if old not in content:
    print("BLOCK NOT FOUND — no changes made, check file manually")
else:
    content = content.replace(old, new, 1)
    with open(path, "w") as f:
        f.write(content)
    print("DashboardPage.jsx updated — heading de-duplicated")
PYEOF

echo ""
echo "== Step 6: Check if Header.css is still used =="
grep -rn "Header.css" frontend/src || echo "No matches — Header.css appears unused (safe to delete after you confirm)"

echo ""
echo "== Step 7: Build =="
cd frontend
npm run build
cd ..

echo ""
echo "All done. Now run:"
echo "  git add -A"
echo "  git commit -m \"Search bar fix, dedupe dashboard heading\""
echo "  git push origin main"
echo "Then restart your backend: uvicorn app.main:app --reload"
