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
    },
    {
      "id": "T4",
      "name": "标准施工流程工期模板",
      "type": "整装",
      "status": "启用",
      "start": "",
      "desc": "按开工-水电-泥瓦-油工-安装五阶段组织的标准家装节点，覆盖开工、水电、地暖、防水、贴砖、油工、安装及竣工验收全工序",
      "created": "2026-09-30",
      "updated": "2026-09-30",
      "nodes": [
        {
          "id": "T4N1",
          "name": "开工",
          "days": 0,
          "deps": [],
          "fixed": true
        },
        {
          "id": "T4N2",
          "name": "开工交底",
          "days": 1,
          "deps": [
            "T4N1"
          ]
        },
        {
          "id": "T4N3",
          "name": "开工仪式",
          "days": 1,
          "deps": [
            "T4N1"
          ]
        },
        {
          "id": "T4N4",
          "name": "施工放线",
          "days": 1,
          "deps": [
            "T4N1"
          ]
        },
        {
          "id": "T4N5",
          "name": "设备类",
          "days": 7,
          "deps": [
            "T4N4"
          ]
        },
        {
          "id": "T4N6",
          "name": "水路改造",
          "days": 15,
          "deps": [
            "T4N4"
          ]
        },
        {
          "id": "T4N7",
          "name": "电路改造",
          "days": 20,
          "deps": [
            "T4N4"
          ]
        },
        {
          "id": "T4N8",
          "name": "隐蔽工程验收",
          "days": 1,
          "deps": [
            "T4N6",
            "T4N7"
          ]
        },
        {
          "id": "T4N9",
          "name": "暖气地暖类",
          "days": 7,
          "deps": [
            "T4N8"
          ]
        },
        {
          "id": "T4N10",
          "name": "墙面水泥砂浆找平找方",
          "days": 3,
          "deps": [
            "T4N8"
          ]
        },
        {
          "id": "T4N11",
          "name": "吊顶龙骨安装",
          "days": 5,
          "deps": [
            "T4N10"
          ]
        },
        {
          "id": "T4N12",
          "name": "卫生间墙面防水施工",
          "days": 1,
          "deps": [
            "T4N10"
          ]
        },
        {
          "id": "T4N13",
          "name": "吊顶石膏板封板及基层处理",
          "days": 3,
          "deps": [
            "T4N11"
          ]
        },
        {
          "id": "T4N14",
          "name": "地面水泥砂浆找平",
          "days": 3,
          "deps": [
            "T4N12"
          ]
        },
        {
          "id": "T4N15",
          "name": "瓦工抹灰工程验收",
          "days": 1,
          "deps": [
            "T4N13",
            "T4N14"
          ]
        },
        {
          "id": "T4N16",
          "name": "墙面瓷砖铺贴",
          "days": 3,
          "deps": [
            "T4N15"
          ]
        },
        {
          "id": "T4N17",
          "name": "卫生间/厨房地面防水施工",
          "days": 1,
          "deps": [
            "T4N15"
          ]
        },
        {
          "id": "T4N18",
          "name": "防水验收",
          "days": 1,
          "deps": [
            "T4N16",
            "T4N17"
          ]
        },
        {
          "id": "T4N19",
          "name": "厨房地面地砖铺贴",
          "days": 2,
          "deps": [
            "T4N18"
          ]
        },
        {
          "id": "T4N20",
          "name": "卫生间地面地砖铺贴",
          "days": 3,
          "deps": [
            "T4N18"
          ]
        },
        {
          "id": "T4N21",
          "name": "客厅地面地砖铺贴",
          "days": 4,
          "deps": [
            "T4N18"
          ]
        },
        {
          "id": "T4N22",
          "name": "过门石安装",
          "days": 1,
          "deps": [
            "T4N19",
            "T4N20"
          ]
        },
        {
          "id": "T4N23",
          "name": "中期验收",
          "days": 1,
          "deps": [
            "T4N21",
            "T4N22"
          ]
        },
        {
          "id": "T4N24",
          "name": "墙面基层处理",
          "days": 2,
          "deps": [
            "T4N23"
          ]
        },
        {
          "id": "T4N25",
          "name": "腻子批刮及打磨",
          "days": 5,
          "deps": [
            "T4N24"
          ]
        },
        {
          "id": "T4N26",
          "name": "石膏线粘贴",
          "days": 2,
          "deps": [
            "T4N24"
          ]
        },
        {
          "id": "T4N27",
          "name": "涂刷乳胶漆底漆",
          "days": 2,
          "deps": [
            "T4N25",
            "T4N26"
          ]
        },
        {
          "id": "T4N28",
          "name": "第一遍面漆喷涂/辊涂",
          "days": 3,
          "deps": [
            "T4N27"
          ]
        },
        {
          "id": "T4N29",
          "name": "涂刷乳胶漆第二遍面漆喷涂",
          "days": 4,
          "deps": [
            "T4N28"
          ]
        },
        {
          "id": "T4N30",
          "name": "木地板",
          "days": 1,
          "deps": [
            "T4N29"
          ]
        },
        {
          "id": "T4N31",
          "name": "油工自检、修补",
          "days": 1,
          "deps": [
            "T4N29"
          ]
        },
        {
          "id": "T4N32",
          "name": "墙面涂饰类",
          "days": 1,
          "deps": [
            "T4N29"
          ]
        },
        {
          "id": "T4N33",
          "name": "油工验收",
          "days": 1,
          "deps": [
            "T4N30",
            "T4N31",
            "T4N32"
          ]
        },
        {
          "id": "T4N34",
          "name": "开关、灯具安装等",
          "days": 1,
          "deps": [
            "T4N33"
          ]
        },
        {
          "id": "T4N35",
          "name": "集成吊顶安装",
          "days": 1,
          "deps": [
            "T4N33"
          ]
        },
        {
          "id": "T4N36",
          "name": "定制家具类",
          "days": 1,
          "deps": [
            "T4N33"
          ]
        },
        {
          "id": "T4N37",
          "name": "淋浴房安装",
          "days": 1,
          "deps": [
            "T4N36"
          ]
        },
        {
          "id": "T4N38",
          "name": "台面、窗台类",
          "days": 1,
          "deps": [
            "T4N36"
          ]
        },
        {
          "id": "T4N39",
          "name": "水处理类",
          "days": 1,
          "deps": [
            "T4N36"
          ]
        },
        {
          "id": "T4N40",
          "name": "门窗类",
          "days": 1,
          "deps": [
            "T4N33"
          ]
        },
        {
          "id": "T4N41",
          "name": "橱房电器类",
          "days": 1,
          "deps": [
            "T4N40"
          ]
        },
        {
          "id": "T4N42",
          "name": "智能家居类",
          "days": 1,
          "deps": [
            "T4N40"
          ]
        },
        {
          "id": "T4N43",
          "name": "窗帘类",
          "days": 1,
          "deps": [
            "T4N40"
          ]
        },
        {
          "id": "T4N44",
          "name": "软饰类",
          "days": 1,
          "deps": [
            "T4N43"
          ]
        },
        {
          "id": "T4N45",
          "name": "五金洁具安装",
          "days": 1,
          "deps": [
            "T4N37",
            "T4N38",
            "T4N39"
          ]
        },
        {
          "id": "T4N46",
          "name": "竣工验收",
          "days": 1,
          "deps": [
            "T4N41",
            "T4N42",
            "T4N44",
            "T4N45"
          ]
        }
      ]
    }
  ],
  types: ['整装', '翻新', '局改', '工装', '软装']
};
