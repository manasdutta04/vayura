import React from 'react';

const MapLegend = () => {
  const [isOpen, setIsOpen] = React.useState(true);

  const categories = [
    { color: '#10b981', label: 'Oxygen Surplus', description: 'Supply > Demand' },
    { color: '#fbbf24', label: 'Moderate Deficit', description: '0-50% Deficit' },
    { color: '#f97316', label: 'High Deficit', description: '50-75% Deficit' },
    { color: '#ef4444', label: 'Critical Deficit', description: '>75% Deficit' },
  ];

  return (
    <div className={`absolute bottom-6 right-6 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 transition-all duration-300 ${isOpen ? 'p-4 w-[200px]' : 'p-2 w-auto'}`}>
      <div className="flex items-center justify-between mb-2">
        {isOpen && <h4 className="text-sm font-semibold text-slate-800">Oxygen Status</h4>}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-slate-100 rounded-md transition-colors"
          title={isOpen ? "Collapse Legend" : "Expand Legend"}
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v12m-5-5 5 5 5-5M5 3h14"/></svg>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.label} className="flex items-start gap-3">
              <div 
                className="w-4 h-4 rounded-sm mt-0.5 shrink-0" 
                style={{ backgroundColor: category.color }}
              />
              <div>
                <div className="text-xs font-medium text-slate-700">{category.label}</div>
                <div className="text-[10px] text-slate-500">{category.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapLegend;
