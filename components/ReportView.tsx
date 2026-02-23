
import React, { useState } from 'react';
import { ParsedData } from '../types';
import { formatNumber, formatPercent } from '../utils/parser';

interface ReportViewProps {
  data: ParsedData;
  onBack: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ data, onBack }) => {
  // State to track highlighted cells (using a unique key for each cell)
  const [highlights, setHighlights] = useState<Set<string>>(new Set());

  const toggleHighlight = (id: string) => {
    setHighlights(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Enhanced value retriever that returns both value and source info
  const getValInfo = (path: string): { value: number; detail: string } => {
    if (path.includes('+')) {
      const parts = path.split('+').map(p => p.trim());
      const results = parts.map(p => {
        const [name, indexStr] = p.split('/');
        const index = parseInt(indexStr) - 1;
        const row = data.rows[name.trim()];
        const val = row ? (row[index] || 0) : 0;
        return { name: name.trim(), val };
      });
      const total = results.reduce((acc, curr) => acc + curr.val, 0);
      const detail = results.map(r => `${r.name}: ${formatNumber(r.val)}`).join(' + ');
      return { value: total, detail: `${detail} = ${formatNumber(total)}` };
    }

    const [name, indexStr] = path.split('/');
    const index = parseInt(indexStr) - 1;
    const rowName = name.trim();
    const row = data.rows[rowName];
    const value = row ? (row[index] || 0) : 0;
    return { value, detail: `${rowName}: ${formatNumber(value)}` };
  };

  const getVal = (path: string) => getValInfo(path).value;

  // Helper to render a cell with highlight functionality and optional bolding
  const ReportCell = ({ 
    id,
    value, 
    className = "", 
    isPercent = false,
    isBold = false
  }: { 
    id: string;
    value: number; 
    className?: string; 
    isPercent?: boolean;
    isBold?: boolean;
  }) => {
    const isHighlighted = highlights.has(id);
    const displayValue = isPercent ? formatPercent(value) : formatNumber(value);
    
    return (
      <td 
        onClick={() => toggleHighlight(id)}
        className={`border border-gray-400 cursor-pointer transition-colors transition-shadow ${
          isHighlighted ? 'bg-yellow-200 shadow-inner' : 'hover:bg-blue-50'
        } ${isBold ? 'font-bold' : ''} ${className}`}
      >
        {displayValue}
      </td>
    );
  };

  // Row Mapping
  const table1Cols = [
    'NE Books/1', 
    'NE Books(모바일)/1', 
    'NE Tutor/1+NE Tutor(클래스카드)/1', 
    'NE Tutor(모바일)/1', 
    'NELT/1', 
    'Build&Grow 국문/1', 
    'Build&Grow 국문 (모바일)/1', 
    'NE Teacher/1', 
    'NE Teacher(모바일)/1', 
    'NE TextBook/1'
  ];
  
  const table2Cols = [
    'NE Times/1', 
    'NE Times(모바일)/1', 
    'TomatoClass/1', 
    'TomatoClass(모바일)/1', 
    '기타/1'
  ];

  const getSubtotalInfo = (cols: string[], index: number) => {
    let total = 0;
    cols.forEach(path => {
      const p = path.replace(/\/\d+/g, `/${index}`);
      total += getVal(p);
    });
    return { value: total };
  };

  const subA1 = getSubtotalInfo(table1Cols, 1);
  const subA2 = getSubtotalInfo(table1Cols, 2);
  const subA3 = getSubtotalInfo(table1Cols, 3);
  const subA4 = getSubtotalInfo(table1Cols, 4);
  const subA6 = getSubtotalInfo(table1Cols, 6);

  const subB1 = getSubtotalInfo(table2Cols, 1);
  const subB2 = getSubtotalInfo(table2Cols, 2);
  const subB3 = getSubtotalInfo(table2Cols, 3);
  const subB4 = getSubtotalInfo(table2Cols, 4);
  const subB6 = getSubtotalInfo(table2Cols, 6);

  const total1 = subA1.value + subB1.value;
  const total2 = subA2.value + subB2.value;
  const total3 = subA3.value + subB3.value;
  const total4 = subA4.value + subB4.value;
  const total6 = subA6.value + subB6.value;

  const handlePrint = () => {
    window.print();
  };

  const reportDate = data.metadata.period.split('~')[0].trim() || '2026.02';
  const yearMonth = reportDate.substring(0, 7).replace('-', '.');

  // Calculate week of month
  const getWeekOfMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const day = d.getDate();
    return Math.ceil(day / 7);
  };

  const weekNum = getWeekOfMonth(reportDate);
  const weekLabel = weekNum ? `${weekNum}주차` : "실적";

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-[696px] mx-auto px-4 mb-6 flex justify-between items-center no-print">
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          ← 데이터 수정하기
        </button>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            💡 셀을 클릭하여 색상을 하이라이트 할 수 있습니다.
          </span>
          <button 
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            인쇄하기
          </button>
        </div>
      </div>

      <div className="print-container max-w-[1200px] mx-auto p-12 bg-white font-sans text-gray-900 shadow-2xl border border-gray-200 origin-top scale-[0.58] print:scale-100 print:transform-none mb-[-40%]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black border-b-4 border-black inline-block pb-2 tracking-tight">사이트별 회원 현황 _ {yearMonth}</h1>
        </div>

        <div className="flex items-center mb-6">
          <div className="bg-gray-800 text-white px-8 py-1.5 text-sm font-bold mr-4 rounded-sm">{weekLabel}</div>
          <div className="text-sm font-bold text-gray-600">{data.metadata.period}</div>
        </div>

        <div className="overflow-x-auto mb-10">
          <table className="w-full border-collapse border border-gray-400 text-[10.5px] text-center leading-tight">
            <thead>
              <tr className="bg-gray-100">
                <th rowSpan={3} className="border border-gray-400 w-44 bg-gray-200/50">구분</th>
                <th colSpan={7} className="border border-gray-400 bg-orange-100/50 py-2 text-orange-800">교재 및 온라인 서비스</th>
                <th colSpan={3} className="border border-gray-400 bg-purple-100/50 py-2 text-purple-800">교과서</th>
                <th rowSpan={3} className="border border-gray-400 w-20 font-bold bg-gray-100">소계 (A)</th>
              </tr>
              <tr className="bg-orange-50/30">
                <th colSpan={2} className="border border-gray-400 py-1.5">NE Books</th>
                <th colSpan={2} className="border border-gray-400 py-1.5">NE Tutor</th>
                <th rowSpan={2} className="border border-gray-400 w-20">NELT</th>
                <th colSpan={2} className="border border-gray-400 py-1.5">NE B&G</th>
                <th colSpan={2} className="border border-gray-400 bg-purple-50/30 py-1.5">NE Teacher</th>
                <th rowSpan={2} className="border border-gray-400 bg-purple-50/30 w-24">구 사이트<br/>(NE TextBook)</th>
              </tr>
              <tr className="bg-orange-50/30">
                <th className="border border-gray-400 w-20 py-1">PC</th>
                <th className="border border-gray-400 w-20 py-1">MO</th>
                <th className="border border-gray-400 w-20 py-1">PC</th>
                <th className="border border-gray-400 w-20 py-1">MO</th>
                <th className="border border-gray-400 w-20 py-1">PC</th>
                <th className="border border-gray-400 w-20 py-1">MO</th>
                <th className="border border-gray-400 bg-purple-50/30 w-20 py-1">PC</th>
                <th className="border border-gray-400 bg-purple-50/30 w-20 py-1">MO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 text-left px-3 py-2 whitespace-nowrap font-bold">전체 가입회원수_휴면회원포함 (명)</td>
                {table1Cols.map((path, i) => (
                  <ReportCell key={`t1-r1-c${i}`} id={`t1-r1-c${i}`} value={getVal(path.replace(/\/\d+/g, '/1'))} isBold />
                ))}
                <ReportCell id="t1-r1-sub" value={subA1.value} className="bg-gray-50" isBold />
              </tr>
              <tr>
                <td className="border border-gray-400 text-left px-3 py-2 whitespace-nowrap font-bold">전체 가입유효회원수_휴면회원제외 (명)</td>
                {table1Cols.map((path, i) => (
                  <ReportCell key={`t1-r2-c${i}`} id={`t1-r2-c${i}`} value={getVal(path.replace(/\/\d+/g, '/2'))} isBold />
                ))}
                <ReportCell id="t1-r2-sub" value={subA2.value} className="bg-gray-50" isBold />
              </tr>
              <tr className="h-7 bg-green-50 font-bold">
                <td className="border border-gray-400 text-left px-3 py-2 font-bold">휴면 회원률 (%)</td>
                {table1Cols.map((path, i) => {
                  const v1 = getVal(path.replace(/\/\d+/g, '/1'));
                  const v2 = getVal(path.replace(/\/\d+/g, '/2'));
                  const rate = v1 === 0 ? 0 : (v1 - v2) / v1;
                  return <ReportCell id={`t1-r3-c${i}`} key={i} value={rate} isPercent className="text-gray-500" />;
                })}
                <ReportCell 
                  id="t1-r3-sub"
                  value={subA1.value === 0 ? 0 : (subA1.value - subA2.value) / subA1.value} 
                  isPercent 
                  className="border border-gray-400 bg-green-100/50 text-gray-500" 
                />
              </tr>
              <tr>
                <td className="border border-gray-400 text-left px-3 py-2 font-medium">휴면계정 탈퇴회원수 (명)</td>
                {table1Cols.map((path, i) => (
                  <ReportCell id={`t1-r4-c${i}`} key={i} value={getVal(path.replace(/\/\d+/g, '/3'))} />
                ))}
                <ReportCell id="t1-r4-sub" value={subA3.value} className="bg-gray-50" />
              </tr>
              <tr>
                <td className="border border-gray-400 text-left px-3 py-2 font-medium">본인 탈퇴회원수 (명)</td>
                {table1Cols.map((path, i) => (
                  <ReportCell id={`t1-r5-c${i}`} key={i} value={getVal(path.replace(/\/\d+/g, '/4'))} />
                ))}
                <ReportCell id="t1-r5-sub" value={subA4.value} className="bg-gray-50" />
              </tr>
              <tr className="h-7">
                <td className="border border-gray-400 text-left px-3 py-2 font-medium">탈퇴율 (%)</td>
                {table1Cols.map((path, i) => {
                  const v1 = getVal(path.replace(/\/\d+/g, '/1'));
                  const v3 = getVal(path.replace(/\/\d+/g, '/3'));
                  const v4 = getVal(path.replace(/\/\d+/g, '/4'));
                  const rate = (v1 + v3 + v4) === 0 ? 0 : (v3 + v4) / (v1 + v3 + v4);
                  return <ReportCell id={`t1-r6-c${i}`} key={i} value={rate} isPercent className="text-gray-500" />;
                })}
                <ReportCell 
                  id="t1-r6-sub"
                  value={(subA1.value + subA3.value + subA4.value) === 0 ? 0 : (subA3.value + subA4.value) / (subA1.value + subA3.value + subA4.value)} 
                  isPercent
                  className="bg-gray-50 text-gray-500" 
                />
              </tr>
              <tr className="h-7">
                <td className="border border-gray-400 text-left px-3 py-2 font-medium">순수 이탈률 (%)</td>
                {table1Cols.map((path, i) => {
                  const v1 = getVal(path.replace(/\/\d+/g, '/1'));
                  const v3 = getVal(path.replace(/\/\d+/g, '/3'));
                  const v4 = getVal(path.replace(/\/\d+/g, '/4'));
                  const rate = (v1 + v3 + v4) === 0 ? 0 : v4 / (v1 + v3 + v4);
                  return <ReportCell id={`t1-r7-c${i}`} key={i} value={rate} isPercent className="text-gray-500" />;
                })}
                <ReportCell 
                  id="t1-r7-sub"
                  value={(subA1.value + subA3.value + subA4.value) === 0 ? 0 : subA4.value / (subA1.value + subA3.value + subA4.value)} 
                  isPercent
                  className="bg-gray-50 text-gray-500" 
                />
              </tr>
              <tr className="bg-green-50 font-bold">
                <td className="border border-gray-400 text-left px-3 py-2 font-bold">신규 가입회원 수 (명)</td>
                {table1Cols.map((path, i) => (
                  <ReportCell id={`t1-r8-c${i}`} key={i} value={getVal(path.replace(/\/\d+/g, '/6'))} className="text-red-600" />
                ))}
                <ReportCell id="t1-r8-sub" value={subA6.value} className="text-red-600 bg-green-100/50" />
              </tr>
              <tr className="bg-green-50">
                <td className="border border-gray-400 text-left px-3 py-2 whitespace-nowrap">신규 가입률 (%)</td>
                {table1Cols.map((path, i) => {
                  const v1 = getVal(path.replace(/\/\d+/g, '/1'));
                  const v6 = getVal(path.replace(/\/\d+/g, '/6'));
                  const rate = v1 === 0 ? 0 : v6 / v1;
                  return <ReportCell id={`t1-r9-c${i}`} key={i} value={rate} isPercent />;
                })}
                <ReportCell 
                  id="t1-r9-sub" 
                  value={subA1.value === 0 ? 0 : subA6.value / subA1.value} 
                  isPercent 
                  className="bg-green-100/50" 
                />
              </tr>
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-gray-400 text-[10.5px] text-center leading-tight">
            <thead>
              <tr className="bg-gray-100">
                <th rowSpan={3} className="border border-gray-400 w-44 bg-gray-200/50">구분</th>
                <th colSpan={5} className="border border-gray-400 py-2 text-blue-900">기타 사업</th>
                <th rowSpan={3} className="border border-gray-400 w-20 bg-gray-100">소계 (B)</th>
                <th rowSpan={3} className="border border-gray-400 bg-blue-100/50 w-20 font-bold">총계<br/>(A+B)</th>
                <th rowSpan={3} className="border border-gray-400 bg-blue-100/50 w-24">전주대비 증감비율</th>
              </tr>
              <tr className="bg-gray-50/30">
                <th colSpan={2} className="border border-gray-400 py-1.5">NE Times</th>
                <th colSpan={2} className="border border-gray-400 py-1.5">NE클래스</th>
                <th rowSpan={2} className="border border-gray-400 w-20">기타</th>
              </tr>
              <tr className="bg-gray-50/30">
                <th className="border border-gray-400 w-20 py-1">PC</th>
                <th className="border border-gray-400 w-20 py-1">MO</th>
                <th className="border border-gray-400 w-20 py-1">PC</th>
                <th className="border border-gray-400 w-20 py-1">MO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 text-left px-3 py-2 font-bold whitespace-nowrap"><span className="inline-block w-3.5 h-3.5 bg-yellow-400 rounded-full text-[9px] text-center leading-[14px] font-bold mr-1.5 align-middle">1</span> 전체 가입회원수_휴면회원포함 (명)</td>
                {table2Cols.map((path, i) => (
                  <ReportCell id={`t2-r1-c${i}`} key={i} value={getVal(path.replace(/\/\d+/g, '/1'))} isBold />
                ))}
                <ReportCell id="t2-r1-sub" value={subB1.value} className="bg-gray-50" isBold />
                <ReportCell id="t2-r1-total" value={total1} className="bg-blue-50/50" isBold />
                <td className="border border-gray-400 bg-blue-50/50"></td>
              </tr>
              <tr>
                <td className="border border-gray-400 text-left px-3 py-2 font-bold whitespace-nowrap"><span className="inline-block w-3.5 h-3.5 bg-yellow-400 rounded-full text-[9px] text-center leading-[14px] font-bold mr-1.5 align-middle">2</span> 전체 가입유효회원수_휴면회원제외 (명)</td>
                {table2Cols.map((path, i) => (
                  <ReportCell id={`t2-r2-c${i}`} key={i} value={getVal(path.replace(/\/\d+/g, '/2'))} isBold />
                ))}
                <ReportCell id="t2-r2-sub" value={subB2.value} className="bg-gray-50" isBold />
                <ReportCell id="t2-r2-total" value={total2} className="bg-blue-50/50" isBold />
                <td className="border border-gray-400 bg-blue-50/50"></td>
              </tr>
              <tr className="h-7 bg-green-50 font-bold">
                <td className="border border-gray-400 text-left px-3 py-2 font-bold"><span className="inline-block w-3.5 h-3.5 bg-yellow-400 rounded-full text-[9px] text-center leading-[14px] font-bold mr-1.5 align-middle">3</span> 휴면 회원률 (%)</td>
                {table2Cols.map((path, i) => {
                  const v1 = getVal(path.replace(/\/\d+/g, '/1'));
                  const v2 = getVal(path.replace(/\/\d+/g, '/2'));
                  const rate = v1 === 0 ? 0 : (v1 - v2) / v1;
                  return <ReportCell id={`t2-r3-c${i}`} key={i} value={rate} isPercent className="text-gray-500" />;
                })}
                <ReportCell 
                  id="t2-r3-sub"
                  value={subB1.value === 0 ? 0 : (subB1.value - subB2.value) / subB1.value} 
                  isPercent 
                  className="bg-green-100/30 text-gray-500" 
                />
                <ReportCell 
                  id="t2-r3-total"
                  value={total1 === 0 ? 0 : (total1 - total2) / total1} 
                  isPercent 
                  className="bg-blue-100/30 text-gray-500 font-bold" 
                />
                <td className="border border-gray-400 bg-blue-100/30"></td>
              </tr>
              <tr>
                <td className="border border-gray-400 text-left px-3 py-2 font-medium"><span className="inline-block w-3.5 h-3.5 bg-yellow-400 rounded-full text-[9px] text-center leading-[14px] font-bold mr-1.5 align-middle">4</span> 휴면계정 탈퇴회원수 (명)</td>
                {table2Cols.map((path, i) => (
                  <ReportCell id={`t2-r4-c${i}`} key={i} value={getVal(path.replace(/\/\d+/g, '/3'))} />
                ))}
                <ReportCell id="t2-r4-sub" value={subB3.value} className="bg-gray-50" />
                <ReportCell id="t2-r4-total" value={total3} className="bg-blue-50/50 font-bold" />
                <td className="border border-gray-400 bg-blue-50/50"></td>
              </tr>
              <tr>
                <td className="border border-gray-400 text-left px-3 py-2 font-medium"><span className="inline-block w-3.5 h-3.5 bg-yellow-400 rounded-full text-[9px] text-center leading-[14px] font-bold mr-1.5 align-middle">5</span> 본인 탈퇴회원수 (명)</td>
                {table2Cols.map((path, i) => (
                  <ReportCell id={`t2-r5-c${i}`} key={i} value={getVal(path.replace(/\/\d+/g, '/4'))} />
                ))}
                <ReportCell id="t2-r5-sub" value={subB4.value} className="bg-gray-50" />
                <ReportCell id="t2-r5-total" value={total4} className="bg-blue-50/50 font-bold" />
                <td className="border border-gray-400 bg-blue-50/50"></td>
              </tr>
              <tr className="h-7">
                <td className="border border-gray-400 text-left px-3 py-2 font-medium"><span className="inline-block w-3.5 h-3.5 bg-yellow-400 rounded-full text-[9px] text-center leading-[14px] font-bold mr-1.5 align-middle">6</span> 탈퇴율 (%)</td>
                {table2Cols.map((path, i) => {
                  const v1 = getVal(path.replace(/\/\d+/g, '/1'));
                  const v3 = getVal(path.replace(/\/\d+/g, '/3'));
                  const v4 = getVal(path.replace(/\/\d+/g, '/4'));
                  const rate = (v1 + v3 + v4) === 0 ? 0 : (v3 + v4) / (v1 + v3 + v4);
                  return <ReportCell id={`t2-r6-c${i}`} key={i} value={rate} isPercent className="text-gray-500" />;
                })}
                <ReportCell 
                  id="t2-r6-sub"
                  value={(subB1.value + subB3.value + subB4.value) === 0 ? 0 : (subB3.value + subB4.value) / (subB1.value + subB3.value + subB4.value)} 
                  isPercent 
                  className="bg-gray-50 text-gray-500" 
                />
                <ReportCell 
                  id="t2-r6-total"
                  value={(total1 + total3 + total4) === 0 ? 0 : (total3 + total4) / (total1 + total3 + total4)} 
                  isPercent 
                  className="bg-blue-50/50 text-gray-500 font-bold" 
                />
                <td className="border border-gray-400 bg-blue-50/50"></td>
              </tr>
              <tr className="h-7">
                <td className="border border-gray-400 text-left px-3 py-2 font-medium"><span className="inline-block w-3.5 h-3.5 bg-yellow-400 rounded-full text-[9px] text-center leading-[14px] font-bold mr-1.5 align-middle">7</span> 순수 이탈률 (%)</td>
                {table2Cols.map((path, i) => {
                  const v1 = getVal(path.replace(/\/\d+/g, '/1'));
                  const v3 = getVal(path.replace(/\/\d+/g, '/3'));
                  const v4 = getVal(path.replace(/\/\d+/g, '/4'));
                  const rate = (v1 + v3 + v4) === 0 ? 0 : v4 / (v1 + v3 + v4);
                  return <ReportCell id={`t2-r7-c${i}`} key={i} value={rate} isPercent className="text-gray-500" />;
                })}
                <ReportCell 
                  id="t2-r7-sub"
                  value={(subB1.value + subB3.value + subB4.value) === 0 ? 0 : subB4.value / (subB1.value + subB3.value + subB4.value)} 
                  isPercent 
                  className="bg-gray-50 text-gray-500" 
                />
                <ReportCell 
                  id="t2-r7-total"
                  value={(total1 + total3 + total4) === 0 ? 0 : total4 / (total1 + total3 + total4)} 
                  isPercent 
                  className="bg-blue-50/50 text-gray-500 font-bold" 
                />
                <td className="border border-gray-400 bg-blue-50/50"></td>
              </tr>
              <tr className="bg-green-50 font-bold">
                <td className="border border-gray-400 text-left px-3 py-2 font-bold"><span className="inline-block w-3.5 h-3.5 bg-yellow-400 rounded-full text-[9px] text-center leading-[14px] font-bold mr-1.5 align-middle">8</span> 신규 가입회원 수 (명)</td>
                {table2Cols.map((path, i) => (
                  <ReportCell id={`t2-r8-c${i}`} key={i} value={getVal(path.replace(/\/\d+/g, '/6'))} className="text-red-600" />
                ))}
                <ReportCell id="t2-r8-sub" value={subB6.value} className="text-red-600 bg-green-100/30" />
                <ReportCell id="t2-r8-total" value={total6} className="text-red-600 bg-blue-100/30 font-bold" />
                <td className="border border-gray-400 bg-blue-100/30"></td>
              </tr>
              <tr className="bg-green-50">
                <td className="border border-gray-400 text-left px-3 py-2 whitespace-nowrap"><span className="inline-block w-3.5 h-3.5 bg-yellow-400 rounded-full text-[9px] text-center leading-[14px] font-bold mr-1.5 align-middle">9</span> 신규 가입률 (%)</td>
                {table2Cols.map((path, i) => {
                  const v1 = getVal(path.replace(/\/\d+/g, '/1'));
                  const v6 = getVal(path.replace(/\/\d+/g, '/6'));
                  const rate = v1 === 0 ? 0 : v6 / v1;
                  return <ReportCell id={`t2-r9-c${i}`} key={i} value={rate} isPercent />;
                })}
                <ReportCell 
                  id="t2-r9-sub" 
                  value={subB1.value === 0 ? 0 : subB6.value / subB1.value} 
                  isPercent 
                  className="bg-green-100/30" 
                />
                <ReportCell 
                  id="t2-r9-total" 
                  value={total1 === 0 ? 0 : total6 / total1} 
                  isPercent 
                  className="bg-blue-100/30" 
                />
                <td className="border border-gray-400 bg-blue-100/30"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-[10.5px] space-y-1.5 mb-8 text-gray-500 italic leading-snug">
          <p>* 기타 : 서비스종료, 개편 이전, 헬로이티 등 기타 사이트 포함 집계 / <span className="text-red-600 font-bold">NE B&G 분리 집계(2022년 12월 2주차 적용)</span></p>
          <p>* 클래스카드를 통해 가입한 NE Tutor 통계, 2023년 8월 4주차 부터 반영</p>
          <p>* NE Teens Up 누적 전체회원의 경우, 이전 Teens Up(출판사업+온라인사업) 회원수가 포함된 수치</p>
        </div>

        <div className="w-56">
          <table className="w-full border-collapse border border-black text-[10.5px]">
            <thead>
              <tr className="bg-yellow-400">
                <th colSpan={2} className="border border-black p-1.5 text-left font-bold">산출식</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="border border-black p-1.5 font-medium">③(휴면 회원률)</td>
                <td className="border border-black p-1.5">(①-②)/①</td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-medium">⑥(탈퇴율)</td>
                <td className="border border-black p-1.5">(④+⑤)/(①+④+⑤)</td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-medium">⑦(순수이탈률)</td>
                <td className="border border-black p-1.5">⑤/(①+④+⑤)</td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-medium">⑨(신규가입률)</td>
                <td className="border border-black p-1.5">⑧/①</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
