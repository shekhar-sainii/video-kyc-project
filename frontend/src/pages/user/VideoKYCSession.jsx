import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiCamera, FiShield, FiMic, FiRefreshCw } from "react-icons/fi";
import Swal from "sweetalert2";
import * as faceapi from "face-api.js";
import kycService from "../../services/kycService";

const VideoKYCSession = () => {
  const AUTO_FACE_STABLE_FRAMES = 3;
  const AUTO_PAN_STABLE_FRAMES = 4;
  // Analysis interval in step 3 is ~250ms; keep blink window generous (~10s).
  const AUTO_BLINK_WINDOW_FRAMES = 40;
  // After face is 3/3 aligned, ignore brief bad frames (blink / detector jitter).
  const SELFIE_MISALIGN_GRACE_FRAMES = 14;
  // With a relatively slow analysis interval, require only one detected
  // "eyes closed" sample frame to arm the blink.
  const MIN_BLINK_CLOSED_FRAMES = 1;

  const { id } = useParams();
  const navigate = useNavigate();
  const isDark = useSelector((state) => state.theme.mode === "dark");
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const capturedImagesRef = useRef({ pan: null, selfie: null });
  const startAttemptRef = useRef(0);
  const faceDetectorRef = useRef(null);
  const modelsLoadErrorRef = useRef(null);
  const frameSeqRef = useRef(0);
  const earOpenRef = useRef(null);
  const blinkClosedFramesRef = useRef(0);
  const blinkArmedRef = useRef(false);
  const lastBlinkSeqRef = useRef(-9999);
  const analysisIntervalRef = useRef(null);
  const captureLockRef = useRef(false);
  const switchInProgressRef = useRef(false);
  const availableVideoDevicesRef = useRef([]);
  const panStableFramesRef = useRef(0);
  const selfieStableFramesRef = useRef(0);
  // When selfie alignment reaches the threshold, we arm a short time window
  // in which the user must blink once to verify.
  const blinkVerificationArmedSeqRef = useRef(null);
  const selfieAlignedLatchedRef = useRef(false);
  const selfieMisalignedStreakRef = useRef(0);
  const [step, setStep] = useState(1); // 1: Intro, 2: PAN, 3: Selfie, 4: Verifying
  const [cameraState, setCameraState] = useState({ status: "loading", message: "Starting camera..." });
  const [cameraFacingMode, setCameraFacingMode] = useState("user");
  const [autoStatus, setAutoStatus] = useState("Initializing camera...");
  const [activeDeviceId, setActiveDeviceId] = useState(null);
  const [guideState, setGuideState] = useState("neutral");
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [panStableCount, setPanStableCount] = useState(0);
  const [selfieStableCount, setSelfieStableCount] = useState(0);
  /** True once face held steady 3/3; stays true through short dropout (blink / detector jitter). */
  const [selfieFaceReady, setSelfieFaceReady] = useState(false);

  const loadVideoDevices = async (preferredFacingMode = cameraFacingMode) => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return [];
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((device) => device.kind === "videoinput");
    availableVideoDevicesRef.current = videoInputs;

    if (!videoInputs.length) {
      return [];
    }

    const normalizedFacingMode = preferredFacingMode === "environment" ? "back" : "front";
    const matchedDevice = videoInputs.find((device) =>
      device.label.toLowerCase().includes(normalizedFacingMode)
    );

    if (matchedDevice?.deviceId) {
      setActiveDeviceId(matchedDevice.deviceId);
    } else if (!activeDeviceId && videoInputs[0]?.deviceId) {
      setActiveDeviceId(videoInputs[0].deviceId);
    }

    return videoInputs;
  };

  const getFrameMetrics = (ctx, x, y, width, height) => {
    const { data } = ctx.getImageData(x, y, width, height);
    let totalBrightness = 0;
    let brightnessSquares = 0;
    let edgeCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      totalBrightness += brightness;
      brightnessSquares += brightness * brightness;
    }

    const pixelCount = data.length / 4;
    const meanBrightness = totalBrightness / pixelCount;
    const variance = Math.max((brightnessSquares / pixelCount) - (meanBrightness * meanBrightness), 0);

    for (let row = 0; row < height - 1; row += 1) {
      for (let col = 0; col < width - 1; col += 1) {
        const idx = (row * width + col) * 4;
        const rightIdx = (row * width + col + 1) * 4;
        const downIdx = ((row + 1) * width + col) * 4;

        const current = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        const right = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];
        const down = 0.299 * data[downIdx] + 0.587 * data[downIdx + 1] + 0.114 * data[downIdx + 2];

        if (Math.abs(current - right) > 24 || Math.abs(current - down) > 24) {
          edgeCount += 1;
        }
      }
    }

    return {
      meanBrightness,
      variance,
      edgeDensity: edgeCount / Math.max((width - 1) * (height - 1), 1),
    };
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  // Eye Aspect Ratio (EAR) - lower values mean eyes are more closed.
  // Landmarks indices for 68-point model:
  // - Left eye: 36-41
  // - Right eye: 42-47
  const getEyeEAR = (landmarks, eye) => {
    const positions = landmarks.positions;
    const p1 = positions[eye[0]];
    const p2 = positions[eye[1]];
    const p3 = positions[eye[2]];
    const p4 = positions[eye[3]];
    const p5 = positions[eye[4]];
    const p6 = positions[eye[5]];

    const vertical = dist(p2, p6) + dist(p3, p5);
    const horizontal = 2 * dist(p1, p4);
    return horizontal ? vertical / horizontal : 0;
  };

  const getPanAssessment = (ctx, videoWidth, videoHeight) => {
    const guideWidth = Math.round(videoWidth * 0.66);
    const guideHeight = Math.round(videoHeight * 0.42);
    const guideX = Math.round((videoWidth - guideWidth) / 2);
    const guideY = Math.round((videoHeight - guideHeight) / 2);

    const centerBandWidth = Math.round(guideWidth * 0.74);
    const centerBandHeight = Math.round(guideHeight * 0.46);
    const centerBandX = Math.round(guideX + ((guideWidth - centerBandWidth) / 2));
    const centerBandY = Math.round(guideY + ((guideHeight - centerBandHeight) / 2));

    const guideMetrics = getFrameMetrics(ctx, guideX, guideY, guideWidth, guideHeight);
    const bandMetrics = getFrameMetrics(
      ctx,
      centerBandX,
      centerBandY,
      centerBandWidth,
      centerBandHeight
    );

    const limits = isMobileViewport
      ? {
          brightnessMin: 38,
          brightnessMax: 238,
          varianceMin: 240,
          edgeMin: 0.025,
          edgeMax: 0.52,
          bandVarianceMin: 140,
          bandEdgeMin: 0.015,
          bandEdgeMax: 0.45,
        }
      : {
          brightnessMin: 45,
          brightnessMax: 232,
          varianceMin: 300,
          edgeMin: 0.035,
          edgeMax: 0.56,
          bandVarianceMin: 170,
          bandEdgeMin: 0.02,
          bandEdgeMax: 0.48,
        };

    const checks = {
      brightness:
        guideMetrics.meanBrightness > limits.brightnessMin &&
        guideMetrics.meanBrightness < limits.brightnessMax,
      texture: guideMetrics.variance > limits.varianceMin,
      edges:
        guideMetrics.edgeDensity > limits.edgeMin &&
        guideMetrics.edgeDensity < limits.edgeMax,
      bandTexture: bandMetrics.variance > limits.bandVarianceMin,
      bandEdges:
        bandMetrics.edgeDensity > limits.bandEdgeMin &&
        bandMetrics.edgeDensity < limits.bandEdgeMax,
    };

    const score = Object.values(checks).filter(Boolean).length;

    let message = "Align PAN card inside the guide box.";
    if (!checks.brightness) {
      message =
        guideMetrics.meanBrightness <= limits.brightnessMin
          ? "Increase light on the PAN card."
          : "Reduce glare and tilt on the PAN card.";
    } else if (!checks.texture) {
      message = "Move the PAN card closer to the camera.";
    } else if (!checks.edges || !checks.bandEdges) {
      message = "Keep the PAN card flat and fully inside the frame.";
    } else if (!checks.bandTexture) {
      message = "Hold the PAN card steady for auto-capture.";
    }

    return {
      guideMetrics,
      bandMetrics,
      score,
      stable: score >= 4,
      almostStable: score === 3,
      message,
    };
  };

  const clearAnalysisLoop = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  };

  // --- 1. AI AGENT VOICE (Text-to-Speech) ---
  const speak = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // --- 3. AI GUIDANCE LOGIC ---
  const guideUser = (currentStep) => {
    setStep(currentStep);
    setGuideState("neutral");
    switch (currentStep) {
      case 1:
        speak("Hello! I am your AI assistant. Let's get started with your Video KYC verification.");
        break;
      case 2:
        speak("Please hold your PAN card clearly in front of the camera.");
        break;
      case 3:
        speak("Great! Now, please look at the camera and smile for a selfie.");
        break;
      case 4:
        speak("Verification in progress. Please do not close the window.");
        break;
      default:
        break;
    }
  };

  // --- 2. WEBCAM INITIALIZATION ---
  const stopCurrentStream = async () => {
    clearAnalysisLoop();

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    await new Promise((resolve) => setTimeout(resolve, 700));
  };

  const startVideo = async (facingMode = cameraFacingMode, retryCount = 0, preferredDeviceId = activeDeviceId) => {
    const currentAttempt = Date.now();
    startAttemptRef.current = currentAttempt;
    const initialMessage =
      switchInProgressRef.current
        ? `Switching to ${facingMode === "environment" ? "back" : "front"} camera...`
        : "Starting camera...";
    setCameraState({ status: "loading", message: initialMessage });

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState({
        status: "error",
        message: "This browser does not support camera access.",
      });
      return;
    }

    try {
      await stopCurrentStream();

      let mediaStream;

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            ...(preferredDeviceId ? { deviceId: { exact: preferredDeviceId } } : { facingMode: { exact: facingMode } }),
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            ...(preferredDeviceId ? { deviceId: { ideal: preferredDeviceId } } : { facingMode }),
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      }

      if (startAttemptRef.current !== currentAttempt) {
        mediaStream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = mediaStream;
      const [videoTrack] = mediaStream.getVideoTracks();
      const activeTrackDeviceId = videoTrack?.getSettings?.().deviceId || null;

      if (activeTrackDeviceId) {
        setActiveDeviceId(activeTrackDeviceId);
      }

      if (videoRef.current) {
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.setAttribute("autoplay", "true");
        videoRef.current.muted = true;
        videoRef.current.srcObject = mediaStream;

        try {
          await videoRef.current.play();
        } catch {
          // Some mobile browsers need the user to interact once before playback starts.
        }
      }

      setCameraState({ status: "ready", message: "Camera connected." });
      panStableFramesRef.current = 0;
      selfieStableFramesRef.current = 0;
      selfieAlignedLatchedRef.current = false;
      selfieMisalignedStreakRef.current = 0;
      captureLockRef.current = false;
      switchInProgressRef.current = false;
      setGuideState("neutral");
      blinkVerificationArmedSeqRef.current = null;
      setSelfieFaceReady(false);
      await loadVideoDevices(facingMode);
    } catch (error) {
      if (error?.name === "NotReadableError" && retryCount < 2) {
        setCameraState({
          status: "loading",
          message: `Switching camera... retrying ${retryCount + 1}/2`,
        });
        await new Promise((resolve) => setTimeout(resolve, 900));
        await startVideo(facingMode, retryCount + 1, preferredDeviceId);
        return;
      }

      const permissionMessage =
        (typeof window !== "undefined" && !window.isSecureContext)
          ? "Open the site on trusted HTTPS. Self-signed cert warning must be accepted on your phone."
          : error?.name === "NotAllowedError"
            ? "Please allow camera permission in your browser settings."
            : error?.name === "NotReadableError"
              ? "Camera is already being used by another app."
              : error?.name === "NotFoundError"
                ? "No camera was found on this device."
                : "Unable to access the camera on this device.";

      setCameraState({ status: "error", message: permissionMessage });
      switchInProgressRef.current = false;
      Swal.fire("Camera Error", permissionMessage, "error");
    }
  };

  const switchCamera = async () => {
    if (cameraState.status === "loading" || switchInProgressRef.current) return;

    switchInProgressRef.current = true;
    captureLockRef.current = true;
    setGuideState("neutral");
    const nextFacingMode = cameraFacingMode === "user" ? "environment" : "user";
    setAutoStatus(nextFacingMode === "environment" ? "Switching to back camera..." : "Switching to front camera...");
    const devices = availableVideoDevicesRef.current.length
      ? availableVideoDevicesRef.current
      : await loadVideoDevices(nextFacingMode);

    const currentDeviceId = activeDeviceId;
    const normalizedFacingMode = nextFacingMode === "environment" ? "back" : "front";
    const targetDevice =
      devices.find((device) => device.deviceId !== currentDeviceId && device.label.toLowerCase().includes(normalizedFacingMode)) ||
      devices.find((device) => device.deviceId !== currentDeviceId) ||
      null;

    const nextDeviceId = targetDevice?.deviceId || null;

    setCameraFacingMode(nextFacingMode);
    if (nextDeviceId) {
      setActiveDeviceId(nextDeviceId);
    }
    await startVideo(nextFacingMode, 0, nextDeviceId);
  };

  useEffect(() => {
    void startVideo();
    speak("Hello! I am your AI assistant. Let's get started with your Video KYC verification.");
    return () => {
      startAttemptRef.current += 1;
      void stopCurrentStream();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    modelsLoadErrorRef.current = null;

    const loadFaceApi = async () => {
      try {
        // Face models in: `frontend/public/models/*`
        // Depending on how the SPA is mounted (dev vs preview vs ngrok path),
        // an absolute `/models` can fail even if relative model requests work.
        // Try a few safe base URL candidates until one succeeds.
        const viteBase = import.meta?.env?.BASE_URL ?? "/";
        const candidates = [
          "/models",
          `${viteBase}models`,
          "./models",
          "models",
          `${window.location.origin}/models`,
        ];

        let lastErr = null;
        for (const baseUrl of candidates) {
          try {
            // face-api.js v0.22+ uses `faceLandmark68Net` (and `faceLandmark68TinyNet`),
            // while older versions used `faceLandmark68`.
            // Load whichever landmark net exists in this runtime.
            const landmarkNet =
              faceapi.nets.faceLandmark68Net ||
              faceapi.nets.faceLandmark68TinyNet ||
              faceapi.nets.faceLandmark68;
            if (!landmarkNet?.loadFromUri) {
              throw new Error(
                "face-api landmark model net not available (expected faceLandmark68Net / faceLandmark68TinyNet)."
              );
            }

            if (!faceapi.nets.tinyFaceDetector?.loadFromUri) {
              throw new Error("face-api tinyFaceDetector model net not available.");
            }

            await Promise.all([
              faceapi.nets.tinyFaceDetector.loadFromUri(baseUrl),
              landmarkNet.loadFromUri(baseUrl),
            ]);
            if (cancelled) return;
            faceDetectorRef.current = { ready: true };
            return;
          } catch (err) {
            lastErr = err;
          }
        }

        if (cancelled) return;
        modelsLoadErrorRef.current = lastErr;
        // Keep the full error for debugging.
        // eslint-disable-next-line no-console
        console.error("Face-api model load failed:", lastErr);
        faceDetectorRef.current = { ready: false };
      } catch (err) {
        if (cancelled) return;
        modelsLoadErrorRef.current = err;
        // eslint-disable-next-line no-console
        console.error("Face-api model load failed:", err);
        faceDetectorRef.current = { ready: false };
      }
    };

    void loadFaceApi();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const updateViewportMode = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };

    updateViewportMode();
    window.addEventListener("resize", updateViewportMode);
    return () => window.removeEventListener("resize", updateViewportMode);
  }, []);

  useEffect(() => {
    clearAnalysisLoop();

    if (cameraState.status !== "ready" || step < 2 || step > 3) {
      return () => clearAnalysisLoop();
    }

    const analyzeFrame = async () => {
      if (
        captureLockRef.current ||
        !videoRef.current ||
        videoRef.current.readyState < 2 ||
        !videoRef.current.videoWidth ||
        !videoRef.current.videoHeight
      ) {
        return;
      }

      const canvas = document.createElement("canvas");
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

      if (step === 2) {
        const panAssessment = getPanAssessment(ctx, videoWidth, videoHeight);

        if (panAssessment.stable) {
          panStableFramesRef.current += 1;
          setPanStableCount(Math.min(AUTO_PAN_STABLE_FRAMES, panStableFramesRef.current));
          setGuideState(panStableFramesRef.current >= AUTO_PAN_STABLE_FRAMES ? "valid" : "neutral");
          setAutoStatus("PAN detected, hold steady...");
        } else if (panAssessment.almostStable) {
          panStableFramesRef.current = 0;
          setPanStableCount(0);
          setGuideState("neutral");
          setAutoStatus("PAN almost aligned. Hold it flatter and a little closer.");
        } else {
          panStableFramesRef.current = 0;
          setPanStableCount(0);
          setGuideState("invalid");
          setAutoStatus(panAssessment.message);
        }

        if (panStableFramesRef.current >= AUTO_PAN_STABLE_FRAMES) {
          captureLockRef.current = true;
          setGuideState("valid");
          setAutoStatus("PAN card captured successfully.");
          captureFrame("pan");
        }
        return;
      }

      const faceApiState = faceDetectorRef.current;
      if (!faceApiState?.ready) {
        setGuideState("neutral");
        const err = modelsLoadErrorRef.current;
        const errMsg = err?.message ? String(err.message) : err ? String(err) : "";
        const shortErrMsg = errMsg.length > 120 ? `${errMsg.slice(0, 120)}...` : errMsg;
        setAutoStatus(err ? `Face detection models failed to load: ${shortErrMsg || "unknown error"}` : "Loading face detection models...");
        return;
      }

      try {
        const inputSize = isMobileViewport ? 160 : 224;
        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize,
          scoreThreshold: 0.5,
        });

        frameSeqRef.current += 1;
        const currentSeq = frameSeqRef.current;

        const detection = await faceapi
          .detectSingleFace(canvas, options)
          .withFaceLandmarks();

        if (!detection) {
          if (selfieAlignedLatchedRef.current) {
            selfieMisalignedStreakRef.current += 1;
            if (selfieMisalignedStreakRef.current <= SELFIE_MISALIGN_GRACE_FRAMES) {
              selfieStableFramesRef.current = AUTO_FACE_STABLE_FRAMES;
              setSelfieStableCount(AUTO_FACE_STABLE_FRAMES);
              setGuideState("neutral");
              setAutoStatus("Blink once to verify — hold steady if capture is slow.");
              const faceAlignedGrace =
                selfieAlignedLatchedRef.current ||
                selfieStableFramesRef.current >= AUTO_FACE_STABLE_FRAMES;
              const blinkSeqGrace = lastBlinkSeqRef.current;
              const blinkVerifiedGrace =
                blinkVerificationArmedSeqRef.current != null &&
                blinkSeqGrace >= blinkVerificationArmedSeqRef.current &&
                blinkSeqGrace - blinkVerificationArmedSeqRef.current <= AUTO_BLINK_WINDOW_FRAMES;
              if (faceAlignedGrace && blinkVerifiedGrace) {
                captureLockRef.current = true;
                setGuideState("valid");
                setAutoStatus("Selfie captured successfully.");
                captureFrame("selfie");
              }
              return;
            }
          }
          selfieAlignedLatchedRef.current = false;
          selfieMisalignedStreakRef.current = 0;
          selfieStableFramesRef.current = 0;
          setSelfieStableCount(0);
          setSelfieFaceReady(false);
          setGuideState("invalid");
          setAutoStatus("Look into the camera and keep your face inside the guide.");
          blinkClosedFramesRef.current = 0;
          blinkArmedRef.current = false;
          blinkVerificationArmedSeqRef.current = null;
          lastBlinkSeqRef.current = -9999;
          return;
        }

        const face = detection.detection.box;
        const centerX = face.x + face.width / 2;
        const centerY = face.y + face.height / 2;
        const displayCenterX = cameraFacingMode === "user" ? videoWidth - centerX : centerX;
        const normalizedCenterX = displayCenterX / videoWidth;
        const normalizedCenterY = centerY / videoHeight;
        const normalizedFaceWidth = face.width / videoWidth;
        const normalizedFaceHeight = face.height / videoHeight;

        const faceMetrics = getFrameMetrics(
          ctx,
          Math.max(Math.floor(face.x), 0),
          Math.max(Math.floor(face.y), 0),
          Math.min(Math.floor(face.width), videoWidth - Math.max(Math.floor(face.x), 0)),
          Math.min(Math.floor(face.height), videoHeight - Math.max(Math.floor(face.y), 0))
        );
        const selfieLooksStable =
          normalizedCenterX > (isMobileViewport ? 0.3 : 0.36) &&
          normalizedCenterX < (isMobileViewport ? 0.7 : 0.64) &&
          normalizedCenterY > (isMobileViewport ? 0.24 : 0.3) &&
          normalizedCenterY < (isMobileViewport ? 0.76 : 0.7) &&
          normalizedFaceWidth > (isMobileViewport ? 0.14 : 0.18) &&
          normalizedFaceWidth < (isMobileViewport ? 0.68 : 0.58) &&
          normalizedFaceHeight > (isMobileViewport ? 0.18 : 0.22) &&
          normalizedFaceHeight < (isMobileViewport ? 0.8 : 0.72) &&
          faceMetrics.meanBrightness > (isMobileViewport ? 40 : 55) &&
          faceMetrics.meanBrightness < (isMobileViewport ? 225 : 210) &&
          faceMetrics.variance > (isMobileViewport ? 120 : 180);

        // Blink detection (landmarks-based).
        if (detection.landmarks) {
          const leftEAR = getEyeEAR(detection.landmarks, [36, 37, 38, 39, 40, 41]);
          const rightEAR = getEyeEAR(detection.landmarks, [42, 43, 44, 45, 46, 47]);
          const ear = (leftEAR + rightEAR) / 2;

          // Use a learned open-eye baseline; if we don't have it yet, don't
          // classify eyes-closed this frame.
          const openBaseline = earOpenRef.current;
          // Lower min clamp to be more tolerant across devices/angles.
          const closedThreshold = openBaseline == null ? null : clamp(openBaseline * 0.62, 0.06, 0.3);

          const eyesClosed = closedThreshold == null ? false : ear < closedThreshold;
          if (eyesClosed) {
            blinkClosedFramesRef.current += 1;
            if (blinkClosedFramesRef.current >= MIN_BLINK_CLOSED_FRAMES) {
              blinkArmedRef.current = true;
            }
          } else {
            if (blinkArmedRef.current && blinkClosedFramesRef.current >= MIN_BLINK_CLOSED_FRAMES) {
              // Timestamp on first "eyes opened" sample after the blink.
              // This makes the captured selfie more likely to have eyes open.
              lastBlinkSeqRef.current = currentSeq;
            }
            blinkClosedFramesRef.current = 0;
            blinkArmedRef.current = false;

            // Update open-eye baseline only when eyes look open.
            if (ear > 0.12) {
              earOpenRef.current = earOpenRef.current == null ? ear : (0.9 * earOpenRef.current + 0.1 * ear);
            }
          }
        }

        if (selfieLooksStable) {
          selfieMisalignedStreakRef.current = 0;
          selfieStableFramesRef.current += 1;
          setSelfieStableCount(Math.min(AUTO_FACE_STABLE_FRAMES, selfieStableFramesRef.current));
          const faceAlignedNow = selfieStableFramesRef.current >= AUTO_FACE_STABLE_FRAMES;

          if (faceAlignedNow) {
            selfieAlignedLatchedRef.current = true;
            setSelfieFaceReady(true);
            if (blinkVerificationArmedSeqRef.current == null) {
              // Arm the verification window when alignment reaches 3/3.
              blinkVerificationArmedSeqRef.current = currentSeq;
            }

            const blinkSeq = lastBlinkSeqRef.current;
            const blinkVerified =
              blinkSeq >= blinkVerificationArmedSeqRef.current &&
              blinkSeq - blinkVerificationArmedSeqRef.current <= AUTO_BLINK_WINDOW_FRAMES;

            if (blinkVerified) {
              setGuideState("valid");
              setAutoStatus("Blink verified. Capturing selfie...");
            } else {
              setGuideState("neutral");
              setAutoStatus("Face aligned. Please blink once to verify.");
            }
          } else {
            setGuideState("neutral");
            setAutoStatus("Face aligned, hold steady...");
          }
        } else if (selfieAlignedLatchedRef.current) {
          selfieMisalignedStreakRef.current += 1;
          if (selfieMisalignedStreakRef.current <= SELFIE_MISALIGN_GRACE_FRAMES) {
            selfieStableFramesRef.current = AUTO_FACE_STABLE_FRAMES;
            setSelfieStableCount(AUTO_FACE_STABLE_FRAMES);
            const blinkSeq = lastBlinkSeqRef.current;
            const blinkVerified =
              blinkVerificationArmedSeqRef.current != null &&
              blinkSeq >= blinkVerificationArmedSeqRef.current &&
              blinkSeq - blinkVerificationArmedSeqRef.current <= AUTO_BLINK_WINDOW_FRAMES;
            if (blinkVerified) {
              setGuideState("valid");
              setAutoStatus("Blink verified. Capturing selfie...");
            } else {
              setGuideState("neutral");
              setAutoStatus("Face aligned. Please blink once to verify.");
            }
          } else {
            selfieAlignedLatchedRef.current = false;
            selfieMisalignedStreakRef.current = 0;
            selfieStableFramesRef.current = 0;
            setSelfieStableCount(0);
            setSelfieFaceReady(false);
            setGuideState("invalid");
            setAutoStatus("Center your face and improve lighting for auto-capture.");
            blinkVerificationArmedSeqRef.current = null;
            lastBlinkSeqRef.current = -9999;
          }
        } else {
          selfieStableFramesRef.current = 0;
          setSelfieStableCount(0);
          setSelfieFaceReady(false);
          setGuideState("invalid");
          setAutoStatus("Center your face and improve lighting for auto-capture.");
          blinkVerificationArmedSeqRef.current = null;
          lastBlinkSeqRef.current = -9999;
        }

        const faceAlignedNow =
          selfieAlignedLatchedRef.current || selfieStableFramesRef.current >= AUTO_FACE_STABLE_FRAMES;
        const blinkSeq = lastBlinkSeqRef.current;
        const blinkVerified =
          blinkVerificationArmedSeqRef.current != null &&
          blinkSeq >= blinkVerificationArmedSeqRef.current &&
          blinkSeq - blinkVerificationArmedSeqRef.current <= AUTO_BLINK_WINDOW_FRAMES;

        if (faceAlignedNow && blinkVerified) {
          captureLockRef.current = true;
          setGuideState("valid");
          setAutoStatus("Selfie captured successfully.");
          captureFrame("selfie");
        }
      } catch {
        setGuideState("neutral");
        setAutoStatus("Face detection unavailable right now. Use manual capture if needed.");
      }
    };

    const intervalMs = step === 3 ? 250 : 700;
    let analysisRunning = false;
    analysisIntervalRef.current = setInterval(() => {
      if (analysisRunning) return;
      analysisRunning = true;
      void analyzeFrame().finally(() => {
        analysisRunning = false;
      });
    }, intervalMs);

    return () => clearAnalysisLoop();
  }, [cameraState.status, step, isMobileViewport, cameraFacingMode]);

  // --- 4. IMAGE CAPTURE ---
  const getOptimizedCaptureDataUrl = (type) => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      return null;
    }

    const sourceWidth = video.videoWidth;
    const sourceHeight = video.videoHeight;
    const maxWidth = type === "pan" ? 1280 : 960;
    const maxHeight = type === "pan" ? 820 : 960;
    const scale = Math.min(
      1,
      maxWidth / Math.max(sourceWidth, 1),
      maxHeight / Math.max(sourceHeight, 1)
    );

    const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
    const targetHeight = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

    return canvas.toDataURL("image/jpeg", type === "pan" ? 0.9 : 0.82);
  };

  const captureFrame = (type) => {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      Swal.fire("Camera Not Ready", "Please wait for the video feed to start.", "warning");
      return;
    }

    const dataUrl = getOptimizedCaptureDataUrl(type);

    if (!dataUrl) {
      Swal.fire("Capture Failed", "Unable to capture the current frame.", "error");
      return;
    }

    const updated = { ...capturedImagesRef.current, [type]: dataUrl };
    capturedImagesRef.current = updated;
    panStableFramesRef.current = 0;
    selfieStableFramesRef.current = 0;
    selfieAlignedLatchedRef.current = false;
    selfieMisalignedStreakRef.current = 0;
    earOpenRef.current = null;
    blinkClosedFramesRef.current = 0;
    blinkArmedRef.current = false;
    lastBlinkSeqRef.current = -9999;
    blinkVerificationArmedSeqRef.current = null;
    setPanStableCount(0);
    setSelfieStableCount(0);
    setSelfieFaceReady(false);
    setGuideState("valid");

    if (type === "pan") {
      Swal.fire({
        icon: "success",
        title: "PAN Card captured successfully",
        timer: 1400,
        showConfirmButton: false,
      });
      captureLockRef.current = false;
      guideUser(3);
      return;
    }

    guideUser(4);
    setTimeout(() => verifyKYC(updated), 300);
  };

  // Helper: base64 dataURL to Blob
  const dataURLtoBlob = (dataUrl) => {
    const [header, data] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    return new Blob([array], { type: mime });
  };

  // --- 5. BACKEND VERIFICATION (Real API Call) ---
  const verifyKYC = async (images) => {
    try {
      const formData = new FormData();
      formData.append("applicationId", id);
      formData.append("panCardImage", dataURLtoBlob(images.pan), "pan_card.jpg");
      formData.append("selfieImage", dataURLtoBlob(images.selfie), "selfie.jpg");

      const res = await kycService.verifyKyc(formData);
      const verificationData = res?.data?.data ?? {};
      const { faceMatch, panMatch, status, verificationMessage } = verificationData;

      if (status === "Verified") {
        Swal.fire({
          icon: "success",
          title: "KYC Verified Successfully",
          text: "Your face and PAN details have matched.",
          confirmButtonColor: "#4f46e5",
        }).then(() => navigate("/dashboard"));
      } else {
        const reason = verificationMessage || (
          !faceMatch && !panMatch ? "Face mismatch and PAN mismatch" :
          !faceMatch ? "Face mismatch" : "PAN mismatch"
        );
        Swal.fire({
          icon: "error",
          title: "KYC Verification Failed",
          text: reason,
          confirmButtonColor: "#ef4444",
        }).then(() => navigate("/dashboard"));
      }
    } catch (err) {
      const message =
        err?.code === "ECONNABORTED"
          ? "Verification is still processing. Please wait a little longer and check your dashboard status."
          : err?.response?.data?.message || "Verification failed. Please try again.";
      Swal.fire("Error", message, "error").then(() => navigate("/dashboard"));
    }
  };

  const guideTone =
    guideState === "valid"
      ? {
          ring: "border-emerald-400/80 shadow-[0_0_40px_rgba(52,211,153,0.35)]",
          panel: "text-emerald-300 bg-emerald-500/15 border-emerald-400/30",
          label: "ALIGNED",
        }
      : guideState === "invalid"
        ? {
            ring: "border-red-400/80 shadow-[0_0_40px_rgba(248,113,113,0.30)]",
            panel: "text-red-300 bg-red-500/15 border-red-400/30",
            label: "ADJUST",
          }
        : {
            ring: "border-indigo-400/60 shadow-[0_0_35px_rgba(99,102,241,0.25)]",
            panel: "text-indigo-200 bg-indigo-500/15 border-indigo-400/30",
            label: "SCANNING",
          };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? "bg-[#0f172a]" : "bg-[#f4f7fe]"}`}>
      {/* Top Header */}
      <div className={`border-b px-4 py-4 sm:px-6 lg:px-8 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg sm:h-11 sm:w-11">
                <FiShield size={20} />
            </div>
            <div className="min-w-0">
                <h2 className={`text-sm font-black uppercase tracking-[0.22em] sm:text-base ${isDark ? "text-white" : "text-slate-900"}`}>Secure Session</h2>
                <p className="truncate text-[10px] font-bold uppercase tracking-widest text-indigo-500 sm:text-[11px]">ID: {id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full px-3 py-1.5 sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className={`text-[10px] font-black uppercase tracking-widest sm:text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Recording Live</span>
          </div>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative flex flex-1 items-center justify-center px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="relative w-full max-w-6xl overflow-hidden rounded-[1.5rem] border-2 border-indigo-600/20 bg-black shadow-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] lg:border-4">
            <div className="aspect-[3/4] sm:aspect-video">
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`h-full w-full object-cover ${cameraFacingMode === "user" ? "scale-x-[-1]" : ""}`} 
            />
            </div>
            
            {/* HUD Overlays */}
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5 lg:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="w-fit max-w-[75%] rounded-2xl border border-white/20 bg-black/40 p-3 backdrop-blur-md sm:max-w-none sm:p-4">
                        <p className="mb-1 text-[9px] font-bold uppercase text-white/60 sm:text-[10px]">Session Status</p>
                        <p className={`flex items-center gap-2 text-[11px] font-black sm:text-xs ${
                          cameraState.status === "ready"
                            ? "text-green-400"
                            : cameraState.status === "error"
                              ? "text-red-400"
                              : "text-amber-300"
                        }`}>
                            <FiMic className={cameraState.status === "loading" ? "animate-pulse" : "animate-bounce"} />
                            {cameraState.status === "ready"
                              ? "CAMERA_STREAM: OK"
                              : cameraState.status === "error"
                                ? "CAMERA_STREAM: BLOCKED"
                                : "CAMERA_STREAM: SWITCHING"}
                        </p>
                    </div>
                    <div className="flex gap-2 self-start">
                        <button
                          type="button"
                          onClick={() => void switchCamera()}
                          disabled={cameraState.status === "loading"}
                          className={`pointer-events-auto flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-white shadow-lg backdrop-blur-md transition sm:px-4 sm:text-[10px] ${
                            cameraState.status === "loading"
                              ? "cursor-not-allowed bg-black/25 text-white/60"
                              : "bg-black/45 hover:bg-black/60"
                          }`}
                        >
                          <FiRefreshCw />
                          {cameraFacingMode === "user" ? "Front Cam" : "Back Cam"}
                        </button>
                        <div className="self-start rounded-xl bg-indigo-600 px-3 py-2 text-[9px] font-black uppercase tracking-[0.22em] text-white shadow-lg sm:px-4 sm:text-[10px]">
                            AI GUIDED
                        </div>
                    </div>
                </div>

                {/* Instruction Card */}
                <div className="mb-2 flex justify-center sm:mb-4">
                    <div className="w-full max-w-md rounded-[1.75rem] border border-indigo-500/30 bg-black/60 p-4 text-center shadow-2xl backdrop-blur-xl sm:p-5 lg:p-6">
                        <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 sm:text-[10px]">Instructions</p>
                        <h3 className="text-base font-bold leading-tight text-white sm:text-lg lg:text-xl">
                            {step === 1 && (
                              cameraState.status === "error"
                                ? cameraState.message
                                : cameraState.status === "loading"
                                  ? cameraState.message
                                  : "Welcome! Ready to begin?"
                            )}
                            {step === 2 && "Hold your PAN Card within the frame."}
                            {step === 3 && "Smile! Align your face for a selfie."}
                            {step === 4 && "Analyzing Identity Data..."}
                        </h3>
                        {cameraState.status === "loading" && step >= 2 && step <= 3 && (
                          <p className="mt-3 text-xs text-white/70">{cameraState.message}</p>
                        )}
                        {cameraState.status === "ready" && step >= 2 && step <= 3 && (
                          <div className="mt-3 flex flex-col items-center gap-2">
                            <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${guideTone.panel}`}>
                              {guideTone.label}
                            </span>
                            <p className="text-xs text-white/70">
                              {step === 2
                                ? `PAN frames: ${panStableCount}/${AUTO_PAN_STABLE_FRAMES}`
                                : `Face frames: ${selfieStableCount}/${AUTO_FACE_STABLE_FRAMES}`}
                            </p>
                            <p className="text-xs text-white/75">{autoStatus}</p>
                          </div>
                        )}
                        {cameraState.status === "loading" && step === 1 && (
                          <p className="mt-3 text-xs text-white/70">Starting mobile camera preview...</p>
                        )}
                        {cameraState.status === "error" && (
                          <button
                            type="button"
                            onClick={() => void startVideo()}
                            className="pointer-events-auto mt-4 rounded-xl bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-900 transition hover:bg-slate-100"
                          >
                            Retry Camera
                          </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Scanning Frame for PAN/Face */}
            {(step === 2 || step === 3) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`border-4 border-dashed animate-pulse transition-all duration-300 ${guideTone.ring} ${
                        step === 2
                          ? "h-[30%] w-[70%] rounded-3xl sm:h-1/2 sm:w-[58%]"
                          : isMobileViewport
                            ? "h-[56%] w-[68%] rounded-[2rem]"
                            : "h-[50%] w-[52%] rounded-[2.25rem]"
                    }`}></div>
                </div>
            )}
        </div>
      </div>

      {/* Control Footer */}
      <div className={`border-t px-4 py-4 sm:px-6 sm:py-5 lg:px-8 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-3 sm:flex-row">
        {step === 1 && (
          <button
            disabled={cameraState.status !== "ready"}
            onClick={() => guideUser(2)}
            className={`flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest shadow-xl transition-all sm:w-auto sm:px-10 sm:text-xs lg:px-12 ${
              cameraState.status === "ready"
                ? "bg-indigo-600 text-white shadow-indigo-600/30 active:scale-95 hover:bg-indigo-700"
                : "cursor-not-allowed bg-slate-400 text-white/80 shadow-none"
            }`}
          >
            I'm Ready
          </button>
        )}

        {step === 2 && (
          <button
            type="button"
            disabled={cameraState.status !== "ready" || guideState !== "valid"}
            onClick={() => captureFrame("pan")}
            className={`flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest shadow-xl transition-all sm:w-auto sm:px-10 sm:text-xs ${
              cameraState.status === "ready" && guideState === "valid"
                ? "bg-emerald-600 text-white shadow-emerald-600/30 active:scale-95 hover:bg-emerald-700"
                : "cursor-not-allowed bg-slate-400 text-white/80 shadow-none"
            }`}
          >
            <FiCamera /> Capture PAN
          </button>
        )}

        {step === 3 && (
          <button
            type="button"
            disabled={cameraState.status !== "ready" || !selfieFaceReady}
            onClick={() => captureFrame("selfie")}
            className={`flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest shadow-xl transition-all sm:w-auto sm:px-10 sm:text-xs ${
              cameraState.status === "ready" && selfieFaceReady
                ? "bg-indigo-600 text-white shadow-indigo-600/30 active:scale-95 hover:bg-indigo-700"
                : "cursor-not-allowed bg-slate-400 text-white/80 shadow-none"
            }`}
          >
            <FiCamera /> Capture Face
          </button>
        )}

        <button
            type="button"
            onClick={() => void switchCamera()}
            disabled={cameraState.status === "loading"}
            className={`flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl border border-indigo-500/20 px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest transition sm:w-auto sm:px-8 sm:text-xs ${
              cameraState.status === "loading"
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/15"
            }`}
        >
            <FiRefreshCw />
            {cameraFacingMode === "user" ? "Switch To Back" : "Switch To Front"}
        </button>
        
        {step === 4 && (
            <div className="flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-5 py-4 sm:w-auto sm:px-8">
                <div className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                <span className="text-center text-[11px] font-black uppercase tracking-widest text-indigo-500 sm:text-xs">Processing Vision AI...</span>
            </div>
        )}
        </div>
      </div>

    </div>
  );
};

export default VideoKYCSession;
