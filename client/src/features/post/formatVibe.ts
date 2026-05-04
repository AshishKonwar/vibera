export const formatVibe = (vibe: string) => {
  return vibe
    .toLowerCase()
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};