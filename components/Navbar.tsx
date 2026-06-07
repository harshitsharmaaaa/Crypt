import { Box, Search, Sparkles } from "lucide-react";
import React from "react";
import { ModeToggle } from "./ui/theme-button";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center py-4">
      <a href="/" className="flex items-center gap-2">
        <Box className="size-8" />
          <span className="tracking-tighter text-3xl font-extrabold text-primary">
            Crypt
          </span>
      </a>
      <div className="flex items-center gap-1">
        <a
          href="/generate"
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary/70 hover:text-primary transition-colors rounded-lg hover:bg-accent"
        >
          <Sparkles className="size-4" />
          Generate
        </a>
        <a
          href="/search"
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary/70 hover:text-primary transition-colors rounded-lg hover:bg-accent"
        >
          <Search className="size-4" />
          Search
        </a>
        <ModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
