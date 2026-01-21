/**
 * 이미지 압축 모듈
 * Sharp 라이브러리를 사용하여 이미지를 압축하고 WebP로 변환
 */

import sharp from "sharp";
import type { ImageCompressionResult } from "@/types";
import { IMAGE_COMPRESSION_SETTINGS } from "@/constants/config";

/**
 * 이미지 압축 옵션
 */
export interface CompressImageOptions {
  quality?: number;       // 압축 품질 (0-100)
  maxWidth?: number;      // 최대 너비
  maxHeight?: number;     // 최대 높이
  convertToWebp?: boolean; // WebP 변환 여부
}

/**
 * 이미지 버퍼를 압축하고 선택적으로 WebP로 변환
 *
 * @param buffer - 원본 이미지 버퍼
 * @param options - 압축 옵션 (기본값은 config에서 로드)
 * @returns 압축된 이미지 결과
 */
export async function compressImage(
  buffer: Buffer,
  options?: CompressImageOptions
): Promise<ImageCompressionResult> {
  const {
    quality = IMAGE_COMPRESSION_SETTINGS.QUALITY,
    maxWidth = IMAGE_COMPRESSION_SETTINGS.MAX_WIDTH,
    maxHeight = IMAGE_COMPRESSION_SETTINGS.MAX_HEIGHT,
    convertToWebp = IMAGE_COMPRESSION_SETTINGS.CONVERT_TO_WEBP,
  } = options || {};

  const originalSize = buffer.length;

  // Sharp 인스턴스 생성
  let sharpInstance = sharp(buffer);

  // 이미지 메타데이터 가져오기
  const metadata = await sharpInstance.metadata();

  // 리사이즈 (최대 크기 제한, 비율 유지)
  if (
    (metadata.width && metadata.width > maxWidth) ||
    (metadata.height && metadata.height > maxHeight)
  ) {
    sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
      fit: "inside",           // 비율 유지하며 최대 크기 내로 맞춤
      withoutEnlargement: true, // 원본보다 크게 확대하지 않음
    });
  }

  // 메타데이터 제거 (EXIF 등) - 용량 절감
  sharpInstance = sharpInstance.rotate(); // EXIF orientation 적용 후 메타데이터 제거

  let outputBuffer: Buffer;
  let format: string;
  let contentType: string;

  if (convertToWebp) {
    // WebP로 변환 (가장 효율적인 압축)
    outputBuffer = await sharpInstance
      .webp({ quality })
      .toBuffer();
    format = "webp";
    contentType = "image/webp";
  } else {
    // 원본 포맷 유지하며 압축
    const inputFormat = metadata.format || "jpeg";

    switch (inputFormat) {
      case "png":
        outputBuffer = await sharpInstance
          .png({ quality, compressionLevel: 9 })
          .toBuffer();
        format = "png";
        contentType = "image/png";
        break;
      case "gif":
        // GIF는 압축 옵션이 제한적, 그대로 출력
        outputBuffer = await sharpInstance.toBuffer();
        format = "gif";
        contentType = "image/gif";
        break;
      case "webp":
        outputBuffer = await sharpInstance
          .webp({ quality })
          .toBuffer();
        format = "webp";
        contentType = "image/webp";
        break;
      default:
        // JPEG으로 처리
        outputBuffer = await sharpInstance
          .jpeg({ quality, mozjpeg: true }) // mozjpeg으로 더 효율적인 압축
          .toBuffer();
        format = "jpeg";
        contentType = "image/jpeg";
    }
  }

  // 결과 이미지 메타데이터 가져오기
  const outputMetadata = await sharp(outputBuffer).metadata();

  const result: ImageCompressionResult = {
    buffer: outputBuffer,
    format,
    contentType,
    originalSize,
    compressedSize: outputBuffer.length,
    width: outputMetadata.width || 0,
    height: outputMetadata.height || 0,
  };

  // 압축 결과 로깅
  const savings = originalSize - outputBuffer.length;
  const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
  console.log(
    `[Image Compression] ${(originalSize / 1024).toFixed(1)}KB → ${(outputBuffer.length / 1024).toFixed(1)}KB (${savingsPercent}% saved, format: ${format})`
  );

  return result;
}

/**
 * 파일 확장자를 포맷에 맞게 변경
 */
export function updateFilenameExtension(
  filename: string,
  newFormat: string
): string {
  // 기존 확장자 제거하고 새 확장자 추가
  const baseName = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, "");
  return `${baseName}.${newFormat}`;
}
