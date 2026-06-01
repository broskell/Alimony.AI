const STATE_MULTIPLIERS = {
  Delhi: 1.0,
  'New Delhi': 1.0,
  Mumbai: 1.08,
  Maharashtra: 1.05,
  Bangalore: 0.95,
  Karnataka: 0.95,
  Chennai: 0.92,
  'Tamil Nadu': 0.92,
  Kolkata: 0.9,
  'West Bengal': 0.9,
  Hyderabad: 0.94,
  Telangana: 0.94,
  Pune: 1.02,
  Ahmedabad: 0.88,
  Gujarat: 0.88,
  Chandigarh: 0.96,
  Punjab: 0.96,
  Kerala: 0.93,
  Rajasthan: 0.9,
  'Uttar Pradesh': 0.91,
  default: 1.0,
};

const ACT_SECTIONS = {
  HMA: { act: 'Hindu Marriage Act 1955', section: 'Section 25', interim: 'Section 24' },
  SMA: { act: 'Special Marriage Act 1954', section: 'Section 37', interim: 'Section 36' },
  CrPC125: { act: 'Code of Criminal Procedure', section: 'Section 125', interim: 'Section 125' },
  DV: { act: 'Protection of Women from Domestic Violence Act 2005', section: 'Section 20', interim: 'Section 20' },
  HAMA: { act: 'Hindu Adoption and Maintenance Act 1956', section: 'Section 18', interim: 'Section 18' },
};

function marriageModifier(years) {
  if (years <= 5) return 0.8;
  if (years <= 10) return 1.0;
  if (years <= 20) return 1.2;
  return 1.4;
}

function getStateMultiplier(state) {
  if (!state) return STATE_MULTIPLIERS.default;
  for (const [key, val] of Object.entries(STATE_MULTIPLIERS)) {
    if (state.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return STATE_MULTIPLIERS.default;
}

export function calculateAlimony(input) {
  const {
    role = 'claimant',
    act = 'HMA',
    state = 'Delhi',
    marriageYears = 5,
    yourIncome = 0,
    spouseIncome = 0,
    children = 0,
    standardOfLiving = 'middle',
    careerSacrifice = 'none',
    domesticViolence = 'none',
    health = 'healthy',
    educationGap = 'none',
    jointProperty = 'none',
  } = input;

  const higher = Math.max(yourIncome, spouseIncome);
  const lower = Math.min(yourIncome, spouseIncome);
  const gap = Math.abs(higher - lower);
  let baseAmount = gap * 0.25;

  if (baseAmount < 5000 && lower > 0) {
    baseAmount = Math.max(lower * 0.2, 5000);
  }

  const breakdown = [];
  let multiplier = 1;

  const mMod = marriageModifier(marriageYears);
  multiplier *= mMod;
  breakdown.push({ factor: 'Marriage duration', value: `${marriageYears} years`, modifier: `${((mMod - 1) * 100).toFixed(0)}%`, effect: mMod });

  const childMod = 1 + Math.min(children * 0.08, 0.3);
  multiplier *= childMod;
  breakdown.push({ factor: 'Dependent children', value: children, modifier: `+${((childMod - 1) * 100).toFixed(0)}%`, effect: childMod });

  const careerMods = { none: 1.0, partial: 1.15, full: 1.3 };
  const cMod = careerMods[careerSacrifice] || 1;
  multiplier *= cMod;
  breakdown.push({ factor: 'Career sacrifice', value: careerSacrifice, modifier: `${((cMod - 1) * 100).toFixed(0)}%`, effect: cMod });

  const dvMods = { none: 1.0, cruelty: 1.15, abuse: 1.25 };
  const dvMod = dvMods[domesticViolence] || 1;
  multiplier *= dvMod;
  breakdown.push({ factor: 'Domestic violence / cruelty', value: domesticViolence, modifier: `${((dvMod - 1) * 100).toFixed(0)}%`, effect: dvMod });

  const healthMods = { healthy: 1.0, illness: 1.12, disability: 1.25 };
  const hMod = healthMods[health] || 1;
  multiplier *= hMod;
  breakdown.push({ factor: 'Health conditions', value: health, modifier: `${((hMod - 1) * 100).toFixed(0)}%`, effect: hMod });

  const eduMods = { none: 1.0, moderate: 1.05, significant: 1.15 };
  const eMod = eduMods[educationGap] || 1;
  multiplier *= eMod;
  breakdown.push({ factor: 'Education gap', value: educationGap, modifier: `${((eMod - 1) * 100).toFixed(0)}%`, effect: eMod });

  const solMods = { basic: 0.85, middle: 1.0, upper: 1.15, affluent: 1.25 };
  const sMod = solMods[standardOfLiving] || 1;
  multiplier *= sMod;
  breakdown.push({ factor: 'Standard of living', value: standardOfLiving, modifier: `${((sMod - 1) * 100).toFixed(0)}%`, effect: sMod });

  const propMods = { none: 1.0, some: 0.95, significant: 0.88 };
  const pMod = propMods[jointProperty] || 1;
  multiplier *= pMod;
  breakdown.push({ factor: 'Joint property', value: jointProperty, modifier: `${((pMod - 1) * 100).toFixed(0)}%`, effect: pMod });

  const stateMod = getStateMultiplier(state);
  multiplier *= stateMod;
  breakdown.push({ factor: 'State / HC tendency', value: state, modifier: `${((stateMod - 1) * 100).toFixed(0)}%`, effect: stateMod });

  let monthly = Math.round(baseAmount * multiplier);
  const interimPct = role === 'claimant' ? 0.22 : 0.2;
  const interim = Math.round(Math.max(spouseIncome, yourIncome) * interimPct);

  const durationYears = Math.min(Math.round(marriageYears * 0.6), 10);
  const annual = monthly * 12;
  const total = annual * durationYears;

  const actInfo = ACT_SECTIONS[act] || ACT_SECTIONS.HMA;
  const score = Math.min(100, Math.round(
    (marriageYears / 20) * 25 +
    (children > 0 ? 15 : 0) +
    (careerSacrifice === 'full' ? 20 : careerSacrifice === 'partial' ? 10 : 0) +
    (domesticViolence !== 'none' ? 15 : 0) +
    (gap / Math.max(higher, 1)) * 25 +
    15
  ));

  return {
    monthly,
    annual,
    total,
    duration: durationYears,
    interim,
    breakdown,
    baseAmount: Math.round(baseAmount),
    combinedMultiplier: Number(multiplier.toFixed(3)),
    act: actInfo.act,
    section: actInfo.section,
    interimSection: actInfo.interim,
    actCode: act,
    stateNote: `${state} High Court tendency applied (${stateMod}x)`,
    supremeCourtRef: 'Rajnesh v. Neha, (2020) 4 SCC 153',
    role,
    verdictLabel: role === 'claimant'
      ? 'MONTHLY MAINTENANCE ENTITLEMENT'
      : 'MONTHLY MAINTENANCE OBLIGATION',
    score,
    applicableSections: [
      { act: 'HMA', number: 'Section 24', title: 'Interim maintenance during proceedings' },
      { act: 'HMA', number: 'Section 25', title: 'Permanent alimony and maintenance' },
      { act: 'CrPC', number: 'Section 125', title: 'Order for maintenance of wives, children and parents' },
    ],
  };
}
