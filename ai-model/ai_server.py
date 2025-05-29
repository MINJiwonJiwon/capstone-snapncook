# ai-model/ai_server.py

from typing import Any, List
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import tempfile
import cv2 # type: ignore

app = FastAPI()
model = YOLO("best.pt")  # 모델 로딩

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    results = model.predict(source=tmp_path, save=False, conf=0.5) # type: ignore
    detected: List[Any] = []
    for result in results:
        for box in result.boxes: # type: ignore
            class_id = int(box.cls) # type: ignore
            class_name = model.names[class_id]
            confidence = float(box.conf) # type: ignore
            detected.append({"name": class_name, "confidence": confidence})

    return JSONResponse(content={"detected": detected})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
