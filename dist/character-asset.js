import * as THREE from './assets/vendor/three.js';
import { GLTFLoader } from './assets/vendor/gltf-loader.js';

let assetPromise=null;
let references=0;
export function loadCharacterAsset(){
  if(!assetPromise)assetPromise=new GLTFLoader().loadAsync(new URL('./assets/models/vyqo-reference.glb?v=06a90448c622',import.meta.url).href);
  return assetPromise;
}

// Authored in Blender against the user's front/side/back reference.
// Named pivots articulate the real mesh without changing the character design.
export function makeCharacter(asset){
  references++;
  const root=new THREE.Group();
  const model=asset.scene.clone(true);model.position.y=-1.72;root.add(model);
  const get=name=>{const node=model.getObjectByName(name);if(!node)throw new Error(`Missing character pivot: ${name}`);return node};
  const head=get('Rig_Head'),eyes=get('Rig_Eyes'),orb=get('Rig_Orb');
  const arms=[{side:-1,arm:get('Rig_Arm_L'),elbow:get('Rig_Elbow_L'),hand:get('Rig_Hand_L')},{side:1,arm:get('Rig_Arm_R'),elbow:get('Rig_Elbow_R'),hand:get('Rig_Hand_R')}];
  const cape=get('VYQO_FabricCape');
  cape.geometry=cape.geometry.clone();const capeRest=new Float32Array(cape.geometry.getAttribute('position').array);
  cape.geometry.computeBoundingBox();const capeBox=cape.geometry.boundingBox;const capeHeight=capeBox.max.y-capeBox.min.y;
  model.traverse(node=>{if(!node.isMesh)return;node.castShadow=false;node.receiveShadow=false;if(node.material?.name==='M_CyanEyes'){node.material.toneMapped=false;node.material.emissiveIntensity=.9}});
  let yaw=-.15;root.rotation.y=yaw;
  // Preserve joint velocity when a greeting is repeated or interrupted.
  // Spring: mass 1, stiffness 100, damping 10; integrate at <= 120 Hz.
  const joints=new Map();
  function joint(node,axis,target,dt,paused){
    const key=node.name+axis;let spring=joints.get(key);
    if(!spring){spring={value:node.rotation[axis],velocity:0};joints.set(key,spring)}
    if(paused){spring.value=target;spring.velocity=0}else{
      const steps=Math.max(1,Math.ceil(dt*120)),h=dt/steps;
      for(let i=0;i<steps;i++){spring.velocity+=(100*(target-spring.value)-10*spring.velocity)*h;spring.value+=spring.velocity*h}
    }
    node.rotation[axis]=spring.value;
  }
  function pose(time,dt,state){
    const moving=!state.paused;const p=Math.max(0,time-state.since);const blend=1-Math.exp(-dt*8);
    let wave=0,think=0,spin=0,bounce=0;
    if(moving&&state.gesture==='wave'&&p<2.8)wave=THREE.MathUtils.smootherstep(p,0,.48)*(1-THREE.MathUtils.smootherstep(p,2.05,2.8));
    if(moving&&state.gesture==='think'&&p<3)think=Math.sin(Math.min(1,p/.35)*Math.PI/2)*Math.min(1,(3-p)/.4);
    if(state.gesture==='celebrate'&&p<2.7){spin=Math.PI*2*THREE.MathUtils.smootherstep(p,0,2.1);bounce=Math.sin(p/2.7*Math.PI)*.14}
    yaw=state.paused?-.15+state.turn:THREE.MathUtils.lerp(yaw,-.15+state.turn+state.pointerX*.14,blend);
    root.rotation.y=yaw+(moving?spin:0);root.rotation.z=moving?Math.sin(time*.85)*.009:0;
    root.position.y=moving?Math.sin(time*1.5)*.025+bounce:0;
    head.rotation.y=THREE.MathUtils.lerp(head.rotation.y,moving?state.pointerX*.16:0,blend);
    head.rotation.x=THREE.MathUtils.lerp(head.rotation.x,moving?state.pointerY*.07+(state.typing?.08:0)+think*.045:0,blend);
    head.rotation.z=THREE.MathUtils.lerp(head.rotation.z,moving?think*-.075+wave*-.035:0,blend);
    const blink=moving?1-Math.pow(Math.max(0,Math.cos(time*1.4)),65)*.94:1;eyes.scale.y=blink;
    // Raise the upper arm only slightly. Bend the elbow to put the palm
    // beside the face, then wave twice with the forearm and wrist.
    // Oscillation starts after the lift and fades before the arm comes down.
    const greetingTime=THREE.MathUtils.clamp((p-.55)/1.4,0,1);
    const greetingWindow=Math.sin(Math.PI*greetingTime)**2;
    const sway=Math.sin(greetingTime*Math.PI*4)*greetingWindow*wave;
    for(const part of arms){
      const right=part.side===1;
      let shoulder=right?wave*.78+think*.45:0;
      if(moving&&state.gesture==='celebrate'&&p<2.7)shoulder=part.side*.85;
      joint(part.arm,'z',shoulder,dt,!moving);
      joint(part.arm,'x',right?-wave*.12-think*.30:0,dt,!moving);
      joint(part.elbow,'z',right?wave*1.05+sway*.10:0,dt,!moving);
      joint(part.hand,'z',right?-wave*.12+sway*.28:0,dt,!moving);
      joint(part.hand,'y',right?-wave*.28:0,dt,!moving);
    }
    const a=moving?time*.15+.27:.27;orb.position.set(1.32*Math.cos(a),.60*Math.cos(a)+.34*Math.sin(a),-.91*Math.sin(a));
    if(moving){const attr=cape.geometry.getAttribute('position');for(let i=0;i<attr.count;i++){const h=(capeBox.max.y-capeRest[i*3+1])/capeHeight;attr.array[i*3+2]=capeRest[i*3+2]+Math.sin(time*1.8+capeRest[i*3]*3)*h*h*.018}attr.needsUpdate=true}
  }
  function dispose(){
    cape.geometry.dispose();references--;
    if(references>0)return;
    const geometries=new Set(),materials=new Set(),textures=new Set();
    asset.scene.traverse(node=>{if(node.geometry)geometries.add(node.geometry);for(const mat of (Array.isArray(node.material)?node.material:[node.material])){if(!mat)continue;materials.add(mat);for(const value of Object.values(mat))if(value?.isTexture)textures.add(value)}});
    for(const geometry of geometries)geometry.dispose();for(const mat of materials)mat.dispose();for(const texture of textures){texture.dispose();if(typeof texture.image?.close==='function')texture.image.close()}
  }
  return {root,pose,dispose};
}
