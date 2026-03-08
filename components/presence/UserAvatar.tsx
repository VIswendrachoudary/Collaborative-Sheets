import { Presence } from '@/types/spreadsheet';

interface UserAvatarProps {
  user: Presence;
}

export default function UserAvatar({ user }: UserAvatarProps) {
  // Defensive programming - ensure user exists and has required properties
  if (!user) {
    return null;
  }

  const getInitials = (name?: string) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return '?';
    }
    return name.charAt(0).toUpperCase();
  };

  const userName = user.name || 'Unknown User';
  const userColor = user.color || '#6b7280';

  return (
    <div className="flex items-center space-x-2">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
        style={{ backgroundColor: userColor }}
        title={userName}
      >
        {getInitials(userName)}
      </div>
      <span className="text-sm text-gray-700">{userName}</span>
    </div>
  );
}
