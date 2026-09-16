import { useState } from 'react';

// [BACKEND DEPENDENCY] This form submits to POST /add-product (product.controller.js).
// That route requires AuthMiddleware, so the browser must send the httpOnly auth
// cookie automatically via `credentials: 'include'` below — no manual token handling needed.
// Required by backend: name, price. Optional: description, stock, img (multer field name: "img").
const ADD_PRODUCT_ENDPOINT = 'http://localhost:3000/api/add-product';

function Upload({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [file, setFile] = useState(null);
  const [fileView, setFileView] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setFile(null);
    setFileView(null);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      const image_url = URL.createObjectURL(selectedFile);
      setFileView(image_url);
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (clickEvent) => {
    clickEvent.preventDefault();

    // name and price are required backend-side (add-product rejects without them)
    if (!name.trim() || !price) {
      alert('nama dan harga produk wajib diisi');
      return;
    }

    const uploadForm = new FormData();
    uploadForm.append('name', name);
    uploadForm.append('description', description);
    uploadForm.append('price', price ? parseFloat(price) : 0);
    uploadForm.append('stock', stock ? parseInt(stock) : 0);
    if (file) {
      uploadForm.append('img', file);
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/add-product', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }, // ngambil token dari localStorage
        body: uploadForm,
      });

      const result = await response.json();
      console.log(result);

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      alert(result.message || 'Produk berhasil ditambahkan');
      // [BACKEND DEPENDENCY] Parent (profile page) should refetch from GET /my-products
      // once that endpoint exists, so the new product shows up in "produkmu".
      if (onSuccess) onSuccess(result.data);
      resetForm();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Upload gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id='card' className='fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50'>
      <div className='my-2 bg-white p-4 rounded-md relative z-10'>
        <p className=''>TAMBAHKAN PRODUK</p>
        <form className='mt-10' onSubmit={handleSubmit}>
          <div>
            <input
              type='text'
              placeholder='Input your product name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='border border-grey-650 p-2 rounded-md hover:bg-gray-800 w-65'
            />
          </div>
          <div className='mt-2'>
            <input
              type='text'
              placeholder='Input your product description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='border border-grey-650 p-2 rounded-md hover:bg-gray-800 w-65'
            />
          </div>
          <div className='mt-2'>
            <input
              type='number'
              placeholder='Input price'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min='0'
              className='border border-grey-650 p-2 rounded-md hover:bg-gray-800 w-65'
            />
          </div>
          <div className='mt-2'>
            <input
              type='number'
              placeholder='Input stock (optional)'
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min='0'
              className='border border-grey-650 p-2 rounded-md hover:bg-gray-800 w-65'
            />
          </div>
          <input
            type='file'
            placeholder='Input Your File Here'
            onChange={handleFileChange}
            className='mt-2 border border-grey-650 p-2 rounded-md hover:bg-gray-800'
          />
          <h3>Preview: </h3>
          {fileView && (
            <div className='mt-2 flex flex-cols items-center justify-center w-full'>
              <img
                src={fileView}
                alt='Preview Image'
                className='w-48 h-48 object-cover'
              />
            </div>
          )}
          {file && (
            <p className='text-sm text-green-400 mb-4 text-left flex flex-cols items-center justify-center w-full'>
              File terpilih: {file.name}
            </p>
          )}

          <div className='flex-2 items-center p-2'>
            <button
              type='button'
              onClick={handleCancel}
              className='bg-red-800 m-2 hover:bg-red-600'
            >
              cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='bg-green-800 hover:bg-green-600'
            >
              {loading ? 'Uploading...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
      <div className='absolute inset-0 -z-0' onClick={handleCancel}></div>
    </div>
  );
}

export default Upload;