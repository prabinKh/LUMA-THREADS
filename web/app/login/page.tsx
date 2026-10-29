"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") || "/checkout";

  const { login, isLoggedIn, user, logout } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 4) {
      setError("Please enter a password with at least 4 characters.");
      return;
    }

    login(email, name || email.split("@")[0]);
    setSuccess("Signed in successfully! Redirecting...");
    setTimeout(() => {
      router.push(redirectPath);
    }, 600);
  };

  const handleDemoLogin = () => {
    login("emma.watson@pistola.com", "Emma Watson");
    setSuccess("Logged in as Emma Watson! Redirecting...");
    setTimeout(() => {
      router.push(redirectPath);
    }, 600);
  };

  if (isLoggedIn && user) {
    return (
      <div
        style={{
          maxWidth: "480px",
          margin: "4rem auto 8rem",
          padding: "3rem 2.5rem",
          background: "#fff",
          border: "1px solid #eee",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#000",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            margin: "0 auto 1.5rem",
          }}
        >
          ✓
        </div>
        <h2 style={{ fontSize: "2rem", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 1rem" }}>
          Already Signed In
        </h2>
        <p style={{ fontSize: "1.3rem", color: "#666", marginBottom: "2rem" }}>
          Signed in as <strong>{user.email}</strong>
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button
            type="button"
            onClick={() => router.push(redirectPath)}
            style={{
              padding: "1.4rem",
              background: "#000",
              color: "#fff",
              border: "none",
              fontSize: "1.2rem",
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Continue to {redirectPath === "/checkout" ? "Payment / Checkout" : "Shopping"}
          </button>
          <button
            type="button"
            onClick={logout}
            style={{
              padding: "1.2rem",
              background: "#fff",
              color: "#000",
              border: "1px solid #ccc",
              fontSize: "1.1rem",
              fontWeight: 500,
              letterSpacing: "1px",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "3rem auto 8rem",
        padding: "3.5rem 2.5rem",
        background: "#fff",
        border: "1px solid #ebebeb",
        boxShadow: "0 6px 24px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <p
          style={{
            fontSize: "1rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#888",
            margin: "0 0 0.5rem",
            fontWeight: 600,
          }}
        >
          LUMA THREADS ACCOUNT
        </p>
        <h1
          style={{
            fontSize: "2.4rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            fontWeight: 500,
            margin: "0 0 1rem",
          }}
        >
          {isRegister ? "Create Account" : "Sign In to Checkout"}
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#666", margin: 0 }}>
          {isRegister
            ? "Create an account for expedited checkout & order tracking."
            : "Sign in to access saved addresses, order tracking & fast payment."}
        </p>
      </div>

      {/* Demo 1-Click login banner */}
      <div
        style={{
          background: "#f8f9fa",
          border: "1px dashed #000",
          padding: "1.4rem",
          marginBottom: "2.5rem",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 0.8rem", textTransform: "uppercase", letterSpacing: "1px" }}>
          ⚡ Fast Demo Test
        </p>
        <button
          type="button"
          onClick={handleDemoLogin}
          style={{
            width: "100%",
            padding: "1rem",
            background: "#000",
            color: "#fff",
            border: "none",
            fontSize: "1.1rem",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          1-Click Sign In as Emma Watson
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#ffebee",
            color: "#c62828",
            padding: "1rem 1.2rem",
            fontSize: "1.2rem",
            marginBottom: "1.5rem",
            borderLeft: "3px solid #c62828",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: "#e8f5e9",
            color: "#2e7d32",
            padding: "1rem 1.2rem",
            fontSize: "1.2rem",
            marginBottom: "1.5rem",
            borderLeft: "3px solid #2e7d32",
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
        {isRegister && (
          <div>
            <label
              style={{
                display: "block",
                fontSize: "1.1rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 600,
                marginBottom: "0.6rem",
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              style={{
                width: "100%",
                padding: "1.2rem",
                border: "1px solid #ccc",
                fontSize: "1.3rem",
                outline: "none",
                borderRadius: "0px",
              }}
            />
          </div>
        )}

        <div>
          <label
            style={{
              display: "block",
              fontSize: "1.1rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontWeight: 600,
              marginBottom: "0.6rem",
            }}
          >
            Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="you@example.com"
            style={{
              width: "100%",
              padding: "1.2rem",
              border: "1px solid #ccc",
              fontSize: "1.3rem",
              outline: "none",
              borderRadius: "0px",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "1.1rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontWeight: 600,
              marginBottom: "0.6rem",
            }}
          >
            Password *
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="••••••••"
            style={{
              width: "100%",
              padding: "1.2rem",
              border: "1px solid #ccc",
              fontSize: "1.3rem",
              outline: "none",
              borderRadius: "0px",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "1.4rem",
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "0px",
            fontSize: "1.2rem",
            fontWeight: 600,
            letterSpacing: "2px",
            textTransform: "uppercase",
            cursor: "pointer",
            marginTop: "0.5rem",
          }}
        >
          {isRegister ? "Create Account & Proceed" : "Sign In & Proceed to Payment"}
        </button>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              textDecoration: "underline",
              fontSize: "1.2rem",
              cursor: "pointer",
              color: "#555",
            }}
          >
            {isRegister
              ? "Already have an account? Sign In"
              : "Don't have an account? Create One"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "5rem" }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

