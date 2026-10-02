"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function DashboardWrapper({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 z-40 flex items-center px-4">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 text-slate-300 hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-4 text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          Lunery Recruitment
        </span>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={() => setIsMobileMenuOpen(false)} // Close when clicking a link inside
      >
        {sidebar}
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen border-l border-white/5 bg-[#030712]/50 pt-16 md:pt-0 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
