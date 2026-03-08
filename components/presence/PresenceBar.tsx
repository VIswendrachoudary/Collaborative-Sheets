import { Presence } from '@/types/spreadsheet';
import UserAvatar from './UserAvatar';

interface PresenceBarProps {
  users: Presence[];
}

export default function PresenceBar({ users }: PresenceBarProps) {
  if (!users || users.length === 0) {
    return null;
  }

  // Filter out any invalid users and render UserAvatar components
  const validUsers = users
    .filter(user => user && user.userId && user.name)
    .map((user) => (
      <UserAvatar key={user.userId} user={user} />
    ));

  if (validUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border-t border-gray-200">
      <span className="text-sm text-gray-600">Active Users:</span>
      <div className="flex items-center space-x-2">
        {validUsers}
      </div>
    </div>
  );
}
