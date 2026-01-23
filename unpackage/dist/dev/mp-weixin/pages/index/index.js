"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      searchText: "",
      selectData: {},
      dataMenuList: [
        {
          name: "编辑"
        },
        {
          name: "删除"
        }
      ],
      dataList: [
        {
          id: 1,
          name: "张三",
          courseName: "1",
          courseTotalNum: 10,
          courseLeftNum: 5,
          courseLastTime: "2023-01-01 00:00:00",
          remark: "无"
        },
        {
          id: 2,
          name: "李四",
          courseName: "2",
          courseTotalNum: 10,
          courseLeftNum: 5,
          courseLastTime: "2023-01-01 00:00:00",
          remark: "无"
        },
        {
          id: 3,
          name: "王五",
          courseName: "3",
          courseTotalNum: 10,
          courseLeftNum: 5,
          courseLastTime: "2023-01-01 00:00:00",
          remark: "无"
        },
        {
          id: 4,
          name: "赵六",
          courseName: "4",
          courseTotalNum: 10,
          courseLeftNum: 5,
          courseLastTime: "2023-01-01 00:00:00",
          remark: "无"
        }
      ]
    };
  },
  onLoad() {
  },
  methods: {
    handleSearch() {
      common_vendor.index.__f__("log", "at pages/index/index.vue:110", this.searchText);
    },
    handleMore(item) {
      this.selectData = item;
      common_vendor.index.showActionSheet({
        itemList: this.dataMenuList.map((item2) => item2.name),
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              common_vendor.index.__f__("log", "at pages/index/index.vue:121", "编辑");
              break;
            case 1:
              common_vendor.index.__f__("log", "at pages/index/index.vue:124", "删除");
              break;
          }
        }
      });
    },
    handleClick(item) {
      common_vendor.index.navigateTo({
        url: "/pages/detail/detail?id=" + item.id
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_search_bar2 = common_vendor.resolveComponent("uni-search-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  (_easycom_uni_search_bar2 + _easycom_uni_icons2 + _easycom_uni_card2)();
}
const _easycom_uni_search_bar = () => "../../uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
if (!Math) {
  (_easycom_uni_search_bar + _easycom_uni_icons + _easycom_uni_card)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o($options.handleSearch),
    b: common_vendor.o(($event) => $data.searchText = $event),
    c: common_vendor.p({
      placeholder: "请输入搜索内容",
      clearable: true,
      radius: "50",
      modelValue: $data.searchText
    }),
    d: common_vendor.f($data.dataList, (item, k0, i0) => {
      return {
        a: "1262af50-2-" + i0 + "," + ("1262af50-1-" + i0),
        b: common_vendor.t(item.name),
        c: common_vendor.o(($event) => $options.handleMore(item), item.id),
        d: "1262af50-3-" + i0 + "," + ("1262af50-1-" + i0),
        e: "title-" + i0,
        f: common_vendor.r("title", {
          class: "title"
        }, i0),
        g: common_vendor.t(item.courseName),
        h: common_vendor.t(item.courseTotalNum),
        i: common_vendor.t(item.courseLeftNum),
        j: common_vendor.t(item.courseLastTime),
        k: common_vendor.t(item.remark),
        l: item.id,
        m: common_vendor.o(($event) => $options.handleClick(item), item.id),
        n: "1262af50-1-" + i0
      };
    }),
    e: common_vendor.p({
      type: "person-filled",
      size: "30",
      color: "#92dcd3"
    }),
    f: common_vendor.p({
      type: "more",
      size: "30",
      color: "#92dcd3"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
