
import React, { useState, useEffect } from 'react';
import { parseTableData, formatNumber } from '../utils/parser';
import { ParsedData } from '../types';

interface DataInputProps {
  onComplete: (data: ParsedData) => void;
}

const DataInput: React.FC<DataInputProps> = ({ onComplete }) => {
  const [inputText, setInputText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);

  useEffect(() => {
    if (inputText.trim()) {
      const data = parseTableData(inputText);
      setParsedData(data);
    } else {
      setParsedData(null);
    }
  }, [inputText]);

  // 고정된 헤더 목록
  const previewHeaders = [
    "전체 가입회원수",
    "전체 가입유효회원",
    "휴면계정 탈퇴회원",
    "본인탈퇴",
    "관리자탈퇴",
    "신규가입"
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">보고서 생성 시스템</h1>
        <p className="text-lg text-gray-500">데이터를 복사하여 아래 영역에 붙여넣으세요.</p>
      </header>

      <section className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-blue-500">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-bold text-gray-700">입력 데이터 (Tab-Separated)</span>
          </div>
          <button 
            onClick={() => setInputText('')}
            className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md font-bold transition-colors"
          >
            데이터 초기화
          </button>
        </div>
        <textarea
          className="w-full h-80 p-6 font-mono text-sm leading-relaxed focus:outline-none resize-none bg-gray-50/10"
          placeholder="여기에 복사한 표 데이터를 붙여넣으세요..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </section>

      {parsedData && Object.keys(parsedData.rows).length > 0 && (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">데이터 미리보기</h2>
              <p className="text-sm text-gray-500 mt-1">파싱된 결과가 아래와 같은지 확인해 주세요.</p>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              조회기간: {parsedData.metadata.period || '정보 없음'}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-sm text-left border-collapse table-auto">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-800 text-white shadow-md">
                    <th className="px-6 py-4 border-r border-gray-700 font-bold whitespace-nowrap min-w-[150px]">
                      구분
                    </th>
                    {previewHeaders.map((header, idx) => (
                      <th key={idx} className="px-6 py-4 font-bold whitespace-pre-line text-center min-w-[120px] bg-gray-800 border-r border-gray-700 last:border-r-0">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(parsedData.rows).map(([name, values], rowIdx) => (
                    <tr key={rowIdx} className="group hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-3 border-r font-bold text-gray-900 bg-gray-50/50 group-hover:bg-blue-50 transition-colors">
                        {name}
                      </td>
                      {/* 데이터 값은 최대 6개까지만 표시 (헤더 개수와 맞춤) */}
                      {previewHeaders.map((_, colIdx) => (
                        <td key={colIdx} className="px-6 py-3 text-right text-gray-700 font-mono border-r border-gray-100 last:border-r-0">
                          {formatNumber(values[colIdx] || 0)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center items-center py-8">
            <button
              onClick={() => onComplete(parsedData)}
              className="group relative inline-flex items-center justify-center px-12 py-4 font-bold text-white transition-all duration-200 bg-blue-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-blue-700 shadow-xl shadow-blue-200"
            >
              보고서로 변환하기
              <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </button>
          </div>
        </section>
      )}

      {!parsedData && (
        <div className="py-32 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
            <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900">데이터를 기다리고 있습니다</h3>
          <p className="mt-2 text-gray-500">외부 시스템에서 조회한 표를 복사하여 위 텍스트 박스에 붙여넣어주세요.</p>
        </div>
      )}
    </div>
  );
};

export default DataInput;
