import React, { useState, useMemo } from 'react';
import { useCivic } from '../../context/CivicContext';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

interface DataPoint {
  label: string;
  subLabel?: string;
  raised: number;
  solved: number;
}

export const MonthlyResolutionGraph: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { complaints } = useCivic();

  // Mode: 'monthly_breakdown' (weeks/days of a month) or 'annual_months' (Jan - Dec)
  const [timeframe, setTimeframe] = useState<'month_weeks' | 'month_days' | 'annual_months'>('month_weeks');
  const [selectedMonth, setSelectedMonth] = useState<string>('October 2026');
  const [chartType, setChartType] = useState<'bars' | 'lines'>('bars');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Dynamic calculations based on live complaint store
  const liveResolvedCount = complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length;
  const liveTotalCount = complaints.length;

  // Monthly dataset for October 2026 (current month) broken into weeks
  const octoberWeeksData: DataPoint[] = useMemo(() => {
    // Distribute base counts plus live complaints
    return [
      { label: 'Week 1', subLabel: 'Oct 1 - Oct 7', raised: 84, solved: 78 },
      { label: 'Week 2', subLabel: 'Oct 8 - Oct 14', raised: 96, solved: 92 },
      { label: 'Week 3', subLabel: 'Oct 15 - Oct 21', raised: 112, solved: 104 },
      {
        label: 'Week 4',
        subLabel: 'Oct 22 - Oct 28',
        raised: 75 + (liveTotalCount - 20 > 0 ? liveTotalCount - 20 : 0),
        solved: 71 + (liveResolvedCount - 4 > 0 ? liveResolvedCount - 4 : 0),
      },
      { label: 'Week 5', subLabel: 'Oct 29 - Oct 31', raised: 45, solved: 43 },
    ];
  }, [liveTotalCount, liveResolvedCount]);

  // Daily snapshot across October (samples every 3 days)
  const octoberDaysData: DataPoint[] = useMemo(() => {
    return [
      { label: 'Oct 02', raised: 12, solved: 11 },
      { label: 'Oct 05', raised: 16, solved: 14 },
      { label: 'Oct 08', raised: 14, solved: 15 },
      { label: 'Oct 11', raised: 19, solved: 18 },
      { label: 'Oct 14', raised: 22, solved: 20 },
      { label: 'Oct 17', raised: 18, solved: 17 },
      { label: 'Oct 20', raised: 25, solved: 23 },
      { label: 'Oct 23', raised: 21, solved: 22 },
      { label: 'Oct 26', raised: 17, solved: 16 },
      { label: 'Oct 29', raised: 15, solved: 14 },
    ];
  }, []);

  // 12-Month Year view (Jan - Dec 2026)
  const annualMonthsData: DataPoint[] = useMemo(() => {
    return [
      { label: 'Jan', subLabel: 'January', raised: 210, solved: 195 },
      { label: 'Feb', subLabel: 'February', raised: 230, solved: 220 },
      { label: 'Mar', subLabel: 'March', raised: 285, solved: 268 },
      { label: 'Apr', subLabel: 'April', raised: 260, solved: 252 },
      { label: 'May', subLabel: 'May', raised: 310, solved: 295 },
      { label: 'Jun', subLabel: 'June', raised: 345, solved: 330 },
      { label: 'Jul', subLabel: 'July', raised: 320, solved: 312 },
      { label: 'Aug', subLabel: 'August', raised: 360, solved: 348 },
      { label: 'Sep', subLabel: 'September', raised: 390, solved: 375 },
      {
        label: 'Oct',
        subLabel: 'October (Current)',
        raised: 412 + (liveTotalCount - 20 > 0 ? liveTotalCount - 20 : 0),
        solved: 388 + (liveResolvedCount - 4 > 0 ? liveResolvedCount - 4 : 0),
      },
      { label: 'Nov', subLabel: 'November (Est.)', raised: 370, solved: 360 },
      { label: 'Dec', subLabel: 'December (Est.)', raised: 340, solved: 335 },
    ];
  }, [liveTotalCount, liveResolvedCount]);

  // Current active data set
  const currentData: DataPoint[] = useMemo(() => {
    if (timeframe === 'annual_months') return annualMonthsData;
    if (timeframe === 'month_days') return octoberDaysData;
    return octoberWeeksData;
  }, [timeframe, annualMonthsData, octoberDaysData, octoberWeeksData]);

  // Aggregate stats
  const totalRaised = currentData.reduce((acc, curr) => acc + curr.raised, 0);
  const totalSolved = currentData.reduce((acc, curr) => acc + curr.solved, 0);
  const resolutionRate = totalRaised > 0 ? Math.round((totalSolved / totalRaised) * 100) : 0;
  const netPending = Math.max(0, totalRaised - totalSolved);

  // SVG Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(...currentData.map((d) => Math.max(d.raised, d.solved, 10))) * 1.15;

  const getX = (index: number) => {
    return paddingLeft + (index / (currentData.length - 1 || 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / maxVal) * chartHeight;
  };

  // Line paths
  const raisedPoints = currentData.map((d, i) => `${getX(i)},${getY(d.raised)}`).join(' ');
  const solvedPoints = currentData.map((d, i) => `${getX(i)},${getY(d.solved)}`).join(' ');

  const raisedAreaPath = `M ${getX(0)},${paddingTop + chartHeight} L ${currentData
    .map((d, i) => `${getX(i)},${getY(d.raised)}`)
    .join(' L ')} L ${getX(currentData.length - 1)},${paddingTop + chartHeight} Z`;

  const solvedAreaPath = `M ${getX(0)},${paddingTop + chartHeight} L ${currentData
    .map((d, i) => `${getX(i)},${getY(d.solved)}`)
    .join(' L ')} L ${getX(currentData.length - 1)},${paddingTop + chartHeight} Z`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Chart Title and Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                Problems Raised vs. Problems Solved
              </h3>
              <p className="text-xs text-slate-500">
                Single unified view tracking municipal problem intake versus verified repair completions.
              </p>
            </div>
          </div>
        </div>

        {/* View Controls & Selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Timeframe selector */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl font-semibold">
            <button
              onClick={() => setTimeframe('month_weeks')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === 'month_weeks' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Weeks in Month
            </button>
            <button
              onClick={() => setTimeframe('month_days')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === 'month_days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daily Timeline
            </button>
            <button
              onClick={() => setTimeframe('annual_months')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === 'annual_months'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              12-Month Year Trend
            </button>
          </div>

          {/* Chart format: Grouped Bars vs Smooth Lines */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl font-semibold">
            <button
              onClick={() => setChartType('bars')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                chartType === 'bars' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grouped Comparative Bars"
            >
              Bars
            </button>
            <button
              onClick={() => setChartType('lines')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                chartType === 'lines' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dual Trend Curves"
            >
              Trends
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Highlights for the displayed period */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
          <div className="flex items-center justify-between text-amber-800 font-medium mb-1">
            <span>Problems Raised</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 font-mono">{totalRaised}</div>
          <p className="text-[10px] text-amber-600/90 mt-0.5">Citizen-reported tickets</p>
        </div>

        <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80">
          <div className="flex items-center justify-between text-teal-800 font-medium mb-1">
            <span>Problems Solved</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-teal-700 font-mono">{totalSolved}</div>
          <p className="text-[10px] text-teal-600/90 mt-0.5">Repaired & verified safe</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-600 font-medium mb-1">
            <span>Clearance Efficiency</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{resolutionRate}%</div>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">+4.2% above municipal target</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-600 font-medium mb-1">
            <span>Avg. Triage Velocity</span>
            <Clock className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">2.4 Days</div>
          <p className="text-[10px] text-slate-500 mt-0.5">SLA: under 72h</p>
        </div>
      </div>

      {/* Main Single SVG Graph */}
      <div className="relative border border-slate-100 rounded-xl bg-slate-50/50 p-2 sm:p-4 overflow-hidden">
        {/* Interactive Hover Tooltip Header */}
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-4 text-xs font-semibold">
            {/* Legend Item: Raised */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-amber-500" />
              <span className="text-slate-700 font-bold">Problems Raised (Reported)</span>
            </div>
            {/* Legend Item: Solved */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-teal-500" />
              <span className="text-slate-700 font-bold">Problems Solved (Repaired)</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
            {timeframe === 'annual_months'
              ? 'Year 2026 Monthly Trend'
              : `Month of ${selectedMonth} — Comparative Intake & Clearance`}
          </div>
        </div>

        {/* The SVG Visualization Container */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[620px] select-none"
            style={{ maxHeight: compact ? '220px' : '320px' }}
          >
            <defs>
              {/* Linear Gradients */}
              <linearGradient id="raisedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="solvedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const yVal = paddingTop + chartHeight * (1 - ratio);
              const labelCount = Math.round(maxVal * ratio);
              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={yVal}
                    x2={svgWidth - paddingRight}
                    y2={yVal}
                    stroke="#e2e8f0"
                    strokeDasharray={idx === 0 ? 'none' : '3,3'}
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={yVal + 3}
                    fill="#94a3b8"
                    fontSize="10"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {labelCount}
                  </text>
                </g>
              );
            })}

            {/* MODE 1: GROUPED BARS */}
            {chartType === 'bars' && (
              <g>
                {currentData.map((d, i) => {
                  const slotWidth = chartWidth / currentData.length;
                  const centerX = paddingLeft + i * slotWidth + slotWidth / 2;
                  const barWidth = Math.min(24, Math.max(12, slotWidth * 0.28));

                  const raisedHeight = (d.raised / maxVal) * chartHeight;
                  const solvedHeight = (d.solved / maxVal) * chartHeight;

                  const isHovered = hoveredIndex === i;

                  return (
                    <g
                      key={i}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="cursor-pointer"
                    >
                      {/* Highlight column band on hover */}
                      {isHovered && (
                        <rect
                          x={centerX - slotWidth / 2}
                          y={paddingTop}
                          width={slotWidth}
                          height={chartHeight}
                          fill="#f1f5f9"
                          opacity="0.8"
                          rx="4"
                        />
                      )}

                      {/* Bar 1: Raised (Amber/Orange) */}
                      <rect
                        x={centerX - barWidth - 2}
                        y={paddingTop + chartHeight - raisedHeight}
                        width={barWidth}
                        height={raisedHeight}
                        fill="#f59e0b"
                        rx="4"
                        className="transition-all duration-200"
                        opacity={isHovered ? 1 : 0.9}
                      />

                      {/* Bar 2: Solved (Teal/Emerald) */}
                      <rect
                        x={centerX + 2}
                        y={paddingTop + chartHeight - solvedHeight}
                        width={barWidth}
                        height={solvedHeight}
                        fill="#0d9488"
                        rx="4"
                        className="transition-all duration-200"
                        opacity={isHovered ? 1 : 0.9}
                      />

                      {/* Value labels on top of bars */}
                      <text
                        x={centerX - barWidth / 2 - 2}
                        y={paddingTop + chartHeight - raisedHeight - 5}
                        fill="#b45309"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {d.raised}
                      </text>
                      <text
                        x={centerX + barWidth / 2 + 2}
                        y={paddingTop + chartHeight - solvedHeight - 5}
                        fill="#0f766e"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {d.solved}
                      </text>

                      {/* X-axis Label */}
                      <text
                        x={centerX}
                        y={paddingTop + chartHeight + 16}
                        fill={isHovered ? '#0f172a' : '#64748b'}
                        fontSize="11"
                        fontWeight={isHovered ? 'bold' : 'normal'}
                        textAnchor="middle"
                      >
                        {d.label}
                      </text>
                      {d.subLabel && (
                        <text
                          x={centerX}
                          y={paddingTop + chartHeight + 28}
                          fill="#94a3b8"
                          fontSize="9"
                          textAnchor="middle"
                        >
                          {d.subLabel}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* MODE 2: DUAL TREND CURVES / AREA */}
            {chartType === 'lines' && (
              <g>
                {/* Area fills */}
                <path d={raisedAreaPath} fill="url(#raisedGrad)" />
                <path d={solvedAreaPath} fill="url(#solvedGrad)" />

                {/* Raised Trend Line (Amber) */}
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={raisedPoints}
                />

                {/* Solved Trend Line (Teal) */}
                <polyline
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={solvedPoints}
                />

                {/* Data Points / Circles */}
                {currentData.map((d, i) => {
                  const cx = getX(i);
                  const cyRaised = getY(d.raised);
                  const cySolved = getY(d.solved);
                  const isHovered = hoveredIndex === i;

                  return (
                    <g
                      key={i}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="cursor-pointer"
                    >
                      {/* Vertical guide line on hover */}
                      {isHovered && (
                        <line
                          x1={cx}
                          y1={paddingTop}
                          x2={cx}
                          y2={paddingTop + chartHeight}
                          stroke="#94a3b8"
                          strokeDasharray="2,2"
                          strokeWidth="1.5"
                        />
                      )}

                      {/* Raised Dot */}
                      <circle
                        cx={cx}
                        cy={cyRaised}
                        r={isHovered ? 6 : 4.5}
                        fill="#f59e0b"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      {/* Solved Dot */}
                      <circle
                        cx={cx}
                        cy={cySolved}
                        r={isHovered ? 6 : 4.5}
                        fill="#0d9488"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />

                      {/* X-axis Label */}
                      <text
                        x={cx}
                        y={paddingTop + chartHeight + 16}
                        fill={isHovered ? '#0f172a' : '#64748b'}
                        fontSize="11"
                        fontWeight={isHovered ? 'bold' : 'normal'}
                        textAnchor="middle"
                      >
                        {d.label}
                      </text>
                      {d.subLabel && (
                        <text
                          x={cx}
                          y={paddingTop + chartHeight + 28}
                          fill="#94a3b8"
                          fontSize="9"
                          textAnchor="middle"
                        >
                          {d.subLabel}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            )}
          </svg>
        </div>

        {/* Interactive Hover Card Overlay */}
        {hoveredIndex !== null && currentData[hoveredIndex] && (
          <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs animate-in fade-in duration-100">
            <div>
              <span className="font-bold text-slate-900 block">
                {currentData[hoveredIndex].subLabel || currentData[hoveredIndex].label}
              </span>
              <span className="text-[11px] text-slate-500">Period Performance Snapshot</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600">Raised:</span>
                <strong className="text-amber-700 font-mono text-sm">{currentData[hoveredIndex].raised}</strong>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                <span className="text-slate-600">Solved:</span>
                <strong className="text-teal-700 font-mono text-sm">{currentData[hoveredIndex].solved}</strong>
              </div>

              <div className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                Clearance:{' '}
                {Math.round((currentData[hoveredIndex].solved / (currentData[hoveredIndex].raised || 1)) * 100)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Explanatory takeaway & insights bar */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-800">
            Intake vs. Clearance Diagnostic:
          </p>
          <p className="leading-relaxed">
            During this period, municipal work crews resolved <strong>{totalSolved}</strong> complaints out of{' '}
            <strong>{totalRaised}</strong> total registered problems (<strong>{resolutionRate}%</strong> resolution pace).
            The backlog delta is currently <strong>{netPending} tickets</strong>, remaining within the acceptable 72-hour municipal SLA buffer.
          </p>
        </div>
      </div>
    </div>
  );
};
