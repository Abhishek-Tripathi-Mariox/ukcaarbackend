const formatMeta = (meta) => {
  if (meta === undefined) return "";
  if (typeof meta === "string") return ` ${meta}`;
  try {
    return ` ${JSON.stringify(meta)}`;
  } catch (error) {
    return ` ${String(meta)}`;
  }
};

module.exports = {
  info(message, meta) {
    console.log(`[INFO] ${message}${formatMeta(meta)}`);
  },
  error(message, meta) {
    console.error(`[ERROR] ${message}${formatMeta(meta)}`);
  },
  warn(message, meta) {
    console.warn(`[WARN] ${message}${formatMeta(meta)}`);
  },
  debug(message, meta) {
    console.log(`[DEBUG] ${message}${formatMeta(meta)}`);
  },
};
