export const formatVibes = (vibe: string) => {
  return vibe
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};