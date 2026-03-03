"use client";

import React, { useState, useEffect } from "react";
// Import standar Firebase dari library resmi
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

// Mengimpor instance app dari file konfigurasi lokal Anda
// Pastikan file ini ada di path: src/lib/firebase.ts atau sesuai struktur folder Anda
// Jika file berada di app/lib/firebase.ts, gunakan: import { app } from "../lib/firebase";
import { app } from "../lib/firebase";

/**
 * Komponen Dashboard Utama
 * Berfungsi sebagai pusat kendali untuk pelanggan SaaS Undangan Digital.
 */
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");
  const [isPro, setIsPro] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    // Inisialisasi Auth
    const auth = getAuth(app);
    
    // Memantau status login pengguna
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Mendeteksi domain secara dinamis (localhost atau domain produksi Vercel)
        if (typeof window !== 'undefined') {
          const domain = window.location.origin;
          setInvitationLink(`${domain}/undangan/tema-1?uid=${currentUser.uid}`);
        }
      } else {
        // Jika tidak login, arahkan kembali ke halaman login
        if (router) {
          router.push("/login");
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  /**
   * Fungsi untuk keluar dari akun
   */
  const handleLogout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      if (router) router.push("/login");
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  /**
   * Fungsi untuk menyalin link undangan ke clipboard
   */
  const copyInvitationLink = () => {
    if (!invitationLink) return;
    
    const textarea = document.createElement('textarea');
    textarea.value = invitationLink;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin link:', err);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  /**
   * Fungsi untuk memicu proses pembayaran
   */
  const handleUpgrade = () => {
    alert("Menghubungkan ke sistem pembayaran Midtrans... (Fitur Integrasi Minggu 8)");
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Navigasi */}
      <aside className="w-64 bg-white shadow-xl relative flex flex-col z-20">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-black text-indigo-600 tracking-tight">UndanganSaaS</h2>
          <p className="text-[10px] text-slate-400 mt-1 font-bold tracking-widest uppercase">Panel Pelanggan</p>
        </div>
        
        <nav className="mt-6 flex-1 overflow-y-auto px-4 space-y-1">
          <a href="/dashboard" className="flex items-center px-4 py-3 text-indigo-600 bg-indigo-50 rounded-lg font-bold transition-all">
            <span className="mr-3">🏠</span> Beranda
          </a>
          <a href="/dashboard/mempelai" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition">
            <span className="mr-3">👫</span> Data Mempelai
          </a>
          <a href="/dashboard/acara" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition">
            <span className="mr-3">📅</span> Detail Acara
          </a>
          <a href="/dashboard/galeri" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition">
            <span className="mr-3">🖼️</span> Galeri Foto
          </a>
          <a href="/dashboard/kado" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition">
            <span className="mr-3">🎁</span> Amplop Digital
          </a>
          <a href="/dashboard/tema" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition">
            <span className="mr-3">🎨</span> Pilih Tema
          </a>
          <a href="/dashboard/rsvp" className="flex items-center justify-between px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition">
            <div className="flex items-center">
              <span className="mr-3">📋</span> Laporan RSVP
            </div>
            <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full font-bold">GUEST</span>
          </a>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout} 
            className="w-full py-2.5 px-4 border border-red-200 text-sm font-bold rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition duration-150 flex items-center justify-center gap-2"
          >
            <span>🚪</span> Keluar Akun
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Selamat Datang! 👋</h1>
              <p className="text-slate-500 mt-2 text-lg">Kelola dan pantau undangan pernikahan digital Anda di sini.</p>
            </div>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 min-w-[240px]">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2">Status Undangan</p>
              <div className="flex items-center justify-between gap-4">
                {isPro ? (
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Aktif / Pro
                  </span>
                ) : (
                  <>
                    <span className="text-sm font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Gratis
                    </span>
                    <button 
                      onClick={handleUpgrade}
                      className="text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                      UPGRADE PRO
                    </button>
                  </>
                )}
              </div>
            </div>
          </header>
          
          {/* Card Link Undangan Premium */}
          <section className="bg-slate-900 rounded-[2rem] shadow-2xl text-white relative overflow-hidden group mb-10">
            {/* Dekorasi Latar Belakang */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
            
            <div className="relative z-10 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-400/30">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Link Undangan Live</h3>
              </div>
              
              <p className="text-slate-400 text-lg mb-8 max-w-xl">
                Bagikan link ini ke tamu Anda melalui WhatsApp atau Sosial Media. Link akan otomatis menyesuaikan domain Anda.
              </p>
              
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                <div className="flex-1 flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
                  <input 
                    type="text" 
                    readOnly 
                    value={invitationLink || "Mempersiapkan link..."}
                    className="bg-transparent flex-1 px-4 py-3 text-sm outline-none overflow-hidden text-ellipsis whitespace-nowrap font-mono text-indigo-300"
                  />
                  <button 
                    onClick={copyInvitationLink}
                    className="bg-white text-slate-900 px-8 py-3 rounded-xl text-sm font-black hover:bg-slate-100 transition active:scale-95 flex-shrink-0"
                  >
                    {copied ? "TERSALIN! ✅" : "SALIN LINK"}
                  </button>
                </div>
                
                <a 
                  href={invitationLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 border border-white/10 text-white px-8 py-4 rounded-2xl text-sm font-bold transition flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Pratinjau Undangan
                </a>
              </div>
              
              {user && (
                <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-black mb-1">USER IDENTIFIER</span>
                    <span className="text-xs text-indigo-300/60 font-mono tracking-tight">{user.uid}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                    <div className={`w-2 h-2 rounded-full ${invitationLink.includes('localhost') ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      LINGKUNGAN: {invitationLink.includes('localhost') ? 'LOKAL (DEV)' : 'PRODUKSI (VERCEL)'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Grid Informasi Fitur */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
              <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner group-hover:scale-110 transition-transform">📝</div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Lengkapi Data</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Isi informasi mempelai, lokasi acara, dan kontak penting untuk undangan Anda.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-purple-500/5 transition-all group">
              <div className="bg-purple-50 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner group-hover:scale-110 transition-transform">🎨</div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Pilih Tema</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Sesuaikan tampilan visual undangan Anda agar sesuai dengan tema pernikahan Anda.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
              <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner group-hover:scale-110 transition-transform">📊</div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Pantau RSVP</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Lihat daftar tamu yang mengonfirmasi kehadiran secara real-time melalui dashboard.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}