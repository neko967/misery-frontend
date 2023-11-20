// アイテム型定義
type Item = {
  id: number;
  name: string;
  imagePath?: string;
  positionClasses?: string;
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

export const GetCleanItem = () => {

  // 配列にて、アイテム、メッセージ、選択肢等をオブジェクトの形で管理。
  const cleanRoomItems: Item[] = [
    {
      id: 1,
      name: '日記',
      positionClasses: "absolute top-3/4 left-3/4 translate-x-[calc(-50%-40px)] translate-y-[calc(-50%+100px)] opacity-0",
      width: "w-32",
      height: "h-16",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "誰かの日記が落ちている。読みますか？",
          choices: {
            confirmText: "読む",
            cancelText: "読まない"
          }
        },
        {
          text: "日記がちょっと傷ついた。",
          choices: null
        },
      ]
    },
    {
      id: 2,
      name: '赤い箱',
      imagePath: '/box_red.png',
      positionClasses: "absolute top-2/3 left-1/4 translate-x-[calc(-50%+110px)] translate-y-[calc(-50%+30px)] opacity-0",
      width: "w-12",
      height: "h-20",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "棚にボロボロの鍵がかかっている...衝撃を加えれば壊れそうだ。",
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
          text: "赤い箱を手に入れた",
          choices: null
        },
        {
          text: "引き出しの中は空っぽだ。",
          choices: null
        },
        {
          text: "ボロボロの鍵は砕け散った。",
          choices: null
        },
        {
          text: "鍵はすでに壊れている。",
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
      positionClasses: "absolute top-1/2 left-1/3 translate-x-[calc(-50%-130px)] translate-y-[calc(-50%+60px)] w-30 h-96 opacity-0 text-white",
      width: "w-24",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "ドアは不思議な力で固く閉ざされている。",
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
          text: "弾は虚しく弾かれた。",
          choices: null
        },
        {
          text: "鍵穴が完全に破壊されている。",
          choices: null
        }
      ]
    },
    {
      id: 4,
      name: 'パスワード付きの箱',
      imagePath: '/passwordbox.png',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%-35px)] translate-y-[calc(-50%+195px)] opacity-0",
      width: "w-32",
      height: "h-16",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "大きな箱だ。パスワードがかけられている。",
          choices: {
            confirmText: "見てみる",
            cancelText: "やめておく"
          }
        },
        {
          text: "大きな箱だ。すでに開いている。",
          choices: null
        },
        {
          text: "キィンという音がした。",
          choices: null
        }
      ]
    },
    {
      id: 5,
      name: '銃',
      positionClasses: "invisible",
      messages: [
        {
          text: "箱が開いた。銃を手に入れた。",
          choices: null
        },
        {
          text: "壁の穴に銃口を当てた。向こうの部屋の様子がうっすらと見える。",
          choices: null
        },
        {
          text: "壁の穴に銃口を当てた。何かが邪魔で向こうの部屋がよく見えない。",
          choices: null
        }
      ]
    },
    {
      id: 6,
      name: 'はさみ',
      positionClasses: "absolute top-1/2 left-2/3 translate-x-[calc(-50%-25px)] translate-y-[calc(-50%+160px)] opacity-0",
      width: "w-36",
      height: "h-16",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "ベッドの上にはさみがある。拾いますか？",
          choices: {
            confirmText: "拾う",
            cancelText: "拾わない"
          }
        },
        {
          text: "はさみを手に入れた",
          choices: null
        },
        {
          text: "ベッドの上には何もない",
          choices: null
        },
        {
          text: "はさみを受け取った",
          choices: null
        },
        {
          text: "はさみを渡した",
          choices: null
        },
        {
          text: "ボスっという音がした。",
          choices: null
        },
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
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%-40px)] translate-y-[calc(-50%-40px)] opacity-0 text-white",
      width: "w-36",
      height: "h-72",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "窓だ。月明かりに見惚れてしまう",
          choices: null
        },
        {
          text: "割れない。なんて頑丈な窓なんだ。",
          choices: null
        },
      ]
    },
    {
      id: 10,
      name: '絵画',
      positionClasses: "absolute top-1/2 left-3/4 translate-x-[calc(-50%-20px)] translate-y-[calc(-50%-80px)] -skew-y-12 opacity-0",
      width: "w-36",
      height: "h-36",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "大きな絵が飾られている。立派だ。",
          choices: null
        },
        {
          text: "絵を撃ってみた。罰当たりな気分になった。",
          choices: null
        },
      ]
    },
    {
      id: 11,
      name: '本',
      positionClasses: "absolute top-3/4 left-1/3 translate-x-[calc(-50%+50px)] translate-y-[calc(-50%+80px)] opacity-0",
      width: "w-16",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "本に何か書かれている。【3XXX】",
          choices: null
        },
        {
          text: "本がちょっと傷ついた。",
          choices: null
        },
      ]
    },
    {
      id: 12,
      name: '左カーテン',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%-160px)] translate-y-[calc(-50%-100px)] opacity-0",
      width: "w-24",
      height: "h-64",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "重厚なカーテンだ。とても重そう。",
          choices: null
        },
        {
          text: "カーテンを撃った。弾は優しく包まれた",
          choices: null
        },
      ]
    },
    {
      id: 13,
      name: '右カーテン',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%+70px)] translate-y-[calc(-50%-100px)] opacity-0",
      width: "w-24",
      height: "h-64",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "重厚なカーテンだ。とても重そう。",
          choices: null
        },
        {
          text: "カーテンを撃った。弾は優しく包まれた",
          choices: null
        },
      ]
    },
  ];

  return cleanRoomItems;
};