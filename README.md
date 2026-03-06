# SeekHer 🔮

> **Your wallet. Your vibe. Your people.**

A Solana-native dating & social discovery app built for the Monolith Hackathon. SeekHer uses your on-chain activity, token portfolio, and NFT collection to match you with compatible Solana degens — because your blockchain fingerprint reveals more about you than any bio ever could.

[![Built for Monolith Hackathon](https://img.shields.io/badge/Monolith-Solana%20Mobile%20Hackathon-9945FF?style=for-the-badge)](https://solanamobile.radiant.nexus/?panel=hackathon)
[![React Native](https://img.shields.io/badge/React%20Native-0.76.7-14F195?style=for-the-badge&logo=react)](https://reactnative.dev)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF?style=for-the-badge)](https://solana.com)

---

## ✨ What is SeekHer?

SeekHer is the first dating app where your **Solana wallet IS your profile**. Instead of filling out generic dating profiles, your on-chain identity speaks for you:

- 🪙 **Token Portfolio** — What you hold defines your tribe (SOL, BONK, WIF, PYTH, etc.)
- 🖼️ **NFT Collection** — Your taste in NFTs reveals your culture fit
- 📊 **SeekerScore™** — An on-chain reputation score based on DeFi activity, holding patterns, and community participation
- 💬 **Paid First Messages** — Requires 0.001 SOL to send, eliminating low-effort spam
- 🔐 **MWA Auth** — Logs in with Solana Mobile Wallet Adapter (Seed Vault or Backpack)

---

## 🏆 Hackathon Submission

**Event:** [Monolith — Solana Mobile Hackathon](https://solanamobile.radiant.nexus/?panel=hackathon)  
**Track:** Social / Consumer  
**Platform:** Android (Solana Mobile Stack)

### Why SeekHer wins:

| Category | Differentiator |
|---|---|
| **On-chain identity** | Your wallet _is_ your profile — no fake bios |
| **Economic skin in the game** | 0.001 SOL to message eliminates spam 100% |
| **MWA Native** | First dating app using Solana Mobile Wallet Adapter |
| **SeekerScore™** | Proprietary reputation algorithm from real on-chain data |
| **Community tokens** | BONK, WIF, PYTH, RAY holders get matching boosts |

---

## 🛠️ Tech Stack

### Mobile App
| Layer | Technology |
|---|---|
| Framework | React Native 0.76.7 + Expo 52 |
| Language | TypeScript 5.x |
| Styling | NativeWind 4.2.2 (Tailwind CSS) |
| Navigation | React Navigation 7 |
| Animations | React Native Reanimated 4.2.2 |
| State | Zustand + React Context |
| Images | React Native Fast Image |

### Solana / Blockchain
| Layer | Technology |
|---|---|
| Wallet Auth | Solana Mobile Wallet Adapter (MWA) |
| RPC | Helius (mainnet) |
| NFT/Token data | Helius DAS API |
| Transactions | @solana/web3.js |
| Crypto polyfills | react-native-quick-crypto, @craftzdog/react-native-buffer |

### Backend / Data
| Layer | Technology |
|---|---|
| Database | NeonDB (Serverless Postgres) |
| Image Storage | Cloudinary |
| API | Direct from app via @neondatabase/serverless |

---

## 🚀 Running Locally

### Prerequisites

- Node.js 18+
- Android Studio + Android SDK (API 26+)
- Java 17
- Solana Mobile device (or emulator with Backpack wallet)
- A Helius API key ([get one free](https://helius.dev))
- A NeonDB database ([get one free](https://neon.tech))

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/seekher.git
cd seekher

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Copy environment file
cp .env.example .env
# Fill in your actual keys in .env

# 4. Run TypeScript check
npx tsc --noEmit

# 5. Build Android debug APK
cd android && ./gradlew assembleDebug

# OR run in development mode
npx expo run:android
```

### Run on Device

```bash
# Connect your Android device via USB with USB debugging enabled
adb devices  # confirm device is listed

# Install the APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with these variables:

```env
# ─── Database ────────────────────────────────────────────────────────────────
NEON_DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

# ─── Helius (Solana RPC + NFT Data) ──────────────────────────────────────────
HELIUS_API_KEY=your-helius-api-key
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your-helius-api-key

# ─── Solana RPC ───────────────────────────────────────────────────────────────
SOLANA_MAINNET_RPC=https://mainnet.helius-rpc.com/?api-key=your-helius-api-key
SOLANA_DEVNET_RPC=https://api.devnet.solana.com
SOLANA_NETWORK=mainnet-beta

# ─── Cloudinary (Image Storage) ───────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ─── App ──────────────────────────────────────────────────────────────────────
APP_NAME=SeekHer
APP_ENV=development
```

---

## 📱 App Features

### Screens

| Screen | Description |
|---|---|
| **Splash** | Animated gradient logo with Solana branding |
| **Onboarding** | MWA wallet connect flow |
| **Swipe** | Tinder-style card stack with on-chain badges |
| **Matches** | Your SOL-verified connections |
| **Chat** | 0.001 SOL first-message gate |
| **Profile** | Your on-chain identity dashboard |
| **Portfolio** | Token & NFT portfolio viewer |
| **Discover** | Filter by community token, mode, looking-for |
| **Settings** | Privacy, notifications, account |

### SeekerScore™ Algorithm

The SeekerScore (0–100) is calculated from:

- 📈 **DeFi Activity** — DEX trades, LP positions (30%)
- 💎 **Diamond Hands** — Hold duration of top assets (25%)
- 🖼️ **NFT Culture** — Floor price × collection prestige (20%)
- 🏘️ **Community** — Community token holdings (15%)
- ⚡ **Network Age** — Wallet age on Solana (10%)

---

## 📂 Project Structure

```
seekher/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # App screens (9 total)
│   ├── context/         # WalletContext, UserContext
│   ├── services/        # neon.ts, helius.ts, solana.ts
│   ├── constants/       # colors, config, tags, modes
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # polyfills, seekerScore calc
│   └── navigation/      # React Navigation setup
├── android/             # Android native project
├── .env.example         # Environment variable template
├── babel.config.js      # Babel + path aliases + dotenv
├── metro.config.js      # Metro bundler + crypto polyfills
└── tsconfig.json        # TypeScript config with path aliases
```

---

## 🔐 Android Build Config

- **Package:** `com.seekher.app`
- **Min SDK:** 26 (Android 8.0) — required for MWA
- **Target SDK:** 34 (Android 14)
- **Version:** 1.0.0 (build 1)
- **MultiDex:** Enabled (required for Solana libs)

---

## 🧪 Solana Mobile Wallet Adapter

SeekHer uses MWA for:
1. **Authentication** — Sign a message to prove wallet ownership
2. **Transactions** — Sign 0.001 SOL first-message payments
3. **Session persistence** — Token stored securely in AsyncStorage

Compatible wallets: Seed Vault (Solana Mobile Phone), Backpack, Phantom

---

## 📄 License

MIT — built with 🟣 for the Solana ecosystem

---

<div align="center">

**Built for the [Monolith Solana Mobile Hackathon](https://solanamobile.radiant.nexus/?panel=hackathon)**

*Solana Mobile × Radiants*

</div>
