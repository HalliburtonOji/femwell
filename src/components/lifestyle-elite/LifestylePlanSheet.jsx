import { useMemo, useRef, useState } from 'react';
import { X, CalendarDays } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { isoDay } from '@/components/lifestyle/dailyStory';

export function plannedRows(request, date, time, minutes, spacing) {
  const checkpoints = request.club?.checkpoints;
  const items = checkpoints ? checkpoints : [request];
  return items.map((item, index) => {
    const day = new Date(`${date}T12:00:00`); day.setDate(day.getDate() + index * Number(spacing));
    return { title:checkpoints ? `Book club · ${item.label}` : request.title,
      date:isoDay(day), time, source:request.source || 'lifestyle',
      ref:checkpoints ? `club:${request.club.pick_key}` : request.ref,
      category:checkpoints || request.source === 'books' ? 'personal' : 'wellbeing',
      notes:`d:${minutes};${checkpoints ? request.club.title : 'From Lifestyle'}${item.label ? ` · ${item.label}` : ''}`,
      repeat:'once', is_completed:false };
  });
}

export function acknowledgesPlan(saved, row, ownerId) {
  return !!saved?.id && saved.user_id===ownerId && ['title','source','ref','date','time','notes'].every(key=>saved[key]===row[key]);
}

export default function LifestylePlanSheet({ ownerId, request, onFinish }) {
  const [date,setDate]=useState(()=>isoDay());
  const [time,setTime]=useState('19:00');
  const [minutes,setMinutes]=useState(15);
  const [spacing,setSpacing]=useState(7);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState('');
  const [complete,setComplete]=useState(false);
  const accepted=useRef(new Set());
  const submitted=useRef(new Map());
  const pendingRef=useRef(false);
  const rows=useMemo(()=>plannedRows(request,date,time,minutes,spacing),[request,date,time,minutes,spacing]);
  const submit=async event=>{
    event.preventDefault(); if(pendingRef.current || !rows.length) return;
    pendingRef.current=true; setPending(true); setError('');
    try {
      const me=await base44.auth.me();
      if(me?.id!==ownerId) throw new Error('owner changed');
      for(const [index,row] of rows.entries()) {
        if(accepted.current.has(index)) continue;
        if((await base44.auth.me())?.id!==ownerId)throw new Error('owner changed');
        const saved=submitted.current.has(index) ? {id:submitted.current.get(index)} : await base44.entities.PlannerItems.create({...row,user_id:ownerId,created_at:new Date().toISOString(),updated_at:new Date().toISOString()});
        if(!saved?.id) throw new Error('no acknowledgement');
        submitted.current.set(index,saved.id);
        const actual=acknowledgesPlan(saved,row,ownerId) ? saved : (await base44.entities.PlannerItems.filter({id:saved.id,user_id:ownerId},undefined,1))?.[0];
        if(actual?.id!==saved.id || !acknowledgesPlan(actual,row,ownerId))throw new Error('wrong acknowledgement');
        accepted.current.add(index);
      }
      if((await base44.auth.me())?.id!==ownerId)throw new Error('owner changed');
      setComplete(true);
    } catch {
      setError(accepted.current.size ? `${accepted.current.size} of ${rows.length} confirmed. Retry checks the remaining plans.` : 'Couldn’t confirm your plan. Your chosen time is still here.');
    } finally { pendingRef.current=false; setPending(false); }
  };
  return <div className="fw-lifestyle-plan-backdrop" role="presentation">
    <section className="fw-lifestyle-plan fw-sheet-safe" role="dialog" aria-modal="true" aria-labelledby="lifestyle-plan-title">
      <button type="button" aria-label="Close planning" className="fw-plan-close" disabled={pending} onClick={()=>onFinish(complete)}><X size={20}/></button>
      <div className="fw-plan-eyebrow"><CalendarDays size={16}/> A little room in your day</div>
      <h2 id="lifestyle-plan-title">{complete ? 'It’s in your planner' : 'Plan a time'}</h2>
      <p>{request.club?.title || request.title}</p>
      {complete ? <><p>{rows.length===1 ? `${date} · ${time} · ${minutes} minutes` : `${rows.length} reading checkpoints, starting ${date} at ${time}.`}</p><div className="fw-plan-actions"><button onClick={()=>onFinish(true)}>Back to Lifestyle</button><a href="/Planner">Open planner</a></div></> : <form onSubmit={submit}>
        <fieldset disabled={pending || submitted.current.size>0}>
          <label>Day<input type="date" required value={date} onChange={e=>setDate(e.target.value)}/></label>
          <label>Time<input type="time" required value={time} onChange={e=>setTime(e.target.value)}/></label>
          <label>Minutes<select value={minutes} onChange={e=>setMinutes(Number(e.target.value))}>{[5,15,30,60].map(n=><option key={n} value={n}>{n} minutes</option>)}</select></label>
          {request.club && <label>Space checkpoints<select value={spacing} onChange={e=>setSpacing(Number(e.target.value))}>{[7,10,14].map(n=><option key={n} value={n}>Every {n} days</option>)}</select></label>}
        </fieldset>
        {request.club && <ol className="fw-plan-checkpoints">{rows.map((row,i)=><li key={i}><span>{row.title}</span><time>{row.date} · {row.time}</time></li>)}</ol>}
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={pending || !rows.length}>{pending ? 'Saving…' : error ? 'Retry remaining plans' : 'Save plan'}</button>
      </form>}
    </section>
  </div>;
}
