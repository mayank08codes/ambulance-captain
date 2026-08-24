from math import radians, sin, cos, sqrt, atan2

origin = (28.6075, 77.2295)
hospitals = {
    "Dr. Ram Manohar Lohia Hospital": (28.6259241, 77.2008646),
    "Lok Nayak Hospital": (28.6394, 77.2404),
    "Govind Ballabh Pant Hospital": (28.6386, 77.2421),
    "Lady Hardinge Medical College & Associated Hospitals": (28.634138, 77.212909),
}

def km(a, b):
    lat1, lon1 = map(radians, a)
    lat2, lon2 = map(radians, b)
    dlat, dlon = lat2 - lat1, lon2 - lon1
    x = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return 6371 * 2 * atan2(sqrt(x), sqrt(1 - x))

for name, coords in hospitals.items():
    print(f"{name}: {km(origin, coords):.2f} km")
