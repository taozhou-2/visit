import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # PostgreSQL 配置
    PG_USER = os.getenv('PG_USER', 'postgres')
    PG_PASSWORD = os.getenv('PG_PASSWORD', 'password')
    PG_HOST = os.getenv('PG_HOST', 'localhost')
    PG_PORT = os.getenv('PG_PORT', '5432')
    PG_DB = os.getenv('PG_DB', 'excel_data')
    SQLALCHEMY_DATABASE_URI = f'postgresql://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DB}'

    # 邮件配置
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True') == 'True'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', 'patrick.unsw.au@gmail.com')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', 'ehrd ldvi wcre bgcp')

    # OpenAI 配置
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', 'your-openai-api-key')

    # 文件存储
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    ALLOWED_EXTENSIONS = {'xlsx', 'xls','csv'}

    # 其他配置
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB