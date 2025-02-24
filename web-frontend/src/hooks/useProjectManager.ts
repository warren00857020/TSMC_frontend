// hooks/useProjectManager.ts
import { useState } from 'react';
import { useFileUpload } from './useFileUpload';
import { useBackendOperations } from './useBackendOperations';
import { useProcessManager } from './useProcessManager';
import { useDeploymentOperations } from './useDeploymentOperations';
import { useAIRethink } from './useAIRethink';
import { FileRecord } from '../types';

export function useProjectManager() {
  // 檔案上傳相關
  const { files, setFiles, pendingFiles, handleProjectUpload } = useFileUpload();

  // 選取檔案與其他 state
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [advice, setAdvice] = useState<string>('');

  // 與後端溝通的功能
  const { sendFilesToBackend, sendFilesToMultiBackend } = useBackendOperations(setFiles, setSelectedFile);

  // 處理進度相關狀態
  const {
    isTesting,
    setIsTesting,
    progress,
    setProgress,
    testProgress,
    setTestProgress,
    testResult,
    setTestResult,
    isUpdating,
    setIsUpdating,
    startProcessing,
    finishProcessing,
  } = useProcessManager();

  // AI Rethink
  const { handleConfirmRethink } = useAIRethink(
    selectedFile,
    setFiles,
    setSelectedFile,
    setIsUpdating,
    setProgress
  );

  // 先定義 log 與 Modal 相關 state
  const [fileLogs, setFileLogs] = useState<{ [fileName: string]: string }>({});
  const [logModal, setLogModal] = useState<{ isOpen: boolean; log: string; fileName: string }>({
    isOpen: false,
    log: '',
    fileName: ''
  });

  const openLogModal = (fileName: string) => {
    setLogModal({ isOpen: true, log: fileLogs[fileName], fileName });
  };

  const closeLogModal = () => {
    setLogModal({ isOpen: false, log: '', fileName: '' });
  };

  // 現在 setFileLogs 已經定義好，可以傳入 useDeploymentOperations
  const {
    handleGenerateConfigs,  // 產生配置檔與自動部署
    handleTestProject,      // 測試專案（UnitTest、部署 GKE）
  } = useDeploymentOperations(files, setFiles, setFileLogs, setIsTesting, setTestProgress, setTestResult);

  // 處理 Prompt 確認
  const handleConfirmPrompt = async (prompt: string, processingMode: string) => {
    if (!prompt.trim()) {
      alert("請輸入 Prompt！");
      return;
    }
    setProgress(0);
    setIsUpdating(true);

    try {
      if (processingMode === "single") {
        await Promise.all(
          files.map(async (file) => {
            await sendFilesToBackend(file, prompt);
            setProgress(prev => prev + 1);
          })
        );
      } else if (processingMode === "multi") {
        await sendFilesToMultiBackend(files, prompt);
        setProgress(files.length);
      }
    } catch (error) {
      console.error("更新檔案時發生錯誤：", error);
    }
    setIsUpdating(false);
  };

  return {
    files,
    setFiles,
    pendingFiles,
    selectedFile,
    setSelectedFile,
    advice,
    setAdvice,
    handleProjectUpload,
    sendFilesToBackend,
    sendFilesToMultiBackend,
    handleConfirmPrompt,
    isTesting,
    setIsTesting,
    progress,
    setProgress,
    testProgress,
    setTestProgress,
    testResult,
    setTestResult,
    isUpdating,
    setIsUpdating,
    startProcessing,
    finishProcessing,
    fileLogs,
    setFileLogs,
    logModal,
    openLogModal,
    closeLogModal,
    handleConfirmRethink,
    handleGenerateConfigs,
    handleTestProject,
  };
}
