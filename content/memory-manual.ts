export interface MemoryManualPage {
  id: string;
  title: string;
  src: string;
  alt: string;
}

export interface MemoryManual {
  title: string;
  subtitle: string;
  trainingHref: string;
  pages: MemoryManualPage[];
}

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
      src: "/assets/memory-manual/chenshuo-dangwei-03.jpg",
      alt: "陈硕档位法左右脚映射说明"
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
