from ultralytics import YOLO
import cv2 # type: ignore
# 1. 모델 불러오기 (학습한 모델 경로)
model = YOLO('ai-model/best.pt')  # 경로 수정 필요

# 2. 테스트할 이미지 경로
image_path = '테스트할 이미지 경로'  

# 3. 예측 수행
results = model.predict(source=image_path, save=False, conf=0.5) # type: ignore

# 4. 결과에서 라벨(class name) 추출
names = model.names  # 클래스 ID → 이름 매핑 딕셔너리

for result in results:
    for box in result.boxes: # type: ignore
        class_id = int(box.cls) # type: ignore
        class_name = names[class_id]
        print(f"탐지된 라벨: {class_name}")
