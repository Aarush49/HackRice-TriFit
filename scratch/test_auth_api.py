import sys
import os
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append(os.path.abspath("backend"))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print("--- Testing API Endpoints ---")

# 1. Health Check
res = client.get("/")
print("Root status:", res.status_code, res.json())

# 2. Register Account
test_username = f"runner_{os.urandom(3).hex()}"
test_password = "securePassword123"

reg_res = client.post("/api/register", json={
    "username": test_username,
    "email": f"{test_username}@example.com",
    "password": test_password
})
print("Register response:", reg_res.status_code, reg_res.json())

# 3. Login
login_res = client.post("/api/login", json={
    "username": test_username,
    "password": test_password
})
print("Login response:", login_res.status_code, login_res.json())

token = login_res.json().get("access_token")

# 4. Get Current User Profile
me_res = client.get("/api/me", headers={"Authorization": f"Bearer {token}"})
print("Profile response:", me_res.status_code, me_res.json())
