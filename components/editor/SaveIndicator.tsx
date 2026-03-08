import { SaveStatus } from '@/types/spreadsheet';

interface SaveIndicatorProps {
  status: SaveStatus;
}

export default function SaveIndicator({ status }: SaveIndicatorProps) {
  const getStatusDisplay = () => {
    switch (status.status) {
      case 'saving':
        return {
          text: 'Saving...',
          color: 'text-yellow-600',
          icon: (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ),
        };
      case 'saved':
        return {
          text: 'Saved',
          color: 'text-green-600',
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
        };
      case 'offline':
        return {
          text: 'Offline',
          color: 'text-gray-500',
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
            </svg>
          ),
        };
    }
  };

  const { text, color, icon } = getStatusDisplay();

  return (
    <div className={`flex items-center space-x-1 text-sm ${color}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
}
