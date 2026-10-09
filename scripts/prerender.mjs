import {createServer} from 'vite';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {Writable} from 'node:stream';
import React from 'react';
import {renderToPipeableStream} from 'react-dom/server';
import {rooms} from '../src/lib/data.js';
const base='https://tikhaya-liniya-hotel.vercel.app';
const template=await readFile('dist/index.html','utf8');
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try {
 const {default:App}=await server.ssrLoadModule('/src/App.jsx');
 const paths=['/',...rooms.map(r=>'/rooms/'+r.id)];
 for(const path of paths){
  globalThis.location={pathname:path,search:''};
  const html=await new Promise((resolve,reject)=>{let output='';const sink=new Writable({write(chunk,encoding,cb){output+=chunk.toString();cb();}});sink.on('finish',()=>resolve(output));const stream=renderToPipeableStream(React.createElement(App),{onAllReady(){stream.pipe(sink);},onError:reject});});
  const room=rooms.find(r=>path==='/rooms/'+r.id);
  const title=room?`Номер ${room.name} — Тихая линия | от ${room.price.toLocaleString('ru-RU')} ₽`:'Тихая линия — бутик-отель у моря';
  const description=room?`${room.name}: ${room.area} м², до ${room.guests} гостей. ${room.description}`:'Тихая линия — современный бутик-отель в Сочи. Номера от 4 500 ₽, неспешные завтраки, отдых у бассейна и простое онлайн-бронирование.';
  const schema=room?{'@context':'https://schema.org','@type':'HotelRoom',name:room.name,description:room.description,floorSize:{'@type':'QuantitativeValue',value:room.area,unitCode:'MTK'},occupancy:{'@type':'QuantitativeValue',maxValue:room.guests}}:{'@context':'https://schema.org','@type':'WebSite',name:'Тихая линия — портфолио-концепт гостиницы',url:base,inLanguage:'ru-RU'};
  let page=template.replace(/<title>.*?<\/title>/,`<title>${title}</title>`).replace(/<meta name="description" content="[^"]*"\s*\/>/,`<meta name="description" content="${description}"/>`).replace(/<meta property="og:title" content="[^"]*"\s*\/>/,`<meta property="og:title" content="${title}"/>`).replace(/<meta property="og:image" content="[^"]*"\s*\/>/,`<meta property="og:image" content="${base}${room?.image||'/images/hero.jpg'}"/>`).replace('</head>',`<link rel="canonical" href="${base}${path}"/><meta property="og:url" content="${base}${path}"/><script type="application/ld+json">${JSON.stringify(schema)}</script></head>`).replace('<div id="root"></div>',`<div id="root">${html}</div>`);
  const dir=path==='/'?'dist':`dist${path}`;await mkdir(dir,{recursive:true});await writeFile(dir+'/index.html',page);console.log('Prerendered',path);
 }
 for(const path of ['booking','admin','fallback']){await mkdir('dist/'+path,{recursive:true});await writeFile('dist/'+path+'/index.html',template.replace('</head>','<meta name="robots" content="noindex,nofollow"/></head>'));}
 await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p=>`<url><loc>${base}${p}</loc></url>`).join('')}</urlset>`);
 await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /booking\nDisallow: /api/\nSitemap: ${base}/sitemap.xml\n`);
}finally{await server.close();}
