(function(){
var role='passenger',me=null;
var spv={n:'Monthly Pass',p:900},scpv={n:'Monthly Pass',p:900};
var cst={t:0,v:0,i:0},crst={n:0,tot:0},blk=false,si=0;

function gU(){try{return JSON.parse(localStorage.getItem('tgU')||'{}')}catch(e){return{}}}
function sU(u){localStorage.setItem('tgU',JSON.stringify(u))}
function gCH(ph){try{return JSON.parse(localStorage.getItem('ch_'+ph)||'[]')}catch(e){return[]}}
function sCH(ph,h){localStorage.setItem('ch_'+ph,JSON.stringify(h))}
function gPH(ph){try{return JSON.parse(localStorage.getItem('ph_'+ph)||'[]')}catch(e){return[]}}
function sPH(ph,h){localStorage.setItem('ph_'+ph,JSON.stringify(h))}

function pg(id){document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});document.getElementById(id).classList.add('active')}
function al(id,msg,t){var e=document.getElementById(id);if(!e)return;e.textContent=msg;e.className='alert '+(t==='s'?'as':'ae')+' show';setTimeout(function(){e.classList.remove('show')},3500)}
function el(id){return document.getElementById(id)}

// Portal cards
el('btnP').addEventListener('click',function(){goA('passenger')});
el('btnC').addEventListener('click',function(){goA('conductor')});
el('btnA').addEventListener('click',function(){goA('admin')});

function goA(r){
  role=r;
  el('authRole').textContent=r.toUpperCase();
  el('authRole').className='role-chip '+(r==='passenger'?'rc-p':r==='conductor'?'rc-c':'rc-a');
  ['lPh','lPw','sNm','sPh','sPw','sCf','sCid'].forEach(function(i){var e=el(i);if(e)e.value=''});
  var sRtEl=el('sRt');if(sRtEl)sRtEl.value='';
  el('authAlert').className='alert ae';
  el('LF').style.display='block';el('SF').style.display='none';
  el('authTitle').textContent='Welcome Back';
  el('authSub').textContent='Login to your account';
  el('suRow').style.display=r==='admin'?'none':'block';
  el('cidFg').style.display=r==='conductor'?'block':'none';
  var crg=el('condRouteGroup');
  if(crg) crg.style.display=r==='conductor'?'block':'none';
  pg('auth');
}

el('goSU').addEventListener('click',function(){
  el('LF').style.display='none';el('SF').style.display='block';
  el('authTitle').textContent='Create Account';
  el('authSub').textContent='Sign up for TGRTC Smart Pass';
  el('authAlert').className='alert ae';
  el('cidFg').style.display=role==='conductor'?'block':'none';
  var crg=el('condRouteGroup');
  if(crg) crg.style.display=role==='conductor'?'block':'none';
});
el('goLF').addEventListener('click',function(){
  el('SF').style.display='none';el('LF').style.display='block';
  el('authTitle').textContent='Welcome Back';
  el('authSub').textContent='Login to your account';
  el('authAlert').className='alert ae';
});
el('backBtn').addEventListener('click',function(){pg('landing')});

el('signupBtn').addEventListener('click',function(){
  var n=el('sNm').value.trim(),ph=el('sPh').value.trim();
  var sRtEl=el('sRt'),rt=sRtEl?sRtEl.value:'';
  var ci=el('sCid').value.trim(),pw=el('sPw').value,cf=el('sCf').value;
  if(!n||!ph||!pw||!cf){al('authAlert','Please fill all fields!','e');return}
  if(!/^[0-9]{10}$/.test(ph)){al('authAlert','Enter a valid 10-digit phone number!','e');return}
  if(role==='conductor'&&!rt){al('authAlert','Please select your assigned route!','e');return}
  if(role==='conductor'&&!ci){al('authAlert','Please enter your Staff ID!','e');return}
  if(pw!==cf){al('authAlert','⚠️ Passwords do not match!','e');return}
  if(pw.length<4){al('authAlert','⚠️ Password must be at least 4 characters!','e');return}
  var users=gU(),key=ph+'_'+role;
  if(users[key]){al('authAlert','⚠️ An account with this phone already exists!','e');return}
  var yr=new Date().getFullYear();
  var pid='TGRTC-'+yr+'-'+String(Object.keys(users).length+1001).padStart(5,'0');
  var storedRoute=role==='conductor'?rt:'Any Route (Flexible)';
  users[key]={name:n,phone:ph,password:pw,role:role,route:storedRoute,passId:pid,condId:ci,expiry:null,cardType:null,blocked:false};
  sU(users);
  al('authAlert','✅ Account created! Please login.','s');
  setTimeout(function(){el('SF').style.display='none';el('LF').style.display='block';el('authTitle').textContent='Welcome Back';el('authSub').textContent='Login to your account';el('authAlert').className='alert ae';},1600);
});

el('loginBtn').addEventListener('click',doLogin);
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&el('auth').classList.contains('active')){if(el('SF').style.display==='block')el('signupBtn').click();else doLogin();}});

function doLogin(){
  var ph=el('lPh').value.trim(),pw=el('lPw').value;
  if(!ph||!pw){al('authAlert','⚠️ Please enter phone & password!','e');return}
  if(role==='admin'){
    if(ph==='admin'&&pw==='admin123'){me={name:'Admin',role:'admin'};loadAdmin();pg('aDash')}
    else al('authAlert','❌ Admin credentials: admin / admin123','e');
    return;
  }
  var users=gU(),key=ph+'_'+role,user=users[key];
  if(!user){al('authAlert','❌ No account found. Please Sign Up!','e');return}
  if(user.password!==pw){al('authAlert','❌ Wrong password!','e');return}
  me=user;blk=user.blocked||false;
  if(role==='passenger'){loadPDash(user);pg('pDash')}
  else{cst={t:0,v:0,i:0};crst={n:0,tot:0};el('cTbU').textContent='🎫 '+user.name+' ('+user.condId+')';el('cRtSub').textContent='Route: '+user.route;loadCHist();pg('cDash')}
}

function logout(){me=null;blk=false;cst={t:0,v:0,i:0};crst={n:0,tot:0};pg('landing')}
el('pLo').addEventListener('click',logout);
el('cLo').addEventListener('click',logout);
el('aLo').addEventListener('click',logout);

// ── PASSENGER ──
function loadPDash(u){
  el('pTbU').textContent='👤 '+u.name;
  el('pNm').textContent=u.name.toUpperCase();
  el('pPid').textContent='Pass ID: '+u.passId;
  if(u.blocked){setSt('bl')}
  else if(u.expiry){setSt('on');el('pExp').textContent=u.expiry;el('pExp').style.color='#10b981';el('pCt').textContent=u.cardType||'—'}
  else{setSt('no')}
  updateBlkUI();loadPHist();
  // Load profile photo
  var photo = localStorage.getItem('userPhoto');
  if(photo){
    el('profilePhoto').src = photo;
    el('profilePhoto').style.display = 'block';
    el('passPhoto').src = photo;
  }
}
function setSt(s){
  var e=el('pStat');
  if(s==='on'){e.textContent='● ACTIVE';e.className='pcst st-on'}
  else if(s==='bl'){e.textContent='● BLOCKED';e.className='pcst st-bl'}
  else{e.textContent='● NOT RECHARGED';e.className='pcst st-no';el('pExp').textContent='Not Recharged';el('pExp').style.color='#ef4444';el('pCt').textContent='—'}
}

// Passenger tabs
[0,1,2].forEach(function(i){
  el('ptb'+i).addEventListener('click',function(){
    [0,1,2].forEach(function(j){el('ptb'+j).classList.remove('on');el('pt'+j).style.display='none'});
    this.classList.add('on');el('pt'+i).style.display='block';
  });
});

// Plans
var pdata=[[0,'Day Pass',120],[1,'Monthly Pass',900],[2,'3-Month Pass',2500]];
pdata.forEach(function(d){
  el('pp'+d[0]).addEventListener('click',function(){
    pdata.forEach(function(x){el('pp'+x[0]).classList.remove('on')});
    this.classList.add('on');spv={n:d[1],p:d[2]};
    el('pSP').innerHTML='Selected: <strong>'+d[1]+' — ₹'+d[2]+'</strong>';
  });
});

el('pRBtn').addEventListener('click',function(){
  var btn=this;btn.textContent='Processing...';btn.disabled=true;
  setTimeout(function(){
    btn.textContent='PAY & RECHARGE →';btn.disabled=false;
    var m=spv.n==='Day Pass'?0:spv.n==='Monthly Pass'?1:3;
    var d=new Date();if(m===0){d.setDate(d.getDate()+1);}else{d.setMonth(d.getMonth()+m);}
    var exp=d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
    el('pExp').textContent=exp;el('pExp').style.color='#10b981';
    el('pCt').textContent=spv.n+' Pass';setSt('on');
    if(me){var u=gU(),k=me.phone+'_passenger';if(u[k]){u[k].expiry=exp;u[k].cardType=spv.n+' Pass';sU(u);me.expiry=exp;me.cardType=spv.n+' Pass';}
      var h=gPH(me.phone);h.unshift({dt:new Date().toLocaleDateString('en-IN'),pl:spv.n,am:'₹'+spv.p,mt:el('pPm').value});sPH(me.phone,h);loadPHist();}
    el('mRT').textContent='Pass recharged for '+spv.n+' via '+el('pPm').value+'.';
    el('mRE').textContent=exp;el('mRch').classList.add('show');
  },1200);
});

function loadPHist(){
  if(!me)return;var h=gPH(me.phone),tb=el('pHB');if(!tb)return;
  if(!h.length){tb.innerHTML='<tr><td colspan="4" class="te">No recharges yet</td></tr>';return}
  tb.innerHTML='';h.forEach(function(r){var tr=document.createElement('tr');tr.innerHTML='<td>'+r.dt+'</td><td>'+r.pl+'</td><td style="color:#10b981;font-weight:700">'+r.am+'</td><td>'+r.mt+'</td>';tb.appendChild(tr);});
}

function updateBlkUI(){
  var cs=el('pCSt'),bb=el('pBlk'),ub=el('pUblk');
  if(blk){cs.textContent='🔴 BLOCKED';cs.style.color='#ef4444';bb.style.display='none';ub.style.display='inline-flex'}
  else{cs.textContent='● ACTIVE — Not Blocked';cs.style.color='#10b981';bb.style.display='inline-flex';ub.style.display='none'}
}
el('pBlk').addEventListener('click',function(){el('mBlk').classList.add('show')});
el('pUblk').addEventListener('click',function(){
  blk=false;if(me){var u=gU(),k=me.phone+'_passenger';if(u[k]){u[k].blocked=false;sU(u);me.blocked=false;}}
  if(me&&me.expiry)setSt('on');else setSt('no');updateBlkUI();al('pBA','🔓 Card unblocked successfully!','s');
});
el('mBlkNo').addEventListener('click',function(){el('mBlk').classList.remove('show')});
el('mBlkYes').addEventListener('click',function(){
  blk=true;if(me){var u=gU(),k=me.phone+'_passenger';if(u[k]){u[k].blocked=true;sU(u);me.blocked=true;}}
  setSt('bl');updateBlkUI();el('mBlk').classList.remove('show');al('pBA','🔒 Card blocked successfully!','e');
});
el('mRDone').addEventListener('click',function(){el('mRch').classList.remove('show')});

// Photo upload
el('uploadPhoto').addEventListener('click', function() {
  var file = el('photoInput').files[0];
  if (file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var dataURL = e.target.result;
      localStorage.setItem('userPhoto', dataURL);
      el('profilePhoto').src = dataURL;
      el('profilePhoto').style.display = 'block';
      el('passPhoto').src = dataURL;
    };
    reader.readAsDataURL(file);
  }
});

// ── CONDUCTOR ──
el('szBtn').addEventListener('click',function(){
  var z=this;z.classList.add('go');
  setTimeout(function(){
    z.classList.remove('go');
    var u=gU(),ps=Object.values(u).filter(function(x){return x.role==='passenger'});
    if(!ps.length){showSR({t:'inv'});return}
    var p=ps[si%ps.length];si++;showSR({t:'ok',p:p});
  },1000);
});
el('cMBtn').addEventListener('click',function(){
  var q=el('cMI').value.trim();if(!q)return;
  var u=gU(),f=null;
  Object.values(u).forEach(function(x){if(x.role==='passenger'&&(x.phone===q||x.passId===q))f=x});
  if(f)showSR({t:'ok',p:f});else showSR({t:'inv'});
});

function showSR(d){
  cst.t++;el('cSc').textContent=cst.t;
  var cls='',html='',stxt='';
  if(d.t==='inv'){
    cst.i++;cls='sr-i';html='<div style="color:#4e6480;font-weight:700;margin-bottom:6px">❌ INVALID CARD</div><p style="font-size:12px;color:#4e6480">This card is not registered in the system.</p>';stxt='❌ Invalid';
  } else {
    var p=d.p;
    if(p.blocked){
      cst.i++;cls='sr-b';html='<div style="color:#f59e0b;font-weight:700;margin-bottom:8px">⛔ CARD BLOCKED</div><div style="font-weight:700">'+p.name+'</div><div style="font-size:12px;color:#4e6480;margin-top:4px">'+p.route+'</div>';stxt='⛔ Blocked';
    } else if(!p.expiry){
      cst.i++;cls='sr-e';html='<div style="color:#f59e0b;font-weight:700;margin-bottom:8px">⚠️ NOT RECHARGED</div><div style="font-weight:700">'+p.name+'</div><div style="font-size:12px;color:#4e6480;margin-top:4px">'+p.route+'</div>';stxt='⚠️ Not Recharged';
    } else {
      var ms={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
      var pts=p.expiry.split(' ');var ed=pts.length===3?new Date(parseInt(pts[2]),ms[pts[1]]||0,parseInt(pts[0])):null;
      if(ed&&ed<new Date()){
        cst.i++;cls='sr-e';html='<div style="color:#f59e0b;font-weight:700;margin-bottom:8px">⚠️ PASS EXPIRED</div><div style="font-weight:700">'+p.name+'</div><div style="font-size:12px;color:#4e6480;margin-top:4px">'+p.route+'</div><div style="color:#ef4444;font-size:12px;margin-top:4px">Expired: '+p.expiry+'</div>';stxt='⚠️ Expired';
      } else {
        cst.v++;cls='sr-v';
        html='<div style="color:#10b981;font-weight:700;margin-bottom:10px">✅ VALID PASS</div>'+
          '<div style="display:flex;gap:12px;align-items:center">'+
          '<div style="width:40px;height:40px;background:linear-gradient(135deg,#1d4ed8,#3b82f6);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px">'+p.name.charAt(0)+'</div>'+
          '<div><div style="font-weight:700">'+p.name+'</div><div style="font-size:12px;color:#4e6480">📱 '+p.phone+'</div></div></div>'+
          '<div style="display:flex;gap:20px;margin-top:12px;flex-wrap:wrap">'+
          '<div><div style="font-size:10px;letter-spacing:2px;color:#4e6480">PASS ID</div><div style="font-size:13px;font-weight:600">'+p.passId+'</div></div>'+
          '<div><div style="font-size:10px;letter-spacing:2px;color:#4e6480">ROUTE</div><div style="font-size:13px;font-weight:600">'+p.route+'</div></div>'+
          '<div><div style="font-size:10px;letter-spacing:2px;color:#4e6480">VALID TILL</div><div style="font-size:13px;font-weight:600;color:#10b981">'+p.expiry+'</div></div></div>';
        stxt='✅ Valid';
      }
    }
  }
  el('cVl').textContent=cst.v;el('cIv').textContent=cst.i;
  var sr=el('cSR');sr.className='sres show '+cls;el('cSC').innerHTML=html;
  var tb=el('cRB');if(tb.querySelector('.te'))tb.innerHTML='';
  var tr=document.createElement('tr'),t=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
  tr.innerHTML='<td style="font-size:11px">'+t+'</td><td>'+(d.p?d.p.name:'Unknown')+'</td><td style="font-size:11px">'+(d.p?d.p.passId:'—')+'</td><td>'+stxt+'</td>';
  tb.insertBefore(tr,tb.firstChild);
}

// Conductor tabs
[0,1,2].forEach(function(i){
  el('ctb'+i).addEventListener('click',function(){
    [0,1,2].forEach(function(j){el('ctb'+j).classList.remove('on');el('ct'+j).style.display='none'});
    this.classList.add('on');el('ct'+i).style.display='block';
    if(i===2)loadCHist();
  });
});

// Conductor plans
var cpdata=[[0,'Day Pass',120],[1,'Monthly Pass',900],[2,'3-Month Pass',2500]];
cpdata.forEach(function(d){
  el('cp'+d[0]).addEventListener('click',function(){
    cpdata.forEach(function(x){el('cp'+x[0]).classList.remove('on')});
    this.classList.add('on');scpv={n:d[1],p:d[2]};
  });
});

el('cPPh').addEventListener('blur',searchCP);
el('cPPh').addEventListener('keyup',function(e){if(e.key==='Enter')searchCP()});
function searchCP(){
  var q=el('cPPh').value.trim();if(!q)return;
  var u=gU(),f=null;
  Object.values(u).forEach(function(x){if(x.role==='passenger'&&x.phone===q)f=x});
  var box=el('cPR');
  if(f){
    el('cPN').textContent='👤 '+f.name+' ('+f.passId+')';
    el('cPRt').textContent='🛣️ '+f.route;
    el('cPEx').innerHTML=f.expiry?'📅 Current Expiry: <span style="color:#f59e0b">'+f.expiry+'</span>':'<span style="color:#ef4444">⚠️ Not Recharged</span>';
    box.dataset.ph=f.phone;box.dataset.pid=f.passId;box.dataset.nm=f.name;box.classList.add('show');
  } else {al('cRA','❌ Passenger not found! Check the phone number.','e');box.classList.remove('show');}
}

el('cRBtn').addEventListener('click',function(){
  var box=el('cPR');
  if(!box.classList.contains('show')){al('cRA','⚠️ Please search for a passenger first!','e');return}
  var cash=parseInt(el('cCI').value)||0;
  if(cash<scpv.p){al('cRA','⚠️ Cash amount is less than ₹'+scpv.p+'!','e');return}
  var ph=box.dataset.ph,pid=box.dataset.pid,nm=box.dataset.nm;
  var mo=scpv.n==='Day Pass'?0:scpv.n==='Monthly Pass'?1:3;
  var d=new Date();if(mo===0){d.setDate(d.getDate()+1);}else{d.setMonth(d.getMonth()+mo);}
  var exp=d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  var u=gU(),k=ph+'_passenger';
  if(u[k]){u[k].expiry=exp;u[k].cardType=scpv.n+' Pass';sU(u);}
  var h=gCH(me.phone);
  h.unshift({dt:new Date().toLocaleString('en-IN'),pid:pid,nm:nm,pl:scpv.n,am:scpv.p,cash:cash,exp:exp,cid:me.condId});
  sCH(me.phone,h);
  crst.n++;crst.tot+=scpv.p;
  el('cRn').textContent=crst.n;el('cCa').textContent='₹'+crst.tot;
  al('cRA','✅ '+nm+' recharged! Expiry: '+exp,'s');
  el('cPPh').value='';el('cCI').value='';box.classList.remove('show');
  loadCHist();
});

function loadCHist(){
  if(!me)return;var h=gCH(me.phone),tb=el('cHB');if(!tb)return;
  if(!h.length){tb.innerHTML='<tr><td colspan="5" class="te">No recharges yet</td></tr>';el('cHT').textContent='₹0';return}
  tb.innerHTML='';var tot=0;
  h.forEach(function(r){tot+=r.am;var tr=document.createElement('tr');tr.innerHTML='<td style="font-size:11px">'+r.dt+'</td><td>'+r.nm+'<br><span style="font-size:11px;color:#4e6480">'+r.pid+'</span></td><td>'+r.pl+'</td><td style="color:#10b981;font-weight:700">₹'+r.am+'</td><td style="color:#10b981">'+r.exp+'</td>';tb.appendChild(tr);});
  el('cHT').textContent='₹'+tot;
}

// ── ADMIN ──
[0,1,2].forEach(function(i){
  el('atb'+i).addEventListener('click',function(){
    [0,1,2].forEach(function(j){el('atb'+j).classList.remove('on');el('at'+j).style.display='none'});
    this.classList.add('on');el('at'+i).style.display='block';
  });
});

function loadAdmin(){
  var u=gU(),ps=Object.values(u).filter(function(x){return x.role==='passenger'});
  el('aT').textContent=ps.length;
  el('aAc').textContent=ps.filter(function(p){return !p.blocked&&p.expiry}).length;
  el('aBl').textContent=ps.filter(function(p){return p.blocked}).length;
  el('aNp').textContent=ps.filter(function(p){return !p.expiry&&!p.blocked}).length;
  var tb=el('aPB');if(!tb)return;
  if(!ps.length){tb.innerHTML='<tr><td colspan="6" class="te">No passengers registered yet</td></tr>';return}
  tb.innerHTML='';
  ps.forEach(function(p){
    var st=p.blocked?'<span style="color:#f59e0b">⛔ Blocked</span>':p.expiry?'<span style="color:#10b981">✅ Active</span>':'<span style="color:#4e6480">○ No Pass</span>';
    var ac=p.blocked
      ?'<button style="padding:5px 12px;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;background:linear-gradient(135deg,#059669,#10b981);color:#fff" data-ph="'+p.phone+'" data-bl="0">🔓 Unblock</button>'
      :'<button style="padding:5px 12px;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;background:linear-gradient(135deg,#b91c1c,#ef4444);color:#fff" data-ph="'+p.phone+'" data-bl="1">🔒 Block</button>';
    var tr=document.createElement('tr');
    tr.innerHTML='<td>'+p.name+'</td><td style="font-size:11px">'+p.passId+'</td><td style="font-size:12px">'+p.route+'</td><td style="font-size:12px">'+(p.expiry||'<span style="color:#ef4444">—</span>')+'</td><td>'+st+'</td><td>'+ac+'</td>';
    tb.appendChild(tr);
  });
}

el('aPB').addEventListener('click',function(e){
  var btn=e.target.closest('[data-ph]');if(!btn)return;
  var ph=btn.dataset.ph,bl=btn.dataset.bl==='1';
  var u=gU(),k=ph+'_passenger';
  if(u[k]){u[k].blocked=bl;sU(u);al('aPA',bl?'🔒 Card blocked successfully!':'🔓 Card unblocked successfully!',bl?'e':'s');loadAdmin();}
});

el('aCBtn').addEventListener('click',searchCond);
el('aCQ').addEventListener('keyup',function(e){if(e.key==='Enter')searchCond()});
function searchCond(){
  var q=el('aCQ').value.trim().toLowerCase();
  if(!q){al('aCA','⚠️ Please enter Conductor ID or phone!','e');return}
  var u=gU(),f=null;
  Object.values(u).forEach(function(x){if(x.role==='conductor'&&(x.phone===q||(x.condId&&x.condId.toLowerCase()===q)))f=x});
  var info=el('aCInfo'),tbl=el('aCTbl'),emp=el('aCEmp');
  if(!f){al('aCA','❌ Conductor not found!','e');info.classList.remove('show');tbl.style.display='none';emp.style.display='block';return}
  var h=gCH(f.phone);
  el('aCNm').textContent='🎫 '+f.name+' ('+f.condId+')';
  el('aCRt').textContent='🛣️ '+f.route;
  el('aCCnt').textContent=h.length;
  var tb=el('aCBody');tb.innerHTML='';var tot=0;
  if(!h.length){tb.innerHTML='<tr><td colspan="5" class="te">No recharges recorded for this conductor</td></tr>'}
  else{h.forEach(function(r){tot+=r.am;var tr=document.createElement('tr');tr.innerHTML='<td style="font-size:11px">'+r.dt+'</td><td>'+r.nm+'<br><span style="font-size:11px;color:#4e6480">'+r.pid+'</span></td><td>'+r.pl+'</td><td style="color:#10b981;font-weight:700">₹'+r.am+'</td><td style="color:#10b981">'+r.exp+'</td>';tb.appendChild(tr);});}
  el('aCTot').textContent='₹'+tot;
  info.classList.add('show');tbl.style.display='table';emp.style.display='none';
}

el('aABtn').addEventListener('click',function(){
  var n=el('aN').value.trim(),ph=el('aPh').value.trim(),rt=el('aRt').value;
  var plv=el('aPl').value,sd=el('aDt').value;
  var pl=plv==='day'?0:plv==='month'?1:3;
  if(!n||!ph||!rt||!sd){al('aAA','⚠️ Please fill Name, Phone, Route & Date!','e');return}
  if(!/^[0-9]{10}$/.test(ph)){al('aAA','⚠️ Enter a valid 10-digit phone number!','e');return}
  var u=gU(),k=ph+'_passenger';
  if(u[k]){al('aAA','⚠️ An account with this phone already exists!','e');return}
  var d=new Date(sd);if(pl===0){d.setDate(d.getDate()+1);}else{d.setMonth(d.getMonth()+pl);}
  var exp=d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  var yr=new Date().getFullYear();
  var pid='TGRTC-'+yr+'-'+String(Object.keys(u).length+1001).padStart(5,'0');
  var pln=plv==='day'?'Day Pass':plv==='month'?'Monthly Pass':'3-Month Pass';
  u[k]={name:n,phone:ph,password:ph.slice(-4),role:'passenger',route:rt,passId:pid,condId:'',expiry:exp,cardType:pln+' Pass',blocked:false};
  sU(u);
  al('aAA','✅ Pass created! ID: '+pid+' | Default password: '+ph.slice(-4),'s');
  el('aN').value='';el('aPh').value='';loadAdmin();
});

var aDtEl=el('aDt');if(aDtEl)aDtEl.valueAsDate=new Date();

})();
