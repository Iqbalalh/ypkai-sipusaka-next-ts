import WaliInfoCard from "@/components/view/wali/WaliInfoCard";
import React from "react";

export default function ViewWali() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Wali
        </h3>
        <div className="space-y-6">
          <WaliInfoCard />
        </div>
      </div>
    </div>
  );
}
