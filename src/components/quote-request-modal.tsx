"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  FileText,
  House,
  Landmark,
  Layers,
  Paintbrush,
  Paperclip,
  Phone,
  Shield,
  User,
  X,
} from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { DemolitionType } from "@/lib/types";

const maxAttachmentBytes = 10 * 1024 * 1024;
const allowedAttachmentTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const allowedAttachmentExtensions = new Set(["pdf", "jpg", "jpeg", "png", "webp"]);

const demolitionOptions = [
  { value: "complete", label: "완전 철거", Icon: Building2 },
  { value: "interior", label: "인테리어 철거", Icon: Paintbrush },
  { value: "asbestos", label: "석면 해체", Icon: Shield },
  { value: "structure", label: "구조물 해체", Icon: Landmark },
  { value: "support_fund", label: "철거지원금", Icon: Banknote },
  { value: "scaffold", label: "비계공사", Icon: Layers },
  { value: "earthwork", label: "토공사", Icon: House },
  { value: "other", label: "기타", Icon: Building2 },
] satisfies Array<{ value: DemolitionType; label: string; Icon: typeof Building2 }>;

const regionOptions = ["서울", "경기", "인천", "강원", "충청", "전라", "경상", "제주", "기타"];

type Step = 1 | 2 | 3;
type SubmitStatus = "idle" | "submitting" | "success";

type QuoteFields = {
  region: string;
  address: string;
  area: string;
  siteMemo: string;
  name: string;
  phone: string;
  privacyAgreed: boolean;
};

const initialFields: QuoteFields = {
  region: "",
  address: "",
  area: "",
  siteMemo: "",
  name: "",
  phone: "",
  privacyAgreed: false,
};

function validateAttachment(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (file.size > maxAttachmentBytes) {
    return "첨부파일은 10MB 이하만 가능합니다.";
  }

  if (!allowedAttachmentTypes.has(file.type) || !allowedAttachmentExtensions.has(extension)) {
    return "첨부파일은 PDF, JPG, PNG, WEBP만 가능합니다.";
  }

  return "";
}

async function readFunctionError(error: unknown) {
  if (typeof error === "object" && error && "context" in error) {
    const context = (error as { context?: unknown }).context;

    if (context instanceof Response) {
      try {
        const payload = (await context.clone().json()) as { error?: string };

        if (payload.error) {
          return payload.error;
        }
      } catch {
        // Fall through to the generic message below.
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "견적 요청 전송 중 오류가 발생했습니다.";
}

export function QuoteRequestModal() {
  const headingId = useId();
  const fileInputId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [selectedTypes, setSelectedTypes] = useState<DemolitionType[]>([]);
  const [fields, setFields] = useState<QuoteFields>(initialFields);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && submitStatus !== "submitting") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, submitStatus]);

  const resetForm = () => {
    setStep(1);
    setSelectedTypes([]);
    setFields(initialFields);
    setAttachment(null);
    setErrorMessage("");
    setSubmitStatus("idle");
  };

  const openModal = () => {
    resetForm();
    setIsOpen(true);
  };

  const closeModal = () => {
    if (submitStatus === "submitting") {
      return;
    }

    setIsOpen(false);
  };

  const updateField = (key: keyof QuoteFields, value: string | boolean) => {
    setFields((current) => ({ ...current, [key]: value }));
    setErrorMessage("");
  };

  const toggleType = (type: DemolitionType) => {
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((value) => value !== type) : [...current, type],
    );
    setErrorMessage("");
  };

  const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setErrorMessage("");

    if (!file) {
      setAttachment(null);
      return;
    }

    const validationMessage = validateAttachment(file);

    if (validationMessage) {
      setAttachment(null);
      event.target.value = "";
      setErrorMessage(validationMessage);
      return;
    }

    setAttachment(file);
  };

  const goNext = () => {
    if (step === 1 && selectedTypes.length === 0) {
      setErrorMessage("철거 유형을 1개 이상 선택해 주세요.");
      return;
    }

    if (step < 3) {
      setStep((current) => (current + 1) as Step);
      setErrorMessage("");
    }
  };

  const goPrevious = () => {
    if (step > 1) {
      setStep((current) => (current - 1) as Step);
      setErrorMessage("");
    }
  };

  const canSubmit = fields.phone.trim().length > 0 && fields.privacyAgreed && submitStatus !== "submitting";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (fields.phone.trim().length === 0) {
      setErrorMessage("전화번호를 입력해 주세요.");
      return;
    }

    if (!fields.privacyAgreed) {
      setErrorMessage("개인정보처리방침 동의가 필요합니다.");
      return;
    }

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setErrorMessage("견적 요청 전송 설정이 필요합니다.");
      return;
    }

    const formData = new FormData();
    selectedTypes.forEach((type) => formData.append("demolitionTypes", type));
    formData.append("region", fields.region);
    formData.append("address", fields.address);
    formData.append("area", fields.area);
    formData.append("siteMemo", fields.siteMemo);
    formData.append("name", fields.name);
    formData.append("phone", fields.phone);
    formData.append("privacyAgreed", String(fields.privacyAgreed));

    if (attachment) {
      formData.append("attachment", attachment);
    }

    setSubmitStatus("submitting");
    setErrorMessage("");

    const { error } = await supabase.functions.invoke("quote-request", {
      body: formData,
    });

    if (error) {
      setSubmitStatus("idle");
      setErrorMessage(await readFunctionError(error));
      return;
    }

    setSubmitStatus("success");
  };

  return (
    <>
      <button className="button quote-open-button" type="button" onClick={openModal}>
        <span className="quote-open-button__icon-block" aria-hidden="true">
          <FileText className="quote-open-button__icon" />
        </span>
        <span className="quote-open-button__label">무료 비교 견적 받기</span>
        <ArrowRight className="quote-open-button__arrow" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          className="quote-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="quote-modal__dialog">
            <div className="quote-modal__progress" aria-label={`견적 요청 ${step}단계`}>
              {[1, 2, 3].map((segment) => (
                <span
                  className={segment <= step ? "quote-modal__progress-bar quote-modal__progress-bar--active" : "quote-modal__progress-bar"}
                  key={segment}
                />
              ))}
            </div>

            <button
              className="quote-modal__close"
              type="button"
              aria-label="견적 요청 닫기"
              onClick={closeModal}
              ref={closeButtonRef}
            >
              <X aria-hidden="true" />
            </button>

            {submitStatus === "success" ? (
              <div className="quote-modal__success">
                <p className="eyebrow">REQUEST SENT</p>
                <h2 id={headingId}>견적 요청이 접수되었습니다</h2>
                <p>전문 상담사가 확인 후 연락드릴 예정입니다.</p>
                <button className="button" type="button" onClick={closeModal}>
                  확인
                </button>
              </div>
            ) : (
              <form className="quote-modal__form" onSubmit={handleSubmit}>
                {step === 1 ? (
                  <section className="quote-modal__step" aria-labelledby={headingId}>
                    <h2 id={headingId}>어떤 철거가 필요하신가요?</h2>
                    <p>철거 유형을 선택해 주세요. 복수 선택 가능합니다.</p>
                    <div className="quote-type-grid">
                      {demolitionOptions.map(({ value, label, Icon }) => {
                        const isSelected = selectedTypes.includes(value);

                        return (
                          <button
                            className={isSelected ? "quote-type-card quote-type-card--selected" : "quote-type-card"}
                            type="button"
                            aria-pressed={isSelected}
                            key={value}
                            onClick={() => toggleType(value)}
                          >
                            <Icon className="quote-type-card__icon" aria-hidden="true" />
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ) : null}

                {step === 2 ? (
                  <section className="quote-modal__step" aria-labelledby={headingId}>
                    <h2 id={headingId}>현장 정보를 알려주세요</h2>
                    <p>선택 사항이며, 더 정확한 매칭에 도움이 됩니다.</p>
                    <label className="quote-label">
                      <span>지역</span>
                      <select className="quote-field" value={fields.region} onChange={(event) => updateField("region", event.target.value)}>
                        <option value="">지역을 선택해 주세요</option>
                        {regionOptions.map((region) => (
                          <option value={region} key={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="quote-label">
                      <span>현장 주소</span>
                      <input
                        className="quote-field"
                        value={fields.address}
                        onChange={(event) => updateField("address", event.target.value)}
                        placeholder="예: 서울시 강남구 역삼동 123"
                      />
                    </label>
                    <label className="quote-label">
                      <span>대략적인 면적</span>
                      <input
                        className="quote-field"
                        value={fields.area}
                        onChange={(event) => updateField("area", event.target.value)}
                        placeholder="예: 500평, 1000m2"
                      />
                    </label>
                    <label className="quote-label">
                      <span>건축물대장 메모</span>
                      <textarea
                        className="quote-field quote-field--textarea"
                        value={fields.siteMemo}
                        onChange={(event) => updateField("siteMemo", event.target.value)}
                        placeholder="건축물대장 관련 참고사항이 있다면 입력해 주세요"
                      />
                    </label>
                    <div className="quote-label">
                      <span>타업체 견적서</span>
                      <label className="quote-file" htmlFor={fileInputId}>
                        <Paperclip aria-hidden="true" />
                        <span>{attachment ? attachment.name : "견적서 파일 첨부"}</span>
                      </label>
                      <input
                        className="quote-file__input"
                        id={fileInputId}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                        onChange={handleAttachmentChange}
                      />
                      <p className="quote-help">타업체 견적서 첨부 시 더 저렴한 제안으로 안내해드립니다.</p>
                    </div>
                  </section>
                ) : null}

                {step === 3 ? (
                  <section className="quote-modal__step" aria-labelledby={headingId}>
                    <h2 id={headingId}>연락처를 입력해 주세요</h2>
                    <p>24시간 내 전문 상담사가 연락드립니다.</p>
                    <label className="quote-label">
                      <span className="quote-label__with-icon">
                        <User aria-hidden="true" />
                        성함
                      </span>
                      <input
                        className="quote-field"
                        value={fields.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        placeholder="홍길동"
                      />
                    </label>
                    <label className="quote-label">
                      <span className="quote-label__with-icon">
                        <Phone aria-hidden="true" />
                        전화번호 *
                      </span>
                      <input
                        className="quote-field"
                        value={fields.phone}
                        onChange={(event) => updateField("phone", event.target.value)}
                        placeholder="010-1234-5678"
                        inputMode="tel"
                        required
                      />
                    </label>
                    <p className="quote-help">빠른 연락을 위해 전화번호를 입력해 주세요.</p>
                    <label className="quote-consent">
                      <input
                        type="checkbox"
                        checked={fields.privacyAgreed}
                        onChange={(event) => updateField("privacyAgreed", event.target.checked)}
                      />
                      <span className="quote-consent__box" aria-hidden="true" />
                      <span>
                        개인정보처리방침에 동의합니다. <strong>(필수)</strong>{" "}
                        <Link href="/privacy" className="quote-consent__link">
                          개인정보처리방침 보기
                        </Link>
                      </span>
                    </label>
                  </section>
                ) : null}

                {errorMessage ? <p className="quote-error">{errorMessage}</p> : null}

                <div className="quote-modal__actions">
                  {step > 1 ? (
                    <button className="button button--light quote-modal__back" type="button" onClick={goPrevious}>
                      <ArrowLeft aria-hidden="true" />
                      이전
                    </button>
                  ) : null}
                  {step < 3 ? (
                    <button
                      className="button quote-modal__next"
                      type="button"
                      onClick={goNext}
                      disabled={step === 1 && selectedTypes.length === 0}
                    >
                      다음
                      <ArrowRight aria-hidden="true" />
                    </button>
                  ) : (
                    <button className="button quote-modal__next" type="submit" disabled={!canSubmit}>
                      {submitStatus === "submitting" ? "전송 중" : "매칭 시작"}
                      <ArrowRight aria-hidden="true" />
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
