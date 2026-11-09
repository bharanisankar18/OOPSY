import React, { useEffect, useId, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop, G } from 'react-native-svg';
import { colors } from '../theme';

const PALETTES = {
  lavender: ['#FFE15A', '#FFB02E'],
  butter: ['#FFB23D', '#FFE2A8'],
  mint: ['#4FE0A0', '#C6F6DF'],
  blush: ['#FF7FB0', '#FFD3E4'],
};

const INK = '#1B1033';

// Five-point star; a fat round-joined stroke turns the sharp points into chubby, friendly ones.
const STAR = (() => {
  const pts = [];
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? 84 : 54;
    const a = (-90 + i * 36) * (Math.PI / 180);
    pts.push(`${(100 + r * Math.cos(a)).toFixed(1)},${(108 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
})();
const EYE_L = { x: 70, y: 100 };
const EYE_R = { x: 130, y: 100 };

function OpenEye({ x, y, small }) {
  return (
    <G>
      <Ellipse cx={x} cy={y} rx={25} ry={29} fill="#FFFFFF" />
      <Ellipse cx={x + 2} cy={y + 3} rx={small ? 13 : 20} ry={small ? 16 : 24} fill={INK} />
      <Circle cx={x - (small ? 3 : 6)} cy={y - (small ? 4 : 8)} r={small ? 4 : 6.5} fill="#FFFFFF" />
      <Circle cx={x + 7} cy={y + 9} r={small ? 2 : 3} fill="#FFFFFF" />
    </G>
  );
}

// A lid is a body-coloured shape laid over the top of an open eye.
function Lid({ x, y, fill, tilt }) {
  const l = y - 8 - tilt;
  const r = y - 8 + tilt;
  return <Path d={`M${x - 30},${l} L${x + 30},${r} L${x + 30},${y - 36} L${x - 30},${y - 36} Z`} fill={fill} />;
}

function ArcEye({ x, y, up = true }) {
  const d = up
    ? `M${x - 16},${y + 4} Q${x},${y - 16} ${x + 16},${y + 4}`
    : `M${x - 16},${y - 2} Q${x},${y + 14} ${x + 16},${y - 2}`;
  return <Path d={d} stroke={INK} strokeWidth={6} strokeLinecap="round" fill="none" />;
}

function Eyes({ face, fill }) {
  switch (face) {
    case 'proud':
      return (
        <>
          <ArcEye {...EYE_L} />
          <ArcEye {...EYE_R} />
        </>
      );
    case 'sleepy':
      return (
        <>
          <ArcEye {...EYE_L} up={false} />
          <ArcEye {...EYE_R} up={false} />
        </>
      );
    case 'wow':
      return (
        <>
          <OpenEye {...EYE_L} small />
          <OpenEye {...EYE_R} small />
        </>
      );
    default: {
      // Positive tilt drops the outer corner (sad); negative drops the inner corner (cross).
      const lids = { sad: 9, upset: -10, meh: 0 }[face];
      return (
        <>
          <OpenEye {...EYE_L} />
          <OpenEye {...EYE_R} />
          {lids !== undefined && (
            <>
              <Lid {...EYE_L} fill={fill} tilt={-lids} />
              <Lid {...EYE_R} fill={fill} tilt={lids} />
            </>
          )}
        </>
      );
    }
  }
}

function Mouth({ face }) {
  const stroke = { stroke: INK, strokeWidth: 5.5, strokeLinecap: 'round', fill: 'none' };
  switch (face) {
    case 'happy':
    case 'proud':
      return (
        <G>
          <Path d="M74,138 C74,131 126,131 126,138 C126,158 113,170 100,170 C87,170 74,158 74,138 Z" fill="#FBFAFF" />
          <Path d="M87,161 C89,152 111,152 113,161 C107,168 93,168 87,161 Z" fill={colors.blush} />
        </G>
      );
    case 'calm':
      return <Path d="M84,142 Q100,158 116,142" {...stroke} />;
    case 'meh':
      return <Path d="M86,150 L114,150" {...stroke} />;
    case 'sad':
      return <Path d="M84,156 Q100,140 116,156" {...stroke} />;
    case 'upset':
      return <Path d="M80,152 Q90,143 100,151 Q110,159 120,150" {...stroke} />;
    case 'oops':
      return (
        <G>
          <Ellipse cx={100} cy={150} rx={10} ry={12} fill={INK} />
          <Ellipse cx={100} cy={156} rx={6} ry={4} fill={colors.blush} />
        </G>
      );
    case 'wow':
      return <Ellipse cx={100} cy={152} rx={13} ry={16} fill={INK} />;
    case 'sleepy':
      return <Ellipse cx={100} cy={150} rx={7} ry={5} fill={INK} />;
    default:
      return <Path d="M84,142 Q100,158 116,142" {...stroke} />;
  }
}

const CHEEKY = new Set(['happy', 'proud', 'calm', 'oops', 'wow']);

/**
 * Oopsy, the mascot. Faces: happy, calm, meh, sad, upset, oops, wow, proud, sleepy.
 */
export default function Blob({ size = 160, face = 'happy', tint = 'lavender', breathe = false, style }) {
  const rawId = useId();
  const gid = `blob${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const [top, bottom] = PALETTES[tint] || PALETTES.lavender;
  const fill = `url(#${gid})`;
  const [scale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!breathe) return undefined;
    let loop;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced || cancelled) return;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.035, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      );
      loop.start();
    });
    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [breathe, scale]);

  return (
    <Animated.View
      style={[{ width: size, height: size * 0.95, transform: [{ scaleY: scale }] }, style]}
      accessibilityRole="image"
      accessibilityLabel={`Oopsy the star looking ${face}`}
    >
      <Svg width="100%" height="100%" viewBox="0 0 200 192">
        <Defs>
          <LinearGradient id={gid} x1="0" y1="8" x2="0" y2="182" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={top} />
            <Stop offset="1" stopColor={bottom} />
          </LinearGradient>
        </Defs>
        <Path d={STAR} fill={INK} stroke={INK} strokeWidth={26} strokeLinejoin="round" />
        <Path d={STAR} fill={fill} stroke={fill} strokeWidth={18} strokeLinejoin="round" />
        {CHEEKY.has(face) && (
          <>
            <Ellipse cx={54} cy={138} rx={12} ry={6.5} fill={colors.blush} opacity={0.55} />
            <Ellipse cx={146} cy={138} rx={12} ry={6.5} fill={colors.blush} opacity={0.55} />
          </>
        )}
        <Eyes face={face} fill={fill} />
        <Mouth face={face} />
      </Svg>
    </Animated.View>
  );
}
