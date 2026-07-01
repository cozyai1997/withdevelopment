"use client";

import { useState } from "react";
import { CaseImageUploader } from "@/components/case-image-uploader";
import { RichTextEditor } from "@/components/rich-text-editor";
import { boards } from "@/lib/site";
import { caseCategories, type Board, type PostWithImages } from "@/lib/types";

type PostFormProps = {
  post?: PostWithImages;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

const boardEntries = Object.entries(boards) as [Board, (typeof boards)[Board]][];

export function PostForm({ post, action, submitLabel }: PostFormProps) {
  const [board, setBoard] = useState<Board>(post?.board ?? "cases");
  const isCaseBoard = board === "cases";

  return (
    <form action={action} className="form form--post">
      <div className="form-grid form-grid--two">
        <label className="form-label">
          게시판 구분
          <select className="field" name="board" onChange={(event) => setBoard(event.currentTarget.value as Board)} value={board} required>
            {boardEntries.map(([value, boardInfo]) => (
              <option key={value} value={value}>
                {boardInfo.label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          공개 상태
          <select className="field" name="status" defaultValue={post?.status ?? "draft"} required>
            <option value="draft">비공개</option>
            <option value="published">공개</option>
          </select>
        </label>
      </div>

      <label className="form-label">
        시공 제목
        <span className="field-caption">상세 페이지 제목과 목록 카드 제목으로 표시됩니다. 최대 100자</span>
        <input className="field" name="title" defaultValue={post?.title ?? ""} maxLength={100} required />
      </label>

      <label className="form-label">
        상세 페이지 주소
        <span className="field-caption">비워두면 시공 제목 기준으로 자동 생성됩니다.</span>
        <input className="field" name="slug" defaultValue={post?.slug ?? ""} maxLength={80} placeholder="예: ulsan-store-demolition" />
      </label>

      <label className="form-label">
        현장 요약
        <span className="field-caption">목록, 홈 카드, 상세 상단 설명에 표시됩니다.</span>
        <textarea className="field field--short" name="excerpt" defaultValue={post?.excerpt ?? ""} maxLength={240} />
      </label>

      {isCaseBoard ? (
        <fieldset className="case-form-section">
          <legend>현장 정보</legend>
          <div className="form-grid form-grid--two">
            <label className="form-label">
              공사 유형
              <select className="field" name="case_category" defaultValue={post?.case_category ?? ""} required={isCaseBoard}>
                <option value="" disabled>
                  공사 유형을 선택하세요
                </option>
                {caseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-label">
              시공 지역
              <input className="field" name="case_location" defaultValue={post?.case_location ?? ""} placeholder="예: 울산광역시 북구" />
            </label>
            <label className="form-label">
              시공 면적
              <input className="field" name="case_area" defaultValue={post?.case_area ?? ""} placeholder="예: 20평" />
            </label>
            <label className="form-label">
              건물 유형
              <input className="field" name="case_cost" defaultValue={post?.case_cost ?? ""} placeholder="예: 상가, 사무실, 주택" />
            </label>
          </div>
          <label className="form-label">
            현장 동영상 URL
            <input
              className="field"
              name="video_url"
              defaultValue={post?.video_url ?? ""}
              inputMode="url"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </label>
        </fieldset>
      ) : null}

      <label className="form-label">
        시공 현장 분석
        <span className="field-caption">상세 페이지 분석 영역에 표시됩니다.</span>
        <RichTextEditor initialContent={post?.content ?? ""} maxLength={5000} name="content" />
      </label>

      {isCaseBoard ? (
        <section className="case-form-section" aria-labelledby="case-images-heading">
          <div className="case-form-section__heading">
            <h2 id="case-images-heading">시공 사진</h2>
            <p>상세 상단 갤러리와 목록 썸네일에 표시됩니다. 첫 번째 이미지가 대표 사진입니다.</p>
          </div>
          <CaseImageUploader existingImages={post?.images ?? []} />
        </section>
      ) : null}

      <div className="actions">
        <button className="button" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
