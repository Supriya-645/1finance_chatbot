import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const COMPANY_DOMAINS = ["1finance.co.in", "1finance.com", "1finance.in"];
const BLOCKED_DOMAINS = [
  "gmail.com", "yahoo.com", "yahoo.in", "hotmail.com", "outlook.com",
  "rediffmail.com", "icloud.com", "protonmail.com", "live.com",
  "aol.com", "zoho.com", "ymail.com", "msn.com",
];

function validateCompanyEmail(email) {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed.includes("@")) return "Enter a valid email address.";
  const domain = trimmed.split("@")[1];
  if (BLOCKED_DOMAINS.includes(domain)) {
    return `Personal email (${domain}) is not allowed. Use your company email.`;
  }
  if (!COMPANY_DOMAINS.includes(domain)) {
    return `Only @1finance.co.in company emails are permitted.`;
  }
  return null;
}

function validatePassword(password) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  if (!/[^a-zA-Z0-9]/.test(password)) return "Password must contain at least one symbol (e.g. @, #, !).";
  return null;
}

export default function LoginPage() {
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [stayLogged, setStayLogged] = useState(false);
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const navigate = useNavigate();

  // Auto-login if user previously checked "Stay logged in"
  useEffect(() => {
    const saved = localStorage.getItem("1f_stay_authed");
    const savedEmail = localStorage.getItem("1f_stay_email");
    if (saved === "true" && savedEmail) {
      sessionStorage.setItem("1f_email", savedEmail);
      sessionStorage.setItem("1f_authed", "true");
      navigate("/services", { replace: true });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailErr = validateCompanyEmail(email);
    if (emailErr) return setError(emailErr);

    const passErr = validatePassword(password);
    if (passErr) return setError(passErr);

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem("1f_email", email.trim().toLowerCase());
    sessionStorage.setItem("1f_otp", otp);
    sessionStorage.setItem("1f_stay_logged", stayLogged ? "true" : "false");

    console.log(`%c🔐 1 Finance OTP: ${otp}`, "color: #C9A84C; font-size: 16px; font-weight: bold;");

    setLoading(false);
    navigate("/verify");
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center px-4 py-12">
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
              <p className="text-gray-600 text-xs mt-1 tracking-widest uppercase">
                Internal Stakeholder Portal
              </p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface-700 border border-surface-400 rounded-2xl p-8 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-white text-lg font-semibold">Sign in to your account</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center text-surface-900 text-xs font-bold">1</div>
              <span className="text-gray-500 text-xs">Enter credentials</span>
              <div className="flex-1 h-px bg-surface-400" />
              <div className="w-5 h-5 rounded-full bg-surface-500 flex items-center justify-center text-gray-600 text-xs font-bold">2</div>
              <span className="text-gray-600 text-xs">Verify OTP</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest font-medium">
                Company Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="yourname@1finance.co.in"
                required
                autoComplete="email"
                className="input-dark w-full rounded-xl px-4 py-3 text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Min. 8 chars, letters, numbers & symbol"
                  required
                  autoComplete="current-password"
                  className="input-dark w-full rounded-xl px-4 py-3 pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 text-xs"
                >
                  {showPass ? "HIDE" : "SHOW"}
                </button>
              </div>
              {/* Password hint */}
              <p className="text-xs text-gray-600 mt-1.5">
                Must be 8+ characters with letters, numbers and a symbol
              </p>
            </div>

            {/* Stay logged in checkbox */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStayLogged(!stayLogged)}
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "5px",
                  border: `2px solid ${stayLogged ? "#C9A84C" : "#444"}`,
                  background: stayLogged ? "#C9A84C" : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
              >
                {stayLogged && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <polyline points="2 6 5 9 10 3" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <span className="text-sm text-gray-400 cursor-pointer select-none" onClick={() => setStayLogged(!stayLogged)}>
                Stay logged in on this device
              </span>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold rounded-xl py-3.5 text-sm mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Verifying credentials...
                </span>
              ) : "Continue to OTP →"}
            </button>
          </form>

          <div className="gold-divider mt-6 mb-4" />
          <p className="text-xs text-gray-600 text-center">
            🔒 Restricted to @1finance.co.in addresses only · Personal emails blocked
          </p>
        </div>

        <div className="mt-4 bg-surface-600 border border-surface-400 rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-gray-500">
            Demo: Use <span className="text-gold font-mono">demo@1finance.co.in</span> with any 6+ char password
          </p>
        </div>
      </div>
    </div>
  );
}