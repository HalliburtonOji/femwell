// LC15 Ideas edition. The audio is generated once from this exact authored
// script and served as a static versioned file, never synthesized on Play.
// It has its own Save key and an exact route through its parent Bulletin.
export const SKY_SHORT_LISTEN_IDEA = {
  id: "sky-listen-moon-kitchen",
  version: 1,
  parentBulletinId: "bulletin-kitchen",
  title: "When the Moon clocked out",
  audioUrl: "/audio/short-listens/sky-moon-kitchen-v1.mp3",
  durationSeconds: 66,
  transcript: `The Moon came down to the kitchen at eleven, when the sink was full and everybody sensible was in bed. She wore an old silver coat and looked, frankly, tired of being called mysterious.

“Evening,” she said. “Is that plate yours?”

It was. So was the saucepan, the mug with the chipped handle, and the teaspoon that had somehow made it into a houseplant. The Moon rolled up her sleeves. Apparently, a billion years in the sky teaches you nothing about where people put teaspoons.

They washed in companionable silence until a song came on. The woman sang the wrong words. The Moon sang none at all, but kept time with a dishcloth. Outside, clouds wandered past the window as if they had somewhere better to be.

When the last plate was dry, the Moon put her coat back on. “You can leave the pan till morning,” she said.

The woman looked at the pan. Then at the clock. Then she turned out the light. Even mythical guests know when a kitchen is closed.`,
};

export const skyShortListenKey = edition => `sky-short-listen:${edition.id}:v${edition.version}`;
export const skyShortListenRoute = (edition, bulletinRoute) => {
  const url = new URL(bulletinRoute, "https://femwells.com");
  url.searchParams.set("listen", edition.id);
  url.searchParams.set("listenVersion", String(edition.version));
  return `${url.pathname}${url.search}${url.hash}`;
};
