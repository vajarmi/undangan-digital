"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
// Jalur disesuaikan kembali agar dapat mendeteksi folder lib Anda
import { app, db } from "../../lib/firebase";

export default function TemaSatuPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State untuk menyimpan data dari Database
  const [dataMempelai, setDataMempelai] = useState<any>(null);
  const [dataAcara, setDataAcara] = useState<any>(null);
  const [dataGaleri, setDataGaleri] = useState<any>(null);

  // State untuk Hitung Mundur
  const [timeLeft, setTimeLeft] = useState({ hari: 0, jam: 0, menit: 0, detik: 0 });

  // Fungsi untuk memperbaiki Link Google Drive agar bisa tampil sebagai gambar
  const fixGdriveLink = (url: string) => {
    if (!url) return "";
    if (url.includes("drive.google.com")) {
      return url.replace("/file/d/", "/uc?export=view&id=").replace("/view?usp=sharing", "").replace("/view", "");
    }
    return url;
  };

  useEffect(() => {
    const auth = getAuth(app);
    
    // 1. Ambil Data dari Firestore
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const mRef = doc(db, "users", user.uid, "dataPernikahan", "mempelai");
          const aRef = doc(db, "users", user.uid, "dataPernikahan", "acara");
          const gRef = doc(db, "users", user.uid, "dataPernikahan", "galeri");

          const [mSnap, aSnap, gSnap] = await Promise.all([
            getDoc(mRef), getDoc(aRef), getDoc(gRef)
          ]);

          if (mSnap.exists()) setDataMempelai(mSnap.data());
          if (aSnap.exists()) setDataAcara(aSnap.data());
          if (gSnap.exists()) setDataGaleri(gSnap.data());

        } catch (error) {
          console.error("Gagal mengambil data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    // 2. Logika Hitung Mundur (Countdown)
    const timer = setInterval(() => {
      const targetStr = dataAcara?.akad?.tanggal || "2026-12-31";
      const targetDate = new Date(`${targetStr}T08:00:00`).getTime();
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          hari: Math.floor(distance / (1000 * 60 * 60 * 24)),
          jam: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          menit: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          detik: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => {
      unsubscribeAuth();
      clearInterval(timer);
    };
  }, [dataAcara]);

  // Layar Loading
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-stone-50 font-serif italic text-stone-400 animate-pulse">
      Menyiapkan Undangan Spesial...
    </div>
  );

  // Variabel Data Terpusat dengan Fallback Data Default
  const pria = dataMempelai?.pria || { namaPanggilan: "Romeo", namaLengkap: "Romeo Montague", namaAyah: "Lord Montague", namaIbu: "Lady Montague" };
  const wanita = dataMempelai?.wanita || { namaPanggilan: "Juliet", namaLengkap: "Juliet Capulet", namaAyah: "Lord Capulet", namaIbu: "Lady Capulet" };
  const acaraAkad = dataAcara?.akad || { tanggal: "2026-12-31", waktu: "08:00", lokasi: "Kediaman Mempelai Wanita" };
  const acaraResepsi = dataAcara?.resepsi || { tanggal: "2026-12-31", waktu: "11:00", lokasi: "Gedung Ballroom Cinta" };
  const fotoUtama = fixGdriveLink(dataGaleri?.fotoUtama) || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80";

  // TAMPILAN 1: SAMPUL DEPAN (Hero Section)
  if (!isOpen) {
    return (
      <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url('${fotoUtama}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
        <div className="relative z-10 text-center px-4 flex flex-col items-center">
          <p className="text-white/80 tracking-[0.3em] text-sm uppercase mb-4 animate-pulse">The Wedding Of</p>
          <h1 className="text-6xl md:text-8xl font-serif italic text-white mb-2 drop-shadow-lg">
            {pria.namaPanggilan} & {wanita.namaPanggilan}
          </h1>
          <p className="text-white/90 font-light tracking-wider mt-4 mb-10 text-lg">{acaraAkad.tanggal}</p>
          <button 
            onClick={() => setIsOpen(true)} 
            className="group bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/50 text-white px-8 py-3 rounded-full transition-all duration-300 flex items-center gap-3 shadow-lg"
          >
            <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M14 7h3m0 0v3m0-3l-3 3M5 11l7-5 7 5m-7-3v12" />
            </svg>
            Buka Undangan
          </button>
        </div>
      </div>
    );
  }

  // TAMPILAN 2: ISI UNDANGAN UTAMA
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans overflow-x-hidden">
      
      {/* 1. Salam Pembuka */}
      <section className="py-20 px-6 text-center bg-stone-50">
        <div className="max-w-2xl mx-auto">
          <p className="font-serif italic text-2xl text-stone-600 mb-6 font-bold">Assalamu’alaikum Warahmatullahi Wabarakatuh</p>
          <p className="text-stone-500 leading-relaxed">
            Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i serta kerabat sekalian untuk menghadiri acara pernikahan kami:
          </p>
        </div>
      </section>

      {/* 2. Profil Mempelai (Tata Letak 3 Kolom) */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center">
          {/* Mempelai Pria */}
          <div className="order-1 flex flex-col items-center">
            <div className="w-48 h-64 bg-stone-200 rounded-t-full overflow-hidden mb-6 border-4 border-stone-100 shadow-inner">
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Pria" />
            </div>
            <h2 className="text-4xl font-serif italic text-stone-800 mb-2">{pria.namaLengkap}</h2>
            <p className="text-stone-500 text-sm">Putra dari:</p>
            <p className="font-medium text-stone-700">{pria.namaAyah} & {pria.namaIbu}</p>
          </div>

          {/* Simbol & */}
          <div className="order-2 py-4 md:py-0">
            <span className="font-serif text-5xl md:text-7xl text-stone-200 italic">&</span>
          </div>

          {/* Mempelai Wanita */}
          <div className="order-3 flex flex-col items-center">
            <div className="w-48 h-64 bg-stone-200 rounded-t-full overflow-hidden mb-6 border-4 border-stone-100 shadow-inner">
              <img src="https://images.unsplash.com/photo-1511108690759-009324a90311?q=80&w=400" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Wanita" />
            </div>
            <h2 className="text-4xl font-serif italic text-stone-800 mb-2">{wanita.namaLengkap}</h2>
            <p className="text-stone-500 text-sm">Putri dari:</p>
            <p className="font-medium text-stone-700">{wanita.namaAyah} & {wanita.namaIbu}</p>
          </div>
        </div>
      </section>

      {/* 3. Hitung Mundur (Countdown) */}
      <section className="py-16 bg-stone-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-serif italic mb-10 tracking-widest text-stone-300">Menuju Hari Bahagia</h2>
          <div className="grid grid-cols-4 gap-4 md:gap-8">
            <div className="flex flex-col"><span className="text-4xl md:text-6xl font-serif">{timeLeft.hari}</span><span className="text-xs uppercase text-stone-400">Hari</span></div>
            <div className="flex flex-col"><span className="text-4xl md:text-6xl font-serif">{timeLeft.jam}</span><span className="text-xs uppercase text-stone-400">Jam</span></div>
            <div className="flex flex-col"><span className="text-4xl md:text-6xl font-serif">{timeLeft.menit}</span><span className="text-xs uppercase text-stone-400">Menit</span></div>
            <div className="flex flex-col"><span className="text-4xl md:text-6xl font-serif">{timeLeft.detik}</span><span className="text-xs uppercase text-stone-400">Detik</span></div>
          </div>
        </div>
      </section>

      {/* 4. Detail Acara (Waktu & Tempat) */}
      <section className="py-24 px-6 bg-white max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-serif italic text-stone-800 mb-16 underline underline-offset-8 decoration-stone-200">Waktu & Tempat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-stone-600">
          <div className="p-10 border border-stone-100 bg-stone-50 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-serif mb-6 text-stone-700">Akad Nikah</h3>
            <p className="font-bold text-xl">{acaraAkad.tanggal}</p>
            <p className="italic font-medium">Pukul {acaraAkad.waktu} WIB</p>
            <hr className="w-1/4 mx-auto border-stone-200 my-4" />
            <p className="font-bold uppercase tracking-widest text-sm">{acaraAkad.lokasi}</p>
            <a href={dataAcara?.linkMaps || "#"} target="_blank" className="inline-block mt-6 px-6 py-2 bg-stone-800 text-white text-sm rounded-full hover:bg-stone-700 transition">Lihat Lokasi</a>
          </div>
          <div className="p-10 border border-stone-100 bg-stone-50 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-serif mb-6 text-stone-700">Resepsi</h3>
            <p className="font-bold text-xl">{acaraResepsi.tanggal}</p>
            <p className="italic font-medium">Pukul {acaraResepsi.waktu} WIB</p>
            <hr className="w-1/4 mx-auto border-stone-200 my-4" />
            <p className="font-bold uppercase tracking-widest text-sm">{acaraResepsi.lokasi}</p>
            <a href={dataAcara?.linkMaps || "#"} target="_blank" className="inline-block mt-6 px-6 py-2 bg-stone-800 text-white text-sm rounded-full hover:bg-stone-700 transition">Lihat Lokasi</a>
          </div>
        </div>
      </section>

      {/* 5. Galeri Foto Kolase */}
      <section className="py-24 px-6 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif italic text-stone-800 mb-4">Galeri Bahagia</h2>
            <p className="text-stone-500 italic font-serif">Kisah dalam setiap bingkai foto</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 row-span-2 overflow-hidden rounded-xl h-[400px] md:h-[600px] shadow-lg">
              <img src={fotoUtama} className="w-full h-full object-cover transition duration-700 hover:scale-110" alt="Utama" />
            </div>
            {dataGaleri?.fotoGaleri1 && (
              <div className="overflow-hidden rounded-xl h-[200px] md:h-[290px] shadow-lg">
                <img src={fixGdriveLink(dataGaleri.fotoGaleri1)} className="w-full h-full object-cover transition duration-700 hover:scale-110" alt="G1" />
              </div>
            )}
            {dataGaleri?.fotoGaleri2 && (
              <div className="overflow-hidden rounded-xl h-[200px] md:h-[290px] shadow-lg">
                <img src={fixGdriveLink(dataGaleri.fotoGaleri2)} className="w-full h-full object-cover transition duration-700 hover:scale-110" alt="G2" />
              </div>
            )}
            {dataGaleri?.fotoGaleri3 && (
              <div className="overflow-hidden rounded-xl h-[200px] md:h-[290px] shadow-lg">
                <img src={fixGdriveLink(dataGaleri.fotoGaleri3)} className="w-full h-full object-cover transition duration-700 hover:scale-110" alt="G3" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer Navigasi */}
      <footer className="py-10 text-center text-stone-400 text-sm border-t bg-stone-50">
        <button onClick={() => setIsOpen(false)} className="underline italic hover:text-stone-600 transition-colors">Tutup Sampul</button>
        <p className="mt-4">&copy; 2026 {pria.namaPanggilan} & {wanita.namaPanggilan} Wedding</p>
      </footer>
    </div>
  );
}