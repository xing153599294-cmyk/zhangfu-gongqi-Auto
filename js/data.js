/* 种子数据：工期模板 */
window.SEED = {
  templates: [
    {
      id: 'T1',
      name: '标准家装工期模板',
      type: '整装',
      status: '启用',
      start: '',
      desc: '适用于毛坯房整体装修，含拆改、水电、泥木油及安装验收全流程',
      created: '2026-06-12',
      updated: '2026-09-18',
      nodes: [
        { id: 'T1N1', name: '开工', days: 0, deps: [], fixed: true },
        { id: 'T1N2', name: '主体拆改', days: 3, deps: ['T1N1'], fixed: false },
        { id: 'T1N3', name: '水电改造', days: 8, deps: ['T1N2'], fixed: false },
        { id: 'T1N4', name: '防水与闭水试验', days: 4, deps: ['T1N3'], fixed: false },
        { id: 'T1N5', name: '泥瓦工程', days: 12, deps: ['T1N4'], fixed: false },
        { id: 'T1N6', name: '木工工程', days: 10, deps: ['T1N5'], fixed: false },
        { id: 'T1N7', name: '油漆工程', days: 12, deps: ['T1N6'], fixed: false },
        { id: 'T1N8', name: '安装与收尾', days: 8, deps: ['T1N7'], fixed: false },
        { id: 'T1N9', name: '竣工验收', days: 2, deps: ['T1N8'], fixed: false }
      ]
    },
    {
      id: 'T2',
      name: '二手房翻新工期模板',
      type: '翻新',
      status: '启用',
      start: '',
      desc: '含拆除清运环节，水电与泥木可并行推进，压缩整体周期',
      created: '2026-07-03',
      updated: '2026-09-05',
      nodes: [
        { id: 'T2N1', name: '开工', days: 0, deps: [], fixed: true },
        { id: 'T2N2', name: '拆除清运', days: 4, deps: ['T2N1'], fixed: false },
        { id: 'T2N3', name: '水电改造', days: 7, deps: ['T2N2'], fixed: false },
        { id: 'T2N4', name: '墙面基层处理', days: 6, deps: ['T2N3'], fixed: false },
        { id: 'T2N5', name: '防水工程', days: 3, deps: ['T2N3'], fixed: false },
        { id: 'T2N6', name: '泥瓦铺贴', days: 9, deps: ['T2N5'], fixed: false },
        { id: 'T2N7', name: '木工吊顶', days: 6, deps: ['T2N4'], fixed: false },
        { id: 'T2N8', name: '油漆涂刷', days: 8, deps: ['T2N7', 'T2N6'], fixed: false },
        { id: 'T2N9', name: '安装调试', days: 5, deps: ['T2N8'], fixed: false },
        { id: 'T2N10', name: '竣工验收', days: 2, deps: ['T2N9'], fixed: false }
      ]
    },
    {
      id: 'T3',
      name: '局改快修工期模板',
      type: '局改',
      status: '停用',
      start: '',
      desc: '适用于厨房/卫生间局部改造，环节精简、周期短',
      created: '2026-08-21',
      updated: '2026-08-21',
      nodes: [
        { id: 'T3N1', name: '开工', days: 0, deps: [], fixed: true },
        { id: 'T3N2', name: '成品保护', days: 1, deps: ['T3N1'], fixed: false },
        { id: 'T3N3', name: '局部拆除', days: 2, deps: ['T3N2'], fixed: false },
        { id: 'T3N4', name: '局部施工', days: 8, deps: ['T3N3'], fixed: false },
        { id: 'T3N5', name: '清理保洁', days: 2, deps: ['T3N4'], fixed: false },
        { id: 'T3N6', name: '验收交付', days: 1, deps: ['T3N5'], fixed: false }
      ]
    }
  ],
  types: ['整装', '翻新', '局改', '工装', '软装']
};
