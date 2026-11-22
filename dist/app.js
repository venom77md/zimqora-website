let language='en';
try{language=localStorage.getItem('zimqora-language')==='ar'?'ar':'en'}catch{}
function setLanguage(value){language=value;document.documentElement.lang=value;document.documentElement.dir=value==='ar'?'rtl':'ltr';document.querySelectorAll('[data-en][data-ar]').forEach(el=>el.innerHTML=el.dataset[value]);const button=document.getElementById('language');button.textContent=value==='en'?'العربية':'English';button.setAttribute('aria-label',value==='en'?'Switch to Arabic':'التبديل للإنجليزية');document.querySelector('nav').setAttribute('aria-label',value==='en'?'Main navigation':'القائمة الرئيسية');document.getElementById('form-status').textContent='';try{localStorage.setItem('zimqora-language',value)}catch{}document.dispatchEvent(new Event('languagechange'))}
document.getElementById('language').addEventListener('click',()=>setLanguage(language==='en'?'ar':'en'));setLanguage(language);
const briefForm=document.getElementById('brief');
const emailBrief=document.getElementById('email-brief');
briefForm.querySelector('button[type="submit"]').disabled=false;
function briefText(){
  const data=new FormData(briefForm),ar=language==='ar';
  return `${ar?'ZIMQORA — ملخص المشروع':'ZIMQORA — Project brief'}\n\n${ar?'الاسم':'Name'}: ${data.get('name')||'—'}\n${ar?'البريد الإلكتروني':'Email'}: ${data.get('email')||'—'}\n\n${ar?'فكرة المشروع':'Project idea'}:\n${data.get('idea')||''}\n`;
}
function updateEmailDraft(){
  emailBrief.href='mailto:Zimqora.contact@gmail.com?subject='+encodeURIComponent(language==='ar'?'طلب مشروع جديد — ZIMQORA':'New project enquiry — ZIMQORA')+'&body='+encodeURIComponent(briefText());
}
briefForm.addEventListener('input',updateEmailDraft);
document.addEventListener('languagechange',updateEmailDraft);
emailBrief.addEventListener('focus',updateEmailDraft);
emailBrief.addEventListener('click',event=>{
  if(!briefForm.reportValidity()){event.preventDefault();return}
  updateEmailDraft();
  document.getElementById('form-status').textContent=language==='ar'?'راجع الرسالة في تطبيق البريد واضغط إرسال بنفسك. لو التطبيق مش متجهّز، انسخ عنوان الإيميل وحمّل الملخص.':'Review and send the draft in your email app. If no app is configured, copy the email address and download your brief.';
});
updateEmailDraft();
briefForm.addEventListener('submit',event=>{
  event.preventDefault();if(!briefForm.reportValidity())return;
  const note=language==='ar'?'تم التجهيز محليًا. لم يتم إرسال الملخص.':'Prepared locally. This brief has not been sent.';
  const url=URL.createObjectURL(new Blob(['\ufeff'+briefText()+'\n'+note+'\n'],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='ZIMQORA-project-brief.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  document.getElementById('form-status').textContent=language==='ar'?'تم تجهيز نسخة للتحميل. لإرسالها، استخدم إيميل الشركة.':'Your copy is ready to download. To send it, use the company email.';
});
