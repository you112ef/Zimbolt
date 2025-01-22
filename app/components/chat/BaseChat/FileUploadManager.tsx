// app/components/chat/BaseChat/FileUploadManager.tsx

import React, { useCallback, useState } from 'react';

interface FileUploadManagerProps {
  uploadedFiles: File[];
  setUploadedFiles?: (files: File[]) => void;
  imageDataList: string[];
  setImageDataList?: (dataList: string[]) => void;
}

export function FileUploadManager({
  uploadedFiles,
  setUploadedFiles,
  imageDataList,
  setImageDataList,
}: FileUploadManagerProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  /**
   * 1) Manual file upload (click “Upload File”)
   */
  const handleFileUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64Image = ev.target?.result as string;
        setUploadedFiles?.([...uploadedFiles, file]);
        setImageDataList?.([...imageDataList, base64Image]);
      };
      reader.readAsDataURL(file);
    };

    input.click();
  }, [uploadedFiles, imageDataList, setUploadedFiles, setImageDataList]);

  /**
   * 2) Drag-and-Drop handlers for images
   */

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const base64Image = ev.target?.result as string;
            setUploadedFiles?.([...uploadedFiles, file]);
            setImageDataList?.([...imageDataList, base64Image]);
          };
          reader.readAsDataURL(file);
        }
        // If you wish to handle non-image files differently, you can do it here.
      });
    },
    [uploadedFiles, imageDataList, setUploadedFiles, setImageDataList]
  );

  return (
    <div className="my-2">
      {/* 
        3) Drop Zone Container:
           - Toggle styling if drag is over 
           - We use inline classes here, but you can use a CSS module if you prefer
      */}
      <div
        className={`
          transition-all p-4 rounded
          ${
            isDragOver
              ? 'border-2 border-[#1488fc]'
              : 'border border-[var(--bolt-elements-borderColor)]'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* 4) Upload Button */}
        <button
          onClick={handleFileUpload}
          className="flex items-center gap-1 px-3 py-1 transition-all rounded bg-bolt-elements-item-backgroundDefault"
        >
          <div className="i-ph:paperclip text-xl" />
          <span>Upload File</span>
        </button>

        {/* 
          If you want to place a note or message here about dragging images in,
          you can do so, e.g., <p>Drag images here</p>.
        */}
      </div>
    </div>
  );
}
