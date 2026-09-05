import React from 'react';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  quickAmounts?: number[];
  placeholder?: string;
  autoFocus?: boolean;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  quickAmounts = [50, 100, 150, 200, 500],
  placeholder = '0',
  autoFocus = false,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and one dot
    const val = e.target.value.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return; // max 2 decimal places
    onChange(val);
  };

  const handleQuickAdd = (amount: number) => {
    const current = parseFloat(value) || 0;
    onChange((current + amount).toString());
  };

  return (
    <div className="w-full space-y-3">
      {/* Big Display Input */}
      <div className="relative flex items-center justify-center bg-gradient-to-b from-pookie-blush/80 to-white border-2 border-pookie-soft focus-within:border-pookie-primary focus-within:ring-4 focus-within:ring-pookie-soft/50 rounded-3xl p-4 shadow-pookie-inner transition-all">
        <span className="text-3xl sm:text-4xl font-black text-pookie-dark select-none mr-2 font-display">
          ₹
        </span>
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full max-w-[200px] text-3xl sm:text-4xl font-black text-pookie-text bg-transparent text-center focus:outline-none placeholder-pookie-muted/40 font-mono tracking-tight"
          aria-label="Amount in Rupees"
        />
      </div>

      {/* Quick Add Buttons */}
      {quickAmounts && quickAmounts.length > 0 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleQuickAdd(amt)}
              className="text-xs font-bold text-pookie-dark bg-white hover:bg-pookie-blush border border-pookie-soft rounded-xl px-3 py-1.5 shadow-sm active:scale-95 transition-all"
            >
              +₹{amt}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs font-bold text-pookie-muted hover:text-rose-500 bg-white hover:bg-rose-50 border border-pookie-soft rounded-xl px-2.5 py-1.5 shadow-sm active:scale-95 transition-all"
            title="Clear amount"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

