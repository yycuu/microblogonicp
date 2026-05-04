import type React from "react";
import { useCallback, useRef, useState } from "react";
import { ExternalBlob } from "../backend";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ACCEPTED_ALL_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB

type DetectedType = "image" | "video" | null;

function detectTypeFromMagicBytes(header: Uint8Array): DetectedType {
  if (header.length < 12) return null;

  // JPEG: FF D8 FF
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff)
    return "image";

  // PNG: 89 50 4E 47
  if (
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47
  )
    return "image";

  // GIF: 47 49 46 38 (GIF8)
  if (
    header[0] === 0x47 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x38
  )
    return "image";

  // WebP: RIFF....WEBP
  if (
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50
  )
    return "image";

  // MP4/MOV: "ftyp" at offset 4
  if (
    header[4] === 0x66 &&
    header[5] === 0x74 &&
    header[6] === 0x79 &&
    header[7] === 0x70
  )
    return "video";

  // WebM/MKV: EBML header 1A 45 DF A3
  if (
    header[0] === 0x1a &&
    header[1] === 0x45 &&
    header[2] === 0xdf &&
    header[3] === 0xa3
  )
    return "video";

  return null;
}

async function validateMagicBytes(file: File): Promise<DetectedType> {
  const slice = file.slice(0, 12);
  const buffer = await slice.arrayBuffer();
  return detectTypeFromMagicBytes(new Uint8Array(buffer));
}

interface MediaUploadState {
  file: File | null;
  previewUrl: string | null;
  error: string | null;
  mediaType: "image" | "video" | null;
}

export function useMediaUpload(accept: "image" | "all" = "all") {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<MediaUploadState>({
    file: null,
    previewUrl: null,
    error: null,
    mediaType: null,
  });

  const acceptedTypes =
    accept === "image" ? ACCEPTED_IMAGE_TYPES : ACCEPTED_ALL_TYPES;

  const selectMedia = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
      const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);

      if (!isImage && !isVideo) {
        const msg =
          accept === "image"
            ? "Only JPEG, PNG, GIF, and WebP images are allowed"
            : "Only JPEG, PNG, GIF, WebP images and MP4, WebM, MOV videos are allowed";
        setState({ file: null, previewUrl: null, error: msg, mediaType: null });
        return;
      }

      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      const sizeLabel = isVideo ? "25MB" : "5MB";
      if (file.size > maxSize) {
        setState({
          file: null,
          previewUrl: null,
          error: `File must be under ${sizeLabel}`,
          mediaType: null,
        });
        return;
      }

      // Verify actual file content matches the claimed MIME type
      const detectedType = await validateMagicBytes(file);
      if (detectedType == null) {
        setState({
          file: null,
          previewUrl: null,
          error: "Unrecognized file format",
          mediaType: null,
        });
        return;
      }
      const expectedType: DetectedType = isVideo ? "video" : "image";
      if (detectedType !== expectedType) {
        setState({
          file: null,
          previewUrl: null,
          error: "File content does not match its extension",
          mediaType: null,
        });
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setState({ file, previewUrl, error: null, mediaType: "image" });

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [accept],
  );

  const removeMedia = useCallback(() => {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({ file: null, previewUrl: null, error: null, mediaType: null });
  }, [state.previewUrl]);

  const createBlob = useCallback(
    async (
      onProgress?: (percentage: number) => void,
    ): Promise<ExternalBlob | null> => {
      if (!state.file) return null;
      const arrayBuffer = await state.file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);
      if (onProgress) {
        blob.withUploadProgress(onProgress);
      }
      return blob;
    },
    [state.file],
  );

  const MediaInput = useCallback(
    () => (
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />
    ),
    [acceptedTypes, handleFileChange],
  );

  return {
    file: state.file,
    previewUrl: state.previewUrl,
    error: state.error,
    mediaType: state.mediaType,
    selectMedia,
    removeMedia,
    createBlob,
    MediaInput,
  };
}
