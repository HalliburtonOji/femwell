import { CalendarDays, NotebookPen } from "lucide-react";
import FocusedLifestyleSheet, { FocusedText, firstSentences } from "./FocusedLifestyleSheet";

export default function FocusedReadingSheet({ reading, onClose, onSaveReading, onSkyDiary, active }) {
  const narrative = reading?.narrative || "Your reading hasn’t landed yet. Open your sky to check your chart.";
  const brief = firstSentences(narrative);
  const sections = [
    [reading?.power_title,reading?.power_body], [reading?.pressure_title,reading?.pressure_body],
    [reading?.trouble_title,reading?.trouble_body], [reading?.cycle_moon_headline,reading?.cycle_moon_body],
  ].filter(([title,body])=>title || body);
  return <FocusedLifestyleSheet title={<FocusedText text={reading?.headline || "Your sky today"}/>} eyebrow={["Your sky",reading?.reading_date,reading?.moon_phase].filter(Boolean).join(" · ")} onClose={onClose} active={active}
    footer={<><button className="fw-focused-button" onClick={onSkyDiary}><NotebookPen size={16}/>Sky diary</button><button className="fw-focused-button" onClick={onSaveReading} disabled={!reading?.id}><CalendarDays size={16}/>Plan a moment</button></>}>
    <div className="fw-focused-prose"><p><FocusedText text={brief}/></p>
      {(narrative !== brief || sections.length > 0) && <details className="fw-focused-depth"><summary>Read the whole reading</summary>
        {String(narrative).split(/\n\s*\n/).filter(Boolean).map((text,i)=><p key={i}><FocusedText text={text}/></p>)}
        {sections.map(([title,body],i)=><section key={i}>{title && <h3><FocusedText text={title}/></h3>}{body && <p><FocusedText text={body}/></p>}</section>)}
      </details>}
    </div>
  </FocusedLifestyleSheet>;
}
