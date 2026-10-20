import React from 'react';
import {beforeEach,expect,it,vi} from 'vitest';
import {fireEvent,render,screen,waitFor,within} from '@testing-library/react';

const api=vi.hoisted(()=>({filter:vi.fn()}));
vi.mock('@/api/base44Client',()=>({base44:{entities:{LifestyleItems:{filter:api.filter}}}}));
vi.mock('./FocusedLifestyleSheet',()=>({
  default:({children,footer,title})=><div><h2>{title}</h2>{children}{footer}</div>,
  firstSentences:text=>text,
  FocusedText:({text})=><span>{text}</span>,
}));
import FocusedLifestyleRooms from './FocusedLifestyleRooms';

beforeEach(()=>{
  vi.clearAllMocks();
  api.filter.mockResolvedValue([
    {id:'strength',title:'Strength with small weights',category:'Fitness',status:'PUBLISHED'},
    {id:'yoga',title:'Gentle yoga at home',category:'Fitness',status:'PUBLISHED'},
    {id:'walk',title:'A mood-lifting walk',category:'Fitness',status:'PUBLISHED'},
  ]);
});

it('keeps a chosen room topic exact and restores the wider list only when All reads is chosen',async()=>{
  render(<FocusedLifestyleRooms active visualEdition user={{id:'alice'}} shellItems={[]} toCard={row=>row} isSaved={()=>false} onSave={vi.fn()} onClose={vi.fn()}/>);
  fireEvent.change(screen.getByLabelText('Room'),{target:{value:'Move'}});
  expect(api.filter).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('Browse the wider library'));
  await waitFor(()=>expect(api.filter).toHaveBeenCalledTimes(1));
  fireEvent.change(screen.getByLabelText('How do you feel?'),{target:{value:'strength'}});
  const list=screen.getByRole('list');
  expect(within(list).getByText('Strength with small weights')).toBeVisible();
  expect(within(list).queryByText('Gentle yoga at home')).not.toBeInTheDocument();
  expect(within(list).queryByText('A mood-lifting walk')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('How do you feel?'),{target:{value:'all'}});
  expect(within(list).getAllByRole('button')).toHaveLength(3);
});

it('keeps every old source in optional depth while giving only topic-fit Ideas drafts a direct read',async()=>{
  const onSave=vi.fn();
  api.filter.mockResolvedValue([
    {id:'money-old',title:'Budgeting with a friend',category:'Career & Money',status:'PUBLISHED'},
    {id:'strength',title:'Strength with small weights',category:'Fitness',status:'PUBLISHED'},
  ]);
  render(<FocusedLifestyleRooms active editorialPreview user={{id:'alice'}} shellItems={[]} toCard={row=>({...row,type:'article',_raw:row,saveable:!row.editorial_local,body:[row.lede].filter(Boolean)})} isSaved={()=>false} onSave={onSave} onClose={vi.fn()}/>);
  fireEvent.change(screen.getByLabelText('Room'),{target:{value:'Money'}});
  expect(api.filter).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('Browse unreviewed library'));
  await waitFor(()=>expect(api.filter).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('button',{name:/The payment you forgot about/})).toBeVisible();
  const older=screen.getByText(/Browse unreviewed library/).closest('details');
  expect(older.open).toBe(true);
  expect(within(older).getByText('Budgeting with a friend')).toBeVisible();
  expect(within(older).queryByText('Strength with small weights')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:/The payment you forgot about/}));
  expect(screen.getByRole('heading',{name:'The payment you forgot about'})).toBeVisible();
  expect(screen.getByText(/Stopping a Direct Debit at your bank/)).toBeVisible();
  expect(screen.getByText(/Ideas draft · Guide · unreviewed/)).toBeVisible();
  expect(screen.getByRole('link',{name:/MoneyHelper · regular payments and cancellation/})).toHaveAttribute('href','https://www.moneyhelper.org.uk/en/everyday-money/banking/direct-debits-and-standing-orders');
  expect(screen.queryByRole('button',{name:'Save'})).not.toBeInTheDocument();
  expect(onSave).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:/Back to Money/}));
  fireEvent.change(screen.getByLabelText('Room'),{target:{value:'Kindred'}});
  expect(screen.getByRole('button',{name:/The plans you actually want to keep/})).toBeVisible();
  fireEvent.change(screen.getByLabelText('Room'),{target:{value:'Delight'}});
  expect(screen.queryByRole('button',{name:/Your day off is not a performance review/})).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('What do you fancy?'),{target:{value:'surprise'}});
  expect(screen.getByRole('button',{name:/Your day off is not a performance review/})).toBeVisible();
});

const firstPieces = [
  ['Mirror','The outfit already in your wardrobe','The point isn\'t to dress for a mood'],
  ['Move','Ten minutes, your rules','an invitation, not a test'],
  ['Curious','Why stars twinkle and planets show off','Curiosity is allowed to stop'],
  ['Nest','One corner, five minutes','A place you can use tonight'],
  ['Tonight','The day can stop here','Tonight\'s chapter and your Sky'],
  ['Becoming','A small yes that sounds like yours','Thursdays and window seats'],
  ['Make','A five-minute paper garden','The making was the point'],
  ['Outside','The outdoors, from where you are','You do not need to grow anything'],
];

it.each(firstPieces)('opens and returns from the complete %s Ideas first piece without a false Save',async(room,title,ending)=>{
  const onSave=vi.fn();
  render(<FocusedLifestyleRooms active editorialPreview user={{id:'alice'}} shellItems={[]}
    toCard={row=>({...row,type:'article',_raw:row,saveable:!row.editorial_local,body:[row.lede].filter(Boolean)})}
    isSaved={()=>false} onSave={onSave} onClose={vi.fn()}/>);
  fireEvent.change(screen.getByLabelText('Room'),{target:{value:room}});
  const first=screen.getByRole('button',{name:new RegExp(title)});
  expect(first).toBeVisible();
  fireEvent.click(first);
  expect(screen.getByRole('heading',{name:title})).toBeVisible();
  expect(screen.getByText(new RegExp(ending))).toBeVisible();
  expect(screen.getByText(/Ideas draft · Guide · unreviewed/)).toBeVisible();
  expect(screen.queryByRole('button',{name:'Save'})).not.toBeInTheDocument();
  expect(onSave).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:new RegExp(`Back to ${room}`)}));
  expect(screen.getByRole('button',{name:new RegExp(title)})).toBeVisible();
});

it('does not serve a first piece for the wrong selected topic',()=>{
  render(<FocusedLifestyleRooms active editorialPreview user={{id:'alice'}} shellItems={[]}
    toCard={row=>row} isSaved={()=>false} onSave={vi.fn()} onClose={vi.fn()}/>);
  fireEvent.change(screen.getByLabelText('Room'),{target:{value:'Mirror'}});
  expect(screen.getByRole('button',{name:/The outfit already in your wardrobe/})).toBeVisible();
  fireEvent.change(screen.getByLabelText('What do you fancy?'),{target:{value:'soft'}});
  expect(screen.queryByRole('button',{name:/The outfit already in your wardrobe/})).not.toBeInTheDocument();
  expect(screen.getByText(/reading shelf for mirror is being checked/)).toBeVisible();
});
