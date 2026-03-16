import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OTPPage() {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMsg, setResendMsg] = useState("");
  const refs = useRef([]);
  const navigate = useNavigate();

  const email = sessionStorage.getItem("1f_email") || "";
  const correctOtp = sessionStorage.getItem("1f_otp") || "";

  // Redirect if no email in session
  useEffect(() => {
    if (!email) navigate("/", { replace: true });
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleDigitChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...digits];
    updated[index] = value;
    setDigits(updated);
    setError("");
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const updated = [...digits];
    for (let i = 0; i < 6; i++) updated[i] = pasted[i] || "";
    setDigits(updated);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const entered = digits.join("");
    if (entered.length < 6) return setError("Please enter the complete 6-digit OTP.");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    if (entered === correctOtp) {
      sessionStorage.setItem("1f_authed", "true");
      const stayLogged = sessionStorage.getItem("1f_stay_logged") === "true";
      if (stayLogged) {
        localStorage.setItem("1f_stay_authed", "true");
        localStorage.setItem("1f_stay_email", sessionStorage.getItem("1f_email"));
      }
      navigate("/services");
    } else {
      setError("Incorrect OTP. Check the browser console (F12) for the demo OTP.");
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    }
    setLoading(false);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem("1f_otp", newOtp);
    console.log(`%c🔐 New OTP: ${newOtp}`, "color: #C9A84C; font-size: 16px; font-weight: bold;");
    setResendMsg("New OTP sent! Check browser console (F12).");
    setResendCooldown(30);
    setDigits(["", "", "", "", "", ""]);
    refs.current[0]?.focus();
    setTimeout(() => setResendMsg(""), 4000);
  };

  const maskedEmail = email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) =>
    a + "•".repeat(Math.min(b.length, 6)) + c
  );

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center px-4 py-12">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gold flex items-center justify-center logo-glow">
              <span className="font-display font-bold text-2xl text-surface-900">1F</span>
            </div>
            <div>
              <h1 className="font-display text-3xl text-white tracking-wide">
                1 <span className="text-gold">Finance</span>
              </h1>
              <p className="text-gray-600 text-xs mt-1 tracking-widest uppercase">Two-Factor Authentication</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface-700 border border-surface-400 rounded-2xl p-8 animate-fade-in">
          {/* Step indicator */}
          <div className="mb-6">
            <h2 className="text-white text-lg font-semibold">Verify your identity</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-5 h-5 rounded-full bg-green-800 flex items-center justify-center text-green-400 text-xs">✓</div>
              <span className="text-gray-600 text-xs line-through">Enter credentials</span>
              <div className="flex-1 h-px bg-gold opacity-30" />
              <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center text-surface-900 text-xs font-bold">2</div>
              <span className="text-gray-400 text-xs font-medium">Verify OTP</span>
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-1">OTP sent to</p>
          <p className="text-gold text-sm font-medium mb-6">{maskedEmail}</p>

          <form onSubmit={handleVerify}>
            {/* OTP Inputs */}
            <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-xl font-semibold rounded-xl border transition-all ${
                    digit
                      ? "bg-surface-500 border-gold text-gold"
                      : "bg-surface-800 border-surface-300 text-white focus:border-gold focus:outline-none"
                  }`}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm mb-4 flex items-start gap-2">
                <span className="flex-shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Resend success */}
            {resendMsg && (
              <div className="bg-green-950 border border-green-800 rounded-xl px-4 py-3 text-green-400 text-sm mb-4">
                {resendMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || digits.join("").length < 6}
              className="w-full btn-gold rounded-xl py-3.5 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Verifying...
                </span>
              ) : "Verify & Sign In"}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-5 text-center">
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-sm text-gray-500 hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Didn't receive OTP? Resend"}
            </button>
          </div>

          <div className="gold-divider mt-5 mb-4" />
          <p className="text-xs text-gray-600 text-center">
            💡 Demo: Press F12 → Console tab to see the OTP
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-4 text-center text-gray-600 text-sm hover:text-gray-400 transition-colors"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}
