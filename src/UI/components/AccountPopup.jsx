import { useState, useEffect } from 'react';

// [BACKEND DEPENDENCY] Two separate endpoints, both behind AuthMiddleware:
// - POST /upload-avatar   (multer field name: "user-avatar")
// - PATCH /update-profile (body: { name, address, phone }, all three required)
// Both rely on the httpOnly JWT cookie via `credentials: 'include'`.
const UPLOAD_AVATAR_ENDPOINT = 'http://localhost:3000/api/upload-avatar';
const UPDATE_PROFILE_ENDPOINT = 'http://localhost:3000/api/update-profile';

function AccountPopup({ isOpen, onClose, me, onUpdated }) {
    const [file, setFile] = useState(null);
    const [fileView, setFileView] = useState(null);
    const [avatarLoading, setAvatarLoading] = useState(false);

    // [ASSUMPTION] Pre-filling from me.address / me.phone assumes GET /me returns
    // these fields. If it doesn't yet, these will just open blank.
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        if (isOpen && me) {
            setName(me.name || '');
            setAddress(me.address || '');
            setPhone(me.phone || '');
        }
    }, [isOpen, me]);

    if (!isOpen) return null;

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileView(URL.createObjectURL(selectedFile));
        }
    };

    const handleAvatarSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('pilih file dulu ya');
            return;
        }

        const form = new FormData();
        form.append('user-avatar', file);

        setAvatarLoading(true);
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(UPLOAD_AVATAR_ENDPOINT, {
                method: 'POST',
                 headers: {
                    'Authorization': `Bearer ${token}`
                    }, // ngambil token dari localStorage,
                body: form,
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Upload avatar gagal');
            }

            alert(result.message || 'Upload avatar sukses');
            setFile(null);
            setFileView(null);
            if (onUpdated) onUpdated();
        } catch (error) {
            console.error(error);
            alert(error.message || 'Upload avatar gagal');
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !address.trim() || !phone.trim()) {
            alert('harap lengkapi data diri');
            return;
        }

        setFormLoading(true);
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(UPDATE_PROFILE_ENDPOINT, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name, address, phone }),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Update profil gagal');
            }

            alert(result.message || 'info akun telah diperbarui');
            if (onUpdated) onUpdated();
        } catch (error) {
            console.error(error);
            alert(error.message || 'Update profil gagal');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className='fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white p-4 rounded-md relative z-10 w-80'>
                <p>AKUN SAYA</p>

                {/* Section A: avatar upload — independent submit */}
                <form className='mt-6 border-b border-gray-200 pb-4' onSubmit={handleAvatarSubmit}>
                    <h3 className='text-sm font-medium'>Foto Profil</h3>
                    <input
                        type='file'
                        onChange={handleFileChange}
                        className='mt-2 border border-grey-650 p-2 rounded-md hover:bg-gray-800'
                    />
                    {fileView && (
                        <div className='mt-2 flex items-center justify-center w-full'>
                            <img src={fileView} alt='Preview' className='w-24 h-24 rounded-full object-cover' />
                        </div>
                    )}
                    <button
                        type='submit'
                        disabled={avatarLoading}
                        className='mt-2 bg-green-800 hover:bg-green-600 text-white px-3 py-1 rounded-md'
                    >
                        {avatarLoading ? 'Uploading...' : 'Simpan Foto'}
                    </button>
                </form>

                {/* Section B: profile data — independent submit */}
                <form className='mt-4' onSubmit={handleProfileSubmit}>
                    <h3 className='text-sm font-medium'>Data Diri</h3>
                    <input
                        type='text'
                        placeholder='Nama'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className='mt-2 border border-grey-650 p-2 rounded-md w-full'
                    />
                    <input
                        type='text'
                        placeholder='Alamat'
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className='mt-2 border border-grey-650 p-2 rounded-md w-full'
                    />
                    <input
                        type='text'
                        placeholder='No. Telepon'
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className='mt-2 border border-grey-650 p-2 rounded-md w-full'
                    />
                    <button
                        type='submit'
                        disabled={formLoading}
                        className='mt-3 bg-green-800 hover:bg-green-600 text-white px-3 py-1 rounded-md'
                    >
                        {formLoading ? 'Menyimpan...' : 'Simpan Data'}
                    </button>
                </form>

                <button
                    type='button'
                    onClick={onClose}
                    className='mt-4 bg-red-800 hover:bg-red-600 text-white px-3 py-1 rounded-md'
                >
                    Tutup
                </button>
            </div>
            <div className='absolute inset-0 -z-0' onClick={onClose}></div>
        </div>
    );
}

export default AccountPopup;
