# Arbitra Setup Guide

Complete guide to setting up and deploying Arbitra on the Internet Computer.

## Prerequisites

Before you begin, ensure you have the following installed:

### 1. Node.js and pnpm
```bash
# Install Node.js 18 or higher
# Download from: https://nodejs.org/

# Install pnpm
npm install -g pnpm
```

### 2. DFX SDK (Internet Computer SDK)
```bash
# Install DFX
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Verify installation
dfx --version
```

### 3. Git
```bash
# Install Git (if not already installed)
# macOS: brew install git
# Linux: sudo apt-get install git
# Windows: https://git-scm.com/download/win
```

## Installation Steps

### Step 1: Extract the Project
```bash
# Extract the arbitra-icp.zip file
unzip arbitra-icp.zip
cd arbitra-icp
```

### Step 2: Install Frontend Dependencies
```bash
cd src/arbitra_frontend
pnpm install
cd ../..
```

### Step 3: Start Local Replica
```bash
# Start the Internet Computer local replica
dfx start --background --clean
```

This will start a local Internet Computer replica on your machine. The `--clean` flag ensures a fresh start.

### Step 4: Deploy Canisters

#### Option A: Use the Deploy Script (Recommended)
```bash
./deploy.sh
```

#### Option B: Manual Deployment
```bash
# Create canister IDs
dfx canister create --all

# Build backend canisters
dfx build

# Build frontend
cd src/arbitra_frontend
pnpm run build
cd ../..

# Deploy all canisters
dfx deploy
```

### Step 5: Access the Application
After deployment, you'll see output like:
```
Access your application at:
http://localhost:4943?canisterId=<frontend-canister-id>
```

Open this URL in your browser to access Arbitra.

## Using Arbitra

### 1. Login
- Click "Login with Internet Identity"
- If this is your first time, you'll create a new Internet Identity
- Follow the prompts to set up your identity

### 2. Create a Dispute
- Navigate to "Create Dispute" tab
- Fill in the form:
  - **Title**: Brief description of the dispute
  - **Description**: Detailed explanation
  - **Respondent Principal ID**: The other party's principal ID
  - **Amount**: Dispute amount in satoshis
- Click "Create Dispute"

### 3. View Disputes
- Navigate to "All Disputes" tab
- See all disputes with their current status
- Click on a dispute to view details

## Troubleshooting

### Issue: "Cannot connect to replica"
**Solution**: Make sure the replica is running
```bash
dfx start --background
```

### Issue: "Canister not found"
**Solution**: Deploy the canisters
```bash
dfx deploy
```

### Issue: "Frontend build fails"
**Solution**: Reinstall dependencies
```bash
cd src/arbitra_frontend
rm -rf node_modules
pnpm install
pnpm run build
```

### Issue: "Internet Identity not loading"
**Solution**: Make sure you're using the correct URL with the canister ID parameter

## Deploying to IC Mainnet

To deploy to the Internet Computer mainnet:

### 1. Get Cycles
You need cycles to deploy to mainnet. Get cycles from:
- [Cycles Faucet](https://internetcomputer.org/docs/current/developer-docs/setup/cycles/cycles-faucet)
- [NNS Dapp](https://nns.ic0.app/)

### 2. Deploy to Mainnet
```bash
dfx deploy --network ic
```

### 3. Access Your Mainnet Application
```bash
# Get your frontend canister ID
dfx canister --network ic id arbitra_frontend

# Access at:
# https://<canister-id>.ic0.app
```

## Development Workflow

### Running Frontend in Development Mode
```bash
cd src/arbitra_frontend
pnpm run dev
```

This starts a development server with hot reload at `http://localhost:5173`

### Testing Backend Functions
```bash
# Example: Get all disputes
dfx canister call arbitra_backend getAllDisputes

# Example: Create a test dispute
dfx canister call arbitra_backend createDispute '(principal "aaaaa-aa", "Test Dispute", "This is a test", 100000)'
```

### Viewing Canister Logs
```bash
# View logs for a specific canister
dfx canister logs arbitra_backend
```

### Stopping the Replica
```bash
dfx stop
```

## Project Structure

```
arbitra-icp/
├── src/
│   ├── arbitra_backend/       # Main arbitration logic
│   │   └── main.mo
│   ├── evidence_manager/      # Evidence handling
│   │   └── main.mo
│   ├── ai_analysis/           # AI analysis engine
│   │   └── main.mo
│   ├── bitcoin_escrow/        # Bitcoin escrow
│   │   └── main.mo
│   ├── arbitra_frontend/      # React frontend
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── types.mo               # Shared types
├── dfx.json                   # ICP configuration
├── deploy.sh                  # Deployment script
├── README.md                  # Project overview
├── ARCHITECTURE.md            # Architecture details
├── SETUP_GUIDE.md            # This file
└── LICENSE                    # MIT License
```

## Next Steps

1. **Explore the Code**: Review the Motoko canisters and React frontend
2. **Customize**: Modify the code to fit your specific needs
3. **Test**: Create test disputes and verify functionality
4. **Deploy**: Deploy to IC mainnet when ready
5. **Share**: Share your deployment with others

## Support

For issues or questions:
- Check the [Internet Computer Documentation](https://internetcomputer.org/docs)
- Visit the [DFINITY Forum](https://forum.dfinity.org/)
- Review the project's ARCHITECTURE.md for technical details

## Security Notes

- The default identity created by dfx is not secure for production
- Create a password-protected identity for mainnet:
  ```bash
  dfx identity new my-secure-identity
  dfx identity use my-secure-identity
  ```
- Never share your seed phrase or private keys
- Always audit smart contract code before deploying to mainnet

---

Happy building with Arbitra! ⚖️
