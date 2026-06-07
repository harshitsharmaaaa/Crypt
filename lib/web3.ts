import { ethers } from "ethers";

const RPC_ENDPOINTS = [
  "https://ethereum-rpc.publicnode.com",
  "https://rpc.ankr.com/eth",
  "https://eth.llamarpc.com",
];

let providerIndex = 0;
let provider: ethers.JsonRpcProvider | null = null;

function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_ENDPOINTS[providerIndex]);
  }
  return provider;
}

function rotateProvider() {
  providerIndex = (providerIndex + 1) % RPC_ENDPOINTS.length;
  provider = new ethers.JsonRpcProvider(RPC_ENDPOINTS[providerIndex]);
}

export async function resolveEns(input: string): Promise<{
  address: string | null;
  ensName: string | null;
}> {
  const p = getProvider();
  const q = input.trim();

  // ETH address check
  try {
    ethers.getAddress(q);
    const addr = ethers.getAddress(q);
    const ensName = await p.lookupAddress(addr).catch(() => null);
    return { address: addr, ensName };
  } catch {}

  // ENS name check
  const isEns = q.length > 4 && q.includes(".");
  if (isEns) {
    try {
      const addr = await p.resolveName(q);
      return { address: addr, ensName: addr ? q : null };
    } catch {
      return { address: null, ensName: null };
    }
  }
  return { address: null, ensName: null };
}

export async function getAddressBalance(address: string) {
  const p = getProvider();
  try {
    const [balance, txCount] = await Promise.all([
      p.getBalance(address),
      p.getTransactionCount(address),
    ]);
    return { balance, txCount };
  } catch {
    rotateProvider();
    const p2 = getProvider();
    const [balance, txCount] = await Promise.all([
      p2.getBalance(address),
      p2.getTransactionCount(address),
    ]);
    return { balance, txCount };
  }
}

export { getProvider };
