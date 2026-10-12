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
            "T4N2",
            "T4N3"
          ]
        },
        {
          "id": "T4N5",
          "name": "设备类",
          "days": 3,
          "deps": [
            "T4N4"
          ]
        },
        {
          "id": "T4N6",
          "name": "水路改造",
          "days": 6,
          "deps": [
            "T4N4"
          ]
        },
        {
          "id": "T4N7",
          "name": "电路改造",
          "days": 8,
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
            "T4N7",
            "T4N5"
          ]
        },
        {
          "id": "T4N9",
          "name": "暖气地暖类",
          "days": 5,
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
            "T4N8"
          ]
        },
        {
          "id": "T4N12",
          "name": "卫生间墙面防水施工",
          "days": 2,
          "deps": [
            "T4N10"
          ]
        },
        {
          "id": "T4N13",
          "name": "吊顶石膏板封板及基层处理",
          "days": 3,
          "deps": [
            "T4N11",
            "T4N5"
          ]
        },
        {
          "id": "T4N14",
          "name": "地面水泥砂浆找平",
          "days": 3,
          "deps": [
            "T4N12",
            "T4N9"
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
          "days": 2,
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
            "T4N20",
            "T4N21"
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
          "days": 2,
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
          "name": "厨房电器类",
          "days": 1,
          "deps": [
            "T4N36",
            "T4N38"
          ]
        },
        {
          "id": "T4N42",
          "name": "智能家居类",
          "days": 1,
          "deps": [
            "T4N34"
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
            "T4N47"
          ]
        },
        {
          "id": "T4N47",
          "name": "开荒保洁",
          "days": 1,
          "deps": [
            "T4N34",
            "T4N35",
            "T4N41",
            "T4N42",
            "T4N44",
            "T4N45"
          ]
        }
      ]
    }
  ],
  types: ['整装', '翻新', '局改', '工装', '软装'],
  stages: [
    "开工准备",
    "水电",
    "泥瓦",
    "油工",
    "安装",
    "竣工"
  ],
  trades: [
    "项目经理",
    "设计师",
    "水电工",
    "泥瓦工",
    "木工",
    "油漆工",
    "防水工",
    "安装工",
    "杂工",
    "监理"
  ],
  nodeTypes: [
    "施工",
    "验收",
    "产品"
  ],
  productCats: [
    {
      "id": "C01",
      "name": "定制家具",
      "parent": "",
      "unit": "",
      "lead": 0
    },
    {
      "id": "C0101",
      "name": "整体橱柜",
      "parent": "C01",
      "unit": "延米",
      "lead": 25
    },
    {
      "id": "C0102",
      "name": "衣柜",
      "parent": "C01",
      "unit": "平米",
      "lead": 25
    },
    {
      "id": "C0103",
      "name": "玄关柜",
      "parent": "C01",
      "unit": "延米",
      "lead": 25
    },
    {
      "id": "C02",
      "name": "台面石材",
      "parent": "",
      "unit": "",
      "lead": 0
    },
    {
      "id": "C0201",
      "name": "石英石台面",
      "parent": "C02",
      "unit": "延米",
      "lead": 10
    },
    {
      "id": "C0202",
      "name": "窗台石",
      "parent": "C02",
      "unit": "米",
      "lead": 7
    },
    {
      "id": "C03",
      "name": "门类",
      "parent": "",
      "unit": "",
      "lead": 0
    },
    {
      "id": "C0301",
      "name": "室内木门",
      "parent": "C03",
      "unit": "樘",
      "lead": 20
    },
    {
      "id": "C0302",
      "name": "入户门",
      "parent": "C03",
      "unit": "樘",
      "lead": 15
    },
    {
      "id": "C0303",
      "name": "推拉门",
      "parent": "C03",
      "unit": "套",
      "lead": 18
    },
    {
      "id": "C04",
      "name": "地板类",
      "parent": "",
      "unit": "",
      "lead": 0
    },
    {
      "id": "C0401",
      "name": "实木复合地板",
      "parent": "C04",
      "unit": "平米",
      "lead": 7
    },
    {
      "id": "C0402",
      "name": "强化地板",
      "parent": "C04",
      "unit": "平米",
      "lead": 5
    },
    {
      "id": "C05",
      "name": "瓷砖类",
      "parent": "",
      "unit": "",
      "lead": 0
    },
    {
      "id": "C0501",
      "name": "墙地砖",
      "parent": "C05",
      "unit": "平米",
      "lead": 5
    },
    {
      "id": "C06",
      "name": "卫浴类",
      "parent": "",
      "unit": "",
      "lead": 0
    },
    {
      "id": "C0601",
      "name": "马桶",
      "parent": "C06",
      "unit": "套",
      "lead": 5
    },
    {
      "id": "C0602",
      "name": "花洒淋浴",
      "parent": "C06",
      "unit": "套",
      "lead": 5
    },
    {
      "id": "C0603",
      "name": "浴室柜",
      "parent": "C06",
      "unit": "套",
      "lead": 12
    },
    {
      "id": "C0604",
      "name": "淋浴房",
      "parent": "C06",
      "unit": "套",
      "lead": 15
    },
    {
      "id": "C07",
      "name": "厨房电器类",
      "parent": "",
      "unit": "",
      "lead": 0
    },
    {
      "id": "C0701",
      "name": "烟机灶具",
      "parent": "C07",
      "unit": "套",
      "lead": 3
    },
    {
      "id": "C0702",
      "name": "洗碗机",
      "parent": "C07",
      "unit": "套",
      "lead": 3
    },
    {
      "id": "C0703",
      "name": "热水器",
      "parent": "C07",
      "unit": "套",
      "lead": 3
    },
    {
      "id": "C08",
      "name": "灯具类",
      "parent": "",
      "unit": "",
      "lead": 0
    },
    {
      "id": "C0801",
      "name": "主灯",
      "parent": "C08",
      "unit": "套",
      "lead": 5
    },
    {
      "id": "C0802",
      "name": "筒射灯",
      "parent": "C08",
      "unit": "个",
      "lead": 5
    },
    {
      "id": "C09",
      "name": "窗饰类",
      "parent": "",
      "unit": "",
      "lead": 0
    },
    {
      "id": "C0901",
      "name": "窗帘",
      "parent": "C09",
      "unit": "副",
      "lead": 12
    },
    {
      "id": "C10",
      "name": "智能类",
      "parent": "",
      "unit": "",
      "lead": 0
    },
    {
      "id": "C1001",
      "name": "智能门锁",
      "parent": "C10",
      "unit": "套",
      "lead": 5
    },
    {
      "id": "C1002",
      "name": "智能面板",
      "parent": "C10",
      "unit": "个",
      "lead": 5
    }
  ],
  nodes: [
    {
      "id": "SN001",
      "name": "施工放线",
      "type": "施工",
      "stage": "开工准备",
      "days": 1,
      "trades": [
        "项目经理"
      ],
      "minDays": 1,
      "deps": [],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN002",
      "name": "开工交底",
      "type": "施工",
      "stage": "开工准备",
      "days": 1,
      "trades": [
        "项目经理",
        "设计师"
      ],
      "minDays": 1,
      "deps": [],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN003",
      "name": "开工仪式",
      "type": "施工",
      "stage": "开工准备",
      "days": 1,
      "trades": [
        "项目经理"
      ],
      "minDays": 1,
      "deps": [],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN004",
      "name": "成品保护",
      "type": "施工",
      "stage": "开工准备",
      "days": 1,
      "trades": [
        "杂工"
      ],
      "minDays": 1,
      "deps": [],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN005",
      "name": "主体拆改",
      "type": "施工",
      "stage": "开工准备",
      "days": 3,
      "trades": [
        "杂工",
        "泥瓦工"
      ],
      "minDays": 1,
      "deps": [],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN006",
      "name": "拆除清运",
      "type": "施工",
      "stage": "开工准备",
      "days": 2,
      "trades": [
        "杂工"
      ],
      "minDays": 1,
      "deps": [],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN007",
      "name": "拆改",
      "type": "施工",
      "stage": "开工准备",
      "days": 2,
      "trades": [
        "杂工"
      ],
      "minDays": 1,
      "deps": [],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN008",
      "name": "设备类",
      "type": "施工",
      "stage": "水电",
      "days": 3,
      "trades": [
        "水电工",
        "安装工"
      ],
      "minDays": 1,
      "deps": [
        "SN001"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN009",
      "name": "水路改造",
      "type": "施工",
      "stage": "水电",
      "days": 6,
      "trades": [
        "水电工"
      ],
      "minDays": 1,
      "deps": [
        "SN001"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN010",
      "name": "电路改造",
      "type": "施工",
      "stage": "水电",
      "days": 8,
      "trades": [
        "水电工"
      ],
      "minDays": 1,
      "deps": [
        "SN001"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN011",
      "name": "水电改造",
      "type": "施工",
      "stage": "水电",
      "days": 8,
      "trades": [
        "水电工"
      ],
      "minDays": 1,
      "deps": [
        "SN005"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN012",
      "name": "暖气地暖类",
      "type": "施工",
      "stage": "泥瓦",
      "days": 5,
      "trades": [
        "水电工",
        "泥瓦工"
      ],
      "minDays": 1,
      "deps": [
        "SN060"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN013",
      "name": "墙面水泥砂浆找平找方",
      "type": "施工",
      "stage": "泥瓦",
      "days": 3,
      "trades": [
        "泥瓦工"
      ],
      "minDays": 1,
      "deps": [
        "SN060"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN014",
      "name": "卫生间墙面防水施工",
      "type": "施工",
      "stage": "泥瓦",
      "days": 2,
      "trades": [
        "防水工"
      ],
      "minDays": 1,
      "deps": [
        "SN013"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN015",
      "name": "吊顶龙骨安装",
      "type": "施工",
      "stage": "泥瓦",
      "days": 5,
      "trades": [
        "木工"
      ],
      "minDays": 1,
      "deps": [
        "SN060"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN016",
      "name": "吊顶石膏板封板及基层处理",
      "type": "施工",
      "stage": "泥瓦",
      "days": 3,
      "trades": [
        "木工"
      ],
      "minDays": 1,
      "deps": [
        "SN015",
        "SN008"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN017",
      "name": "地面水泥砂浆找平",
      "type": "施工",
      "stage": "泥瓦",
      "days": 3,
      "trades": [
        "泥瓦工"
      ],
      "minDays": 1,
      "deps": [
        "SN014",
        "SN012"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN018",
      "name": "修补找平",
      "type": "施工",
      "stage": "泥瓦",
      "days": 3,
      "trades": [
        "泥瓦工"
      ],
      "minDays": 1,
      "deps": [
        "SN060"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN019",
      "name": "墙面瓷砖铺贴",
      "type": "施工",
      "stage": "泥瓦",
      "days": 3,
      "trades": [
        "泥瓦工"
      ],
      "minDays": 1,
      "deps": [
        "SN061"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN020",
      "name": "卫生间/厨房地面防水施工",
      "type": "施工",
      "stage": "泥瓦",
      "days": 2,
      "trades": [
        "防水工"
      ],
      "minDays": 1,
      "deps": [
        "SN061"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN021",
      "name": "防水与闭水试验",
      "type": "施工",
      "stage": "泥瓦",
      "days": 4,
      "trades": [
        "防水工"
      ],
      "minDays": 1,
      "deps": [
        "SN011"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN022",
      "name": "防水工程",
      "type": "施工",
      "stage": "泥瓦",
      "days": 3,
      "trades": [
        "防水工"
      ],
      "minDays": 1,
      "deps": [
        "SN011"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN023",
      "name": "泥瓦工程",
      "type": "施工",
      "stage": "泥瓦",
      "days": 12,
      "trades": [
        "泥瓦工"
      ],
      "minDays": 1,
      "deps": [
        "SN021"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN024",
      "name": "泥瓦铺贴",
      "type": "施工",
      "stage": "泥瓦",
      "days": 9,
      "trades": [
        "泥瓦工"
      ],
      "minDays": 1,
      "deps": [
        "SN022"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN025",
      "name": "木工工程",
      "type": "施工",
      "stage": "泥瓦",
      "days": 10,
      "trades": [
        "木工"
      ],
      "minDays": 1,
      "deps": [
        "SN023"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN026",
      "name": "木工吊顶",
      "type": "施工",
      "stage": "泥瓦",
      "days": 6,
      "trades": [
        "木工"
      ],
      "minDays": 1,
      "deps": [
        "SN024"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN027",
      "name": "厨房地面地砖铺贴",
      "type": "施工",
      "stage": "泥瓦",
      "days": 2,
      "trades": [
        "泥瓦工"
      ],
      "minDays": 1,
      "deps": [
        "SN062"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN028",
      "name": "卫生间地面地砖铺贴",
      "type": "施工",
      "stage": "泥瓦",
      "days": 3,
      "trades": [
        "泥瓦工"
      ],
      "minDays": 1,
      "deps": [
        "SN062"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN029",
      "name": "客厅地面地砖铺贴",
      "type": "施工",
      "stage": "泥瓦",
      "days": 4,
      "trades": [
        "泥瓦工"
      ],
      "minDays": 1,
      "deps": [
        "SN062"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN030",
      "name": "过门石安装",
      "type": "施工",
      "stage": "泥瓦",
      "days": 1,
      "trades": [
        "泥瓦工"
      ],
      "minDays": 1,
      "deps": [
        "SN027",
        "SN028",
        "SN029"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN031",
      "name": "墙面基层处理",
      "type": "施工",
      "stage": "油工",
      "days": 2,
      "trades": [
        "油漆工"
      ],
      "minDays": 1,
      "deps": [
        "SN063"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN032",
      "name": "腻子批刮及打磨",
      "type": "施工",
      "stage": "油工",
      "days": 5,
      "trades": [
        "油漆工"
      ],
      "minDays": 1,
      "deps": [
        "SN031"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN033",
      "name": "石膏线粘贴",
      "type": "施工",
      "stage": "油工",
      "days": 2,
      "trades": [
        "木工"
      ],
      "minDays": 1,
      "deps": [
        "SN031"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN034",
      "name": "涂刷乳胶漆底漆",
      "type": "施工",
      "stage": "油工",
      "days": 2,
      "trades": [
        "油漆工"
      ],
      "minDays": 1,
      "deps": [
        "SN032",
        "SN033"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN035",
      "name": "第一遍面漆喷涂/辊涂",
      "type": "施工",
      "stage": "油工",
      "days": 3,
      "trades": [
        "油漆工"
      ],
      "minDays": 1,
      "deps": [
        "SN034"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN036",
      "name": "涂刷乳胶漆第二遍面漆喷涂",
      "type": "施工",
      "stage": "油工",
      "days": 4,
      "trades": [
        "油漆工"
      ],
      "minDays": 1,
      "deps": [
        "SN035"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN037",
      "name": "油漆工程",
      "type": "施工",
      "stage": "油工",
      "days": 12,
      "trades": [
        "油漆工"
      ],
      "minDays": 1,
      "deps": [
        "SN025"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN038",
      "name": "油漆涂刷",
      "type": "施工",
      "stage": "油工",
      "days": 8,
      "trades": [
        "油漆工"
      ],
      "minDays": 1,
      "deps": [
        "SN026"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN039",
      "name": "涂刷",
      "type": "施工",
      "stage": "油工",
      "days": 4,
      "trades": [
        "油漆工"
      ],
      "minDays": 1,
      "deps": [
        "SN018"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN040",
      "name": "木地板",
      "type": "施工",
      "stage": "油工",
      "days": 1,
      "trades": [
        "木工"
      ],
      "minDays": 1,
      "deps": [
        "SN036"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN041",
      "name": "油工自检、修补",
      "type": "施工",
      "stage": "油工",
      "days": 1,
      "trades": [
        "油漆工"
      ],
      "minDays": 1,
      "deps": [
        "SN036"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN042",
      "name": "墙面涂饰类",
      "type": "施工",
      "stage": "油工",
      "days": 1,
      "trades": [
        "油漆工"
      ],
      "minDays": 1,
      "deps": [
        "SN036"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN043",
      "name": "开关、灯具安装等",
      "type": "施工",
      "stage": "安装",
      "days": 1,
      "trades": [
        "水电工"
      ],
      "minDays": 1,
      "deps": [
        "SN064"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN044",
      "name": "集成吊顶安装",
      "type": "施工",
      "stage": "安装",
      "days": 1,
      "trades": [
        "安装工"
      ],
      "minDays": 1,
      "deps": [
        "SN064"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN045",
      "name": "定制家具类",
      "type": "施工",
      "stage": "安装",
      "days": 2,
      "trades": [
        "安装工"
      ],
      "minDays": 1,
      "deps": [
        "SN064"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN046",
      "name": "淋浴房安装",
      "type": "施工",
      "stage": "安装",
      "days": 1,
      "trades": [
        "安装工"
      ],
      "minDays": 1,
      "deps": [
        "SN045"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN047",
      "name": "台面、窗台类",
      "type": "施工",
      "stage": "安装",
      "days": 1,
      "trades": [
        "安装工"
      ],
      "minDays": 1,
      "deps": [
        "SN045"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN048",
      "name": "水处理类",
      "type": "施工",
      "stage": "安装",
      "days": 1,
      "trades": [
        "水电工"
      ],
      "minDays": 1,
      "deps": [
        "SN045"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN049",
      "name": "门窗类",
      "type": "施工",
      "stage": "安装",
      "days": 1,
      "trades": [
        "安装工"
      ],
      "minDays": 1,
      "deps": [
        "SN064"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN050",
      "name": "厨房电器类",
      "type": "施工",
      "stage": "安装",
      "days": 1,
      "trades": [
        "水电工"
      ],
      "minDays": 1,
      "deps": [
        "SN045",
        "SN047"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN051",
      "name": "智能家居类",
      "type": "施工",
      "stage": "安装",
      "days": 1,
      "trades": [
        "水电工"
      ],
      "minDays": 1,
      "deps": [
        "SN043"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN052",
      "name": "窗帘类",
      "type": "施工",
      "stage": "安装",
      "days": 1,
      "trades": [
        "安装工"
      ],
      "minDays": 1,
      "deps": [
        "SN049"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN053",
      "name": "软饰类",
      "type": "施工",
      "stage": "安装",
      "days": 1,
      "trades": [
        "杂工"
      ],
      "minDays": 1,
      "deps": [
        "SN052"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN054",
      "name": "五金洁具安装",
      "type": "施工",
      "stage": "安装",
      "days": 1,
      "trades": [
        "水电工"
      ],
      "minDays": 1,
      "deps": [
        "SN046",
        "SN047",
        "SN048"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN055",
      "name": "安装与收尾",
      "type": "施工",
      "stage": "安装",
      "days": 8,
      "trades": [
        "安装工"
      ],
      "minDays": 1,
      "deps": [
        "SN037"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN056",
      "name": "安装收尾",
      "type": "施工",
      "stage": "安装",
      "days": 5,
      "trades": [
        "安装工"
      ],
      "minDays": 1,
      "deps": [
        "SN038"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN057",
      "name": "开荒保洁",
      "type": "施工",
      "stage": "竣工",
      "days": 1,
      "trades": [
        "杂工"
      ],
      "minDays": 1,
      "deps": [
        "SN043",
        "SN044",
        "SN050",
        "SN051",
        "SN053",
        "SN054"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN058",
      "name": "清理保洁",
      "type": "施工",
      "stage": "竣工",
      "days": 1,
      "trades": [
        "杂工"
      ],
      "minDays": 1,
      "deps": [
        "SN056"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN059",
      "name": "材料进场验收",
      "type": "验收",
      "stage": "开工准备",
      "days": 1,
      "trades": [
        "监理"
      ],
      "minDays": 1,
      "deps": [
        "SN002"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN060",
      "name": "隐蔽工程验收",
      "type": "验收",
      "stage": "水电",
      "days": 1,
      "trades": [
        "监理"
      ],
      "minDays": 1,
      "deps": [
        "SN009",
        "SN010",
        "SN008"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN061",
      "name": "瓦工抹灰工程验收",
      "type": "验收",
      "stage": "泥瓦",
      "days": 1,
      "trades": [
        "监理"
      ],
      "minDays": 1,
      "deps": [
        "SN016",
        "SN017"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN062",
      "name": "防水验收",
      "type": "验收",
      "stage": "泥瓦",
      "days": 1,
      "trades": [
        "监理"
      ],
      "minDays": 1,
      "deps": [
        "SN019",
        "SN020"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN063",
      "name": "中期验收",
      "type": "验收",
      "stage": "泥瓦",
      "days": 1,
      "trades": [
        "监理"
      ],
      "minDays": 1,
      "deps": [
        "SN029",
        "SN030"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN064",
      "name": "油工验收",
      "type": "验收",
      "stage": "油工",
      "days": 1,
      "trades": [
        "监理"
      ],
      "minDays": 1,
      "deps": [
        "SN040",
        "SN041",
        "SN042"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN065",
      "name": "设备调试验收",
      "type": "验收",
      "stage": "安装",
      "days": 1,
      "trades": [
        "监理"
      ],
      "minDays": 1,
      "deps": [
        "SN008"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN066",
      "name": "竣工验收",
      "type": "验收",
      "stage": "竣工",
      "days": 1,
      "trades": [
        "监理"
      ],
      "minDays": 1,
      "deps": [
        "SN057"
      ],
      "cat": "",
      "lead": 0,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN067",
      "name": "整体橱柜",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0101",
      "lead": 25,
      "measure": true,
      "status": "启用"
    },
    {
      "id": "SN068",
      "name": "定制衣柜",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0102",
      "lead": 25,
      "measure": true,
      "status": "启用"
    },
    {
      "id": "SN069",
      "name": "玄关柜",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0103",
      "lead": 25,
      "measure": true,
      "status": "启用"
    },
    {
      "id": "SN070",
      "name": "石英石台面",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0201",
      "lead": 10,
      "measure": true,
      "status": "启用"
    },
    {
      "id": "SN071",
      "name": "窗台石",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0202",
      "lead": 7,
      "measure": true,
      "status": "启用"
    },
    {
      "id": "SN072",
      "name": "室内木门",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0301",
      "lead": 20,
      "measure": true,
      "status": "启用"
    },
    {
      "id": "SN073",
      "name": "入户门",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0302",
      "lead": 15,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN074",
      "name": "推拉门",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0303",
      "lead": 18,
      "measure": true,
      "status": "启用"
    },
    {
      "id": "SN075",
      "name": "实木复合地板",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0401",
      "lead": 7,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN076",
      "name": "强化地板",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0402",
      "lead": 5,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN077",
      "name": "墙地砖",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0501",
      "lead": 5,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN078",
      "name": "马桶",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0601",
      "lead": 5,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN079",
      "name": "花洒淋浴",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0602",
      "lead": 5,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN080",
      "name": "浴室柜",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0603",
      "lead": 12,
      "measure": true,
      "status": "启用"
    },
    {
      "id": "SN081",
      "name": "淋浴房",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0604",
      "lead": 15,
      "measure": true,
      "status": "启用"
    },
    {
      "id": "SN082",
      "name": "烟机灶具",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0701",
      "lead": 3,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN083",
      "name": "洗碗机",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0702",
      "lead": 3,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN084",
      "name": "燃气热水器",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0703",
      "lead": 3,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN085",
      "name": "主灯",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0801",
      "lead": 5,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN086",
      "name": "筒射灯",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0802",
      "lead": 5,
      "measure": false,
      "status": "启用"
    },
    {
      "id": "SN087",
      "name": "窗帘",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C0901",
      "lead": 12,
      "measure": true,
      "status": "启用"
    },
    {
      "id": "SN088",
      "name": "智能门锁",
      "type": "产品",
      "stage": "安装",
      "days": 0,
      "trades": [
        "安装工"
      ],
      "minDays": 0,
      "deps": [],
      "cat": "C1001",
      "lead": 5,
      "measure": false,
      "status": "启用"
    }
  ],
  quota: [
      {
        "id": "Q001",
        "code": "D001",
        "name": "水路改造（明暗管综合）",
        "stage": "水电",
        "unit": "米",
        "crew": 1,
        "node": "SN009",
        "items": [
          {
            "trade": "水电工",
            "hours": 0.45
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q002",
        "code": "D002",
        "name": "水路改造（开槽暗埋）",
        "stage": "水电",
        "unit": "米",
        "crew": 1,
        "node": "SN009",
        "items": [
          {
            "trade": "水电工",
            "hours": 0.6
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q003",
        "code": "D003",
        "name": "电路改造（明线）",
        "stage": "水电",
        "unit": "米",
        "crew": 1,
        "node": "SN010",
        "items": [
          {
            "trade": "水电工",
            "hours": 0.25
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q004",
        "code": "D004",
        "name": "电路改造（开槽暗埋）",
        "stage": "水电",
        "unit": "米",
        "crew": 1,
        "node": "SN010",
        "items": [
          {
            "trade": "水电工",
            "hours": 0.4
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q005",
        "code": "D005",
        "name": "弱电网络布线",
        "stage": "水电",
        "unit": "米",
        "crew": 1,
        "node": "SN010",
        "items": [
          {
            "trade": "水电工",
            "hours": 0.15
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q006",
        "code": "D006",
        "name": "开关插座点位安装",
        "stage": "水电",
        "unit": "个",
        "crew": 1,
        "node": "SN043",
        "items": [
          {
            "trade": "水电工",
            "hours": 0.25
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q007",
        "code": "D007",
        "name": "筒灯射灯安装",
        "stage": "安装",
        "unit": "个",
        "crew": 1,
        "node": "SN043",
        "items": [
          {
            "trade": "水电工",
            "hours": 0.2
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q008",
        "code": "D008",
        "name": "主灯安装",
        "stage": "安装",
        "unit": "套",
        "crew": 1,
        "node": "SN043",
        "items": [
          {
            "trade": "水电工",
            "hours": 0.9
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q009",
        "code": "D009",
        "name": "配电箱移位安装",
        "stage": "水电",
        "unit": "套",
        "crew": 1,
        "node": "SN010",
        "items": [
          {
            "trade": "水电工",
            "hours": 3.0
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q010",
        "code": "D010",
        "name": "中央空调室内机安装",
        "stage": "水电",
        "unit": "台",
        "crew": 2,
        "node": "SN008",
        "items": [
          {
            "trade": "安装工",
            "hours": 3.0
          },
          {
            "trade": "水电工",
            "hours": 1.0
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q011",
        "code": "D011",
        "name": "新风主机安装",
        "stage": "水电",
        "unit": "台",
        "crew": 2,
        "node": "SN008",
        "items": [
          {
            "trade": "安装工",
            "hours": 2.5
          },
          {
            "trade": "水电工",
            "hours": 0.8
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q012",
        "code": "D012",
        "name": "地暖盘管铺设",
        "stage": "泥瓦",
        "unit": "平米",
        "crew": 2,
        "node": "SN012",
        "items": [
          {
            "trade": "水电工",
            "hours": 0.22
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q013",
        "code": "D013",
        "name": "地暖回填",
        "stage": "泥瓦",
        "unit": "平米",
        "crew": 2,
        "node": "SN012",
        "items": [
          {
            "trade": "泥瓦工",
            "hours": 0.12
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q014",
        "code": "D014",
        "name": "下水管道改造",
        "stage": "水电",
        "unit": "处",
        "crew": 1,
        "node": "SN009",
        "items": [
          {
            "trade": "水电工",
            "hours": 1.2
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q015",
        "code": "D015",
        "name": "墙面水泥砂浆找平",
        "stage": "泥瓦",
        "unit": "平米",
        "crew": 2,
        "node": "SN013",
        "items": [
          {
            "trade": "泥瓦工",
            "hours": 0.18
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q016",
        "code": "D016",
        "name": "地面水泥砂浆找平",
        "stage": "泥瓦",
        "unit": "平米",
        "crew": 2,
        "node": "SN017",
        "items": [
          {
            "trade": "泥瓦工",
            "hours": 0.15
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q017",
        "code": "D017",
        "name": "卫生间墙面防水",
        "stage": "泥瓦",
        "unit": "平米",
        "crew": 1,
        "node": "SN014",
        "items": [
          {
            "trade": "防水工",
            "hours": 0.35
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q018",
        "code": "D018",
        "name": "厨卫地面防水",
        "stage": "泥瓦",
        "unit": "平米",
        "crew": 1,
        "node": "SN020",
        "items": [
          {
            "trade": "防水工",
            "hours": 0.3
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q019",
        "code": "D019",
        "name": "墙面瓷砖铺贴（常规砖）",
        "stage": "泥瓦",
        "unit": "平米",
        "crew": 2,
        "node": "SN019",
        "items": [
          {
            "trade": "泥瓦工",
            "hours": 0.55
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q020",
        "code": "D020",
        "name": "墙面瓷砖铺贴（大板薄贴）",
        "stage": "泥瓦",
        "unit": "平米",
        "crew": 2,
        "node": "SN019",
        "items": [
          {
            "trade": "泥瓦工",
            "hours": 0.8
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q021",
        "code": "D021",
        "name": "地面地砖铺贴（800以内）",
        "stage": "泥瓦",
        "unit": "平米",
        "crew": 2,
        "node": "SN029",
        "items": [
          {
            "trade": "泥瓦工",
            "hours": 0.42
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q022",
        "code": "D022",
        "name": "地面地砖铺贴（厨卫小砖）",
        "stage": "安装",
        "unit": "平米",
        "crew": 2,
        "node": "SN027",
        "items": [
          {
            "trade": "泥瓦工",
            "hours": 0.6
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q023",
        "code": "D023",
        "name": "过门石安装",
        "stage": "泥瓦",
        "unit": "块",
        "crew": 1,
        "node": "SN030",
        "items": [
          {
            "trade": "泥瓦工",
            "hours": 0.5
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q024",
        "code": "D024",
        "name": "砌墙（轻质砖）",
        "stage": "开工准备",
        "unit": "平米",
        "crew": 2,
        "node": "SN005",
        "items": [
          {
            "trade": "泥瓦工",
            "hours": 0.7
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q025",
        "code": "D025",
        "name": "墙体拆除",
        "stage": "开工准备",
        "unit": "平米",
        "crew": 2,
        "node": "SN005",
        "items": [
          {
            "trade": "杂工",
            "hours": 0.5
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q026",
        "code": "D026",
        "name": "垃圾清运",
        "stage": "开工准备",
        "unit": "车",
        "crew": 2,
        "node": "SN006",
        "items": [
          {
            "trade": "杂工",
            "hours": 1.5
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q027",
        "code": "D027",
        "name": "吊顶龙骨安装",
        "stage": "泥瓦",
        "unit": "平米",
        "crew": 2,
        "node": "SN015",
        "items": [
          {
            "trade": "木工",
            "hours": 0.35
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q028",
        "code": "D028",
        "name": "吊顶石膏板封板",
        "stage": "泥瓦",
        "unit": "平米",
        "crew": 2,
        "node": "SN016",
        "items": [
          {
            "trade": "木工",
            "hours": 0.28
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q029",
        "code": "D029",
        "name": "石膏线安装",
        "stage": "油工",
        "unit": "米",
        "crew": 1,
        "node": "SN033",
        "items": [
          {
            "trade": "木工",
            "hours": 0.15
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q030",
        "code": "D030",
        "name": "包立管",
        "stage": "泥瓦",
        "unit": "根",
        "crew": 1,
        "node": "SN013",
        "items": [
          {
            "trade": "泥瓦工",
            "hours": 1.0
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q031",
        "code": "D031",
        "name": "墙面基层处理（铲墙固化）",
        "stage": "油工",
        "unit": "平米",
        "crew": 2,
        "node": "SN031",
        "items": [
          {
            "trade": "油漆工",
            "hours": 0.12
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q032",
        "code": "D032",
        "name": "腻子批刮及打磨（三遍）",
        "stage": "油工",
        "unit": "平米",
        "crew": 2,
        "node": "SN032",
        "items": [
          {
            "trade": "油漆工",
            "hours": 0.28
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q033",
        "code": "D033",
        "name": "乳胶漆底漆",
        "stage": "油工",
        "unit": "平米",
        "crew": 1,
        "node": "SN034",
        "items": [
          {
            "trade": "油漆工",
            "hours": 0.08
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q034",
        "code": "D034",
        "name": "乳胶漆面漆（辊涂）",
        "stage": "油工",
        "unit": "平米",
        "crew": 1,
        "node": "SN035",
        "items": [
          {
            "trade": "油漆工",
            "hours": 0.12
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q035",
        "code": "D035",
        "name": "乳胶漆面漆（喷涂）",
        "stage": "油工",
        "unit": "平米",
        "crew": 1,
        "node": "SN036",
        "items": [
          {
            "trade": "油漆工",
            "hours": 0.09
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q036",
        "code": "D036",
        "name": "木饰面油漆",
        "stage": "油工",
        "unit": "平米",
        "crew": 1,
        "node": "SN042",
        "items": [
          {
            "trade": "油漆工",
            "hours": 0.6
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q037",
        "code": "D037",
        "name": "壁纸铺贴",
        "stage": "油工",
        "unit": "平米",
        "crew": 1,
        "node": "SN042",
        "items": [
          {
            "trade": "油漆工",
            "hours": 0.35
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q038",
        "code": "D038",
        "name": "木地板安装",
        "stage": "油工",
        "unit": "平米",
        "crew": 2,
        "node": "SN040",
        "items": [
          {
            "trade": "木工",
            "hours": 0.22
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q039",
        "code": "D039",
        "name": "踢脚线安装",
        "stage": "油工",
        "unit": "米",
        "crew": 1,
        "node": "SN040",
        "items": [
          {
            "trade": "木工",
            "hours": 0.12
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q040",
        "code": "D040",
        "name": "橱柜地柜安装",
        "stage": "安装",
        "unit": "延米",
        "crew": 2,
        "node": "SN045",
        "items": [
          {
            "trade": "安装工",
            "hours": 0.7
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q041",
        "code": "D041",
        "name": "橱柜吊柜安装",
        "stage": "安装",
        "unit": "延米",
        "crew": 2,
        "node": "SN045",
        "items": [
          {
            "trade": "安装工",
            "hours": 0.8
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q042",
        "code": "D042",
        "name": "石英石台面安装",
        "stage": "安装",
        "unit": "延米",
        "crew": 2,
        "node": "SN047",
        "items": [
          {
            "trade": "安装工",
            "hours": 0.6
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q043",
        "code": "D043",
        "name": "窗台石安装",
        "stage": "安装",
        "unit": "米",
        "crew": 1,
        "node": "SN047",
        "items": [
          {
            "trade": "安装工",
            "hours": 0.6
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q044",
        "code": "D044",
        "name": "室内木门安装",
        "stage": "安装",
        "unit": "樘",
        "crew": 1,
        "node": "SN049",
        "items": [
          {
            "trade": "安装工",
            "hours": 1.5
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q045",
        "code": "D045",
        "name": "入户门安装",
        "stage": "安装",
        "unit": "樘",
        "crew": 2,
        "node": "SN049",
        "items": [
          {
            "trade": "安装工",
            "hours": 2.5
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q046",
        "code": "D046",
        "name": "淋浴房安装",
        "stage": "安装",
        "unit": "套",
        "crew": 2,
        "node": "SN046",
        "items": [
          {
            "trade": "安装工",
            "hours": 2.0
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q047",
        "code": "D047",
        "name": "马桶安装",
        "stage": "安装",
        "unit": "套",
        "crew": 1,
        "node": "SN054",
        "items": [
          {
            "trade": "水电工",
            "hours": 0.8
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q048",
        "code": "D048",
        "name": "花洒安装",
        "stage": "安装",
        "unit": "套",
        "crew": 1,
        "node": "SN054",
        "items": [
          {
            "trade": "水电工",
            "hours": 0.6
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q049",
        "code": "D049",
        "name": "浴室柜安装",
        "stage": "安装",
        "unit": "套",
        "crew": 1,
        "node": "SN054",
        "items": [
          {
            "trade": "安装工",
            "hours": 1.2
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q050",
        "code": "D050",
        "name": "五金挂件安装",
        "stage": "安装",
        "unit": "件",
        "crew": 1,
        "node": "SN054",
        "items": [
          {
            "trade": "水电工",
            "hours": 0.25
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q051",
        "code": "D051",
        "name": "净水设备安装",
        "stage": "安装",
        "unit": "套",
        "crew": 1,
        "node": "SN048",
        "items": [
          {
            "trade": "水电工",
            "hours": 1.2
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q052",
        "code": "D052",
        "name": "软水设备安装",
        "stage": "安装",
        "unit": "套",
        "crew": 1,
        "node": "SN048",
        "items": [
          {
            "trade": "水电工",
            "hours": 1.5
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q053",
        "code": "D053",
        "name": "烟机灶具安装",
        "stage": "安装",
        "unit": "套",
        "crew": 1,
        "node": "SN050",
        "items": [
          {
            "trade": "水电工",
            "hours": 1.0
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q054",
        "code": "D054",
        "name": "洗碗机安装",
        "stage": "安装",
        "unit": "套",
        "crew": 1,
        "node": "SN050",
        "items": [
          {
            "trade": "水电工",
            "hours": 1.0
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q055",
        "code": "D055",
        "name": "燃气热水器安装",
        "stage": "安装",
        "unit": "套",
        "crew": 1,
        "node": "SN050",
        "items": [
          {
            "trade": "水电工",
            "hours": 1.5
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q056",
        "code": "D056",
        "name": "集成吊顶安装",
        "stage": "安装",
        "unit": "平米",
        "crew": 2,
        "node": "SN044",
        "items": [
          {
            "trade": "安装工",
            "hours": 0.35
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q057",
        "code": "D057",
        "name": "窗帘安装",
        "stage": "安装",
        "unit": "副",
        "crew": 1,
        "node": "SN052",
        "items": [
          {
            "trade": "安装工",
            "hours": 0.5
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q058",
        "code": "D058",
        "name": "智能门锁安装",
        "stage": "安装",
        "unit": "套",
        "crew": 1,
        "node": "SN051",
        "items": [
          {
            "trade": "水电工",
            "hours": 0.8
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q059",
        "code": "D059",
        "name": "智能面板安装",
        "stage": "安装",
        "unit": "个",
        "crew": 1,
        "node": "SN051",
        "items": [
          {
            "trade": "水电工",
            "hours": 0.3
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q060",
        "code": "D060",
        "name": "智能窗帘电机安装",
        "stage": "安装",
        "unit": "套",
        "crew": 1,
        "node": "SN051",
        "items": [
          {
            "trade": "水电工",
            "hours": 1.0
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q061",
        "code": "D061",
        "name": "软装陈设摆放",
        "stage": "安装",
        "unit": "项",
        "crew": 1,
        "node": "SN053",
        "items": [
          {
            "trade": "杂工",
            "hours": 1.0
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q062",
        "code": "D062",
        "name": "开荒保洁",
        "stage": "竣工",
        "unit": "平米",
        "crew": 2,
        "node": "SN057",
        "items": [
          {
            "trade": "杂工",
            "hours": 0.06
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q063",
        "code": "D063",
        "name": "成品保护",
        "stage": "开工准备",
        "unit": "平米",
        "crew": 1,
        "node": "SN004",
        "items": [
          {
            "trade": "杂工",
            "hours": 0.03
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q064",
        "code": "D064",
        "name": "旧墙地砖铲除",
        "stage": "开工准备",
        "unit": "平米",
        "crew": 2,
        "node": "SN006",
        "items": [
          {
            "trade": "杂工",
            "hours": 0.35
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q065",
        "code": "D065",
        "name": "旧吊顶拆除",
        "stage": "开工准备",
        "unit": "平米",
        "crew": 2,
        "node": "SN006",
        "items": [
          {
            "trade": "杂工",
            "hours": 0.25
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q066",
        "code": "D066",
        "name": "旧柜体与台面拆除",
        "stage": "开工准备",
        "unit": "项",
        "crew": 1,
        "node": "SN006",
        "items": [
          {
            "trade": "杂工",
            "hours": 1.5
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q067",
        "code": "D067",
        "name": "旧洁具与五金拆除",
        "stage": "开工准备",
        "unit": "套",
        "crew": 1,
        "node": "SN006",
        "items": [
          {
            "trade": "杂工",
            "hours": 0.5
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q068",
        "code": "D068",
        "name": "瓷砖美缝",
        "stage": "泥瓦",
        "unit": "平米",
        "crew": 1,
        "node": "SN019",
        "items": [
          {
            "trade": "泥瓦工",
            "hours": 0.18
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q069",
        "code": "D069",
        "name": "墙面裂缝挂网修补",
        "stage": "油工",
        "unit": "平米",
        "crew": 1,
        "node": "SN031",
        "items": [
          {
            "trade": "油漆工",
            "hours": 0.25
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q070",
        "code": "D070",
        "name": "橱柜门板更换",
        "stage": "安装",
        "unit": "扇",
        "crew": 1,
        "node": "SN045",
        "items": [
          {
            "trade": "木工",
            "hours": 0.4
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q071",
        "code": "D071",
        "name": "柜体五金更换",
        "stage": "安装",
        "unit": "套",
        "crew": 1,
        "node": "SN045",
        "items": [
          {
            "trade": "安装工",
            "hours": 0.3
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q072",
        "code": "D072",
        "name": "灯带安装",
        "stage": "安装",
        "unit": "米",
        "crew": 1,
        "node": "SN043",
        "items": [
          {
            "trade": "水电工",
            "hours": 0.12
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q073",
        "code": "D073",
        "name": "局部成品保护（家具遮蔽）",
        "stage": "开工准备",
        "unit": "项",
        "crew": 1,
        "node": "SN004",
        "items": [
          {
            "trade": "杂工",
            "hours": 1
          }
        ],
        "status": "启用"
      },
      {
        "id": "Q074",
        "code": "D074",
        "name": "地面地砖铺贴（卫生间小砖）",
        "stage": "泥瓦",
        "unit": "平米",
        "crew": 2,
        "node": "SN028",
        "items": [
          {
            "trade": "泥瓦工",
            "hours": 0.6
          }
        ],
        "status": "启用"
      }
    ],
  quotes: [
      {
        "id": "B001",
        "code": "BJ001026",
        "name": "华润二十四城 · 张女士住宅 · 毛坯整装方案",
        "kind": "毛坯整装",
        "customer": "张女士",
        "address": "华润二十四城 3-1-1802",
        "house": "两室两厅一卫",
        "area": 90,
        "start": "2026-10-20",
        "status": "已提交",
        "items": [
          {
            "id": "B001I001",
            "qid": "Q063",
            "qty": 90
          },
          {
            "id": "B001I002",
            "qid": "Q025",
            "qty": 8
          },
          {
            "id": "B001I003",
            "qid": "Q024",
            "qty": 12
          },
          {
            "id": "B001I004",
            "qid": "Q026",
            "qty": 3
          },
          {
            "id": "B001I005",
            "qid": "Q001",
            "qty": 60
          },
          {
            "id": "B001I006",
            "qid": "Q004",
            "qty": 180
          },
          {
            "id": "B001I007",
            "qid": "Q005",
            "qty": 40
          },
          {
            "id": "B001I008",
            "qid": "Q009",
            "qty": 1
          },
          {
            "id": "B001I009",
            "qid": "Q014",
            "qty": 3
          },
          {
            "id": "B001I010",
            "qid": "Q015",
            "qty": 40
          },
          {
            "id": "B001I011",
            "qid": "Q016",
            "qty": 85
          },
          {
            "id": "B001I012",
            "qid": "Q017",
            "qty": 25
          },
          {
            "id": "B001I013",
            "qid": "Q018",
            "qty": 18
          },
          {
            "id": "B001I014",
            "qid": "Q019",
            "qty": 45
          },
          {
            "id": "B001I015",
            "qid": "Q021",
            "qty": 60
          },
          {
            "id": "B001I016",
            "qid": "Q022",
            "qty": 16
          },
          {
            "id": "B001I017",
            "qid": "Q023",
            "qty": 5
          },
          {
            "id": "B001I018",
            "qid": "Q027",
            "qty": 30
          },
          {
            "id": "B001I019",
            "qid": "Q028",
            "qty": 30
          },
          {
            "id": "B001I020",
            "qid": "Q031",
            "qty": 220
          },
          {
            "id": "B001I021",
            "qid": "Q032",
            "qty": 220
          },
          {
            "id": "B001I022",
            "qid": "Q033",
            "qty": 180
          },
          {
            "id": "B001I023",
            "qid": "Q034",
            "qty": 180
          },
          {
            "id": "B001I024",
            "qid": "Q035",
            "qty": 180
          },
          {
            "id": "B001I025",
            "qid": "Q038",
            "qty": 55
          },
          {
            "id": "B001I026",
            "qid": "Q039",
            "qty": 60
          },
          {
            "id": "B001I027",
            "qid": "Q040",
            "qty": 4
          },
          {
            "id": "B001I028",
            "qid": "Q041",
            "qty": 3
          },
          {
            "id": "B001I029",
            "qid": "Q042",
            "qty": 4
          },
          {
            "id": "B001I030",
            "qid": "Q044",
            "qty": 5
          },
          {
            "id": "B001I031",
            "qid": "Q046",
            "qty": 1
          },
          {
            "id": "B001I032",
            "qid": "Q047",
            "qty": 2
          },
          {
            "id": "B001I033",
            "qid": "Q048",
            "qty": 2
          },
          {
            "id": "B001I034",
            "qid": "Q049",
            "qty": 2
          },
          {
            "id": "B001I035",
            "qid": "Q050",
            "qty": 8
          },
          {
            "id": "B001I036",
            "qid": "Q053",
            "qty": 1
          },
          {
            "id": "B001I037",
            "qid": "Q055",
            "qty": 1
          },
          {
            "id": "B001I038",
            "qid": "Q056",
            "qty": 12
          },
          {
            "id": "B001I039",
            "qid": "Q006",
            "qty": 45
          },
          {
            "id": "B001I040",
            "qid": "Q007",
            "qty": 20
          },
          {
            "id": "B001I041",
            "qid": "Q008",
            "qty": 6
          },
          {
            "id": "B001I042",
            "qid": "Q057",
            "qty": 6
          },
          {
            "id": "B001I043",
            "qid": "Q058",
            "qty": 1
          },
          {
            "id": "B001I044",
            "qid": "Q059",
            "qty": 10
          },
          {
            "id": "B001I045",
            "qid": "Q062",
            "qty": 90
          }
        ],
        "created": "2026-10-10",
        "updated": "2026-10-12",
        "rev": 2
      },
      {
        "id": "B002",
        "code": "BJ002026",
        "name": "万科城 · 李先生住宅",
        "kind": "毛坯整装",
        "customer": "李先生",
        "address": "万科城 12-2-0601",
        "house": "三室两厅两卫",
        "area": 120,
        "start": "2026-11-05",
        "status": "草稿",
        "items": [
          {
            "id": "B002I001",
            "qid": "Q063",
            "qty": 120
          },
          {
            "id": "B002I002",
            "qid": "Q025",
            "qty": 15
          },
          {
            "id": "B002I003",
            "qid": "Q026",
            "qty": 4
          },
          {
            "id": "B002I004",
            "qid": "Q002",
            "qty": 75
          },
          {
            "id": "B002I005",
            "qid": "Q004",
            "qty": 240
          },
          {
            "id": "B002I006",
            "qid": "Q005",
            "qty": 50
          },
          {
            "id": "B002I007",
            "qid": "Q009",
            "qty": 1
          },
          {
            "id": "B002I008",
            "qid": "Q017",
            "qty": 35
          },
          {
            "id": "B002I009",
            "qid": "Q018",
            "qty": 25
          },
          {
            "id": "B002I010",
            "qid": "Q016",
            "qty": 110
          }
        ],
        "created": "2026-10-10",
        "updated": "2026-10-12",
        "rev": 2
      },
      {
        "id": "B003",
        "rev": 2,
        "code": "BJ001027",
        "name": "锦绣家园 · 张女士父母房 · 老房整体翻新方案",
        "kind": "老房整体翻新",
        "customer": "张女士",
        "address": "锦绣家园 6-2-501",
        "house": "三室两厅一卫",
        "area": 110,
        "start": "2026-11-01",
        "status": "已提交",
        "items": [
          {
            "id": "B003I001",
            "qid": "Q063",
            "qty": 110
          },
          {
            "id": "B003I002",
            "qid": "Q025",
            "qty": 28
          },
          {
            "id": "B003I003",
            "qid": "Q024",
            "qty": 18
          },
          {
            "id": "B003I004",
            "qid": "Q026",
            "qty": 4
          },
          {
            "id": "B003I005",
            "qid": "Q001",
            "qty": 50
          },
          {
            "id": "B003I006",
            "qid": "Q014",
            "qty": 3
          },
          {
            "id": "B003I007",
            "qid": "Q004",
            "qty": 230
          },
          {
            "id": "B003I008",
            "qid": "Q005",
            "qty": 55
          },
          {
            "id": "B003I009",
            "qid": "Q009",
            "qty": 1
          },
          {
            "id": "B003I010",
            "qid": "Q010",
            "qty": 3
          },
          {
            "id": "B003I011",
            "qid": "Q011",
            "qty": 1
          },
          {
            "id": "B003I012",
            "qid": "Q012",
            "qty": 78
          },
          {
            "id": "B003I013",
            "qid": "Q013",
            "qty": 78
          },
          {
            "id": "B003I014",
            "qid": "Q015",
            "qty": 120
          },
          {
            "id": "B003I015",
            "qid": "Q016",
            "qty": 85
          },
          {
            "id": "B003I016",
            "qid": "Q017",
            "qty": 24
          },
          {
            "id": "B003I017",
            "qid": "Q018",
            "qty": 16
          },
          {
            "id": "B003I018",
            "qid": "Q019",
            "qty": 48
          },
          {
            "id": "B003I019",
            "qid": "Q068",
            "qty": 48
          },
          {
            "id": "B003I020",
            "qid": "Q021",
            "qty": 78
          },
          {
            "id": "B003I021",
            "qid": "Q022",
            "qty": 9
          },
          {
            "id": "B003I022",
            "qid": "Q074",
            "qty": 7
          },
          {
            "id": "B003I023",
            "qid": "Q023",
            "qty": 6
          },
          {
            "id": "B003I024",
            "qid": "Q027",
            "qty": 32
          },
          {
            "id": "B003I025",
            "qid": "Q028",
            "qty": 32
          },
          {
            "id": "B003I026",
            "qid": "Q029",
            "qty": 38
          },
          {
            "id": "B003I027",
            "qid": "Q030",
            "qty": 2
          },
          {
            "id": "B003I028",
            "qid": "Q031",
            "qty": 270
          },
          {
            "id": "B003I029",
            "qid": "Q032",
            "qty": 270
          },
          {
            "id": "B003I030",
            "qid": "Q033",
            "qty": 230
          },
          {
            "id": "B003I031",
            "qid": "Q034",
            "qty": 230
          },
          {
            "id": "B003I032",
            "qid": "Q035",
            "qty": 230
          },
          {
            "id": "B003I033",
            "qid": "Q038",
            "qty": 78
          },
          {
            "id": "B003I034",
            "qid": "Q039",
            "qty": 62
          },
          {
            "id": "B003I035",
            "qid": "Q040",
            "qty": 4.5
          },
          {
            "id": "B003I036",
            "qid": "Q041",
            "qty": 3.2
          },
          {
            "id": "B003I037",
            "qid": "Q042",
            "qty": 4.5
          },
          {
            "id": "B003I038",
            "qid": "Q043",
            "qty": 6
          },
          {
            "id": "B003I039",
            "qid": "Q044",
            "qty": 6
          },
          {
            "id": "B003I040",
            "qid": "Q045",
            "qty": 1
          },
          {
            "id": "B003I041",
            "qid": "Q046",
            "qty": 1
          },
          {
            "id": "B003I042",
            "qid": "Q047",
            "qty": 2
          },
          {
            "id": "B003I043",
            "qid": "Q048",
            "qty": 2
          },
          {
            "id": "B003I044",
            "qid": "Q049",
            "qty": 2
          },
          {
            "id": "B003I045",
            "qid": "Q050",
            "qty": 12
          },
          {
            "id": "B003I046",
            "qid": "Q051",
            "qty": 1
          },
          {
            "id": "B003I047",
            "qid": "Q053",
            "qty": 1
          },
          {
            "id": "B003I048",
            "qid": "Q055",
            "qty": 1
          },
          {
            "id": "B003I049",
            "qid": "Q056",
            "qty": 14
          },
          {
            "id": "B003I050",
            "qid": "Q006",
            "qty": 60
          },
          {
            "id": "B003I051",
            "qid": "Q007",
            "qty": 22
          },
          {
            "id": "B003I052",
            "qid": "Q008",
            "qty": 9
          },
          {
            "id": "B003I053",
            "qid": "Q057",
            "qty": 8
          },
          {
            "id": "B003I054",
            "qid": "Q058",
            "qty": 1
          },
          {
            "id": "B003I055",
            "qid": "Q059",
            "qty": 4
          },
          {
            "id": "B003I056",
            "qid": "Q061",
            "qty": 1
          },
          {
            "id": "B003I057",
            "qid": "Q062",
            "qty": 110
          }
        ],
        "created": "2026-10-12",
        "updated": "2026-10-12"
      },
      {
        "id": "B004",
        "rev": 2,
        "code": "BJ001028",
        "name": "华润二十四城 · 张女士住宅 · 厨房翻新方案",
        "kind": "厨房翻新",
        "customer": "张女士",
        "address": "华润二十四城 3-1-1802",
        "house": "两室两厅一卫",
        "area": 90,
        "start": "2026-10-25",
        "status": "已提交",
        "items": [
          {
            "id": "B004I001",
            "qid": "Q073",
            "qty": 1
          },
          {
            "id": "B004I002",
            "qid": "Q064",
            "qty": 26
          },
          {
            "id": "B004I003",
            "qid": "Q066",
            "qty": 1
          },
          {
            "id": "B004I004",
            "qid": "Q026",
            "qty": 2
          },
          {
            "id": "B004I005",
            "qid": "Q001",
            "qty": 10
          },
          {
            "id": "B004I006",
            "qid": "Q004",
            "qty": 22
          },
          {
            "id": "B004I007",
            "qid": "Q006",
            "qty": 6
          },
          {
            "id": "B004I008",
            "qid": "Q014",
            "qty": 1
          },
          {
            "id": "B004I009",
            "qid": "Q018",
            "qty": 9
          },
          {
            "id": "B004I010",
            "qid": "Q019",
            "qty": 24
          },
          {
            "id": "B004I011",
            "qid": "Q068",
            "qty": 24
          },
          {
            "id": "B004I012",
            "qid": "Q022",
            "qty": 9
          },
          {
            "id": "B004I013",
            "qid": "Q023",
            "qty": 1
          },
          {
            "id": "B004I014",
            "qid": "Q056",
            "qty": 9
          },
          {
            "id": "B004I015",
            "qid": "Q040",
            "qty": 4.2
          },
          {
            "id": "B004I016",
            "qid": "Q041",
            "qty": 3
          },
          {
            "id": "B004I017",
            "qid": "Q042",
            "qty": 4.2
          },
          {
            "id": "B004I018",
            "qid": "Q053",
            "qty": 1
          },
          {
            "id": "B004I019",
            "qid": "Q054",
            "qty": 1
          },
          {
            "id": "B004I020",
            "qid": "Q055",
            "qty": 1
          },
          {
            "id": "B004I021",
            "qid": "Q051",
            "qty": 1
          },
          {
            "id": "B004I022",
            "qid": "Q062",
            "qty": 12
          }
        ],
        "created": "2026-10-12",
        "updated": "2026-10-12"
      },
      {
        "id": "B005",
        "rev": 2,
        "code": "BJ001029",
        "name": "华润二十四城 · 张女士住宅 · 卫生间翻新方案",
        "kind": "卫生间翻新",
        "customer": "张女士",
        "address": "华润二十四城 3-1-1802",
        "house": "两室两厅一卫",
        "area": 90,
        "start": "2026-10-25",
        "status": "已提交",
        "items": [
          {
            "id": "B005I001",
            "qid": "Q073",
            "qty": 1
          },
          {
            "id": "B005I002",
            "qid": "Q064",
            "qty": 30
          },
          {
            "id": "B005I003",
            "qid": "Q067",
            "qty": 4
          },
          {
            "id": "B005I004",
            "qid": "Q026",
            "qty": 2
          },
          {
            "id": "B005I005",
            "qid": "Q001",
            "qty": 12
          },
          {
            "id": "B005I006",
            "qid": "Q014",
            "qty": 1
          },
          {
            "id": "B005I007",
            "qid": "Q017",
            "qty": 22
          },
          {
            "id": "B005I008",
            "qid": "Q018",
            "qty": 5
          },
          {
            "id": "B005I009",
            "qid": "Q019",
            "qty": 26
          },
          {
            "id": "B005I010",
            "qid": "Q068",
            "qty": 26
          },
          {
            "id": "B005I011",
            "qid": "Q074",
            "qty": 5
          },
          {
            "id": "B005I012",
            "qid": "Q023",
            "qty": 1
          },
          {
            "id": "B005I013",
            "qid": "Q056",
            "qty": 5
          },
          {
            "id": "B005I014",
            "qid": "Q046",
            "qty": 1
          },
          {
            "id": "B005I015",
            "qid": "Q047",
            "qty": 1
          },
          {
            "id": "B005I016",
            "qid": "Q048",
            "qty": 1
          },
          {
            "id": "B005I017",
            "qid": "Q049",
            "qty": 1
          },
          {
            "id": "B005I018",
            "qid": "Q050",
            "qty": 5
          },
          {
            "id": "B005I019",
            "qid": "Q062",
            "qty": 8
          }
        ],
        "created": "2026-10-12",
        "updated": "2026-10-12"
      },
      {
        "id": "B006",
        "rev": 2,
        "code": "BJ001030",
        "name": "华润二十四城 · 张女士住宅 · 全屋墙面涂料刷新方案",
        "kind": "墙面刷新",
        "customer": "张女士",
        "address": "华润二十四城 3-1-1802",
        "house": "两室两厅一卫",
        "area": 90,
        "start": "2026-10-18",
        "status": "已提交",
        "items": [
          {
            "id": "B006I001",
            "qid": "Q073",
            "qty": 1
          },
          {
            "id": "B006I002",
            "qid": "Q069",
            "qty": 40
          },
          {
            "id": "B006I003",
            "qid": "Q031",
            "qty": 240
          },
          {
            "id": "B006I004",
            "qid": "Q032",
            "qty": 240
          },
          {
            "id": "B006I005",
            "qid": "Q033",
            "qty": 240
          },
          {
            "id": "B006I006",
            "qid": "Q034",
            "qty": 240
          },
          {
            "id": "B006I007",
            "qid": "Q035",
            "qty": 240
          },
          {
            "id": "B006I008",
            "qid": "Q029",
            "qty": 32
          },
          {
            "id": "B006I009",
            "qid": "Q039",
            "qty": 55
          },
          {
            "id": "B006I010",
            "qid": "Q062",
            "qty": 90
          }
        ],
        "created": "2026-10-12",
        "updated": "2026-10-12"
      },
      {
        "id": "B007",
        "rev": 2,
        "code": "BJ001031",
        "name": "华润二十四城 · 张女士住宅 · 厨房厨柜焕新方案",
        "kind": "厨柜焕新",
        "customer": "张女士",
        "address": "华润二十四城 3-1-1802",
        "house": "两室两厅一卫",
        "area": 90,
        "start": "2026-10-16",
        "status": "已提交",
        "items": [
          {
            "id": "B007I001",
            "qid": "Q073",
            "qty": 1
          },
          {
            "id": "B007I002",
            "qid": "Q066",
            "qty": 1
          },
          {
            "id": "B007I003",
            "qid": "Q026",
            "qty": 1
          },
          {
            "id": "B007I004",
            "qid": "Q070",
            "qty": 12
          },
          {
            "id": "B007I005",
            "qid": "Q071",
            "qty": 8
          },
          {
            "id": "B007I006",
            "qid": "Q040",
            "qty": 1.5
          },
          {
            "id": "B007I007",
            "qid": "Q041",
            "qty": 1
          },
          {
            "id": "B007I008",
            "qid": "Q042",
            "qty": 4.2
          },
          {
            "id": "B007I009",
            "qid": "Q053",
            "qty": 1
          },
          {
            "id": "B007I010",
            "qid": "Q050",
            "qty": 6
          },
          {
            "id": "B007I011",
            "qid": "Q062",
            "qty": 10
          }
        ],
        "created": "2026-10-12",
        "updated": "2026-10-12"
      },
      {
        "id": "B008",
        "rev": 2,
        "code": "BJ001032",
        "name": "华润二十四城 · 张女士住宅 · 全屋吊顶灯管焕新方案",
        "kind": "吊顶焕新",
        "customer": "张女士",
        "address": "华润二十四城 3-1-1802",
        "house": "两室两厅一卫",
        "area": 90,
        "start": "2026-10-16",
        "status": "已提交",
        "items": [
          {
            "id": "B008I001",
            "qid": "Q073",
            "qty": 1
          },
          {
            "id": "B008I002",
            "qid": "Q065",
            "qty": 40
          },
          {
            "id": "B008I003",
            "qid": "Q026",
            "qty": 2
          },
          {
            "id": "B008I004",
            "qid": "Q027",
            "qty": 40
          },
          {
            "id": "B008I005",
            "qid": "Q028",
            "qty": 40
          },
          {
            "id": "B008I006",
            "qid": "Q031",
            "qty": 40
          },
          {
            "id": "B008I007",
            "qid": "Q032",
            "qty": 40
          },
          {
            "id": "B008I008",
            "qid": "Q033",
            "qty": 40
          },
          {
            "id": "B008I009",
            "qid": "Q034",
            "qty": 40
          },
          {
            "id": "B008I010",
            "qid": "Q006",
            "qty": 12
          },
          {
            "id": "B008I011",
            "qid": "Q007",
            "qty": 26
          },
          {
            "id": "B008I012",
            "qid": "Q008",
            "qty": 6
          },
          {
            "id": "B008I013",
            "qid": "Q072",
            "qty": 32
          },
          {
            "id": "B008I014",
            "qid": "Q062",
            "qty": 90
          }
        ],
        "created": "2026-10-12",
        "updated": "2026-10-12"
      }
    ],
  quoteKinds: ["毛坯整装", "老房整体翻新", "厨房翻新", "卫生间翻新", "墙面刷新", "厨柜焕新", "吊顶焕新", "其他"]
};
