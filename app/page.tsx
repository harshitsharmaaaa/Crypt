import Navbar from "@/components/Navbar";
import { Sparkles, Search } from "lucide-react";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto flex flex-col gap-4 p-4 min-h-screen">
      <Navbar />
      <section className="flex flex-col items-center justify-center flex-1 gap-8 -mt-16">
        <div className="text-center max-w-xl">
          <h1 className="tracking-tighter text-5xl md:text-7xl font-black mb-4">
            Crypt
          </h1>
          <p className="text-primary/70 text-lg md:text-xl font-semibold">
            Generate wallets, resolve ENS names, validate phrases
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <a
            href="/generate"
            className="flex flex-col items-center gap-3 p-8 rounded-2xl border border-primary/10 hover:border-primary/30 bg-background hover:bg-accent/50 transition-all duration-300 flex-1 group"
          >
            <Sparkles className="size-8 text-primary/70 group-hover:text-primary transition-colors" />
            <span className="text-lg font-bold tracking-tight">Generate</span>
            <span className="text-sm text-primary/50 text-center">
              Create wallets with secret recovery phrases
            </span>
          </a>
          <a
            href="/search"
            className="flex flex-col items-center gap-3 p-8 rounded-2xl border border-primary/10 hover:border-primary/30 bg-background hover:bg-accent/50 transition-all duration-300 flex-1 group"
          >
            <Search className="size-8 text-primary/70 group-hover:text-primary transition-colors" />
            <span className="text-lg font-bold tracking-tight">Search</span>
            <span className="text-sm text-primary/50 text-center">
              Resolve ENS names and explore addresses
            </span>
          </a>
        </div>
      </section>
    </main>
  );
}
