const MonthlyPerformance = require("../models/monthlyperformance.models");
const Employee = require("../models/employee.models");
const ProjectSchedule = require("../models/projectschedule.models");
const {TrafficLightRule, TaskTemplate, TaskLog }= require("../models/trafficlight.models");

const dayjs = require("dayjs");
const { resolveDeadlines } = require("../utils/dateRules");

async function generateMonthlyPerformance(
  employeeId,
  month,
  trafficLightRuleId
) {
  /* ================= LOAD BASE ================= */

  const employee = await Employee.findById(employeeId);
  if (!employee) throw new Error("Employee not found");

  const role = employee.department;

  const trafficLightRule = await TrafficLightRule.findById(
    trafficLightRuleId
  );
  if (!trafficLightRule)
    throw new Error("Traffic light rule not found");

  let monthly = await MonthlyPerformance.findOne({
    employee: employeeId,
    month,
  });

  if (monthly && monthly.isLocked) {
    throw new Error("Month is locked");
  }

  if (!monthly) {
    monthly = new MonthlyPerformance({
      employee: employeeId,
      role,
      month,
    });
  }

  /* ================= TARGETS ================= */

  const targets = [];

  for (const target of employee.incentiveConfig.targets) {
    /* ---------- SITE WORK ---------- */
    if (target.targetType === "SITE_WORK") {
      const works = [];

      const schedules = await ProjectSchedule.find({
        assignedTo: employeeId,
      });

      for (const ps of schedules) {
        for (const wd of ps.workDetails) {
          if (dayjs(wd.plannedDate).format("YYYY-MM") !== month)
            continue;

          const deadline =
            wd.replannedDate || wd.plannedDate;

          let status = "PENDING";
          let achievedBonus = 0;

          if (wd.status === "COMPLETED") {
            if (
              dayjs(wd.completedAt).isSameOrBefore(deadline)
            ) {
              status = "COMPLETED";
              achievedBonus = target.bonusValue;
            } else {
              status = "DELAYED";
            }
          }

          works.push({
            projectSchedule: ps._id,
            workName: wd.work,
            deadline,
            status,
            bonusValue: target.bonusValue,
            achievedBonus,
          });
        }
      }

      targets.push({ type: "SITE_WORK", works });
    }

    /* ---------- REVENUE ---------- */
    if (target.targetType === "REVENUE") {
      const deadline = dayjs(month + "-01")
        .add(1, "month")
        .date(3)
        .toDate();

      const achievedRevenue = await getAchievedRevenue(
        employeeId,
        month
      );

      const achieved =
        achievedRevenue >= target.baseTargetValue;

      let achievedBonus = 0;

      if (achieved) {
        achievedBonus =
          target.bonusType === "FIXED"
            ? target.bonusValue
            : (achievedRevenue * target.bonusValue) / 100;
      }

      targets.push({
        type: "REVENUE",
        revenueTarget: {
          targetValue: target.baseTargetValue,
          deadline,
          achievedRevenue,
          bonusType: target.bonusType,
          bonusValue: target.bonusValue,
          achievedBonus,
          status: achieved
            ? "ACHIEVED"
            : "NOT_ACHIEVED",
        },
      });
    }
  }

  /* ================= TASKS ================= */

  const taskTemplates = await TaskTemplate.find({
    role,
    enabled: true,
    status: "Active",
  });

  const tasks = [];

  for (const tpl of taskTemplates) {
    const deadlines = resolveDeadlines(
      tpl.deadlineRule,
      month
    );

    let completedCount = 0;

    for (const d of deadlines) {
      const log = await TaskLog.findOne({
        employee: employeeId,
        taskTemplate: tpl._id,
        date: {
          $gte: dayjs(d).startOf("day").toDate(),
          $lte: dayjs(d).endOf("day").toDate(),
        },
        status: "COMPLETED",
      });

      if (log) completedCount++;
    }

    const expectedCount = deadlines.length;

    let status = "MISSED";
    if (completedCount === expectedCount)
      status = "COMPLETED";
    else if (completedCount > 0)
      status = "PARTIAL";

    tasks.push({
      taskTemplate: tpl._id,
      name: tpl.name,
      frequency: tpl.frequency,
      verificationMethod: tpl.verificationMethod,
      verifiedBy: tpl.verifiedBy,
      referenceId: tpl.referenceId,
      description: tpl.description,
      enabled: true,
      expectedCount,
      completedCount,
      status,
    });
  }

  /* ================= METRICS ================= */

  const enabledTasks = tasks.filter((t) => t.enabled);
  const totalTasks = enabledTasks.length;
  const scorePerTask = totalTasks ? 100 / totalTasks : 0;

  let totalScoreAchieved = 0;

  for (const t of enabledTasks) {
    const scorePerCount =
      scorePerTask / t.expectedCount;
    totalScoreAchieved +=
      t.completedCount * scorePerCount;
  }

  const completionPercentage = Number(
    Math.min(100, totalScoreAchieved).toFixed(2)
  );

  /* ================= TRAFFIC LIGHT ================= */

  let color = "RED";
  let trafficBonus = -trafficLightRule.redPenalty;

  if (completionPercentage >= trafficLightRule.greenAbove) {
    color = "GREEN";
    trafficBonus = trafficLightRule.greenBonus;
  } else if (
    completionPercentage >= trafficLightRule.amberAbove
  ) {
    color = "AMBER";
    trafficBonus = 0;
  }

  /* ================= TOTAL BONUS ================= */

  let targetBonus = 0;

  for (const t of targets) {
    if (t.type === "SITE_WORK") {
      targetBonus += t.works.reduce(
        (s, w) => s + w.achievedBonus,
        0
      );
    }

    if (t.type === "REVENUE") {
      targetBonus += t.revenueTarget.achievedBonus;
    }
  }

  /* ================= SAVE ================= */

  monthly.targets = targets;
  monthly.tasks = tasks;
  monthly.trafficLightRule = trafficLightRuleId;
  monthly.metrics = {
    totalTasks,
    scorePerTask,
    totalScoreAchieved,
    completionPercentage,
  };
  monthly.trafficLightResult = {
    percentage: completionPercentage,
    color,
    bonus: trafficBonus,
  };
  monthly.totalBonus = trafficBonus + targetBonus;
  monthly.generatedAt = new Date();

  await monthly.save();
  return monthly;
}

module.exports = {
  generateMonthlyPerformance,
};
