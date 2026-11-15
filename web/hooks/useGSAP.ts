import { useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger globally
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const useGSAPReveal = (
  scope: React.RefObject<HTMLElement | null>,
  selector: string,
  vars: gsap.TweenVars = { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' },
  scrollTriggerOptions: Partial<ScrollTrigger.Vars> = {}
) => {
  useEffect(() => {
    if (!scope.current) return;
    const elements = scope.current.querySelectorAll(selector);
    if (!elements || elements.length === 0) return;

    // Immediately ensure all elements are visible (prevents blank screen)
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.opacity = "1";
      htmlEl.style.transform = "none";
    });

    try {
      gsap.fromTo(
        elements,
        { opacity: 0.85, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.03, ease: 'power2.out' }
      );
    } catch (e) {
      // Fallback: elements are already styled to opacity 1
    }
  }, [scope, selector]);
};

export const useGSAPParallax = (
  scope: React.RefObject<HTMLElement | null>,
  selector: string,
  yPercent: number = 20,
  scrollTriggerOptions: Partial<ScrollTrigger.Vars> = {}
) => {
  const optionsString = JSON.stringify(scrollTriggerOptions);

  useLayoutEffect(() => {
    if (!scope.current || !ScrollTrigger) return;

    const ctx = gsap.context(() => {
      // Ensure the selector exists within the scope
      const elements = scope.current?.querySelectorAll(selector);
      if (!elements || elements.length === 0) return;

      gsap.to(selector, {
        yPercent: yPercent,
        ease: 'none',
        scrollTrigger: {
          trigger: selector,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          ...scrollTriggerOptions,
        },
      });
    }, scope.current);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, selector, yPercent, optionsString]);
};

export const useGSAPScrollProgress = (
  progressBarSelector: string
) => {
  useLayoutEffect(() => {
    if (!ScrollTrigger) return;

    const ctx = gsap.context(() => {
      gsap.to(progressBarSelector, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
        },
      });
    });

    return () => ctx.revert();
  }, [progressBarSelector]);
};

export { ScrollTrigger };
export default gsap;
