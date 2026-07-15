export type ContactEntryIcon = "site" | "partner";
export type ContactPromiseIcon = "shield" | "process" | "worker" | "care";
export type ContactChoiceIcon = "building" | "document" | "house" | "worker" | "truck" | "handshake";
export type ContactMethodIcon = "phone" | "kakao" | "sms";

// 문의 페이지 문구와 선택지는 운영자가 수정하기 쉽도록 이 파일 한 곳에서 관리합니다.
export const contactWorkflowContent = {
  metadata: {
    title: "문의",
    description: "현장 철거 문의와 협력업체 제휴 문의를 목적에 맞게 접수합니다.",
  },
  hero: {
    eyebrow: "CONTACT",
    kicker: "현장 문의와 협력 문의,",
    titleLines: ["목적에 맞게", "빠르게 연결합니다."],
    descriptionLines: [
      "철거 견적 상담부터 협력업체 제휴까지,",
      "문의 유형에 따라 담당자가 확인 후 순차적으로 안내드립니다.",
    ],
    backgroundImage: "/services/hero-structure.png",
  },
  entryCards: [
    {
      id: "site-inquiry",
      icon: "site",
      title: "현장 문의",
      description: "철거 견적, 현장 조사, 일정, 인허가 상담이 필요하다면 이곳으로 연결됩니다.",
      cta: "현장 문의하기",
    },
    {
      id: "partner-inquiry",
      icon: "partner",
      title: "협력업체 문의",
      description: "공사 연계, 제휴, 장비·폐기물·대관 협력 파트너를 찾고 계신다면 이곳으로 연결됩니다.",
      cta: "협력 문의하기",
    },
  ] as const,
  promises: [
    {
      icon: "shield",
      title: "안전 최우선",
      description: "안전한 시공과 철저한 현장 관리를 최우선으로 합니다.",
    },
    {
      icon: "process",
      title: "체계적인 절차",
      description: "현장 조건 확인부터 일정 협의까지 순서대로 안내합니다.",
    },
    {
      icon: "worker",
      title: "전문 장비·인력 보유",
      description: "현장 성격에 맞는 장비와 전문 인력으로 대응합니다.",
    },
    {
      icon: "care",
      title: "책임 시공·사후 관리",
      description: "공사 후 정리와 후속 안내까지 책임 있게 수행합니다.",
    },
  ] as const,
  siteInquiry: {
    eyebrow: "현장 문의",
    title: "철거가 필요한 현장이 있으신가요?",
    description: "현장 조건과 일정을 확인하여 정확한 견적과 최적의 공사 계획을 안내해드립니다.",
    choicesTitle: "주요 철거 유형",
    choices: [
      { icon: "building", label: "외벽 철거" },
      { icon: "document", label: "대관업무" },
      { icon: "house", label: "원상복구" },
      { icon: "worker", label: "내부 철거" },
      { icon: "building", label: "구조물 철거" },
      { icon: "truck", label: "전문 특수공사" },
    ],
    checklistTitle: "문의 전 준비사항",
    checklist: ["현장 주소 또는 지번", "철거 대상 사진", "건물 층수 및 면적", "희망 공사 일정", "인허가 진행 여부", "전기·가스·수도 차단 여부"],
    phoneTitle: "빠른 전화 상담",
    phoneDescription: "전화로 문의하시면 더 빠른 상담이 가능합니다.",
    submitLabel: "현장 문의 접수하기",
  },
  partnerInquiry: {
    eyebrow: "협력업체 문의",
    title: "함께 현장을 만들어갈 협력사를 기다립니다.",
    description: "공사 연계, 장비, 폐기물, 대관업무 등 다양한 협력 제안을 검토합니다.",
    choicesTitle: "협력 분야",
    choices: [
      { icon: "building", label: "공사 연계 제휴" },
      { icon: "house", label: "부동산·중개 제휴" },
      { icon: "worker", label: "건축·인테리어 제휴" },
      { icon: "truck", label: "장비 협력" },
      { icon: "truck", label: "폐기물 처리 협력" },
      { icon: "handshake", label: "대관·안전 협력" },
    ],
    checklistTitle: "문의 전 준비사항",
    checklist: ["회사명 및 담당자 연락처", "주요 업무 분야", "활동 가능 지역", "보유 장비 또는 인력", "희망 협력 방식", "기존 수행 실적 또는 포트폴리오"],
    submitLabel: "협력 문의 접수하기",
  },
  contactMethods: {
    eyebrow: "CONTACT CHANNEL",
    title: "다양한 방법으로 문의하실 수 있습니다.",
    description: "상황에 맞는 방법으로 편하게 문의해주세요.",
    items: [
      {
        icon: "phone",
        label: "전화 문의",
        value: "공식 번호 준비 중",
        description: "운영 시간 확정 후 안내",
      },
      {
        icon: "kakao",
        label: "카카오톡 문의",
        value: "@함께하는개발",
        description: "실시간 상담 가능",
      },
      {
        icon: "sms",
        label: "문자 문의",
        value: "공식 번호 준비 중",
        description: "문자로 문의 남겨주세요",
      },
    ] as const,
  },
} as const;
