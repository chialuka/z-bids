"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "@heroicons/react/24/outline";
import { BookOpenIcon } from "@heroicons/react/24/outline";

export default function SidebarNav() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  
  // Load collapsed state from localStorage on component mount
  useEffect(() => {
    const savedCollapsed = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsed !== null) {
      setCollapsed(savedCollapsed === "true");
    }
  }, []);
  
  // Update localStorage when collapsed state changes
  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  // Handle navigation with loading state
  const handleNavigation = (href: string) => {
    if (href === pathname) return;
    setActiveLink(href);
    router.push(href);
  };

  // Reset active link when navigation completes
  useEffect(() => {
    setActiveLink(null);
  }, [pathname]);

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
          fixed z-50 top-0 left-0 h-full bg-white border-r border-gray-200 flex flex-col py-8
          transition-all duration-200 ease-in-out
          md:static md:flex
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
        style={{
          minHeight: "100vh",
          width: collapsed ? "5rem" : "14rem", /* Fixed width based on collapsed state */
          padding: collapsed ? "0.5rem" : "1rem",
        }}
        aria-label="Sidebar navigation"
      >
        {/* Collapse/Expand button (desktop only) */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div 
            className={`text-2xl font-bold text-blue-600 transition-opacity duration-200 overflow-hidden whitespace-nowrap ${collapsed ? "opacity-0 w-0" : "opacity-100"}`}
            style={{ maxWidth: collapsed ? "0" : "100%" }}
          >
            Z-Bids
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:inline-flex flex-shrink-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleCollapsed}
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
          <div className="text-2xl font-bold text-blue-600 overflow-hidden text-ellipsis whitespace-nowrap">Z-Bids</div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden flex-shrink-0"
            aria-label="Close sidebar"
            onClick={() => setOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        
        {/* Navigation Links */}
        <div className="flex flex-col space-y-1 w-full">
          <button 
            onClick={() => handleNavigation("/")}
            className={`
              text-left flex items-center gap-3 py-2 rounded-lg font-medium transition-colors 
              ${collapsed ? "justify-center" : "px-3"} 
              ${pathname === "/" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}
              ${activeLink === "/" ? "opacity-70" : ""}
              relative
            `}
          > 
            <HomeIcon className="w-6 h-6 flex-shrink-0" />
            <span 
              className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${collapsed ? "w-0" : "w-full"}`}
              style={{ maxWidth: collapsed ? "0" : "100%" }}
            >
              Home
            </span>
            {activeLink === "/" && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4">
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            )}
          </button>
          
          <button 
            onClick={() => handleNavigation("/knowledge-base")}
            className={`
              text-left flex items-center gap-3 py-2 rounded-lg font-medium transition-colors
              ${collapsed ? "justify-center" : "px-3"}
              ${pathname === "/knowledge-base" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}
              ${activeLink === "/knowledge-base" ? "opacity-70" : ""}
              relative
            `}
          > 
            <BookOpenIcon className="w-6 h-6 flex-shrink-0" />
            <span 
              className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${collapsed ? "w-0" : "w-full"}`}
              style={{ maxWidth: collapsed ? "0" : "100%" }}
            >
              Knowledge Base
            </span>
            {activeLink === "/knowledge-base" && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4">
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            )}
          </button>
        </div>
      </nav>
    </>
  );
} 
