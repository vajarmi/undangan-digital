"use client";

import { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { app } from "../lib/firebase"; 
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Secara otomatis mendeteksi apakah sedang di localhost atau sudah di Vercel
        const domain = window.location.origin;
        setInvitationLink(`${domain}/undangan/tema-1?uid=${currentUser.uid}`);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    router.push("/login");
  };

  // Fungsi untuk menyalin link undangan
  const copyInvitationLink = () => {
    if (!invitationLink) return;
    
    const textarea = document.createElement('textarea');
    textarea.value = invitationLink;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg relative flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-extrabold text-indigo-600">UndanganSaaS</h2>
          <p className="text-xs text-gray-500 mt-1">Panel Pelanggan</p>
        </div>
        
        <nav className="mt-6 flex-1 overflow-y-auto">
          <a href="/dashboard" className="block py-3 px-6 text-indigo-600 bg-indigo-50 border-r-4 border-indigo-600 font-semibold">Beranda</a>
          <a href="/dashboard/mempelai" className="block py-3 px-6 text-gray-600 hover:bg-gray-50 transition">Data Mempelai</a>
          <a href="/dashboard/acara" className="block py-3 px-6 text-gray-600 hover:bg-gray-50 transition">Detail Acara</a>
          <a href="/dashboard/galeri" className="block py-3 px-6 text-gray-600 hover:bg-gray-50 transition">Galeri Foto</a>
          <a href="/dashboard/kado" className="block py-3 px-6 text-gray-600 hover:bg-gray-50 transition">Amplop Digital</a>
          <a href="/dashboard/tema" className="block py-3 px-6 text-gray-600 hover:bg-gray-50 transition">Pilih Tema</a>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full py-2 px-4 border border-red-200 text-sm font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition">Keluar</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Selamat Datang! 👋</h1>
              <p className="text-gray-500 mt-1">Kelola undangan pernikahan digital Anda di sini.</p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Status Akun</p>
              <p className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full mt-1 border border-green-100 inline-block">Aktif / Pro</p>
            </div>
          </div>
          
          {/* Card Link Undangan (Otomatis deteksi Vercel/Local) */}
          <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-110"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-400/30 p-1.5 rounded-lg">🚀</span>
                <h3 className="text-xl font-bold">Link Undangan Live</h3>
              </div>
              <p className="text-indigo-100 text-sm mb-6 opacity-90 max-w-md">Setelah Anda melakukan <b>Push ke GitHub</b>, link di bawah ini akan otomatis berubah menjadi domain Vercel Anda.</p>
              
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="flex-1 flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-white/20 backdrop-blur-md">
                  <input 
                    type="text" 
                    readOnly 
                    value={invitationLink || "Memuat link..."}
                    className="bg-transparent flex-1 px-3 py-2 text-sm outline-none overflow-hidden text-ellipsis whitespace-nowrap font-mono"
                  />
                  <button 
                    onClick={copyInvitationLink}
                    className="bg-white text-indigo-700 px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition active:scale-95 flex-shrink-0 shadow-lg"
                  >
                    {copied ? "Tersalin! ✅" : "Salin Link"}
                  </button>
                </div>
                
                <a 
                  href={invitationLink} 
                  target="_blank" 
                  className="bg-indigo-500/30 hover:bg-indigo-500/50 border border-white/30 text-white px-6 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Lihat Hasil
                </a>
              </div>
              
              {user && (
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                  <p className="text-[10px] text-indigo-200/60 font-mono tracking-wider uppercase">
                    USER ID: {user.uid}
                  </p>
                  <p className="text-[10px] text-indigo-200/60 font-mono tracking-wider uppercase">
                    ENVIRONMENT: {invitationLink.includes('localhost') ? 'Development' : 'Production'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-xl">📝</div>
              <div>
                <h4 className="font-bold text-gray-800">Isi Data</h4>
                <p className="text-xs text-gray-500 mt-1">Lengkapi info mempelai dan detail acara Anda.</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="bg-purple-50 p-3 rounded-xl text-xl">🎨</div>
              <div>
                <h4 className="font-bold text-gray-800">Pilih Tema</h4>
                <p className="text-xs text-gray-500 mt-1">Sesuaikan desain undangan dengan selera Anda.</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="bg-green-50 p-3 rounded-xl text-xl">📤</div>
              <div>
                <h4 className="font-bold text-gray-800">Sebarkan</h4>
                <p className="text-xs text-gray-500 mt-1">Salin link dan kirim ke keluarga dan kerabat.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}