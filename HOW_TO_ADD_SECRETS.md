# How to Add Your Wallet Private Key in Replit

## Quick Steps:

1. **Look at the left sidebar** in your Replit workspace
2. **Find the "Secrets" tab** (it looks like a key icon)
3. **Click on "Secrets"**
4. **Click "New Secret" button**
5. **Fill in:**
   - Name: `WALLET_PRIVATE_KEY`
   - Value: Your private key (starts with 0x...)
6. **Click "Add Secret"**

## Visual Guide:

```
Left Sidebar:
├── Files 📁
├── Packages 📦
├── Secrets 🔐  ← Click here
├── Database 🗄️
└── ...
```

## Where to Find Your Private Key:

### MetaMask:
1. Open MetaMask extension
2. Click the 3 dots menu
3. Account Details → Export Private Key
4. Enter your password
5. Copy the private key

### Other Wallets:
- Look for "Export Private Key" or "Account Details"
- Usually in Settings or Account menu

## Important:
- Never share your private key with anyone
- The secret will be encrypted and only accessible to your app
- Your private key should start with "0x" followed by 64 characters

## After Adding the Secret:

Run this command to verify everything is set up:
```bash
node deploy-contract.js
```