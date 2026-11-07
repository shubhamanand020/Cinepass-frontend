import React, { useMemo } from 'react';

export const SeatMap = ({
  seats = [],
  selectedSeats = [],
  heldSeats = [],
  onToggleSeat,
  isHoldActive = false,
}) => {
  // Group seats by row (e.g. A, B, C, ...)
  const { rows, rowKeys } = useMemo(() => {
    const rowMap = new Map();
    const premiumRows = new Set();

    seats.forEach((seat) => {
      // Extract row letter (all characters except digits at end)
      const match = seat.seatNumber.match(/^([A-Z]+)(\d+)$/);
      const rowKey = match ? match[1] : seat.seatNumber[0];
      const colNum = match ? parseInt(match[2], 10) : 0;

      if (!rowMap.has(rowKey)) {
        rowMap.set(rowKey, []);
      }

      if (seat.seatType === 'PREMIUM') {
        premiumRows.add(rowKey);
      }

      rowMap.get(rowKey).push({ ...seat, colNum });
    });

    // Sort rows alphabetically
    const sortedRowKeys = Array.from(rowMap.keys()).sort();

    // Sort seats in each row by column number
    sortedRowKeys.forEach((key) => {
      rowMap.get(key).sort((a, b) => a.colNum - b.colNum);
    });

    return {
      rows: rowMap,
      rowKeys: sortedRowKeys,
      premiumRowsList: Array.from(premiumRows),
    };
  }, [seats]);

  return (
    <div className="w-full flex flex-col items-center space-y-8 select-none">
      {/* Seat State Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-4 py-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md border border-emerald-500/50 bg-slate-950 flex items-center justify-center text-[10px] text-emerald-400 font-bold" />
          <span>Standard Available</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md border border-purple-500/50 bg-slate-950 flex items-center justify-center text-[10px] text-purple-400 font-bold" />
          <span>Premium Available</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-sky-500 text-white shadow-md shadow-sky-500/30 flex items-center justify-center text-[10px] font-bold" />
          <span>Selected</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 flex items-center justify-center text-[10px] font-bold" />
          <span>Held by You</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-slate-800/80 border border-slate-700/50 text-slate-600 flex items-center justify-center text-[10px] font-bold cursor-not-allowed" />
          <span>Booked / Occupied</span>
        </div>
      </div>

      {/* Grid of Seats */}
      <div className="w-full overflow-x-auto pb-4 flex justify-center">
        <div className="min-w-fit space-y-3 px-4">
          {rowKeys.map((rowKey) => {
            const rowSeats = rows.get(rowKey) || [];
            const midIndex = Math.ceil(rowSeats.length / 2);

            return (
              <div key={rowKey} className="flex items-center justify-center gap-3">
                {/* Left Row Indicator */}
                <div className="w-6 text-center text-xs font-bold text-slate-400 uppercase font-mono">
                  {rowKey}
                </div>

                {/* Seat buttons with center aisle spacing */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {rowSeats.map((seat, idx) => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    const isHeldByMe = heldSeats.includes(seat.seatNumber);
                    const isBooked =
                      seat.status === 'CONFIRMED' || (seat.status === 'HELD' && !isHeldByMe);
                    const isPremium = seat.seatType === 'PREMIUM';

                    let seatStyle =
                      'bg-slate-950 hover:bg-slate-900 border-emerald-500/50 text-emerald-300 hover:border-emerald-400';

                    if (isPremium) {
                      seatStyle =
                        'bg-slate-950 hover:bg-slate-900 border-purple-500/50 text-purple-300 hover:border-purple-400';
                    }

                    if (isSelected) {
                      seatStyle =
                        'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/40 scale-105';
                    } else if (isHeldByMe) {
                      seatStyle =
                        'bg-amber-500 border-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/40 animate-pulse';
                    } else if (isBooked) {
                      seatStyle =
                        'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-50';
                    }

                    return (
                      <React.Fragment key={seat.seatNumber}>
                        {/* Aisle Spacer in the middle */}
                        {idx === midIndex && rowSeats.length > 6 && (
                          <div className="w-4 sm:w-8" aria-hidden="true" />
                        )}

                        <button
                          type="button"
                          disabled={isBooked || (isHoldActive && !isHeldByMe)}
                          onClick={() => onToggleSeat(seat)}
                          title={`${seat.seatNumber} • ${seat.seatType} • ₹${seat.price} (${seat.status})`}
                          className={`relative w-7 h-7 sm:w-9 sm:h-9 rounded-lg border text-[11px] font-bold flex items-center justify-center transition-all duration-200 active:scale-95 disabled:active:scale-100 ${seatStyle}`}
                        >
                          {/* Seat column number */}
                          <span>{seat.colNum || seat.seatNumber}</span>

                          {/* Tiny star for premium tier */}
                          {isPremium && !isSelected && !isHeldByMe && !isBooked && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-500 text-[8px] flex items-center justify-center text-white">
                              ★
                            </span>
                          )}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Right Row Indicator */}
                <div className="w-6 text-center text-xs font-bold text-slate-400 uppercase font-mono">
                  {rowKey}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
