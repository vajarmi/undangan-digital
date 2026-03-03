"use client";

import { useState } from "react";
import Link from "next/link";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../lib/firebase"; // Mengambil koneksi Firebase
import { useRouter } from "next/navigation";

export default function LoginPage() {
  // Tempat penyimpanan sementara data yang diketik pengguna
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fungsi yang dijalankan saat tombol "Masuk" diklik
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah halaman refresh
    setLoading(true);
    setError("");

    try {
      const auth = getAuth(app);
      // Mengirim data ke Firebase untuk mencocokkan email dan password
      await signInWithEmailAndPassword(auth, email, password);
      
      // Jika berhasil, arahkan pengguna ke halaman Dashboard utama
      alert("Login berhasil! Selamat datang di Dashboard.");
      router.push("/dashboard"); // Kita akan membuat halaman ini besok
      
    } catch (err: any) {
      // Jika terjadi kesalahan (misal: password salah, email tidak ditemukan)
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Email atau kata sandi salah. Silakan periksa kembali.");
      } else {
        setError("Gagal masuk. Silakan coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Masuk ke Akun Anda
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Atau{" "}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              daftar akun baru secara gratis
            </Link>
          </p>
        </div>
        
        {/* Menampilkan pesan error jika login gagal */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Form login yang sudah dihubungkan dengan fungsi handleLogin */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Alamat Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Alamat Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Menyimpan ketikan ke memori
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Kata Sandi</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Kata Sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Menyimpan ketikan ke memori
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading} // Mematikan tombol saat proses loading
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {loading ? "Memeriksa..." : "Masuk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}