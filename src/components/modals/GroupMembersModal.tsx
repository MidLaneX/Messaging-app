import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { APP_CONFIG } from '../../constants';

interface GroupMember {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

interface GroupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

const GroupMembersModal: React.FC<GroupMembersModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
}) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && groupId) {
      fetchGroupMembers();
    }
  }, [isOpen, groupId]);

  const fetchGroupMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching members for group: ${groupId}`);
      const response = await axios.get(
        `${APP_CONFIG.API_BASE_URL}/api/groups/${groupId}/members`
      );
      console.log('Group members response:', response.data);
      
      // Handle different response formats
      const membersData = Array.isArray(response.data) 
        ? response.data 
        : response.data.content || response.data.members || [];
      
      console.log('Processed members data:', membersData);
      console.log('Sample member:', membersData[0]);
      
      // Validate and sanitize member data
      const validMembers = membersData.map((member: any) => ({
        id: member.id || `unknown-${Math.random()}`,
        username: member.username || member.displayName || member.email || 'Unknown User',
        email: member.email,
        avatarUrl: member.avatarUrl || member.profilePictureUrl,
        isOnline: member.isOnline || member.status === 'online',
      }));
      
      console.log('Valid members:', validMembers);
      setMembers(validMembers);
    } catch (err: any) {
      console.error('Failed to fetch group members:', err);
      setError(err.response?.data?.message || 'Failed to load group members');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{groupName}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchGroupMembers}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No members found
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => {
                // Safely get display name
                const displayName = member.username || member.email || 'Unknown User';
                const firstChar = displayName.charAt(0).toUpperCase();
                
                return (
                  <div
                    key={member.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-md">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={displayName}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.textContent = firstChar;
                              }
                            }}
                          />
                        ) : (
                          firstChar
                        )}
                      </div>
                      {member.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {displayName}
                      </p>
                      {member.email && member.username && (
                        <p className="text-sm text-gray-500 truncate">
                          {member.email}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    {member.isOnline && (
                      <span className="text-xs text-emerald-600 font-medium">
                        Online
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal;
