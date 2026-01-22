"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } =
    useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
        toast.success("Signed in successfully");
        onClose();
      } else if (mode === "signup") {
        await signUpWithEmail(email, password);
        toast.success("Account created successfully");
        onClose();
      } else if (mode === "reset") {
        await resetPassword(email);
        toast.success("Password reset email sent");
        setResetSent(true);
      }
    } catch (err: any) {
      const message = err.message || "An error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      toast.success("Signed in with Google");
      onClose();
    } catch (err: any) {
      const message = err.message || "Google sign-in failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === "signin" && "Welcome Back"}
            {mode === "signup" && "Create Account"}
            {mode === "reset" && "Reset Password"}
          </h2>
          <p className="text-gray-500 mt-1">
            {mode === "signin" && "Sign in to track your contributions"}
            {mode === "signup" && "Join the green movement"}
            {mode === "reset" && "Enter your email to reset password"}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Reset sent message */}
        {resetSent && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
            Password reset email sent! Check your inbox.
          </div>
        )}

        {/* Google Sign In */}
        {mode !== "reset" && (
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-4"
          >
            <span className="font-medium text-gray-700">
              Continue with Google
            </span>
          </button>
        )}

        {mode !== "reset" && (
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-400">or</span>
            </div>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-500 outline-none"
              placeholder="you@example.com"
            />
          </div>

          {mode !== "reset" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-nature-500 to-nature-600 text-white font-semibold rounded-lg disabled:opacity-50"
          >
            {loading
              ? "Loading..."
              : mode === "signin"
                ? "Sign In"
                : mode === "signup"
                  ? "Create Account"
                  : "Send Reset Email"}
          </button>
        </form>

        {/* Mode switching */}
        <div className="mt-6 text-center text-sm">
          {mode === "signin" && (
            <>
              <button
                onClick={() => setMode("reset")}
                className="text-nature-600 hover:underline"
              >
                Forgot password?
              </button>
              <p className="mt-2 text-gray-500">
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-nature-600 font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
            </>
          )}

          {mode === "signup" && (
            <p className="text-gray-500">
              Already have an account?{" "}
              <button
                onClick={() => setMode("signin")}
                className="text-nature-600 font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          )}

          {mode === "reset" && (
            <button
              onClick={() => {
                setMode("signin");
                setResetSent(false);
              }}
              className="text-nature-600 hover:underline"
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
