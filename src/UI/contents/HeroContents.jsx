export default function Hero() {
  return (
    // CONTAINER UTAMA (Membagi Kiri & Kanan)
    <section className="grid grid-cols-3 gap-4 p-4">
      
      {/* 1. KOLOM KIRI (Main Banner Utama - Paling Besar) */}
      <div className="col-span-2 bg-gradient-to-r from-green-800 to-green-400 
      rounded-2xl p-8 text-white min-h-[300px] flex flex-col justify-center">
        <span className="bg-white/20 text-xs px-3 py-1 rounded-full w-max mb-2">
          BIG SALE 8.8
        </span>
        <h1 className="text-3xl font-bold mb-2">Diskon Hingga 80%!</h1>
        <p className="mb-4">Khusus hari ini, dapatkan promo cashback ekstra.</p>
        <button className="bg-white text-[#16A085] font-bold px-4 py-2 rounded-lg w-max">
          Klaim Voucher
        </button>
      </div>

      {/* 2. KOLOM KANAN (Tempat 2 Card Bertumpuk) */}
      <div className="flex flex-col justify-between gap-4">
        
        {/* Side Event Card 1 (Atas) */}
        <div className="flex-1 bg-orange-400 rounded-2xl p-4 flex flex-col justify-center">
          <h3 className="font-bold text-white">Flash Sale Elektronik</h3>
          <p className="text-sm text-white">Mulai jam 12:00 WIB</p>
        </div>

        {/* Side Event Card 2 (Bawah) */}
        <div className="flex-1 bg-[#16A085] rounded-2xl p-4 flex flex-col justify-center">
          <h3 className="font-bold text-white">Gratis Ongkir Rp0</h3>
          <p className="text-sm text-white">Ke seluruh Indonesia</p>
        </div>

      </div>

    </section>
  );
}