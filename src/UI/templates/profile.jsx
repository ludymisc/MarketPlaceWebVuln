import Navbar from "../components/Navbar";
import { useState } from "react";
import Upload from "../components/Upload";

export default function Profile()  {
    const [upload, isUpload] = useState(false)

    const handleUpload = () => {
        isUpload(true);
    }

    const handleClose = () => {
        isUpload(false);
    }

    return(
        <div>
            <Navbar/>
            <div>
                produkmu :
            </div>
            <div>
                <button className="rounded-md bg-green-200 shadow-md p-2"
                onClick={handleUpload}>
                    tambah produk
                </button>
                <Upload isOpen={upload} onClose={handleClose}/>
            </div>
        </div>
    )
}