"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { app, db } from "../../lib/firebase"; // Mengambil koneksi Firebase
import { useRouter } from "next/navigation";

export default function GaleriPage() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // Memori untuk menyimpan link foto
  const [fotoUtama, setFotoUtama] = useState("");
  const [fotoGaleri1, setFotoGaleri1] = useState("");
  const [fotoGaleri2, setFotoGaleri2] = useState("");
  const [fotoGaleri3, setFotoGaleri3] = useState("");

  // Cek Auth dan Ambil Data Lama
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const docRef = doc(db, "users", user.uid, "dataPernikahan", "galeri");
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFotoUtama(data.fotoUtama || "");
            setFotoGaleri1(data.fotoGaleri1 || "");
            setFotoGaleri2(data.fotoGaleri2 || "");
            setFotoGaleri3(data.fotoGaleri3 || "");
          }
        } catch (error) {
          console.error("Gagal mengambil data galeri:", error);
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
      const docRef = doc(db, "users", userId, "dataPernikahan", "galeri");
      await setDoc(docRef, {
        fotoUtama,
        fotoGaleri1,
        fotoGaleri2,
        fotoGaleri3
      });
      alert("Hore! Link Galeri Foto berhasil disimpan ke Database!");
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      alert("Maaf, terjadi kesalahan saat menyimpan link foto.");
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
          <h1 className="text-3xl font-bold text-gray-900">Galeri Foto</h1>
        </div>

        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-blue-800 font-semibold mb-2 flex items-center">
            <span className="mr-2">💡</span> Cara Mengisi Galeri
          </h3>
          <p className="text-sm text-blue-700">
            Agar undangan lebih ringan dan cepat dibuka, silakan unggah foto Anda ke <strong>Google Drive</strong>, lalu salin dan tempel link-nya di bawah ini. Pastikan pengaturan link Google Drive Anda disetel ke <strong>"Siapa saja yang memiliki link" (Anyone with the link)</strong>.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Kotak Foto Utama */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6 flex items-center">
              <span className="bg-amber-100 text-amber-600 p-2 rounded-lg mr-3">🖼️</span>
              Foto Utama (Sampul Undangan)
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link Foto Utama</label>
              <input 
                type="url" 
                value={fotoUtama} 
                onChange={(e) => setFotoUtama(e.target.value)} 
                placeholder="Cth: https://drive.google.com/file/d/..." 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                required 
              />
              <p className="mt-2 text-xs text-gray-500">Foto ini akan menjadi wajah utama saat undangan dibuka.</p>
            </div>
          </div>

          {/* Kotak Galeri Tambahan */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6 flex items-center">
              <span className="bg-rose-100 text-rose-600 p-2 rounded-lg mr-3">📸</span>
              Koleksi Foto Tambahan
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Foto Galeri 1</label>
                <input 
                  type="url" 
                  value={fotoGaleri1} 
                  onChange={(e) => setFotoGaleri1(e.target.value)} 
                  placeholder="Cth: https://drive.google.com/file/d/..." 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Foto Galeri 2</label>
                <input 
                  type="url" 
                  value={fotoGaleri2} 
                  onChange={(e) => setFotoGaleri2(e.target.value)} 
                  placeholder="Cth: https://drive.google.com/file/d/..." 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Foto Galeri 3</label>
                <input 
                  type="url" 
                  value={fotoGaleri3} 
                  onChange={(e) => setFotoGaleri3(e.target.value)} 
                  placeholder="Cth: https://drive.google.com/file/d/..." 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors">
              {loading ? "Menyimpan ke Database..." : "Simpan Link Galeri"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}