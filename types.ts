
export interface ParsedData {
  metadata: {
    period: string;
  };
  headers: string[];
  // Key is "구분" (row name), value is array of numbers corresponding to headers
  rows: Record<string, number[]>;
}

export type ViewState = 'input' | 'report';
