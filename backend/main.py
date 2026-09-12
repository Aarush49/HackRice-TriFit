from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import auth, onboarding, plans, events, wearables, tts

app = FastAPI(title="TriFit API")

# Enable Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# Register modular API routers
app.include_router(auth.router)
app.include_router(onboarding.router)
app.include_router(plans.router)
app.include_router(events.router)
app.include_router(wearables.router)
app.include_router(tts.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
