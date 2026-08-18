# ⚡ SplitSathi — Split bills, not friendship.

> An award-winning, CRED & GPay inspired Indian fintech web application for group bill splitting and automated debt simplification using the **Greedy Minimum Cash Flow** algorithm.

![SplitSathi Dashboard Banner](https://img.shields.gradient.is/SplitSathi-Fintech.svg?color1=7C3AED&color2=22C55E)

---

## 🌟 Highlights & Features

- **⚡ Greedy Minimum Cash Flow Algorithm**: Automatically calculates the optimal minimum transactions needed to settle all group debts (achieving up to **75% reduction** in transaction count).
- **🎨 CRED / GPay Inspired Dark UI**: Designed with `#09090B` dark mode, animated aurora background mesh, frosted glassmorphism cards (`rgba(255,255,255,0.06)`), and Google Inter typography.
- **🇮🇳 Realistic Indian Expenses**: Pre-configured preset scenarios (Domino's, Ola Cabs, Barbeque Nation, DMart, Fuel, PVR Movies, and Villa Stays).
- **⚖️ 4 Custom Split Modes**:
  - **Equally**: Divides cost evenly across selected members with real-time per-person previews.
  - **Exact Rupee (₹)**: Specify exact currency amounts for each member.
  - **% Split**: Set percentage splits with live calculated Rupee previews (`= ₹31,371`).
  - **Shares**: Split costs by weighted ratios (e.g., 2 shares vs 1 share).
- **✨ Smart AI Insights**: Dynamically summarizes group spending trends, top category costs, and credit health tips.
- **🎉 Interactive Settlement Celebration**: 1-click **"🤝 Record Settlement Payment"** that triggers a celebratory **Confetti** animation.
- **💾 LocalStorage & Backup**: Reliable persistent storage with JSON export/import support.

---

## 📁 Repository Structure

```
Bill Splitting & Debt Simplification App/
├── index.html        # Main HTML5 structure with Lucide icons & Canvas Confetti
├── css/
│   └── styles.css    # Fintech design system, glassmorphism & aurora animations
├── js/
│   ├── app.js        # Controller connecting tab switcher, modals & split logic
│   ├── state.js      # Data state manager, Indian presets & localStorage sync
│   ├── debtEngine.js # Greedy minimum cash flow algorithm & balance calculations
│   └── ui.js         # Renderer for dashboard stat cards, AI insights & timeline
├── README.md         # Documentation
└── .gitignore        # Ignored files
```

---

## 🚀 Quick Start

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/SplitSathi.git
   cd SplitSathi
   ```

2. **Install dependencies and run locally**:
   ```bash
   npm install
   npm run dev
   ```

3. **Create a production bundle**:
   ```bash
   npm run build
   npm run preview
   ```

   Open the local URL printed by Vite in your web browser.

---

## 🤝 License

Distributed under the MIT License. See `LICENSE` for more information.
