import React from 'react';
import {beforeEach,expect,it,vi} from 'vitest';
import {fireEvent,render,screen,waitFor,within} from '@testing-library/react';

const api=vi.hoisted(()=>({filter:vi.fn()}));
vi.mock('@/api/base44Client',()=>({base44:{entities:{LifestyleItems:{filter:api.filter}}}}));
vi.mock('./FocusedLifestyleSheet',()=>({
  default:({children})=><div>{children}</div>,
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
  render(<FocusedLifestyleRooms active user={{id:'alice'}} shellItems={[]} toCard={row=>row} isSaved={()=>false} onSave={vi.fn()} onClose={vi.fn()}/>);
  fireEvent.change(screen.getByLabelText('Room'),{target:{value:'Move'}});
  await waitFor(()=>expect(api.filter).toHaveBeenCalledTimes(1));
  fireEvent.change(screen.getByLabelText('How do you feel?'),{target:{value:'strength'}});
  const list=screen.getByRole('list');
  expect(within(list).getByText('Strength with small weights')).toBeVisible();
  expect(within(list).queryByText('Gentle yoga at home')).not.toBeInTheDocument();
  expect(within(list).queryByText('A mood-lifting walk')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('How do you feel?'),{target:{value:'all'}});
  expect(within(list).getAllByRole('button')).toHaveLength(3);
});
