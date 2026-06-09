Component({
  data: {
    addedAmountMl: 0,
    date: "",
    totalMl: 0,
    goalMl: 2000,
    progressPercent: 0,
    statusText: "",
  },

  lifetimes: {
    created() {
      console.info("[ai-mode] add-water-result created");
      const { NotificationType } = wx.modelContext;
      const modelCtx = wx.modelContext.getContext(this);
      const viewCtx = wx.modelContext.getViewContext(this);
      try {
        const dimensions = viewCtx.getDimensions();
        console.info(
          `[ai-mode] add-water-result dimensions width=${dimensions.width} minHeight=${dimensions.minHeight} maxHeight=${dimensions.maxHeight}`
        );
      } catch (e) {
        console.info("[ai-mode] add-water-result getDimensions skipped:", e.message);
      }

      modelCtx.on(NotificationType.Result, (data) => {
        const structuredContent =
          data.result && data.result.structuredContent;
        console.info(
          "[ai-mode] add-water-result 收到 Result:",
          JSON.stringify(structuredContent)
        );

        if (!structuredContent) {
          return;
        }

        this.setData({
          addedAmountMl: structuredContent.addedAmountMl || 0,
          date: structuredContent.date || "",
          totalMl: structuredContent.totalMl || 0,
          goalMl: structuredContent.goalMl || 2000,
          progressPercent: structuredContent.progressPercent || 0,
          statusText: structuredContent.statusText || "",
        });
        console.info(
          "[ai-mode] add-water-result setData added=",
          structuredContent.addedAmountMl
        );
      });

      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0);
        console.info(
          `[ai-mode] add-water-result overflow overflowed=${overflowed} data=${JSON.stringify(data)}`
        );
      });
      console.info("[ai-mode] add-water-result overflow monitor=on");
    },
  },

  methods: {
    onTapReview() {
      const args = {
        days: 7,
      };
      console.info(
        `[ai-mode] add-water-result send api/call name=getWaterRecords args=${JSON.stringify(args)}`
      );
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          {
            type: "text",
            text: "看喝水记录",
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
