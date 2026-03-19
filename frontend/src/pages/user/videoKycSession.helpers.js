export const AUTO_FACE_STABLE_FRAMES = 3;
export const AUTO_PAN_STABLE_FRAMES = 4;

export const createAnalysisCanvas = (video) => {
  if (!video?.videoWidth || !video?.videoHeight) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return {
    canvas,
    ctx,
    videoWidth: canvas.width,
    videoHeight: canvas.height,
  };
};

export const getFrameMetrics = (ctx, x, y, width, height) => {
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

export const getPanGuideBounds = (videoWidth, videoHeight) => {
  const guideWidth = Math.round(videoWidth * 0.66);
  const guideHeight = Math.round(videoHeight * 0.42);
  const guideX = Math.round((videoWidth - guideWidth) / 2);
  const guideY = Math.round((videoHeight - guideHeight) / 2);

  return {
    x: guideX,
    y: guideY,
    width: guideWidth,
    height: guideHeight,
  };
};

export const getPanAssessment = (ctx, videoWidth, videoHeight, isMobileViewport) => {
  const guide = getPanGuideBounds(videoWidth, videoHeight);
  const centerBandWidth = Math.round(guide.width * 0.74);
  const centerBandHeight = Math.round(guide.height * 0.46);
  const centerBandX = Math.round(guide.x + ((guide.width - centerBandWidth) / 2));
  const centerBandY = Math.round(guide.y + ((guide.height - centerBandHeight) / 2));

  const guideMetrics = getFrameMetrics(ctx, guide.x, guide.y, guide.width, guide.height);
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
    score,
    stable: score >= 4,
    almostStable: score === 3,
    message,
  };
};

export const getFaceAssessment = (boundingBox, videoWidth, videoHeight, faceMetrics, isMobileViewport) => {
  const centerX = boundingBox.x + (boundingBox.width / 2);
  const centerY = boundingBox.y + (boundingBox.height / 2);
  const normalizedCenterX = centerX / videoWidth;
  const normalizedCenterY = centerY / videoHeight;
  const normalizedFaceWidth = boundingBox.width / videoWidth;
  const normalizedFaceHeight = boundingBox.height / videoHeight;

  return (
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
    faceMetrics.variance > (isMobileViewport ? 120 : 180)
  );
};

export const createCaptureDataUrl = (video, type) => {
  if (!video || video.readyState < 2) {
    return null;
  }

  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  const crop =
    type === "pan"
      ? getPanGuideBounds(sourceWidth, sourceHeight)
      : { x: 0, y: 0, width: sourceWidth, height: sourceHeight };

  const maxWidth = type === "pan" ? 1280 : 960;
  const maxHeight = type === "pan" ? 820 : 960;
  const scale = Math.min(
    1,
    maxWidth / Math.max(crop.width, 1),
    maxHeight / Math.max(crop.height, 1)
  );

  const targetWidth = Math.max(1, Math.round(crop.width * scale));
  const targetHeight = Math.max(1, Math.round(crop.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    video,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return canvas.toDataURL("image/jpeg", type === "pan" ? 0.9 : 0.82);
};

export const getVerificationFailureReason = ({ faceMatch, panMatch, verificationMessage }) =>
  verificationMessage || (
    !faceMatch && !panMatch ? "Face mismatch and PAN mismatch" :
    !faceMatch ? "Face mismatch" : "PAN mismatch"
  );

export const getInstructionTitle = (step, cameraState) => {
  if (step === 1) {
    if (cameraState.status === "error" || cameraState.status === "loading") {
      return cameraState.message;
    }

    return "Welcome! Ready to begin?";
  }

  if (step === 2) return "Hold your PAN Card within the frame.";
  if (step === 3) return "Smile! Align your face for a selfie.";
  return "Analyzing Identity Data...";
};

export const getGuideTone = (guideState) => {
  if (guideState === "valid") {
    return {
      ring: "border-emerald-400/80 shadow-[0_0_40px_rgba(52,211,153,0.35)]",
      panel: "text-emerald-300 bg-emerald-500/15 border-emerald-400/30",
      label: "ALIGNED",
    };
  }

  if (guideState === "invalid") {
    return {
      ring: "border-red-400/80 shadow-[0_0_40px_rgba(248,113,113,0.30)]",
      panel: "text-red-300 bg-red-500/15 border-red-400/30",
      label: "ADJUST",
    };
  }

  return {
    ring: "border-indigo-400/60 shadow-[0_0_35px_rgba(99,102,241,0.25)]",
    panel: "text-indigo-200 bg-indigo-500/15 border-indigo-400/30",
    label: "SCANNING",
  };
};
