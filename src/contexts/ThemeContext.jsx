import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("app-theme");
    if (savedTheme && savedTheme !== "system") {
      return savedTheme;
    }

    // Default to system theme
    return "system";
  });

  // Get the actual theme to apply (resolve system theme)
  const getActualTheme = (themeValue) => {
    if (themeValue === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return themeValue;
  };

  // Apply theme to document body
  useEffect(() => {
    const actualTheme = getActualTheme(theme);

    // Remove existing theme classes
    document.body.classList.remove("light-theme", "dark-theme");

    // Add current theme class
    document.body.classList.add(`${actualTheme}-theme`);

    // Save theme to localStorage
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = () => {
      // Only update if system theme is selected
      if (theme === "system") {
        const actualTheme = getActualTheme("system");
        document.body.classList.remove("light-theme", "dark-theme");
        document.body.classList.add(`${actualTheme}-theme`);
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const getCurrentTheme = () => {
    return getActualTheme(theme);
  };

  const value = {
    theme,
    actualTheme: getActualTheme(theme),
    changeTheme,
    getCurrentTheme,
    isLight: getActualTheme(theme) === "light",
    isDark: getActualTheme(theme) === "dark",
    isSystem: theme === "system",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
