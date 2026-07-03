// Design tokens — vibrant palette (v2).
// Same role names as before (GROUND = page background, PARCHMENT = primary
// text, EMBER = primary accent, etc.) so no component logic had to change —
// only the values, from a dark, muted scheme to a bright, saturated one.

export const GROUND = "#FFF9F0";        // page background — warm bright cream, not stark white
export const SURFACE = "#FFFFFF";       // card background — crisp white, pops off the cream
export const SURFACE_RAISED = "#FFF1DC"; // hover / active surface — warm peach
export const PARCHMENT = "#241A10";     // primary text — deep warm espresso, not flat black
export const MUTED = "#6E5A48";         // secondary text — warm taupe-brown
export const FAINT = "#A7937D";         // tertiary text / placeholders
export const EMBER = "#E8541E";         // primary accent — vibrant coral-orange
export const EMBER_SOFT = "rgba(232,84,30,0.12)";
export const SAGE = "#0E9594";          // secondary accent — vibrant teal (was muted sage)
export const SAGE_SOFT = "rgba(14,149,148,0.12)";
export const CLAY = "#E0313D";          // crisis / emphasis, used sparingly — vibrant red
export const CLAY_SOFT = "rgba(224,49,61,0.10)";
export const BORDER = "rgba(36,26,16,0.12)";
export const BORDER_SOFT = "rgba(36,26,16,0.06)";

export const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
`;
