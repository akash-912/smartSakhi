import React, { useMemo } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip'; // Hover tooltips ke liye
import 'react-calendar-heatmap/dist/styles.css';
import 'react-tooltip/dist/react-tooltip.css'; 

const StudyHeatmap = ({ data }) => {
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - 180);

  // --- AUTOMATIC STREAK & ACTIVE DAYS CALCULATION ---
  const { activeDays, currentStreak } = useMemo(() => {
    if (!data || data.length === 0) return { activeDays: 0, currentStreak: 0 };

    const active = data.filter(d => d.count > 0).length;

    // Dates ko descending order (newest first) mein sort karte hain
    const sortedDates = [...data]
      .filter(d => d.count > 0)
      .map(d => new Date(d.date))
      .sort((a, b) => b - a);

    if (sortedDates.length === 0) return { activeDays: 0, currentStreak: 0 };

    let streak = 0;
    let checkDate = new Date(); // Aaj ki date
    checkDate.setHours(0,0,0,0);

    let highestDate = new Date(sortedDates[0]);
    highestDate.setHours(0,0,0,0);

    // Agar last activity aaj ya kal nahi thi, toh streak toot chuki hai (0)
    const diffToToday = Math.round((checkDate - highestDate) / (1000 * 60 * 60 * 24));
    if (diffToToday > 1) {
       return { activeDays: active, currentStreak: 0 };
    }

    // Piche jaate hue consecutive days count karo
    streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
       const prev = new Date(sortedDates[i-1]);
       prev.setHours(0,0,0,0);
       const curr = new Date(sortedDates[i]);
       curr.setHours(0,0,0,0);

       const diff = Math.round((prev - curr) / (1000 * 60 * 60 * 24));
       if (diff === 1) {
           streak++;
       } else if (diff === 0) {
           continue; // Ek hi din mein do entry ho toh ignore
       } else {
           break; // Streak toot gayi
       }
    }

    return { activeDays: active, currentStreak: streak };
  }, [data]);

  return (
    <div className="p-6 border border-gray-800 rounded-xl bg-gray-950 max-w-3xl mx-auto shadow-lg relative">
      
      {/* HEADER: LEETCODE STYLE STATS */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
          Consistency
        </h3>
        <div className="flex gap-6 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-gray-500">Active Days</span>
            <span className="text-lg font-bold text-gray-200">{activeDays}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-gray-500">Current Streak</span>
            <span className="text-lg font-bold text-teal-500 flex items-center gap-1">
              {currentStreak} <span className="text-sm">🔥</span>
            </span>
          </div>
        </div>
      </div>
      
      {/* HEATMAP GRAPH */}
      <div className="w-full">
        <CalendarHeatmap
          startDate={startDate}
          endDate={today}
          values={data || []}
          gutterSize={2}
          classForValue={(value) => {
            if (!value || value.count === 0) return 'color-empty';
            if (value.count === 1) return 'color-scale-1';
            if (value.count === 2) return 'color-scale-2';
            if (value.count >= 3 && value.count <= 4) return 'color-scale-3';
            return 'color-scale-4';
          }}
          tooltipDataAttrs={(value) => {
            // Yahan hum Tooltip ke liye data set kar rahe hain
            const dateStr = value && value.date 
              ? new Date(value.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
              : 'No Activity';
            const countStr = value && value.count ? `${value.count} tasks` : '0 tasks';
            
            return {
              'data-tooltip-id': 'heatmap-tooltip',
              'data-tooltip-html': `<div class="text-center"><span class="font-bold text-white">${countStr}</span><br/><span class="text-xs text-gray-400">${dateStr}</span></div>`,
            };
          }}
          showWeekdayLabels={true}
        />
      </div>

      {/* LEGEND */}
      <div className="flex items-center justify-end gap-2 mt-5 text-xs text-gray-500">
        <span>Less</span>
        <div className="w-2.5 h-2.5 bg-[#1f2937] rounded-[1px]"></div>
        <div className="w-2.5 h-2.5 bg-[#166534] rounded-[1px]"></div>
        <div className="w-2.5 h-2.5 bg-[#15803d] rounded-[1px]"></div>
        <div className="w-2.5 h-2.5 bg-[#22c55e] rounded-[1px]"></div>
        <div className="w-2.5 h-2.5 bg-[#4ade80] rounded-[1px]"></div>
        <span>More</span>
      </div>

      {/* TOOLTIP COMPONENT (Magic happens here) */}
      <Tooltip 
        id="heatmap-tooltip" 
        className="z-50 !bg-gray-800 !border !border-gray-700 !rounded-md shadow-xl"
        style={{ padding: '8px 12px' }}
      />
    </div>
  );
};

export default StudyHeatmap;