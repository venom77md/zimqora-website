(() => {
  const heroHost=document.getElementById('hero-mascot');
  const miniHost=document.getElementById('mini-mascot');
  const speech=document.getElementById('guide-speech');
  const stage=document.querySelector('.companion-stage');
  const sceneMotion=document.getElementById('scene-motion');
  const chatPanel=document.getElementById('assistant-panel');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const loaderScript=document.querySelector('script[data-mascot-module]');
  let heroView=null,miniView=null,loading=null,failed=false,turnIndex=0,feedback='welcome',typingTimer=null;
  const words={
    welcome:{en:'Hey, I’m here to help you build.',ar:'أهلًا! جاهز نبدأ فكرتك سوا؟'},
    wave:{en:'Good to meet you. What are we building?',ar:'أهلًا بيك. تحب نبدأ بإيه؟'},
    think:{en:'A good idea starts with a good question.',ar:'فكرة حلوة بتبدأ بسؤال صح.'},
    celebrate:{en:'One step closer to your next project! ✦',ar:'كده قربنا خطوة من مشروعك الجاي! ✦'},
    turn:{en:'A new perspective always helps.',ar:'زاوية جديدة… وفكرة أوضح.'},
    fallback:{en:'I’m here to help. Tell me about your project.',ar:'أنا معاك. احكيلي عن مشروعك.'}
  };
  function ensurePoster(host){const image=host.querySelector('img[data-poster-src]');if(image&&!image.hasAttribute('src'))image.src=image.dataset.posterSrc}
  function paused(){return document.documentElement.dataset.motion==='off'||reduce.matches}
  function setSpeech(key){feedback=key;const text=words[key][document.documentElement.lang==='ar'?'ar':'en'];if(speech.textContent!==text)speech.textContent=text;stage.dataset.feedback=key}
  async function start(explicit=false){
    if(failed)return null;
    if(loading)return loading;
    if(paused()&&!explicit){ensurePoster(heroHost);ensurePoster(miniHost);return null;}
    heroHost.dataset.renderState='loading';
    loading=import(new URL(loaderScript.dataset.mascotModule,document.baseURI).href).then(async module=>{
      const failHero=()=>{heroHost.classList.remove('model-ready');ensurePoster(heroHost);setSpeech('fallback')};
      heroView=await module.createMascotView(heroHost,{onReady:()=>heroHost.classList.add('model-ready'),onFailure:failHero});
      if(!heroView){failed=true;heroHost.dataset.renderState='fallback';ensurePoster(miniHost);return null}
      miniView=await module.createMascotView(miniHost,{mini:true,onReady:()=>miniHost.classList.add('model-ready'),onFailure:()=>{miniHost.classList.remove('model-ready');ensurePoster(miniHost)}});
      if(!chatPanel.hidden){heroView.setChat(true);miniView?.setChat(true)}
      return heroView;
    }).catch(()=>{failed=true;heroHost.dataset.renderState='fallback';miniHost.dataset.renderState='fallback';heroHost.classList.remove('model-ready');miniHost.classList.remove('model-ready');ensurePoster(heroHost);ensurePoster(miniHost);setSpeech('fallback');return null});
    return loading;
  }
  async function react(kind){setSpeech(kind);await start(true);heroView?.react(kind);miniView?.react(kind)}
  document.querySelectorAll('[data-gesture]').forEach(button=>button.addEventListener('click',()=>react(button.dataset.gesture)));
  document.getElementById('turn-guide').addEventListener('click',async()=>{setSpeech('turn');await start(true);const positions=[-.85,Math.PI,0];const turn=positions[turnIndex++%positions.length];dragTurn=turn;heroView?.turn(turn);miniView?.turn(turn)});
  document.querySelectorAll('[data-preview],[data-start]').forEach(button=>button.addEventListener('click',()=>react('think')));
  document.getElementById('project-planner').addEventListener('change',()=>react('think'));
  document.getElementById('use-plan').addEventListener('click',()=>react('celebrate'));
  document.getElementById('brief').addEventListener('submit',event=>{if(event.target.checkValidity())react('celebrate')});
  document.getElementById('assistant-form').addEventListener('submit',()=>{react('celebrate');heroView?.setChat(true,false);miniView?.setChat(true,false)});
  document.getElementById('assistant-options').addEventListener('click',event=>{if(event.target.closest('button'))react('think')});
  const chatObserver=new MutationObserver(()=>{const open=!chatPanel.hidden;if(open)react('wave');heroView?.setChat(open);miniView?.setChat(open)});chatObserver.observe(chatPanel,{attributes:true,attributeFilter:['hidden']});
  const chatInput=document.getElementById('assistant-input');
  function typing(){heroView?.setChat(true,true);miniView?.setChat(true,true);clearTimeout(typingTimer);typingTimer=setTimeout(()=>{heroView?.setChat(!chatPanel.hidden,false);miniView?.setChat(!chatPanel.hidden,false)},1400)}
  chatInput.addEventListener('input',typing);
  chatInput.addEventListener('focus',()=>{setSpeech('think');heroView?.setChat(true,true);miniView?.setChat(true,true)});
  chatInput.addEventListener('blur',()=>{heroView?.setChat(!chatPanel.hidden,false);miniView?.setChat(!chatPanel.hidden,false)});
  const pointerFine=matchMedia('(hover: hover) and (pointer: fine)');
  function pointerMove(event){if(!pointerFine.matches||paused())return;const x=event.clientX/innerWidth*2-1,y=event.clientY/innerHeight*2-1;heroView?.look(x,y);miniView?.look(x,y)}
  window.addEventListener('pointermove',pointerMove,{passive:true});
  let drag=null,dragTurn=0;
  heroHost.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={x:event.clientX,y:event.clientY,moved:false,id:event.pointerId,base:dragTurn}});
  heroHost.addEventListener('pointermove',event=>{if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(!drag.moved&&Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)){drag.moved=true;heroHost.setPointerCapture(event.pointerId);start(true)}if(drag.moved){dragTurn=Math.max(-Math.PI*2,Math.min(Math.PI*2,drag.base+dx/150));heroView?.turn(dragTurn);heroHost.dataset.dragging='true'}});
  function release(event){if(!drag)return;if(!drag.moved&&Math.abs(event.clientY-drag.y)<10)react('wave');drag=null;delete heroHost.dataset.dragging}
  heroHost.addEventListener('pointerup',release);heroHost.addEventListener('pointercancel',()=>{drag=null;delete heroHost.dataset.dragging});
  function localize(){const ar=document.documentElement.lang==='ar';setSpeech(feedback);heroHost.setAttribute('aria-label',ar?'مجسّم تفاعلي لشخصية ZIMQORA البنفسجية':'Interactive purple ZIMQORA mascot');sceneMotion.textContent=ar?(paused()?'تشغيل الحركة':'إيقاف الحركة'):(paused()?'Resume motion':'Pause motion');sceneMotion.setAttribute('aria-pressed',String(paused()));document.getElementById('back-top').setAttribute('aria-label',ar?'الرجوع لأول الصفحة':'Back to top')}
  sceneMotion.addEventListener('click',()=>document.getElementById('motion-toggle').click());
  const entranceAnimations=new Set();
  const motionObserver=new MutationObserver(()=>{localize();if(paused()){for(const animation of entranceAnimations)animation.cancel();entranceAnimations.clear()}else start()});motionObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
  document.addEventListener('languagechange',localize);reduce.addEventListener('change',localize);
  const initialObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){start();initialObserver.disconnect()}},{rootMargin:'150px'});initialObserver.observe(heroHost);initialObserver.observe(miniHost);
  const companionObserver=new IntersectionObserver(entries=>{document.querySelector('.assistant-widget').classList.toggle('companion-visible',entries[0].isIntersecting)},{threshold:.3});companionObserver.observe(stage);
  // Scroll feedback is separate from content: native scrolling stays untouched.
  const progress=document.querySelector('.reading-progress span');const backTop=document.getElementById('back-top');let scrollTick=false;
  function updateScroll(){scrollTick=false;if(scrollY<150)document.querySelectorAll('#main-nav [aria-current]').forEach(link=>link.removeAttribute('aria-current'));const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?scrollY/max:0})`;backTop.hidden=scrollY<innerHeight;}
  function scroll(){if(!scrollTick){scrollTick=true;requestAnimationFrame(updateScroll)}}window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll,{passive:true});updateScroll();
  backTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:paused()?'auto':'smooth'}));
  document.querySelectorAll('a.wordmark').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();window.scrollTo({top:0,behavior:paused()?'auto':'smooth'})}));
  if('IntersectionObserver' in window){const entranceObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;entranceObserver.unobserve(entry.target);if(paused()||!entry.target.animate)continue;const animation=entry.target.animate([{opacity:.35,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'cubic-bezier(.23,1,.32,1)'});entranceAnimations.add(animation);animation.onfinish=()=>entranceAnimations.delete(animation)}},{threshold:.16});document.querySelectorAll('.service-grid article,.project-types,.faq-items details').forEach(el=>entranceObserver.observe(el))}
  if('IntersectionObserver' in window){const navLinks=[...document.querySelectorAll('#main-nav a')];const navObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;navLinks.forEach(link=>{const active=link.hash===`#${entry.target.id}`;active?link.setAttribute('aria-current','location'):link.removeAttribute('aria-current')})}},{rootMargin:'-15% 0px -60% 0px'});navLinks.forEach(link=>{const section=document.querySelector(link.hash);if(section)navObserver.observe(section)})}
  function cleanup(event){if(event.persisted)return;heroView?.destroy();miniView?.destroy();initialObserver.disconnect();companionObserver.disconnect();chatObserver.disconnect();motionObserver.disconnect();window.removeEventListener('pointermove',pointerMove);clearTimeout(typingTimer)}window.addEventListener('pagehide',cleanup);
  localize();
})();
