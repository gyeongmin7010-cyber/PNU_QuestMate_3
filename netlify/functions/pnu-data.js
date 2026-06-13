const SOURCES = {
  meals: 'https://m.pusan.ac.kr/ko/meals',
  seats: 'https://m.pusan.ac.kr/ko/seat',
  notices: 'https://m.pusan.ac.kr/ko/notice/cover/list/1?current=notice',
  academic: 'https://m.pusan.ac.kr/ko/notice/cover/list/1?current=haksa'
};
const headers = {'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','cache-control':'no-store'};
function strip(html){return String(html||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();}
function snippets(text, keywords, max=8){const arr=[];const parts=text.split(/(?=\d{4}\.\d{2}\.\d{2}|공지|식단|잔여|열람실|학사|신청|모집)/);for(const p of parts){const s=p.trim();if(s.length>6 && keywords.some(k=>s.includes(k)) && !arr.some(x=>x.title===s.slice(0,120))) arr.push({title:s.slice(0,120)});if(arr.length>=max)break;}return arr;}
async function get(kind,url){try{const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 PNU QuestMate'}});const html=await r.text();const text=strip(html);let data=[];if(kind==='meals')data=snippets(text,['금정','샛벌','학생','조식','중식','석식','식단','등록된 식단']);if(kind==='seats')data=snippets(text,['잔여','열람실','새벽벌','미리내','좌석','나노생명']);if(kind==='notices')data=snippets(text,['공지','모집','신청','안내','장학','학생']);if(kind==='academic')data=snippets(text,['학사','수업','성적','휴학','복학','등록','시험']);return {ok:true,data,textLength:text.length};}catch(e){return {ok:false,data:[],error:e.message};}}
exports.handler = async () => {
  const results = {};
  for (const [k,u] of Object.entries(SOURCES)) results[k] = await get(k,u);
  const out = {
    mode: Object.values(results).some(x=>x.ok&&x.data.length)?'live':'demo',
    meals: results.meals.data.length?results.meals.data:[{title:'데모: 오늘 학식 확인 후 금정회관 QR 미션 수행'}],
    seats: results.seats.data.length?results.seats.data:[{title:'데모: 새벽벌도서관 좌석 확인 후 학습 미션 수행'}],
    notices: results.notices.data.length?results.notices.data:[{title:'데모: 학생지원 공지 확인 후 퀴즈 미션 수행'}],
    academic: results.academic.data.length?results.academic.data:[{title:'데모: 학사일정 확인 후 일정 관리 미션 수행'}],
    diagnostics: Object.fromEntries(Object.entries(results).map(([k,v])=>[k,{ok:v.ok,count:v.data.length,error:v.error||null,textLength:v.textLength||0}]))
  };
  return {statusCode:200,headers,body:JSON.stringify(out)};
};
