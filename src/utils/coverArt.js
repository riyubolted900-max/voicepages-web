/**
 * Generate deterministic cover art gradients from book ID
 * Each book always gets the same gradient
 */

const GRADIENTS = [
  ['#BF5AF2', '#FF375F'],  // purple → pink  (Apple Music signature)
  ['#FF6B6B', '#FF8E53'],  // red → orange
  ['#30D158', '#40CBC4'],  // green → teal
  ['#0A84FF', '#BF5AF2'],  // blue → purple
  ['#FF9F0A', '#FF6B6B'],  // amber → red
  ['#40CBC4', '#0A84FF'],  // teal → blue
  ['#FF375F', '#FF9F0A'],  // pink → orange
  ['#5E5CE6', '#BF5AF2'],  // indigo → purple
  ['#FF2D55', '#5E5CE6'],  // red → indigo
  ['#34C759', '#0A84FF'],  // green → blue
]

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function getCoverGradient(id = '') {
  const index = hashString(String(id)) % GRADIENTS.length
  const [from, to] = GRADIENTS[index]
  return `linear-gradient(135deg, ${from}, ${to})`
}

export function getCoverColors(id = '') {
  const index = hashString(String(id)) % GRADIENTS.length
  return GRADIENTS[index]
}
