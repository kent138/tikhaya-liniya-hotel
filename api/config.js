import {configured} from '../server/core.js';
export default function handler(req,res){res.setHeader('Cache-Control','no-store');res.json({mode:configured()?'live':'demo'});}
