from fastapi import FastAPI
from routers import convert
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
@app.get("/")
def main():
    return {"message": "Hello World"}

app.include_router(convert.router)
