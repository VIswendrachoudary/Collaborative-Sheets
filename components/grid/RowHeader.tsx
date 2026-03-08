interface RowHeaderProps {
  rowNumber: number;
}

const rowColors = [
  'bg-red-100 text-red-800 border-red-300',
  'bg-orange-100 text-orange-800 border-orange-300',
  'bg-amber-100 text-amber-800 border-amber-300',
  'bg-lime-100 text-lime-800 border-lime-300',
  'bg-teal-100 text-teal-800 border-teal-300',
  'bg-cyan-100 text-cyan-800 border-cyan-300',
];

export default function RowHeader({ rowNumber }: RowHeaderProps) {
  const colorClass = rowColors[rowNumber % rowColors.length];
  
  return (
    <div className={`w-12 h-8 border font-bold text-sm flex items-center justify-center select-none hover:opacity-80 transition-colors ${colorClass}`}>
      {rowNumber}
    </div>
  );
}
