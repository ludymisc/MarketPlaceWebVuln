export default function Navbar() {
    return(
    <nav className="sticky z-10 top-0 grid grid-cols-[1fr_2fr_1fr] px-6 py-3 bg-white">
      <div className="justify-self-start">
        <span className="text-2xl font-bold text-[#16A085] cursor-pointer">
          <a href="/">
          MarketKu
          </a>
        </span>
      </div>

      {/* SECTION 2: TENGAH (Search Bar) */}
      <div className="w-full px-4">
        <input 
          type="text" 
          placeholder="Cari produk di MarketKu..." 
          className="w-full px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* SECTION 3: KANAN (Navigasi & User) */}
      {/* 'justify-self-end' biar seluruh menu ketarik rapi ke pojok kanan */}
      <div className="justify-self-end flex items-center gap-6 text-gray-700 font-medium">
        <a href="#about" className="hover:text-blue-600 transition text-[#16A085]">About</a>
        <a href="#kontak" className="hover:text-blue-600 transition text-[#16A085]">Kontak</a>
        <button className="hover:text-blue-600 transition text-[#16A085]">🛒 Keranjang</button>
        
        {/* Avatar */}
        <div 
        className="w-8 h-8 rounded-full bg-blue-500 text-white 
        flex items-center justify-center font-bold text-sm"
        >
          <a href="/profile">
            USER
          </a>
        </div>
      </div>
    </nav>
    )
}