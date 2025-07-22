import requests
import json
import time

# 等待服务器启动
time.sleep(3)

def test_data_structure():
    try:
        url = "http://localhost:8088/debug/data_structure"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print("=== Data Structure Debug Info ===")
            print(json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print(f"Error: Status code {response.status_code}")
            print("Response:", response.text)
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_data_structure() 