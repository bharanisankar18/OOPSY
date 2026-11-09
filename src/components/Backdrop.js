import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

// Lemon-yellow "doodle wall": a sunburst in the corner, a halftone patch, and
// ink-outlined stickers (stars, a bolt, a heart, squiggles) scattered at the edges.
// Static, sits behind every screen, and stays quiet where content lives.
const INK = '#1B1033';
const STAR = 'M0,-14 L4.2,-4.6 L14,-4.3 L6.4,2 L8.8,11.6 L0,6.2 L-8.8,11.6 L-6.4,2 L-14,-4.3 L-4.2,-4.6 Z';
const SPARK = 'M0,-12 Q0,0 12,0 Q0,0 0,12 Q0,0 -12,0 Q0,0 0,-12 Z';

const sticker = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round' };

// Sunburst rays fanning out from the top-left corner.
const RAYS = Array.from({ length: 9 }, (_, i) => {
  const a0 = (i * 11 + 2) * (Math.PI / 180);
  const a1 = (i * 11 + 7) * (Math.PI / 180);
  const L = 520;
  return `M0,0 L${(L * Math.cos(a0)).toFixed(0)},${(L * Math.sin(a0)).toFixed(0)} L${(L * Math.cos(a1)).toFixed(0)},${(L * Math.sin(a1)).toFixed(0)} Z`;
});

// Halftone patch, dots shrinking away from the bottom-right corner.
const HALFTONE = [];
for (let row = 0; row < 7; row += 1) {
  for (let col = 0; col < 7; col += 1) {
    const d = Math.hypot(col, row);
    const r = Math.max(0, 5.2 - d * 0.62);
    if (r > 0.8) HALFTONE.push([400 - col * 15 - 8, 800 - row * 15 - 8, r]);
  }
}

export default function Backdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
        <Rect x={0} y={0} width={400} height={800} fill="#FFE45C" />

        <G opacity={0.55}>
          {RAYS.map((d) => (
            <Path key={d} d={d} fill="#FFF3A0" />
          ))}
        </G>

        {HALFTONE.map(([x, y, r]) => (
          <Circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#F5B800" opacity={0.75} />
        ))}

        {/* ink doodles */}
        <Path d="M300,26 q10,-14 20,0 t20,0 t20,0" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" opacity={0.85} />
        <Path d="M14,640 l12,-14 l12,14 l12,-14 l12,14 l12,-14" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
        <Path d="M372,380 h16 M380,372 v16" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <Path d="M26,360 h12 M32,354 v12" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <Circle cx={40} cy={560} r={9} fill="none" stroke={INK} strokeWidth={3} />
        <Circle cx={356} cy={160} r={6} fill="none" stroke={INK} strokeWidth={3} />
        <Path d="M352,610 c0,-14 22,-14 22,0 c0,12 -16,12 -16,2 c0,-6 8,-6 8,-2" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />

        {/* stickers */}
        <G transform="translate(362 70) rotate(14)">
          <Path d={STAR} fill="#FF7FB0" {...sticker} />
        </G>
        <G transform="translate(22 250) rotate(-12) scale(0.8)">
          <Path d={STAR} fill="#FFFFFF" {...sticker} />
        </G>
        <G transform="translate(376 470) rotate(8) scale(0.9)">
          <Path d={SPARK} fill="#9B7CFF" {...sticker} />
        </G>
        <G transform="translate(30 470) scale(0.9)">
          <Path d="M2,-14 L-8,2 L0,2 L-4,14 L10,-4 L2,-4 Z" fill="#4FE0A0" {...sticker} />
        </G>
        <G transform="translate(370 700) rotate(-10)">
          <Path d="M0,10 C-18,-4 -10,-18 0,-8 C10,-18 18,-4 0,10 Z" fill="#FF8A3D" {...sticker} />
        </G>
        <G transform="translate(30 740) rotate(10) scale(0.85)">
          <Path d={STAR} fill="#9B7CFF" {...sticker} />
        </G>
        <G transform="translate(200 790)">
          <Path d={SPARK} fill="#FFFFFF" {...sticker} transform="scale(0.7)" />
        </G>
      </Svg>
    </View>
  );
}
