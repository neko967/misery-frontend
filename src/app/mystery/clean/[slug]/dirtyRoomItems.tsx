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

export const GetDirtyItem = () => {

  // 配列にて、アイテム、メッセージ、選択肢等をオブジェクトの形で管理。
  const dirtyRoomItems: Item[] = [
    {
      id: 1,
      name: '青い箱',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%+90px)] translate-y-[calc(-50%+130px)] opacity-0",
      width: "w-36",
      height: "h-16",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "何かが砕け散る音がした。",
          choices: null
        }
      ]
    },
    {
      id: 2,
      name: 'ドア',
      positionClasses: "absolute top-1/2 left-2/3 translate-x-[calc(-50%+120px)] translate-y-[calc(-50%)] w-36 h-96 opacity-0 text-white",
      width: "w-24",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "木製の何かに当たる音がした。",
          choices: null
        }
      ]
    },
    {
      id: 3,
      name: 'ベッド',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%-150px)] translate-y-[calc(-50%+100px)] -skew-y-12 opacity-0",
      width: "w-64",
      height: "h-24",
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "柔らかい何かに当たる音がした。",
          choices: null
        },
      ]
    },
    {
      id: 4,
      name: '枕',
      positionClasses: `absolute top-1/2 left-1/2 translate-x-[calc(-50%-80px)] translate-y-[calc(-50%+80px)] opacity-0`,
      width: "w-36",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "ボスっという音がした",
          choices: null
        }
      ]
    },
    {
      id: 5,
      name: '窓',
      positionClasses: `absolute top-1/3 left-1/4 translate-x-[calc(-50%+90px)] translate-y-[calc(-50%+30px)] opacity-0`,
      width: "w-36",
      height: "h-64",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "硬いものに当たる音がした。",
          choices: null
        }
      ]
    },
    {
      id: 6,
      name: '椅子',
      positionClasses: `absolute top-2/3 left-1/4 translate-x-[calc(-50%-90px)] translate-y-[calc(-50%+60px)] opacity-0`,
      width: "w-48",
      height: "h-24",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "木製の何かに当たった。落ち着かない。",
          choices: null
        }
      ]
    },
    {
      id: 7,
      name: '時計',
      positionClasses: `absolute top-1/4 left-1/4 translate-x-[calc(-50%-100px)] translate-y-[calc(-50%+40px)] opacity-0`,
      width: "w-28",
      height: "h-36",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "何かに当たった。時が止まった気がした。",
          choices: null
        }
      ]
    },
    {
      id: 8,
      name: '絵画',
      positionClasses: `absolute top-1/3 left-1/2 translate-x-[calc(-50%+115px)] translate-y-[calc(-50%-35px)] opacity-0`,
      width: "w-36",
      height: "h-36",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "何か変なものに当たった気がする。",
          choices: null
        }
      ]
    },
  ];

  return dirtyRoomItems;
}