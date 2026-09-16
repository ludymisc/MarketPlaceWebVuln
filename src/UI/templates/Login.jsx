import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const res  = await fetch("http://localhost:3000/api/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        console.log("login berhasil, token disimpan", data);
        navigate('/');
      } else {
        console.log("LOGIN ERROR:", data.message || "Gagal masuk");
        return
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen w-full font-sans">
      
      {/* 1. KOLOM KIRI (Hijau Toska) */}
      <div className="bg-[#16A085] flex flex-col items-center justify-center p-8 text-white text-center">
        {/* Title & Subtitle */}
        <h1 className="text-4xl font-bold mb-2">MarketKu</h1>
        <p className="text-sm text-emerald-100 max-w-xs mb-8">
          Belanja jutaan produk pilihan dengan harga terbaik
        </p>

        {/* Placeholder Kotak Gambar/Banner */}
        <div className="w-80 h-80 bg-[#117A65] rounded-2xl shadow-inner flex items-center justify-center text-emerald-200 text-sm">
          {/* Kamu bisa ganti ini pakai tag <img> kalau mau */}
          [ Place Illustration Here ]
        </div>
      </div>

      {/* 2. KOLOM KANAN (Form Login) */}
      <div className="bg-white flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md px-4">
          
          {/* Header Form */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Masuk ke Akun Anda
            </h2>
            <p className="text-xs text-gray-400">
              Selamat datang kembali! Silakan masuk untuk melanjutkan.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Field 1: Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">
                Email atau Nomor HP
              </label>
              <input
                type="text"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#16A085] transition"
                required
              />
            </div>

            {/* Field 2: Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">
                Kata Sandi
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#16A085] transition"
                required
              />
            </div>

            {/* Lupa Kata Sandi */}
            <div className="text-right">
              <a href="/lupa-sandi" className="text-xs font-semibold text-[#16A085] hover:underline">
                Lupa kata sandi?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#16A085] hover:bg-[#138d75] text-white font-medium py-2.5 rounded-lg transition duration-200 text-sm mt-2"
            >
              Masuk
            </button>

            {/* Footer Form */}
            <p className="text-center text-xs text-gray-500 mt-6">
              Belum punya akun?{' '}
              <a href="/register" className="font-bold text-[#16A085] hover:underline">
                Daftar sekarang
              </a>
            </p>

          </form>

        </div>
      </div>

    </div>
  );
}