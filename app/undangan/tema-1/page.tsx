"use client";

import { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

/**
 * PERBAIKAN TOTAL UNTUK VS CODE:
 * Kami sekarang mengimpor langsung dari file koneksi Firebase Anda (lib/firebase.ts).
 * Ini akan menghilangkan semua garis merah "Cannot find name" di VS Code Anda.
 */
import { app, db } from "../../lib/firebase";

export default function TemaSatuPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // State Data dari Database
  const [dataMempelai, setDataMempelai] = useState<any>(null);
  const [dataAcara, setDataAcara] = useState<any>(null);
  const [dataGaleri, setDataGaleri] = useState<any>(null);

  // State Waktu (Countdown)
  const [timeLeft, setTimeLeft] = useState({ hari: 0, jam: 0, menit: 0, detik: 0 });

  // Fungsi Pembersih Link Foto Google Drive
  const fixGdriveLink = (url: any): string => {
    if (!url || typeof url !== 'string') return "";
    if (url.includes("drive.google.com")) {
      const match = url.match(/\/file\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
      const fileId = match ? match[1] : null;
      if (fileId) return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
    return url;
  };

  // 1. LOGIKA AUTENTIKASI (Hanya menggunakan Firebase Auth standar)
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // Jika belum login di komputer lokal, coba masuk secara anonim agar bisa baca data
        signInAnonymously(auth).catch((err) => console.error("Gagal login anonim:", err));
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. LOGIKA PENARIKAN DATA (Menggunakan struktur folder Dashboard Anda)
  useEffect(() => {
    if (!userId) return;

    // Menarik data dari folder: users > [UID] > dataPernikahan > [koleksi]
    // Ini adalah struktur yang Anda buat di dashboard/mempelai dan dashboard/acara
    const mRef = doc(db, "users", userId, "dataPernikahan", "mempelai");
    const aRef = doc(db, "users", userId, "dataPernikahan", "acara");
    const gRef = doc(db, "users", userId, "dataPernikahan", "galeri");

    const unsubM = onSnapshot(mRef, (snap) => snap.exists() && setDataMempelai(snap.data()));
    const unsubA = onSnapshot(aRef, (snap) => snap.exists() && setDataAcara(snap.data()));
    const unsubG = onSnapshot(gRef, (snap) => {
      if (snap.exists()) setDataGaleri(snap.data());
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error:", err);
      setLoading(false);
    });

    return () => {
      unsubM();
      unsubA();
      unsubG();
    };
  }, [userId]);

  // 3. LOGIKA COUNTDOWN
  useEffect(() => {
    const timer = setInterval(() => {
      const target = dataAcara?.akad?.tanggal || "2026-12-31";
      const targetTime = new Date(`${target}T08:00:00`).getTime();
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff > 0) {
        setTimeLeft({
          hari: Math.floor(diff / (1000 * 60 * 60 * 24)),
          jam: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          menit: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          detik: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [dataAcara]);

  // Handle Musik
  const handleOpenInvitation = () => {
    setIsOpen(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => console.log("Musik diblokir browser, butuh interaksi user"));
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMuted) audioRef.current.play();
      else audioRef.current.pause();
      setIsMuted(!isMuted);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-stone-50 font-serif italic text-stone-400 animate-pulse">
      Menyiapkan Undangan Pro...
    </div>
  );

  // Data Fallback (Agar tidak kosong jika database belum diisi)
  const pria = dataMempelai?.pria || { namaPanggilan: "Romeo", namaLengkap: "Romeo Montague", namaAyah: "Lord Montague", namaIbu: "Lady Montague" };
  const wanita = dataMempelai?.wanita || { namaPanggilan: "Juliet", namaLengkap: "Juliet Capulet", namaAyah: "Lord Capulet", namaIbu: "Lady Capulet" };
  const akad = dataAcara?.akad || { tanggal: "2026-12-31", waktu: "08:00", lokasi: "Gedung Pernikahan" };
  const resepsi = dataAcara?.resepsi || { tanggal: "2026-12-31", waktu: "11:00", lokasi: "Ballroom Hotel" };
  const fotoUtama = fixGdriveLink(dataGaleri?.fotoUtama) || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80";

  // SAMPUL DEPAN
  if (!isOpen) {
    return (
      <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-stone-900 text-white">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 scale-110" style={{ backgroundImage: `url('${fotoUtama}')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
        <div className="relative z-10 text-center px-6">
          <p className="text-white/70 tracking-[0.5em] text-xs uppercase mb-6 animate-pulse">The Wedding Of</p>
          <h1 className="text-6xl md:text-9xl font-serif italic mb-6 drop-shadow-2xl">
            {pria.namaPanggilan} & {wanita.namaPanggilan}
          </h1>
          <p className="mb-12 font-light tracking-widest text-lg border-y border-white/20 py-2 inline-block px-8 italic">
            {new Date(akad.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <br/>
          <button onClick={handleOpenInvitation} className="bg-white text-stone-900 px-12 py-4 rounded-full font-serif italic text-xl shadow-2xl hover:bg-stone-100 transition-all flex items-center gap-3 mx-auto">
             Buka Undangan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-stone-800 font-sans overflow-x-hidden">
      <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" loop />
      <button onClick={toggleMusic} className="fixed bottom-6 right-6 z-50 bg-white/80 p-4 rounded-full shadow-xl">
        {isMuted ? "🔇" : "🎵"}
      </button>

      {/* 1. Pembuka */}
      <section className="py-24 px-6 text-center bg-stone-50/50">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-serif italic text-3xl text-stone-700 font-bold">Assalamu’alaikum Wr. Wb.</h2>
          <p className="text-stone-500 font-light leading-relaxed italic">
            Maha Suci Allah yang telah menciptakan mahluk-Nya berpasang-pasangan. Ya Allah, perkenankanlah kami merangkaikan kasih sayang yang Kau ciptakan dalam pernikahan kami:
          </p>
        </div>
      </section>

      {/* 2. Profil */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center text-center">
          <div>
            <div className="w-48 h-64 rounded-t-full overflow-hidden border-4 border-stone-50 shadow-2xl mb-8 mx-auto">
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80" className="w-full h-full object-cover grayscale" alt="Pria" />
            </div>
            <h3 className="text-4xl font-serif italic mb-3">{pria.namaLengkap}</h3>
            <p className="text-stone-500">Putra dari Bpk. {pria.namaAyah} & Ibu {pria.namaIbu}</p>
          </div>
          <div className="text-8xl font-serif italic text-stone-100 hidden md:block">&</div>
          <div>
            <div className="w-48 h-64 rounded-t-full overflow-hidden border-4 border-stone-50 shadow-2xl mb-8 mx-auto">
              <img src="https://images.unsplash.com/photo-1511108690759-009324a90311?q=80" className="w-full h-full object-cover grayscale" alt="Wanita" />
            </div>
            <h3 className="text-4xl font-serif italic mb-3">{wanita.namaLengkap}</h3>
            <p className="text-stone-500">Putri dari Bpk. {wanita.namaAyah} & Ibu {wanita.namaIbu}</p>
          </div>
        </div>
      </section>

      {/* 3. Countdown */}
      <section className="py-20 bg-stone-900 text-white text-center">
        <div className="flex justify-center gap-6 md:gap-12">
          {[
            { label: "Hari", val: timeLeft.hari },
            { label: "Jam", val: timeLeft.jam },
            { label: "Menit", val: timeLeft.menit },
            { label: "Detik", val: timeLeft.detik }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-4xl md:text-7xl font-serif">{item.val}</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-500 mt-2">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Agenda Acara */}
      <section className="py-32 px-6 bg-stone-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 text-center">
          <div className="bg-white p-12 rounded-3xl shadow-xl border border-stone-100">
            <h3 className="text-2xl font-serif mb-6">Akad Nikah</h3>
            <p className="font-bold text-xl">{new Date(akad.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="italic mb-6">Pukul {akad.waktu} WIB</p>
            <p className="text-sm uppercase tracking-widest text-stone-500">{akad.lokasi}</p>
          </div>
          <div className="bg-white p-12 rounded-3xl shadow-xl border border-stone-100">
            <h3 className="text-2xl font-serif mb-6">Resepsi</h3>
            <p className="font-bold text-xl">{new Date(resepsi.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="italic mb-6">Pukul {resepsi.waktu} WIB</p>
            <p className="text-sm uppercase tracking-widest text-stone-500">{resepsi.lokasi}</p>
          </div>
        </div>
      </section>

      {/* 5. Galeri */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif italic text-center mb-16">Galeri Kenangan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="col-span-2 row-span-2 rounded-3xl overflow-hidden h-[400px] md:h-[650px] shadow-2xl group">
              <img src={fotoUtama} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" alt="Utama" />
            </div>
            {[dataGaleri?.fotoGaleri1, dataGaleri?.fotoGaleri2, dataGaleri?.fotoGaleri3].map((f, i) => f && (
              <div key={i} className={`rounded-3xl overflow-hidden shadow-xl h-[190px] md:h-[315px] group ${i === 2 ? 'col-span-2' : ''}`}>
                <img src={fixGdriveLink(f)} className="w-full h-full object-cover group-hover:scale-110 duration-1000" alt="Galeri" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-20 text-center bg-stone-50 border-t border-stone-100">
        <p className="text-stone-400 text-[10px] tracking-[0.4em] uppercase mb-4">© 2026 {pria.namaPanggilan} & {wanita.namaPanggilan}</p>
      </footer>
    </div>
  );
}