interface ColumnHeaderProps {
  columnLetter: string;
  columnIndex: number;
}

const columnColors = [
  'bg-blue-100 text-blue-800 border-blue-300',
  'bg-green-100 text-green-800 border-green-300',
  'bg-yellow-100 text-yellow-800 border-yellow-300',
  'bg-purple-100 text-purple-800 border-purple-300',
  'bg-pink-100 text-pink-800 border-pink-300',
  'bg-indigo-100 text-indigo-800 border-indigo-300',
];

export default function ColumnHeader({ columnLetter, columnIndex }: ColumnHeaderProps) {
  const colorClass = columnColors[columnIndex % columnColors.length];
  
  return (
    <div className={`min-w-[120px] h-8 border font-bold text-sm flex items-center justify-center select-none hover:opacity-80 transition-colors ${colorClass}`}>
      {columnLetter}
    </div>
  );
}
