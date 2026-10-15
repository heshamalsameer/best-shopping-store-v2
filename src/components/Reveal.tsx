"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

const Reveal = ({ children, className = "", index = 0 }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return setShown(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${shown ? "in" : ""} ${className}`} style={{ ["--i" as string]: index }}>
      {children}
    </div>
  );
};

export default Reveal;
