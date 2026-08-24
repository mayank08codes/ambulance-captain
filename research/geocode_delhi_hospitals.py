import json
import time
import requests

queries = [
    "Dr Ram Manohar Lohia Hospital New Delhi",
    "Maulana Azad Medical College Delhi Gate",
    "Govind Ballabh Pant Hospital Raj Ghat Delhi",
    "Lady Hardinge Medical College Associated Hospitals New Delhi",
]

for query in queries:
    response = requests.get(
        "https://nominatim.openstreetmap.org/search",
        params={"q": query, "format": "jsonv2", "limit": 1},
        headers={"User-Agent": "SavLifeCaptainResearch/1.0"},
        timeout=20,
    )
    response.raise_for_status()
    print(json.dumps({"query": query, "result": response.json()}, ensure_ascii=False))
    time.sleep(1)
