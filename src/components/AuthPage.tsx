import React, { useState } from 'react';
import { authService } from '../services/authService';
import { userMappingService } from '../services/userMappingService';
import GoogleLoginButton from "./GoogleLoginButton";
import FacebookLoginButton from "./FacebookLoginButton";

interface AuthPageProps {
  onAuthSuccess: (
    mainUserId: number,
    collabUserId: string,
    userName: string
  ) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSocialLogin = async (
    provider: "google" | "facebook",
    accessToken: string,
    email: string,
    name: string,
    profilePicture?: string
  ) => {
    setError("");
    setLoading(true);

    try {
      console.log(`🔐 Processing ${provider} login...`);

      // Login with social provider
      const authResponse = await authService.socialLogin({
        provider,
        accessToken,
        email,
        name,
        profilePicture,
      });

      // Save access token
      userMappingService.saveAccessToken(authResponse.access_token);

      // Fetch collab service user ID using main app user ID
      const collabUser = await userMappingService.getCollabUserByMainUserId(
        authResponse.user_id,
        authResponse.access_token
      );

      console.log("✅ Social authentication successful!");
      console.log("Provider:", provider);
      console.log("Main App User ID:", authResponse.user_id);
      console.log("Collab Service User ID:", collabUser.id);
      console.log("User Name:", name);

      // Call success callback with both IDs
      onAuthSuccess(authResponse.user_id, collabUser.id, name);
    } catch (err: any) {
      console.error("❌ Social authentication error:", err);

      let errorMessage =
        err.message || `${provider} authentication failed. Please try again.`;

      if (err.message && err.message.includes("404")) {
        errorMessage =
          "⚠️ Backend server not found. Please ensure:\n" +
          "1. Main app backend is running on http://localhost:8080\n" +
          "2. API Gateway is routing /api/collab to collaboration service\n" +
          "3. Check the console for detailed error logs";
      } else if (err.message && err.message.includes("User not found")) {
        errorMessage =
          `⚠️ Account not found in collaboration service.\n` +
          `Please contact administrator to set up your account.`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let authResponse;
      
      if (isLogin) {
        // Login
        authResponse = await authService.login({ email, password });
      } else {
        // Register
        authResponse = await authService.register({
          email,
          password,
          phone: phone || undefined,
        });
      }

      // Save access token
      userMappingService.saveAccessToken(authResponse.access_token);

      // Get user profile to fetch name
      const userProfile = await authService.getUserProfile(
        authResponse.user_id,
        authResponse.access_token
      );

      const userName = `${userProfile.first_name} ${userProfile.last_name}`;

      // Fetch collab service user ID using main app user ID
      const collabUser = await userMappingService.getCollabUserByMainUserId(
        authResponse.user_id,
        authResponse.access_token
      );

      console.log("✅ Authentication successful!");
      console.log("Main App User ID:", authResponse.user_id);
      console.log("Collab Service User ID:", collabUser.id);
      console.log("User Name:", userName);

      // Call success callback with both IDs
      onAuthSuccess(authResponse.user_id, collabUser.id, userName);
    } catch (err: any) {
      console.error("❌ Authentication error:", err);

      // Provide more helpful error messages
      let errorMessage =
        err.message || "Authentication failed. Please try again.";

      if (err.message && err.message.includes("404")) {
        errorMessage =
          "⚠️ Backend server not found. Please ensure:\n" +
          "1. Main app backend is running on http://localhost:8080\n" +
          "2. API Gateway is routing /api/collab to collaboration service\n" +
          "3. Check the console for detailed error logs";
      } else if (err.message && err.message.includes("Network")) {
        errorMessage =
          "⚠️ Network error. Please check:\n" +
          "1. Your internet connection\n" +
          "2. Backend services are running\n" +
          "3. CORS is properly configured";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">💬</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Collaboration Messaging
          </h1>
          <p className="text-gray-600">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
              disabled={loading}
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                placeholder="+1234567890"
                disabled={loading}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {isLogin ? "Signing in..." : "Creating account..."}
              </span>
            ) : (
              <span>{isLogin ? "Sign In" : "Create Account"}</span>
            )}
          </button>
        </form>

        {/* Social Login Divider - Only show on login */}
        {isLogin && (
          <>
            <div className="mt-6 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">
                Or continue with
              </span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Social Login Buttons - Always show */}
            <div className="mt-6 space-y-3">
              {/* Google Login - Show with config status */}
              <GoogleLoginButton
                onSuccess={(accessToken, email, name, profilePicture) =>
                  handleSocialLogin(
                    "google",
                    accessToken,
                    email,
                    name,
                    profilePicture
                  )
                }
                onError={(error) => setError(error)}
                disabled={loading}
              />

              {/* Facebook Login - Show with config status */}
              <FacebookLoginButton
                onSuccess={(accessToken, email, name, profilePicture) =>
                  handleSocialLogin(
                    "facebook",
                    accessToken,
                    email,
                    name,
                    profilePicture
                  )
                }
                onError={(error) => setError(error)}
                disabled={loading}
              />

              {/* Show configuration status */}
              {(!process.env.REACT_APP_GOOGLE_CLIENT_ID ||
                !process.env.REACT_APP_FACEBOOK_APP_ID) && (
                <div className="text-center text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  {!process.env.REACT_APP_GOOGLE_CLIENT_ID &&
                  !process.env.REACT_APP_FACEBOOK_APP_ID ? (
                    <>
                      ⚠️ Social login not configured. See{" "}
                      <code className="text-xs">OAUTH_FIX_QUICK.md</code> to
                      enable.
                    </>
                  ) : !process.env.REACT_APP_GOOGLE_CLIENT_ID ? (
                    <>⚠️ Google login not configured</>
                  ) : (
                    <>⚠️ Facebook login not configured</>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setEmail("");
              setPassword("");
              setPhone("");
            }}
            className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            disabled={loading}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
