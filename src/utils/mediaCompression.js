const compressibleTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const loadImage = (file) => new Promise((resolve, reject) => {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);

  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    resolve(image);
  };

  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error(`Unable to read image "${file.name}"`));
  };

  image.src = objectUrl;
});

const canvasToBlob = (canvas, type, quality) => new Promise((resolve) => {
  canvas.toBlob(resolve, type, quality);
});

export const compressImageFile = async (file, options = {}) => {
  const {
    maxWidth = 1600,
    maxHeight = 1200,
    quality = 0.82,
    minBytes = 450 * 1024,
  } = options;

  if (
    typeof window === "undefined" ||
    !file?.type?.startsWith("image/") ||
    !compressibleTypes.has(file.type) ||
    file.size < minBytes
  ) {
    return file;
  }

  const image = await loadImage(file);
  const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return file;

  context.drawImage(image, 0, 0, width, height);

  const outputType = file.type === "image/jpeg" ? "image/jpeg" : "image/webp";
  let blob = await canvasToBlob(canvas, outputType, quality);

  if (!blob && outputType !== "image/jpeg") {
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
  }

  if (!blob || blob.size >= file.size) {
    return file;
  }

  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "");

  return new File([blob], `${baseName}-optimized.${extension}`, {
    type: blob.type || outputType,
    lastModified: Date.now(),
  });
};

export const compressImageFiles = (files, options) => (
  Promise.all(files.map((file) => compressImageFile(file, options)))
);
