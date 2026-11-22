const launcher=document.getElementById('assistant-launcher');
const panel=document.getElementById('assistant-panel');
const messages=document.getElementById('assistant-messages');
const options=document.getElementById('assistant-options');
const chatInput=document.getElementById('assistant-input');
let returnFocus=launcher;
let selectedService='';
const replies={
 welcome:{en:"Hi! I'm your ZIMQORA guide ✦ Tell me what you want to build, or choose an option below. I'll help you find a starting point.",ar:'أهلًا! أنا مساعد ZIMQORA ✦ احكيلي حابب تعمل إيه، أو اختار من تحت. أساعدك نحدد أنسب بداية لمشروعك.'},
 website:{en:'A company website or landing page is a good starting point for introducing your business. What does your business do, and which pages or features do you need?',ar:'موقع شركة أو صفحة هبوط بداية مناسبة لتعريف الناس بشغلك. نشاطك إيه؟ وإيه الصفحات أو الخصائص اللي محتاجها؟'},
 app:{en:'For a web application, start with the workflow: who will use it, what should they be able to do, and what is the biggest problem it should solve?',ar:'لو تطبيق ويب، نبدأ بطريقة الاستخدام: مين هيستخدمه؟ محتاج يعمل إيه؟ وإيه أهم مشكلة المفروض يحلّها؟'},
 design:{en:'For an interface project, tell us whether you have an existing product or are starting fresh. Which screens need design, and who is the audience?',ar:'لو محتاج تصميم واجهات، عندك منتج موجود ولا لسه بتبدأ؟ وإيه الشاشات اللي محتاج تصميمها ومين جمهورك؟'},
 cost:{en:'Price and delivery time depend on the features, design, and integrations. There is no fixed quote here. Prepare a brief with your must-have features and preferred launch date so the team can review the scope.',ar:'السعر ومدة التنفيذ بيتحددوا حسب الخصائص والتصميم والربط بالخدمات. مفيش عرض سعر ثابت هنا. جهّز أهم الخصائص وميعاد الإطلاق المناسب ليك عشان الفريق يراجع النطاق.'},
 contact:{en:'Email Zimqora.contact@gmail.com or call 01143627265 (+20 114 362 7265). Use the links below to contact the team. Nothing in this chat is sent automatically.',ar:'راسلنا على Zimqora.contact@gmail.com أو اتصل على 01143627265. روابط التواصل تحت الرسالة. المحادثة هنا مش بتتبعت للفريق تلقائيًا.'},
 fallback:{en:'Thanks — I can help with websites, web applications, interface design, or preparing a project brief. Choose an option below, or add the details you want included and select “Prepare my brief”.',ar:'تمام، أقدر أساعدك بخصوص المواقع وتطبيقات الويب وتصميم الواجهات، أو تجهيز ملخص مشروعك. اختار من تحت، أو اكتب التفاصيل اللي عاوز تضيفها واضغط «جهّز ملخص مشروعي».'}
};
const chatHistory=[{key:'welcome'}];
let renderedMessageCount=0,renderedLanguage=null;
const labels={plan:{en:'Build a project brief',ar:'جهّز طلب مشروعك'},website:{en:'A website',ar:'موقع إلكتروني'},app:{en:'A web application',ar:'تطبيق ويب'},design:{en:'Interface design',ar:'تصميم واجهات'},cost:{en:'Price & timeline',ar:'السعر والمدة'},contact:{en:'Contact the team',ar:'التواصل مع الفريق'},brief:{en:'Prepare my brief ↗',ar:'جهّز ملخص مشروعي ↖'}};
function renderChat(){
 const localeChanged=renderedLanguage!==language;
 if(localeChanged){messages.replaceChildren();renderedMessageCount=0;renderedLanguage=language}
 for(const message of chatHistory.slice(renderedMessageCount)){const bubble=document.createElement('p');bubble.className='chat-message'+(message.user?' user':'');bubble.textContent=message.key?replies[message.key][language]:message.text;messages.append(bubble);if(message.key==='contact'){const links=document.createElement('div');links.className='chat-contact-links';for(const [href,en,ar] of [['mailto:Zimqora.contact@gmail.com','Email the team ↗','راسل الفريق ↖'],['tel:+201143627265','Call us ↗','اتصل بينا ↖']]){const link=document.createElement('a');link.href=href;link.textContent=language==='ar'?ar:en;links.append(link)}messages.append(links)}}
 renderedMessageCount=chatHistory.length;
 if(localeChanged||!options.childElementCount){options.replaceChildren();for(const [action,label] of Object.entries(labels)){const button=document.createElement('button');button.type='button';button.dataset.action=action;button.textContent=label[language];options.append(button)}}
 chatInput.placeholder=language==='ar'?'احكيلي عن فكرتك…':'Tell me about your idea…';
 launcher.setAttribute('aria-label',language==='ar'?'افتح مساعد ZIMQORA':'Open ZIMQORA assistant');
 document.getElementById('assistant-close').setAttribute('aria-label',language==='ar'?'إغلاق المساعد':'Close assistant');
 document.getElementById('assistant-send').setAttribute('aria-label',language==='ar'?'إرسال الرسالة':'Send message');
 messages.scrollTop=messages.scrollHeight;
}
function openAssistant(event){returnFocus=event?.currentTarget||launcher;panel.hidden=false;launcher.setAttribute('aria-expanded','true');renderChat();document.getElementById('assistant-close').focus()}
function closeAssistant(){panel.hidden=true;launcher.setAttribute('aria-expanded','false');returnFocus.focus()}
launcher.addEventListener('click',event=>panel.hidden?openAssistant(event):closeAssistant());
document.querySelectorAll('.open-assistant').forEach(button=>button.addEventListener('click',openAssistant));
document.getElementById('assistant-close').addEventListener('click',closeAssistant);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)closeAssistant()});
document.getElementById('language').addEventListener('click',renderChat);
options.addEventListener('click',event=>{const button=event.target.closest('button[data-action]');if(!button)return;const action=button.dataset.action;
 if(action==='plan'){panel.hidden=true;launcher.setAttribute('aria-expanded','false');document.getElementById('planner').scrollIntoView({behavior:scrollBehavior()});document.querySelector('#project-planner input').focus({preventScroll:true});return}
 if(action==='brief'){const details=chatHistory.filter(m=>m.user).map(m=>m.text);const text=[...new Set([selectedService,...details].filter(Boolean))].join('\n');panel.hidden=true;launcher.setAttribute('aria-expanded','false');if(text)appendBrief(text);else{document.getElementById('planner').scrollIntoView({behavior:scrollBehavior()});document.querySelector('#project-planner input').focus({preventScroll:true})}return}
 if(['website','app','design'].includes(action))selectedService=labels[action][language];
 chatHistory.push({text:labels[action][language],user:true},{key:action});renderChat();chatInput.focus({preventScroll:true});
});
document.getElementById('assistant-form').addEventListener('submit',event=>{event.preventDefault();const text=chatInput.value.trim();if(!text)return;const normalized=text.toLowerCase();let key='fallback';if(/price|cost|budget|timeline|سعر|تكلف|ميزاني|مدة|وقت/.test(normalized))key='cost';else if(/contact|email|whatsapp|تواصل|واتس|ايميل|إيميل/.test(normalized))key='contact';else if(/dashboard|application|web app|تطبيق|لوحة تحكم/.test(normalized))key='app';else if(/design|interface|تصميم|واجهة|واجهات/.test(normalized))key='design';else if(/website|landing|موقع|صفحة/.test(normalized))key='website';if(['website','app','design'].includes(key))selectedService=labels[key][language];chatHistory.push({text,user:true},{key});chatInput.value='';renderChat()});
renderChat();
