"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { app, db } from "../../lib/firebase"; // Mengambil koneksi Firebase
import { useRouter } from "next/navigation";

// Daftar pilihan tema (bisa kita tambah nanti)
const DAFTAR_TEMA = [
  {
    id: "minimalis",
    nama: "Minimalis Elegan",
    deskripsi: "Bersih, simpel, dengan nuansa putih dan abu-abu.",
    warna: "from-gray-100 to-gray-300",
  },
  {
    id: "rustic",
    nama: "Rustic Nature",
    deskripsi: "Nuansa alam dengan warna coklat kayu dan hijau daun.",
    warna: "from-amber-200 to-green-700",
  },
  {
    id: "floral",
    nama: "Floral Pink",
    deskripsi: "Cantik dan manis dengan hiasan bunga bernuansa merah muda.",
    warna: "from-pink-200 to-rose-400",
  },
  {
    id: "luxury",
    nama: "Luxury Gold",
    deskripsi: "Mewah dan eksklusif dengan paduan warna hitam dan emas.",
    warna: "from-gray-900 to-yellow-600",
  }
];

export default function TemaPage() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [temaTerpilih, setTemaTerpilih] = useState<string>("");
  const router = useRouter();

  // Cek Auth dan Ambil Data Lama
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const docRef = doc(db, "users", user.uid, "dataPernikahan", "tema");
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setTemaTerpilih(docSnap.data().temaId || "");
          }
        } catch (error) {
          console.error("Gagal mengambil data tema:", error);
        }
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fungsi Simpan ke Firebase
  const handleSave = async () => {
    if (!userId) return;
    if (!temaTerpilih) {
      alert("Silakan pilih salah satu tema terlebih dahulu!");
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, "users", userId, "dataPernikahan", "tema");
      await setDoc(docRef, {
        temaId: temaTerpilih,
        tanggalPilih: new Date().toISOString()
      });
      alert("Hore! Tema pilihan Anda berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan tema:", error);
      alert("Maaf, terjadi kesalahan saat menyimpan tema.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium mr-4 flex items-center">
            <span>&larr; Kembali ke Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Pilih Tema Undangan</h1>
        </div>

        <p className="text-gray-600 mb-8 text-lg">
          Pilih desain "baju" yang paling cocok untuk undangan pernikahan Anda. Anda bisa menggantinya kapan saja.
        </p>

        {/* Daftar Pilihan Tema */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {DAFTAR_TEMA.map((tema) => (
            <div 
              key={tema.id}
              onClick={() => setTemaTerpilih(tema.id)}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-4 ${
                temaTerpilih === tema.id 
                  ? "border-indigo-600 shadow-xl transform scale-[1.02]" 
                  : "border-transparent shadow-md hover:shadow-lg"
              }`}
            >
              {/* Preview Warna/Gambar Tema (Pura-pura pakai gradasi) */}
              <div className={`h-48 w-full bg-gradient-to-br ${tema.warna}`}>
                {temaTerpilih === tema.id && (
                  <div className="absolute top-4 right-4 bg-white rounded-full p-1 shadow-md">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Keterangan Tema */}
              <div className="bg-white p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tema.nama}</h3>
                <p className="text-gray-600">{tema.deskripsi}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <button 
            onClick={handleSave}
            disabled={loading || !temaTerpilih} 
            className="bg-indigo-600 text-white px-10 py-3 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors"
          >
            {loading ? "Menyimpan Tema..." : "Simpan Tema Pilihan"}
          </button>
        </div>
      </div>
    </div>
  );
}