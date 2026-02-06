const dayjs = require("dayjs");

/**
 * Get all dates in a month that match a weekday
 * weekday: 0 (Sunday) → 6 (Saturday)
 */
function getWeekdaysInMonth(month, weekday) {
  const start = dayjs(month + "-01");
  const end = start.endOf("month");

  const dates = [];
  let current = start;

  while (current.isBefore(end) || current.isSame(end)) {
    if (current.day() === weekday) {
      dates.push(current.toDate());
    }
    current = current.add(1, "day");
  }

  return dates;
}

/**
 * Fixed dates like 3rd, 10th, 25th
 */
function getFixedDates(month, days = []) {
  return days.map((d) =>
    dayjs(month + "-01").date(d).toDate()
  );
}

/**
 * Deadline resolver
 */
function resolveDeadlines(rule, month) {
  switch (rule.type) {
    case "WEEKDAY":
      return getWeekdaysInMonth(month, rule.weekday);

    case "FIXED_DATES":
      return getFixedDates(month, rule.days);

    case "MONTHLY_ONCE":
      return [dayjs(month + "-01").date(rule.day).toDate()];

    case "NEXT_MONTH_DAY":
      return [
        dayjs(month + "-01")
          .add(1, "month")
          .date(rule.day)
          .toDate(),
      ];

    default:
      return [];
  }
}

module.exports = {
  resolveDeadlines,
};
