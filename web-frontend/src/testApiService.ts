// testApiService.ts

// 模擬延遲函式，模擬網路延遲效果
function simulateDelay<T>(data: T, delay = 1000): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

// 模擬 unified_operation 的回應
export async function unifiedOperation(prompt: string): Promise<any> {
    console.log("Mock unifiedOperation called with prompt:", prompt);
    return simulateDelay({
        result: {
        converted_code: "這是測試轉換後的程式碼",
        suggestions: "這是測試建議，請參考..."
        }
    });
}

// 模擬 deployment_files 的回應
export async function deploymentFiles(fileName: string, code: string): Promise<any> {
    console.log("Mock deploymentFiles called with:", fileName, code);
    return simulateDelay({
        dockerfile: "# 測試 Dockerfile 內容\nFROM node:14",
        yaml: "# 測試 YAML 內容\napiVersion: v1\nkind: Pod"
    });
}

// 模擬 unit_test 的回應
export async function generateUnitTest(fileName: string, code: string): Promise<any> {
    console.log("Mock generateUnitTest called with:", fileName, code);
    return simulateDelay({
        unit_test: "這是測試產生的 Unit Test 程式碼"
    });
}

// 模擬 process_multi_files 的回應
export async function processMultiFiles(task: string, files: { file_name: string, content: string }[]): Promise<any> {
    console.log("Mock processMultiFiles called with:", task, files);
    const processedFiles = files.map(file => ({
        file_name: file.file_name,
        content: file.content + "\n// 已處理"
    }));
    return simulateDelay({ files: processedFiles });
}

// 模擬 deploy (GKE 部屬) 的回應
export async function deployGKE(payload: string, timeout: number = 100000): Promise<any> {
    console.log("Mock deployGKE called with payload:", payload);
    return simulateDelay({
        status: "success",
        kubectl_logs: btoa("這是測試的 kubectl log")
    });
}
  