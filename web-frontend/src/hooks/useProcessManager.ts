// hooks/useProcessManager.ts
import { useState } from 'react';

export function useProcessManager() {
  const [isTesting, setIsTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testProgress, setTestProgress] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const startProcessing = () => {
    setIsTesting(true);
    setProgress(0);
    setTestProgress(["開始測試專案…"]);
    setTestResult("專案在 GKE 測試中…");
    setIsUpdating(true);
  };

  const finishProcessing = () => {
    setIsTesting(false);
    setIsUpdating(false);
  };

  return {
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
  };
}
