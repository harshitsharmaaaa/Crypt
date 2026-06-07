import Navbar from "@/components/Navbar";
import SearchTool from "@/components/SearchTool";

export default function SearchPage() {
  return (
    <main className="max-w-7xl mx-auto flex flex-col gap-4 p-4 min-h-screen">
      <Navbar />
      <SearchTool />
    </main>
  );
}
