// src/theme/darkTheme.js

import { colors } from "./colors";
import { fonts } from "./fonts";
import { fontSizes } from "./fontSizes";

export const darkTheme = {
  mode: "dark",
  colors: {
    ...colors,
    background: "#121212",
    text: "#f5f5f5",
    cardBackground: "#1e1e1e",
    borderColor: "#333333",
  },
  fonts,
  fontSizes: fontSizes.medium, // default font size scale
};
