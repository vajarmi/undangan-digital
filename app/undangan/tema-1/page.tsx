"use client";

import { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { doc, onSnapshot, collection, addDoc, serverTimestamp } from "firebase/firestore";
// KONEKSI ASLI DARI PROYEK ANDA
import { app, db } from "../../lib/firebase";

export default function TemaSatuBaruPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Audio & UI
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [namaTamu, setNamaTamu] = useState("Tamu Kehormatan");

  // State Data Master
  const [dataMempelai, setDataMempelai] = useState<any>(null);
  const [dataAcara, setDataAcara] = useState<any>(null);
  const [dataGaleri, setDataGaleri] = useState<any>(null);
  const [dataKado, setDataKado] = useState<any>(null);

  // Fitur
  const [timeLeft, setTimeLeft] = useState({ hari: 0, jam: 0, menit: 0, detik: 0 });
  const [ucapanList, setUcapanList] = useState<any[]>([]);
  const [formRsvp, setFormRsvp] = useState({ nama: "", kehadiran: "Hadir", ucapan: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FUNGSI PENDUKUNG ---
  // Fix Google Drive Images
  const fixGdriveLink = (url: any): string => {
    if (!url || typeof url !== 'string') return "";
    if (url.includes("drive.google.com")) {
      const match = url.match(/\/file\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
      return match && match[1] ? `https://lh3.googleusercontent.com/d/${match[1]}` : url;
    }
    return url;
  };

  // Fungsi Copy Clipboard
  const copyToClipboard = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert(`Berhasil disalin: ${text}`);
  };

  // Ambil Nama Tamu dari URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const to = params.get("to");
      if (to) setNamaTamu(to);
    }
  }, []);

  // --- LOGIKA DATABASE (FIREBASE) ---
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        signInAnonymously(auth).catch(err => console.error("Gagal login anonim", err));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Mengambil data dari koleksi users
    const mRef = doc(db, 'users', user.uid, 'dataPernikahan', 'mempelai');
    const aRef = doc(db, 'users', user.uid, 'dataPernikahan', 'acara');
    const gRef = doc(db, 'users', user.uid, 'dataPernikahan', 'galeri');
    const kRef = doc(db, 'users', user.uid, 'dataPernikahan', 'kado');

    const unsubM = onSnapshot(mRef, (snap) => snap.exists() && setDataMempelai(snap.data()));
    const unsubA = onSnapshot(aRef, (snap) => snap.exists() && setDataAcara(snap.data()));
    const unsubK = onSnapshot(kRef, (snap) => snap.exists() && setDataKado(snap.data()));
    const unsubG = onSnapshot(gRef, (snap) => {
      if (snap.exists()) setDataGaleri(snap.data());
      setLoading(false);
    }, () => setLoading(false));

    // Menarik Data Ucapan (Real-time)
    const ucapanRef = collection(db, 'users', user.uid, 'bukuTamu');
    const unsubUcapan = onSnapshot(ucapanRef, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
      setUcapanList(data);
    });

    return () => { unsubM(); unsubA(); unsubG(); unsubK(); unsubUcapan(); };
  }, [user]);

  // --- LOGIKA COUNTDOWN ---
  useEffect(() => {
    const timer = setInterval(() => {
      const targetStr = dataAcara?.akad?.tanggal || "2026-12-31";
      const targetTime = new Date(`${targetStr}T08:00:00`).getTime();
      const diff = targetTime - new Date().getTime();

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

  // --- HANDLER INTERAKSI ---
  const handleOpen = () => {
    setIsOpen(true);
    if (audioRef.current) audioRef.current.play().catch(() => { });
  };

  const submitRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formRsvp.nama || !formRsvp.ucapan) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'bukuTamu'), {
        ...formRsvp, timestamp: serverTimestamp()
      });
      setFormRsvp({ nama: "", kehadiran: "Hadir", ucapan: "" });
      alert("Ucapan berhasil dikirim!");
    } catch (err) {
      alert("Gagal mengirim ucapan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER LOADING ---
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-amber-200">
      <div className="w-16 h-16 border-4 border-amber-200/20 border-t-amber-400 rounded-full animate-spin mb-6"></div>
      <p className="font-serif tracking-[0.3em] text-sm uppercase">Mempersiapkan Undangan</p>
    </div>
  );

  // --- FALLBACK DATA AMAN ---
  const p = {
    panggilan: String(dataMempelai?.pria?.namaPanggilan || "Romeo"),
    lengkap: String(dataMempelai?.pria?.namaLengkap || "Romeo Montague"),
    ayah: String(dataMempelai?.pria?.namaAyah || "Bpk. Montague"),
    ibu: String(dataMempelai?.pria?.namaIbu || "Ibu Montague")
  };
  const w = {
    panggilan: String(dataMempelai?.wanita?.namaPanggilan || "Juliet"),
    lengkap: String(dataMempelai?.wanita?.namaLengkap || "Juliet Capulet"),
    ayah: String(dataMempelai?.wanita?.namaAyah || "Bpk. Capulet"),
    ibu: String(dataMempelai?.wanita?.namaIbu || "Ibu Capulet")
  };
  const akad = {
    tanggal: String(dataAcara?.akad?.tanggal || "2026-12-31"),
    waktu: String(dataAcara?.akad?.waktu || "08:00"),
    lokasi: String(dataAcara?.akad?.lokasi || "Masjid Agung Raya")
  };
  const resepsi = {
    tanggal: String(dataAcara?.resepsi?.tanggal || "2026-12-31"),
    waktu: String(dataAcara?.resepsi?.waktu || "11:00"),
    lokasi: String(dataAcara?.resepsi?.lokasi || "Grand Ballroom Hotel")
  };
  
  // Data Kado (Amplop Digital)
  const r1 = dataKado?.rekening1 || { bank: "BCA", noRekening: "1234567890", atasNama: p.lengkap };
  const r2 = dataKado?.rekening2 || { bank: "MANDIRI", noRekening: "0987654321", atasNama: w.lengkap };

  const fotoUtama = fixGdriveLink(dataGaleri?.fotoUtama) || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80";

  // =========================================================================
  // TAMPILAN 1: COVER (AMPLOP DEPAN) - MIDNIGHT ELEGANCE
  // =========================================================================
  if (!isOpen) {
    return (
      <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 scale-105" style={{ backgroundImage: `url('${fotoUtama}')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950"></div>

        <svg className="absolute top-10 right-10 w-32 h-32 text-amber-500/30 opacity-50" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0 C60 30 90 40 100 50 C90 60 60 70 50 100 C40 70 10 60 0 50 C10 40 40 30 50 0 Z" />
        </svg>
        <svg className="absolute bottom-10 left-10 w-40 h-40 text-amber-500/30 opacity-50" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0 C60 30 90 40 100 50 C90 60 60 70 50 100 C40 70 10 60 0 50 C10 40 40 30 50 0 Z" />
        </svg>

        <div className="relative z-10 text-center px-6 flex flex-col items-center">
          <p className="text-amber-300/80 tracking-[0.4em] text-xs uppercase mb-6 font-light">The Wedding Celebration Of</p>

          <h1 className="text-6xl md:text-8xl font-serif text-amber-50 mb-4 drop-shadow-xl" style={{ textShadow: "0 2px 15px rgba(251, 191, 36, 0.2)" }}>
            {w.panggilan} & {p.panggilan}
          </h1>

          <div className="w-24 h-[1px] bg-amber-400/50 my-6"></div>

          <p className="text-slate-200 font-light tracking-widest text-lg uppercase mb-12">
            {new Date(akad.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>

          <div className="bg-slate-900/50 backdrop-blur-md border border-amber-500/30 rounded-lg p-6 mb-10 w-full max-w-sm shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Dear, Mr/Mrs/Ms</p>
            <p className="text-amber-100 text-xl font-serif">{namaTamu}</p>
          </div>

          <button onClick={handleOpen} className="group bg-amber-600 hover:bg-amber-500 text-slate-950 px-10 py-4 rounded-md font-sans uppercase tracking-widest text-sm font-bold shadow-[0_0_20px_rgba(217,119,6,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
            Open Invitation
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TAMPILAN 2: ISI UNDANGAN
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-200 selection:text-slate-900">

      {/* Musik Kontrol */}
      <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" loop />
      <button onClick={() => {
        if (audioRef.current) {
          isMuted ? audioRef.current.play() : audioRef.current.pause();
          setIsMuted(!isMuted);
        }
      }}
        className="fixed bottom-6 right-6 z-50 bg-slate-900 text-amber-400 p-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] border border-amber-500/20 hover:scale-110 transition-transform"
      >
        {isMuted ? "🔇" : "🎵"}
      </button>

      {/* 1. INTRO (Ayat Suci / Quote) */}
      <section className="py-32 px-6 text-center bg-slate-950 text-slate-200 relative overflow-hidden">
        <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 text-slate-800 opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 0 Q50 100 100 0 Z" fill="currentColor" /></svg>
        <div className="max-w-2xl mx-auto relative z-10 mt-10">
          <p className="text-amber-500 font-serif text-3xl mb-8">﷽</p>
          <p className="leading-relaxed font-light text-lg italic text-slate-300">
            "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya..."
          </p>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500/70 mt-6">(QS. Ar-Rum: 21)</p>
        </div>
      </section>

      {/* 2. PROFIL MEMPELAI */}
      <section className="py-32 px-6 bg-slate-50 relative">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4">Groom & Bride</h2>
          <div className="w-12 h-1 bg-amber-500 mx-auto"></div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center text-center">
          {/* Mempelai Wanita */}
          <div className="flex flex-col items-center group">
            <div className="w-64 h-80 rounded-t-[100px] rounded-b-md overflow-hidden p-2 border border-amber-200 bg-white shadow-xl mb-8 transform transition-transform duration-700 group-hover:-translate-y-2">
              <img src="https://images.unsplash.com/photo-1511108690759-009324a90311?q=80" className="w-full h-full object-cover rounded-t-[90px] rounded-b-sm" alt="Bride" />
            </div>
            <h3 className="text-3xl font-serif text-slate-900 mb-2">{w.lengkap}</h3>
            <p className="text-amber-600 text-xs uppercase tracking-widest mb-3 font-bold">The Bride</p>
            <p className="text-slate-500 font-light text-sm">Putri dari<br />Bpk. {w.ayah} & Ibu {w.ibu}</p>
          </div>

          {/* Pemisah (Simbol &) */}
          <div className="text-7xl font-serif text-amber-300 hidden md:block select-none animate-pulse">
            &
          </div>

          {/* Mempelai Pria */}
          <div className="flex flex-col items-center group">
            <div className="w-64 h-80 rounded-t-[100px] rounded-b-md overflow-hidden p-2 border border-amber-200 bg-white shadow-xl mb-8 transform transition-transform duration-700 group-hover:-translate-y-2">
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80" className="w-full h-full object-cover rounded-t-[90px] rounded-b-sm" alt="Groom" />
            </div>
            <h3 className="text-3xl font-serif text-slate-900 mb-2">{p.lengkap}</h3>
            <p className="text-amber-600 text-xs uppercase tracking-widest mb-3 font-bold">The Groom</p>
            <p className="text-slate-500 font-light text-sm">Putra dari<br />Bpk. {p.ayah} & Ibu {p.ibu}</p>
          </div>
        </div>
      </section>

      {/* 3. AGENDA & COUNTDOWN */}
      <section className="py-32 px-6 bg-slate-950 relative text-slate-200">
        <div className="max-w-6xl mx-auto">

          {/* Hitung Mundur */}
          <div className="mb-24 text-center">
            <h2 className="text-amber-500 text-sm tracking-[0.4em] uppercase font-bold mb-10">Menuju Hari Bahagia</h2>
            <div className="flex justify-center gap-4 md:gap-10">
              {[{ l: "Hari", v: timeLeft.hari }, { l: "Jam", v: timeLeft.jam }, { l: "Menit", v: timeLeft.menit }, { l: "Detik", v: timeLeft.detik }].map((item, i) => (
                <div key={i} className="flex flex-col items-center bg-slate-900/50 border border-slate-800 p-4 md:p-6 rounded-lg w-20 md:w-32 shadow-lg">
                  <span className="text-3xl md:text-6xl font-serif text-amber-100">{String(item.v).padStart(2, '0')}</span>
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-slate-400 mt-2">{item.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Acara */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            <div className="bg-slate-900 border border-slate-800 p-10 md:p-16 rounded-tl-[3rem] rounded-br-[3rem] text-center hover:border-amber-500/50 transition-colors">
              <div className="text-amber-500 text-4xl mb-6">💍</div>
              <h3 className="text-3xl font-serif text-amber-100 mb-4">Akad Nikah</h3>
              <p className="text-slate-400 mb-8">{new Date(akad.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<br />Pukul {akad.waktu} WIB</p>
              <div className="w-12 h-px bg-slate-700 mx-auto mb-8"></div>
              <p className="font-bold tracking-widest uppercase text-sm text-slate-300">{akad.lokasi}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-10 md:p-16 rounded-tr-[3rem] rounded-bl-[3rem] text-center hover:border-amber-500/50 transition-colors">
              <div className="text-amber-500 text-4xl mb-6">🥂</div>
              <h3 className="text-3xl font-serif text-amber-100 mb-4">Resepsi</h3>
              <p className="text-slate-400 mb-8">{new Date(resepsi.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<br />Pukul {resepsi.waktu} WIB</p>
              <div className="w-12 h-px bg-slate-700 mx-auto mb-8"></div>
              <p className="font-bold tracking-widest uppercase text-sm text-slate-300">{resepsi.lokasi}</p>
            </div>
          </div>

          {dataAcara?.linkMaps && (
            <div className="mt-16 text-center">
              <a href={dataAcara.linkMaps} target="_blank" className="inline-block bg-amber-600 hover:bg-amber-500 text-slate-950 px-10 py-4 rounded-md font-bold uppercase tracking-widest text-sm transition-all shadow-[0_4px_20px_rgba(217,119,6,0.3)]">
                Buka Google Maps
              </a>
            </div>
          )}
        </div>
      </section>

      {/* 4. GALERI FOTO */}
      <section className="py-32 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-slate-900 mb-4">Our Gallery</h2>
            <div className="w-12 h-1 bg-amber-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="col-span-2 row-span-2 overflow-hidden rounded-xl shadow-lg h-[300px] md:h-[600px] group">
              <img src={fotoUtama} className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105" alt="Utama" />
            </div>
            {[dataGaleri?.fotoGaleri1, dataGaleri?.fotoGaleri2].map((f, i) => f && (
              <div key={i} className={`overflow-hidden rounded-xl shadow-md h-[145px] md:h-[288px] group`}>
                <img src={fixGdriveLink(f)} className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105" alt={`Galeri ${i + 1}`} />
              </div>
            ))}
            {dataGaleri?.fotoGaleri3 && (
              <div className="col-span-2 md:col-span-3 overflow-hidden rounded-xl shadow-md h-[200px] md:h-[400px] group mt-2 md:mt-0">
                <img src={fixGdriveLink(dataGaleri.fotoGaleri3)} className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105 object-center" alt="Galeri 3" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. WEDDING GIFT (Amplop Digital) */}
      <section className="py-32 px-6 bg-slate-100 text-center border-y border-slate-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-serif text-slate-900 mb-6">Wedding Gift</h2>
          <p className="text-slate-500 font-light mb-12">Tanpa mengurangi rasa hormat, bagi Bapak/Ibu/Saudara/i yang ingin memberikan tanda kasih untuk kami, dapat melalui nomor rekening di bawah ini:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
             {r1 && r1.noRekening && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-800 text-lg mb-4 bg-slate-100 inline-block px-4 py-1 rounded-full">{r1.bank}</h4>
                <p className="text-slate-900 font-serif text-2xl tracking-widest mb-2">{r1.noRekening}</p>
                <p className="text-slate-500 text-sm mb-6 uppercase font-medium">A.N {r1.atasNama}</p>
                <button onClick={() => copyToClipboard(r1.noRekening)} className="bg-slate-900 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors w-full">Salin No. Rekening</button>
              </div>
            )}
            {r2 && r2.noRekening && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-800 text-lg mb-4 bg-slate-100 inline-block px-4 py-1 rounded-full">{r2.bank}</h4>
                <p className="text-slate-900 font-serif text-2xl tracking-widest mb-2">{r2.noRekening}</p>
                <p className="text-slate-500 text-sm mb-6 uppercase font-medium">A.N {r2.atasNama}</p>
                <button onClick={() => copyToClipboard(r2.noRekening)} className="bg-slate-900 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors w-full">Salin No. Rekening</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. RSVP & BUKU TAMU */}
      <section className="py-32 px-6 bg-slate-950 text-slate-200 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-amber-50 mb-4">Guest Book</h2>
            <div className="w-12 h-1 bg-amber-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Form RSVP */}
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl h-fit">
              <h3 className="font-serif text-2xl mb-6 text-amber-100">Kirim Ucapan & Doa</h3>
              <form onSubmit={submitRSVP} className="space-y-4">
                <div>
                  <input type="text" placeholder="Nama Anda" value={formRsvp.nama} onChange={e => setFormRsvp({ ...formRsvp, nama: e.target.value })} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-100 rounded-md focus:outline-none focus:border-amber-500/50" required />
                </div>
                <div>
                  <select value={formRsvp.kehadiran} onChange={e => setFormRsvp({ ...formRsvp, kehadiran: e.target.value })} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-100 rounded-md focus:outline-none focus:border-amber-500/50">
                    <option value="Hadir">Akan Hadir</option>
                    <option value="Tidak Hadir">Tidak Bisa Hadir</option>
                  </select>
                </div>
                <div>
                  <textarea placeholder="Tuliskan pesan manis untuk kami..." value={formRsvp.ucapan} onChange={e => setFormRsvp({ ...formRsvp, ucapan: e.target.value })} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-100 rounded-md focus:outline-none focus:border-amber-500/50 h-32 resize-none" required></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-amber-600 text-slate-950 font-bold uppercase tracking-widest text-sm py-4 rounded-md hover:bg-amber-500 transition-colors disabled:bg-slate-600">
                  {isSubmitting ? "Mengirim..." : "Kirim Ucapan"}
                </button>
              </form>
            </div>

            {/* List Ucapan */}
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl h-[520px] flex flex-col">
              <h3 className="font-serif text-2xl mb-6 text-amber-100">{ucapanList.length} Doa Restu</h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                {ucapanList.length === 0 ? (
                  <p className="text-slate-500 italic text-center mt-20 font-light">Jadilah yang pertama menuliskan doa.</p>
                ) : (
                  ucapanList.map((item) => (
                    <div key={item.id} className="border-b border-slate-800 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-slate-200">{item.nama}</p>
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-sm ${item.kehadiran === 'Hadir' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                          {item.kehadiran}
                        </span>
                      </div>
                      <p className="text-slate-400 font-light text-sm italic leading-relaxed">"{item.ucapan}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 text-center bg-slate-950 text-slate-400 border-t border-slate-900">
        <h2 className="text-4xl font-serif text-amber-100/50 mb-10">
          {w.panggilan} & {p.panggilan}
        </h2>
        <button onClick={() => { setIsOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mb-10 text-xs uppercase tracking-widest border border-slate-800 px-6 py-2 rounded-md hover:bg-slate-800 transition-colors">
          Kembali ke Awal
        </button>
        <p className="text-[10px] tracking-[0.3em] uppercase opacity-50">
          © 2026 Crafted with Love
        </p>
      </footer>

      {/* Custom Scrollbar for Guestbook */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
}