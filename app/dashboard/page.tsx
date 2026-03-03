"use client";

import { getAuth, signOut } from "firebase/auth";
import { app } from "../lib/firebase"; // Mengambil koneksi Firebase
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  // Fungsi untuk keluar (Logout)
  const handleLogout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      router.push("/login"); // Kembali ke halaman login setelah keluar
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (Menu Sebelah Kiri) */}
      <div className="w-64 bg-white shadow-lg relative">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-extrabold text-indigo-600">UndanganSaaS</h2>
          <p className="text-xs text-gray-500 mt-1">Panel Pelanggan</p>
        </div>
        
        <nav className="mt-6">
          <a href="#" className="block py-3 px-6 text-indigo-600 bg-indigo-50 border-r-4 border-indigo-600 font-semibold">
            Beranda
          </a>
          <a href="/dashboard/mempelai" className="block py-3 px-6 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition">
            Data Mempelai
          </a>
          <a href="/dashboard/acara" className="block py-3 px-6 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition">
            Detail Acara
          </a>
          <a href="/dashboard/galeri" className="block py-3 px-6 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition">
            Galeri Foto
          </a>
          <a href="/dashboard/tema" className="block py-3 px-6 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition">
            Pilih Tema
          </a>
        </nav>

        {/* Tombol Logout di paling bawah Sidebar */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex justify-center py-2 px-4 border border-red-200 text-sm font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition duration-150"
          >
            Keluar (Logout)
          </button>
        </div>
      </div>

      {/* Main Content (Ruang Konten Utama di Kanan) */}
      <div className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-900">Selamat Datang! 👋</h1>
        <p className="mt-2 text-gray-600 text-lg">
          Ini adalah ruang kendali (Dashboard) undangan pernikahan Anda.
        </p>
        
        <div className="mt-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-4">
            Langkah Selanjutnya:
          </h3>
          <ul className="space-y-4 text-gray-600">
            <li className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 font-bold">1</span>
              Isi Data Mempelai Pria & Wanita pada menu samping.
            </li>
            <li className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 font-bold">2</span>
              Tentukan Lokasi & Waktu Acara (Akad & Resepsi).
            </li>
            <li className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 font-bold">3</span>
              Unggah Foto Prewedding dan Pilih Tema Undangan.
            </li>
          </ul>
          
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Info:</strong> Link undangan Anda baru bisa dibagikan setelah Anda melengkapi ketiga langkah di atas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}