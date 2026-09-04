var FEEDBACK="/api/feedback";

document.querySelectorAll('.copyblock .btn').forEach(function(b){b.addEventListener('click',function(){var t=document.getElementById(b.dataset.for).textContent;navigator.clipboard.writeText(t).then(function(){b.textContent='Copied';b.classList.add('done');setTimeout(function(){b.textContent='Copy';b.classList.remove('done')},1600)})})});
var ph=document.getElementById('ph');function prog(){var d=document.documentElement;var p=d.scrollTop/(d.scrollHeight-d.clientHeight||1);ph.style.width=(p*100)+'%'}addEventListener('scroll',prog,{passive:true});prog();
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});document.querySelectorAll('.rise').forEach(function(el){io.observe(el)})}
document.querySelectorAll('[data-piece]').forEach(function(a){a.addEventListener('click',function(){var s=document.getElementById('fb-piece');if(s){s.value=a.dataset.piece}})});
var NAME='fd-reviewer-name';function getName(){try{return localStorage.getItem(NAME)||''}catch(e){return ''}}function setName(v){try{localStorage.setItem(NAME,v)}catch(e){}}
document.querySelectorAll('form[name="drop-feedback"]').forEach(function(f){var nm=f.elements.name;if(nm&&!nm.value)nm.value=getName();if(nm)nm.addEventListener('change',function(){setName(nm.value)});
f.addEventListener('submit',function(ev){ev.preventDefault();var btn=f.querySelector('button[type=submit]');var label=btn.textContent;btn.disabled=true;btn.textContent='Sending';var data=new URLSearchParams(new FormData(f)).toString();
var req=FEEDBACK?fetch(FEEDBACK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(f)))}):fetch(location.pathname,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:data});
req.then(function(r){if(!r.ok)throw new Error(r.status);
if(f.classList.contains('feedback--inline')){f.innerHTML='<p class="sent">Sent. Thank you. It went straight to Dontae.</p>'}else{location.href=f.getAttribute('action')}}).catch(function(){
var n=f.elements.name.value,p=f.elements.piece.value,t=f.elements.note.value;location.href='mailto:dontae@innovativemusic.cc?subject='+encodeURIComponent('Friday Drop feedback · '+p)+'&body='+encodeURIComponent(t+'\n\n'+n);btn.disabled=false;btn.textContent=label})})});
