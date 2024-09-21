import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const colors = {
  aptosBlack: "#121919",
  aptosBlue: "#06F7F7",
  aptosBlueLight: "#3EAZAB",
  aptosBlueMedium: "#02858D",
  aptosBlueDark: "#08555C",
  white: "#FFFFFF",
};

const fontSizes = {
  xs: "12px",
  sm: "14px",
  md: "16px",
  lg: "18px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "30px",
  "4xl": "32px",
  "5xl": "36px",
  "6xl": "64px",
};

const breakpoints = {
  sm: "390px",
  md: "768px",
};

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ colors, fontSizes, breakpoints }, config);

export default theme;
