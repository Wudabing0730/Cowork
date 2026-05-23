export const TAGS = ['背单词', '刷题', '阅读', '网课', '运动', '其他'] as const;

export const TAGS_WITH_EMPTY = ['', ...TAGS] as const;

export const TAG_COLORS: Record<string, string> = {
  '背单词': 'bg-blue-50 text-blue-600',
  '刷题': 'bg-amber-50 text-amber-600',
  '阅读': 'bg-purple-50 text-purple-600',
  '网课': 'bg-cyan-50 text-cyan-600',
  '运动': 'bg-green-50 text-green-600',
  '其他': 'bg-slate-100 text-slate-500',
};

export const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-slate-300',
};

export const PRIORITIES: Record<string, string> = {
  high: '高优先',
  medium: '中优先',
  low: '低优先',
};
