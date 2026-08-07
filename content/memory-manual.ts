export interface MemoryManualImagePage {
  id: string;
  title: string;
  src: string;
  alt: string;
  type?: "image";
}

export interface MemoryManualMappingPage {
  id: string;
  title: string;
  type: "mapping";
}

export type MemoryManualPage = MemoryManualImagePage | MemoryManualMappingPage;

export interface JokerFootPosition {
  label: "垂放" | "前伸" | "后撤";
  gear: "空档" | "1 档" | "2 档" | "3 档" | "4 档";
  appearedCount: 0 | 1 | 2;
}

export interface JokerFootMapping {
  foot: "左脚" | "右脚";
  joker: "小王" | "大王";
  pokerRank: "SJ" | "BJ";
  positions: readonly JokerFootPosition[];
}

export interface MemoryManual {
  title: string;
  subtitle: string;
  trainingHref: string;
  pages: MemoryManualPage[];
}

// 档位法的唯一规则来源：左脚只记录小王，右脚只记录大王。
export const jokerFootMappings = [
  {
    foot: "左脚",
    joker: "小王",
    pokerRank: "SJ",
    positions: [
      { label: "垂放", gear: "空档", appearedCount: 0 },
      { label: "前伸", gear: "1 档", appearedCount: 1 },
      { label: "后撤", gear: "2 档", appearedCount: 2 }
    ]
  },
  {
    foot: "右脚",
    joker: "大王",
    pokerRank: "BJ",
    positions: [
      { label: "垂放", gear: "空档", appearedCount: 0 },
      { label: "前伸", gear: "3 档", appearedCount: 1 },
      { label: "后撤", gear: "4 档", appearedCount: 2 }
    ]
  }
] as const satisfies readonly JokerFootMapping[];

export const memoryManual: MemoryManual = {
  title: "陈硕档位法手册",
  subtitle: "动动脚轻松记大小王",
  trainingHref: "/practice/practice-when-to-bomb-001",
  pages: [
    {
      id: "dangwei-cover",
      title: "档位法总览",
      src: "/assets/memory-manual/chenshuo-dangwei-01.jpg",
      alt: "陈硕档位法手册封面"
    },
    {
      id: "dangwei-origin",
      title: "档位法灵感",
      src: "/assets/memory-manual/chenshuo-dangwei-02.jpg",
      alt: "陈硕档位法灵感说明"
    },
    {
      id: "dangwei-map",
      title: "左右脚映射",
      type: "mapping"
    },
    {
      id: "small-joker-zero",
      title: "小王 0 张",
      src: "/assets/memory-manual/chenshuo-dangwei-04.jpg",
      alt: "左脚垂放代表小王出了 0 张"
    },
    {
      id: "small-joker-one",
      title: "小王 1 张",
      src: "/assets/memory-manual/chenshuo-dangwei-05.jpg",
      alt: "左脚前伸代表小王出了 1 张"
    },
    {
      id: "small-joker-two",
      title: "小王 2 张",
      src: "/assets/memory-manual/chenshuo-dangwei-06.jpg",
      alt: "左脚后伸代表小王出了 2 张"
    },
    {
      id: "big-joker-zero",
      title: "大王 0 张",
      src: "/assets/memory-manual/chenshuo-dangwei-07.jpg",
      alt: "右脚垂放代表大王出了 0 张"
    },
    {
      id: "big-joker-one",
      title: "大王 1 张",
      src: "/assets/memory-manual/chenshuo-dangwei-08.jpg",
      alt: "右脚前伸代表大王出了 1 张"
    },
    {
      id: "big-joker-two",
      title: "大王 2 张",
      src: "/assets/memory-manual/chenshuo-dangwei-09.jpg",
      alt: "右脚后退代表大王出了 2 张"
    }
  ]
};
