import type { GlobalInfoWeek } from "../classes/User";

export default function weekColor(week: GlobalInfoWeek) {
  const contributions = week.contributionDays.reduce(
    (acc, cur) => acc + cur.contributionCount,
    0
  );

  if (contributions === 0) return "#ebedf0";
  if (contributions < 5) return "#9be9a8";
  if (contributions < 10) return "#40c463";
  if (contributions < 20) return "#30a14e";
  return "#216e39";
}
