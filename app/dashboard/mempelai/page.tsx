"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { app, db } from "../../lib/firebase"; // Mengambil koneksi Firebase
import { useRouter } from "next/navigation";

export default function MempelaiPage() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // Menyiapkan "memori" untuk menyimpan ketikan pelanggan
  const [priaNamaPanggilan, setPriaNamaPanggilan] = useState("");
  const [priaNamaLengkap, setPriaNamaLengkap] = useState("");
  const [priaNamaAyah, setPriaNamaAyah] = useState("");
  const [priaNamaIbu, setPriaNamaIbu] = useState("");

  const [wanitaNamaPanggilan, setWanitaNamaPanggilan] = useState("");
  const [wanitaNamaLengkap, setWanitaNamaLengkap] = useState("");
  const [wanitaNamaAyah, setWanitaNamaAyah] = useState("");
  const [wanitaNamaIbu, setWanitaNamaIbu] = useState("");

  // Mengecek apakah user sudah login saat halaman dibuka
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid); // Mengingat ID user yang sedang login
        
        // Coba mengambil data lama jika user sudah pernah mengisi sebelumnya
        try {
          const docRef = doc(db, "users", user.uid, "dataPernikahan", "mempelai");
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Mengisi kotak form dengan data lama yang ditemukan di database
            setPriaNamaPanggilan(data.pria.namaPanggilan);
            setPriaNamaLengkap(data.pria.namaLengkap);
            setPriaNamaAyah(data.pria.namaAyah);
            setPriaNamaIbu(data.pria.namaIbu);
            
            setWanitaNamaPanggilan(data.wanita.namaPanggilan);
            setWanitaNamaLengkap(data.wanita.namaLengkap);
            setWanitaNamaAyah(data.wanita.namaAyah);
            setWanitaNamaIbu(data.wanita.namaIbu);
          }
        } catch (error) {
          console.error("Gagal mengambil data:", error);
        }
      } else {
        router.push("/login"); // Usir ke halaman login jika belum login
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fungsi yang dijalankan saat tombol "Simpan" ditekan
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return; // Jangan simpan jika tidak ada user yang login

    setLoading(true);

    try {
      // Membuat referensi tempat penyimpanan khusus untuk user ini di Firestore
      const docRef = doc(db, "users", userId, "dataPernikahan", "mempelai");
      
      // Mengirim semua data yang diketik ke Firebase
      await setDoc(docRef, {
        pria: {
          namaPanggilan: priaNamaPanggilan,
          namaLengkap: priaNamaLengkap,
          namaAyah: priaNamaAyah,
          namaIbu: priaNamaIbu
        },
        wanita: {
          namaPanggilan: wanitaNamaPanggilan,
          namaLengkap: wanitaNamaLengkap,
          namaAyah: wanitaNamaAyah,
          namaIbu: wanitaNamaIbu
        }
      });

      alert("Hore! Data Mempelai berhasil disimpan ke Database!");
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
          <h1 className="text-3xl font-bold text-gray-900">Data Mempelai</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Kotak Data Mempelai Pria */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">👨</span>
              Mempelai Pria
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Panggilan</label>
                <input 
                  type="text" 
                  value={priaNamaPanggilan}
                  onChange={(e) => setPriaNamaPanggilan(e.target.value)}
                  placeholder="Cth: Budi" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={priaNamaLengkap}
                  onChange={(e) => setPriaNamaLengkap(e.target.value)}
                  placeholder="Cth: Budi Santoso, S.Kom" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Ayah</label>
                <input 
                  type="text" 
                  value={priaNamaAyah}
                  onChange={(e) => setPriaNamaAyah(e.target.value)}
                  placeholder="Cth: Bapak Sucipto" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Ibu</label>
                <input 
                  type="text" 
                  value={priaNamaIbu}
                  onChange={(e) => setPriaNamaIbu(e.target.value)}
                  placeholder="Cth: Ibu Siti" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Kotak Data Mempelai Wanita */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6 flex items-center">
              <span className="bg-pink-100 text-pink-600 p-2 rounded-lg mr-3">👩</span>
              Mempelai Wanita
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Panggilan</label>
                <input 
                  type="text" 
                  value={wanitaNamaPanggilan}
                  onChange={(e) => setWanitaNamaPanggilan(e.target.value)}
                  placeholder="Cth: Ani" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={wanitaNamaLengkap}
                  onChange={(e) => setWanitaNamaLengkap(e.target.value)}
                  placeholder="Cth: Ani Pertiwi, S.E" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Ayah</label>
                <input 
                  type="text" 
                  value={wanitaNamaAyah}
                  onChange={(e) => setWanitaNamaAyah(e.target.value)}
                  placeholder="Cth: Bapak Wijaya" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Ibu</label>
                <input 
                  type="text" 
                  value={wanitaNamaIbu}
                  onChange={(e) => setWanitaNamaIbu(e.target.value)}
                  placeholder="Cth: Ibu Lestari" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500" 
                  required 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors"
            >
              {loading ? "Menyimpan ke Database..." : "Simpan Data Mempelai"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}