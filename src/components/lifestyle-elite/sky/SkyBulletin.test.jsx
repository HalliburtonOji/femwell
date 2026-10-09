import React from 'react';
import {beforeEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor,within} from '@testing-library/react';
import DailySkyLesson,{SavedSkyLessons} from './DailySkyLesson';
import {SKY_LESSONS,SKY_BULLETINS,dailyBulletinDeck,findSkyPiece,localSkyDay,skyLessonKey} from './skyLessons';
const mock=vi.hoisted(()=>({filter:vi.fn(),journals:vi.fn(),create:vi.fn(),save:vi.fn(),remove:vi.fn()}));
vi.mock('@/api/base44Client',()=>({base44:{entities:{SavedItems:{filter:mock.filter},JournalEntries:{filter:mock.journals,create:mock.create}}}}));
vi.mock('@/lib/savedItems',()=>({saveItem:mock.save,removeSavedItem:mock.remove,parseSavedMeta:row=>JSON.parse(row.meta_json || '{}')}));
const props={userId:'owner',direction:'petal-press',previewRoute:'/CalmLifestyleDemo',human:true,calmLayout:true};
beforeEach(()=>{vi.clearAllMocks();mock.filter.mockResolvedValue([]);mock.journals.mockResolvedValue([]);window.history.replaceState({},'','/CalmLifestyleDemo?section=sky');HTMLElement.prototype.scrollTo=vi.fn();});
it('rotates a seven-piece starter catalogue with distinct daily cards and keeps historical editions intact',()=>{
  expect(SKY_LESSONS).toHaveLength(24);expect(SKY_BULLETINS).toHaveLength(7);
  const leads=new Set();for(let i=0;i<7;i++){const deck=dailyBulletinDeck(`2026-10-${9+i}`);expect(new Set(deck.map(item=>item.id)).size).toBe(5);leads.add(deck[0].id);}expect(leads.size).toBe(7);
  const old=findSkyPiece('earthshine',1);expect(skyLessonKey(old)).toBe('sky-lesson:earthshine:v1');expect(dailyBulletinDeck('2026-11-12','earthshine')[0]).toBe(old);
  expect(findSkyPiece('earthshine',9)).toBeUndefined();expect(findSkyPiece('bulletin-group-chat',9)).toBeUndefined();
});
it('shows its purpose upfront, offers manual movement, and does not turn editorial stories into NASA lessons',async()=>{
  render(<DailySkyLesson {...props}/>);expect(screen.getByText('Sky Bulletin')).toBeVisible();expect(screen.getByText('Little stories from down here. Swipe for another.')).toBeVisible();
  const bulletin=within(screen.getByRole('group',{name:'Sky Bulletin'}));
  expect(bulletin.queryByRole('link',{name:/NASA/})).not.toBeInTheDocument();expect(bulletin.queryByText('Try noticing:')).not.toBeInTheDocument();
  const next=screen.getByRole('button',{name:'Next sky bulletin'});next.focus();fireEvent.click(next);expect(next).toHaveFocus();expect(screen.getByText('2 / 5 · keep exploring')).toBeVisible();
  const seed=new URL(screen.getByRole('link',{name:'Take this to the lounge'}).href).searchParams.get('seed');expect(seed).toContain(dailyBulletinDeck(localSkyDay())[1].id);expect(seed).toContain('/CalmLifestyleDemo?');
  for(let i=0;i<3;i++)fireEvent.click(next);expect(next).toBeDisabled();await waitFor(()=>expect(mock.filter).toHaveBeenCalled());expect(mock.save).not.toHaveBeenCalled();
});
it('opens an old exact astronomy edition inside Bulletin without overwriting its original text or identity',async()=>{
  window.history.replaceState({},'','/CalmLifestyleDemo?section=sky&lesson=earthshine&lessonVersion=1');render(<DailySkyLesson {...props}/>);
  const old=findSkyPiece('earthshine',1);expect(screen.getByRole('group',{name:'1 of 5'})).toHaveTextContent(old.body);expect(within(screen.getByRole('group',{name:'Sky Bulletin'})).getByRole('link',{name:/NASA|Royal Observatory/})).toHaveAttribute('href',old.source);
  fireEvent.click(screen.getByRole('button',{name:'A private note'}));fireEvent.change(screen.getByLabelText('What caught your eye?'),{target:{value:'Own retained draft'}});fireEvent.click(screen.getByRole('button',{name:'Close · keep draft'}));fireEvent.click(screen.getByRole('button',{name:'A private note'}));expect(screen.getByLabelText('What caught your eye?')).toHaveValue('Own retained draft');
  fireEvent.click(screen.getByRole('button',{name:'Next sky bulletin'}));expect(screen.getByLabelText('What caught your eye?')).toHaveValue('');fireEvent.click(screen.getByRole('button',{name:'Previous sky bulletin'}));expect(screen.getByLabelText('What caught your eye?')).toHaveValue('Own retained draft');await waitFor(()=>expect(mock.journals).toHaveBeenCalled());
});
it('keeps a Bulletin with acknowledged ownership and reopens the same edition from the actual saves consumer',async()=>{
  const item=dailyBulletinDeck(localSkyDay())[0];const row={id:'saved',user_id:'owner',item_id:skyLessonKey(item),title:item.title,meta_json:JSON.stringify({kind:'sky-lesson',lessonId:item.id,lessonVersion:1})};mock.save.mockResolvedValue(row);
  const {unmount}=render(<DailySkyLesson {...props}/>);const keep=screen.getByRole('button',{name:'Keep this'});await waitFor(()=>expect(keep).toBeEnabled());fireEvent.click(keep);await screen.findByText('Kept in Yours and your saved things.');
  expect(mock.save).toHaveBeenCalledWith(expect.objectContaining({itemId:skyLessonKey(item),meta:expect.objectContaining({kind:'sky-lesson',lessonId:item.id,lessonVersion:1})}));unmount();mock.filter.mockResolvedValue([row]);
  render(<SavedSkyLessons userId='owner' direction='petal-press' previewRoute='/CalmLifestyleDemo' human/>);const link=await screen.findByRole('link',{name:item.title});expect(link).toHaveAttribute('href',expect.stringContaining(`lesson=${item.id}&lessonVersion=1`));expect(screen.queryByText(/edition.*unavailable/)).not.toBeInTheDocument();
});
it('does not confirm a wrong-owner keep and retries the same exact piece',async()=>{
  const item=dailyBulletinDeck(localSkyDay())[0];mock.save.mockResolvedValueOnce({id:'wrong',user_id:'other',item_id:skyLessonKey(item)}).mockResolvedValueOnce({id:'right',user_id:'owner',item_id:skyLessonKey(item)});
  render(<DailySkyLesson {...props}/>);const keep=screen.getByRole('button',{name:'Keep this'});await waitFor(()=>expect(keep).toBeEnabled());fireEvent.click(keep);await screen.findByText('That didn’t save. This piece is still here; try again.');expect(keep).toHaveAttribute('aria-pressed','false');fireEvent.click(keep);await screen.findByText('Kept in Yours and your saved things.');expect(mock.save.mock.calls[0][0].itemId).toBe(mock.save.mock.calls[1][0].itemId);
});
it('links an acknowledged private note to the exact new edition using the existing journal contract',async()=>{
  const item=dailyBulletinDeck(localSkyDay())[0];mock.create.mockImplementation(async row=>({id:'note',...row}));render(<DailySkyLesson {...props}/>);
  fireEvent.click(screen.getByRole('button',{name:'A private note'}));fireEvent.change(screen.getByLabelText('What caught your eye?'),{target:{value:'My words'}});fireEvent.click(screen.getByRole('button',{name:'Keep in journal'}));await screen.findByText('Kept in your journal, linked to this piece.');
  expect(mock.create).toHaveBeenCalledWith(expect.objectContaining({user_id:'owner',content_key:skyLessonKey(item),text:'My words',tags:['Sky lesson']}));expect(screen.getByText('Your note on this piece')).toBeVisible();expect(screen.getByRole('link',{name:'Open this journal note'})).toHaveAttribute('href',expect.stringContaining(encodeURIComponent(skyLessonKey(item))));
});
