/**
 * Small helpers for upgrading the hero network to WebGL (used by NeuralNet.jsx).
 * They run BEFORE three.js downloads, so they must not import it.
 */

// Software WebGL (no real GPU) can freeze the page for seconds: stay on 2D there.
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;

/**
 * Whether this device should get the WebGL version: not saving data, not a
 * very low-memory device, and a hardware WebGL context is available.
 * Creates a throw-away test context and frees it again.
 */
export function webglWanted() {
  if (navigator.connection?.saveData) return false;
  if (navigator.deviceMemory !== undefined && navigator.deviceMemory <= 2) return false;

  const canvas = document.createElement("canvas");
  const options = { failIfMajorPerformanceCaveat: true };
  let gl = null;
  try {
    gl = canvas.getContext("webgl2", options) || canvas.getContext("webgl", options);
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    return !SOFTWARE_RENDERER.test(renderer);
  } catch {
    return false;
  } finally {
    gl?.getExtension("WEBGL_lose_context")?.loseContext(); // free the test context right away
  }
}

/**
 * Calls `callback` once the loading screen is gone (the "loader:done" event,
 * or right away when there's no loader) and the browser is idle
 * (requestIdleCallback, or 300 ms where that doesn't exist).
 * Returns a function that cancels whatever is still pending.
 */
export function whenIdleAfterLoader(callback) {
  let idle = null;
  let timer = null;

  const schedule = () => {
    if ("requestIdleCallback" in window) idle = window.requestIdleCallback(callback);
    else timer = window.setTimeout(callback, 300);
  };

  // The loading screen marks <html> with "loading" while it shows (see Loader.jsx).
  const waiting = document.documentElement.classList.contains("loading");
  if (waiting) window.addEventListener("loader:done", schedule, { once: true });
  else schedule();

  return () => {
    window.removeEventListener("loader:done", schedule);
    if (idle !== null) window.cancelIdleCallback(idle);
    if (timer !== null) window.clearTimeout(timer);
  };
}
