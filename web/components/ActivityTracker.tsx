"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { userActivityService, getCurrentUserInfo } from "@/api/userActivityService";

function getPageType(path: string): string {
  if (path === "/") return "home";
  if (path.startsWith("/collections")) return "collection";
  if (path.startsWith("/products")) return "product";
  if (path.startsWith("/cart")) return "cart";
  if (path.startsWith("/checkout")) return "checkout";
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/account") || path.startsWith("/orders")) return "account";
  return "general";
}

export function ActivityTracker() {
  const pathname = usePathname();
  const currentSessionIdRef = useRef<string>("");
  const secondsSpentRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Visibility change listener
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Don't track admin internal navigation inside user activities to avoid noise, unless desired
    const isPublicStorePage = !pathname?.startsWith("/admin");

    const sessionId = "act_pg_" + Math.random().toString(36).substring(2, 12);
    currentSessionIdRef.current = sessionId;
    secondsSpentRef.current = 0;

    const pageType = getPageType(pathname || "/");
    const user = getCurrentUserInfo();

    // Log initial page view
    userActivityService.log({
      id: sessionId,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      pageType,
      path: pathname || "/",
      action: "page_view",
      duration: 0,
      metadata: {
        pageTitle: typeof document !== "undefined" ? document.title : "",
        referrer: typeof document !== "undefined" ? document.referrer : "",
      },
    });

    // Active Second Counter
    const interval = setInterval(() => {
      if (isVisibleRef.current) {
        secondsSpentRef.current += 1;

        // Periodic flush (every 5 seconds) to keep duration synced
        if (secondsSpentRef.current % 5 === 0) {
          userActivityService.log({
            id: currentSessionIdRef.current,
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            pageType,
            path: pathname || "/",
            action: "page_duration",
            duration: secondsSpentRef.current,
            metadata: {
              pageTitle: typeof document !== "undefined" ? document.title : "",
              activeSeconds: secondsSpentRef.current,
            },
          });
        }
      }
    }, 1000);

    // Final flush handler on exit
    const flushFinalTime = () => {
      if (secondsSpentRef.current > 0) {
        userActivityService.log({
          id: currentSessionIdRef.current,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          pageType,
          path: pathname || "/",
          action: "page_duration",
          duration: secondsSpentRef.current,
          metadata: {
            pageTitle: typeof document !== "undefined" ? document.title : "",
            totalSecondsOnPage: secondsSpentRef.current,
          },
        });
      }
    };

    window.addEventListener("beforeunload", flushFinalTime);
    window.addEventListener("pagehide", flushFinalTime);

    return () => {
      clearInterval(interval);
      flushFinalTime();
      window.removeEventListener("beforeunload", flushFinalTime);
      window.removeEventListener("pagehide", flushFinalTime);
    };
  }, [pathname]);

  return null;
}
