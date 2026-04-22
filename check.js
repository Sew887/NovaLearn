const https=require('https');
https.get('https://www.youtube.com/watch?v=cZk2S6mgU0o', res=>{ 
  let d=''; res.on('data',c=>d+=c);
  res.on('end',()=>{ console.log("Tools Title:", d.match(/<title>(.*?)<\/title>/)?.[1]); });
});
https.get('https://www.youtube.com/watch?v=SE4qt2EgudM', res=>{ 
  let d=''; res.on('data',c=>d+=c);
  res.on('end',()=>{ console.log("IR Title:", d.match(/<title>(.*?)<\/title>/)?.[1]); });
});
