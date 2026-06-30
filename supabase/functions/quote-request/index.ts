import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

const quoteBucket = "quote-attachments";
const maxAttachmentBytes = 10 * 1024 * 1024;
const allowedTypes = new Set(["complete", "interior", "asbestos", "structure", "support_fund", "scaffold", "earthwork", "other"]);
const allowedRegions = new Set(["서울", "경기", "인천", "강원", "충청", "전라", "경상", "제주", "기타"]);
const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const allowedExtensions = new Set(["pdf", "jpg", "jpeg", "png", "webp"]);

const typeLabels: Record<string, string> = {
  complete: "완전 철거",
  interior: "인테리어 철거",
  asbestos: "석면 해체",
  structure: "구조물 해체",
  support_fund: "철거지원금",
  scaffold: "비계공사",
  earthwork: "토공사",
  other: "기타",
};

type QuotePayload = {
  id: string;
  demolitionTypes: string[];
  region: string | null;
  address: string | null;
  area: string | null;
  siteMemo: string | null;
  name: string | null;
  phone: string;
  attachmentName: string | null;
  attachmentSignedUrl: string | null;
};

class HttpError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const respond = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });

const readSecret = (name: string) => Deno.env.get(name)?.trim() ?? "";

const readSupabaseServiceKey = () => {
  const legacyKey = readSecret("SUPABASE_SERVICE_ROLE_KEY");

  if (legacyKey) {
    return legacyKey;
  }

  const rawSecretKeys = readSecret("SUPABASE_SECRET_KEYS");

  if (!rawSecretKeys) {
    return "";
  }

  try {
    const parsed = JSON.parse(rawSecretKeys) as Record<string, string>;
    return parsed.default ?? Object.values(parsed)[0] ?? "";
  } catch {
    return "";
  }
};

const cleanString = (value: FormDataEntryValue | null, maxLength: number) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
};

const cleanRequiredString = (value: FormDataEntryValue | null, maxLength: number, message: string) => {
  const cleaned = cleanString(value, maxLength);

  if (!cleaned) {
    throw new HttpError(message);
  }

  return cleaned;
};

const parseDemolitionTypes = (formData: FormData) => {
  const values = formData
    .getAll("demolitionTypes")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);

  const uniqueValues = Array.from(new Set(values));

  if (uniqueValues.length === 0) {
    throw new HttpError("철거 유형을 1개 이상 선택해 주세요.");
  }

  const hasInvalidValue = uniqueValues.some((value) => !allowedTypes.has(value));

  if (hasInvalidValue) {
    throw new HttpError("지원하지 않는 철거 유형이 포함되어 있습니다.");
  }

  return uniqueValues;
};

const parseAttachment = (formData: FormData) => {
  const attachment = formData.get("attachment");

  if (!(attachment instanceof File) || attachment.size === 0) {
    return null;
  }

  const extension = attachment.name.split(".").pop()?.toLowerCase() ?? "";

  if (attachment.size > maxAttachmentBytes) {
    throw new HttpError("첨부파일은 10MB 이하만 가능합니다.");
  }

  if (!allowedMimeTypes.has(attachment.type) || !allowedExtensions.has(extension)) {
    throw new HttpError("첨부파일은 PDF, JPG, PNG, WEBP만 가능합니다.");
  }

  return attachment;
};

const sanitizeFileName = (fileName: string) => {
  const cleaned = fileName
    .normalize("NFKC")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

  return cleaned || "attachment";
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const formatOptional = (value: string | null) => value || "미입력";

const buildEmail = (payload: QuotePayload) => {
  const demolitionTypes = payload.demolitionTypes.map((type) => typeLabels[type] ?? type).join(", ");
  const attachmentLine = payload.attachmentSignedUrl
    ? `<p><strong>첨부파일:</strong> <a href="${escapeHtml(payload.attachmentSignedUrl)}">${escapeHtml(payload.attachmentName ?? "첨부파일 열기")}</a></p>`
    : "<p><strong>첨부파일:</strong> 없음</p>";

  const html = `
    <h1>무료 비교 견적 요청</h1>
    <p><strong>요청 ID:</strong> ${escapeHtml(payload.id)}</p>
    <p><strong>철거 유형:</strong> ${escapeHtml(demolitionTypes)}</p>
    <p><strong>지역:</strong> ${escapeHtml(formatOptional(payload.region))}</p>
    <p><strong>현장 주소:</strong> ${escapeHtml(formatOptional(payload.address))}</p>
    <p><strong>대략 면적:</strong> ${escapeHtml(formatOptional(payload.area))}</p>
    <p><strong>건축물대장 메모:</strong> ${escapeHtml(formatOptional(payload.siteMemo))}</p>
    <p><strong>성함:</strong> ${escapeHtml(formatOptional(payload.name))}</p>
    <p><strong>전화번호:</strong> ${escapeHtml(payload.phone)}</p>
    ${attachmentLine}
  `;

  const text = [
    "무료 비교 견적 요청",
    `요청 ID: ${payload.id}`,
    `철거 유형: ${demolitionTypes}`,
    `지역: ${formatOptional(payload.region)}`,
    `현장 주소: ${formatOptional(payload.address)}`,
    `대략 면적: ${formatOptional(payload.area)}`,
    `건축물대장 메모: ${formatOptional(payload.siteMemo)}`,
    `성함: ${formatOptional(payload.name)}`,
    `전화번호: ${payload.phone}`,
    `첨부파일: ${payload.attachmentSignedUrl ?? "없음"}`,
  ].join("\n");

  return { html, text };
};

const sendEmail = async (payload: QuotePayload) => {
  const apiKey = readSecret("RESEND_API_KEY");
  const toEmail = readSecret("QUOTE_REQUEST_TO_EMAIL");
  const fromEmail = readSecret("QUOTE_REQUEST_FROM_EMAIL");

  if (!apiKey || !toEmail || !fromEmail) {
    throw new HttpError("견적 요청 이메일 설정이 필요합니다.", 500);
  }

  const email = buildEmail(payload);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "hamkke-dev-site/1.0",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: toEmail.split(",").map((emailAddress) => emailAddress.trim()).filter(Boolean),
      subject: `[함께하는개발] 무료 비교 견적 요청 - ${payload.phone}`,
      html: email.html,
      text: email.text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new HttpError(errorText || "이메일 발송에 실패했습니다.", 502);
  }
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return respond({ error: "지원하지 않는 요청입니다." }, 405);
  }

  try {
    const supabaseUrl = readSecret("SUPABASE_URL");
    const serviceRoleKey = readSupabaseServiceKey();

    if (!supabaseUrl || !serviceRoleKey) {
      throw new HttpError("Supabase Edge Function 설정이 필요합니다.", 500);
    }

    const formData = await request.formData();
    const quoteId = crypto.randomUUID();
    const demolitionTypes = parseDemolitionTypes(formData);
    const region = cleanString(formData.get("region"), 20);
    const address = cleanString(formData.get("address"), 160);
    const area = cleanString(formData.get("area"), 80);
    const siteMemo = cleanString(formData.get("siteMemo"), 1000);
    const name = cleanString(formData.get("name"), 80);
    const phone = cleanRequiredString(formData.get("phone"), 40, "전화번호를 입력해 주세요.");
    const privacyAgreed = formData.get("privacyAgreed") === "true";
    const attachment = parseAttachment(formData);

    if (region && !allowedRegions.has(region)) {
      throw new HttpError("지원하지 않는 지역 값입니다.");
    }

    if (!privacyAgreed) {
      throw new HttpError("개인정보처리방침 동의가 필요합니다.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    let attachmentPath: string | null = null;
    let attachmentName: string | null = null;
    let attachmentMimeType: string | null = null;
    let attachmentSizeBytes: number | null = null;
    let attachmentSignedUrl: string | null = null;

    if (attachment) {
      attachmentName = attachment.name;
      attachmentMimeType = attachment.type;
      attachmentSizeBytes = attachment.size;
      attachmentPath = `${quoteId}/${crypto.randomUUID()}-${sanitizeFileName(attachment.name)}`;

      const { error: uploadError } = await supabase.storage.from(quoteBucket).upload(attachmentPath, attachment, {
        contentType: attachment.type,
        upsert: false,
      });

      if (uploadError) {
        throw new HttpError("첨부파일 업로드에 실패했습니다.", 500);
      }

      const signedUrlSeconds = Number(readSecret("QUOTE_ATTACHMENT_SIGNED_URL_SECONDS") || "604800");
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(quoteBucket)
        .createSignedUrl(attachmentPath, Number.isFinite(signedUrlSeconds) ? signedUrlSeconds : 604800);

      if (signedUrlError || !signedUrlData?.signedUrl) {
        await supabase.storage.from(quoteBucket).remove([attachmentPath]);
        throw new HttpError("첨부파일 링크 생성에 실패했습니다.", 500);
      }

      attachmentSignedUrl = signedUrlData.signedUrl;
    }

    const { error: insertError } = await supabase.from("quote_requests").insert({
      id: quoteId,
      demolition_types: demolitionTypes,
      region,
      address,
      area,
      site_memo: siteMemo,
      contact_name: name,
      phone,
      privacy_agreed: privacyAgreed,
      attachment_bucket: attachmentPath ? quoteBucket : null,
      attachment_path: attachmentPath,
      attachment_name: attachmentName,
      attachment_mime_type: attachmentMimeType,
      attachment_size_bytes: attachmentSizeBytes,
      email_status: "pending",
    });

    if (insertError) {
      if (attachmentPath) {
        await supabase.storage.from(quoteBucket).remove([attachmentPath]);
      }

      throw new HttpError("견적 요청 저장에 실패했습니다.", 500);
    }

    try {
      await sendEmail({
        id: quoteId,
        demolitionTypes,
        region,
        address,
        area,
        siteMemo,
        name,
        phone,
        attachmentName,
        attachmentSignedUrl,
      });

      await supabase.from("quote_requests").update({ email_status: "sent", email_error: null }).eq("id", quoteId);
    } catch (emailError) {
      const message = emailError instanceof Error ? emailError.message : "이메일 발송에 실패했습니다.";
      await supabase
        .from("quote_requests")
        .update({ email_status: "failed", email_error: message.slice(0, 1000) })
        .eq("id", quoteId);

      return respond({ error: "요청은 저장되었지만 이메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요." }, 502);
    }

    return respond({ ok: true, id: quoteId });
  } catch (error) {
    if (error instanceof HttpError) {
      return respond({ error: error.message }, error.status);
    }

    return respond({ error: "견적 요청 전송 중 오류가 발생했습니다." }, 500);
  }
});
