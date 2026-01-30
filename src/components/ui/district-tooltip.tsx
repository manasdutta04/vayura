import React from 'react';

interface DistrictTooltipProps {
  name: string;
  state: string;
  oxygenSupply: number;
  oxygenDemand: number;
}

const DistrictTooltip = ({ name, state, oxygenSupply, oxygenDemand }: DistrictTooltipProps) => {
  const ratio = oxygenSupply / oxygenDemand;
  const deficitPercent = Math.max(0, (1 - ratio) * 100);
  
  let status = 'Surplus';
  let color = 'text-emerald-600';
  
  if (ratio < 1.0) {
    status = `${deficitPercent.toFixed(1)}% Deficit`;
    if (ratio >= 0.5) color = 'text-amber-500';
    else if (ratio >= 0.25) color = 'text-orange-500';
    else color = 'text-red-600';
  }

  return (
    <div className="p-1 min-w-[150px]">
      <div className="font-bold text-sm text-slate-900">{name}</div>
      <div className="text-xs text-slate-500 mb-2">{state}</div>
      
      <div className="space-y-1 border-t pt-2 border-slate-100">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Supply:</span>
          <span className="font-medium text-slate-700">{oxygenSupply.toLocaleString()} kg/day</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Demand:</span>
          <span className="font-medium text-slate-700">{oxygenDemand.toLocaleString()} kg/day</span>
        </div>
        <div className="flex justify-between text-xs font-semibold mt-1">
          <span className="text-slate-600">Status:</span>
          <span className={color}>{status}</span>
        </div>
      </div>
    </div>
  );
};

export default DistrictTooltip;
