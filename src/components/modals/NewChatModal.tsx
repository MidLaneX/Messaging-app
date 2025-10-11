import React, { useState, useEffect } from "react";
import {
  conversationService,
  StartChatResponse,
} from "../../services/conversationService";
import { CollabUserProfile } from "../../services/userService";
import { ConversationItem } from "../../services/conversationPersistence";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (email: string) => void;
  onChatStarted?: (
    conversation: ConversationItem,
    user: CollabUserProfile
  ) => void;
  currentUserId: string;
}

const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onChatStarted,
  currentUserId,
}) => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<CollabUserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load suggestions when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSuggestions();
    }
  }, [isOpen]);

  // Search users as user types (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (email.trim() && email.includes("@")) {
        searchUsers(email.trim());
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [email]);

  if (!isOpen) return null;

  const loadSuggestions = async () => {
    try {
      const suggestionList = await conversationService.getUserSuggestions(
        currentUserId
      );
      setSuggestions(suggestionList);
    } catch (error) {
      console.error("Error loading suggestions:", error);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const users = await conversationService.searchUsers(query);
      // Filter out current user
      const filteredUsers = users.filter((user) => user.id !== currentUserId);
      setSearchResults(filteredUsers);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result: StartChatResponse =
        await conversationService.startChatByEmail(email, currentUserId);

      if (result.success && result.conversation && result.user) {
        // Notify parent components
        if (onChatStarted) {
          onChatStarted(result.conversation, result.user);
        }

        if (onSubmit) {
          onSubmit(email);
        }

        // Reset form and close modal
        setEmail("");
        setSearchResults([]);
        onClose();

        console.log("Chat started successfully:", result.message);
      } else {
        setErrors({ email: result.message || "Failed to start chat" });
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      setErrors({ email: "Failed to create chat. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserSelect = (selectedUser: CollabUserProfile) => {
    setEmail(selectedUser.email || "");
    setSearchResults([]);
  };

  const handleSuggestionSelect = (suggestionEmail: string) => {
    setEmail(suggestionEmail);
    setSearchResults([]);
  };

  const handleClose = () => {
    setEmail("");
    setErrors({});
    setSearchResults([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-green-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Start New Chat</h3>
                <p className="text-emerald-100 text-sm">
                  Find and connect with contacts
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    errors.email
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                  }`}
                  placeholder="Enter email address..."
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.email}
                </p>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-3 border border-gray-200 rounded-lg bg-gray-50 max-h-40 overflow-y-auto">
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      Search Results
                    </p>
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleUserSelect(user)}
                        className="w-full flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors text-left"
                        disabled={isSubmitting}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                          {user.profilePictureUrl ? (
                            <img
                              src={user.profilePictureUrl}
                              alt={user.displayName || user.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-sm font-medium">
                              {(user.displayName || user.username)
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.displayName || user.username}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              user.isOnline ? "bg-green-500" : "bg-gray-400"
                            }`}
                          ></div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading indicator for search */}
              {isSearching && (
                <div className="mt-3 flex items-center justify-center p-4">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                    <span className="text-sm text-gray-600">Searching...</span>
                  </div>
                </div>
              )}
            </div>

     

            {/* Loading indicator for search */}
            {isSearching && (
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent mr-3"></div>
                  <span className="text-sm text-gray-600">
                    Searching users...
                  </span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isSubmitting || !email.trim()}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Starting Chat...</span>
                  </div>
                ) : (
                  "Start Chat"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
