# Lumina Fund: Decentralized Crowdfunding on Stellar Soroban

Lumina Fund is a next-generation decentralized crowdfunding platform built using **Rust** on the **Stellar Soroban** smart contract ecosystem and a visually stunning **React/Vite** frontend. The platform provides a trustless, transparent way for project creators to raise capital in XLM, while ensuring backers' funds are protected by smart contracts until campaign targets are met.

## 🌟 Key Features

### 1. Smart Contract (Soroban/Rust)
The core logic resides securely on the Stellar blockchain, ensuring funds cannot be tampered with.
* **Trustless Pledging:** Users pledge their Stellar tokens to campaigns. Funds are securely locked in the smart contract.
* **Conditional Claiming:** The campaign creator (Admin) can only withdraw the funds if the target goal is successfully reached by the specified deadline.
* **Automated Refunds:** If a campaign fails to hit its target by the deadline, the contract automatically permits users to independently refund their pledges back to their wallets.

### 2. Premium Frontend (React + Vite)
A cyberpunk-inspired, glassmorphism-themed UI designed for maximum engagement.
* **Stunning Design:** Uses dynamic gradients, glass panes, hover animations, and a sleek dark mode.
* **Campaign Dashboard:** Real-time visibility into active, successful, and failed campaigns with interactive progress bars.
* **Wallet Integration Ready:** Built to seamlessly integrate with the Freighter browser extension for Stellar.
* **Campaign Launch Module:** An intuitive modal allowing users to define their funding target, duration, and descriptions to deploy a new Soroban contract instantly.

---

## 🛠️ Tech Stack

* **Smart Contracts:** Rust, Stellar Soroban SDK (`wasm32-unknown-unknown` target)
* **Frontend:** React, TypeScript, Vite
* **Styling:** Vanilla CSS (Glassmorphism & CSS Variables)
* **Wallet Context (Prepared):** Freighter API (`@stellar/freighter-api`)

---

## 🚀 Getting Started

### 1. Run the Smart Contract

Navigate to the contract directory and build the WebAssembly file. You must have Rust and the `wasm32-unknown-unknown` target installed.

```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
```

This will output the `.wasm` file into `target/wasm32-unknown-unknown/release/`. You can deploy this using the Stellar CLI.

### 2. Run the Frontend

Navigate to the frontend directory to launch the web application.

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5174/` (or the port specified in your terminal) to view the application.

---

## 📂 Project Structure

```text
crowdfunding-platform/
│
├── contract/                   # Stellar Soroban Smart Contract
│   ├── src/
│   │   └── lib.rs              # Contract logic (init, pledge, claim, refund)
│   ├── Cargo.toml              # Rust dependencies
│   └── Cargo.lock
│
├── frontend/                   # React Web Application
│   ├── src/
│   │   ├── App.tsx             # Main dashboard and UI logic
│   │   ├── index.css           # Premium styling and design system
│   │   └── main.tsx            # React entry point
│   ├── package.json
│   └── vite.config.ts
│
└── README.md                   # Project documentation
```

## 🔒 Security & Architecture Details
The platform relies on the secure state transition of Soroban data keys:
- `DataKey::TotalPledged` constantly updates without modifying individual balances, minimizing computation.
- Time enforcement acts entirely on the ledger timestamp (`env.ledger().timestamp()`), meaning the smart contract itself prevents premature withdrawals or post-deadline deposits.
- The platform uses a non-custodial approach: Lumina Fund takes no fees and doesn't hold the keys. The smart contract acts as an immutable escrow.
