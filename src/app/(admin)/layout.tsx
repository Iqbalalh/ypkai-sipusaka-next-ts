"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import NextTopLoader from "nextjs-toploader";
import React from "react";
import "@ant-design/v5-patch-for-react-19";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

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
