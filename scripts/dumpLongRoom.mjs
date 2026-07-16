const rows = await base44.entities.DailyStory.filter({ series_key: "the_long_room" }, "day_number", 40);
const lr = (rows || []).sort((a, b) => a.day_number - b.day_number)
  .map(r => ({ day_number: r.day_number, cliffhanger: r.cliffhanger, segment_text: r.segment_text }));
console.log("###JSON###");
console.log(JSON.stringify(lr));
