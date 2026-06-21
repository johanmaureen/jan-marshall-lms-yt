import { ReactNode } from "react";
import { NavBar } from "./_components/Navbar";

export default function LayoutPublic({ children }: { children: ReactNode }) {
  return (
    <div>
      <NavBar />
      <main className="container mx-auto px-4 md:p-x-6 lg:px-8 mb-32">
        {children}
      </main>
    </div>
  );
}
