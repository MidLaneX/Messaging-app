import React, { useState } from 'react';
import { users, User } from '../data/users';

interface LoginProps {
  onUserSelect: (userId: string) => void;
}

const Login: React.FC<LoginProps> = ({ onUserSelect }) => {
  const [selectedUser, setSelectedUser] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      onUserSelect(selectedUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">💬</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">MessagingApp</h1>
          <p className="text-gray-600">Select your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Account
            </label>
            {users.map((user) => (
              <div
                key={user.id}
                className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                  selectedUser === user.id
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => setSelectedUser(user.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{user.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{user.name}</h3>
                    <p className="text-sm text-gray-500">
                      ID: {user.id.substring(0, 8)}...
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                        selectedUser === user.id
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedUser === user.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="user"
                  value={user.id}
                  checked={selectedUser === user.id}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={!selectedUser}
            className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200 ${
              selectedUser
                ? 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {selectedUser ? 'Continue to Chat' : 'Select an Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            This is a demo application for testing purposes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
