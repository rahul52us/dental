import { action, makeObservable, observable } from "mobx";
import _ from "lodash";

// Constant keys for localStorage
const THEME_STORE_KEY = process.env.NEXT_PUBLIC_THEME_STORE || "theme_config";
const MODULE_COLORS_KEY = "module_sidebar_colors";
const GLOBAL_COLORS_KEY = "global_theme_colors";

// Default application brand colors (Hygienic Teal / Dental Primary)
export const SYSTEM_DEFAULT_THEME = {
  light: "#0D9488",
  dark: "#134E4A",
};

export interface ModuleColor {
  light: string;
  dark: string;
}

class ThemeStore {
  profileModal = {
    isOpen: false,
    defaultTab: 0,
  };

  backthemeConfig = {
    fonts: {
      size: {
        xs: "0.8rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "1.8rem",
        xl: "2rem",
        "2xl": "2.5rem",
        "3xl": "3rem",
        "4xl": "3.5rem",
      },
    },
    colors: {
      brand: {
        50: "#f7fafc",
        100: "#edf2f7",
        200: "#e2e8f0",
        300: "#cbd5e0",
        400: "#a0aec0",
        500: "#718096",
        600: "#4a5568",
        700: "#2d3748",
        800: "#1a202c",
        900: "#171923",
      },
      light: {
        primary: {
          50: "#FFEBEE",
          100: "#FFCDD2",
          200: "#EF9A9A",
          300: "#E57373",
          400: "#EF5350",
          500: "#F44336",
          600: "#E53935",
          700: "#D32F2F",
          800: "#C62828",
          900: "#B71C1C",
        },
        secondary: "#ffffff",
      },
      dark: {
        primary: {
          50: "#FFEBEE",
          100: "#FFCDD2",
          200: "#EF9A9A",
          300: "#E57373",
          400: "#EF5350",
          500: "#F44336",
          600: "#E53935",
          700: "#D32F2F",
          800: "#C62828",
          900: "#B71C1C",
        },
        secondary: "#000000",
      },
      custom: {
        light: {
          primary: SYSTEM_DEFAULT_THEME.light,
          secondary: "#ffffff",
        },
        dark: {
          primary: SYSTEM_DEFAULT_THEME.dark,
          secondary: "#000000",
        },
      },
    },
    config: {
      initialColorMode: "light",
      useSystemColorMode: false,
    },
    sidebarColors: {} as Record<string, ModuleColor>,
  };

  themeConfig = { ...this.backthemeConfig };

  // Base global theme colors (fallback when a module has no assigned theme)
  globalBaseColors: ModuleColor = {
    light: SYSTEM_DEFAULT_THEME.light,
    dark: SYSTEM_DEFAULT_THEME.dark,
  };

  // Dedicated module theme map: moduleName -> { light, dark }
  moduleColors: Record<string, ModuleColor> = {};

  activeModuleName: string | null = null;
  activeParentModuleName: string | null = null;

  constructor() {
    makeObservable(this, {
      themeConfig: observable,
      profileModal: observable,
      globalBaseColors: observable,
      moduleColors: observable,
      activeModuleName: observable,
      activeParentModuleName: observable,
      setProfileModal: action,
      setThemeConfig: action,
      resetTheme: action,
      setModuleColor: action,
      resetModuleColor: action,
      applyActiveModuleTheme: action,
      applyCssVariables: action,
      syncBackendColors: action,
    });

    if (typeof window !== "undefined") {
      this._loadFromStorage();
    }
  }

  private _loadFromStorage = () => {
    try {
      // 1. Load global custom theme if saved
      const savedGlobal = localStorage.getItem(GLOBAL_COLORS_KEY);
      if (savedGlobal) {
        const parsed = JSON.parse(savedGlobal);
        if (parsed?.light && parsed?.dark) {
          this.globalBaseColors = { light: parsed.light, dark: parsed.dark };
        }
      }

      // 2. Load module theme assignments
      const savedModules = localStorage.getItem(MODULE_COLORS_KEY);
      if (savedModules) {
        try {
          this.moduleColors = JSON.parse(savedModules) || {};
        } catch {
          this.moduleColors = {};
        }
      } else {
        // Fallback: check if legacy themeConfig in localStorage had sidebarColors
        const legacyConfig = localStorage.getItem(THEME_STORE_KEY);
        if (legacyConfig) {
          try {
            const parsed = JSON.parse(legacyConfig);
            if (parsed?.sidebarColors && typeof parsed.sidebarColors === "object") {
              this.moduleColors = { ...parsed.sidebarColors };
            }
          } catch {}
        }
      }

      // 3. Keep sidebarColors in themeConfig in sync
      this.themeConfig.sidebarColors = { ...this.moduleColors };
      this.themeConfig.colors.custom.light.primary = this.globalBaseColors.light;
      this.themeConfig.colors.custom.dark.primary = this.globalBaseColors.dark;

      // 4. Initial CSS variables injection
      this.applyCssVariables(this.globalBaseColors.light, this.globalBaseColors.dark);
    } catch {
      this.moduleColors = {};
      this.globalBaseColors = { ...SYSTEM_DEFAULT_THEME };
    }
  };

  private _persistModuleColors = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODULE_COLORS_KEY, JSON.stringify(this.moduleColors));
      this.themeConfig.sidebarColors = { ...this.moduleColors };
      localStorage.setItem(THEME_STORE_KEY, JSON.stringify(this.themeConfig));
    }
  };

  private _persistGlobalColors = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(GLOBAL_COLORS_KEY, JSON.stringify(this.globalBaseColors));
    }
  };

  /**
   * Injects CSS variables onto document.documentElement so Chakra UI
   * and all CSS styled elements update instantly without reload.
   */
  applyCssVariables = (light: string, dark: string) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    root.style.setProperty("--chakra-colors-custom-light-primary", light);
    root.style.setProperty("--chakra-colors-custom-dark-primary", dark);
    root.style.setProperty("--primary-color", light);
    root.style.setProperty("--theme-color", light);
    root.style.setProperty("--theme-color-dark", dark);

    // Dynamic brand palette overrides
    root.style.setProperty("--chakra-colors-brand-50", `${light}14`);
    root.style.setProperty("--chakra-colors-brand-100", `${light}26`);
    root.style.setProperty("--chakra-colors-brand-200", `${light}40`);
    root.style.setProperty("--chakra-colors-brand-300", `${light}66`);
    root.style.setProperty("--chakra-colors-brand-400", `${light}99`);
    root.style.setProperty("--chakra-colors-brand-500", light);
    root.style.setProperty("--chakra-colors-brand-600", dark);
    root.style.setProperty("--chakra-colors-brand-700", dark);
    root.style.setProperty("--chakra-colors-brand-800", dark);
    root.style.setProperty("--chakra-colors-brand-900", dark);

    // Dynamic gradient and effect tokens
    root.style.setProperty(
      "--theme-gradient",
      `linear-gradient(135deg, #091E42 0%, ${dark} 50%, ${light} 100%)`
    );
    root.style.setProperty(
      "--theme-gradient-primary",
      `linear-gradient(135deg, ${dark} 0%, ${light} 100%)`
    );
    root.style.setProperty("--theme-soft-bg", `${light}18`);
    root.style.setProperty("--theme-border", `${light}40`);
    root.style.setProperty("--theme-shadow", `${light}40`);
  };

  /**
   * Resolves the custom color for a module:
   * 1. Check module's own assignment
   * 2. Check parent module's assignment (inheritance)
   * 3. If neither has an assignment, returns null (meaning use Default Theme)
   */
  getModuleColor = (
    moduleName?: string | null,
    parentModuleName?: string | null
  ): ModuleColor | null => {
    if (!moduleName) return null;
    if (this.moduleColors[moduleName]) {
      return this.moduleColors[moduleName];
    }
    if (parentModuleName && this.moduleColors[parentModuleName]) {
      return this.moduleColors[parentModuleName];
    }
    return null;
  };

  /**
   * Applies the theme for the active module.
   * If the module has an assigned theme, applies it.
   * If the module has NO theme assigned, applies the global default theme.
   * NEVER leaves a module stuck on a previously assigned color.
   */
  applyActiveModuleTheme = (
    moduleName?: string | null,
    parentModuleName?: string | null
  ) => {
    this.activeModuleName = moduleName || null;
    this.activeParentModuleName = parentModuleName || null;

    const moduleColor = this.getModuleColor(moduleName, parentModuleName);

    // When no theme is assigned, use the default theme!
    const targetLight = moduleColor ? moduleColor.light : this.globalBaseColors.light;
    const targetDark = moduleColor ? moduleColor.dark : this.globalBaseColors.dark;

    // Mutate and produce a fresh object reference so MobX observers react instantly
    this.themeConfig = {
      ...this.themeConfig,
      sidebarColors: { ...this.moduleColors },
      colors: {
        ...this.themeConfig.colors,
        custom: {
          light: { primary: targetLight, secondary: "#ffffff" },
          dark: { primary: targetDark, secondary: "#000000" },
        },
      },
    };

    this.applyCssVariables(targetLight, targetDark);
  };

  /**
   * Sets a theme color for a specific module.
   * Immediately saves, persists, and updates the live theme if this module is active or configured.
   */
  setModuleColor = (
    name: string,
    newColor: ModuleColor
  ) => {
    this.moduleColors = {
      ...this.moduleColors,
      [name]: newColor,
    };

    this._persistModuleColors();

    // If currently on this module, or if currently previewing/configuring,
    // apply the new color immediately to live UI
    const isCurrentActive =
      this.activeModuleName === name ||
      this.activeParentModuleName === name ||
      !this.activeModuleName;

    if (isCurrentActive) {
      this.applyActiveModuleTheme(name, this.activeParentModuleName);
    } else {
      // Re-trigger MobX update so swatches and labels in settings update immediately
      this.themeConfig = {
        ...this.themeConfig,
        sidebarColors: { ...this.moduleColors },
      };
    }
  };

  /**
   * Resets a module's theme back to default.
   * Deletes its assignment and immediately reapplies the default theme.
   */
  resetModuleColor = (name: string) => {
    const updated = { ...this.moduleColors };
    delete updated[name];
    this.moduleColors = updated;

    this._persistModuleColors();

    // Reapply theme immediately so it reverts back to default without page refresh
    const isCurrentActive =
      this.activeModuleName === name ||
      this.activeParentModuleName === name ||
      !this.activeModuleName;

    if (isCurrentActive) {
      this.applyActiveModuleTheme(this.activeModuleName, this.activeParentModuleName);
    } else {
      this.themeConfig = {
        ...this.themeConfig,
        sidebarColors: { ...this.moduleColors },
      };
    }
  };

  /**
   * Synchronizes backend companyColors on startup without overriding local user changes.
   */
  syncBackendColors = (companyColors: Record<string, ModuleColor>) => {
    if (!companyColors || Object.keys(companyColors).length === 0) return;

    // Only set keys that don't already exist in local store
    let hasChanges = false;
    const merged = { ...this.moduleColors };

    for (const [key, val] of Object.entries(companyColors)) {
      if (!merged[key] && val?.light && val?.dark) {
        merged[key] = val;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.moduleColors = merged;
      this._persistModuleColors();
      this.applyActiveModuleTheme(this.activeModuleName, this.activeParentModuleName);
    }
  };

  setThemeConfig = (key: string, value: any) => {
    _.set(this.themeConfig, key, value);

    if (key === "colors.custom.light.primary") {
      this.globalBaseColors = { ...this.globalBaseColors, light: value };
      this._persistGlobalColors();
    }
    if (key === "colors.custom.dark.primary") {
      this.globalBaseColors = { ...this.globalBaseColors, dark: value };
      this._persistGlobalColors();
    }
    if (key === "sidebarColors" && typeof value === "object") {
      this.moduleColors = { ...value };
      this._persistModuleColors();
    }

    this.themeConfig = {
      ...this.themeConfig,
      sidebarColors: { ...this.moduleColors },
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORE_KEY, JSON.stringify(this.themeConfig));
    }

    this.applyActiveModuleTheme(this.activeModuleName, this.activeParentModuleName);
  };

  setProfileModal = (isOpen: boolean, defaultTab: number = 0) => {
    this.profileModal.isOpen = isOpen;
    this.profileModal.defaultTab = defaultTab;
  };

  resetTheme = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(THEME_STORE_KEY);
      localStorage.removeItem(MODULE_COLORS_KEY);
      localStorage.removeItem(GLOBAL_COLORS_KEY);
    }
    this.globalBaseColors = { ...SYSTEM_DEFAULT_THEME };
    this.moduleColors = {};
    this.activeModuleName = null;
    this.activeParentModuleName = null;
    this.themeConfig = {
      ...this.backthemeConfig,
      sidebarColors: {},
      colors: {
        ...this.backthemeConfig.colors,
        custom: {
          light: { primary: SYSTEM_DEFAULT_THEME.light, secondary: "#ffffff" },
          dark: { primary: SYSTEM_DEFAULT_THEME.dark, secondary: "#000000" },
        },
      },
    };
    this.applyCssVariables(SYSTEM_DEFAULT_THEME.light, SYSTEM_DEFAULT_THEME.dark);
  };
}

export const themeStore = new ThemeStore();
