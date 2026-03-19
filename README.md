# Video KYC Application

A full-stack Video KYC web application built with React on the frontend and Node.js + Express on the backend. Users register, verify email, submit a KYC application, and complete a browser-based video verification flow for PAN and face matching. Admin users can review applications, monitor queue metrics, and inspect submitted assets.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Redux Toolkit, React Router, Tailwind CSS |
| Backend | Node.js, Express, Joi, Multer |
| Database | MongoDB with Mongoose |
| OCR / Vision | Tesseract OCR, optional OpenAI Responses API vision path |
| Auth | JWT, refresh tokens, Google OAuth |
| UI / Charts | SweetAlert2, Recharts, React Icons |

## Current Features

- User registration, login, logout, forgot/reset password, Google login
- Email verification with resend-verification flow from login
- KYC form with PAN validation, signature pad, and profile photo upload
- User applications list with status and remaining verification attempts
- Browser-based Video KYC flow with:
  - webcam access
  - PAN auto-alignment guidance
  - PAN guide-box auto-crop before upload
  - face alignment guidance
  - speech prompts
- Backend verification flow with:
  - PAN OCR
  - face comparison
  - attempt tracking with max retry limit
- Admin dashboard, KYC queue, user management, and application review
- Server-side pagination on admin user list and KYC queue
- Responsive admin layout with mobile drawer navigation

## Important Implementation Notes

- Profile images can use Cloudinary.
- KYC assets such as PAN capture, selfie capture, and signature are stored as paths and served from backend static uploads unless a remote URL is stored.
- PAN OCR uses local OCR first. OpenAI OCR is only used as a stricter fallback if configured.
- Face comparison prefers OpenAI vision when configured. If unavailable, the app falls back to local comparison logic.
- On newer Node runtimes, the advanced local TensorFlow face stack may be skipped and fallback mode may be used.

## Project Structure

```text
video-kyc/
├── frontend/
└── backend/
```

## Setup

### Prerequisites

- Node.js 18+ recommended
- MongoDB running locally or via Atlas

### Backend

```bash
cd backend
npm install
cp .env.example .env
node src/server.js
```

For auto-reload during development:

```bash
npx nodemon src/server.js
```

Backend runs on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Environment Variables

Use:

- [backend/.env.example](/home/she/Desktop/QserviceProject/video-kyc/backend/.env.example)
- [frontend/.env.example](/home/she/Desktop/QserviceProject/video-kyc/frontend/.env.example)

Important rules:

- never commit real `.env` files
- never put backend secrets in frontend env files
- `VITE_GOOGLE_CLIENT_ID` is safe for frontend
- `GOOGLE_CLIENT_SECRET`, JWT secrets, email credentials, and API keys must stay in backend only

If you want OpenAI-backed OCR / face comparison, add these in backend `.env`:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_VISION_MODEL=gpt-4.1-mini
```

## Main User Flow

1. Register a new account
2. Verify email from the link sent to inbox
3. If email does not arrive, try login and use `Resend Verification Email`
4. Log in and submit KYC form
5. Open the pending application and start Video KYC
6. Capture PAN and selfie
7. Backend verifies PAN and face
8. Application becomes `Verified`, remains `Pending`, or becomes `Rejected` after max attempts

## Admin Flow

- Dashboard shows verification metrics and recent activity
- KYC Queue lists pending applications with pagination
- User Directory lists users with pagination and CSV export
- Admin review page shows:
  - uploaded profile photo
  - live selfie capture
  - PAN image
  - signature
  - verification result and score

## API Summary

Base URL: `http://localhost:5000/api/v1`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/resend-verification`
- `GET /auth/verify-email?token=...`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/google/callback?token=...`

### User

- `GET /user/me`
- `PATCH /user/update-profile`
- `PATCH /user/change-password`
- `DELETE /user/delete-account`

### KYC

- `POST /kyc/submit`
- `GET /kyc/applications`
- `POST /kyc/verify`

### Admin

- `GET /kyc/admin/dashboard`
- `GET /kyc/admin/queue?page=1&limit=10`
- `GET /kyc/admin/application/:id`
- `GET /user/admin/all-users?page=1&limit=10`
- `GET /user/admin/security-logs?page=1&limit=10`
- `PATCH /user/admin/deactivate/:id`
- `PATCH /user/admin/activate/:id`

## Data / Storage Behavior

- MongoDB stores application records and image path references
- frontend admin review converts stored path values into fetchable asset URLs
- backend statically serves `/uploads`
- if a local image file is deleted from uploads, the DB path will still exist but the image will no longer render in frontend

## Known Limitations

- PAN auto-detection is heuristic-guided, not a trained card detector
- fallback face matching is demo-oriented and not production-grade biometric verification
- OpenAI vision path requires valid API key and network connectivity
- local face comparison behavior depends on runtime compatibility

## Verification Commands

Frontend production build:

```bash
cd frontend
npm run build
```

Backend quick module checks:

```bash
cd backend
node -e "require('./src/modules/kyc/kyc.service')"
node -e "require('./src/modules/user/user.service')"
```

## Submission Notes

- include only `.env.example`, never real secrets
- record a demo showing register -> verify email -> submit KYC -> video verify -> admin review
- if OpenAI is not configured, mention fallback OCR / face flow clearly during submission
