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
