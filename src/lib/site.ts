import type { Board } from "@/lib/types";

export const siteName = "함께하는개발";

export const boards: Record<Board, { href: string; label: string; description: string }> = {
  cases: {
    href: "/cases",
    label: "시공실적",
    description: "지역 단위와 공사 유형 중심으로 공개 가능한 실적을 정리합니다.",
  },
  notice: {
    href: "/notice",
    label: "공지사항",
    description: "운영 공지와 서비스 안내를 게시합니다.",
  },
  resources: {
    href: "/resources",
    label: "자료실",
    description: "철거 준비 체크리스트와 문의 전 확인사항을 제공합니다.",
  },
};

export const publicNav = [
  { href: "/about", label: "회사소개" },
  { href: "/services", label: "서비스" },
  { href: "/cases", label: "시공실적" },
  { href: "/notice", label: "공지사항" },
  { href: "/resources", label: "자료실" },
  { href: "/contact", label: "문의" },
];

export const services = [
  {
    slug: "structure-demolition",
    title: "구조물 철거",
    lead: "건축물과 구조물의 현장 조건을 확인한 뒤 안전한 철거 흐름을 설계합니다.",
    points: ["현장 조사", "작업 범위 협의", "안전 동선 검토", "폐기물 처리 연계"],
  },
  {
    slug: "remodeling-demolition",
    title: "리모델링 철거",
    lead: "상가, 주거, 내부 공간의 리모델링 전 철거 범위를 구분해 진행합니다.",
    points: ["내부 마감 철거", "부분 철거", "보양 계획", "소음과 분진 관리"],
  },
  {
    slug: "permit-support",
    title: "철거 대관업무",
    lead: "철거 전 필요한 신고와 현장 행정 절차를 프로젝트 조건에 맞게 지원합니다.",
    points: ["사전 서류 확인", "신고 절차 안내", "관계 기관 협의", "현장 기록 관리"],
  },
  {
    slug: "redevelopment-demolition",
    title: "재개발·재건축구역 철거",
    lead: "정비구역 특성을 고려해 이해관계자 협업과 단계별 현장 관리를 수행합니다.",
    points: ["구역 단위 일정 협의", "민원 리스크 점검", "안전 계획", "단계별 철거 관리"],
  },
];

export const servicePageContent = {
  heroImage: "/services/hero-structure.png",
  serviceImages: {
    structure: "/services/structure-demolition.png",
    remodeling: "/services/remodeling-demolition.png",
    permit: "/services/permit-support.png",
    redevelopment: "/services/redevelopment-demolition.png",
  },
  cards: [
    {
      slug: "structure-demolition",
      number: "01",
      icon: "building",
      imageSrc: "/services/structure-demolition.png",
      title: "구조물 철거",
      lead: "건축물과 구조물의 현장 조건을 확인한 뒤 안전한 철거 흐름을 설계합니다.",
      tags: ["완파", "부분 철거", "구조물 철거"],
    },
    {
      slug: "remodeling-demolition",
      number: "02",
      icon: "house",
      imageSrc: "/services/remodeling-demolition.png",
      title: "리모델링 철거",
      lead: "상가, 주거, 내부 공간의 리모델링 전 철거 범위를 구분해 진행합니다.",
      tags: ["내부 철거", "원상복구", "마감재 철거"],
    },
    {
      slug: "permit-support",
      number: "03",
      icon: "document",
      imageSrc: "/services/permit-support.png",
      title: "철거 대관업무",
      lead: "철거 전 필요한 신고, 허가, 행정 절차를 현장 조건에 맞춰 지원합니다.",
      tags: ["해체 신고", "해체 허가", "멸실 관련 업무"],
    },
    {
      slug: "redevelopment-demolition",
      number: "04",
      icon: "landmark",
      imageSrc: "/services/redevelopment-demolition.png",
      title: "재개발·재건축구역 철거",
      lead: "정비구역 특성과 이해관계자 협의를 고려해 단계별 철거 관리를 수행합니다.",
      tags: ["정비구역 철거", "순차 철거", "협의 및 관리"],
    },
  ],
  processSteps: [
    {
      number: "01",
      icon: "search",
      title: "현장 확인",
      description: "현장 조사 및 주변 환경, 구조, 작업 범위를 확인합니다.",
    },
    {
      number: "02",
      icon: "clipboard",
      title: "철거 범위 산정",
      description: "안전 계획과 철거 범위를 구분하여 산정합니다.",
    },
    {
      number: "03",
      icon: "file",
      title: "신고·허가 검토",
      description: "필요한 신고와 허가 절차를 검토하고 진행합니다.",
    },
    {
      number: "04",
      icon: "worker",
      title: "시공 및 폐기물 처리",
      description: "안전하게 철거를 진행하고 폐기물을 적법하게 처리합니다.",
    },
  ],
} as const;

function parsePublicNumber(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getLocationContent() {
  const address = process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "공식 주소 준비 중";
  const lat = parsePublicNumber(process.env.NEXT_PUBLIC_COMPANY_LAT);
  const lng = parsePublicNumber(process.env.NEXT_PUBLIC_COMPANY_LNG);
  const naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || "";
  const naverMapUrl = process.env.NEXT_PUBLIC_NAVER_MAP_URL || "";

  return {
    title: "함께하는개발 오시는 길",
    eyebrow: "LOCATION",
    description: "방문 전 공식 문의 채널로 일정을 확인해 주세요.",
    address,
    lat,
    lng,
    naverMapClientId,
    naverMapUrl,
  };
}

export function getContactLinks() {
  return {
    tel: process.env.NEXT_PUBLIC_CONTACT_TEL ?? "",
    sms: process.env.NEXT_PUBLIC_CONTACT_SMS ?? "",
    kakao: process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL ?? "",
  };
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
