"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import NextTopLoader from "nextjs-toploader";
import React, { useEffect } from "react";
import "@ant-design/v5-patch-for-react-19";

// Import hooks dari next-auth/react dan next/navigation
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Ambil status sesi dari next-auth
  const { status } = useSession();
  const router = useRouter();

  // Logika Proteksi
  useEffect(() => {
    // Status 'loading' berarti NextAuth sedang memeriksa token/sesi
    if (status === "loading") return;

    // Jika status 'unauthenticated', redirect ke halaman login
    if (status === "unauthenticated") {
      // Redirect ke endpoint login NextAuth.js
      router.push("/signin");
    }
  }, [status, router]); // Re-run effect jika status sesi berubah

  // Tampilkan Loading State saat sesi sedang diperiksa
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">
        Memverifikasi otentikasi...
      </div>
    );
  }

  // Hanya render layout jika status adalah 'authenticated'
  if (status === "authenticated") {
    // Dynamic class for main content margin based on sidebar state
    const mainContentMargin = isMobileOpen
      ? "ml-0"
      : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

    return (
      <div className="min-h-screen xl:flex max-w-[100vw] overflow-x-hidden">
          <NextTopLoader />

          {/* Sidebar and Backdrop */}
          <AppSidebar />
          <Backdrop />

          {/* Main Content Area */}
          <div
            className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin} max-w-[100vw] overflow-x-hidden`}
          >
            <AppHeader />

            {/* Page Content */}
            <div className="p-4 mx-auto w-full max-w-[100vw] md:p-6 overflow-x-hidden">
              {children}
            </div>
          </div>
      </div>
    );
  }

  // Jika tidak authenticated (akan redirect di useEffect), return null atau div kosong
  return null;
}
