import React from "react";
import LifestyleEliteShell from "@/components/lifestyle-elite/LifestyleEliteShell";
import "@/components/lifestyle-elite/ReadingRoom.css";

export default function LivingReadingRoomDemo() {
  return <main className="fw-reading-room">
    <nav className="fw-room-review" aria-label="Reading room review"><a href="/Ideas">Ideas · review</a><span>Reading room · living garden</span></nav>
    <LifestyleEliteShell enableFocus layout="bespoke" clean previewActions initialSection="books" continuousSky celestialSky firstFoldVariant="living" dailySkyLessons artDirection="reading-room"/>
    <aside className="fw-room-build-notes"><details><summary>Creative brief &amp; checks</summary><p>A table, chapter leaf, reading note and book-club correspondence in one continuous world. All existing Books features remain. Sky keeps the accepted garden, with a short controlled breeze.</p><p>Books and Sky are the new studies. The other sections retain their existing gardens and actions; their own worlds follow separately. Main-page promotion awaits your go-ahead.</p><a href="/reading-room/index.html">Research, plan &amp; verification</a><a href="/FloralDreamDemo?direction=living&section=sky">Accepted Sky base</a></details></aside>
  </main>;
}
