import openai
import pandas as pd
from config import Config

openai.api_key = Config.OPENAI_API_KEY


def process_with_gpt(file_path):
    # 读取Excel内容
    df = pd.read_excel(file_path)

    # 转换为文本格式
    text_data = df.to_string()

    # 调用GPT API
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "你是一个数据分析助手，请分析以下表格数据:"},
            {"role": "user", "content": text_data[:3000]}  # 限制长度
        ],
        max_tokens=500
    )

    return response.choices[0].message['content']