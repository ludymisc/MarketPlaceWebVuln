import { useState, useEffect, useCallback } from "react";
import BuyModal from "../components/BuyModal";

// [BACKEND DEPENDENCY - NEW, per this conversation] GET /get-product/recommendation
// Public route with OPTIONAL auth: excludes the caller's own products when a valid
// Bearer token is sent, returns everything when there isn't one (guest on landing page).
const RECOMMENDATION_ENDPOINT = 'https://marketplaceweb-vuln.zakyadityasusanto.workers.dev/product/allProduct';

function formatPrice(price) {
    const num = Number(price) || 0;
    return `Rp ${num.toLocaleString('id-ID')}`;
}

export default function RecomendationContent() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const fetchRecommendations = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await fetch(RECOMMENDATION_ENDPOINT, {
                method: 'GET',
                headers,
            });
            const result = await response.json();

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error Response:", errorText);
                throw new Error(`Gagal memuat rekomendasi (Status ${response.status})`);
            }

            setProducts(result.data || []);
        } catch (error) {
            console.error(error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    return (
        <div className="grid grid-cols-5 gap-4 py-8">
            {loading ? (
                <p className="col-span-5 text-gray-400">Memuat rekomendasi...</p>
            ) : products.length === 0 ? (
                <p className="col-span-5 text-gray-400">Belum ada rekomendasi produk.</p>
            ) : (
                products.map((product) => (
                    <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
                    >
                        <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                '[ Foto Produk ]'
                            )}
                        </div>

                        <div className="p-3">
                            <h4 className="text-sm font-medium text-gray-800 line-clamp-2">
                                {product.name}
                            </h4>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {product.description}
                            </p>
                            <p className="text-base font-bold text-emerald-600 mt-2">
                                {formatPrice(product.price)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Stok: {product.stock ?? 0}
                            </p>
                        </div>
                    </div>
                ))
            )}

            <BuyModal
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                product={selectedProduct}
                onSuccess={fetchRecommendations}
            />
        </div>
    );
}
