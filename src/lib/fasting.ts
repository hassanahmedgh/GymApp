// 16:8 eating window: 1:00 PM to 9:00 PM (matches the daily schedule).
export const EAT_START = 13; // 1 PM
export const EAT_END = 21; // 9 PM

export interface FastingStatus {
  eating: boolean;
  hh: number;
  mm: number;
  label: string;
  caption: string;
  progress: number; // 0..1 through the current phase
}

export function fastingStatus(now: Date): FastingStatus {
  const h = now.getHours() + now.getMinutes() / 60;
  const eating = h >= EAT_START && h < EAT_END;

  let target = new Date(now);
  let phaseStart: number;
  let phaseEnd: number;

  if (eating) {
    target.setHours(EAT_END, 0, 0, 0);
    phaseStart = EAT_START;
    phaseEnd = EAT_END;
  } else if (h < EAT_START) {
    target.setHours(EAT_START, 0, 0, 0);
    phaseStart = EAT_END - 24; // previous 9 PM
    phaseEnd = EAT_START;
  } else {
    target.setDate(now.getDate() + 1);
    target.setHours(EAT_START, 0, 0, 0);
    phaseStart = EAT_END;
    phaseEnd = EAT_START + 24;
  }

  const ms = target.getTime() - now.getTime();
  const mins = Math.max(0, Math.round(ms / 60000));
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;

  const hAdj = h < phaseStart ? h + 24 : h;
  const progress = Math.min(1, Math.max(0, (hAdj - phaseStart) / (phaseEnd - phaseStart)));

  return {
    eating,
    hh,
    mm,
    label: eating ? 'Eating window' : 'Fasting',
    caption: eating ? 'left before the fast begins' : 'until your eating window',
    progress,
  };
}
