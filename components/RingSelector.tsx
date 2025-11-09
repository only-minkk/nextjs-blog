"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/ringSelector.module.css";
import type { CategoryNode, PostMetadata } from "@/lib/posts";
import CategorySidebar from "./CategorySidebar";
import Image from "next/image";

type RingSelectorProps<T = string> = {
  items: T[];
  getLabel?: (item: T, index: number) => string;
  radius?: number; // px, CSS --R와 동기화
  onChange?: (index: number, item: T) => void;
  // title?: string;
  categories?: CategoryNode[];
  selectedCategory?: string;
  onCategorySelect?: (categoryPath: string) => void;
};

export default function RingSelector<T = string>({
  items,
  getLabel,
  radius = 260,
  onChange,
  // title = "좌측 반원 3D 링 선택",
  categories = [],
  selectedCategory,
  onCategorySelect,
}: RingSelectorProps<T>) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const axisRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<HTMLButtonElement[]>([]);
  const counterRef = useRef<HTMLDivElement | null>(null);

  const LABELS = useMemo(() => {
    return items.map((item, idx) => {
      // console.log("item", item);
      if (typeof item === "string") return item;
      return getLabel ? getLabel(item, idx) : String(item);
    });
  }, [items, getLabel]);
  const STEP = 360 / Math.max(1, LABELS.length);

  // 상태들 (ref로 유지)
  const rotationRef = useRef<number>(180); // 왼쪽 중앙 = 180°
  const draggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const selectedIndexRef = useRef<number>(0);
  const lastEmittedIndexRef = useRef<number>(-1);
  const router = useRouter();

  // 유틸
  const wrapDeg = (deg: number) => ((deg % 360) + 360) % 360;
  const shortestAngleDiff = (from: number, to: number) => {
    let diff = (to - from) % 360;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;
    return diff;
  };
  const wrapIndex = (idx: number, len: number) => {
    if (len <= 0) return 0;
    return ((idx % len) + len) % len;
  };

  // 렌더 루프
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    // CSS 변수 동기화
    frame.style.setProperty("--R", `${radius}px`);

    // 초기 회전값을 타겟 각도로 즉시 설정 (펼쳐지는 현상 방지)
    const initialTarget = wrapDeg(180 + selectedIndexRef.current * STEP);
    rotationRef.current = initialTarget;

    const render = () => {
      // 선택 인덱스의 타겟 각도로 부드럽게 보간 이동 (스크롤 애니메이션 복원)
      const target = wrapDeg(180 + selectedIndexRef.current * STEP);
      const current = rotationRef.current;
      const delta = shortestAngleDiff(current, target);
      const EASE = 0.18; // 보간 속도 계수 (0~1)
      const next =
        Math.abs(delta) < 0.05 ? target : wrapDeg(current + delta * EASE);
      rotationRef.current = next;

      const cards = cardRefs.current;
      const rotation = rotationRef.current;

      for (let i = 0; i < cards.length; i++) {
        const el = cards[i];
        // 반시계 방향으로 배치 (각도를 음수로)
        const angle = wrapDeg(-i * STEP + rotation);
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        const dist = Math.abs(shortestAngleDiff(angle, 180));
        // 아래쪽까지 더 보이도록 범위 확대 (STEP * 2.0)
        const w = Math.max(0, 1 - dist / (STEP * 2.0));
        const scale = 0.9 + 0.12 * w;
        const opacity = 0.3 + 0.7 * w; // 최소 opacity를 0.3으로 설정하여 더 멀리까지 보이게
        const zIndex = Math.round(100 + 100 * w);

        // 카드의 중심이 원 위의 점에 오도록 보정 (카드 높이의 절반만큼 위로)
        // const cardHeight = 280; // var(--CardH)와 동기화
        // CSS 변수에서 카드 높이 읽기 (작은 화면: 220px, 큰 화면: 280px)
        const cardHeight = frame
          ? parseInt(
              getComputedStyle(frame).getPropertyValue("--CardH") || "280"
            )
          : 280;
        el.style.transform = `translate(${x}px, ${
          y - cardHeight / 2
        }px) scale(${scale})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.visibility = "visible"; // 렌더 루프에서도 표시
        // zIndex는 문자열이어야 함
        (el.style as CSSStyleDeclaration & { zIndex: string }).zIndex =
          String(zIndex);
        if (w > 0.65) {
          el.classList.add(styles["card--hot"]);
          el.setAttribute("aria-selected", "true");
        } else {
          el.classList.remove(styles["card--hot"]);
          el.setAttribute("aria-selected", "false");
        }
      }

      // 상태 표시 및 콜백 (변경 시에만)
      const idx = selectedIndexRef.current;
      if (lastEmittedIndexRef.current !== idx) {
        // if (selected) selected.textContent = `${LABELS[idx] ?? "(없음)"}`;
        // if (selected) selected.textContent = `선택: ${LABELS[idx] ?? "(없음)"}`;
        if (counterRef.current) {
          counterRef.current.textContent = `${idx + 1} / ${items.length}`;
          // 진행률을 CSS 변수로 설정 (테두리 프로그레스용)
          const progress = items.length > 0 ? (idx + 1) / items.length : 0;
          counterRef.current.style.setProperty(
            "--progress",
            progress.toString()
          );
        }
        if (onChange) onChange(idx, items[idx]);
        lastEmittedIndexRef.current = idx;
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [LABELS, STEP, onChange, radius, items]);

  // 입력 바인딩 (링 컨테이너 내에서만 동작)
  useEffect(() => {
    const ringContainer = axisRef.current?.parentElement;
    if (!ringContainer) return;

    const onWheel = (e: WheelEvent) => {
      // ringContainer 내부에서만 동작
      if (!ringContainer.contains(e.target as Node)) return;
      e.preventDefault();
      const dir = e.deltaY > 0 ? 1 : -1; // 아래로 스크롤 → 다음 항목
      selectedIndexRef.current = wrapIndex(
        selectedIndexRef.current + dir,
        LABELS.length
      );
    };

    const onPointerDown = (e: PointerEvent) => {
      // ringContainer 내부에서만 동작
      if (!ringContainer.contains(e.target as Node)) return;
      draggingRef.current = true;
      startXRef.current = e.clientY; // 세로 드래그 시작점
      try {
        (
          e.target as Element & {
            setPointerCapture?: (pointerId: number) => void;
          }
        ).setPointerCapture?.((e as PointerEvent).pointerId);
      } catch {}
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const dy = e.clientY - startXRef.current;
      const THRESHOLD = 28; // 한 슬롯 이동 임계값(px)
      if (Math.abs(dy) >= THRESHOLD) {
        const steps = Math.floor(Math.abs(dy) / THRESHOLD);
        const dir = dy > 0 ? -1 : 1; // 위로 드래그 → 시계방향 회전(다음 항목), 아래로 드래그 → 반시계방향 회전(이전 항목)
        selectedIndexRef.current = wrapIndex(
          selectedIndexRef.current + dir * steps,
          LABELS.length
        );
        startXRef.current = e.clientY;
      }
    };
    const onPointerUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      // 스냅 불필요: 이미 정수 인덱스로 이동됨
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // 링 컨테이너가 포커스를 받았을 때만 키보드 입력 처리
      if (
        ringContainer.contains(document.activeElement) ||
        frameRef.current?.contains(document.activeElement)
      ) {
        if (e.key === "ArrowLeft")
          selectedIndexRef.current = wrapIndex(
            selectedIndexRef.current - 1,
            LABELS.length
          );
        if (e.key === "ArrowRight")
          selectedIndexRef.current = wrapIndex(
            selectedIndexRef.current + 1,
            LABELS.length
          );
      }
    };

    // ringContainer에만 wheel과 pointerdown 등록
    ringContainer.addEventListener("wheel", onWheel, { passive: false });
    ringContainer.addEventListener("pointerdown", onPointerDown);

    // pointermove와 pointerup은 window에 등록 (드래그가 컨테이너 밖으로 나갈 수 있음)
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // 키보드 입력은 window에 등록 (포커스 확인)
    window.addEventListener("keydown", onKeyDown);

    return () => {
      ringContainer.removeEventListener("wheel", onWheel);
      ringContainer.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [LABELS.length]);

  // 카드 ref 수집 및 즉시 위치 설정
  const setCardRef = (el: HTMLButtonElement | null, idx: number) => {
    if (!el) return;
    cardRefs.current[idx] = el;

    // 즉시 초기 위치 설정 (펼쳐지는 현상 방지)
    const frame = frameRef.current;
    if (frame) {
      const radius = parseInt(
        getComputedStyle(frame).getPropertyValue("--R") || "260"
      );
      const cardHeight = parseInt(
        getComputedStyle(frame).getPropertyValue("--CardH") || "280"
      );
      const STEP = 360 / Math.max(1, LABELS.length);
      const initialRotation = wrapDeg(180 + selectedIndexRef.current * STEP);
      const angle = wrapDeg(-idx * STEP + initialRotation);
      const rad = (angle * Math.PI) / 180;
      const x = Math.cos(rad) * radius;
      const y = Math.sin(rad) * radius;
      const dist = Math.abs(shortestAngleDiff(angle, 180));
      const w = Math.max(0, 1 - dist / (STEP * 2.0));
      const scale = 0.9 + 0.12 * w;
      const opacity = 0.3 + 0.7 * w;

      el.style.transform = `translate(${x}px, ${
        y - cardHeight / 2
      }px) scale(${scale})`;
      el.style.opacity = opacity.toFixed(3);
      el.style.visibility = "visible"; // 위치 설정 후 표시
    }
  };

  return (
    <main className={styles.page}>
      {/* {title ? <h1 className={styles.title}>{title}</h1> : null} */}
      {/* <div ref={selectedRef} className={styles.selected} aria-live="polite">
        선택: (없음)
      </div> */}
      <div className={styles.marker} aria-hidden="true" />
      <section
        ref={frameRef}
        className={styles.frame}
        role="listbox"
        aria-label="3D 원형 카드 선택"
        tabIndex={0}
      >
        {categories.length > 0 && (
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={onCategorySelect || (() => {})}
          />
        )}
        <div
          className={styles.counter}
          ref={counterRef}
          aria-live="polite"
          style={
            {
              "--progress": items.length > 0 ? 1 / items.length : 0,
            } as React.CSSProperties & { "--progress": number }
          }
        >
          {items.length > 0 ? `1 / ${items.length}` : "0 / 0"}
        </div>
        <div className={styles.ringContainer}>
          <div className={styles.axis} ref={axisRef}>
            {items.map((item, idx) => {
              const isPostMetadata = (item: unknown): item is PostMetadata => {
                return (
                  typeof item === "object" &&
                  item !== null &&
                  "title" in item &&
                  "date" in item &&
                  "slug" in item
                );
              };

              const post = isPostMetadata(item) ? item : null;

              return (
                <button
                  key={idx}
                  className={styles.card}
                  role="option"
                  aria-selected="false"
                  ref={(el) => setCardRef(el, idx)}
                  onClick={() => {
                    // 선택된 카드를 클릭한 경우 페이지로 이동
                    if (selectedIndexRef.current === idx && post) {
                      const encodedSlug = encodeURIComponent(post.slug);
                      if (post.category) {
                        const encodedCategory = encodeURIComponent(
                          post.category
                        );
                        router.push(`/${encodedCategory}/${encodedSlug}`);
                      } else {
                        router.push(`/${encodedSlug}`);
                      }
                    } else {
                      // 선택되지 않은 카드를 클릭한 경우 선택 인덱스만 변경
                      selectedIndexRef.current = idx;
                    }
                  }}
                >
                  {post ? (
                    <div className={styles.card__content}>
                      <div className={styles.card__thumbnail}>
                        {post.thumbnail ? (
                          <Image
                            src={post.thumbnail}
                            alt={post.title}
                            fill
                            className={styles.card__thumbnailImage}
                            sizes="(max-width: 300px) 100vw, 300px"
                            onError={(e) => {
                              // 이미지 로드 실패 시 placeholder로 전환
                              const target = e.target as HTMLImageElement;
                              const placeholder =
                                target.parentElement?.querySelector(
                                  `.${styles.card__thumbnailPlaceholder}`
                                ) as HTMLElement;
                              if (placeholder) {
                                target.style.display = "none";
                                placeholder.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className={styles.card__thumbnailPlaceholder}
                          style={{ display: post.thumbnail ? "none" : "flex" }}
                        >
                          <span className={styles.card__thumbnailText}>
                            {post.title.charAt(0)}
                          </span>
                        </div>
                        {/* 작은 화면에서만 썸네일 내부에 날짜 표시 */}
                        <p className={styles.card__dateThumbnail}>
                          {new Date(post.date).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className={styles.card__info}>
                        <h3 className={styles.card__title}>{post.title}</h3>
                        <p className={styles.card__date}>
                          {new Date(post.date).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        {post.desc && (
                          <p className={styles.card__desc}>{post.desc}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className={styles.card__label}>
                      {LABELS[idx] ?? String(item)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
