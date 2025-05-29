"use client";
import { createContext, useRef } from "react";

export const SectionContext = createContext({
  section1: { current: null },
  section2: { current: null },
  section3: { current: null },
});

export const SectionProvider = ({ children }) => {
  const section1 = useRef(null);
  const section2 = useRef(null);
  const section3 = useRef(null);

  return (
    <SectionContext.Provider
      value={{
        section1,
        section2,
        section3,
      }}
    >
      {children}
    </SectionContext.Provider>
  );
};