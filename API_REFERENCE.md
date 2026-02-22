# 📘 API Reference Documentation

## Base URL

http://localhost:3000/api

---

# 🌍 1️⃣ Districts API

## 🔹 GET `/api/districts`

### 📖 Description

Fetches a list of districts from the database.  
Supports search and state-based filtering.  
Results are cached for performance.

---

### 🔎 Query Parameters

| Parameter | Type   | Required | Description |
|------------|--------|----------|-------------|
| `q`        | string | No       | Search term (matches district name, slug, or state) |
| `state`    | string | No       | Filter districts by exact state |

---

### 🧪 Example Requests

**Get all districts**

```bash
curl http://localhost:3000/api/districts

Search districts

curl "http://localhost:3000/api/districts?q=chen"

Filter by state

curl "http://localhost:3000/api/districts?state=Tamil%20Nadu"

Example Response
[
  {
    "id": "district123",
    "name": "Chennai",
    "slug": "chennai",
    "state": "Tamil Nadu"
  }
]

Status Codes

| Code | Description               |
| ---- | ------------------------- |
| 200  | Success                   |
| 500  | Failed to fetch districts |

Error Example
{
  "error": "Failed to fetch districts"
}

🌱 2️⃣ Plant API
🔹 POST /api/plant
📖 Description

Submits a tree plantation contribution.

This API:

Validates district

Analyzes tree image using Gemini AI

Calculates oxygen production

Saves contribution to Firestore

Updates contributor profile (if user provided)

📦 Request Type

multipart/form-data
⚠️ Requires image upload.

📝 Required Fields
| Field        | Type   | Required | Description          |
| ------------ | ------ | -------- | -------------------- |
| districtId   | string | Yes      | District document ID |
| districtName | string | Yes      | Name of district     |
| state        | string | Yes      | State name           |
| treeName     | string | Yes      | Tree name            |
| image        | file   | Yes      | Tree image           |

📝 Optional Fields
| Field            | Type                         |
| ---------------- | ---------------------------- |
| treeQuantity     | number                       |
| userId           | string                       |
| userName         | string                       |
| userEmail        | string                       |
| contributionType | string (plantation/donation) |


🧪 Example (Frontend)
const formData = new FormData();
formData.append("districtId", "abc123");
formData.append("districtName", "Chennai");
formData.append("state", "Tamil Nadu");
formData.append("treeName", "Neem");
formData.append("treeQuantity", "5");
formData.append("image", fileInput.files[0]);

await fetch("/api/plant", {
  method: "POST",
  body: formData
});

📦 Success Response
{
  "message": "Tree contribution analyzed and saved successfully",
  "contributionId": "auto_generated_id",
  "matrix": {
    "treeName": "Neem",
    "treeQuantity": 5,
    "o2ProductionPerYear": 110,
    "estimatedLifespan": 50,
    "totalLifespanO2": 27500,
    "speciesConfidence": "medium"
  }
}

📡 Status Codes
| Code | Description             |
| ---- | ----------------------- |
| 200  | Success                 |
| 400  | Missing required fields |
| 404  | District not found      |
| 500  | Server error            |

❌ Error Example
{
  "error": "District, tree name, and image are required"
}


🏆 3️⃣ Leaderboard API
🔹 GET /api/leaderboard
📖 Description

Fetches ranked leaderboard data.

Sorted by rank (ascending)

Supports optional limit parameter

Uses caching headers

🔎 Query Parameters
| Parameter | Type   | Required | Default |
| --------- | ------ | -------- | ------- |
| `limit`   | number | No       | 35      |

🧪 Example Requests

Get default leaderboard

curl http://localhost:3000/api/leaderboard

Get top 10

curl "http://localhost:3000/api/leaderboard?limit=10"

📦 Example Response
[
  {
    "id": "state123",
    "state": "Tamil Nadu",
    "rank": 1,
    "totalOxygen": 450000,
    "totalTrees": 5000
  }
]

📡 Status Codes
| Code | Description                 |
| ---- | --------------------------- |
| 200  | Success                     |
| 500  | Failed to fetch leaderboard |


---
Documentation updated for Issue #129