// hooks/useAIRethink.ts
import { unifiedOperation } from '../testApiService';
import { FileRecord } from '../types';
import { useProjectManager } from './useProjectManager'; // 或透過參數傳入 setFiles, setSelectedFile 等

export function useAIRethink(
  selectedFile: FileRecord | null,
  setFiles: React.Dispatch<React.SetStateAction<FileRecord[]>>,
  setSelectedFile: React.Dispatch<React.SetStateAction<FileRecord | null>>,
  setIsUpdating: React.Dispatch<React.SetStateAction<boolean>>,
  setProgress: React.Dispatch<React.SetStateAction<number>>
) {
  const handleConfirmRethink = async (prompt: string) => {
    if (!selectedFile) return;
    if (!prompt.trim()) {
      alert("請輸入 Prompt！");
      return;
    }
    setIsUpdating(true);
    setProgress(0);
    const fileToSend = `### AI Rethink Request:\n\n${prompt}\n\n### File: ${selectedFile.fileName}\n\n${selectedFile.newCode}`;
    try {
      const result = await unifiedOperation(fileToSend);
      if (result.result) {
        setFiles(prevFiles =>
          prevFiles.map(f =>
            f.fileName === selectedFile.fileName
              ? {
                  ...f,
                  newCode: result.result.converted_code || f.newCode,
                  advice: result.result.suggestions,
                  loading: false,
                }
              : f
          )
        );
        setSelectedFile(prev =>
          prev
            ? { ...prev, newCode: result.result.converted_code || prev.newCode, advice: result.result.suggestions }
            : prev
        );
      }
    } catch (error) {
      console.error("AI Rethink 發生錯誤:", error instanceof Error ? error.message : error);
      setFiles(prevFiles =>
        prevFiles.map(f =>
          f.fileName === selectedFile!.fileName
            ? { ...f, error: "AI Rethink 失敗", loading: false }
            : f
        )
      );
    } finally {
      setProgress(1);
      setIsUpdating(false);
    }
  };

  return { handleConfirmRethink };
}
