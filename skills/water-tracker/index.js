const { addWaterRecord } = require("./apis/addWaterRecord");
const { getWaterRecords } = require("./apis/getWaterRecords");

wx.modelContext.registerAPI("addWaterRecord", addWaterRecord);
wx.modelContext.registerAPI("getWaterRecords", getWaterRecords);
