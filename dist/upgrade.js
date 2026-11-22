/* Local planning tools. No lead data is transmitted or stored. */
const projectTypes={
 website:{en:'Company website',ar:'موقع شركة',description:{en:'A clear home for your business, with pages that help visitors understand your offer.',ar:'مكان واضح لشركتك، وصفحات تساعد الزائر يفهم خدماتك وياخد الخطوة الجاية.'}},
 app:{en:'Web application',ar:'تطبيق ويب',description:{en:'A focused tool for your users, your team, and the way your business works.',ar:'أداة مناسبة لمستخدميك وفريقك وطريقة شغلك.'}},
 design:{en:'Interface design',ar:'تصميم واجهات',description:{en:'A thoughtful layout for the screens and interactions your product needs.',ar:'تصميم مدروس للشاشات والخطوات اللي محتاجها منتجك.'}}
};
const features={
 bilingual:{en:'Arabic & English',ar:'عربي وإنجليزي'},content:{en:'Content pages',ar:'صفحات محتوى'},contact:{en:'Contact form',ar:'نموذج تواصل'},catalog:{en:'Service catalogue',ar:'عرض الخدمات'},booking:{en:'Booking request',ar:'طلب حجز'},analytics:{en:'Analytics setup',ar:'إعداد التحليلات'},
 accounts:{en:'User accounts',ar:'حسابات مستخدمين'},dashboard:{en:'Dashboard',ar:'لوحة تحكم'},reports:{en:'Reports',ar:'تقارير'},integrations:{en:'External integrations',ar:'ربط خدمات خارجية'},roles:{en:'User permissions',ar:'صلاحيات مستخدمين'},
 mobile:{en:'Mobile layouts',ar:'واجهات موبايل'},prototype:{en:'Clickable prototype',ar:'نموذج تفاعلي'},components:{en:'Reusable components',ar:'مكوّنات قابلة لإعادة الاستخدام'},flows:{en:'User journeys',ar:'مسارات الاستخدام'},handoff:{en:'Developer handover',ar:'تجهيز ملفات للمطور'}
};
const typeFeatures={website:['bilingual','content','contact','catalog','booking','analytics'],app:['accounts','dashboard','reports','integrations','roles','bilingual'],design:['mobile','prototype','components','flows','handoff','bilingual']};
const selectedFeatures={website:new Set(['content','contact']),app:new Set(['accounts','dashboard']),design:new Set(['mobile','prototype'])};
const timingLabels={flexible:{en:'Flexible — define the scope first',ar:'مرن — نحدد نطاق الشغل الأول'},soon:{en:'Target date to discuss with the team',ar:'موعد مستهدف نناقشه مع الفريق'},exploring:{en:'Exploring the idea',ar:'لسه بستكشف الفكرة'}};
let currentType='website';
const planner=document.getElementById('project-planner');
const featureOptions=document.getElementById('feature-options');
const timing=document.getElementById('project-timing');
const briefArea=document.querySelector('#brief textarea');
const transferNote=document.createElement('p');transferNote.className='brief-transfer-note';transferNote.setAttribute('role','status');briefArea.parentElement.after(transferNote);
let briefTransferred=false;let lastGeneratedPlan='';
function renderPlanner(){
 featureOptions.replaceChildren();
 for(const key of typeFeatures[currentType]){const label=document.createElement('label');const input=document.createElement('input');input.type='checkbox';input.value=key;input.name='feature';input.checked=selectedFeatures[currentType].has(key);const text=document.createElement('span');text.textContent=features[key][language];label.append(input,text);featureOptions.append(label)}
 renderSummary();renderPreview();
}
function renderSummary(){
 document.getElementById('summary-title').textContent=projectTypes[currentType][language];
 const list=document.getElementById('summary-features');list.replaceChildren();
 if(selectedFeatures[currentType].size){for(const key of selectedFeatures[currentType]){const li=document.createElement('li');li.textContent=features[key][language];list.append(li)}}else{const li=document.createElement('li');li.textContent=language==='ar'?'نحدد الخصائص سوا':'We’ll define the features together';list.append(li)}
 document.getElementById('summary-timing').textContent=timingLabels[timing.value][language];
}
function renderPreview(){document.querySelector('.mission-scene').dataset.kind=currentType;document.getElementById('preview-description').textContent=projectTypes[currentType].description[language];document.querySelectorAll('[data-preview]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.preview===currentType)))}
function selectProject(type){currentType=type;planner.querySelector(`input[value="${type}"]`).checked=true;renderPlanner()}
planner.addEventListener('change',event=>{if(event.target.name==='project-type'){currentType=event.target.value;renderPlanner()}else if(event.target.name==='feature'){event.target.checked?selectedFeatures[currentType].add(event.target.value):selectedFeatures[currentType].delete(event.target.value);renderSummary()}});
timing.addEventListener('change',renderSummary);
document.querySelectorAll('[data-preview],[data-start]').forEach(control=>control.addEventListener('click',()=>selectProject(control.dataset.preview||control.dataset.start)));
function scrollBehavior(){return document.documentElement.dataset.motion==='off'||matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}
function appendBrief(text){const existing=briefArea.value.trim();if(!existing.includes(text))briefArea.value=existing?existing+'\n\n'+text:text;briefArea.dispatchEvent(new Event('input',{bubbles:true}));briefTransferred=true;transferNote.textContent=language==='ar'?'الملخص اتضاف هنا. راجعه وضيف تفاصيلك قبل تجهيز الإيميل.':'Your brief has been added here. Review it and add your details before preparing your email.';document.getElementById('brief').classList.add('brief-ready');document.getElementById('contact').scrollIntoView({behavior:scrollBehavior()});document.querySelector('#brief input').focus({preventScroll:true})}
document.getElementById('use-plan').addEventListener('click',()=>{const heading=language==='ar'?'ملخص المشروع':'Project brief';const featureHeading=language==='ar'?'الخصائص المقترحة':'Requested features';const chosen=[...selectedFeatures[currentType]].map(key=>features[key][language]);const text=[heading+': '+projectTypes[currentType][language],featureHeading+': '+(chosen.join(' · ')||(language==='ar'?'تتحدد بالمناقشة':'To be discussed')),timingLabels[timing.value][language]].join('\n');if(lastGeneratedPlan&&briefArea.value.includes(lastGeneratedPlan))briefArea.value=briefArea.value.replace(lastGeneratedPlan,text);appendBrief(text);lastGeneratedPlan=text});

// Navigation is a disclosure, with native links and predictable focus.
const menuButton=document.getElementById('menu-toggle');const header=document.querySelector('header');const nav=document.getElementById('main-nav');
function closeMenu(restoreFocus=false){header.classList.remove('is-menu-open');menuButton.setAttribute('aria-expanded','false');if(restoreFocus)menuButton.focus()}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';header.classList.toggle('is-menu-open',open);menuButton.setAttribute('aria-expanded',String(open))});
nav.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&header.classList.contains('is-menu-open'))closeMenu(true)});
document.addEventListener('click',event=>{if(!header.contains(event.target))closeMenu()});
matchMedia('(min-width: 901px)').addEventListener('change',event=>{if(event.matches)closeMenu()});

// Motion: single-use section entrances; no hidden content or blocking loader.
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const motionButton=document.getElementById('motion-toggle');let motionOff=reducedMotion.matches;const activeAnimations=new Set();
try{motionOff=localStorage.getItem('zimqora-motion')==='off'||reducedMotion.matches}catch{}
function applyMotion(){document.documentElement.dataset.motion=motionOff?'off':'on';motionButton.setAttribute('aria-pressed',String(motionOff));motionButton.textContent=language==='ar'?(motionOff?'الحركة متوقفة':'إيقاف الحركة'):(motionOff?'Motion paused':'Pause motion');if(motionOff){for(const animation of activeAnimations)animation.cancel();activeAnimations.clear()}}
motionButton.addEventListener('click',()=>{motionOff=!motionOff;applyMotion();try{localStorage.setItem('zimqora-motion',motionOff?'off':'on')}catch{}});
reducedMotion.addEventListener('change',event=>{if(event.matches){motionOff=true;applyMotion()}});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);if(motionOff||reducedMotion.matches||!entry.target.animate)continue;const animation=entry.target.animate([{opacity:.25,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'cubic-bezier(.23,1,.32,1)'});activeAnimations.add(animation);animation.onfinish=()=>activeAnimations.delete(animation)}},{threshold:.12});document.querySelectorAll('.section-top,.team-panel,.steps,.faq-items,.mission-console').forEach(el=>observer.observe(el))}

function localizeUpgrade(){menuButton.setAttribute('aria-label',language==='ar'?'قائمة التنقل':'Navigation menu');document.querySelector('.mission-tabs').setAttribute('aria-label',language==='ar'?'استكشف أنواع المشاريع':'Explore project types');document.querySelector('.assistant-widget').setAttribute('aria-label',language==='ar'?'مساعد ZIMQORA':'ZIMQORA assistant');document.querySelector('meta[name=description]').content=language==='ar'?'ZIMQORA — استوديو برمجة أسسه محمد أحمد. استكشف خدمات المواقع وتطبيقات الويب وتصميم الواجهات وجهّز طلب مشروعك.':'ZIMQORA — A software studio founded by Mohamed Ahmed. Explore websites, web applications and interface design. Build a service brief in English or Arabic.';document.title=language==='ar'?'ZIMQORA — برمجة بتوقيع أصحابها':'ZIMQORA — Software, with a personal point of view.';renderPlanner();applyMotion();if(briefTransferred)transferNote.textContent=language==='ar'?'الملخص اتضاف هنا. راجعه وضيف تفاصيلك قبل تجهيز الإيميل.':'Your brief has been added here. Review it and add your details before preparing your email.'}
document.addEventListener('languagechange',localizeUpgrade);
localizeUpgrade();
