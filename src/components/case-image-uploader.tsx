/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { CASE_IMAGE_MIME_TYPES, isAllowedCaseImageFile, getCaseImagePublicUrl } from "@/lib/post-images";
import type { PostImage } from "@/lib/types";

type CaseImageUploaderProps = {
  existingImages?: PostImage[];
};

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function CaseImageUploader({ existingImages = [] }: CaseImageUploaderProps) {
  const [images, setImages] = useState(existingImages);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const accept = CASE_IMAGE_MIME_TYPES.join(",");
  const existingIds = useMemo(() => images.map((image) => image.id).join(","), [images]);
  const deleteIds = useMemo(() => deletedIds.join(","), [deletedIds]);

  const removeImage = (imageId: string) => {
    setImages((current) => current.filter((image) => image.id !== imageId));
    setDeletedIds((current) => (current.includes(imageId) ? current : [...current, imageId]));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= images.length) {
      return;
    }

    setImages((current) => moveItem(current, index, nextIndex));
  };

  return (
    <div className="image-uploader">
      <input name="existing_image_ids" type="hidden" value={existingIds} />
      <input name="delete_image_ids" type="hidden" value={deleteIds} />
      <div className="image-uploader__drop">
        <ImageIcon aria-hidden="true" />
        <div>
          <strong>이미지 파일만 등록 가능합니다.</strong>
          <span>JPG, JPEG, PNG 파일 10MB 이하</span>
        </div>
        <label className="button button--light">
          <Upload aria-hidden="true" className="button__icon" />
          파일 선택
          <input
            accept={accept}
            className="image-uploader__input"
            multiple
            name="case_images"
            onChange={(event) => {
              const files = Array.from(event.currentTarget.files ?? []);
              const invalid = files.find((file) => !isAllowedCaseImageFile(file));

              if (invalid) {
                event.currentTarget.value = "";
                setSelectedFiles([]);
                setMessage("이미지는 JPG, JPEG, PNG 형식의 10MB 이하 파일만 등록할 수 있습니다.");
                return;
              }

              setSelectedFiles(files);
              setMessage(files.length > 0 ? `${files.length}개 파일이 선택되었습니다.` : "");
            }}
            type="file"
          />
        </label>
      </div>
      {message ? <p className="field-help">{message}</p> : null}
      {selectedFiles.length > 0 ? (
        <ul className="image-uploader__file-list">
          {selectedFiles.map((file) => (
            <li key={`${file.name}-${file.size}`}>{file.name}</li>
          ))}
        </ul>
      ) : null}
      {images.length > 0 ? (
        <div className="image-uploader__grid">
          {images.map((image, index) => {
            const imageUrl = getCaseImagePublicUrl(image.storage_path);

            return (
              <figure className="image-uploader__thumb" key={image.id}>
                {imageUrl ? <img alt={image.alt_text ?? ""} src={imageUrl} /> : <div className="case-placeholder">사진없음</div>}
                <figcaption>
                  <span>{index + 1}</span>
                  <div className="image-uploader__tools">
                    <button
                      aria-label="앞으로 이동"
                      disabled={index === 0}
                      onClick={() => moveImage(index, -1)}
                      title="앞으로 이동"
                      type="button"
                    >
                      <ArrowUp />
                    </button>
                    <button
                      aria-label="뒤로 이동"
                      disabled={index === images.length - 1}
                      onClick={() => moveImage(index, 1)}
                      title="뒤로 이동"
                      type="button"
                    >
                      <ArrowDown />
                    </button>
                    <button aria-label="삭제" onClick={() => removeImage(image.id)} title="삭제" type="button">
                      <Trash2 />
                    </button>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      ) : (
        <div className="case-placeholder case-placeholder--upload">사진없음</div>
      )}
    </div>
  );
}
