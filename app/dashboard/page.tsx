"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  
  // Data State
  const [leads, setLeads] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // Workflow State
  const [activeClient, setActiveClient] = useState<string>("");
  const [aiMessage, setAiMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // UI State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newStatus, setNewStatus] = useState("Pending Follow-up");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "Jobber_Connected") {
      showToast("Jobber successfully connected!", "success");
      window.history.replaceState({}, document.title, "/dashboard"); 
    } else if (params.get("error")) {
      showToast("Failed to connect Jobber: " + params.get("error"), "error");
      window.history.replaceState({}, document.title, "/dashboard");
    }

    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLeads = async () => {
    setIsFetching(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (data) setLeads(data);
    setIsFetching(false);
  };

  // --- JOBBER CONNECTION FUNCTION ---
  const handleConnectJobber = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast("You must be logged in to connect Jobber.", "error");
      return;
    }
    
    const clientId = process.env.NEXT_PUBLIC_JOBBER_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/jobber/callback`);
    const jobberAuthUrl = `https://api.getjobber.com/api/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${user.id}`;
    
    window.location.href = jobberAuthUrl;
  };

  // --- TEST FETCH QUOTES FUNCTION ---
  const handleTestFetchQuotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast("Nisi ulogovan! Osveži stranicu i uloguj se ponovo.", "error");
      return;
    }

    showToast("Fetching quotes from Jobber...", "success");

    try {
      const response = await fetch("/api/jobber/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await response.json();
      
      if (data.success) {
         if (data.quotes?.errors) {
           alert("JOBBER GREŠKA: " + JSON.stringify(data.quotes.errors[0].message));
           return;
         }

         const quotes = data.quotes?.data?.quotes?.nodes;
         
         if (quotes && quotes.length > 0) {
           alert(`Success! Found quote #${quotes[0].quoteNumber} for ${quotes[0].client.name}.\nTotal: $${quotes[0].amounts.total}\nLine Item: ${quotes[0].lineItems.nodes[0]?.name}`);
         } else {
           alert("Jobber odgovor nema predračuna! Evo šta je Jobber poslao:\n\n" + JSON.stringify(data.quotes).substring(0, 500));
         }
      } else {
        showToast(data.error || "Failed to fetch quotes", "error");
      }
    } catch (error) {
      showToast("Network error", "error");
    }
  };
  
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      showToast("You must be logged in to do this.", "error");
      setIsSaving(false);
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("leads").insert([
      { name: newName, email: newEmail, status: newStatus, notes: newNotes, user_id: user.id }
    ]);

    if (error) {
      showToast("Failed to add lead. Please try again.", "error");
    } else {
      setNewName("");
      setNewEmail("");
      setNewStatus("Pending Follow-up");
      setNewNotes("");
      setIsAddModalOpen(false);
      showToast("Lead added successfully.", "success");
      fetchLeads();
    }
    setIsSaving(false);
  };

  const handleDraftFollowup = async (lead: any) => {
    setActiveClient(lead.name);
    setIsModalOpen(true);
    setIsGenerating(true);
    setAiMessage("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: lead.name,
          notes: lead.notes || "No context provided."
        }),
      });
      const data = await response.json();
      setAiMessage(data.message || "Error generating draft.");
    } catch (error) {
      setAiMessage("Network error occurred while connecting to AI.");
      showToast("Failed to connect to AI.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const currentLead = leads.find(l => l.name === activeClient);
      const clientEmail = currentLead ? currentLead.email : "test@example.com";

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: clientEmail,
          name: activeClient,
          message: aiMessage,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        await supabase
          .from("leads")
          .update({ status: "Contacted" })
          .eq("id", currentLead?.id);
          
        fetchLeads();
        setIsModalOpen(false);
        showToast(`Email sent securely to ${clientEmail}`, "success");
      } else {
        showToast(data.error || "Failed to send email.", "error");
      }
    } catch (error: any) {
      showToast("Network error. Please check your connection.", "error");
    } finally {
      setIsSending(false);
    }
  };

  const pendingLeads = leads.filter(l => l.status?.toLowerCase().includes("pending"));
  const otherLeads = leads.filter(l => !l.status?.toLowerCase().includes("pending"));

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans flex flex-col md:flex-row antialiased selection:bg-white selection:text-black">
      
      {/* ━━━━━━━━━━━━━━━━━━━━ MOBILE HEADER ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-900 bg-black sticky top-0 z-30">
        <div className="font-bold text-white tracking-tight">Followup AI</div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-zinc-400 hover:text-white p-1"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ SIDEBAR NAVIGATION ━━━━━━━━━━━━━━━━━━━━ */}
      <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:flex flex-col w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-900 bg-black flex-shrink-0 md:h-screen md:sticky top-0 z-20`}>
        <div className="p-6 hidden md:block">
          <h2 className="text-lg font-bold text-white tracking-tight">Followup AI</h2>
        </div>
        
        <nav className="flex-1 px-4 py-4 md:py-0 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium transition">
            <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Overview
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-900 space-y-1">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-sm font-medium transition"
          >
            <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ━━━━━━━━━━━━━━━━━━━━ MAIN DASHBOARD CONTENT ━━━━━━━━━━━━━━━━━━━━ */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-6xl mx-auto w-full">
        
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-zinc-400 mt-1">Here's what needs your attention today.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConnectJobber}
              className="bg-green-600/10 border border-green-600/30 text-green-500 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600/20 transition shadow-sm whitespace-nowrap w-full sm:w-auto text-center"
            >
              Connect Jobber
            </button>
            <button
              onClick={handleTestFetchQuotes}
              className="bg-blue-600/10 border border-blue-600/30 text-blue-500 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600/20 transition shadow-sm whitespace-nowrap w-full sm:w-auto text-center"
            >
              Test Fetch Quotes
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-white text-black px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition shadow-sm whitespace-nowrap w-full sm:w-auto text-center"
            >
              + Add New Lead
            </button>
          </div>
        </header>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-10 md:mb-12">
          <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 md:p-5 rounded-xl">
            <p className="text-[10px] md:text-xs font-semibold text-zinc-500 tracking-wider uppercase mb-1">Total Leads</p>
            <p className="text-2xl md:text-3xl font-bold text-white">{leads.length}</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 md:p-5 rounded-xl">
            <p className="text-[10px] md:text-xs font-semibold text-zinc-500 tracking-wider uppercase mb-1">Follow-ups Due</p>
            <p className="text-2xl md:text-3xl font-bold text-white">{pendingLeads.length}</p>
          </div>
        </div>

        {/* LEADS TABLE */}
        {leads.length > 0 && (
          <div className="mt-8 md:mt-12">
            <h2 className="text-xl font-semibold mb-4 md:mb-6 text-white tracking-tight">Pending Follow-ups</h2>
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-black/50 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300 whitespace-nowrap md:whitespace-normal">
                  <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="px-5 py-4 font-medium">Client</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                      <th className="px-5 py-4 font-medium">Details</th>
                      <th className="px-5 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-white">{lead.name}</td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-500 rounded-md text-xs font-medium border border-yellow-500/20">
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 max-w-xs truncate" title={lead.notes}>{lead.notes}</td>
                        <td className="px-5 py-4 text-right">
                          <button 
                            onClick={() => handleDraftFollowup(lead)}
                            className="px-4 py-1.5 bg-white text-black text-xs font-semibold rounded-md hover:bg-zinc-200 transition-colors shadow-sm"
                          >
                            Draft Email
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {leads.length === 0 && !isFetching && (
          <div className="border border-zinc-800 border-dashed rounded-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center bg-zinc-950/50 mt-8">
            <h3 className="text-lg font-bold text-white mb-2">No leads yet</h3>
            <p className="text-sm text-zinc-400 mb-6 max-w-sm">Connect Jobber to start recovering unsold estimates automatically.</p>
          </div>
        )}
       {/* EMAIL DRAFT MODAL */}
       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <h3 className="text-lg font-semibold text-white">
                  Follow-up for <span className="text-blue-400">{activeClient}</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-zinc-400">Gemini is drafting the perfect email...</p>
                  </div>
                ) : (
                  <textarea
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    className="w-full h-48 bg-black border border-zinc-800 rounded-lg p-4 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                    placeholder="Email draft will appear here..."
                  />
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={isGenerating || isSending || !aiMessage}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                >
                  {isSending ? "Sending..." : "Send Email"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}