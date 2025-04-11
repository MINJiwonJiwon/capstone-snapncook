import os
import sys
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# [1] backend 경로 추가
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

# [2] .env 불러오기
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# [3] 환경 변수에서 DB URL 구성
DB_USER = os.getenv("POSTGRES_USER")
DB_PASS = os.getenv("POSTGRES_PASSWORD")
DB_NAME = os.getenv("POSTGRES_DB")
DB_HOST = os.getenv("POSTGRES_HOST")
DB_PORT = os.getenv("POSTGRES_PORT")
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# [4] 모델 메타데이터 불러오기
from backend.db import Base
from backend.models import *

# Alembic 설정
config = context.config
fileConfig(config.config_file_name)
target_metadata = Base.metadata

# 마이그레이션 오프라인 실행 (SQL만 출력)
def run_migrations_offline():
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

# 마이그레이션 온라인 실행 (실제 DB에 적용)
def run_migrations_online():
    connectable = engine_from_config(
        {"sqlalchemy.url": DATABASE_URL},
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

# 실행 모드 결정
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
