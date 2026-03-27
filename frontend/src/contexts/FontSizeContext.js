// src/context/FontSizeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const FontSizeContext = createContext();

export const FontSizeProvider = ({ children }) => {
  const [size, setSize] = useState("medium"); // small, medium, large

  useEffect(() => {
    const savedSize = localStorage.getItem("fontSize") || "medium";
    setSize(savedSize);
    document.documentElement.style.setProperty("--font-body", fontMap[savedSize]);
  }, []);

  const fontMap = {
    small: "0.875rem",
    medium: "1rem",
    large: "1.125rem",
  };

  const changeFontSize = (newSize) => {
    setSize(newSize);
    localStorage.setItem("fontSize", newSize);
    document.documentElement.style.setProperty("--font-body", fontMap[newSize]);
  };

  return <FontSizeContext.Provider value={{ size, changeFontSize }}>{children}</FontSizeContext.Provider>;
};

export const useFontSize = () => useContext(FontSizeContext);
