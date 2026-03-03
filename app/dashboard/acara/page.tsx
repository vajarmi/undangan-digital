"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { app, db } from "../../lib/firebase"; // Mengambil koneksi Firebase
import { useRouter } from "next/navigation";

export default function AcaraPage() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // Memori untuk form Akad
  const [akadTanggal, setAkadTanggal] = useState("");
  const [akadWaktu, setAkadWaktu] = useState("");
  const [akadLokasi, setAkadLokasi] = useState("");

  // Memori untuk form Resepsi
  const [resepsiTanggal, setResepsiTanggal] = useState("");
  const [resepsiWaktu, setResepsiWaktu] = useState("");
  const [resepsiLokasi, setResepsiLokasi] = useState("");

  // Link Google Maps
  const [linkMaps, setLinkMaps] = useState("");

  // Cek Auth dan Ambil Data Lama
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const docRef = doc(db, "users", user.uid, "dataPernikahan", "acara");
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAkadTanggal(data.akad.tanggal);
            setAkadWaktu(data.akad.waktu);
            setAkadLokasi(data.akad.lokasi);
            
            setResepsiTanggal(data.resepsi.tanggal);
            setResepsiWaktu(data.resepsi.waktu);
            setResepsiLokasi(data.resepsi.lokasi);
            
            setLinkMaps(data.linkMaps || "");
          }
        } catch (error) {
          console.error("Gagal mengambil data:", error);
        }
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fungsi Simpan ke Firebase
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    try {
      const docRef = doc(db, "users", userId, "dataPernikahan", "acara");
      await setDoc(docRef, {
        akad: { tanggal: akadTanggal, waktu: akadWaktu, lokasi: akadLokasi },
        resepsi: { tanggal: resepsiTanggal, waktu: resepsiWaktu, lokasi: resepsiLokasi },
        linkMaps: linkMaps
      });
      alert("Hore! Data Acara berhasil disimpan ke Database!");
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      alert("Maaf, terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium mr-4 flex items-center">
            <span>&larr; Kembali ke Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Detail Acara</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Kotak Akad Nikah */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6 flex items-center">
              <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3">🕌</span>
              Akad Nikah / Pemberkatan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                <input type="date" value={akadTanggal} onChange={(e) => setAkadTanggal(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Waktu (Jam)</label>
                <input type="time" value={akadWaktu} onChange={(e) => setAkadWaktu(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tempat / Lokasi Lengkap</label>
                <textarea value={akadLokasi} onChange={(e) => setAkadLokasi(e.target.value)} placeholder="Cth: Masjid Agung / Gedung Serbaguna..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" rows={3} required></textarea>
              </div>
            </div>
          </div>

          {/* Kotak Resepsi */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6 flex items-center">
              <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3">🎉</span>
              Resepsi Pernikahan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                <input type="date" value={resepsiTanggal} onChange={(e) => setResepsiTanggal(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Waktu (Jam)</label>
                <input type="time" value={resepsiWaktu} onChange={(e) => setResepsiWaktu(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tempat / Lokasi Lengkap</label>
                <textarea value={resepsiLokasi} onChange={(e) => setResepsiLokasi(e.target.value)} placeholder="Cth: Hotel Grand Aston..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" rows={3} required></textarea>
              </div>
            </div>
          </div>

          {/* Kotak Peta Khusus */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6 flex items-center">
              <span className="bg-red-100 text-red-600 p-2 rounded-lg mr-3">📍</span>
              Peta Lokasi
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link Google Maps</label>
              <input type="url" value={linkMaps} onChange={(e) => setLinkMaps(e.target.value)} placeholder="Cth: https://maps.app.goo.gl/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" />
              <p className="mt-2 text-sm text-gray-500">Salin link dari aplikasi Google Maps untuk mempermudah tamu menemukan lokasi acara.</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors">
              {loading ? "Menyimpan ke Database..." : "Simpan Data Acara"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}