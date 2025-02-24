// hooks/useBackendOperations.ts
import { unifiedOperation, processMultiFiles } from '../testApiService';
//import { unifiedOperation, processMultiFiles } from '../apiService';
import { FileRecord } from '../types';
import React from 'react';

export function useBackendOperations(
  setFiles: React.Dispatch<React.SetStateAction<FileRecord[]>>,
  setSelectedFile: React.Dispatch<React.SetStateAction<FileRecord | null>>
) {
  const sendFilesToBackend = async (file: FileRecord, prompt: string) => {
    const fileToSend = `### User Prompt:\n${prompt}\n\n### File: ${file.fileName}\n\n${file.oldCode}`;
    try {
      const result = await unifiedOperation(fileToSend);
      if (result.result) {
        setFiles(prevFiles =>
          prevFiles.map(f =>
            f.fileName === file.fileName
              ? {
                  ...f,
                  newCode: result.result.converted_code || f.oldCode,
                  advice: result.result.suggestions,
                  loading: false,
                }
              : f
          )
        );
        setSelectedFile(prev =>
          prev && prev.fileName === file.fileName
            ? { ...prev, newCode: result.result.converted_code || prev.oldCode, advice: result.result.suggestions }
            : prev
        );
      }
    } catch (error) {
      setFiles(prevFiles =>
        prevFiles.map(f =>
          f.fileName === file.fileName
            ? { ...f, error: "傳送檔案失敗", loading: false }
            : f
        )
      );
    }
  };

  const sendFilesToMultiBackend = async (files: FileRecord[], prompt: string) => {
    const filesToSend = files.map(file => ({
      file_name: file.fileName.split('/').pop() || 'unknown.txt',
      content: file.oldCode,
    }));

    try {
      const result = await processMultiFiles(prompt, filesToSend);
      if (result.files && Array.isArray(result.files)) {
        const updatedFiles = files.map(file => {
          const fileNameOnly = file.fileName.split('/').pop();
          const fileResult = result.files.find((res: any) => res.file_name === fileNameOnly);
          if (fileResult) {
            return {
              ...file,
              newCode: fileResult.content,
              advice: Array.isArray(fileResult.suggestions)
                ? fileResult.suggestions.join("\n")
                : fileResult.suggestions,
              loading: false,
            };
          }
          return file;
        });
        setFiles(updatedFiles);
      }
    } catch (error) {
      setFiles(prevFiles =>
        prevFiles.map(f => ({ ...f, error: "批次處理失敗", loading: false }))
      );
    }
  };

  return { sendFilesToBackend, sendFilesToMultiBackend };
}
