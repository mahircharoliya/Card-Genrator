"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, Layout, ChevronDown } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md">
              <span className="text-white font-black text-sm">F</span>
            </div>
            <span className="font-black text-xl text-gray-900">FestCard</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/gallery" className="text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors">
              Gallery
            </Link>
            <Link href="/gallery?filter=trending" className="text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors">
              Trending
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors">
                Admin Panel
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 hover:border-violet-300 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden"
                    >
                      <Link href="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={15} /> My Profile
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                          <Layout size={15} /> Admin Panel
                        </Link>
                      )}
                      <button onClick={() => { logout(); setProfileOpen(false); }} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50">
                        <LogOut size={15} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-violet-600 px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-gray-600">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white px-4 pb-4"
          >
            <div className="flex flex-col gap-2 pt-3">
              <Link href="/gallery" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Gallery</Link>
              <Link href="/gallery?filter=trending" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Trending</Link>
              {isAuthenticated ? (
                <>
                  <Link href="/profile" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">My Profile</Link>
                  {isAdmin && <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50">Admin Panel</Link>}
                  <button onClick={logout} className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 text-left hover:bg-red-50">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Sign In</Link>
                  <Link href="/register" className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white text-center">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
