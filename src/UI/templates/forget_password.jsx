import React, { useState } from 'react';

export default function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMassage] = useState('');

  const API_URL = 'https://marketplaceweb-vuln.zakyadityasusanto.workers.dev/auth'

  try {
    const handleSubmit = async(e) => {
    e.preventDefault();

    if (confirmPassword !== password) {
      setErrorMassage("Password tidak cocok");
      return;
    }

    setErrorMassage('');

    const res = await fetch(`${API_URL}forget-password`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json();

    if (!res.ok) {
      console.log("PASSWORD CHANGE FAILED :", data.message || "GAGAL MENGGANTI PASSWORD")
      return;
    }

    console.log({ email, password });
  }} catch (err) {
    console.error(err);
  }

  return (
    <div className="min-h-screen w-full font-sans">

      <div className="bg-white flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md px-4">
          
          {/* Header Form */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Ganti password akun anda
            </h2>
            <p className="text-xs text-gray-400">
              Silahkan masukkan email dan password baru anda.
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
                Kata Sandi Baru
              </label>
              <input
                type="password"
                placeholder="masukkan password baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#16A085] transition"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">
                Ulangi Kata Sandi Baru
              </label>
              <input
                type="password"
                placeholder="masukkan password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#16A085] transition"
                required
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-red-500 font-semibold text-center">
                {errorMessage}
              </p>
            )}

            {/* Lupa Kata Sandi */}
            <div className="text-right">
              <a href="/login" className="text-xs font-semibold text-[#16A085] hover:underline">
                Kembali?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#16A085] hover:bg-[#138d75] text-white font-medium py-2.5 rounded-lg transition duration-200 text-sm mt-2"
            >
              Reset password
            </button>

          </form>

        </div>
      </div>

    </div>
  );
}