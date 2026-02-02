# Git push script
Remove-Item "G:\linera-real-time-forge\.git\index.lock" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

cd "G:\linera-real-time-forge"

# Configure git
git config user.name "Dinith"
git config user.email "dinitheth@gmail.com"

# Stage all files
git add -A

# Commit
git commit -m "feat: Complete Live Predict dApp - Decentralized esports betting on Linera blockchain

- Rust smart contract with AMM-based prediction markets
- React frontend with PandaScore API integration
- GraphQL service for blockchain queries
- CheCko wallet integration
- Comprehensive README with setup docs
- Fixed GraphQL snake_case transformation
- Removed timestamp validation causing errors"

# Push to GitHub
git push -u origin main --force

Write-Host "Successfully pushed to GitHub!"
