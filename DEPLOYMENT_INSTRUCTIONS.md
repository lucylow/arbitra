# 🚀 Deployment Instructions for Arbitra

## Complete Step-by-Step Guide

### ⏱️ Total Time: 10-15 minutes

---

## Step 1: Prerequisites (5 minutes)

### Install DFINITY SDK

```bash
# macOS/Linux
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Add to PATH
export PATH="$HOME/.local/share/dfx/bin:$PATH"

# Verify
dfx --version
```

**Expected:** `dfx 0.14.0` or higher

### Install Node.js Dependencies

```bash
cd /path/to/arbitra
npm install
```

---

## Step 2: Start ICP Local Network (2 minutes)

```bash
# Start the local Internet Computer replica
dfx start --background --clean

# Verify it's running
dfx canister status
```

**Wait for:** `"All canisters operational"` message

---

## Step 3: Deploy All Canisters (5 minutes)

```bash
# Deploy everything (this compiles and installs all canisters)
dfx deploy

# Watch for successful deployment
```

**Expected Output:**
```
Creating canister arbitra_backend...
Creating canister evidence_manager...
Creating canister ai_analysis...
Creating canister bitcoin_escrow...
Creating canister arbitra_frontend...

Installing code for canister arbitra_backend with canister_id xxxxx
Installing code for canister evidence_manager with canister_id yyyyy
Installing code for canister ai_analysis with canister_id zzzzz
Installing code for canister bitcoin_escrow with canister_id aaaaa
Installing code for canister arbitra_frontend with canister_id bbbbb

Deployed canisters.
```

---

## Step 4: Access Your Application (1 minute)

```bash
# Get the frontend canister ID and URL
FRONTEND_ID=$(dfx canister id arbitra_frontend)
echo "🚀 Your app is live at: http://localhost:4943/?canisterId=$FRONTEND_ID"

# Open in browser (macOS)
open "http://localhost:4943/?canisterId=$FRONTEND_ID"

# Or manually open in your browser
# URL format: http://localhost:4943/?canisterId=<canister_id>
```

---

## Step 5: Verify Deployment (1 minute)

### Check All Canisters Are Operational

```bash
# Test each canister
dfx canister call arbitra_backend health
dfx canister call evidence_manager health
dfx canister call ai_analysis health
dfx canister call bitcoin_escrow health
```

**Expected Output:**
```
("Arbitra backend is operational")
("Evidence Manager is operational")
("AI Analysis is operational")
("Bitcoin Escrow is operational")
```

---

## Optional: Deploy to ICP Testnet

```bash
# Set network to testnet
export DFX_NETWORK=ic

# Deploy (requires ICP cycles)
dfx deploy --network ic

# Get the testnet URL
dfx canister id arbitra_frontend --network ic
# Access: https://<canister_id>.ic0.app
```

---

## 🎯 Quick Reference

### Most Common Commands

```bash
# Deploy everything
dfx deploy

# Deploy specific canister
dfx deploy arbitra_backend

# Check status
dfx canister status arbitra_backend

# Check canister ID
dfx canister id arbitra_frontend

# Stop local network
dfx stop

# View logs
dfx canister log arbitra_backend

# Reinstall canister (clears data)
dfx canister install arbitra_backend --mode reinstall
```

---

## 🐛 Troubleshooting

### Issue: "dfx not found"

```bash
# Solution: Add to PATH
export PATH="$HOME/.local/share/dfx/bin:$PATH"

# Make permanent
echo 'export PATH="$HOME/.local/share/dfx/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Issue: "Port already in use"

```bash
# Solution: Stop existing dfx instance
dfx stop

# Or kill the process
killall dfx

# Then start fresh
dfx start --background --clean
```

### Issue: "Out of cycles"

```bash
# Solution: Deposit cycles
dfx canister deposit-cycles 1000000000 arbitra_backend

# Check balance
dfx canister status arbitra_backend
```

### Issue: "Canister not found"

```bash
# Solution: Create canisters first
dfx canister create --all

# Then deploy
dfx deploy
```

### Issue: "Build errors"

```bash
# Solution: Clean and rebuild
dfx stop
rm -rf .dfx
dfx start --background --clean
dfx deploy
```

### Issue: Frontend not loading

```bash
# Solution: Rebuild frontend and reinstall
npm run build
dfx canister install arbitra_frontend --mode reinstall

# Or deploy everything fresh
dfx deploy --all
```

---

## 🎤 Demo Verification

Before showing the demo, verify these work:

```bash
# 1. Health checks
dfx canister call arbitra_backend health
dfx canister call evidence_manager health
dfx canister call ai_analysis health
dfx canister call bitcoin_escrow health

# 2. Can access frontend
curl http://localhost:4943/?canisterId=$(dfx canister id arbitra_frontend)

# 3. See all canister IDs
dfx canister list
```

---

## 📊 Success Criteria

✅ All canisters deploy without errors  
✅ Health checks return "operational"  
✅ Frontend loads in browser  
✅ No compilation warnings  
✅ Canister IDs generated successfully  

**If all checks pass → You're ready to demo!** 🎉

---

## 🔗 Helpful Links

- **ICP Docs**: https://internetcomputer.org/docs
- **Motoko Guide**: https://internetcomputer.org/docs/current/developer-docs/motoko/
- **DFX Reference**: https://internetcomputer.org/docs/current/references/cli-reference/
- **Community**: https://forum.dfinity.org/

---

## 📞 Need Help?

Check the main README.md for detailed documentation, or see HACKATHON_SUBMISSION.md for demo tips.

**Good luck with your hackathon submission!** 🏆

