// Function to calculate Normal Distribution (Gaussian) PDF
// Mean = 0, StdDev = 1
export const normalPDF = (x: number): number => {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
};

// Lanczos approximation for Gamma function to support t-distribution
function mathGamma(z: number): number {
  const g = 7;
  const p = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * mathGamma(1 - z));
  z -= 1;
  let x = p[0];
  for (let i = 1; i < g + 2; i++) x += p[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

// Function to calculate a Fat-Tailed Distribution (Student's t-distribution)
// This simulates the "Leptokurtic" behavior: higher peak, fatter tails.
export const fatTailPDF = (x: number): number => {
  // Degrees of freedom (v). Lower v = fatter tails.
  // v=3 is a common proxy for financial returns (power law behavior)
  const v = 3;

  const numerator = mathGamma((v + 1) / 2);
  const denominator =
    Math.sqrt(v * Math.PI) *
    mathGamma(v / 2) *
    Math.pow(1 + (x * x) / v, (v + 1) / 2);

  // We don't scale it artificially anymore; the t-dist shape naturally handles the comparison
  return numerator / denominator;
};

export interface DistributionPoint {
  sigma: number;
  normal: number;
  fatTail: number;
  normalLabel?: string;
  fatTailLabel?: string;
}

export const generateDistributionData = (
  range: number = 6,
  step: number = 0.1
): DistributionPoint[] => {
  const data: DistributionPoint[] = [];
  for (let i = -range; i <= range; i += step) {
    // Fix floating point math issues
    const x = Math.round(i * 100) / 100;
    data.push({
      sigma: x,
      normal: normalPDF(x),
      fatTail: fatTailPDF(x),
    });
  }
  return data;
};

// Formatter for probability to scientific notation or readable tiny numbers
export const formatProbability = (prob: number): string => {
  if (prob < 1e-6) return prob.toExponential(2);
  if (prob < 0.001) return prob.toFixed(6);
  return prob.toFixed(4);
};

export const getTimeFrequency = (
  sigma: number,
  type: 'normal' | 'fat'
): string => {
  const absSigma = Math.abs(sigma);

  // Approximate frequency text for educational context
  if (type === 'normal') {
    if (absSigma < 1) return 'Daily occurrence';
    if (absSigma < 2) return 'Once a month';
    if (absSigma < 3) return 'Once every 2-3 years';
    if (absSigma < 4) return 'Once in 120 years';
    if (absSigma < 5) return 'Once in 14,000 years';
    if (absSigma < 6) return 'Once in 4 million years';
    if (absSigma < 7) return 'Once in 3 billion years';
    return 'Never (Heat death of universe)';
  } else {
    // Fat tail (t-dist v=3 approx)
    if (absSigma < 1) return 'Daily occurrence';
    if (absSigma < 2) return 'Once a month';
    if (absSigma < 3) return 'Once a year';
    if (absSigma < 4) return 'Once every 5 years';
    if (absSigma < 5) return 'Once every 20 years';
    if (absSigma < 6) return 'Once in a lifetime';
    if (absSigma < 7) return 'Twice in a lifetime';
    return 'Once a century';
  }
};
