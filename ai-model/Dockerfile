# ai-model/Dockerfile

FROM python:3.13-slim

WORKDIR /app

# 시스템 패키지 설치 + pip 업그레이드 + Python 패키지 설치
RUN apt-get update && \
    apt-get install -y libgl1 libglib2.0-0 && \
    pip install --upgrade pip

# 프로젝트 코드와 모델 복사
COPY . /app
COPY best.pt /app/

# Python 의존성 설치
RUN pip install --no-cache-dir -r requirements.txt

# AI 서버 실행
CMD ["python", "ai_server.py"]
