import os
import unittest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestTrainingPlan(unittest.TestCase):
    def test_generate_training_plan_post(self):
        """Test POST /api/training-plan with custom onboarding payload."""
        payload = {
            "race_type": "Olympic Triathlon",
            "race_date": "2026-11-15",
            "is_first_time": "No",
            "previous_time": "2h 45m",
            "fitness_level": "Intermediate",
            "training_days": 5,
            "equipment": ["Road Bike", "Swimming Pool", "Running Shoes"],
            "baseline_metrics": {"5k_pace": "5:15/km", "ftp": "210W"},
            "sleep_hours": "8 hours",
            "stress_level": "Low",
            "injuries": "None"
        }

        print("\n[TEST] Sending POST request to /api/training-plan...")
        response = client.post("/api/training-plan", json=payload)

        self.assertEqual(response.status_code, 200, f"Expected 200 OK, got {response.status_code}: {response.text}")
        self.assertEqual(response.headers.get("content-type"), "audio/mpeg")

        audio_bytes = response.content
        self.assertGreater(len(audio_bytes), 0, "Audio response body should not be empty")

        script_text = response.headers.get("X-Training-Plan-Text")
        print(f"[TEST SUCCESS] Received {len(audio_bytes)} bytes of audio MP3.")
        if script_text:
            print(f"[TEST SCRIPT] Generated Script:\n{script_text}\n")

        # Save output mp3 for manual listening verification
        output_file = "test_output.mp3"
        with open(output_file, "wb") as f:
            f.write(audio_bytes)
        print(f"[TEST FILE] Audio saved to '{os.path.abspath(output_file)}'")

    def test_generate_training_plan_get(self):
        """Test GET /api/training-plan using default DB profile fallback."""
        print("\n[TEST] Sending GET request to /api/training-plan...")
        response = client.get("/api/training-plan")

        self.assertEqual(response.status_code, 200, f"Expected 200 OK, got {response.status_code}: {response.text}")
        self.assertEqual(response.headers.get("content-type"), "audio/mpeg")
        self.assertGreater(len(response.content), 0, "Audio response body should not be empty")
        print(f"[TEST SUCCESS] GET request returned {len(response.content)} bytes of audio MP3.")

if __name__ == "__main__":
    unittest.main()
