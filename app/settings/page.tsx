"use client";

import Link from "next/link";
import { useState } from "react";

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = () => {
    setIsLoading(true);
    
    // U pravoj aplikaciji ovde zovemo Stripe API koji vraća URL za plaćanje
    // Za MVP simuliramo konekciju ka Stripe serveru
    setTimeout(() => {
      alert("Uspešno povezivanje! Ovo bi te sada preusmerilo na pravi Stripe Checkout ekran za unos kartice.");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 p-6 flex flex-col gap-6">
        <div className="text-2xl font-bold mb-8">FollowUp AI</div>
        <nav className="flex flex-col gap-4 text-gray-400">
          <Link href="/dashboard" className="hover:text-white transition">Overview</Link>
          <Link href="/dashboard" className="hover:text-white transition">Leads</Link>
          <Link href="/settings" className="text-white hover:text-white transition">Settings</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-8">Settings & Billing</h1>
        
        {/* Billing Section */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl max-w-2xl mb-8">
          <h2 className="text-xl font-bold mb-4">Subscription Plan</h2>
          <div className="flex justify-between items-center bg-black p-4 rounded-lg border border-gray-800">
            <div>
              <p className="font-bold text-lg">Free Plan</p>
              <p className="text-sm text-gray-400">5 AI messages per month</p>
            </div>
            <button 
              onClick={handleUpgrade}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-bold transition ${isLoading ? "bg-gray-500 text-gray-300 cursor-not-allowed" : "bg-white text-black hover:bg-gray-200"}`}
            >
              {isLoading ? "Connecting to Stripe..." : "Upgrade to Pro (Stripe)"}
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Business Profile</h2>
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Salon Name</label>
              <input type="text" defaultValue="Studio Beauty" className="p-3 rounded-lg bg-black border border-gray-700 text-white focus:outline-none focus:border-white" />
            </div>
            <button type="button" className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition w-fit">
              Save Changes
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
