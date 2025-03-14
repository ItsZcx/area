export const adjustColorBrightness = (color: string, amount: number) => {
  let usePound = false;

  if (color[0] === "#") {
    color = color.slice(1);
    usePound = true;
  }

  const num = parseInt(color, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  return (usePound ? "#" : "") + (r << 16 | g << 8 | b).toString(16).padStart(6, "0");
};
