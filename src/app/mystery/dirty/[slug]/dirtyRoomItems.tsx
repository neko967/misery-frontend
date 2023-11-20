// アイテム型定義
type Item = {
  id: number;
  name: string;
  imagePath?: string;
  positionClasses: string;
  width?: string; // 例: "w-32"
  height?: string; // 例: "h-32"
  additionalStyles?: React.CSSProperties;
  messages: {
    text: string;
    choices: {
      confirmText: string;
      cancelText: string;
    }| null;
  }[];
};

export const GetDirtyItem = () => {
  // 配列にて、アイテム、メッセージ、選択肢等をオブジェクトの形で管理。
  const items: Item[] = [
    {
      id: 1,
      name: '日記',
      positionClasses: "absolute top-2/3 left-1/3 translate-x-[calc(-50%)] translate-y-[calc(-50%)] opacity-0",
      width: "w-36",
      height: "h-16",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "ベッドの上に誰かの日記がある。読みますか？",
          choices: {
            confirmText: "読む",
            cancelText: "読まない"
          }
        },
      ]
    },
    {
      id: 2,
      name: '青い箱',
      imagePath: '/box_blue.png',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%+90px)] translate-y-[calc(-50%+130px)] opacity-0",
      width: "w-20",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "ボロボロの鍵がかかっている...衝撃を加えれば壊れそうだ。",
          choices: null
        },
        {
          text: "鍵が壊れている...開けますか？",
          choices: {
            confirmText: "開ける",
            cancelText: "開けない"
          }
        },
        {
          text: "青い箱を手に入れた",
          choices: null
        },
        {
          text: "引き出しの中は空っぽだ。",
          choices: null
        },
        {
          text: "何かが砕け散る音がした。",
          choices: null
        },
        {
          text: "どこかでカギの開く音がした...",
          choices: null
        },
      ]
    },
    {
      id: 3,
      name: 'ドア',
      positionClasses: "absolute top-1/2 left-2/3 translate-x-[calc(-50%+120px)] translate-y-[calc(-50%)] w-36 h-96 opacity-0 text-white",
      width: "w-24",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "ドアは不思議な力で固く閉ざされている",
          choices: null
        },
        {
          text: "ドアが開いているが、もう一人を置いていくわけにはいかない...",
          choices: null
        },
        {
          text: "ドアが開いている。ここから抜け出せそうだ",
          choices: {
            confirmText: "出る",
            cancelText: "やめておく"
          }
        },
        {
          text: "鍵穴が完全に破壊されている。",
          choices: null
        }
      ]
    },
    {
      id: 4,
      name: 'オルゴール',
      positionClasses: `absolute top-1/2 left-1/2 translate-x-[calc(-50%+90px)] translate-y-[calc(-50%+30px)] opacity-0`,
      width: "w-24",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "引き出しを開けた。オルゴールがある。鳴らしてみますか？",
          choices: {
            confirmText: "鳴らす",
            cancelText: "やめておく"
          }
        }
      ]
    },
    {
      id: 5,
      name: 'ぬいぐるみ',
      imagePath: '/stuffed_bear.png',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%-150px)] translate-y-[calc(-50%+200px)] -skew-y-12 opacity-0",
      width: "w-64",
      height: "h-12",
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "ベッドの下に何かある...手を伸ばして取りますか？",
          choices: {
            confirmText: "手を伸ばす",
            cancelText: "やめておく"
          }
        },
        {
          text: "ぬいぐるみを手に入れた",
          choices: null
        },
        {
          text: "ベッドの下にはもう何もない",
          choices: null
        },
        {
          text: "ぬいぐるみをハサミで切った。中からカギが2本出てきた",
          choices: null
        }
      ]
    },
    {
      id: 6,
      name: 'はさみ',
      positionClasses: "invisible",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "はさみを受け取った",
          choices: null
        },
        {
          text: "はさみを渡した",
          choices: null
        }
      ]
    },
    {
      id: 7,
      name: '青いカギ',
      positionClasses: "invisible",
      // コメントアウトで、クリック部分の色を消す
      messages: [
        {
          text: "青いカギを受け取った",
          choices: null,
        },
        {
          text: "青いカギを渡した",
          choices: null,
        },
      ]
    },
    {
      id: 8,
      name: '赤いカギ',
      positionClasses: "invisible",
      // コメントアウトで、クリック部分の色を消す
      messages: [
        {
          text: "赤いカギを受け取った",
          choices: null,
        },
        {
          text: "赤いカギを渡した",
          choices: null,
        },
      ]
    },
    {
      id: 9,
      name: '窓',
      positionClasses: `absolute top-1/3 left-1/4 translate-x-[calc(-50%+90px)] translate-y-[calc(-50%+30px)] opacity-0`,
      width: "w-36",
      height: "h-64",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "窓だ。月明かりに照らされている。",
          choices: null
        }
      ]
    },
    {
      id: 10,
      name: '絵画',
      positionClasses: `absolute top-1/3 left-1/2 translate-x-[calc(-50%+115px)] translate-y-[calc(-50%-35px)] opacity-0`,
      width: "w-36",
      height: "h-36",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "変な絵だなぁ。",
          choices: null
        }
      ]
    },
    {
      id: 11,
      name: '蜘蛛の巣',
      positionClasses: `absolute top-1/3 left-1/3 translate-x-[calc(-50%+115px)] translate-y-[calc(-50%-35px)] opacity-0`,
      width: "w-36",
      height: "h-48",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "蜘蛛の巣だ。ばっちぃ",
          choices: null
        }
      ]
    },
    {
      id: 12,
      name: '枕',
      positionClasses: `absolute top-1/2 left-1/2 translate-x-[calc(-50%-80px)] translate-y-[calc(-50%+80px)] opacity-0`,
      width: "w-36",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "枕だ。硬さはあまり好みじゃない。",
          choices: null
        }
      ]
    },
    {
      id: 13,
      name: '椅子',
      positionClasses: `absolute top-2/3 left-1/4 translate-x-[calc(-50%-90px)] translate-y-[calc(-50%+60px)] opacity-0`,
      width: "w-48",
      height: "h-24",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "椅子がある。一旦落ち着いてと。",
          choices: null
        }
      ]
    },
    {
      id: 14,
      name: '時計',
      positionClasses: `absolute top-1/4 left-1/4 translate-x-[calc(-50%-100px)] translate-y-[calc(-50%+40px)] opacity-0`,
      width: "w-28",
      height: "h-36",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "時計がある。針は止まっているようだ。",
          choices: null
        }
      ]
    },
  ];

  return items;
}