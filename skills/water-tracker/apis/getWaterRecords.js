const {
  callWaterTracker,
  errorResult,
  formatDaily,
  formatHistory,
  normalizeAmount,
  successResult,
} = require("../utils/util");

async function getWaterRecords(params = {}) {
  console.info("[ai-mode] getWaterRecords 入口, params=", JSON.stringify(params));

  try {
    const days =
      params.days === undefined
        ? 7
        : normalizeAmount(params.days, "查询天数", 1, 90);

    console.info("[ai-mode] getWaterRecords 请求前 days=", days);
    const todayPromise = callWaterTracker({
      type: "getToday",
    });
    const historyPromise = callWaterTracker({
      type: "listDaily",
      days,
    });
    const rawToday = await todayPromise;
    const rawHistory = await historyPromise;
    const today = formatDaily(rawToday || {});
    const history = formatHistory(rawHistory || []);
    const structuredContent = {
      today,
      days: history,
      requestedDays: days,
      totalDays: history.length,
    };

    console.info(
      "[ai-mode] getWaterRecords 出口 structuredContent=",
      JSON.stringify(structuredContent)
    );

    return successResult(
      `今天已喝 ${today.totalMl} ml，${today.statusText}。已拉取 ${history.length} 天记录。`,
      structuredContent
    );
  } catch (error) {
    console.error("[ai-mode] getWaterRecords 出错:", error.message);
    return errorResult(`拉取喝水记录失败: ${error.message}`);
  }
}

module.exports = { getWaterRecords };
