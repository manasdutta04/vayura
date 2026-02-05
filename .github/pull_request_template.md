---
name: Pull Request Template
about: Standardize your contribution to Vayura
---

## 📝 Description
Provide a summary of the changes. Does this affect oxygen calculations, UI components, or Firebase configurations?

## 🔗 Related Issue
Fixes # (issue number)

## 🛠️ Type of Change
- [ ] 🌳 **New Feature** (District analysis, Leaderboard, etc.)
- [ ] 🧪 **Calculation Update** (Changes to Oxygen Demand/Supply formulas)
- [ ] 🐞 **Bug Fix** (Technical issue or UI glitch)
- [ ] 🔐 **Security/Firebase Rule Update**
- [ ] 📝 **Documentation Improvement**

## 🧪 Testing & Validation
- [ ] I have tested the logic with multiple District data points.
- [ ] (If applicable) I have verified that the Gemini AI aggregation fallback works.
- [ ] All Next.js build checks passed locally (`npm run build`).
- [ ] I have verified that Firestore security rules are not compromised.

## 🚩 Checklist:
- [ ] My code follows the **Atomic Design** pattern used in `src/components`.
- [ ] **Scientific Integrity:** I have updated the `Methodology` section if I changed any formulas.
- [ ] **Security:** I have NOT committed any Firebase Admin SDK private keys or `.env` secrets.
- [ ] My PR targets the correct branch (e.g., `main` or `develop`).
- [ ] I have followed the `src/app` directory convention.

## 📸 Visuals (if applicable)
> Add screenshots or screen recordings of the updated Dashboard, Leaderboard, or UI components to help the reviewer.

---
*By submitting this PR, I confirm that my contribution adheres to Vayura's mission of providing transparent and scientifically-backed environmental data.*
