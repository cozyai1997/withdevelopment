# Home Workflow Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈 하단의 `문의부터 정리까지의 흐름` 워크플로우 도식 섹션을 더 고급스럽고 균형 있는 프리미엄 프로세스 레이아웃으로 개선한다.

**Architecture:** 현재 섹션은 `src/components/home-sections.tsx`의 `WorkflowSteps`가 마크업을 만들고, `src/app/globals.css`의 `.workflow-showcase`, `.workflow-steps` 계열 CSS가 시각 구성을 담당한다. 이번 개선은 데이터/마크업은 최소 수정하고, 중심 허브/연결선/카드/안전 바의 기준선을 CSS 변수로 통일해 1920, 1440, 768, 360px에서 흔들리지 않게 만든다.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS Modules-free global CSS, lucide-react icons.

## Global Constraints

- 색상은 기존 사이트 팔레트 `#101820`, `#F7F4EE`, `#D6A21A`, `#FFFFFF` 또는 기존 CSS 변수만 사용한다.
- 새 이미지, 새 DB, 새 dependency는 추가하지 않는다.
- 홈 워크플로우 섹션만 수정하고 `/contact` 단일 문의 폼 구조는 건드리지 않는다.
- 카드/선/도형은 `box-shadow` 없이 opacity, gradient layer, spacing으로 깊이를 만든다.
- 모바일에서는 도식형 가로 연결선을 고집하지 않고 세로 단계 카드로 전환한다.

---

## Reference Findings

- Material Design Cards overview: 카드에는 하나의 명확한 목적과 스캔 가능한 계층이 필요하다. 적용 방향은 각 단계 카드의 아이콘, 제목, 설명, 하단 포인트를 같은 기준선으로 정렬하는 것이다.
- Carbon Design System Spacing: 반복 컴포넌트는 spacing token처럼 일관된 간격 체계를 가져야 한다. 적용 방향은 `--workflow-card-gap`, `--workflow-card-width`, `--workflow-branch-gap`을 재정의해 카드와 연결선의 간격을 같은 수학식으로 묶는 것이다.
- GitHub connector 확인: `cozyai1997/withdevelopment` 기본 브랜치에는 예전 워크플로우 CSS가 남아 있고, 로컬 작업본은 `codex/cases-board-slider` 브랜치에서 여러 파일이 수정된 상태다. 실행 전에는 로컬 변경을 보존하고, 원격 초기 커밋 기준으로 덮어쓰지 않는다.

## File Structure

- Modify: `src/components/home-sections.tsx`
  - `WorkflowSteps` 마크업의 접근성 레이블과 카드 내부 구조를 정리한다.
  - 필요한 경우 `workflow-showcase__connector` 같은 보조 레이어를 추가한다.
- Modify: `src/app/globals.css`
  - `.workflow-section`, `.workflow-showcase`, `.workflow-showcase__hub`, `.workflow-steps`, `.workflow-steps li`, `.workflow-showcase__safety` 스타일을 재작성한다.
  - 기존 다른 섹션의 `.workflow-steps` 초기 정의와 충돌하지 않도록 홈 전용 선택자 범위를 유지한다.
- No new file: 이번 작업은 구조 안정화와 CSS 품질 개선이 목적이라 새 컴포넌트 파일을 만들지 않는다.

---

### Task 1: Baseline Audit And Selector Scope

**Files:**
- Inspect: `src/components/home-sections.tsx`
- Inspect: `src/app/globals.css`

**Interfaces:**
- Consumes: Existing `WorkflowSteps()` component.
- Produces: Confirmed selector map for Tasks 2-4.

- [ ] **Step 1: Locate the exact rendered workflow section**

Run:

```powershell
rg -n "workflow-showcase|workflow-steps|문의의 시작|문의 접수" src\components src\app\globals.css
```

Expected: matches in `src/components/home-sections.tsx` and `src/app/globals.css`.

- [ ] **Step 2: Confirm current branch and dirty state**

Run:

```powershell
git status --short --branch
```

Expected: current branch is visible and unrelated dirty files are not reverted.

- [ ] **Step 3: Capture target CSS block boundaries**

Run:

```powershell
rg -n "\.workflow-section|\.workflow-showcase|\.workflow-steps|\.workflow-showcase__safety" src\app\globals.css
```

Expected: line numbers for all workflow selectors.

- [ ] **Step 4: Do not edit in this task**

Expected: no file changes yet. This task only confirms the target and avoids accidental edits to `/contact`.

---

### Task 2: Markup Cleanup For A Premium Workflow Diagram

**Files:**
- Modify: `src/components/home-sections.tsx`

**Interfaces:**
- Consumes: Existing `steps` array inside `WorkflowSteps()`.
- Produces: Stable markup hooks:
  - `.workflow-showcase__connector`
  - `.workflow-showcase__hub-copy`
  - `.workflow-steps__content`

- [ ] **Step 1: Add a connector layer after the hub**

Update `WorkflowSteps()` from:

```tsx
      <div className="workflow-showcase__hub">
        <MessageCircle className="workflow-showcase__hub-icon" aria-hidden="true" />
        <strong>문의 접수</strong>
        <p>문의가 접수되면 전담 담당자가 배정됩니다.</p>
      </div>

      <ol className="workflow-steps">
```

to:

```tsx
      <div className="workflow-showcase__hub">
        <MessageCircle className="workflow-showcase__hub-icon" aria-hidden="true" />
        <div className="workflow-showcase__hub-copy">
          <strong>문의 접수</strong>
          <p>문의가 접수되면 전담 담당자가 배정됩니다.</p>
        </div>
      </div>

      <div className="workflow-showcase__connector" aria-hidden="true" />

      <ol className="workflow-steps">
```

- [ ] **Step 2: Wrap card title and copy**

Update each list item from:

```tsx
            <strong>{step.title}</strong>
            <p>{step.description}</p>
```

to:

```tsx
            <div className="workflow-steps__content">
              <strong>{step.title}</strong>
              <p>{step.description}</p>
            </div>
```

- [ ] **Step 3: Keep arrow markup but hide visually on desktop if needed**

Do not delete:

```tsx
              <span className="workflow-steps__arrow" aria-hidden="true">
                <ChevronRight />
              </span>
```

This gives mobile a future hook and avoids changing component logic.

- [ ] **Step 4: Run TypeScript**

Run:

```powershell
npm.cmd run typecheck
```

Expected: PASS.

---

### Task 3: Redesign Desktop Workflow Geometry

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Markup hooks from Task 2.
- Produces: desktop layout where the center hub, connector line, five cards, and safety note share a centered 5-column frame.

- [ ] **Step 1: Replace `.workflow-showcase` geometry variables**

Find `.workflow-showcase` and set:

```css
.workflow-showcase {
  --workflow-tag-height: clamp(44px, 3.2vw, 52px);
  --workflow-hub-size: clamp(140px, 10.5vw, 168px);
  --workflow-card-width: clamp(152px, 12vw, 178px);
  --workflow-card-gap: clamp(18px, 2.15vw, 32px);
  --workflow-branch-gap: clamp(46px, 4vw, 62px);
  --workflow-card-track: calc((var(--workflow-card-width) * 5) + (var(--workflow-card-gap) * 4));
  position: relative;
  display: grid;
  justify-items: center;
  width: min(100%, 1280px);
  margin: clamp(46px, 5vw, 72px) auto 0;
  padding-top: 0;
}
```

- [ ] **Step 2: Make the top label smaller and more architectural**

Replace `.workflow-showcase__tag` block with:

```css
.workflow-showcase__tag {
  position: relative;
  z-index: 3;
  width: clamp(154px, 12vw, 186px);
  min-height: var(--workflow-tag-height);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 2px;
  background: var(--color-accent);
  color: var(--color-ink);
  border-radius: 8px;
  text-align: center;
}
```

- [ ] **Step 3: Reduce hub scale and improve hierarchy**

Replace `.workflow-showcase__hub` and hub text rules with:

```css
.workflow-showcase__hub {
  position: relative;
  z-index: 2;
  width: var(--workflow-hub-size);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 10px;
  margin-top: 28px;
  background: var(--color-white);
  color: var(--color-ink);
  border-radius: 50%;
  text-align: center;
}

.workflow-showcase__hub::before {
  content: "";
  position: absolute;
  inset: -10px;
  border-radius: inherit;
  background: radial-gradient(circle, transparent 0 69%, var(--color-accent) 70% 71%, transparent 72% 100%);
}

.workflow-showcase__hub-icon {
  position: relative;
  z-index: 1;
  width: clamp(38px, 3.5vw, 48px);
  height: clamp(38px, 3.5vw, 48px);
  color: var(--color-ink);
}

.workflow-showcase__hub-copy {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 4px;
}

.workflow-showcase__hub strong {
  font-size: clamp(1.1rem, 1.25vw, 1.35rem);
  line-height: 1.2;
  font-weight: 900;
}

.workflow-showcase__hub p {
  margin: 0;
  color: var(--color-ink);
  font-size: clamp(0.72rem, 0.72vw, 0.82rem);
  line-height: 1.45;
  opacity: 0.68;
}
```

- [ ] **Step 4: Add a clean connector layer**

Add this block after hub styles:

```css
.workflow-showcase__connector {
  position: relative;
  width: var(--workflow-card-track);
  height: var(--workflow-branch-gap);
  margin-top: 20px;
}

.workflow-showcase__connector::before,
.workflow-showcase__connector::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  background: var(--color-white);
  opacity: 0.32;
}

.workflow-showcase__connector::before {
  top: 0;
  height: 1px;
}

.workflow-showcase__connector::after {
  top: 0;
  left: 50%;
  right: auto;
  width: 1px;
  height: 100%;
  transform: translateX(-50%);
}
```

- [ ] **Step 5: Run CSS smoke check**

Run:

```powershell
npm.cmd run lint
```

Expected: PASS.

---

### Task 4: Redesign Step Cards And Safety Bar

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `.workflow-steps__content` from Task 2.
- Produces: five uniform cards with centered number badges, smaller icon discs, consistent card height, and quieter safety bar.

- [ ] **Step 1: Rebuild `.workflow-steps` as a strict 5-column rail**

Use:

```css
.workflow-steps {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, var(--workflow-card-width)));
  justify-content: center;
  gap: var(--workflow-card-gap);
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}
```

- [ ] **Step 2: Replace per-card vertical connector**

Use:

```css
.workflow-steps li::after {
  content: "";
  position: absolute;
  top: calc(var(--workflow-branch-gap) * -1 - 20px);
  left: 50%;
  width: 1px;
  height: calc(var(--workflow-branch-gap) + 20px);
  background: var(--color-white);
  opacity: 0.32;
  transform: translateX(-50%);
}
```

- [ ] **Step 3: Reduce and align cards**

Replace `.workflow-steps li` with:

```css
.workflow-steps li {
  position: relative;
  min-height: clamp(244px, 21vw, 284px);
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 16px;
  padding: 42px 18px 24px;
  overflow: hidden;
  background: var(--color-ink);
  border-radius: 16px;
  color: var(--color-white);
  text-align: center;
}

.workflow-steps li::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(var(--color-white), var(--color-white)) top / 100% 1px no-repeat,
    linear-gradient(var(--color-white), var(--color-white)) right / 1px 100% no-repeat,
    linear-gradient(var(--color-white), var(--color-white)) bottom / 100% 1px no-repeat,
    linear-gradient(var(--color-white), var(--color-white)) left / 1px 100% no-repeat;
  opacity: 0.18;
}
```

- [ ] **Step 4: Standardize number badge and icon disc**

Use:

```css
.workflow-steps li .workflow-steps__number {
  position: absolute;
  top: -24px;
  left: 50%;
  z-index: 3;
  width: 48px;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  transform: translateX(-50%);
  background: var(--color-accent);
  color: var(--color-ink);
  border-radius: 50%;
  font-size: 1.2rem;
  font-weight: 900;
}

.workflow-steps__icon-wrap {
  width: clamp(74px, 6.4vw, 88px);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  background: var(--color-white);
  border-radius: 50%;
}

.workflow-steps__icon-wrap::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--color-ink);
  opacity: 0.76;
}
```

- [ ] **Step 5: Align card content and bottom accent**

Use:

```css
.workflow-steps__content {
  display: grid;
  justify-items: center;
  gap: 12px;
}

.workflow-steps strong {
  min-height: 2.6em;
  display: grid;
  place-items: center;
  font-size: clamp(1.05rem, 1.1vw, 1.24rem);
  line-height: 1.28;
  font-weight: 900;
  word-break: keep-all;
}

.workflow-steps p {
  min-height: 3.2em;
  margin: 0;
  color: var(--color-paper);
  font-size: clamp(0.88rem, 0.9vw, 1rem);
  line-height: 1.55;
  white-space: pre-line;
}

.workflow-steps p::after {
  content: "";
  display: block;
  width: 74px;
  height: 3px;
  margin: 18px auto 0;
  background: var(--color-accent);
  border-radius: 999px;
}
```

- [ ] **Step 6: Make safety bar quieter and centered**

Use:

```css
.workflow-showcase__safety {
  width: min(100%, 860px);
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: clamp(34px, 4vw, 48px) auto 0;
  padding: 0 30px;
  background: var(--color-ink);
  color: var(--color-white);
  border-radius: 999px;
}

.workflow-showcase__safety::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(var(--color-white), var(--color-white)) top / 100% 1px no-repeat,
    linear-gradient(var(--color-white), var(--color-white)) right / 1px 100% no-repeat,
    linear-gradient(var(--color-white), var(--color-white)) bottom / 100% 1px no-repeat,
    linear-gradient(var(--color-white), var(--color-white)) left / 1px 100% no-repeat;
  opacity: 0.14;
}
```

- [ ] **Step 7: Run build**

Run:

```powershell
npm.cmd run build
```

Expected: PASS.

---

### Task 5: Responsive QA And Final Polish

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: desktop styles from Tasks 3-4.
- Produces: stable 360px, 768px, and 1440px layout.

- [ ] **Step 1: Replace mobile workflow rules under `@media (max-width: 820px)`**

Use:

```css
@media (max-width: 820px) {
  .workflow-showcase {
    --workflow-hub-size: clamp(148px, 46vw, 190px);
    width: min(100%, 520px);
    margin-top: 34px;
  }

  .workflow-showcase__connector,
  .workflow-steps li::after {
    display: none;
  }

  .workflow-steps {
    grid-template-columns: 1fr;
    gap: 18px;
    width: 100%;
    margin-top: 28px;
  }

  .workflow-steps li {
    min-height: 0;
    grid-template-columns: auto minmax(0, 1fr);
    justify-items: start;
    align-items: center;
    gap: 18px;
    padding: 26px 22px;
    text-align: left;
  }

  .workflow-steps li .workflow-steps__number {
    top: 18px;
    left: auto;
    right: 18px;
    width: 40px;
    transform: none;
    font-size: 1rem;
  }

  .workflow-steps__content {
    justify-items: start;
  }

  .workflow-steps strong,
  .workflow-steps p {
    min-height: 0;
  }

  .workflow-steps p::after {
    margin-left: 0;
  }
}
```

- [ ] **Step 2: Check local route**

Run:

```powershell
Invoke-WebRequest -Uri http://127.0.0.1:3000/ -UseBasicParsing -TimeoutSec 10
```

Expected: `StatusCode 200`.

- [ ] **Step 3: Manual browser QA**

Open:

```powershell
Start-Process "http://localhost:3000/"
```

Verify:
- The workflow hub is smaller and centered.
- Connector line no longer looks like a plain engineering bracket.
- All five cards have matching height, icon baseline, title baseline, and bottom yellow line.
- Safety bar is centered and visually secondary.
- Mobile shows stacked cards without horizontal overflow.

- [ ] **Step 4: Commit only workflow files when approved**

If user approves implementation:

```powershell
git add src\components\home-sections.tsx src\app\globals.css docs\superpowers\plans\2026-07-09-home-workflow-polish.md
git commit -m "Polish home workflow section layout"
```

Expected: commit succeeds and unrelated dirty files remain unstaged.

---

## Self-Review

- Spec coverage: The plan targets the screenshot section, which maps to `WorkflowSteps` and `.workflow-showcase` on the home page. It covers image-adjacent spacing, paragraph rhythm, gap/spacing, shape alignment, connector lines, card heights, and responsive behavior.
- Placeholder scan: No `TBD`, `TODO`, or vague implementation steps are used. All CSS and command steps include concrete content.
- Type consistency: The only new class names introduced are `.workflow-showcase__connector`, `.workflow-showcase__hub-copy`, and `.workflow-steps__content`; all are defined in Task 2 before CSS tasks consume them.
