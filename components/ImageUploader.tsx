
import React, { useState } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Loader2, Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  maxWidth?: number; // Optional: Max width for resizing
  quality?: number;  // Optional: Quality 0 to 1
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  value, 
  onChange, 
  folder = 'cms', 
  label = 'Upload Image',
  maxWidth = 1200, // Default max width for web optimization
  quality = 0.8    // Default quality (80%)
}) => {
  const [uploading, setUploading] = useState(false);

  // Utility to compress image
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to Blob (JPEG for better compression)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Image compression failed"));
              }
            },
            'image/jpeg', 
            quality
          );
        };
        
        img.onerror = (err) => reject(err);
      };
      
      reader.onerror = (err) => reject(err);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Compress the image before uploading
      const compressedBlob = await compressImage(file);
      
      // Create a filename with .jpg extension since we converted it
      const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const fileName = `${Date.now()}_${originalName}.jpg`;

      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      // Upload the compressed blob
      const snapshot = await uploadBytes(storageRef, compressedBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      onChange(downloadURL);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-700">{label}</label>
      
      {value ? (
        <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
          <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={handleRemove}
              className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
              title="Remove Image"
              type="button"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <Loader2 className="animate-spin text-primary-600 mb-2" size={24} />
            ) : (
              <Upload className="text-slate-400 mb-2" size={24} />
            )}
            <p className="text-sm text-slate-500 font-medium">
              {uploading ? 'Compressing & Uploading...' : 'Click to upload image'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Auto-compressed & Resized
            </p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  );
};

export default ImageUploader;
