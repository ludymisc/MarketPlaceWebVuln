import { useState } from 'react';

// [BACKEND DEPENDENCY] POST /checkout/items/:id — needs AuthMiddleware (Bearer token).
// [KNOWN BACKEND BUG - out of scope per your call] The endpoint currently reads
// `const quantity = req.body` (whole body object, not req.body.quantity), so the
// quantity typed here won't actually be respected server-side until that's fixed
// on your end. Sending it as { quantity } here since that's the conventional shape
// you said you'd debug against yourself.
const CHECKOUT_ENDPOINT = (productId) => `https://marketplaceweb-vuln.zakyadityasusanto.workers.dev/product/checkout/items/${productId}`;

function formatPrice(price) {
    const num = Number(price) || 0;
    return `Rp ${num.toLocaleString('id-ID')}`;
}

function BuyModal({ isOpen, onClose, product, onSuccess }) {
    const token = localStorage.getItem('token');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    if (!isOpen || !product) return null;

    const handleClose = () => {
        setQuantity(1);
        onClose();
    };

    const handleBuy = async (e) => {
        e.preventDefault();

        if (!quantity || quantity <= 0) {
            alert('kuantitas tidak valid');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(CHECKOUT_ENDPOINT(product.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ quantity }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Pembelian gagal');
            }

            alert(result.message || 'Pembelian berhasil!');
            if (onSuccess) onSuccess(result.detail);
            handleClose();
        } catch (error) {
            console.error(error);
            alert(error.message || 'Pembelian gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white p-4 rounded-md relative z-10 w-80'>
                <div className='w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-md overflow-hidden'>
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className='w-full h-full object-cover'
                        />
                    ) : (
                        '[ Foto Produk ]'
                    )}
                </div>

                <h3 className='text-base font-semibold text-gray-900 mt-3'>{product.name}</h3>
                <p className='text-sm text-gray-500 mt-1'>{product.description}</p>
                <p className='text-lg font-bold text-emerald-600 mt-2'>{formatPrice(product.price)}</p>
                <p className='text-xs text-gray-400 mt-1'>Stok tersedia: {product.stock ?? 0}</p>

                <form onSubmit={handleBuy} className='mt-4'>
                    <label className='text-sm text-gray-700'>Jumlah</label>
                    <input
                        type='number'
                        min='1'
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                        className='mt-1 border border-grey-650 p-2 rounded-md w-full'
                    />

                    <div className='flex gap-2 mt-4'>
                        <button
                            type='button'
                            onClick={handleClose}
                            className='bg-red-800 hover:bg-red-600 text-white px-3 py-1 rounded-md'
                        >
                            Batal
                        </button>
                        <button
                            type='submit'
                            disabled={loading}
                            className='bg-green-800 hover:bg-green-600 text-white px-3 py-1 rounded-md'
                        >
                            {loading ? 'Memproses...' : 'Beli'}
                        </button>
                    </div>
                </form>
            </div>
            <div className='absolute inset-0 -z-0' onClick={handleClose}></div>
        </div>
    );
}

export default BuyModal;
