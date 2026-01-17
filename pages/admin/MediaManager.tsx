
import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { MediaItem } from '../../types/cms';
import { Loader2, Upload, Trash2, Copy, Image as ImageIcon, File as FileIcon } from 'lucide-react';

const MediaManager: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  // Real-time listener for media collection
  useEffect(() => {
    const q = query(collection(db, "cms_media"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMedia(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaItem)));
    }, (error) => {
      console.log("Media permission error or empty", error);
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleUpload(e.target.files[0]);
    }
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      // If not an image, return original file
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const maxWidth = 1200; // Standard max width
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Compression failed'));
          }, 'image/jpeg', 0.8);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      // Compress if it is an image
      const processedFile = await compressImage(file);
      
      // Determine filename
      let fileName = file.name;
      if (file.type.startsWith('image/') && fileName.match(/\.(png|jpeg|webp)$/i)) {
         fileName = fileName.replace(/\.[^/.]+$/, "") + ".jpg";
      }
      
      const storagePath = `media_library/${Date.now()}_${fileName}`;
      const storageRef = ref(storage, storagePath);
      
      const snapshot = await uploadBytes(storageRef, processedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Save Metadata to Firestore
      await addDoc(collection(db, "cms_media"), {
        fileName: fileName,
        fileURL: downloadURL,
        fileType: file.type.startsWith('image/') ? 'image/jpeg' : file.type,
        fileSize: processedFile.size,
        storagePath: snapshot.metadata.fullPath, 
        createdAt: serverTimestamp()
      });

    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Permanently delete ${item.fileName}?`)) return;

    try {
      await deleteDoc(doc(db, "cms_media", item.id));
      try {
        const fileRef = ref(storage, item.fileURL); 
        await deleteObject(fileRef);
      } catch (storageErr) {
        console.warn("Could not delete from storage", storageErr);
      }
    } catch (error) {
      console.error("Delete failed", error);
      alert("Error deleting file.");
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard!");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Media Library</h2>
        
        <label className={`cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
          <span>Upload File</span>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            disabled={uploading}
            accept="image/*,application/pdf"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {media.map((item) => (
          <div key={item.id} className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
              {item.fileType.startsWith('image/') ? (
                <img src={item.fileURL} alt={item.fileName} className="w-full h-full object-cover" />
              ) : (
                <FileIcon size={48} className="text-slate-300" />
              )}
            </div>
            
            <div className="p-3">
              <p className="text-xs font-bold text-slate-700 truncate" title={item.fileName}>{item.fileName}</p>
              <p className="text-[10px] text-slate-400">{(item.fileSize / 1024).toFixed(1)} KB</p>
            </div>

            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                onClick={() => copyToClipboard(item.fileURL)}
                className="p-2 bg-white text-primary-600 rounded-full hover:bg-primary-50"
                title="Copy URL"
              >
                <Copy size={16} />
              </button>
              <button 
                onClick={() => handleDelete(item)}
                className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        
        {media.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <ImageIcon size={48} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500">No media files yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaManager;
