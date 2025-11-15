import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#E5F2FF",
      100: "#BBDFFF",
      200: "#8CCBFF",
      300: "#5EB6FF",
      400: "#2FA2FF",
      500: "#1D4E89",
      600: "#163C69",
      700: "#0F2948",
      800: "#071627",
      900: "#020609",
    },
    accent: {
      500: "#F97316",
    },
  },
  fonts: {
    heading: "var(--font-serif)",
    body: "var(--font-sans)",
  },
  styles: {
    global: {
      body: {
        bg: "#f5f7fb",
        color: "#0f172a",
      },
      "*, *::before, *::after": {
        borderColor: "gray.200",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "full",
        fontWeight: "700",
      },
      defaultProps: {
        colorScheme: "brand",
      },
    },
    FormLabel: {
      baseStyle: {
        fontWeight: "600",
      },
    },
  },
});

export default theme;
