# 📹 Video KYC Application

A full-stack **Video Know Your Customer (KYC)** web application built with **React.js** (frontend) and **Node.js + Express** (backend). Users submit their identity details via a form, then complete a live webcam-guided KYC session where their face and PAN card are verified using on-device AI.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), Redux Toolkit, React Router, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| AI / OCR | `face-api.js` (backend face recognition), `Tesseract.js` (PAN OCR), browser `FaceDetector` + frame heuristics (frontend auto-capture guidance) |
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

> **Important**: The backend uses `face-api.js` for descriptor-based face matching and requires model weight files inside `src/models/`. Download the following models from the [face-api.js weights repo](https://github.com/justadudewhohacks/face-api.js/tree/master/weights) and place them in `backend/src/models/`:
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
    "applicationId": "...",
    "faceMatch": true,
    "faceMatchScore": 0.91,
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
- **Library**: `face-api.js` (Node.js) with `canvas` and `@tensorflow/tfjs-node`
- **Models**: SSD MobileNet v1 for face detection, `faceLandmark68Net` for landmarks, `faceRecognitionNet` for embeddings
- **Logic**: Extracts face descriptors from the uploaded image and the live selfie, then compares them using Euclidean distance. A distance of `<= 0.50` is treated as a match. The API also returns a normalized match score.

### PAN OCR
- **Library**: `Tesseract.js`
- **Logic**: Runs OCR on multiple cropped/enhanced passes of the captured PAN card image, then extracts a 10-character PAN pattern (`[A-Z]{5}[0-9]{4}[A-Z]{1}`) using regex and normalization.

---

## 💡 Design Decisions & Assumptions

1. **Local face recognition over third-party APIs**: Chose `face-api.js` on the backend so face verification can run without sending identity images to an external LLM/Vision provider. This keeps the demo self-contained and reduces privacy risk for KYC data.
2. **Signature stored as base64**: The digital signature from the canvas pad is sent as a base64 string and stored directly in MongoDB, avoiding extra file overhead for small vector data.
3. **Browser-guided auto-capture**: The video session uses browser camera APIs, on-screen guidance, speech synthesis, `FaceDetector` where available, and frame-quality heuristics for PAN/selfie auto-capture. It is a practical browser-side implementation, not a trained PAN-card detector.
4. **User-scoped KYC flow**: The KYC form, applications list, and video verification are available only to authenticated users. The applications list is scoped to the logged-in user.
5. **MongoDB chosen over SQL**: Flexible schema suits iterative KYC status updates and embedded sub-documents.

---

## 📝 Environment Variables Reference

See [`backend/.env.example`](./backend/.env.example) and [`frontend/.env.example`](./frontend/.env.example).
