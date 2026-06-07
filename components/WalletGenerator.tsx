"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import nacl from "tweetnacl";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { Input } from "./ui/input";
import { motion } from "framer-motion";
import bs58 from "bs58";
import { ethers } from "ethers";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Grid2X2,
  List,
  Trash,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface Wallet {
  publicKey: string;
  privateKey: string;
  mnemonic: string;
  path: string;
}

const WalletGenerator = () => {
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  const [pathType, setPathType] = useState<"501" | "60" | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [mnemonicInput, setMnemonicInput] = useState("");
  const [visiblePrivateKeys, setVisiblePrivateKeys] = useState<boolean[]>([]);
  const [gridView, setGridView] = useState(false);

  const pathLabels: Record<string, string> = {
    "501": "Solana",
    "60": "Ethereum",
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("crypt_wallets");
      const storedPath = localStorage.getItem("crypt_path");
      const storedMnemonic = localStorage.getItem("crypt_mnemonic");
      if (stored) setWallets(JSON.parse(stored));
      if (storedPath) setPathType(JSON.parse(storedPath));
      if (storedMnemonic) setMnemonicWords(JSON.parse(storedMnemonic));
    } catch {}
  }, []);

  useEffect(() => {
    setVisiblePrivateKeys((prev) =>
      wallets.map((_, i) => prev[i] ?? false)
    );
  }, [wallets.length]);

  const persist = (w: Wallet[], m: string[], p: string | null) => {
    localStorage.setItem("crypt_wallets", JSON.stringify(w));
    localStorage.setItem("crypt_mnemonic", JSON.stringify(m));
    if (p) localStorage.setItem("crypt_path", JSON.stringify(p));
  };

  const deleteWallet = (index: number) => {
    const updated = wallets.filter((_, i) => i !== index);
    setWallets(updated);
    persist(updated, mnemonicWords, pathType);
    toast.success("Wallet deleted");
  };

  const clearAll = () => {
    localStorage.removeItem("crypt_wallets");
    localStorage.removeItem("crypt_mnemonic");
    localStorage.removeItem("crypt_path");
    setWallets([]);
    setMnemonicWords([]);
    setPathType(null);
    toast.success("All wallets cleared");
  };

  const copy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const deriveWallet = (
    pathType: "501" | "60",
    mnemonic: string,
    index: number
  ): Wallet | null => {
    try {
      const seedBuffer = mnemonicToSeedSync(mnemonic);
      const path = `m/44'/${pathType}'/0'/${index}'`;
      const { key: derivedSeed } = derivePath(path, seedBuffer.toString("hex"));

      let publicKey: string;
      let privateKey: string;

      if (pathType === "501") {
        const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed);
        const kp = Keypair.fromSecretKey(secretKey);
        privateKey = bs58.encode(secretKey);
        publicKey = kp.publicKey.toBase58();
      } else {
        const pk = Buffer.from(derivedSeed).toString("hex");
        const wallet = new ethers.Wallet(pk);
        privateKey = pk;
        publicKey = wallet.address;
      }

      return { publicKey, privateKey, mnemonic, path };
    } catch {
      toast.error("Failed to derive wallet");
      return null;
    }
  };

  const generateWallet = () => {
    if (!pathType) {
      toast.error("Select a blockchain first");
      return;
    }

    let mnemonic = mnemonicInput.trim();
    if (mnemonic && !validateMnemonic(mnemonic)) {
      toast.error("Invalid recovery phrase");
      return;
    }
    if (!mnemonic) mnemonic = generateMnemonic();

    const words = mnemonic.split(" ");
    setMnemonicWords(words);

    const wallet = deriveWallet(pathType, mnemonic, wallets.length);
    if (wallet) {
      const updated = [...wallets, wallet];
      setWallets(updated);
      persist(updated, words, pathType);
      setMnemonicInput("");
      toast.success("Wallet generated");
    }
  };

  const addWallet = () => {
    if (mnemonicWords.length === 0 || !pathType) {
      toast.error("Generate a wallet first");
      return;
    }
    const mnemonic = mnemonicWords.join(" ");
    const wallet = deriveWallet(pathType, mnemonic, wallets.length);
    if (wallet) {
      const updated = [...wallets, wallet];
      setWallets(updated);
      persist(updated, mnemonicWords, pathType);
      toast.success("Additional wallet generated");
    }
  };

  const selectChain = (type: "501" | "60") => {
    setPathType(type);
    localStorage.setItem("crypt_path", JSON.stringify(type));
    toast.success(`${pathLabels[type]} selected`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Chain selection */}
      {!pathType && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 my-12"
        >
          <div className="flex flex-col gap-2">
            <h1 className="tracking-tighter text-4xl md:text-5xl font-black">
              Crypt supports multiple blockchains
            </h1>
            <p className="text-primary/80 font-semibold text-lg md:text-xl">
              Choose a blockchain to get started
            </p>
          </div>
          <div className="flex gap-3">
            <Button size="lg" onClick={() => selectChain("501")}>
              Solana
            </Button>
            <Button size="lg" onClick={() => selectChain("60")}>
              Ethereum
            </Button>
          </div>
        </motion.div>
      )}

      {/* Mnemonic input */}
      {pathType && wallets.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 my-12"
        >
          <div className="flex flex-col gap-2">
            <h1 className="tracking-tighter text-4xl md:text-5xl font-black">
              Secret Recovery Phrase
            </h1>
            <p className="text-primary/80 font-semibold text-lg md:text-xl">
              {pathLabels[pathType]} &mdash; enter a phrase or generate a new one
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="password"
              placeholder="Enter recovery phrase (or leave blank to generate)"
              value={mnemonicInput}
              onChange={(e) => setMnemonicInput(e.target.value)}
            />
            <Button size="lg" onClick={generateWallet}>
              {mnemonicInput ? "Import Wallet" : "Generate Wallet"}
            </Button>
          </div>
          <Button
            variant="ghost"
            className="self-start text-primary/50"
            onClick={() => { setPathType(null); localStorage.removeItem("crypt_path"); }}
          >
            &larr; Change blockchain
          </Button>
        </motion.div>
      )}

      {/* Display mnemonic */}
      {mnemonicWords.length > 0 && wallets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="group rounded-2xl border border-primary/10 p-6 md:p-8"
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowMnemonic(!showMnemonic)}
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">
              Your Secret Phrase
            </h2>
            <Button variant="ghost" size="icon">
              {showMnemonic ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>
          </div>

          {showMnemonic && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => copy(mnemonicWords.join(" "))}
              className="mt-6 flex flex-col items-center gap-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full">
                {mnemonicWords.map((word, i) => (
                  <div
                    key={i}
                    className="text-sm md:text-base bg-foreground/5 hover:bg-foreground/10 transition-colors rounded-lg px-4 py-3 font-medium"
                  >
                    <span className="text-primary/30 mr-2">{i + 1}.</span>
                    {word}
                  </div>
                ))}
              </div>
              <span className="text-sm text-primary/40 group-hover:text-primary/70 transition-colors flex items-center gap-1.5">
                <Copy className="size-3.5" /> Click to copy
              </span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Wallet cards */}
      {wallets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter">
              {pathType ? pathLabels[pathType] : ""} Wallet
            </h2>
            <div className="flex items-center gap-2">
              {wallets.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setGridView(!gridView)}
                  className="hidden md:inline-flex"
                >
                  {gridView ? <List className="size-4" /> : <Grid2X2 className="size-4" />}
                </Button>
              )}
              <Button onClick={addWallet}>Add Wallet</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Clear All</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete all wallets?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently deletes your wallets from local storage.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAll}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div
            className={`grid gap-5 ${
              gridView ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            }`}
          >
            {wallets.map((wallet, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="rounded-2xl border border-primary/10 overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-5">
                  <h3 className="text-2xl font-bold tracking-tighter">
                    Wallet {index + 1}
                  </h3>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash className="size-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this wallet?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteWallet(index)}
                          className="text-destructive"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="flex flex-col gap-5 px-6 py-5 bg-secondary/50 rounded-2xl mx-3 mb-3">
                  <div
                    className="flex flex-col gap-1.5 cursor-pointer"
                    onClick={() => copy(wallet.publicKey)}
                  >
                    <span className="text-sm font-bold tracking-tight text-primary/60">
                      Public Key
                    </span>
                    <p className="text-sm font-mono text-primary/80 hover:text-primary truncate transition-colors">
                      {wallet.publicKey}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold tracking-tight text-primary/60">
                      Private Key
                    </span>
                    <div className="flex items-center gap-2">
                      <p
                        onClick={() => copy(wallet.privateKey)}
                        className="text-sm font-mono text-primary/80 hover:text-primary truncate transition-colors flex-1 cursor-pointer"
                      >
                        {visiblePrivateKeys[index]
                          ? wallet.privateKey
                          : "•".repeat(24)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0"
                        onClick={() =>
                          setVisiblePrivateKeys((prev) =>
                            prev.map((v, i) => (i === index ? !v : v))
                          )
                        }
                      >
                        {visiblePrivateKeys[index] ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WalletGenerator;
