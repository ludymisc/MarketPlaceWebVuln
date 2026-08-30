export default function FlashContent() {
    return (
       // 1. Grid container (tanpa flex!)
    <div className="grid grid-cols-5 gap-4 py-8">
      
      {/* 2. SATU CARD UTAMA */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
        
        {/* BOX GAMBAR: Dibuat w-full biar penuhin lebar card */}
        <div className="w-full h-40 bg-red-500 flex items-center justify-center text-white font-semibold">
          [ Foto Produk ]
        </div>

        {/* BOX KONTEN / TEXT */}
        <div className="p-3">
          {/* Nama Produk */}
          <h4 className="text-sm font-medium text-gray-800 line-clamp-2">
            Nama Produk Yang Agak Panjang Buat Ngetes
          </h4>
          
          {/* Harga */}
          <p className="text-base font-bold text-emerald-600 mt-2">
            Rp 150.000
          </p>

          {/* Badge opsional khas e-commerce */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded font-bold">
              50%
            </span>
            <span className="text-xs text-gray-400 line-through">
              Rp 300.000
            </span>
          </div>
        </div>

      </div>

    </div>
    )
}