import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE" # YEH SABSE UPAR HONA CHAHIYE
import pytest
from fastapi.testclient import TestClient
from main import app,train_wait_model

client = TestClient(app)

def test_predict_endpoint():
    train_wait_model()
    response = client.get("/predict-wait-time?price=100")
    assert response.status_code == 200
    assert "estimated_minutes" in response.json()
    print(f"\n✅ Prediction received: {response.json()['estimated_minutes']} mins")