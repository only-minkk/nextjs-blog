"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/(header)/themeToggle";
import styles from "@/styles/header.module.css";

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // GitHub 아이콘은 CSS(:global(.dark))로 분기하여 깜빡임 제거

  return (
    <header
      className={`${styles.header} ${
        isVisible ? styles.headerVisible : styles.headerHidden
      }`}
    >
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Only Minkk
        </Link>
        <div className={styles.menu}>
          <ThemeToggle />
          <a
            className={styles.githubLink}
            href="https://github.com/only-minkk"
            target="_blank"
            rel="noreferrer"
          >
            <Image
              className={styles.githubIconLight}
              src="/github-mark.png"
              alt="GitHub"
              width={24}
              height={24}
            />
            <Image
              className={styles.githubIconDark}
              src="/github-mark-white.png"
              alt="GitHub"
              width={24}
              height={24}
            />
          </a>
        </div>
      </div>
    </header>
  );
}
