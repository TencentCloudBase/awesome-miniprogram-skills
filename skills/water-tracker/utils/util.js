const ENV_ID = "lowcode-2gp2855c5ce22e35";
const DEFAULT_GOAL_ML = 2000;
const USE_WATER_TRACKER_MOCK = true;

let cloudInited = false;
const mockRecordsByDate = createInitialRecords();

function ensureCloudInit() {
  if (cloudInited) {
    return;
  }

  if (!wx.cloud) {
    throw new Error("当前基础库不支持云开发");
  }

  console.info("[ai-mode] water-tracker ensureCloudInit env=", ENV_ID);
  wx.cloud.init({
    env: ENV_ID,
    traceUser: true,
  });
  cloudInited = true;
}

function callWaterTracker(data) {
  if (USE_WATER_TRACKER_MOCK) {
    console.info("[ai-mode] callWaterTracker mock data=", JSON.stringify(data));
    return mockCallWaterTracker(data);
  }

  ensureCloudInit();
  console.info("[ai-mode] callWaterTracker 请求前 data=", JSON.stringify(data));

  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: "waterTracker",
      data,
      success(res) {
        const result = res.result || {};
        console.info(
          "[ai-mode] callWaterTracker 请求后 result=",
          JSON.stringify(result)
        );

        if (!result.success) {
          reject(new Error(result.errMsg || "云函数调用失败"));
          return;
        }

        resolve(result.data || result.collections || null);
      },
      fail(error) {
        console.error("[ai-mode] callWaterTracker fail:", error);
        reject(error);
      },
    });
  });
}

function mockCallWaterTracker(data = {}) {
  const type = data.type;

  if (type === "init") {
    return Promise.resolve(["water_daily", "water_profile"]);
  }

  if (type === "addWater") {
    const amountMl = Number(data.amountMl || 0);
    const dateKey = getDateKey();
    const records = ensureRecords(dateKey);

    records.push({
      amountMl,
      note: data.note || "",
      drankAt: new Date().toISOString(),
    });

    return Promise.resolve(buildMockDaily(dateKey));
  }

  if (type === "getToday") {
    return Promise.resolve(buildMockDaily(getDateKey()));
  }

  if (type === "listDaily") {
    const days = Number(data.days || 7);
    const list = [];

    for (let index = 0; index < days; index += 1) {
      list.push(buildMockDaily(getDateKey(-index)));
    }

    return Promise.resolve(list);
  }

  return Promise.reject(new Error(`未知 mock 类型: ${type}`));
}

function errorResult(message) {
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: message,
      },
    ],
  };
}

function successResult(message, structuredContent) {
  const result = {
    isError: false,
    content: [
      {
        type: "text",
        text: message,
      },
    ],
  };

  if (structuredContent !== undefined) {
    result.structuredContent = structuredContent;
  }

  return result;
}

function normalizeAmount(value, fieldName, min, max) {
  const amount = Number(value);

  if (!Number.isInteger(amount) || amount < min || amount > max) {
    throw new Error(`${fieldName} 需要是 ${min} 到 ${max} 之间的整数`);
  }

  return amount;
}

function formatDaily(raw = {}) {
  const totalMl = Number(raw.totalMl || 0);
  const goalMl = Number(raw.goalMl || DEFAULT_GOAL_ML);
  const progressPercent = goalMl
    ? Math.min(Math.round((totalMl / goalMl) * 100), 100)
    : 0;
  const remainingMl = Math.max(goalMl - totalMl, 0);

  return {
    date: raw.date || getDateKey(),
    totalMl,
    goalMl,
    progressPercent,
    remainingMl,
    statusText: remainingMl > 0 ? `还差 ${remainingMl} ml` : "今日已达标",
    records: formatRecords(raw.records || []),
  };
}

function formatHistory(list = []) {
  return list.map((raw) => {
    const daily = formatDaily(raw);

    return {
      date: daily.date,
      dateLabel: formatDateLabel(daily.date),
      totalMl: daily.totalMl,
      goalMl: daily.goalMl,
      progressPercent: daily.progressPercent,
      remainingMl: daily.remainingMl,
      recordCount: daily.records.length,
    };
  });
}

function formatRecords(records = []) {
  return records
    .slice()
    .reverse()
    .map((record) => ({
      amountMl: Number(record.amountMl || 0),
      note: record.note || "",
      drankAt: record.drankAt || "",
      timeText: formatTime(record.drankAt),
    }));
}

function createInitialRecords() {
  const today = getDateKey();
  const yesterday = getDateKey(-1);
  const twoDaysAgo = getDateKey(-2);

  return {
    [today]: [
      makeMockRecord(300, "早餐后", today, 8, 30),
      makeMockRecord(250, "上午", today, 10, 45),
      makeMockRecord(400, "午餐", today, 13, 5),
    ],
    [yesterday]: [
      makeMockRecord(500, "上午", yesterday, 9, 10),
      makeMockRecord(350, "下午", yesterday, 15, 20),
      makeMockRecord(300, "晚上", yesterday, 20, 5),
    ],
    [twoDaysAgo]: [
      makeMockRecord(250, "出门前", twoDaysAgo, 8, 0),
      makeMockRecord(500, "运动后", twoDaysAgo, 18, 40),
    ],
  };
}

function makeMockRecord(amountMl, note, dateKey, hour, minute) {
  const parts = dateKey.split("-").map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2], hour, minute, 0);

  return {
    amountMl,
    note,
    drankAt: date.toISOString(),
  };
}

function ensureRecords(dateKey) {
  if (!mockRecordsByDate[dateKey]) {
    mockRecordsByDate[dateKey] = [];
  }

  return mockRecordsByDate[dateKey];
}

function buildMockDaily(dateKey) {
  const records = ensureRecords(dateKey);
  const totalMl = records.reduce(
    (sum, record) => sum + Number(record.amountMl || 0),
    0
  );

  return {
    date: dateKey,
    totalMl,
    goalMl: DEFAULT_GOAL_ML,
    records: records.slice(),
  };
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${hour}:${minute}`;
}

function formatDateLabel(dateKey) {
  if (dateKey === getDateKey()) {
    return "今天";
  }

  if (dateKey === getDateKey(-1)) {
    return "昨天";
  }

  const parts = dateKey.split("-").map(Number);
  const month = parts[1] || 0;
  const day = parts[2] || 0;
  const date = new Date(parts[0], month - 1, day);
  const weekNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  return `${month}/${day} ${weekNames[date.getDay()]}`;
}

function getDateKey(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

module.exports = {
  callWaterTracker,
  errorResult,
  formatDaily,
  formatHistory,
  normalizeAmount,
  successResult,
};
