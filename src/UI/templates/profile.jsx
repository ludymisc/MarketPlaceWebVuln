import Navbar from "../components/Navbar";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom"; // [ASSUMPTION] react-router-dom v6 - adjust import if different
import Upload from "../components/Upload";
import AccountPopup from "../components/AccountPopup";
import BuyModal from "../components/BuyModal";

// [BACKEND DEPENDENCY] GET /me — must be protected by AuthMiddleware and read the
// user from the Bearer token. Assumed response shape:
// { id, name: string | null, email: string, address: string | null, phone: string | null, avatar_url: string | null }
const ME_ENDPOINT = 'https://marketplaceweb-vuln.zakyadityasusanto.workers.dev/auth/me';

// [BACKEND DEPENDENCY] Product endpoints:
// GET /get-product/me         (own products, needs AuthMiddleware)
// GET /get-product/:ownerId   (public, someone else's products)
const MY_PRODUCTS_ENDPOINT = 'https://marketplaceweb-vuln.zakyadityasusanto.workers.dev/product/get-product/me';
const OWNER_PRODUCTS_ENDPOINT = (ownerId) => `https://marketplaceweb-vuln.zakyadityasusanto.workers.dev/product/get-product/${ownerId}`;

// [BACKEND DEPENDENCY] GET /get-user/:id — public, returns { id, name, avatar_url } only.
const OWNER_INFO_ENDPOINT = (ownerId) => `https://marketplaceweb-vuln.zakyadityasusanto.workers.dev/auth/profile/${ownerId}`;

function getInitials(name, email) {
    if (name && name.trim().length > 0) {
        return name.trim().charAt(0).toUpperCase();
    }
    if (email && email.length > 0) {
        return email.charAt(0).toUpperCase();
    }
    return '?';
}

function formatPrice(price) {
    const num = Number(price) || 0;
    return `Rp ${num.toLocaleString('id-ID')}`;
}

export default function Profile() {
    const token = localStorage.getItem('token');
    const { ownerId } = useParams(); // undefined when visiting /profile with no param

    const [upload, isUpload] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [me, setMe] = useState(null);
    const [loadingMe, setLoadingMe] = useState(true);

    const [owner, setOwner] = useState(null);
    const [loadingOwner, setLoadingOwner] = useState(false);

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleUpload = () => {
        isUpload(true);
    };

    const handleClose = () => {
        isUpload(false);
    };

    const fetchMe = useCallback(async () => {
        try {
            const response = await fetch(ME_ENDPOINT, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal memuat data akun');
            }

            setMe(result.data || result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMe(false);
        }
    }, [token]);

    // Fixed: was calling the wrong (products) endpoint with no id, using its own
    // loadingMe state, and taking an unused parameter. Now calls GET /get-user/:id
    // with its own loading state, reading ownerId directly from the route.
    const fetchOwner = useCallback(async () => {
        if (!ownerId) return;
        setLoadingOwner(true);
        try {
            const response = await fetch(OWNER_INFO_ENDPOINT(ownerId), {
                method: 'GET',
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal memuat data toko');
            }

            setOwner(result.data || result);
        } catch (error) {
            console.error(error);
            setOwner(null);
        } finally {
            setLoadingOwner(false);
        }
    }, [ownerId]);

    // isOwnProfile: no ownerId in the URL at all, OR ownerId matches my own id
    const isOwnProfile = !ownerId || (me?.id != null && String(me.id) === String(ownerId));

    const fetchProducts = useCallback(async () => {
        setLoadingProducts(true);
        try {
            const endpoint = isOwnProfile ? MY_PRODUCTS_ENDPOINT : OWNER_PRODUCTS_ENDPOINT(ownerId);
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: isOwnProfile ? { 'Authorization': `Bearer ${token}` } : {},
            });
            const result = await response.json();

            if (!response.ok) {
                console.error("Gagal mengambil data product:", response.statusText);
                throw new Error(result.message || 'Gagal memuat produk');
                return
            }

            setProducts(result.data || []);
        } catch (error) {
            console.error(error);
            setProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    }, [isOwnProfile, ownerId, token]);

    useEffect(() => {
        if (ownerId) {
            fetchOwner();
        } else {
            fetchMe();
        }
    }, [ownerId, fetchOwner, fetchMe]);

    useEffect(() => {
        // wait until header data is settled (own profile: loadingMe, other's store: loadingOwner)
        // before fetching products, so we don't fire a request before isOwnProfile is decisive.
        const headerSettled = ownerId ? !loadingOwner : !loadingMe;
        if (headerSettled) {
            fetchProducts();
        }
    }, [ownerId, loadingMe, loadingOwner, fetchProducts]);

    const displayName = me?.name && me.name.trim().length > 0 ? me.name : 'Unnamed';
    const displayEmail = me?.email || '';

    const ownerDisplayName = owner?.name && owner.name.trim().length > 0 ? owner.name : 'Unnamed';

    return (
        <div>
            <Navbar />

            <div className="flex items-center gap-4 p-4">
                {isOwnProfile ? (
                    <>
                        <button
                            type="button"
                            onClick={() => setAccountOpen(true)}
                            className="focus:outline-none"
                            aria-label="Buka pengaturan akun"
                        >
                            {loadingMe ? (
                                <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
                            ) : me?.avatar_url ? (
                                <img
                                    src={me.avatar_url}
                                    alt="Avatar"
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center text-white text-xl font-semibold">
                                    {getInitials(me?.name, me?.email)}
                                </div>
                            )}
                        </button>

                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{displayName}</span>
                            <span className="text-sm text-gray-500">{displayEmail}</span>
                        </div>
                    </>
                ) : (
                    <>
                        {loadingOwner ? (
                            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
                        ) : owner?.avatar_url ? (
                            <img
                                src={owner.avatar_url}
                                alt="Avatar"
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center text-white text-xl font-semibold">
                                {getInitials(owner?.name, null)}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{ownerDisplayName}</span>
                            <span className="text-sm text-gray-500">Produk yang dijual</span>
                        </div>
                    </>
                )}
            </div>

            {/* Edit/account popup only ever reachable when it's your own profile */}
            {isOwnProfile && (
                <AccountPopup
                    isOpen={accountOpen}
                    onClose={() => setAccountOpen(false)}
                    me={me}
                    onUpdated={fetchMe}
                />
            )}

            <div className="flex items-center justify-between px-4">
                <span>produkmu :</span>
                {isOwnProfile && (
                    <button className="rounded-md bg-green-200 shadow-md p-2"
                        onClick={handleUpload}>
                        tambah produk
                    </button>
                )}
            </div>

            {isOwnProfile && (
                <Upload isOpen={upload} onClose={handleClose} onSuccess={fetchProducts} />
            )}

            <div className="grid grid-cols-5 gap-4 py-8 px-4">
                {loadingProducts ? (
                    <p className="col-span-5 text-gray-400">Memuat produk...</p>
                ) : products.length === 0 ? (
                    <p className="col-span-5 text-gray-400">Belum ada produk.</p>
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
            </div>

            <BuyModal
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                product={selectedProduct}
                onSuccess={fetchProducts}
            />
        </div>
    );
}
