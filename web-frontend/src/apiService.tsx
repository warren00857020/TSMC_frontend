// apiService.ts

// 發送 unified_operation 請求給 Flask 後端
export async function unifiedOperation(prompt: string): Promise<any> {
    const requestData = JSON.stringify({ prompt });
    const response = await fetch('/api/unified_operation', {
      method: 'POST',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: requestData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error! Status: ${response.status}, Details: ${errorText}`);
    }
    return response.json();
  }
  
  // 發送 deployment_files 請求給 Flask 後端
  export async function deploymentFiles(fileName: string, code: string): Promise<any> {
    const requestData = JSON.stringify({ file_name: fileName, code });
    const response = await fetch('/api/deployment_files', {
      method: 'POST',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: requestData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error! Status: ${response.status}, Details: ${errorText}`);
    }
    return response.json();
  }
  
  // 發送 unit_test 請求給 Flask 後端
  export async function generateUnitTest(fileName: string, code: string): Promise<any> {
    const requestData = JSON.stringify({ file_name: fileName, code });
    const response = await fetch('/api/unit_test', {
      method: 'POST',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: requestData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error! Status: ${response.status}, Details: ${errorText}`);
    }
    return response.json();
  }
  
  // 發送多檔案處理請求給 Flask 後端
  export async function processMultiFiles(task: string, files: { file_name: string, content: string }[]): Promise<any> {
    const payload = JSON.stringify({ task, files });
    const response = await fetch('/api/process_multi_files', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: payload,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error! Status: ${response.status}, Details: ${errorText}`);
    }
    return response.json();
  }
  
  // 發送 deploy 請求給 Flask 後端 (轉發至 GKE)
  export async function deployGKE(payload: string, timeout: number = 100000): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const response = await fetch('/api/deploy', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: payload,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error! Status: ${response.status}, Details: ${errorText}`);
    }
    return response.json();
  }
  