"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { app, db } from "../../lib/firebase"; 
import { useRouter } from "next/navigation";

export default function KadoPage() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // State untuk Rekening 1
  const [bank1, setBank1] = useState("BCA");
  const [rek1, setRek1] = useState("");
  const [an1, setAn1] = useState("");

  // State untuk Rekening 2
  const [bank2, setBank2] = useState("MANDIRI");
  const [rek2, setRek2] = useState("");
  const [an2, setAn2] = useState("");

  // Autentikasi dan Mengambil Data Lama
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const docRef = doc(db, "users", user.uid, "dataPernikahan", "kado");
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.rekening1) {
              setBank1(String(data.rekening1.bank || "BCA"));
              setRek1(String(data.rekening1.noRekening || ""));
              setAn1(String(data.rekening1.atasNama || ""));
            }
            if (data.rekening2) {
              setBank2(String(data.rekening2.bank || "MANDIRI"));
              setRek2(String(data.rekening2.noRekening || ""));
              setAn2(String(data.rekening2.atasNama || ""));
            }
          }
        } catch (error) {
          console.error("Gagal mengambil data kado:", error);
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
    if (!userId) return;

    setLoading(true);
    try {
      const docRef = doc(db, "users", userId, "dataPernikahan", "kado");
      
      await setDoc(docRef, {
        rekening1: { 
          bank: String(bank1), 
          noRekening: String(rek1), 
          atasNama: String(an1) 
        },
        rekening2: { 
          bank: String(bank2), 
          noRekening: String(rek2), 
          atasNama: String(an2) 
        }
      });
      alert("Hore! Data Rekening Amplop Digital berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan data kado:", error);
      alert("Terjadi kesalahan teknis saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="text-amber-600 hover:text-amber-700 font-medium mr-4 flex items-center transition-colors">
            <span>&larr; Kembali</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Amplop Digital (Kado)</h1>
        </div>

        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg mb-8 text-sm">
          <p className="font-semibold mb-1">💡 Tips:</p>
          <p>Fitur ini memudahkan tamu undangan untuk memberikan kado secara <i>cashless</i> (transfer). Pastikan nomor rekening dan atas nama sudah benar agar tidak terjadi kesalahan transfer.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Form Rekening 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center border-b pb-4">
              <span className="bg-slate-100 text-slate-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
              Rekening Utama
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Bank / E-Wallet</label>
                <input 
                  type="text" 
                  value={bank1} 
                  onChange={(e) => setBank1(e.target.value.toUpperCase())} 
                  placeholder="Cth: BCA, MANDIRI, DANA"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 uppercase" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Rekening</label>
                <input 
                  type="text" 
                  value={rek1} 
                  onChange={(e) => setRek1(e.target.value)} 
                  placeholder="Cth: 1234567890"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 font-mono" 
                  required 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Atas Nama (Pemilik Rekening)</label>
                <input 
                  type="text" 
                  value={an1} 
                  onChange={(e) => setAn1(e.target.value.toUpperCase())} 
                  placeholder="Sesuai buku tabungan"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 uppercase" 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Form Rekening 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center border-b pb-4">
              <span className="bg-slate-100 text-slate-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
              Rekening Cadangan (Opsional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Bank / E-Wallet</label>
                <input 
                  type="text" 
                  value={bank2} 
                  onChange={(e) => setBank2(e.target.value.toUpperCase())} 
                  placeholder="Cth: BRI, BNI, OVO"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 uppercase" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Rekening</label>
                <input 
                  type="text" 
                  value={rek2} 
                  onChange={(e) => setRek2(e.target.value)} 
                  placeholder="Cth: 0987654321"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 font-mono" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Atas Nama (Pemilik Rekening)</label>
                <input 
                  type="text" 
                  value={an2} 
                  onChange={(e) => setAn2(e.target.value.toUpperCase())} 
                  placeholder="Sesuai buku tabungan"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 uppercase" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 focus:outline-none transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {loading ? "Menyimpan..." : "Simpan Data Rekening"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}