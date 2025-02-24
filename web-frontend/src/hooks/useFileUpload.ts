// hooks/useFileUpload.ts
// 檔案上傳與解析
import { useState, ChangeEvent } from 'react';
import { FileRecord } from '../types';

export function useFileUpload() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [pendingFiles, setPendingFiles] = useState<FileRecord[]>([]);

  const handleProjectUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    const projectFiles: FileRecord[] = [];
    const fileReaders: Promise<void>[] = [];

    for (const file of uploadedFiles) {
      const reader = new FileReader();
      const promise = new Promise<void>((resolve) => {
        reader.onload = (e) => {
          const content = e.target?.result as string;
          projectFiles.push({
            fileName: file.webkitRelativePath,
            oldCode: content,
            newCode: '',
            loading: true,
            error: '',
          });
          resolve();
        };
      });
      reader.readAsText(file);
      fileReaders.push(promise);
    }

    Promise.all(fileReaders).then(() => {
      setFiles(projectFiles);
      setPendingFiles(projectFiles);
    });
  };

  return { files, setFiles, pendingFiles, handleProjectUpload };
}
