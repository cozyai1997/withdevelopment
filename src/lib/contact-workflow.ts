export type ContactWorkflowIcon = "search" | "handshake" | "calendar" | "truck" | "check";

// 문의 접수 페이지의 문구는 운영자가 수정하기 쉽도록 이 파일 한 곳에서 관리합니다.
export const contactWorkflowContent = {
  metadata: {
    title: "문의",
    description: "문의 접수부터 현장 정리 및 후속 안내까지 진행 흐름과 공식 문의 채널을 안내합니다.",
  },
  intro: {
    eyebrow: "WORKFLOW",
    titleLines: ["문의부터 정리까지"],
    descriptionLines: ["문의 접수부터 현장 정리 및 후속 안내까지,", "체계적인 절차로 안전하고 신속하게 진행됩니다."],
  },
  tag: {
    title: "문의의 시작",
    description: "빠르고 정확한 대응",
  },
  hub: {
    title: "문의 접수",
    description: "문의가 접수되면\n전담 담당자가 배정됩니다.",
  },
  steps: [
    {
      title: "현장 조건 확인",
      description: "현장 상황 및\n기본 조건 확인",
      icon: "search",
    },
    {
      title: "작업 범위 협의",
      description: "철거 범위 및\n세부 내용 협의",
      icon: "handshake",
    },
    {
      title: "일정·안전 계획 수립",
      description: "공사 일정 및\n안전 계획 수립",
      icon: "calendar",
    },
    {
      title: "철거 진행",
      description: "안전하게 철거 작업\n실시 및 관리",
      icon: "truck",
    },
    {
      title: "정리 및 후속 안내",
      description: "현장 정리 및\n후속 절차 안내",
      icon: "check",
    },
  ],
  safety: {
    title: "안전 최우선",
    description: "모든 과정은 안전을 최우선으로 하며, 고객 만족을 위해 책임감 있게 진행합니다.",
  },
  contactActions: {
    eyebrow: "CONTACT",
    title: "문의 채널",
    description: "공식 연락처와 채널 URL이 확정되면 환경변수로 바로 연결합니다.",
    buttons: {
      tel: "전화 문의",
      sms: "문자 문의",
      kakao: "카카오 채널",
    },
  },
  checklist: {
    eyebrow: "CHECKLIST",
    title: "문의 전 준비",
    items: [
      "현장 종류와 작업 범위를 간단히 정리합니다.",
      "상세 주소 대신 지역 단위 정보를 먼저 공유합니다.",
      "사진은 얼굴, 차량번호, 개인 정보가 보이지 않게 확인합니다.",
    ],
  },
} as const;
