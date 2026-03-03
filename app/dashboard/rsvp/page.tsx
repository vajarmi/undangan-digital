"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { app, db } from "../../lib/firebase"; 
import { useRouter } from "next/navigation";

export default function RsvpDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [ucapanList, setUcapanList] = useState<any[]>([]);
  const router = useRouter();

  // Statistik Sederhana
  const [stats, setStats] = useState({
    total: 0,
    hadir: 0,
    tidakHadir: 0
  });

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        
        // Mengambil data ucapan/RSVP secara Real-time
        const q = query(
          collection(db, "users", user.uid, "bukuTamu"),
          orderBy("timestamp", "desc")
        );

        const unsubSnapshot = onSnapshot(q, (snapshot) => {
          const list: any[] = [];
          let hadirCount = 0;
          let tidakHadirCount = 0;

          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({ id: doc.id, ...data });
            if (data.kehadiran === "Hadir") hadirCount++;
            else tidakHadirCount++;
          });

          setUcapanList(list);
          setStats({
            total: list.length,
            hadir: hadirCount,
            tidakHadir: tidakHadirCount
          });
          setLoading(false);
        }, (error) => {
          console.error("Error fetching RSVP:", error);
          setLoading(false);
        });

        return () => unsubSnapshot();
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium mr-4">
              &larr; Kembali
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Data Buku Tamu (RSVP)</h1>
          </div>
          
          <div className="flex gap-3">
             <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                <p className="text-[10px] uppercase text-gray-400 font-bold">Total Ucapan</p>
                <p className="text-xl font-bold text-indigo-600">{stats.total}</p>
             </div>
             <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                <p className="text-[10px] uppercase text-gray-400 font-bold">Hadir</p>
                <p className="text-xl font-bold text-green-600">{stats.hadir}</p>
             </div>
             <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                <p className="text-[10px] uppercase text-gray-400 font-bold">Absen</p>
                <p className="text-xl font-bold text-red-600">{stats.tidakHadir}</p>
             </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-20 rounded-2xl shadow-sm text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat data tamu...</p>
          </div>
        ) : ucapanList.length === 0 ? (
          <div className="bg-white p-20 rounded-2xl shadow-sm text-center border border-dashed border-gray-300">
            <p className="text-4xl mb-4">📜</p>
            <h3 className="text-xl font-bold text-gray-800">Belum ada ucapan</h3>
            <p className="text-gray-500 mt-2">Sebarkan link undangan Anda untuk menerima ucapan dari tamu.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase">Nama Tamu</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase">Ucapan & Doa</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ucapanList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800">{item.nama}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.kehadiran === "Hadir" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                        }`}>
                          {item.kehadiran}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm italic">"{item.ucapan}"</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {item.timestamp?.toDate().toLocaleString('id-ID', { 
                          dateStyle: 'medium', 
                          timeStyle: 'short' 
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}