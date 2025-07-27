"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, User } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Mail className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-medium text-gray-900">EmailSaaS</span>
          </Link>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="#features" 
              className="text-gray-600 hover:text-blue-600 transition-colors font-light"
            >
              Features
            </Link>
            <Link 
              href="#pricing" 
              className="text-gray-600 hover:text-blue-600 transition-colors font-light"
            >
              Pricing
            </Link>
            <Link 
              href="#docs" 
              className="text-gray-600 hover:text-blue-600 transition-colors font-light"
            >
              Docs
            </Link>
          </nav>

          {/* Right side - Auth buttons */}
          <div className="flex items-center space-x-4">
            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center space-x-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="font-light text-gray-600 hover:text-blue-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="font-light bg-blue-600 hover:bg-blue-700">
                  Sign Up
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="sm:hidden">
                <Button variant="ghost" size="sm" className="w-9 px-0">
                  <User className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/sign-in">Sign In</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/sign-up">Sign Up</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#features">Features</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#pricing">Pricing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#docs">Documentation</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
} 