import {configured,rooms} from '../server/core.js';
import {db,json} from '../server/db.js';
export default async function handler(req,res){if(req.method!=='GET')return json(res,405,{error:'Метод не поддерживается.'});if(!configured())return json(res,200,Object.fromEntries(rooms.map(r=>[r.id,r.price])));try{const prices=await db()`select * from hotel_prices`;return json(res,200,Object.fromEntries(prices.map(p=>[p.category,p.price])));}catch{return json(res,503,{error:'Тарифы временно недоступны.'});}}
