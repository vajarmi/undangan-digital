"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
// Pastikan path ke file firebase sudah benar sesuai proyek Anda
import { app, db } from "../../lib/firebase"; 
import { useRouter } from "next/navigation";

export default function AcaraPage() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // State untuk form Akad dengan nilai default string kosong
  const [akadTanggal, setAkadTanggal] = useState("");
  const [akadWaktu, setAkadWaktu] = useState("");
  const [akadLokasi, setAkadLokasi] = useState("");

  // State untuk form Resepsi dengan nilai default string kosong
  const [resepsiTanggal, setResepsiTanggal] = useState("");
  const [resepsiWaktu, setResepsiWaktu] = useState("");
  const [resepsiLokasi, setResepsiLokasi] = useState("");

  const [linkMaps, setLinkMaps] = useState("");

  // Autentikasi dan Mengambil Data Lama
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          // Path disamakan dengan struktur pengambilan data di Tema 1
          const docRef = doc(db, "users", user.uid, "dataPernikahan", "acara");
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Mencegah error 'Objects are not valid as a React child' 
            // dengan memaksa nilai menjadi string.
            if (data.akad) {
              setAkadTanggal(String(data.akad.tanggal || ""));
              setAkadWaktu(String(data.akad.waktu || ""));
              setAkadLokasi(String(data.akad.lokasi || ""));
            }
            if (data.resepsi) {
              setResepsiTanggal(String(data.resepsi.tanggal || ""));
              setResepsiWaktu(String(data.resepsi.waktu || ""));
              setResepsiLokasi(String(data.resepsi.lokasi || ""));
            }
            setLinkMaps(String(data.linkMaps || ""));
          }
        } catch (error) {
          console.error("Gagal mengambil data acara:", error);
        }
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Simpan Data
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("Sesi Anda telah berakhir, silakan login ulang.");
      return;
    }

    setLoading(true);
    try {
      // Menyimpan ke path: users/{userId}/dataPernikahan/acara
      const docRef = doc(db, "users", userId, "dataPernikahan", "acara");
      
      await setDoc(docRef, {
        akad: { 
          tanggal: String(akadTanggal), 
          waktu: String(akadWaktu), 
          lokasi: String(akadLokasi) 
        },
        resepsi: { 
          tanggal: String(resepsiTanggal), 
          waktu: String(resepsiWaktu), 
          lokasi: String(resepsiLokasi) 
        },
        linkMaps: String(linkMaps)
      });
      alert("Hore! Data Acara berhasil disimpan dengan aman!");
    } catch (error) {
      console.error("Gagal menyimpan data acara:", error);
      alert("Terjadi kesalahan teknis saat menyimpan data. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium mr-4 flex items-center transition-colors">
            <span>&larr; Kembali ke Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Detail Acara</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Form Akad */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6 flex items-center">
              <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3">🕌</span>
              Akad Nikah / Pemberkatan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                <input 
                  type="date" 
                  value={akadTanggal} 
                  onChange={(e) => setAkadTanggal(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Waktu (Jam)</label>
                <input 
                  type="time" 
                  value={akadWaktu} 
                  onChange={(e) => setAkadWaktu(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                  required 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tempat / Lokasi Lengkap</label>
                <textarea 
                  value={akadLokasi} 
                  onChange={(e) => setAkadLokasi(e.target.value)} 
                  placeholder="Cth: Masjid Agung Al-Akbar, Jl. Raya No. 1..." 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                  rows={3} 
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* Form Resepsi */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6 flex items-center">
              <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3">🎉</span>
              Resepsi Pernikahan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                <input 
                  type="date" 
                  value={resepsiTanggal} 
                  onChange={(e) => setResepsiTanggal(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Waktu (Jam)</label>
                <input 
                  type="time" 
                  value={resepsiWaktu} 
                  onChange={(e) => setResepsiWaktu(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                  required 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tempat / Lokasi Lengkap</label>
                <textarea 
                  value={resepsiLokasi} 
                  onChange={(e) => setResepsiLokasi(e.target.value)} 
                  placeholder="Cth: Grand Ballroom Hotel Aston..." 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                  rows={3} 
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* Form Peta */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6 flex items-center">
              <span className="bg-red-100 text-red-600 p-2 rounded-lg mr-3">📍</span>
              Peta Lokasi
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link Google Maps</label>
              <input 
                type="url" 
                value={linkMaps} 
                onChange={(e) => setLinkMaps(e.target.value)} 
                placeholder="Cth: https://maps.app.goo.gl/..." 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition-colors" 
              />
              <p className="mt-2 text-sm text-gray-500">
                Salin tautan dari aplikasi Google Maps untuk mempermudah tamu menemukan lokasi acara Anda.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </span>
              ) : "Simpan Data Acara"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}