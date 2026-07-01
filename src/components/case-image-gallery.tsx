/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { getCaseImagePublicUrl } from "@/lib/post-images";
import type { PostImage } from "@/lib/types";

type CaseImageGalleryProps = {
  images: PostImage[];
  title: string;
};

export function CaseImageGallery({ images, title }: CaseImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];
  const activeImageUrl = getCaseImagePublicUrl(activeImage?.storage_path);
  const thumbImages = images.filter((_, index) => index !== activeIndex).slice(0, 4);
  const extraImageCount = Math.max(images.length - 5, 0);

  return (
    <div className={images.length > 1 ? "case-detail-gallery" : "case-detail-gallery case-detail-gallery--single"}>
      <div className="case-detail-gallery__grid">
        <div className="case-detail-gallery__main">
          {activeImageUrl ? (
            <img alt={activeImage?.alt_text ?? title} src={activeImageUrl} />
          ) : (
            <div className="case-placeholder case-placeholder--detail">사진없음</div>
          )}
        </div>
        {thumbImages.length > 0 ? (
          <div className="case-detail-gallery__tiles" aria-label="시공 이미지 목록">
            {thumbImages.map((image, index) => {
              const imageUrl = getCaseImagePublicUrl(image.storage_path);
              const originalIndex = images.findIndex((item) => item.id === image.id);
              const shouldShowMore = index === thumbImages.length - 1 && extraImageCount > 0;

              return (
                <button
                  aria-label={`${originalIndex + 1}번 이미지 크게 보기`}
                  className="case-detail-gallery__tile"
                  key={image.id}
                  onClick={() => setActiveIndex(originalIndex)}
                  type="button"
                >
                  {imageUrl ? <img alt="" src={imageUrl} /> : <span>사진없음</span>}
                  {shouldShowMore ? <span className="case-detail-gallery__more">+{extraImageCount}</span> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
