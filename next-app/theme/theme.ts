import { extendTheme } from "@chakra-ui/react";

const colors = {
    brandAquamarine: "#36f197",
    brandGreen: "#00de73",
    brandDarkGreen: "#05472a",
    brandMidGreen: "#418f56",
    brandForest: "#1a864b",
    brandBlue: "#09b5ff",
    brandDarkBlue: "#156594",
    brandCharcoalGray: "#2B2B2B",
    brandLightGray: "#3A3A3A",
    brandLighterGray: "#A9A9A9",
    brandNavGray: "#C6C6C6",
    brandOffWhite: "#F4F4F4",
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


const theme = extendTheme({ colors, fontSizes, breakpoints });

export default theme;
