/* ============================================================
   Sound Safari - word banks
   Articulation targets organised by sound and word position.
   Each word has an emoji so non-readers can play.
   ============================================================ */

const SOUNDS = {
  s: {
    label: "S sound",
    tip: "Smile, teeth together, push air down the middle. Like a snake: ssss.",
    free: true,                       // /s/ is the free taster sound
    words: {
      initial: [
        { w: "sun", e: "☀️" }, { w: "soup", e: "🍲" }, { w: "sock", e: "🧦" },
        { w: "soap", e: "🧼" }, { w: "seal", e: "🦭" }, { w: "snake", e: "🐍" },
        { w: "star", e: "⭐" }, { w: "six", e: "6️⃣" }, { w: "soccer", e: "⚽" },
        { w: "sandwich", e: "🥪" },
      ],
      medial: [
        { w: "bicycle", e: "🚲" }, { w: "pencil", e: "✏️" }, { w: "castle", e: "🏰" },
        { w: "glasses", e: "👓" }, { w: "dinosaur", e: "🦕" }, { w: "eraser", e: "🧽" },
        { w: "whistle", e: "😗" }, { w: "messy", e: "🌀" },
      ],
      final: [
        { w: "bus", e: "🚌" }, { w: "house", e: "🏠" }, { w: "dress", e: "👗" },
        { w: "mouse", e: "🐭" }, { w: "glass", e: "🥛" }, { w: "ice", e: "🧊" },
        { w: "juice", e: "🧃" }, { w: "horse", e: "🐴" }, { w: "goose", e: "🦢" },
      ],
    },
  },

  r: {
    label: "R sound",
    tip: "Pull your tongue back and up, lips a little round. Growl like a tiger: rrr.",
    words: {
      initial: [
        { w: "rabbit", e: "🐰" }, { w: "rain", e: "🌧️" }, { w: "ring", e: "💍" },
        { w: "robot", e: "🤖" }, { w: "rocket", e: "🚀" }, { w: "rose", e: "🌹" },
        { w: "ruler", e: "📏" }, { w: "road", e: "🛣️" },
      ],
      medial: [
        { w: "carrot", e: "🥕" }, { w: "arrow", e: "🏹" }, { w: "zebra", e: "🦓" },
        { w: "parrot", e: "🦜" }, { w: "cherry", e: "🍒" }, { w: "orange", e: "🍊" },
        { w: "fairy", e: "🧚" }, { w: "koala", e: "🐨" },
      ],
      final: [
        { w: "car", e: "🚗" }, { w: "star", e: "⭐" }, { w: "door", e: "🚪" },
        { w: "bear", e: "🐻" }, { w: "chair", e: "🪑" }, { w: "four", e: "4️⃣" },
        { w: "ear", e: "👂" }, { w: "deer", e: "🦌" },
      ],
    },
  },

  l: {
    label: "L sound",
    tip: "Tip of the tongue up behind your top teeth. Sing: la la la.",
    words: {
      initial: [
        { w: "lion", e: "🦁" }, { w: "leaf", e: "🍃" }, { w: "lamp", e: "💡" },
        { w: "lemon", e: "🍋" }, { w: "leg", e: "🦵" }, { w: "lock", e: "🔒" },
        { w: "ladder", e: "🪜" }, { w: "lollipop", e: "🍭" },
      ],
      medial: [
        { w: "balloon", e: "🎈" }, { w: "jelly", e: "🍮" }, { w: "yellow", e: "🟡" },
        { w: "koala", e: "🐨" }, { w: "salad", e: "🥗" }, { w: "umbrella", e: "☂️" },
        { w: "pillow", e: "🛏️" }, { w: "violin", e: "🎻" },
      ],
      final: [
        { w: "ball", e: "⚽" }, { w: "apple", e: "🍎" }, { w: "bell", e: "🔔" },
        { w: "school", e: "🏫" }, { w: "snail", e: "🐌" }, { w: "whale", e: "🐳" },
        { w: "owl", e: "🦉" }, { w: "table", e: "🪑" },
      ],
    },
  },

  sh: {
    label: "SH sound",
    tip: "Round your lips, push the air out long and quiet. Say: shhh.",
    words: {
      initial: [
        { w: "shoe", e: "👟" }, { w: "ship", e: "🚢" }, { w: "shark", e: "🦈" },
        { w: "sheep", e: "🐑" }, { w: "shell", e: "🐚" }, { w: "shirt", e: "👕" },
        { w: "shower", e: "🚿" }, { w: "shovel", e: "🦪" },
      ],
      medial: [
        { w: "ocean", e: "🌊" }, { w: "washing", e: "🧺" }, { w: "dishes", e: "🍽️" },
        { w: "fishing", e: "🎣" }, { w: "machine", e: "⚙️" }, { w: "cushion", e: "🛋️" },
      ],
      final: [
        { w: "fish", e: "🐟" }, { w: "brush", e: "🪥" }, { w: "dish", e: "🍽️" },
        { w: "bush", e: "🌳" }, { w: "splash", e: "💦" }, { w: "leash", e: "🐕" },
      ],
    },
  },

  ch: {
    label: "CH sound",
    tip: "Tongue up, then pop the air out. Like a train: ch ch ch.",
    words: {
      initial: [
        { w: "chair", e: "🪑" }, { w: "cheese", e: "🧀" }, { w: "chicken", e: "🐔" },
        { w: "cherry", e: "🍒" }, { w: "chips", e: "🍟" }, { w: "chocolate", e: "🍫" },
        { w: "church", e: "⛪" }, { w: "chin", e: "😀" },
      ],
      medial: [
        { w: "teacher", e: "👩‍🏫" }, { w: "kitchen", e: "🍳" }, { w: "matches", e: "🔥" },
        { w: "sandwich", e: "🥪" }, { w: "popcorn", e: "🍿" },
      ],
      final: [
        { w: "beach", e: "🏖️" }, { w: "watch", e: "⌚" }, { w: "peach", e: "🍑" },
        { w: "lunch", e: "🥪" }, { w: "bench", e: "🪑" }, { w: "branch", e: "🌿" },
      ],
    },
  },

  k: {
    label: "K sound",
    tip: "Back of the tongue lifts up to make a little cough: k, k, k.",
    words: {
      initial: [
        { w: "cat", e: "🐱" }, { w: "key", e: "🔑" }, { w: "king", e: "👑" },
        { w: "kite", e: "🪁" }, { w: "cake", e: "🍰" }, { w: "cow", e: "🐄" },
        { w: "cup", e: "☕" }, { w: "cookie", e: "🍪" },
      ],
      medial: [
        { w: "monkey", e: "🐒" }, { w: "bucket", e: "🪣" }, { w: "rocket", e: "🚀" },
        { w: "jacket", e: "🧥" }, { w: "pumpkin", e: "🎃" }, { w: "basket", e: "🧺" },
      ],
      final: [
        { w: "book", e: "📖" }, { w: "duck", e: "🦆" }, { w: "sock", e: "🧦" },
        { w: "snake", e: "🐍" }, { w: "cake", e: "🍰" }, { w: "milk", e: "🥛" },
        { w: "truck", e: "🚚" },
      ],
    },
  },

  g: {
    label: "G sound",
    tip: "Back of the tongue lifts, switch your voice on: g, g, g.",
    words: {
      initial: [
        { w: "goat", e: "🐐" }, { w: "gate", e: "🚧" }, { w: "gift", e: "🎁" },
        { w: "girl", e: "👧" }, { w: "ghost", e: "👻" }, { w: "goose", e: "🦢" },
        { w: "gold", e: "🥇" }, { w: "guitar", e: "🎸" },
      ],
      medial: [
        { w: "tiger", e: "🐅" }, { w: "wagon", e: "🛒" }, { w: "dragon", e: "🐉" },
        { w: "magnet", e: "🧲" }, { w: "eagle", e: "🦅" }, { w: "sugar", e: "🍬" },
      ],
      final: [
        { w: "dog", e: "🐕" }, { w: "frog", e: "🐸" }, { w: "pig", e: "🐖" },
        { w: "bag", e: "🎒" }, { w: "egg", e: "🥚" }, { w: "flag", e: "🚩" },
        { w: "bug", e: "🐛" },
      ],
    },
  },

  f: {
    label: "F sound",
    tip: "Top teeth gently on your bottom lip, blow: fff.",
    words: {
      initial: [
        { w: "fish", e: "🐟" }, { w: "fan", e: "🌀" }, { w: "fork", e: "🍴" },
        { w: "foot", e: "🦶" }, { w: "fire", e: "🔥" }, { w: "farm", e: "🚜" },
        { w: "feather", e: "🪶" }, { w: "flower", e: "🌸" },
      ],
      medial: [
        { w: "elephant", e: "🐘" }, { w: "telephone", e: "☎️" }, { w: "sofa", e: "🛋️" },
        { w: "muffin", e: "🧁" }, { w: "coffee", e: "☕" }, { w: "trophy", e: "🏆" },
      ],
      final: [
        { w: "leaf", e: "🍃" }, { w: "knife", e: "🔪" }, { w: "roof", e: "🏠" },
        { w: "wolf", e: "🐺" }, { w: "scarf", e: "🧣" }, { w: "giraffe", e: "🦒" },
      ],
    },
  },

  th: {
    label: "TH sound",
    tip: "Poke your tongue tip out a little between your teeth and blow: th.",
    words: {
      initial: [
        { w: "thumb", e: "👍" }, { w: "three", e: "3️⃣" }, { w: "thread", e: "🧵" },
        { w: "thunder", e: "⛈️" }, { w: "thirty", e: "🔢" }, { w: "throne", e: "👑" },
      ],
      final: [
        { w: "bath", e: "🛁" }, { w: "tooth", e: "🦷" }, { w: "mouth", e: "👄" },
        { w: "math", e: "➗" }, { w: "moth", e: "🦟" }, { w: "teeth", e: "🦷" },
      ],
    },
  },
};

const POSITIONS = [
  { id: "initial", label: "Start of word" },
  { id: "medial",  label: "Middle of word" },
  { id: "final",   label: "End of word" },
];

const LEVELS = [
  { id: "word",     label: "Word",     premium: false },
  { id: "phrase",   label: "Phrase",   premium: true  },
  { id: "sentence", label: "Sentence", premium: true  },
];

/* Carrier phrases/sentences wrap the target word for higher levels. */
const CARRIERS = {
  phrase: ["a big ___", "my little ___", "I see a ___", "look, a ___", "this ___"],
  sentence: [
    "I can see the ___ over there.",
    "Can you find the ___ for me?",
    "Look at the funny ___ go!",
    "I really like that ___.",
    "We found a ___ on our safari.",
  ],
};

/* Safari scenes the explorer travels through as they collect animals. */
const SCENES = [
  { name: "Savanna",   emoji: "🌾", sky: "#ffe7a8" },
  { name: "Jungle",    emoji: "🌴", sky: "#bde8b0" },
  { name: "River",     emoji: "🏞️", sky: "#aee0f0" },
  { name: "Mountains", emoji: "⛰️", sky: "#e6d3f5" },
  { name: "Sunset",    emoji: "🌅", sky: "#ffc6a0" },
];
