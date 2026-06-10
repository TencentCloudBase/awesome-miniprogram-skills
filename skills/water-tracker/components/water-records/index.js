Component({
  data: {
    daysRequested: 7,
    today: {
      totalMl: 0,
      goalMl: 2000,
      progressPercent: 0,
      statusText: "",
    },
    visibleDays: [],
    omittedCount: 0,
  },

  lifetimes: {
    created() {
      console.info("[ai-mode] water-records created");
      const { NotificationType } = wx.modelContext;
      const modelCtx = wx.modelContext.getContext(this);
      const viewCtx = wx.modelContext.getViewContext(this);
      try {
        const dimensions = viewCtx.getDimensions();
        console.info(
          `[ai-mode] water-records dimensions width=${dimensions.width} minHeight=${dimensions.minHeight} maxHeight=${dimensions.maxHeight}`
        );
      } catch (e) {
        console.info("[ai-mode] water-records getDimensions skipped:", e.message);
      }

      modelCtx.on(NotificationType.Result, (data) => {
        const structuredContent =
          data.result && data.result.structuredContent;
        console.info(
          "[ai-mode] water-records 收到 Result:",
          JSON.stringify(structuredContent)
        );

        if (!structuredContent) {
          return;
        }

        const days = structuredContent.days || [];
        const visibleDays = days.slice(0, 4);
        const daysRequested = structuredContent.requestedDays || 7;

        this.setData({
          daysRequested,
          today: structuredContent.today || this.data.today,
          visibleDays,
          omittedCount: Math.max(days.length - visibleDays.length, 0),
        });
        console.info(
          `[ai-mode] water-records setData total=${days.length} visible=${visibleDays.length}`
        );
      });

      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0);
        console.info(
          `[ai-mode] water-records overflow overflowed=${overflowed} data=${JSON.stringify(data)}`
        );
      });
      console.info("[ai-mode] water-records overflow monitor=on");
    },
  },

  methods: {
    onTapRefresh() {
      const args = {
        days: this.data.daysRequested || 7,
      };
      console.info(
        `[ai-mode] water-records send api/call name=getWaterRecords args=${JSON.stringify(args)}`
      );
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          {
            type: "text",
            text: "刷新记录",
          },
          {
            type: "api/call",
            data: {
              name: "getWaterRecords",
              arguments: args,
            },
          },
        ],
      });
    },
  },
});
