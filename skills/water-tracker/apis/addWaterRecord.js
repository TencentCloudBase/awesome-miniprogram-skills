const {
  callWaterTracker,
  errorResult,
  formatDaily,
  normalizeAmount,
  successResult,
} = require("../utils/util");

async function addWaterRecord(params = {}) {
  console.info("[ai-mode] addWaterRecord 入口, params=", JSON.stringify(params));

  try {
    const amountMl = normalizeAmount(params.amountMl, "喝水量", 1, 5000);
    const note = typeof params.note === "string" ? params.note.slice(0, 80) : "";

    console.info(
      "[ai-mode] addWaterRecord 请求前 amountMl=",
      amountMl,
      "note=",
      note
    );
    const rawDaily = await callWaterTracker({
      type: "addWater",
      amountMl,
      note,
    });
    const daily = formatDaily(rawDaily || {});
    const structuredContent = {
      date: daily.date,
      addedAmountMl: amountMl,
      totalMl: daily.totalMl,
      goalMl: daily.goalMl,
      progressPercent: daily.progressPercent,
      remainingMl: daily.remainingMl,
      statusText: daily.statusText,
      records: daily.records,
    };

    console.info(
      "[ai-mode] addWaterRecord 出口 structuredContent=",
      JSON.stringify(structuredContent)
    );

    return successResult(
      `已记录 ${amountMl} ml，今天累计 ${daily.totalMl} ml。${daily.statusText}`,
      structuredContent
    );
  } catch (error) {
    console.error("[ai-mode] addWaterRecord 出错:", error.message);
    return errorResult(`记录喝水失败: ${error.message}`);
  }
}

module.exports = { addWaterRecord };
