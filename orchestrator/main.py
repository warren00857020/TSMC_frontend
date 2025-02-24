from flask import Flask, request, jsonify
from flask_cors import CORS  # 請確保這一行存在
import os
import subprocess
import random

app = Flask(__name__)
CORS(app)  # 啟用全域 CORS

# 定義一些隨機插入的程式碼
EXTRA_LINES = [
    "# This is an auto-generated comment\n",
    "import time\n",
]

def modify_python_code(old_code):
    """ 隨機插入 1~3 行新的 Python 程式碼 """
    code_lines = old_code.split('\n')

    num_insertions = random.randint(0, 2)
    for _ in range(num_insertions):
        insert_pos = random.randint(0, len(code_lines))  # 隨機插入點
        code_lines.insert(insert_pos, random.choice(EXTRA_LINES))

    new_code = '\n'.join(code_lines)

    return new_code 


@app.route("/")
def home():
    return "Flask API is running!"

@app.route("/health")
def health():
    return "OK", 200  # ✅ healthcheck 會用到這個


# 統一處理：轉發 unified_operation 請求
@app.route('/api/unified_operation', methods=['POST'])
def unified_operation():
    payload = request.get_json()
    try:
        response = requests.post(
            'http://140.120.14.104:12345/llm/code/unified_operation',
            json=payload
        )
        response.raise_for_status()
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 轉發部署檔案 (Dockerfile & YAML) 請求
@app.route('/api/deployment_files', methods=['POST'])
def deployment_files():
    payload = request.get_json()
    try:
        response = requests.post(
            'http://140.120.14.104:12345/llm/code/deployment_files',
            json=payload
        )
        response.raise_for_status()
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 轉發產生 UnitTest 的請求
@app.route('/api/unit_test', methods=['POST'])
def unit_test():
    payload = request.get_json()
    try:
        response = requests.post(
            'http://140.120.14.104:12345/llm/code/unit_test',
            json=payload
        )
        response.raise_for_status()
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 轉發多檔案處理請求
@app.route('/api/process_multi_files', methods=['POST'])
def process_multi_files():
    payload = request.get_json()
    try:
        response = requests.post(
            'http://140.120.14.104:12345/llm/code/process_multi_files',
            json=payload
        )
        response.raise_for_status()
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 轉發 GKE 部屬請求
@app.route('/api/deploy', methods=['POST'])
def deploy():
    payload = request.get_json()
    try:
        response = requests.post(
            'http://34.170.57.238/deploy',
            json=payload,
            timeout=100  # 設定超時
        )
        response.raise_for_status()
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # 注意：實際上線時請不要開啟 debug 模式，並根據需要設定 host 與 port
    app.run(host='0.0.0.0', port=5000, debug=True)
