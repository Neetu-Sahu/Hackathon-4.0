import React, { useState } from "react";
import logo from "../assets/logo.png"; // Ensure you have a logo image at this path or update accordingly

import {
  User,
  Building2,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const AuthButton = ({ icon: Icon, title, subtitle, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "white",
        border: isHovered ? "1px solid #cbd5e1" : "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        alignItems: "center",
        gap: "24px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: isHovered
          ? "0 10px 25px rgba(15, 23, 42, 0.08)"
          : "0 2px 8px rgba(15, 23, 42, 0.03)",
        width: "100%",
        outline: "none",
        transform: isHovered ? "translateY(-2px)" : "none",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff7ed",
          padding: "16px",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "inset 0 2px 4px rgba(249, 115, 22, 0.1)",
        }}
      >
        <Icon size={28} color="#ea580c" strokeWidth={2.5} />
      </div>
      <div style={{ textAlign: "left" }}>
        <div
          style={{
            color: "#0f172a",
            fontWeight: 700,
            fontSize: "1.15rem",
            marginBottom: "6px",
          }}
        >
          {title}
        </div>
        <div style={{ color: "#64748b", fontSize: "0.95rem" }}>{subtitle}</div>
      </div>
    </button>
  );
};

const OTPInput = ({ length = 6, value, onChange }) => {
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...value];
    newOtp[index] = element.value;
    onChange(newOtp);
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        margin: "32px 0",
      }}
    >
      {value.map((data, index) => (
        <input
          type="text"
          name="otp"
          maxLength="1"
          key={index}
          value={data}
          onChange={(e) => handleChange(e.target, index)}
          onFocus={(e) => e.target.select()}
          style={{
            width: "45px",
            height: "56px",
            fontSize: "1.5rem",
            textAlign: "center",
            border: "2px solid #cbd5e1",
            borderRadius: "10px",
            outline: "none",
            fontWeight: 700,
            color: "#0f172a",
            transition: "border-color 0.2s",
            background: "#f8fafc",
          }}
          // onFocus={(e) => { e.target.style.borderColor = '#0f172a'; e.target.style.background = 'white'; e.target.select(); }}
          onBlur={(e) => {
            e.target.style.borderColor = "#cbd5e1";
            e.target.style.background = "#f8fafc";
          }}
        />
      ))}
    </div>
  );
};

const Login = ({ onLogin }) => {
  const [view, setView] = useState("login");

  // Real Auth States
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Signup States
  const [signupName, setSignupName] = useState("");
  const [signupMobile, setSignupMobile] = useState("");
  const [signupDesignation, setSignupDesignation] = useState("");
  const [signupDepartment, setSignupDepartment] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  // SSO Full-screen Overlay States
  const [ssoText, setSsoText] = useState(
    "Redirecting to Secure Government Gateway...",
  );

  const handleMobileLogin = () => {
    setAuthError("");
    setPhoneNumber("");
    setView("phone");
  };

  const handleSSOLogin = () => {
    setView("sso");
    setSsoText("Redirecting to Secure Government Gateway...");

    // Simulate enterprise SSO relay timing
    setTimeout(() => {
      setSsoText("Verifying Credentials with Parichay Servers...");
    }, 1500);

    setTimeout(() => {
      onLogin();
    }, 3000);
  };

  const handleSendOTP = async () => {
    const rawNumber = phoneNumber.trim();
    if (!rawNumber || rawNumber.length < 10) {
      setAuthError("Please enter a valid phone number (e.g. +91XXXXXXXXXX)");
      return;
    }

    setIsLoading(true);
    setAuthError("");

    try {
      let formattedNum = rawNumber;
      if (!rawNumber.startsWith("+")) {
        formattedNum = `+91${rawNumber.replace(/^0+/, "")}`;
      }
      setPhoneNumber(formattedNum);

      const response = await fetch("http://localhost:8000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: formattedNum }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setView("otp");
      } else if (response.status === 404) {
        setAuthError(
          "This mobile number is not registered. Please sign up below.",
        );
      } else {
        let errMessage = data.detail || data.error || "Failed to send OTP.";
        if (Array.isArray(data.detail)) errMessage = data.detail[0].msg;
        setAuthError(errMessage);
      }
    } catch (err) {
      setAuthError(
        "Connection error. Cannot communicate with the backend server.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setAuthError("Please enter all 6 digits of your OTP.");
      return;
    }

    setIsLoading(true);
    setAuthError("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone_number: phoneNumber, otp: otpValue }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        onLogin();
      } else {
        let errMessage = data.detail || "Invalid or expired OTP.";
        if (Array.isArray(data.detail)) errMessage = data.detail[0].msg;
        setAuthError(errMessage);
      }
    } catch (err) {
      setAuthError("Verification failed. Unable to reach backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);

    try {
      let formattedNum = signupMobile.trim();
      if (!formattedNum.startsWith("+")) {
        // Agar +91 nahi hai toh add karein, leading zeros hata kar
        formattedNum = `+91${formattedNum.replace(/^0+/, "").replace(/\s+/g, "")}`;
      }

      const response = await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: signupName,
          mobile: formattedNum,
          designation: signupDesignation,
          department: signupDepartment || "General",
        }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSignupSuccess(true);
        setTimeout(() => {
          setSignupSuccess(false);
          setView("login");
          setSignupName("");
          setSignupMobile("");
          setSignupDesignation("");
          setSignupDepartment("");
        }, 2500);
      } else {
        setAuthError(data.detail || "Registration Failed. Try again.");      }
      } catch (err) {
      setAuthError("Registration Failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background:
          "radial-gradient(circle at top left, rgba(29, 78, 216, 0.14), transparent 30%), radial-gradient(circle at bottom right, rgba(234, 88, 12, 0.14), transparent 28%), #f4f7fb",
      }}
    >
      {/* ---------------- LEFT SIDE ---------------- */}
      <div
        style={{
          flex: 1,
          background:
            "linear-gradient(135deg, #020617 0%, #0f172a 45%, #1d4ed8 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "8%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Abstract Decals */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-10%",
            width: "60%",
            height: "60%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%)",
            borderRadius: "50%",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            left: "-10%",
            width: "80%",
            height: "80%",
            background:
              "radial-gradient(circle, rgba(234,88,12,0.12) 0%, transparent 60%)",
            borderRadius: "50%",
          }}
        ></div>

        <div style={{ position: "relative", zIndex: 10 }}>
          <h1
            style={{
              fontSize: "clamp(3rem, 5vw, 4.4rem)",
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: "32px",
              letterSpacing: "-0.5px",
            }}
          >
            Empowering Districts
            <br />
            through <span style={{ color: "#f97316" }}>Data-Driven</span>
            <br />
            <span style={{ color: "#ea580c" }}>Intelligence</span>
          </h1>
          <p
            style={{
              fontSize: "1.15rem",
              color: "#94a3b8",
              lineHeight: 1.6,
              maxWidth: "600px",
              fontWeight: 400,
            }}
          >
            Leverage the Census data and AI-powered simulations to bridge policy
            gaps. Analyze literacy, infrastructure, and socio-economic markers
            to transform governance at the grass-roots level.
          </p>
        </div>
      </div>

      {/* ---------------- RIGHT SIDE ---------------- */}
      <div
        style={{
          flex: 1.1,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.98) 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          boxShadow: "-16px 0 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div style={{ width: "100%", maxWidth: "520px", position: "relative" }}>
          <div style={{textAlign: "center",marginBottom: view === "login" ? "48px" : "24px",}}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "20px", // Logo aur Text ke beech ka space
                marginBottom: "24px",
                padding: "16px 18px",
                borderRadius: "24px",
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(226,232,240,0.95)",
                boxShadow: "0 16px 32px rgba(15,23,42,0.08)",
              }}
            >
              {/* 1. Logo Integration */}
              <img
                src={logo}
                alt="BPIS Logo"
                style={{
                  height: "80px", // Text height ke hisab se adjusted
                  width: "auto",
                  objectFit: "contain",
                }}
              />

              {/* 2. Brand Name */}
              <h1
                style={{
                  fontSize: "clamp(2.1rem, 3vw, 2.9rem)",
                  fontWeight: 900,
                  color: "#0f172a",
                  margin: 0,
                  letterSpacing: "0px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                BPIS<span style={{ color: "#ea580c" }}>Portal</span>
              </h1>
            </div>
            {/* <div style={{ display: 'inline-block', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-1px' }}>
                    BPIS<span style={{ color: '#ea580c' }}>Portal</span>
                </h1>
            </div> */}

            {view === "login" && (
              <>
                <h3
                  style={{
                    fontSize: "1.8rem",
                    color: "#0f172a",
                    fontWeight: 800,
                    marginBottom: "12px",
                  }}
                >
                  Log into BPIS
                </h3>
                <p style={{ color: "#64748b", fontSize: "1rem" }}>
                  Select any one from the below options
                </p>
              </>
            )}

            {view === "phone" && (
              <>
                <h3
                  style={{
                    fontSize: "1.8rem",
                    color: "#0f172a",
                    fontWeight: 800,
                    marginBottom: "12px",
                  }}
                >
                  Mobile Verification
                </h3>
                <p style={{ color: "#64748b", fontSize: "1rem" }}>
                  We will send an OTP via SMS to verify your identity
                </p>
              </>
            )}

            {view === "otp" && (
              <>
                <h3
                  style={{
                    fontSize: "1.8rem",
                    color: "#0f172a",
                    fontWeight: 800,
                    marginBottom: "12px",
                  }}
                >
                  Verify Secure Pin
                </h3>
                <p style={{ color: "#64748b", fontSize: "1rem" }}>
                  Enter the 6-digit OTP sent via Twilio to your phone
                </p>
              </>
            )}

            {view === "signup" && !signupSuccess && (
              <>
                <h3
                  style={{
                    fontSize: "1.8rem",
                    color: "#0f172a",
                    fontWeight: 800,
                    marginBottom: "12px",
                  }}
                >
                  Create an Account
                </h3>
                <p style={{ color: "#64748b", fontSize: "1rem" }}>
                  Register yourself for the BPIS Portal
                </p>
              </>
            )}
          </div>

          {/* VIEW RENDERER */}

          {/* 1. Base Login View */}
          {view === "login" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                animation: "fadeIn 0.3s ease-in-out",
              }}
            >
              <AuthButton
                icon={User}
                title="Individual (Mobile OTP)"
                subtitle="Login via Twilio SMS verification"
                onClick={handleMobileLogin}
              />
              <AuthButton
                icon={User}
                title="Individual (Meri Pehchaan)"
                subtitle="Login with Meri Pehchaan Single Sign-On"
                onClick={handleSSOLogin}
              />
              <AuthButton
                icon={Building2}
                title="For Govt. Employee Only"
                subtitle="Login With Parichay (Govt. SSO)"
                onClick={handleSSOLogin}
              />
              <div
                style={{
                  textAlign: "center",
                  marginTop: "40px",
                  color: "#64748b",
                  fontSize: "1.05rem",
                }}
              >
                New to BPIS?{" "}
                <span
                  onClick={() => {
                    setView("signup");
                    setAuthError("");
                  }}
                  style={{
                    color: "#0f172a",
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: "4px",
                  }}
                >
                  Signup
                </span>
              </div>
            </div>
          )}

          {/* 2. Phone Input View */}
          {view === "phone" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                animation: "fadeIn 0.3s ease-in-out",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#1e293b",
                    fontWeight: 600,
                  }}
                >
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {authError && (
                <div
                  style={{
                    background: "#fef2f2",
                    padding: "12px",
                    borderRadius: "8px",
                    marginTop: "16px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <AlertCircle
                    size={18}
                    color="#ef4444"
                    style={{ flexShrink: 0, marginTop: "2px" }}
                  />
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "0.95rem",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {authError}
                  </p>
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={isLoading}
                style={{
                  background: "#0f172a",
                  color: "white",
                  padding: "16px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  border: "none",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  width: "100%",
                  marginTop: "24px",
                  transition: "background-color 0.2s",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
                  opacity: isLoading ? 0.7 : 1,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {isLoading ? (
                  <Loader2
                    size={24}
                    style={{ animation: "spin 1.5s linear infinite" }}
                  />
                ) : (
                  "Send OTP"
                )}
              </button>

              <div
                onClick={() => {
                  setView("login");
                  setAuthError("");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  marginTop: "32px",
                  color: "#64748b",
                }}
              >
                <ArrowLeft size={16} /> <span>Back to Login Options</span>
              </div>
            </div>
          )}

          {/* 3. OTP Verification View */}
          {view === "otp" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                animation: "fadeIn 0.3s ease-in-out",
              }}
            >
              <p
                style={{
                  textAlign: "center",
                  color: "#0f172a",
                  fontWeight: "500",
                  fontSize: "1.05rem",
                  margin: 0,
                }}
              >
                A code was sent to <strong>{phoneNumber}</strong>
              </p>

              <OTPInput length={6} value={otp} onChange={setOtp} />

              {authError && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "0.95rem",
                    textAlign: "center",
                    marginBottom: "8px",
                  }}
                >
                  {authError}
                </p>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={isLoading}
                style={{
                  background: "#0f172a",
                  color: "white",
                  padding: "16px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  border: "none",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  width: "100%",
                  marginTop: "8px",
                  transition: "background-color 0.2s",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
                  opacity: isLoading ? 0.7 : 1,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {isLoading ? (
                  <Loader2
                    size={24}
                    style={{ animation: "spin 1.5s linear infinite" }}
                  />
                ) : (
                  "Verify & Login"
                )}
              </button>

              <div
                onClick={() => {
                  setView("phone");
                  setOtp(new Array(6).fill(""));
                  setAuthError("");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  marginTop: "32px",
                  color: "#64748b",
                }}
              >
                <ArrowLeft size={16} /> <span>Change Phone Number</span>
              </div>
            </div>
          )}

          {/* 4. Signup View */}
          {view === "signup" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                animation: "fadeIn 0.3s ease-in-out",
              }}
            >
              {signupSuccess ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <CheckCircle2
                    size={72}
                    color="#10b981"
                    style={{ margin: "0 auto", marginBottom: "24px" }}
                  />
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      color: "#0f172a",
                      fontWeight: 700,
                      marginBottom: "8px",
                    }}
                  >
                    Registration Successful!
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
                    Your robust government profile has been created.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSignupSubmit}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      Full Name
                    </label>
                    <input
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      type="text"
                      placeholder="Enter your full name"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      Mobile Number
                    </label>
                    <input
                      value={signupMobile}
                      onChange={(e) => setSignupMobile(e.target.value)}
                      required
                      type="tel"
                      placeholder="+91 99999 00000"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      Department
                    </label>
                    <input
                      value={signupDepartment}
                      onChange={(e) => setSignupDepartment(e.target.value)}
                      required
                      type="text"
                      placeholder="Ministry of Rural Development"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      Designation
                    </label>
                    <select
                      value={signupDesignation}
                      onChange={(e) => setSignupDesignation(e.target.value)}
                      required
                      style={{
                        ...inputStyle,
                        cursor: "pointer",
                        appearance: "auto",
                      }}
                    >
                      <option value="" disabled>
                        Select Designation
                      </option>
                      <option value="dm">District Magistrate (DM)</option>
                      <option value="secretary">Secretary</option>
                      <option value="analyst">Data Analyst</option>
                    </select>
                  </div>

                  {authError && (
                    <div
                      style={{
                        background: "#fef2f2",
                        padding: "10px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <AlertCircle size={16} color="#ef4444" />
                      <p
                        style={{
                          color: "#ef4444",
                          fontSize: "0.9rem",
                          margin: 0,
                        }}
                      >
                        {authError}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      background: "#0f172a",
                      color: "white",
                      padding: "16px",
                      borderRadius: "12px",
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      border: "none",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      width: "100%",
                      marginTop: "8px",
                      transition: "background-color 0.2s",
                      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
                      opacity: isLoading ? 0.7 : 1,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {isLoading ? (
                      <Loader2
                        size={24}
                        style={{ animation: "spin 1.5s linear infinite" }}
                      />
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>
              )}

              {!signupSuccess && (
                <div
                  onClick={() => {
                    setView("login");
                    setAuthError("");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: "pointer",
                    marginTop: "32px",
                    color: "#64748b",
                  }}
                >
                  <ArrowLeft size={16} /> <span>Back to Login</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---------------- FULL SCREEN SSO OVERLAY ---------------- */}
      {view === "sso" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(2, 6, 23, 0.95)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            animation: "fadeIn 0.4s ease-out",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              animation: "spin 1.2s linear infinite",
              color: "#ea580c",
              marginBottom: "40px",
            }}
          >
            <Loader2 size={96} strokeWidth={1.5} />
          </div>
          <h2
            style={{
              fontSize: "3rem",
              fontWeight: 800,
              margin: "0 0 20px 0",
              letterSpacing: "-1px",
            }}
          >
            Government SSO Redirect
          </h2>
          <p
            style={{
              fontSize: "1.4rem",
              color: "#cbd5e1",
              transition: "all 0.3s ease",
              textAlign: "center",
              fontWeight: 400,
            }}
          >
            {ssoText}
          </p>
        </div>
      )}

      {/* Global Embedded Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  outline: "none",
  fontSize: "1rem",
  color: "#0f172a",
  background: "#f8fafc",
  boxSizing: "border-box",
};

export default Login;
