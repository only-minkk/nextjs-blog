"use client";

import { useState, useEffect } from "react";
import type { Theme } from "@/components/(header)/theme";
import styles from "@/styles/header.module.css";

export default function ThemeToggle() {
  // localStorage에서 초기값 읽기
  const getInitialTheme = (): Theme => {
    if (typeof window === "undefined") {
      return "system";
    }
    // console.log("222");
    const savedTheme = localStorage.getItem("onlyMinkk-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme as Theme;
    }

    return "system";
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initializeMounted = () => {
      setMounted(true);
    };
    initializeMounted();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    let effectiveTheme: "light" | "dark";
    if (theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      effectiveTheme = prefersDark ? "dark" : "light";
      // 시스템 모드는 localStorage에서 삭제
      localStorage.removeItem("onlyMinkk-theme");
    } else {
      effectiveTheme = theme;
      // dark/light 모드는 localStorage에 저장
      localStorage.setItem("onlyMinkk-theme", theme);
    }

    root.classList.toggle("dark", effectiveTheme === "dark");
    root.style.colorScheme = effectiveTheme;
  }, [theme, mounted]);

  // system 모드: OS 테마 변경 감지
  useEffect(() => {
    if (!mounted || theme !== "system") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const onChange = () => {
      const root = document.documentElement;
      const prefersDark = mql.matches;

      root.classList.toggle("dark", prefersDark);
      root.style.colorScheme = prefersDark ? "dark" : "light";
    };

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [theme, mounted]);

  const handleToggle = () => {
    setThemeState((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  };

  if (!mounted) {
    return null;
    // return (
    //   <button type="button" className={styles.themeToggle}>
    //     🌓
    //   </button>
    // );
  }

  const getIcon = () => {
    if (theme === "light") return "☀️";
    if (theme === "dark") return "🌙";
    return "🌓";
  };

  return (
    <button type="button" onClick={handleToggle} className={styles.themeToggle}>
      {getIcon()}
    </button>
  );
}
