# ⚖️ Arbitra - Decentralized Legal Dispute Resolution Platform

**Built on Internet Computer Protocol for LegalHack 2025**

Arbitra is a blockchain-based platform that revolutionizes legal dispute resolution through decentralized arbitration, AI-powered analysis, cryptographic evidence verification, and Bitcoin escrow integration.

## 🌟 Features

### Core Functionality
- **Dispute Management**: Create, track, and resolve legal disputes on-chain
- **Evidence Verification**: Cryptographic hashing and tamper-proof storage of evidence
- **AI Analysis Engine**: Intelligent case analysis with chain-of-thought reasoning
- **Bitcoin Escrow**: Automated fund management using ICP's Bitcoin integration
- **Internet Identity**: Secure authentication without passwords

### Key Benefits
- ✅ **Tamper-Resistant**: All data stored on-chain with cryptographic verification
- ✅ **Transparent**: Complete audit trail of all dispute activities
- ✅ **Decentralized**: No single point of control or failure
- ✅ **Fast**: ICP's 1-2 second finality for quick transactions
- ✅ **Cost-Effective**: Reverse gas model - users don't pay transaction fees

## 🏗️ Architecture

### Backend Canisters (Motoko)
1. **arbitra_backend**: Main dispute management and user profiles
2. **evidence_manager**: Evidence submission and verification
3. **ai_analysis**: AI-powered dispute analysis
4. **bitcoin_escrow**: Bitcoin escrow and settlement

### Frontend (React + TypeScript)
- Modern React with hooks
- TypeScript for type safety
- Vite for fast builds
- Internet Identity integration
- Responsive design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- DFX SDK (Internet Computer SDK)
- Git

### Installation

1. **Start local Internet Computer replica**
```bash
dfx start --background --clean
```

2. **Deploy canisters**
```bash
dfx deploy
```

3. **Access the application**
Open your browser to the URL shown after deployment

## 📖 Usage

### Creating a Dispute
1. Log in with Internet Identity
2. Navigate to "Create Dispute"
3. Fill in dispute details (title, description, respondent, amount)
4. Submit the dispute

### Viewing Disputes
- Navigate to "All Disputes" to see all cases
- View detailed information including status, parties, and amounts

## 🛠️ Development

### Project Structure
```
arbitra-icp/
├── src/
│   ├── arbitra_backend/      # Main arbitration canister
│   ├── evidence_manager/     # Evidence management
│   ├── ai_analysis/          # AI analysis engine
│   ├── bitcoin_escrow/       # Bitcoin escrow
│   ├── arbitra_frontend/     # React frontend
│   └── types.mo              # Shared type definitions
├── dfx.json                  # ICP configuration
└── README.md
```

### Building
```bash
# Backend
dfx build

# Frontend
cd src/arbitra_frontend
pnpm run build
```

## 🌐 Deployment

### Local
```bash
dfx start --background
dfx deploy
```

### IC Mainnet
```bash
dfx deploy --network ic
```

## 🎯 LegalHack 2025 Bounty Alignment

### ICP Track
- ✅ **Best Consumer Focused Legal Solution** ($4,000)
- ✅ **Best B2B Legal System Solution** ($4,000)
- ✅ **Best use of ICP's bitcoin integration** ($4,000)

### Key Differentiators
1. Full-stack on-chain deployment
2. Bitcoin integration for escrow
3. AI-powered analysis
4. Cryptographic evidence verification
5. Internet Identity integration

## 📚 Technical Stack

- **Blockchain**: Internet Computer Protocol (ICP)
- **Smart Contracts**: Motoko
- **Frontend**: React 19, TypeScript, Vite
- **Authentication**: Internet Identity
- **Bitcoin Integration**: ICP Bitcoin API

## 📄 License

MIT License

## 🔗 Links

- [Internet Computer](https://internetcomputer.org/)
- [DFINITY Documentation](https://internetcomputer.org/docs/current/home)
- [LegalHack 2025](https://dorahacks.io/hackathon/legal-hack/detail)

---

**Arbitra** - Bringing justice to the blockchain ⚖️
