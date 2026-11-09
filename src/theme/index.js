export const colors = {
  paper: '#F6F5FA',
  surface: '#FFFFFF',
  ink: '#2B2741',
  inkSoft: '#6B6683',
  inkFaint: '#A19DB5',
  line: '#E7E4F0',
  lavender: '#B7ABF7',
  lavenderDeep: '#8C7EE8',
  lavenderSoft: '#ECE8FF',
  butter: '#FFF4D2',
  butterDeep: '#F3DFA0',
  sun: '#F8CB46',
  blush: '#F59AA3',
  blushSoft: '#FDE6E8',
  mint: '#A8DEC4',
  mintSoft: '#E3F5EC',
  white: '#FFFFFF',
};

export const severityColors = {
  small: { bg: colors.mintSoft, fg: '#2F7A5A', dot: colors.mint },
  medium: { bg: colors.butter, fg: '#8A6A12', dot: colors.sun },
  big: { bg: colors.blushSoft, fg: '#A2404B', dot: colors.blush },
};

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayRegular: 'Fraunces_400Regular',
  displayItalic: 'Fraunces_400Regular_Italic',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
};

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40, color: colors.ink, letterSpacing: -0.6 },
  title: { fontFamily: fonts.display, fontSize: 27, lineHeight: 33, color: colors.ink, letterSpacing: -0.4 },
  heading: { fontFamily: fonts.display, fontSize: 21, lineHeight: 27, color: colors.ink, letterSpacing: -0.2 },
  quote: { fontFamily: fonts.display, fontSize: 23, lineHeight: 31, color: colors.ink, letterSpacing: -0.2 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.ink },
  bodySoft: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.inkSoft },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18, color: colors.inkSoft },
  small: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16, color: colors.inkFaint },
  button: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 20 },
  number: { fontFamily: fonts.display, fontSize: 36, lineHeight: 40, color: colors.ink, letterSpacing: -1 },
};

export const radius = { sm: 12, md: 20, lg: 28, xl: 36, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const shadow = {
  soft: {
    shadowColor: '#5B4FB0',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  lifted: {
    shadowColor: '#5B4FB0',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
};
