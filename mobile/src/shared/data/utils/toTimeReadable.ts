// RN port of frontend/src/shared/data/utils/toTimeReadable.ts, verbatim.
interface dateData {
  date: Date | string;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const toDateReadable = ({ date }: dateData): string => {
  if (date instanceof Date) {
    return date.getDate().toString().padStart(2, "0");
  }
  return date.slice(8, 10);
};

export const toMonthReadable = ({ date }: dateData): string => {
  if (date instanceof Date) {
    return (date.getMonth() + 1).toString().padStart(2, "0");
  }
  return date.slice(5, 7);
};

/** Maps a date's numeric month (1-12) to its short name, e.g. "08" -> "Aug". */
export const toMonthNameReadable = ({ date }: dateData): string => {
  const monthNumber = Number(toMonthReadable({ date }));
  return MONTH_NAMES[monthNumber - 1];
};

export const buildMonthWithDateReadable = ({ date }: dateData): string => {
  return `${toDateReadable({ date })} ${toMonthNameReadable({ date })}`;
};
