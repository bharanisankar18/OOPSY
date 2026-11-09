// "Sticker zine": lemon doodle wall, ink outlines, hard offset shadows, riso-bright accents.
export const colors = {
  paper: '#FFE45C',
  surface: '#FFFFFF',
  ink: '#1B1033',
  inkSoft: '#4B3F6B',
  inkFaint: '#6E6490',
  line: '#E8C92E',
  lavender: '#9B7CFF',
  lavenderDeep: '#5B3FE0',
  lavenderSoft: '#E7DEFF',
  butter: '#FFF6BF',
  butterDeep: '#F3DFA0',
  sun: '#FF8A3D',
  blush: '#FF7FB0',
  blushSoft: '#FFD3E4',
  mint: '#4FE0A0',
  mintSoft: '#C6F6DF',
  white: '#FFFFFF',
};

export const severityColors = {
  small: { bg: colors.mintSoft, fg: '#136B47', dot: colors.mint },
  medium: { bg: '#FFD9B8', fg: '#8A3A00', dot: colors.sun },
  big: { bg: colors.blushSoft, fg: '#A0173F', dot: colors.blush },
};

export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayRegular: 'BricolageGrotesque_500Medium',
  displayItalic: 'Figtree_400Regular_Italic',
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_500Medium',
  bodyBold: 'Figtree_700Bold',
  mono: 'SpaceMono_700Bold',
};

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 38, lineHeight: 42, color: colors.ink, letterSpacing: -1.2 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, color: colors.ink, letterSpacing: -0.9 },
  heading: { fontFamily: fonts.display, fontSize: 21, lineHeight: 26, color: colors.ink, letterSpacing: -0.5 },
  quote: { fontFamily: fonts.display, fontSize: 23, lineHeight: 28, color: colors.ink, letterSpacing: -0.5 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.ink },
  bodySoft: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.inkSoft },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18, color: colors.inkSoft },
  small: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16, color: colors.inkFaint },
  button: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 20 },
  number: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, color: colors.ink, letterSpacing: -1.5 },
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const BORDER = 2.5;

// Hard, un-blurred shadows read as a sticker sitting on the page.
export const shadow = {
  soft: {
    shadowColor: colors.ink,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
    elevation: 0,
  },
  lifted: {
    shadowColor: colors.ink,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 5, height: 5 },
    elevation: 0,
  },
};
