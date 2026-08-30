import { useState } from 'react';

function Upload({isOpen, onClose}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileView, setFileView] = useState(null);
  if (!isOpen) return null

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
 
    if (selectedFile) {
      setFile(selectedFile);
      const image_url = URL.createObjectURL(selectedFile);
      setFileView(image_url);
    }
  } 

  const handleCancel = () => {
    setFile(null);
    setFileView(null);
  }
  
  const handleSubmit = async (clickEvent) => {
    clickEvent.preventDefault();
    
    if (!file) {
      alert("filenya mana mpruy?");
      return;
    } 

    const uploadForm = new FormData();
    uploadForm.append("file", file);

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: uploadForm
      });

      const result = await response.json();
      console.log(result);

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      alert(result.message || "Upload berhasil");
    } catch (error) {
      console.error(error);
      alert(error.message || "Upload gagal");
    } finally {
      handleCancel();
      setLoading(false);
    }
  }

  return (
    <>
      <div id='card' className='fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50'>
        <div className='my-2'>
          <p className=''>INSERT SOMETHING HERE</p>
          <form className='mt-10' onSubmit={handleSubmit}>
            <input 
            type='file' 
            placeholder='Input Your File Here' 
            onChange={handleFileChange}
            className='border border-grey-650 p-2 rounded-md hover:bg-gray-800'
            />
                <h3>Preview: </h3>
            {fileView && (
              <div className='mt-2 flex flex-cols items-center justify-center w-full'>
                <img 
                src={fileView}
                alt='Preview Image'
                className='w-48 h-48 object-cover'/>
              </div>
            )}
            {file && <p className='text-sm text-green-400 mb-4 text-left flex flex-cols items-center justify-center w-full'>File terpilih: {file.name}</p>}
            
            <div className='flex-2 items-center p-2'>
              <button
              type='button' 
              onClick={onClose}
              className='bg-red-800 m-2 hover:bg-red-600'>
                cancel
              </button>
              <button 
              type='submit'
              disabled={loading}
              className='bg-green-800 hover:bg-green-600'>
                {loading ? "Uploading..." : "Submit"}
              </button>
            </div>
          </form>
          <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
      </div>
    </>
  )
}

export default Upload;
