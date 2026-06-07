"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { resolveEns, getAddressBalance } from "@/lib/web3";
import { ethers } from "ethers";
import { validateMnemonic } from "bip39";
import { Copy, ExternalLink, Search, Text, Wallet as WalletIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

const SearchTool = () => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"address" | "mnemonic">("address");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    address?: string;
    ensName?: string | null;
    balance?: string;
    txCount?: number;
    valid?: boolean;
    words?: string[];
  } | null>(null);

  const handleSearch = async () => {
    const query = input.trim();
    if (!query) return;
    setLoading(true);
    setResult(null);

    try {
      if (mode === "mnemonic") {
        const valid = validateMnemonic(query);
        const words = query.split(" ");
        setResult({ valid, words });
        if (valid) toast.success("Valid recovery phrase");
        else toast.error("Invalid recovery phrase");
      } else {
        const resolved = await resolveEns(query);
        if (!resolved.address) {
          toast.error("Could not resolve address or ENS name");
          setLoading(false);
          return;
        }
        const info = await getAddressBalance(resolved.address);
        setResult({
          address: resolved.address,
          ensName: resolved.ensName,
          balance: ethers.formatEther(info.balance),
          txCount: info.txCount,
        });
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    toast.success("Copied");
  };

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <h1 className="tracking-tighter text-4xl md:text-5xl font-black">
          Search
        </h1>
        <p className="text-primary/80 font-semibold text-lg md:text-xl">
          Resolve ENS names, look up addresses, or validate recovery phrases
        </p>
      </motion.div>

      <Tabs
        defaultValue="address"
        onValueChange={(v) => {
          setMode(v as "address" | "mnemonic");
          setResult(null);
          setInput("");
        }}
      >
        <TabsList>
          <TabsTrigger value="address">
            <WalletIcon className="size-4 mr-2" />
            Address / ENS
          </TabsTrigger>
          <TabsTrigger value="mnemonic">
            <Text className="size-4 mr-2" />
            Validate Phrase
          </TabsTrigger>
        </TabsList>

        <TabsContent value="address" className="mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter address or ENS name (e.g. vitalik.eth)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading || !input.trim()}>
              {loading ? (
                <div className="size-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              Search
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="mnemonic" className="mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Paste a 12 or 24-word recovery phrase"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading || !input.trim()}>
              {loading ? (
                <div className="size-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              Validate
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {result && result.address && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/10 p-6 max-w-2xl"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold tracking-tight">Address Info</h3>
            <a
              href={`https://etherscan.io/address/${result.address}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="ghost" size="icon" className="size-8">
                <ExternalLink className="size-4" />
              </Button>
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <span className="text-sm text-primary/50 font-medium">Address</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-sm truncate">{result.address}</span>
                <Button variant="ghost" size="icon" className="size-6" onClick={() => copy(result.address!)}>
                  <Copy className="size-3.5" />
                </Button>
              </div>
            </div>

            {result.ensName && (
              <div>
                <span className="text-sm text-primary/50 font-medium">ENS Name</span>
                <p className="font-medium mt-0.5">{result.ensName}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-secondary/50 p-4">
                <span className="text-sm text-primary/50 font-medium">Balance</span>
                <p className="text-lg font-bold tracking-tight mt-1">
                  {Number(result.balance).toFixed(5)} ETH
                </p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4">
                <span className="text-sm text-primary/50 font-medium">Tx Count</span>
                <p className="text-lg font-bold tracking-tight mt-1">
                  {result.txCount}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {result && "valid" in result && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-6 max-w-2xl ${
            result.valid
              ? "border-green-500/30 bg-green-500/5"
              : "border-red-500/30 bg-red-500/5"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`size-3 rounded-full ${
                result.valid ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="font-bold text-lg tracking-tight">
              {result.valid ? "Valid Recovery Phrase" : "Invalid Recovery Phrase"}
            </span>
          </div>

          {result.words && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
              {result.words.map((word, i) => (
                <div
                  key={i}
                  className="text-sm bg-foreground/5 rounded-lg px-3 py-2 font-mono"
                >
                  {i + 1}. {word}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SearchTool;
