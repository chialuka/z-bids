"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "@heroicons/react/24/outline";
import { BookOpenIcon } from "@heroicons/react/24/outline";

export default function SidebarNav() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          aria-label="Open sidebar"
          onClick={() => setOpen(true)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
      </div>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      {/* Sidebar */}
      <nav
        className={`
          fixed z-50 top-0 left-0 h-full bg-white border-r border-gray-200 flex flex-col py-8 px-4 shadow-sm
          transition-all duration-200
          md:static md:flex
          ${open ? "translate-x-0 w-56" : "-translate-x-full w-56"} md:translate-x-0
          ${collapsed ? "md:w-20 px-2" : "md:w-56 px-4"}
        `}
        style={{ minHeight: "100vh" }}
        aria-label="Sidebar navigation"
      >
        {/* Collapse/Expand button (desktop only) */}
        <div className="hidden md:flex items-center justify-between mb-8 md:mb-8">
          <div className={`text-2xl font-bold text-blue-600 transition-all duration-200 ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>Z-Bids</div>
          <Button
            variant="ghost"
            size="icon"
            className="md:inline-flex md:ml-2"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((c) => !c)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              )}
            </svg>
          </Button>
        </div>
        {/* Close button on mobile */}
        <div className="flex items-center justify-between mb-8 md:hidden">
          <div className="text-2xl font-bold text-blue-600">Z-Bids</div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Close sidebar"
            onClick={() => setOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        <Link href="/" className={`flex items-center gap-3 mb-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors ${collapsed ? "justify-center px-2" : ""}`}> 
          <HomeIcon className="w-6 h-6" />
          <span className={`transition-all duration-200 ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>Home</span>
        </Link>
        <Link href="/knowledge-base" className={`flex items-center gap-3 mb-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors ${collapsed ? "justify-center px-2" : ""}`}> 
          <BookOpenIcon className="w-6 h-6" />
          <span className={`transition-all duration-200 ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>Knowledge Base</span>
        </Link>
      </nav>
    </>
  );
} 
