const targets={
catfacts:'https://catfact.ninja/fact',
dogceo:'https://dog.ceo/api/breeds/image/random',
fishwatch:'https://www.fishwatch.gov/api/species',
art:'https://api.artic.edu/api/v1/artworks/27992?fields=id,title,artist_display,image_id',
emojihub:'https://emojihub.yurace.pro/api/random',
amiibo:'https://amiiboapi.org/api/amiibo/?name=mario',
rickmorty:'https://rickandmortyapi.com/api/character/1',
openmeteo:'https://api.open-meteo.com/v1/forecast?latitude=-28.0167&longitude=153.4&current=temperature_2m,wind_speed_10m',
spaceflight:'https://api.spaceflightnewsapi.net/v4/articles/?limit=5',
holidays:'https://date.nager.at/api/v3/PublicHolidays/2026/AU'
};
export default async function handler(req,res){
 const u=targets[req.query.id];
 if(!u)return res.status(404).json({error:'Unknown API'});
 try{
  const r=await fetch(u,{headers:{'User-Agent':'API-SwiftUI-Explorer/2.0'}});
  if(!r.ok)return res.status(r.status).json({error:`Remote API returned ${r.status}`});
  res.status(200).json(await r.json());
 }catch(e){
  res.status(502).json({error:'Could not reach remote API',detail:e.message});
 }
}
