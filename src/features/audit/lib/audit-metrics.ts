import { parseString, type Message } from "whatsapp-chat-parser";
import { parseTimeToMinutes } from "@/lib/constants/work-hours";
import type {
  AuditConfig,
  FalseUrgencyHit,
  LocalAuditResult,
  WeeklyTrendPoint,
} from "../types";
import {
  buildSnapshotPayload,
  createEmptyMatrix,
  estimateShadowOvertimeHours,
  findPeakSlot,
  formatDateYMD,
  getIsoWeekday,
  getMondayKey,
} from "./audit-helpers";
import {
  matchFalseUrgencyKeywords,
  normalizeKeywords,
} from "./false-urgency";

export { buildSnapshotPayload };

function createZeroResult(sourceLabel: string): LocalAuditResult {
  const today = formatDateYMD(new Date());
  return {
    source_label: sourceLabel,
    period_start: today,
    period_end: today,
    total_messages: 0,
    regular_messages: 0,
    after_hours_messages: 0,
    after_hours_percentage: 0,
    shadow_overtime_hours: 0,
    avg_weekly_shadow_hours: 0,
    false_urgency_count: 0,
    peak_day_of_week: 1,
    peak_hour: 0,
    peak_slot_count: 0,
    heatmap_matrix: createEmptyMatrix(),
    weekly_trend: [],
    false_urgency_breakdown: [],
  };
}

export function analyzeParsedMessages(
  messages: Message[],
  config: AuditConfig,
  sourceLabel: string
): LocalAuditResult {
  const validMessages = messages
    .filter((msg) => msg.author !== null && !Number.isNaN(msg.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (validMessages.length === 0) {
    return createZeroResult(sourceLabel);
  }

  const heatmapMatrix = createEmptyMatrix();
  const afterHoursMatrix = createEmptyMatrix();
  const activeDays = new Set(
    config.work_days.length > 0 ? config.work_days : [1, 2, 3, 4, 5]
  );
  const startMinutes = parseTimeToMinutes(config.work_start_time);
  const endMinutes = parseTimeToMinutes(config.work_end_time);
  const keywords = normalizeKeywords(config.keywords);

  const afterHoursTimes: number[] = [];
  const weekMap = new Map<string, WeeklyTrendPoint>();
  const keywordMap = new Map<string, FalseUrgencyHit>();
  for (const kw of keywords) {
    keywordMap.set(kw, { keyword: kw, count: 0, after_hours_count: 0 });
  }

  let regularCount = 0;
  let afterHoursCount = 0;
  let falseUrgencyTotal = 0;

  for (const msg of validMessages) {
    const isoDay = getIsoWeekday(msg.date);
    const hour = msg.date.getHours();
    const totalMins = hour * 60 + msg.date.getMinutes();

    const isRegular =
      activeDays.has(isoDay) && totalMins >= startMinutes && totalMins < endMinutes;

    heatmapMatrix[isoDay - 1][hour] += 1;
    if (isRegular) {
      regularCount += 1;
    } else {
      afterHoursCount += 1;
      afterHoursMatrix[isoDay - 1][hour] += 1;
      afterHoursTimes.push(msg.date.getTime());
    }

    const weekInfo = getMondayKey(msg.date);
    const existingWeek = weekMap.get(weekInfo.key) ?? {
      week_key: weekInfo.key,
      week_label: weekInfo.label,
      regular_messages: 0,
      after_hours_messages: 0,
    };
    if (isRegular) {
      existingWeek.regular_messages += 1;
    } else {
      existingWeek.after_hours_messages += 1;
    }
    weekMap.set(weekInfo.key, existingWeek);

    const matchedKeywords = matchFalseUrgencyKeywords(msg.message, keywords);
    for (const kw of matchedKeywords) {
      const hit = keywordMap.get(kw) ?? {
        keyword: kw,
        count: 0,
        after_hours_count: 0,
      };
      hit.count += 1;
      if (!isRegular) {
        hit.after_hours_count += 1;
      }
      keywordMap.set(kw, hit);
      falseUrgencyTotal += 1;
    }
  }

  const totalMessages = validMessages.length;
  const firstDate = validMessages[0].date;
  const lastDate = validMessages[totalMessages - 1].date;
  const spanDays = Math.max(
    1,
    Math.floor((lastDate.getTime() - firstDate.getTime()) / 86400000) + 1
  );
  const weeks = Math.max(1, spanDays / 7);
  const shadowOvertimeHours = estimateShadowOvertimeHours(afterHoursTimes);
  const avgWeeklyShadowHours = Number((shadowOvertimeHours / weeks).toFixed(2));
  const afterHoursPercentage = Number(
    ((afterHoursCount / totalMessages) * 100).toFixed(1)
  );
  const peak = findPeakSlot(heatmapMatrix, afterHoursMatrix);

  const weeklyTrend = Array.from(weekMap.values()).sort((a, b) =>
    a.week_key.localeCompare(b.week_key)
  );
  const falseUrgencyBreakdown = Array.from(keywordMap.values())
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || b.after_hours_count - a.after_hours_count);

  return {
    source_label: sourceLabel,
    period_start: formatDateYMD(firstDate),
    period_end: formatDateYMD(lastDate),
    total_messages: totalMessages,
    regular_messages: regularCount,
    after_hours_messages: afterHoursCount,
    after_hours_percentage: afterHoursPercentage,
    shadow_overtime_hours: shadowOvertimeHours,
    avg_weekly_shadow_hours: avgWeeklyShadowHours,
    false_urgency_count: falseUrgencyTotal,
    peak_day_of_week: peak.day,
    peak_hour: peak.hour,
    peak_slot_count: peak.count,
    heatmap_matrix: heatmapMatrix,
    weekly_trend: weeklyTrend,
    false_urgency_breakdown: falseUrgencyBreakdown,
  };
}

export function parseWaTextAndAnalyze(
  rawText: string,
  config: AuditConfig,
  sourceLabel: string
): LocalAuditResult {
  const parsed = parseString(rawText);
  return analyzeParsedMessages(parsed, config, sourceLabel);
}
