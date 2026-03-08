import React, { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext({ theme: "dark", isDark: true });

export function ThemeProvider({ children }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-light");
    root.classList.add("theme-dark");
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: "dark",
        isDark: true,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
