# 📹 Video KYC Application

A full-stack **Video Know Your Customer (KYC)** web application built with **React.js** (frontend) and **Node.js + Express** (backend). Users submit their identity details via a form, then complete a live webcam-guided KYC session where their face and PAN card are verified using on-device AI.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), Redux Toolkit, React Router, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| AI / OCR | `face-api.js` (face comparison), `Tesseract.js` (PAN OCR) |
| File Uploads | Multer |
| Auth | JWT + Google OAuth (Passport.js) |
| Validation | Joi |

---

## 📁 Project Structure

```
video-kyc/
├── frontend/     # React.js (Vite) app
└── backend/      # Node.js + Express API
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

---

### 1. Backend Setup

```bash
cd backend
cp .env.example .env      # Fill in your values
npm install
npm run dev               # Starts on http://localhost:5000
```

> **Important**: The backend uses `face-api.js` and requires model weight files inside `src/models/`. Download the following models from the [face-api.js weights repo](https://github.com/justadudewhohacks/face-api.js/tree/master/weights) and place them in `backend/src/models/`:
> - `ssd_mobilenetv1_model-weights_manifest.json` ✅ (already present)
> - `ssd_mobilenetv1_model-shard1`
> - `face_landmark_68_model-weights_manifest.json`
> - `face_landmark_68_model-shard1`
> - `face_recognition_model-weights_manifest.json`
> - `face_recognition_model-shard1`

---

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env      # Fill in your values
npm install
npm run dev               # Starts on http://localhost:5173
```

---

## 🔗 API Documentation

Base URL: `http://localhost:5000/api/v1`

| Endpoint | Method | Description | Request Body |
|---|---|---|---|
| `/kyc/submit` | POST | Submit KYC form | `multipart/form-data`: `panNumber`, `signature` (base64), `uploadedPhoto` (file) |
| `/kyc/applications` | GET | List all KYC applications | — |
| `/kyc/verify` | POST | Verify KYC via captured images | `multipart/form-data`: `applicationId`, `panCardImage` (file), `selfieImage` (file) |
| `/auth/register` | POST | Register a new user | `{ name, email, password }` |
| `/auth/login` | POST | Login | `{ email, password }` |

### Response Shape

**POST /kyc/submit**
```json
{
  "success": true,
  "message": "KYC submitted successfully",
  "data": { "_id": "...", "panNumber": "ABCDE1234F", "status": "Pending" }
}
```

**POST /kyc/verify**
```json
{
  "success": true,
  "data": {
    "faceMatch": true,
    "panMatch": true,
    "status": "Verified",
    "verificationMessage": "KYC Verified Successfully"
  }
}
```

---

## 🗄️ Database Schema

**KYCApplication** (MongoDB)

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `panNumber` | String | PAN card number (uppercase, validated) |
| `signature` | String | Digital signature as base64 PNG |
| `uploadedPhoto` | String | Path to uploaded selfie/photo |
| `panCardImage` | String | Path to captured PAN card image (from video) |
| `selfieImage` | String | Path to live selfie image (from video) |
| `faceMatch` | Boolean | Result of face comparison |
| `panMatch` | Boolean | Result of OCR PAN extraction match |
| `status` | Enum | `Pending` / `Verified` / `Rejected` |
| `verificationMessage` | String | Human-readable verification result |
| `submittedAt` | Date | Submission timestamp |

---

## 🤖 AI / LLM Integration

### Face Comparison
- **Library**: `face-api.js` (Node.js) with `canvas`
- **Model**: SSD MobileNet v1 for face detection, `faceRecognitionNet` for embedding
- **Logic**: Euclidean distance between face descriptors. Distance < 0.45 = match.

### PAN OCR
- **Library**: `Tesseract.js`
- **Logic**: Runs OCR on the captured PAN card image, then extracts a 10-character PAN pattern (`[A-Z]{5}[0-9]{4}[A-Z]{1}`) using regex.

---

## 💡 Design Decisions & Assumptions

1. **face-api.js vs OpenAI Vision**: Chose `face-api.js` for privacy (on-device inference, no data sent to third-party) and zero cost per request. Future upgrade path to GPT-4 Vision is prepared in `.env.example`.
2. **Signature stored as base64**: The digital signature from the canvas pad is sent as a base64 string and stored directly in MongoDB, avoiding extra file overhead for small vector data.
3. **Manual capture (no auto-detect)**: Auto-detection of PAN card in-frame using TensorFlow.js/face-api requires additional model training. The current UX uses an AI-guided manual capture button, which is reliable and production-safe.
4. **All KYC routes are user-scoped**: The KYC form and video session are accessible after login. The Applications List shows all submissions from the database (can be user-filtered by adding `userId` foreign key in a future iteration).
5. **MongoDB chosen over SQL**: Flexible schema suits iterative KYC status updates and embedded sub-documents.

---

## 📝 Environment Variables Reference

See [`backend/.env.example`](./backend/.env.example) and [`frontend/.env.example`](./frontend/.env.example).
