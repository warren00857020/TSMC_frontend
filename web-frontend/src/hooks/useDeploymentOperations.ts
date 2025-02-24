// hooks/useDeploymentOperations.ts
import { Dispatch, SetStateAction } from 'react';
import { deploymentFiles, deployGKE, generateUnitTest } from '../testApiService';
import { FileRecord } from '../types';
import { b64EncodeUnicode } from '../utils/b64EncodeUnicode';

export function useDeploymentOperations(
  files: FileRecord[],
  setFiles: (files: FileRecord[]) => void,
  setFileLogs: (logs: { [fileName: string]: string }) => void,
  setIsTesting: Dispatch<SetStateAction<boolean>>,
  setTestProgress: Dispatch<SetStateAction<string[]>>, // 接受函式更新
  setTestResult: Dispatch<SetStateAction<string | null>>
) {

  // 產生部署檔案（Dockerfile & YAML）並自動部署
  const handleGenerateConfigs = async () => {
    if (!files || files.length === 0) return;

    const logsObj: Record<string, string> = {};

    for (const file of files) {
      try {
        const fileNamePart = file.fileName.split('/').pop() || 'unknown.txt';
        const result = await deploymentFiles(fileNamePart, file.newCode);

        // 部署 GKE
        const base64YamlContent = b64EncodeUnicode(result.yaml || '');
        const base64DockerfileContent = b64EncodeUnicode(result.dockerfile || '');
        const base64NewCode = b64EncodeUnicode(file.newCode || '');

        const singlePayload = JSON.stringify({
          code_files: [{ filename: fileNamePart, content: base64NewCode }],
          job_yaml: base64YamlContent,
          dockerfile: base64DockerfileContent,
        });

        const deployResult = await deployGKE(singlePayload);

        logsObj[file.fileName] = logsObj[file.fileName] || "";
        if (deployResult.status === "success" && deployResult.kubectl_logs) {
          logsObj[file.fileName] += "=== KUBECTL LOGS ===\n" + atob(deployResult.kubectl_logs) + "\n\n";
        }
      } catch (error) {
        console.error("產生部署檔案失敗 for file:", file.fileName, error);
      }
    }

    setFileLogs(logsObj);
  };

  // 產生 UnitTest、Dockerfile、YAML，並送至 GKE 測試
  const handleTestProject = async () => {
    setIsTesting(true);
    setTestProgress(["開始測試專案…"]);
    setTestResult("專案在 GKE 測試中…");

    const newFiles = [...files];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];

      try {
        const unitTestResult = await generateUnitTest(file.fileName.split('/').pop() || '', file.newCode);
        file.unitTestCode = unitTestResult.unit_test;
        setTestProgress(prev => [...prev, `UnitTest 產生完成: ${file.fileName}`]);

        const originalName = file.fileName.split('/').pop() || '';
        const newName = originalName.replace('.java', 'Test.java');
        const deployResult = await deploymentFiles(newName, file.unitTestCode || "");
        file.dockerfileContent = deployResult.dockerfile;
        file.yamlContent = deployResult.yaml;
        setTestProgress(prev => [...prev, `部署檔案產生完成: ${file.fileName}`]);

      } catch (error) {
        console.error(`產生測試或部署檔案失敗: ${file.fileName}`, error);
        continue;
      }
    }

    setFiles(newFiles);
    setTestProgress(prev => [...prev, "GKE 部署測試完成"]);
    setTestResult("所有檔案測試完成");
    setIsTesting(false);
  };

  return {
    handleGenerateConfigs,
    handleTestProject,
  };
}
