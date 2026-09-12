import os
import requests

BASE_URL = "http://localhost:8000"

def test_events_flow():
    # 1. Reset/seed month of events for DemoAccount
    r = requests.post(f"{BASE_URL}/api/events/seed", json={"username": "DemoAccount", "month": 9, "reset_all": True})
    assert r.status_code == 200, f"Seed failed: {r.text}"
    data = r.json()
    assert data["success"] is True
    assert len(data["events"]) == 30
    print(f"Successfully seeded {len(data['events'])} events for DemoAccount")

    # Verify all are uncompleted
    completed = [e for e in data["events"] if e["is_completed"]]
    print(f"Completed events count initially: {len(completed)}")
    assert len(completed) == 0

    # 2. Complete Day 12
    r2 = requests.post(f"{BASE_URL}/api/events/complete", json={
        "username": "DemoAccount",
        "day_number": 12,
        "event_date": "2026-09-12",
        "xp_awarded": 120
    })
    assert r2.status_code == 200
    res2 = r2.json()
    assert res2["success"] is True
    print(f"Completed Day 12! New streak: {res2['user']['streak_days']}, XP: {res2['user']['xp']}")

    # 3. Fetch events again
    r3 = requests.get(f"{BASE_URL}/api/events?username=DemoAccount&month=9")
    res3 = r3.json()
    day12 = [e for e in res3["events"] if e["day_number"] == 12][0]
    assert day12["is_completed"] is True
    assert day12["status"] == "completed"
    print("Verified Day 12 status in DB is completed")

    # 4. Change plan to Marathon Prep
    r4 = requests.post(f"{BASE_URL}/api/plan/save", json={
        "username": "DemoAccount",
        "race_type": "Marathon Prep",
        "race_date": "December 10, 2026",
        "plan_data": {
            "goal": "Prepare for Marathon Prep",
            "weeks": [
                {
                    "week_number": 1,
                    "focus": "Marathon Aerobic Engine",
                    "days": [
                        {"day": "Monday", "workout_type": "Easy Marathon Base", "description": "8 km easy"},
                        {"day": "Tuesday", "workout_type": "Marathon Tempo", "description": "10 km at marathon pace"},
                        {"day": "Wednesday", "workout_type": "Mid-week Medium Long", "description": "12 km aerobic"},
                        {"day": "Thursday", "workout_type": "Rest", "description": "Full rest"},
                        {"day": "Friday", "workout_type": "Strides & Easy", "description": "6 km easy + 6 strides"},
                        {"day": "Saturday", "workout_type": "Saturday Pace Run", "description": "8 km tempo"},
                        {"day": "Sunday", "workout_type": "Marathon Long Run", "description": "24 km Zone 2"},
                    ]
                }
            ]
        }
    })
    assert r4.status_code == 200
    print("Saved Marathon Prep plan")

    # 5. Check events again: Day 12 completed status preserved, future days (13+) updated
    r5 = requests.get(f"{BASE_URL}/api/events?username=DemoAccount&month=9")
    res5 = r5.json()
    events = res5["events"]
    day12_after = [e for e in events if e["day_number"] == 12][0]
    day13_after = [e for e in events if e["day_number"] == 13][0]

    assert day12_after["is_completed"] is True, "Day 12 completion status should be preserved!"
    print(f"Day 12 preserved: completed={day12_after['is_completed']}, workout={day12_after['workout_type']}")
    print(f"Day 13 updated: completed={day13_after['is_completed']}, workout={day13_after['workout_type']}")

    # 6. Finally, reset month so initially no events are completed, as requested by user
    requests.post(f"{BASE_URL}/api/events/seed", json={"username": "DemoAccount", "month": 9, "reset_all": True})
    print("ALL TESTS PASSED! Re-seeded fresh month with 0 completed events.")

if __name__ == "__main__":
    test_events_flow()
