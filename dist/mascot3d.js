import * as THREE from './assets/vendor/three.js';
import { loadCharacterAsset, makeCharacter } from './character-asset.js?v=de31a3c6c4c3';

export async function createMascotView(host,{mini=false,onReady=()=>{},onFailure=()=>{}}={}){
  let asset;try{asset=await loadCharacterAsset()}catch(error){onFailure();return null}
  let renderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:!mini,powerPreference:'low-power',premultipliedAlpha:true})}catch(error){onFailure();return null}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,mini?1.25:1.6));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
  const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');canvas.className='mascot-canvas';host.append(canvas);
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(34,1,.1,40);camera.position.set(0,.38,7.8);camera.lookAt(0,.16,0);
  scene.add(new THREE.HemisphereLight(0xe8e0ff,0x75638a,4.2));
  const key=new THREE.DirectionalLight(0xfff4fd,4.5);key.position.set(-3,5,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0xa9d8e0,1.8);fill.position.set(4,1,3);scene.add(fill);
  const rim=new THREE.DirectionalLight(0x9c68d0,1.5);rim.position.set(2,4,-4);scene.add(rim);
  const character=makeCharacter(asset);scene.add(character.root);
  const state={pointerX:0,pointerY:0,turn:0,gesture:'wave',since:performance.now()/1000,paused:document.documentElement.dataset.motion==='off'||matchMedia('(prefers-reduced-motion: reduce)').matches,chatOpen:false,typing:false};
  let alive=true,visible=false,frame=null,last=0,activeUntil=performance.now()+3500,rendered=false;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  function size(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=mini?7.7:(w/h<.85?9.3:7.8);camera.updateProjectionMatrix();request(500)}
  function render(now){frame=null;if(!alive||!visible||document.hidden)return;const time=now/1000;const dt=Math.min(.05,last?(now-last)/1000:.016);last=now;
    character.pose(time,dt,state);try{renderer.render(scene,camera)}catch(error){fail();return}
    if(!rendered){rendered=true;host.dataset.renderState='ready';host.dataset.drawCalls=String(renderer.info.render.calls);host.dataset.triangles=String(renderer.info.render.triangles);onReady()}
    if(!state.paused&&(!mini||now<activeUntil||state.chatOpen))frame=requestAnimationFrame(throttled);
  }
  let nextRender=0;
  function throttled(now){frame=null;if(now-nextRender<1000/30){if(alive&&visible&&!document.hidden)frame=requestAnimationFrame(throttled);return}nextRender=now;render(now)}
  function request(duration=1800){activeUntil=Math.max(activeUntil,performance.now()+duration);if(!frame&&visible&&!document.hidden&&alive)frame=requestAnimationFrame(throttled)}
  function fail(){if(!alive)return;host.dataset.renderState='fallback';onFailure();destroy()}
  function motion(){state.paused=document.documentElement.dataset.motion==='off'||reduce.matches;request(300)}
  const motionObserver=new MutationObserver(motion);motionObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});reduce.addEventListener('change',motion);
  const visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)request(1800);else if(frame){cancelAnimationFrame(frame);frame=null}},{rootMargin:'30px'});visibilityObserver.observe(host);
  const resizeObserver=new ResizeObserver(size);resizeObserver.observe(host);
  function visibility(){if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=null;last=0}else request(1000)}document.addEventListener('visibilitychange',visibility);
  function contextLost(event){event.preventDefault();fail()}canvas.addEventListener('webglcontextlost',contextLost);
  size();
  function react(gesture='wave'){
    const now=performance.now()/1000;
    // Let a greeting already in progress finish instead of dropping the arm
    // back to its starting pose on every click or duplicate panel event.
    if(gesture==='wave'&&state.gesture==='wave'&&now-state.since<3.3){request(3500);return}
    state.gesture=gesture;state.since=now;request(3500);host.dataset.reaction=gesture;
  }
  function look(x,y){if(state.paused)return;state.pointerX=THREE.MathUtils.clamp(x,-1,1);state.pointerY=THREE.MathUtils.clamp(y,-1,1);request(350)}
  function setChat(open,typing=false){
    const wasOpen=state.chatOpen,wasTyping=state.typing;state.chatOpen=open;state.typing=typing;
    // Input events and the panel observer must not restart the same gesture.
    if(open&&typing&&!wasTyping)react('think');
    else if(open&&!wasOpen)react(typing?'think':'wave');
    else request(400);
  }
  function turn(value){state.turn=THREE.MathUtils.clamp(value,-Math.PI*2,Math.PI*2);request(2000)}
  function destroy(){alive=false;if(frame)cancelAnimationFrame(frame);visibilityObserver.disconnect();resizeObserver.disconnect();motionObserver.disconnect();reduce.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',contextLost);character.dispose();renderer.dispose();canvas.remove()}
  return {react,look,setChat,turn,destroy};
}
