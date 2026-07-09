import os
from dotenv import load_dotenv

load_dotenv()

CITY_NAME = os.getenv("CITY_NAME", "Bengaluru")
CITY_LAT = float(os.getenv("CITY_LAT", "12.9716"))
CITY_LON = float(os.getenv("CITY_LON", "77.5946"))

# The average temperature the original synthetic seed dataset was authored around.
# Each ward's "heat island offset" (how much hotter/cooler it runs than the city
# average) is computed relative to this number, then re-applied on top of the
# live temperature we pull from Open-Meteo.
REFERENCE_CITY_TEMP = float(os.getenv("REFERENCE_CITY_TEMP", "38.4"))

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./urbanheat.db")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
WEATHER_CACHE_MINUTES = int(os.getenv("WEATHER_CACHE_MINUTES", "30"))

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
