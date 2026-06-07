<div align="center">
  <br/>
  <h1>
    <pre>
   _____                    _
  / ____|                  | |
 | |     _ __ _ __ ___  __| |_
 | |    | '__| '__/ _ \/ _` |_ \
 | |____| |  | | |  __/ (_| | | |
  \_____|_|  |_|  \___|\__,_| |_|
    </pre>
  </h1>
  <p>
    <strong>A clean, minimal Web3 utility toolkit.</strong>
  </p>
  <p>
    Generate cryptocurrency wallets &middot; Explore the blockchain &middot; Validate recovery phrases
  </p>
  <br/>
  <p>
    <img src="https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js" alt="Next.js"/>
    <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind"/>
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License"/>
  </p>
  <br/>
</div>

---

## Overview

**Crypt** is a browser-based Web3 utility toolkit that runs entirely client-side. It provides three core tools in a minimal, dark-first interface:

- **Wallet Generator** &mdash; Create Hierarchical Deterministic (HD) wallets from BIP39 mnemonic phrases for both Solana and Ethereum.
- **Blockchain Explorer** &mdash; Resolve ENS names, look up Ethereum addresses, and inspect on-chain balances using public RPC endpoints.
- **Mnemonic Validator** &mdash; Verify 12 and 24-word BIP39 recovery phrases against the official English wordlist.

All key derivation happens locally in the browser using `tweetnacl`, `ed25519-hd-key`, `bip39`, `@solana/web3.js`, and `ethers`. No data is ever sent to a server &mdash; your keys never leave your machine.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                       Next.js 14 App                    │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Landing  │  │   /generate  │  │    /search       │  │
│  │  page.tsx │  │   page.tsx   │  │   page.tsx       │  │
│  └────┬─────┘  └──────┬───────┘  └───────┬──────────┘  │
│       │               │                  │              │
│  ┌────▼─────┐  ┌──────▼───────┐  ┌───────▼──────────┐  │
│  │  Navbar  │  │     Wallet   │  │    SearchTool    │  │
│  │  Footer  │  │   Generator  │  │                  │  │
│  └──────────┘  │              │  │  ┌────────────┐  │  │
│                │  bip39       │  │  │ ENS/Address│  │  │
│                │  tweetnacl   │  │  │   Lookup   │  │  │
│                │  ed25519-hd  │  │  └────────────┘  │  │
│                │  @solana/w3  │  │  ┌────────────┐  │  │
│                │  ethers v6   │  │  │  Mnemonic  │  │  │
│                │              │  │  │ Validator  │  │  │
│                └──────────────┘  │  └────────────┘  │  │
│                                  └──────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Shared UI (shadcn/ui)               │  │
│  │  Button  Input  Switch  Tabs  AlertDialog  Toast │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────┐  ┌───────────────────────────┐   │
│  │   lib/utils.ts   │  │      lib/web3.ts          │   │
│  │  (cn helper)     │  │  (provider, resolveEns,   │   │
│  │                  │  │   getAddressBalance)      │   │
│  └──────────────────┘  └───────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Theme System (next-themes)             │  │
│  │         Dark / Light / System toggle             │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key Design Decisions

**Client-side only.** All cryptographic operations run in the browser using well-audited libraries. The only external call is to public Ethereum RPC endpoints (with automatic fallback rotation) for balance and ENS lookups. No backend, no database, no API keys required.

**Local storage persistence.** Wallets and their associated mnemonic phrases are saved to `localStorage` under the `crypt_*` key prefix. This is ephemeral storage &mdash; clearing browser data will remove all saved wallets.

**Derivation paths.** Both chains follow the BIP44 standard:

| Chain  | Purpose | Coin Type | Path |
|--------|---------|-----------|------|
| Solana | BIP44   | 501       | `m/44'/501'/0'/{index}'` |
| Ethereum | BIP44 | 60      | `m/44'/60'/0'/{index}'` |

Keys are derived using `ed25519-hd-key` from the BIP39 seed, which follows the SLIP-10 specification for Ed25519 curves.

---

## Features

### Wallet Generator (`/generate`)

| Capability | Detail |
|---|---|
| **Mnemonic generation** | 12-word BIP39 mnemonic using cryptographically secure randomness (`generateMnemonic` from `bip39`) |
| **Mnemonic import** | Validate and import existing 12 or 24-word recovery phrases (`validateMnemonic`) |
| **Solana key derivation** | Ed25519 keypair via `tweetnacl` + `ed25519-hd-key`, encoded as Base58 via `bs58`, wrapped in `@solana/web3.js` `Keypair` |
| **Ethereum key derivation** | ECDSA private key via `ethers.Wallet` from the derived seed, address checksummed via `ethers.getAddress` |
| **Multiple wallets** | Derive multiple wallet instances from the same seed at increasing BIP44 indices |
| **Visibility toggle** | Show/hide private keys and the mnemonic phrase with animated reveal |
| **Copy to clipboard** | One-click copy on any key or phrase |
| **Grid / List view** | Toggle between compact grid and full-width list layouts |
| **Persist / Clear** | All state saved to `localStorage`; clear all wallets with confirmation dialog |

### Blockchain Explorer (`/search`)

**Address / ENS tab**

- Accepts Ethereum addresses (checksummed or not) and ENS names (`vitalik.eth`)
- Resolves ENS names in both directions (forward and reverse)
- Fetches real-time ETH balance and transaction count from the network
- Links to Etherscan for further exploration
- Auto-rotates through 3 public RPC endpoints on failure

**Validate Phrase tab**

- Accepts any space-separated BIP39 recovery phrase
- Validates against the official 2048-word BIP39 English wordlist
- Shows a color-coded result card (green for valid, red for invalid)
- Displays numbered word grid for easy verification

### Theme

A monochrome, dark-first design system built with CSS custom properties. Both light and dark modes are fully themed with smooth transitions via `next-themes`. The color palette uses neutral hues (`hsl(0, 0%, ...)`) for a clean, minimal aesthetic.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14.2](https://nextjs.org/) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 3.4](https://tailwindcss.com/) + `tailwindcss-animate` |
| UI Library | [shadcn/ui](https://ui.shadcn.com/) (Button, Input, Switch, Tabs, Alert Dialog, Sonner Toast) |
| Animations | [Framer Motion 11](https://www.framer.com/motion/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Font | [Manrope](https://manropefont.com/) via `next/font` |
| Web3 (Ethereum) | [ethers.js v6](https://docs.ethers.org/v6/) |
| Web3 (Solana) | [@solana/web3.js v1](https://docs.solana.com/developing/clients/javascript-api) |
| Cryptography | [tweetnacl](https://tweetnacl.js.org/), [ed25519-hd-key](https://github.com/paulfox/ed25519-hd-key) |
| Mnemonic | [bip39](https://github.com/bitcoinjs/bip39) |
| Encoding | [bs58](https://github.com/cryptocoinjs/bs58) |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/crypt.git
cd crypt

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Project Structure

```
crypt/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout (theme provider, toasts, font)
│   ├── globals.css               # Global styles + CSS custom properties
│   ├── generate/
│   │   └── page.tsx              # Wallet generator page
│   └── search/
│       └── page.tsx              # Search & validator page
├── components/
│   ├── Navbar.tsx                # Top navigation with theme toggle
│   ├── Footer.tsx                # Footer with attribution
│   ├── WalletGenerator.tsx       # Core wallet generation logic
│   ├── SearchTool.tsx            # ENS/address search + mnemonic validator
│   ├── themeprovider.tsx         # next-themes wrapper
│   └── ui/                       # shadcn/ui primitives
│       ├── button.tsx
│       ├── input.tsx
│       ├── switch.tsx
│       ├── tabs.tsx
│       ├── separator.tsx
│       ├── alert-dialog.tsx
│       ├── sonner.tsx
│       └── theme-button.tsx
├── lib/
│   ├── utils.ts                  # cn() helper (clsx + tailwind-merge)
│   └── web3.ts                   # Ethereum provider, RPC rotation, resolvers
├── public/
│   ├── favicon-light.svg         # Favicon for light mode
│   └── favicon-dark.svg          # Favicon for dark mode
├── tailwind.config.ts
├── components.json               # shadcn/ui config
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
└── package.json
```

---

## How Key Derivation Works

```
User Input (or generated)
        │
        ▼
  ┌─────────────┐
  │    bip39     │
  │  mnemonic →  │
  │  seed (512)  │
  └──────┬──────┘
         │ seed hex
         ▼
  ┌─────────────┐
  │ed25519-hd-key│
  │derivePath() │
  │ BIP44 path  │
  └──────┬──────┘
         │ derived seed
         ▼
  ┌──────┴──────┐
  │  Solana?    │  ──yes──►  tweetnacl.sign.keyPair.fromSeed()
  │             │              → bs58.encode(secretKey)
  │ Ethereum?   │              → Keypair.publicKey.toBase58()
  └──────┬──────┘
         │ no
         ▼
  ┌─────────────┐
  │ ethers v6   │
  │ new Wallet( │
  │  privateKey)│
  │ → address   │
  └─────────────┘
```

---

## Security Notes

- All cryptographic operations execute in the browser sandbox. No private keys or mnemonic phrases are transmitted over the network.
- The only outbound requests are to public Ethereum RPC endpoints for balance and ENS lookups — these resolve public data, not your keys.
- Data is persisted in `localStorage` which is accessible to any JavaScript running on the same origin. Exercise caution on shared machines.
- This is a developer tool and educational project. For production-grade key management, use a hardware wallet or dedicated custody solution.

---

## License

[MIT](LICENSE)

---

<div align="center">
  <br/>
  <p>
    Built with
    <img src="https://img.shields.io/badge/☕-coffee-brown?style=flat-square" alt="coffee"/>
    and
    <img src="https://img.shields.io/badge/❤-red?style=flat-square" alt="love"/>
  </p>
  <br/>
</div>
