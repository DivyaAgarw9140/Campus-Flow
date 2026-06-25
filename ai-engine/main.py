import os
os.environ["KMP_DUPLICATE_LTB_OK"]="TRUE"
import pandas as pd
import numpy as np
from fastapi import FastAPI
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from sklearn.linear_model import LinearRegression
from statsmodels.tsa.arima.model import ARIMA # Amazon Level Time-Series Model
from dotenv import load_dotenv
import datetime

# Setup
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Connection
url = "https://olvwknoslyjwarfdsltx.supabase.co"
key =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
print(f"DEBUG: Supabase URL is -> {url}")
print(f"DEBUG: Supabase Key starts with -> {key[:10]}...") # Sirf pehle 10 characters dikhayega security ke liye
try:
    supabase = create_client(url, key)
except Exception as e:
    print(f"Connection failed :{e}")
# --- MODEL 1: WAIT TIME (Linear Regression) ---
wait_model = LinearRegression()
is_wait_trained = False

# --- MODEL 2: DEMAND FORECAST (ARIMA) ---
# ARIMA models are usually fit on-the-fly for specific items

def train_wait_model():
    global is_wait_trained
    prices =[30,50,60,80,100,120,140,160]
    times=[3,5,6,7,8,9,10,12]
    wait_model.fit(np.array(prices).reshape(-1,1),np.array(times))
    is_wait_trained=True
    print("Wait-Time Model Trained on seed data")
    try:
        res = supabase.table('orders').select('prep_started_at, prep_finished_at, total_price').not_.is_('prep_finished_at', 'null').execute()
        if len(res.data) >= 3:
            df = pd.DataFrame(res.data)
            df['start'] = pd.to_datetime(df['prep_started_at'])
            df['end'] = pd.to_datetime(df['prep_finished_at'])
            df['actual_time'] = (df['end'] - df['start']).dt.total_seconds() / 60
            wait_model.fit(df[['total_price']].values, df['actual_time'].values)
            is_wait_trained = True
            print("✅ Wait-Time Model Trained")
    except Exception as e:
        print(f"❌ Wait-Time Training Failed: {e}")

@app.get("/predict-wait-time")
async def predict_wait(price: float):
   
    queue_size=3
    
    if is_wait_trained:
        base_pred = wait_model.predict([[price]])[0]
        final_prediction = base_pred + (queue_size * 2)
    else:
        final_prediction = 5 + (queue_size * 3)
        
    return {"estimated_minutes": round(max(2, final_prediction), 1)}

# --- NEW: DEMAND FORECASTING ENDPOINT (ARIMA) ---
@app.get("/forecast-demand")
async def forecast_demand(item_id: int):
    try:
        items_map = {1: "Samosa", 2: "Maggi", 3: "Cold Coffee", 4: "Sandwich", 5: "Chai"}
        item_name = items_map.get(item_id, "Item")
        
        np.random.seed(item_id * 42)
        series = np.random.randint(10, 50, size=30).tolist()
        
        model = ARIMA(series, order=(2, 1, 0))
        model_fit = model.fit()
        forecast = model_fit.forecast(steps=1)
        predicted_qty = int(round(max(0, forecast[0])))
        
        return {
            "item_id": item_id,
            "item_name": item_name,
            "predicted_demand_next_hour": predicted_qty,
            "trend": "Increasing" if predicted_qty > np.mean(series) else "Stable"
        }
    except Exception as e:
        return {"error": str(e)}
@app.on_event("startup")
async def startup():
    train_wait_model()