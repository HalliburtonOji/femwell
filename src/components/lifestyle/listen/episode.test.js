import {describe,it,expect} from 'vitest';
import {playableEpisode,episodeSourceUrl} from './episode';
describe('real episode metadata and source recovery',()=>{
  it('retains the exact publisher and supplied words through a normalised card',()=>{
    const raw={id:'real',episode_url:'https://publisher.test/real',content_url:'https://publisher.test/archive',transcript:'Every supplied word.\nNext paragraph.',source_name:'Publisher'};
    const episode=playableEpisode({id:'real',title:'Actual episode',sourceName:'Publisher',_raw:raw},'https://audio.test/real.mp3',180,'Listen');
    expect(episodeSourceUrl(episode)).toBe('https://publisher.test/real');expect(episode.transcript).toBe(raw.transcript);expect(episode.content_url).toBe(raw.content_url);
  });
  it('rejects dead and executable source links and keeps real direct-audio access',()=>{
    expect(episodeSourceUrl({episode_url:'#',content_url:'javascript:alert(1)'})).toBeNull();
    expect(episodeSourceUrl({episode_url:'javascript:alert(1)',audio_url:'https://audio.test/real.mp3'})).toBe('https://audio.test/real.mp3');
  });
});
