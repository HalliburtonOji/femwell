// Complete local Ideas editions for the eight Good life doors that lacked a
// topic-fit first piece. These are editorial drafts, not published Base44 rows.
// Each room owns a single first choice; the full older library stays available.
const draft = (id, title, summary, category, duration_label, lede, source_links = []) => ({
  id, title, summary, category, duration_label, lede, source_links,
  editorial_local: true, status: "NEEDS_REVIEW", media_type: "ARTICLE",
  content_type: "GUIDE", author_name: "FemWell · Ideas draft",
  source_name: "FemWell · Ideas draft",
});

export const GOOD_LIFE_ROOM_EDITIONS = [
  draft("ideas-good-mirror-own-wardrobe", "The outfit already in your wardrobe",
    "A tiny colour experiment. No haul, no new body, no new you.", "Fashion", "About 2 min read",
    `Open the wardrobe and find the piece you keep almost wearing. The scarf with a ridiculous amount of colour. The shirt that makes you stand a little differently. The earrings you save for an occasion that has yet to send an invitation.

Put it on with the most ordinary thing you own. Not a whole new outfit. Jeans, a plain top, shoes you can actually walk in. Give the interesting piece one job: be seen. If it still feels too much, keep only a flash of it — a cuff, a collar, a knot at the bag handle.

Now move around for a minute. Sit. Reach for a cup. Walk to the door. Can you live in it, or is it a photograph pretending to be clothing? Change what pinches or slips. Looking good is a poor bargain if you spend the day adjusting it.

The point isn't to dress for a mood the app has guessed. You chose “Bright & bold”; you get to decide what that means today. Sometimes it means red socks under sensible trousers. Sometimes it means the whole glorious shirt. Both count, and neither requires a shopping basket.`,
    [{label:"V&A · clothing and self-expression",url:"https://www.vam.ac.uk/articles/cloth-of-a-continent-africa-fashion"}]),
  draft("ideas-good-move-choose-ten", "Ten minutes, your rules",
    "Three ways to spend some energy. Pick the one that sounds fun today.", "Movement", "About 2 min read · optional 10 min move",
    `You chose “Full of it”. Lovely. There is no prize for choosing the hardest option, so take the one you would actually do again.

Want music? Put on two or three songs and move until the last one ends. Dance, pace, stretch between choruses, invent a move so bad it deserves its own name. Nobody is marking your form.

Want to go somewhere? Walk for five minutes in one direction, then turn back. If outside is awkward today, make a loop through the room or corridor. The turn-back point means the whole thing fits in ten minutes.

Want something with a little push? Try one minute each of comfortable sit-to-stands, wall push-ups and marching on the spot; pause between them and repeat only if you want to. Use a stable chair and stop if something hurts or feels wrong.

You can also change your mind halfway through. NHS guidance says activity can be built from small amounts and it helps to choose what you enjoy. This is an invitation, not a test your body has to pass.`,
    [{label:"NHS Every Mind Matters · be active for your mental health",url:"https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/be-active-for-your-mental-health/"}]),
  draft("ideas-good-curious-twinkle", "Why stars twinkle and planets show off",
    "One sky question for the next time you are waiting for a bus.", "Science & nature", "About 2 min read",
    `Look up on a clear evening and you may see one light flickering like it has something to confess, while another holds steady. They are not necessarily different moods of star.

Starlight reaches us from a point so tiny that moving air can bend its path in noticeable little jumps. A planet is much closer and appears as a small disc, even when your eye cannot see that disc directly. The air still moves the light, but the changes from different parts tend to smooth one another out. So stars often twinkle more, while planets can look steadier.

It is a clue, not a foolproof identification trick. Low on the horizon, where light passes through more atmosphere, even a planet may shimmer. Streetlights, aircraft and clouds enjoy confusing the game too.

Next time you have a minute, choose two bright points and watch rather than taking a photo. Which one seems to dance? You do not need to name either of them. Curiosity is allowed to stop at “well, that's odd” — although NASA has a skywatching guide if the rabbit hole wins.`,
    [{label:"NASA · skywatching tips and star/planet light",url:"https://science.nasa.gov/solar-system/skywatching/whats-up-june-2024-skywatching-tips-from-nasa/"}]),
  draft("ideas-good-nest-one-corner", "One corner, five minutes",
    "A tiny home ritual that doesn't begin with buying a lamp.", "Home", "About 1 min read · optional 5 min ritual",
    `Pick the place you actually land: the end of the sofa, a chair, the bit of bed where you read, or a patch of floor the sun sometimes finds. It needn't be a room of its own.

For five minutes, move only what gets in the way of using it. Put a cup in the kitchen. Fold the blanket so you can pull it over your knees. Bring the book you keep meaning to open within reach. If a lamp is already there, try it instead of the big light. That's the whole renovation.

Sit down before the five minutes become a cleaning campaign. What can you see from there? What would you like within arm's reach? You are allowed to choose convenience over a photograph of a perfect home.

Tomorrow it may fill with coats again. A place you can use tonight has still done its job.`, []),
  draft("ideas-good-tonight-close-day", "The day can stop here",
    "A small closing routine, with no promise that sleep follows orders.", "Rest", "About 2 min read · optional 5 min pause",
    `The day may have left several tabs open in your head. You don't have to solve them in bed.

Take a scrap of paper. Write one thing that needs your attention tomorrow, the first small move, and one thing that can wait longer. This is a parking place, not a second to-do list. Put the paper down.

If you can, make the next few minutes feel different from the work of the day: lower the light, set a drink nearby, or read one page. Choose the gentlest thing available. A baby, a hot flush, noise next door or a mind that will not settle can change the night; the routine does not fail because you are awake.

NHS sleep guidance includes making time to relax and writing down worries. It does not mean that a five-minute ritual guarantees sleep. Tonight's chapter and your Sky are still here if words or a little wonder would be better company. You can close this and simply rest.`,
    [{label:"NHS Every Mind Matters · sleep and winding down",url:"https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-fall-asleep-faster-and-sleep-better/"}]),
  draft("ideas-good-becoming-small-yes", "A small yes that sounds like yours",
    "Self-trust rarely arrives with a trumpet. Sometimes it just chooses lunch.", "Self-trust", "About 2 min read",
    `Someone asks where you want to eat. “Anywhere” leaves your mouth before the question has even landed. You are easygoing, perhaps. Or you have become very good at making yourself the least inconvenient person in the room.

Try one small preference today, in a place where it is safe to have one. “I'd like the window seat.” “Can we go on Thursday?” “I don't fancy that film.” Not an announcement about the new you. A sentence about an ordinary afternoon.

Other people may disagree. You can survive a different opinion without withdrawing yours as if it were a mistake. You may also change your mind once you hear theirs; that is a choice, not evidence that you cannot be trusted with one.

Self-trust isn't a personality badge you earn by never hesitating. It is the practice of noticing what you think before the room answers for you. You can write the sentence privately in Journal if saying it aloud feels too big today. Keep the scale small. A life is made of more than its grand turning points; it has Thursdays and window seats as well.`, []),
  draft("ideas-good-make-paper-garden", "A five-minute paper garden",
    "Paper, any pen, and permission for the flowers to look strange.", "Making", "About 1 min read · 5 min making",
    `Find the back of an envelope, a receipt you no longer need, or one sheet of paper. Draw a line across it. That's your ground.

For one minute, fill the top with five different flower shapes. A star with a dot, a scribbly circle, a petal that looks suspiciously like a spoon. Give each a stem that reaches the line. Do not erase anything.

For the next two minutes, add the things a garden could have but a sensible drawing might reject: a moon at noon, a chair for a beetle, a gate too small for a person. Fill one gap with repeated dots or leaves. Let your hand choose the pattern.

In the last two minutes, title your garden on the paper. “The place where I put the keys” is valid. So is “Tuesday”. You can keep it, fold it into a book or recycle it. The making was the point; the object has no obligation to become decor.`, []),
  draft("ideas-good-outside-nearby", "The outdoors, from where you are",
    "A window, a doorstep or a street. No garden membership required.", "Outside", "About 1 min read · optional 5 min look",
    `Start at the nearest view you can reach comfortably. That might be a window, a front step, a bus stop or the pavement outside. You do not need a trail, special shoes or even a plant of your own.

Give the scene a minute. Find one living thing and one sign of the season. A tree, moss between bricks, a bird arguing with another bird, or a leaf that has changed colour while you were busy. If you cannot see green, watch the light and the weather instead.

If you have five minutes and want to stay, notice the same spot twice: once now, once after you have looked elsewhere. What moved? What stayed? It is a tiny way of belonging to a place without having to make a whole weekend of it.

RHS has ideas for growing on a windowsill or doorstep if you want a bigger project later. You do not need to grow anything to take this one look. Events and Planner are here if another day calls for company or a proper outing.`,
    [{label:"RHS · gardening without a garden",url:"https://www.rhs.org.uk/advice/gardening-without-a-garden"}]),
  draft("ideas-good-mirror-soft-outfit", "An outfit you can live in",
    "Get dressed for the actual day, including the sitting-down parts.", "Fashion", "About 2 min read",
    `Start with the thing that feels good on your skin. Maybe it's the jumper with the soft sleeves or trousers you can sit in without negotiating with the waistband. Put it on before you decide what the outfit is supposed to say about you.

Add one thing that makes it feel like yours: earrings, a colour, a shirt left open, the shoes that have already proved themselves. You can stop there. An outfit doesn't need a concept note.

Now do a real-life rehearsal. Sit down. Reach for something. Walk to the door. If a seam twists or a collar needs constant fixing, change that piece. The clothes work for you; the interview is over.

You chose Soft & cosy. That might look like an enormous cardigan, or it might mean a crisp shirt that doesn't scratch. Nobody else can feel your clothes for you.`, []),
  draft("ideas-good-move-rest-day", "No workout. No speech.",
    "A rest choice with a beginning and an end. Yes, that counts as a choice.", "Movement", "About 1 min read",
    `You chose Not today. Good. Close the list of workouts.

Ask one practical question instead: what would make the next hour easier? A glass of water within reach, a more comfortable seat, a break from a noisy room, or simply doing nothing for a bit. Choose one, if any, and let the rest of the suggestions go.

If you want to move later, you can. If you don't, there is no catch-up task waiting here. Rest doesn't need a motivational speech or an explanation from your cycle.

This page has an end: put the phone down, or open a chapter if company sounds nice. The room will be here another day.`, []),
  draft("ideas-good-kindred-own-company", "A date with your own company",
    "Solitude without a self-improvement agenda or a surprise reach-out task.", "Friendship", "About 2 min read",
    `Choose a little pocket of time that belongs to you. Ten minutes is enough. Decide what you actually want in it before the phone makes an offer: a walk, a song, a cup of tea, a page, or staring out of the window like the lead in a period drama.

Then do that one thing. You don't have to turn it into a ritual, document it or become wonderfully good at being alone. If the mind wanders to people you miss, that's allowed too. Missing someone doesn't mean you made the wrong choice by wanting quiet now.

When the time ends, notice whether you'd like more of it. If yes, make another small space later. If not, go back to company. You are allowed to change your mind without an app asking for a reason.

There is no message to send at the bottom of this piece. You selected Just solitude, and we listened.`, []),
  draft("ideas-good-curious-one-work", "Stay with one work of art",
    "A gallery visit you can do with a poster, a song or a picture on your phone.", "Arts & culture", "About 2 min read",
    `Pick one work you can look at or listen to right now. A painting in a gallery, the image on a library book, a song you already own, a building you pass every week. No search for the most important one.

Give it a full minute before reading anyone else's description. What caught you first? What did you miss at the start? If it's a song, listen for one sound that stays in the background. If it's a picture, follow one line all the way across.

Now read its label or credit, if there is one. Did it change anything? Perhaps. Perhaps the original thought was better. Either answer belongs to you.

If you want another minute, take it. If you don't, leave with one detail in your pocket. Being curious about art is not a quiz in expensive vocabulary.`, []),
  draft("ideas-good-delight-one-song", "Give one song the whole room",
    "A tiny listening break. No playlist to maintain.", "Music", "About 1 min read",
    `Choose a song you already know and play it from the beginning. Put the phone down while it plays. That is the whole plan.

You can dance, sing the wrong words, sit with your eyes closed or make tea. Somewhere in the middle, notice the part you wait for: the bass arriving, the line that still gets you, the outrageous key change. Let it have its moment.

When the song ends, decide whether you want another. Do not let autoplay make that decision for you. The app doesn't need to measure your taste, and you don't need to build a playlist out of every nice thing.

One song can simply be one song. An excellent use of three-ish minutes.`, []),
  draft("ideas-good-nest-cupboard-supper", "A supper from what you have",
    "Start with a cupboard look, then make one ordinary meal your way.", "Home", "About 2 min read · optional cooking time",
    `Open the cupboard or fridge and find one thing you would happily eat tonight. Bread, rice, eggs, beans, a vegetable, leftovers. Then find one thing that would make it nicer: a bit of cheese, herbs, something crunchy, the sauce you forget you own.

Make a simple supper you already know how to cook. Beans on toast. A bowl of rice with vegetables. An omelette. If a recipe is new to you, use a complete trusted recipe for ingredients, cooking times and food-safety details; this little note isn't pretending to be one.

Put it on a plate if that makes the moment feel better. Eat it somewhere comfortable. A meal from the cupboard is not a consolation prize, and you don't need to photograph it before it goes cold.

If there is nothing usable there, that's information, not a challenge to improvise dinner from a tea bag. Choose another plan.`, []),
  draft("ideas-good-becoming-short-no", "A short no is a whole sentence",
    "Practise the small boundary before you need the big speech.", "Self-trust", "About 2 min read",
    `Picture a request you might get this week: staying late, another favour, a plan you don't want. Choose one that feels safe to decline. You don't have to start with the hardest person in your life.

Say a short reply to yourself: “I can't this time.” Or “That doesn't work for me.” If you want to offer another day, do it because you mean it, not because silence feels unbearable.

Now stop talking. The imaginary conversation will probably try to write three more paragraphs on your behalf. You can let them remain imaginary.

A real request may need a fuller answer, especially when care, work or money is involved. This is just practice at hearing your own preference before automatically handing it away. You can keep the sentence in Journal, privately, or leave it here.`, []),
];
