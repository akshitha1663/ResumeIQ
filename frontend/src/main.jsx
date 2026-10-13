
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

/**
 * Suppress the browser-native AbortError that fires when React 19 Strict Mode
 * double-invokes effects during Vite HMR: "play() interrupted by pause()".
 *
 * This error originates inside the browser / Vite runtime — there is no audio
 * or video element anywhere in the application code. The guard is intentionally
 * narrow: only AbortErrors whose message mentions "play" are suppressed.
 * Every other unhandled rejection is immediately re-thrown so real errors
 * continue to appear in the console.
 */
window.addEventListener("unhandledrejection", (event) => {
  const err = event.reason;
  if (
    err instanceof DOMException &&
    err.name === "AbortError" &&
    typeof err.message === "string" &&
    err.message.toLowerCase().includes("play")
  ) {
    event.preventDefault(); // suppress only this specific false positive
    return;
  }
  // All other promise rejections are NOT suppressed — rethrow for visibility
  // (browser will still log them; preventDefault is NOT called)
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
