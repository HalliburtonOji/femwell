// lifestyleVideos — a small, HAND-PICKED fallback set for the Lifestyle "Videos" lane, used ONLY when
// there are no real PUBLISHED LifestyleItems videos to show (today the live items carry no media URLs,
// so the real player correctly link-outs). These are public, embeddable YouTube videos from large,
// stable channels, spread across a women's WHOLE-LIFE "watch" lane (yoga · slow-living · a craft/hobby
// · nature/awe · BookTok · calm/mindfulness) — NOT cooking. They play inline via youtube-nocookie,
// ToS-safe, through the SAME <LifestyleMedia> player as real items.
//
// Each was verified (2026-06-28): YouTube oEmbed returned 200 with a title, AND the youtube-nocookie
// embed page contained no "Video unavailable" / "playback on other websites has been disabled" marker.
// Shaped to feed LifestyleMedia's VIDEO branch: is_embeddable + video_id → nocookie iframe.

export const LIFESTYLE_VIDEOS = [
  {
    id: "lv-1",
    media_type: "VIDEO",
    is_embeddable: true,
    video_id: "v7AYKMP6rOE",
    title: "Yoga For Complete Beginners — 20-Minute Home Yoga",
    channel_name: "Yoga With Adriene",
    image_url: "https://i.ytimg.com/vi/v7AYKMP6rOE/hqdefault.jpg",
    duration_label: "20 min",
    content_url: "https://www.youtube.com/watch?v=v7AYKMP6rOE",
    content_type: "VIDEO",
  },
  {
    id: "lv-2",
    media_type: "VIDEO",
    is_embeddable: true,
    video_id: "qQmzPS3uu0M",
    title: "How to Romanticise Your Life — finding magic in the everyday",
    channel_name: "Victoria Morse",
    image_url: "https://i.ytimg.com/vi/qQmzPS3uu0M/hqdefault.jpg",
    duration_label: "Slow living",
    content_url: "https://www.youtube.com/watch?v=qQmzPS3uu0M",
    content_type: "VIDEO",
  },
  {
    id: "lv-3",
    media_type: "VIDEO",
    is_embeddable: true,
    video_id: "8JCE_uubBoU",
    title: "Plan With Me — a bullet-journal setup",
    channel_name: "AmandaRachLee",
    image_url: "https://i.ytimg.com/vi/8JCE_uubBoU/hqdefault.jpg",
    duration_label: "Journaling",
    content_url: "https://www.youtube.com/watch?v=8JCE_uubBoU",
    content_type: "VIDEO",
  },
  {
    id: "lv-4",
    media_type: "VIDEO",
    is_embeddable: true,
    video_id: "pJxeyK7it0o",
    title: "Breathtaking Nature in 4K",
    channel_name: "BBC Earth",
    image_url: "https://i.ytimg.com/vi/pJxeyK7it0o/hqdefault.jpg",
    duration_label: "A little awe",
    content_url: "https://www.youtube.com/watch?v=pJxeyK7it0o",
    content_type: "VIDEO",
  },
  {
    id: "lv-5",
    media_type: "VIDEO",
    is_embeddable: true,
    video_id: "UDPDxbsni-Y",
    title: "Books that made me fall in love with reading again",
    channel_name: "Jane Yang",
    image_url: "https://i.ytimg.com/vi/UDPDxbsni-Y/hqdefault.jpg",
    duration_label: "BookTok",
    content_url: "https://www.youtube.com/watch?v=UDPDxbsni-Y",
    content_type: "VIDEO",
  },
  {
    id: "lv-6",
    media_type: "VIDEO",
    is_embeddable: true,
    video_id: "ZToicYcHIOU",
    title: "Daily Calm — 10-Minute Mindfulness Meditation",
    channel_name: "Calm",
    image_url: "https://i.ytimg.com/vi/ZToicYcHIOU/hqdefault.jpg",
    duration_label: "10 min",
    content_url: "https://www.youtube.com/watch?v=ZToicYcHIOU",
    content_type: "VIDEO",
  },
];

export default LIFESTYLE_VIDEOS;
