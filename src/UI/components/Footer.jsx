export default function Footer() {
  return (
    <footer className="grid grid-cols-[1fr_2fr_1fr] px-6 py-8 border-t 
    border-gray-200 mt-12 bg-gray-200">
      
      {/* SECTION 1: KIRI (Brand & Info Singkat) */}
      <div className="justify-self-start flex flex-col gap-2">
        <span className="text-2xl font-bold text-[#16A085] cursor-pointer">
          MarketKu
        </span>
        <p className="text-xs text-gray-500 max-w-xs">
          Marketplace pilihan untuk semua kebutuhan harianmu. Aman, cepat, dan terpercaya.
        </p>
        <span className="text-xs text-gray-400 mt-2">
          © 2026 MarketKu Inc.
        </span>
      </div>

      {/* SECTION 2: TENGAH (Menu Navigasi Footer) */}
      <div className="w-full px-8 grid grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-bold text-gray-800 mb-2">Layanan</h4>
          <ul className="space-y-1 text-gray-600 text-xs">
            <li><a href="#about" className="hover:text-[#16A085] transition">Tentang MarketKu</a></li>
            <li><a href="#karir" className="hover:text-[#16A085] transition">Karir</a></li>
            <li><a href="#blog" className="hover:text-[#16A085] transition">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-gray-800 mb-2">Bantuan</h4>
          <ul className="space-y-1 text-gray-600 text-xs">
            <li><a href="#faq" className="hover:text-[#16A085] transition">Syarat & Ketentuan</a></li>
            <li><a href="#kebijakan" className="hover:text-[#16A085] transition">Kebijakan Privasi</a></li>
            <li><a href="#kontak" className="hover:text-[#16A085] transition">Hubungi Kami</a></li>
          </ul>
        </div>
      </div>

      {/* SECTION 3: KANAN (Sosial Media / App) */}
      <div className="justify-self-end flex flex-col items-end gap-3 text-gray-700">
        <h4 className="font-bold text-sm text-gray-800">Ikuti Kami</h4>
        <div className="flex gap-3 text-lg">
          <a href="#" className="text-gray-600 hover:text-[#16A085] transition">🌐</a>
          <a href="#" className="text-gray-600 hover:text-[#16A085] transition">📸</a>
          <a href="#" className="text-gray-600 hover:text-[#16A085] transition">🐦</a>
        </div>
      </div>

    </footer>
  );
}