(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e;(function(e){e.Unimplemented=`UNIMPLEMENTED`,e.Unavailable=`UNAVAILABLE`})(e||={});var t=class extends Error{constructor(e,t,n){super(e),this.message=e,this.code=t,this.data=n}},n=e=>e?.androidBridge?`android`:e?.webkit?.messageHandlers?.bridge?`ios`:`web`,r=r=>{let i=r.CapacitorCustomPlatform||null,a=r.Capacitor||{},o=a.Plugins=a.Plugins||{},s=()=>i===null?n(r):i.name,c=()=>s()!==`web`,l=e=>!!(f.get(e)?.platforms.has(s())||u(e)),u=e=>a.PluginHeaders?.find(t=>t.name===e),d=e=>r.console.error(e),f=new Map;return a.convertFileSrc||=e=>e,a.getPlatform=s,a.handleError=d,a.isNativePlatform=c,a.isPluginAvailable=l,a.registerPlugin=(n,r={})=>{let c=f.get(n);if(c)return console.warn(`Capacitor plugin "${n}" already registered. Cannot register plugins twice.`),c.proxy;let l=s(),d=u(n),p,m=async()=>(!p&&l in r?p=p=typeof r[l]==`function`?await r[l]():r[l]:i!==null&&!p&&`web`in r&&(p=p=typeof r.web==`function`?await r.web():r.web),p),h=(r,i)=>{if(d){let e=d?.methods.find(e=>i===e.name);if(e)return e.rtype===`promise`?e=>a.nativePromise(n,i.toString(),e):(e,t)=>a.nativeCallback(n,i.toString(),e,t);if(r)return r[i]?.bind(r)}else if(r)return r[i]?.bind(r);else throw new t(`"${n}" plugin is not implemented on ${l}`,e.Unimplemented)},g=r=>{let i,a=(...a)=>{let o=m().then(o=>{let s=h(o,r);if(s){let e=s(...a);return i=e?.remove,e}throw new t(`"${n}.${r}()" is not implemented on ${l}`,e.Unimplemented)});return r===`addListener`&&(o.remove=async()=>i()),o};return a.toString=()=>`${r.toString()}() { [capacitor code] }`,Object.defineProperty(a,"name",{value:r,writable:!1,configurable:!1}),a},_=g(`addListener`),v=g(`removeListener`),y=(e,t)=>{let n=_({eventName:e},t),r=async()=>{let r=await n;v({eventName:e,callbackId:r},t)},i=new Promise(e=>n.then(()=>e({remove:r})));return i.remove=async()=>{console.warn(`Using addListener() without 'await' is deprecated.`),await r()},i},b=new Proxy({},{get(e,t){switch(t){case`$$typeof`:return;case`toJSON`:return()=>({});case`addListener`:return d?y:_;case`removeListener`:return v;default:return g(t)}}});return o[n]=b,f.set(n,{name:n,proxy:b,platforms:new Set([...Object.keys(r),...d?[l]:[]])}),b},a.Exception=t,a.DEBUG=!!a.DEBUG,a.isLoggingEnabled=!!a.isLoggingEnabled,a},i=(e=>e.Capacitor=r(e))(typeof globalThis<`u`?globalThis:typeof self<`u`?self:typeof window<`u`?window:typeof global<`u`?global:{}),a=i.registerPlugin,o=class{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(e,t){let n=!1;this.listeners[e]||(this.listeners[e]=[],n=!0),this.listeners[e].push(t);let r=this.windowListeners[e];return r&&!r.registered&&this.addWindowListener(r),n&&this.sendRetainedArgumentsForEvent(e),Promise.resolve({remove:async()=>this.removeListener(e,t)})}async removeAllListeners(){this.listeners={};for(let e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t,n){let r=this.listeners[e];if(r)r.forEach(e=>e(t));else if(n){let n=this.retainedEventArguments[e];n||=[],n.push(t),this.retainedEventArguments[e]=n}}hasListeners(e){return!!this.listeners[e]?.length}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:e=>{this.notifyListeners(t,e)}}}unimplemented(t=`not implemented`){return new i.Exception(t,e.Unimplemented)}unavailable(t=`not available`){return new i.Exception(t,e.Unavailable)}async removeListener(e,t){let n=this.listeners[e];if(!n)return;let r=n.indexOf(t);r!==-1&&this.listeners[e].splice(r,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}sendRetainedArgumentsForEvent(e){let t=this.retainedEventArguments[e];t&&(delete this.retainedEventArguments[e],t.forEach(t=>{this.notifyListeners(e,t)}))}},s=e=>encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),c=e=>e.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent),l=class extends o{async getCookies(){let e=document.cookie,t={};return e.split(`;`).forEach(e=>{if(e.length<=0)return;let[n,r]=e.replace(/=/,`CAP_COOKIE`).split(`CAP_COOKIE`);n=c(n).trim(),r=c(r).trim(),t[n]=r}),t}async setCookie(e){try{let t=s(e.key),n=s(e.value),r=e.expires?`; expires=${e.expires.replace(`expires=`,``)}`:``,i=(e.path||`/`).replace(`path=`,``),a=e.url!=null&&e.url.length>0?`domain=${e.url}`:``;document.cookie=`${t}=${n||``}${r}; path=${i}; ${a};`}catch(e){return Promise.reject(e)}}async deleteCookie(e){try{document.cookie=`${e.key}=; Max-Age=0`}catch(e){return Promise.reject(e)}}async clearCookies(){try{let e=document.cookie.split(`;`)||[];for(let t of e)document.cookie=t.replace(/^ +/,``).replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}};a(`CapacitorCookies`,{web:()=>new l});var u=async e=>new Promise((t,n)=>{let r=new FileReader;r.onload=()=>{let e=r.result;t(e.indexOf(`,`)>=0?e.split(`,`)[1]:e)},r.onerror=e=>n(e),r.readAsDataURL(e)}),d=(e={})=>{let t=Object.keys(e);return Object.keys(e).map(e=>e.toLocaleLowerCase()).reduce((n,r,i)=>(n[r]=e[t[i]],n),{})},f=(e,t=!0)=>e?Object.entries(e).reduce((e,n)=>{let[r,i]=n,a,o;return Array.isArray(i)?(o=``,i.forEach(e=>{a=t?encodeURIComponent(e):e,o+=`${r}=${a}&`}),o.slice(0,-1)):(a=t?encodeURIComponent(i):i,o=`${r}=${a}`),`${e}&${o}`},``).substr(1):null,p=(e,t={})=>{let n=Object.assign({method:e.method||`GET`,headers:e.headers},t),r=d(e.headers)[`content-type`]||``;if(typeof e.data==`string`)n.body=e.data;else if(r.includes(`application/x-www-form-urlencoded`)){let t=new URLSearchParams;for(let[n,r]of Object.entries(e.data||{}))t.set(n,r);n.body=t.toString()}else if(r.includes(`multipart/form-data`)||e.data instanceof FormData){let t=new FormData;if(e.data instanceof FormData)e.data.forEach((e,n)=>{t.append(n,e)});else for(let n of Object.keys(e.data))t.append(n,e.data[n]);n.body=t;let r=new Headers(n.headers);r.delete(`content-type`),n.headers=r}else(r.includes(`application/json`)||typeof e.data==`object`)&&(n.body=JSON.stringify(e.data));return n},m=class extends o{async request(e){let t=p(e,e.webFetchExtra),n=f(e.params,e.shouldEncodeUrlParams),r=n?`${e.url}?${n}`:e.url,i=await fetch(r,t),a=i.headers.get(`content-type`)||``,{responseType:o=`text`}=i.ok?e:{};a.includes(`application/json`)&&(o=`json`);let s,c;switch(o){case`arraybuffer`:case`blob`:c=await i.blob(),s=await u(c);break;case`json`:s=await i.json();break;default:s=await i.text()}let l={};return i.headers.forEach((e,t)=>{l[t]=e}),{data:s,headers:l,status:i.status,url:i.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:`GET`}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:`POST`}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:`PUT`}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:`PATCH`}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:`DELETE`}))}};a(`CapacitorHttp`,{web:()=>new m});var h;(function(e){e.Dark=`DARK`,e.Light=`LIGHT`,e.Default=`DEFAULT`})(h||={});var g;(function(e){e.StatusBar=`StatusBar`,e.NavigationBar=`NavigationBar`})(g||={});var _=class extends o{async setStyle(){this.unavailable(`not available for web`)}async setAnimation(){this.unavailable(`not available for web`)}async show(){this.unavailable(`not available for web`)}async hide(){this.unavailable(`not available for web`)}};a(`SystemBars`,{web:()=>new _});var v;(function(e){e.Heavy=`HEAVY`,e.Medium=`MEDIUM`,e.Light=`LIGHT`})(v||={});var y;(function(e){e.Success=`SUCCESS`,e.Warning=`WARNING`,e.Error=`ERROR`})(y||={});var b=`modulepreload`,x=function(e,t){return new URL(e,t).href},S={},C=function(e){return e.pathname.endsWith(`.css`)},w=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},T=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=x(t,n);let r=s(t),i=C(r);return w(S,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:b,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{let i=a=>{t.removeEventListener(`load`,i),t.removeEventListener(`error`,i),a.type===`error`?n(Error(`Unable to preload CSS for ${r}`)):e(a)};t.addEventListener(`load`,i),t.addEventListener(`error`,i)})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},E=a(`Haptics`,{web:()=>T(()=>import(`./web-tRe1bSdm.js`).then(e=>new e.HapticsWeb),[],import.meta.url)}),D;(function(e){e.Dark=`DARK`,e.Light=`LIGHT`,e.Default=`DEFAULT`})(D||={});var O;(function(e){e.None=`NONE`,e.Slide=`SLIDE`,e.Fade=`FADE`})(O||={});var k=a(`StatusBar`),A=null;async function j(){if(i.isNativePlatform())try{await k.setOverlaysWebView({overlay:!0}),await k.setStyle({style:D.Dark})}catch{}else`serviceWorker`in navigator&&window.location.protocol.startsWith(`http`)&&window.addEventListener(`load`,()=>{navigator.serviceWorker.register(`./sw.js`,{scope:`./`}).catch(()=>{})});let e=async()=>{let e=navigator;if(e.wakeLock&&document.visibilityState===`visible`)try{A=await e.wakeLock.request(`screen`)}catch{}};e(),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&!A&&e()})}function ee(e=12){if(i.isNativePlatform())E.impact({style:e>=20?v.Medium:v.Light}).catch(()=>{});else if(typeof navigator<`u`&&typeof navigator.vibrate==`function`)try{navigator.vibrate(e)}catch{}}var M=class{ctx=null;settings;lastShotSoundTime=0;lastGateTickTime=0;constructor(e){this.settings=e}updateSettings(e){this.settings=e}unlockOnGesture(){if(!this.settings.muted){if(!this.ctx){let e=window.AudioContext||window.webkitAudioContext;e&&(this.ctx=new e)}this.ctx&&this.ctx.state===`suspended`&&this.ctx.resume()}}vibrate(e=12){this.settings.haptics&&ee(e)}ensureReady(){return this.settings.muted||!this.ctx||this.ctx.state!==`running`?null:this.ctx}playGunfire(e){let t=this.ensureReady();if(!t)return;let n=t.currentTime;if(n-this.lastShotSoundTime<.055)return;this.lastShotSoundTime=n;let r=t.createOscillator(),i=t.createGain();if(e===5){r.type=`sine`,r.frequency.setValueAtTime(920,n),r.frequency.exponentialRampToValueAtTime(240,n+.065),i.gain.setValueAtTime(.055,n),i.gain.exponentialRampToValueAtTime(.001,n+.065),r.connect(i).connect(t.destination),r.start(n),r.stop(n+.07);return}r.type=e>=3?`sawtooth`:`triangle`;let a=e===4?260:e===3?210:300;r.frequency.setValueAtTime(a,n),r.frequency.exponentialRampToValueAtTime(68,n+.045),i.gain.setValueAtTime(.045,n),i.gain.exponentialRampToValueAtTime(.001,n+.045),r.connect(i).connect(t.destination),r.start(n),r.stop(n+.05)}playGateTick(e){let t=this.ensureReady();if(!t)return;let n=t.currentTime;if(n-this.lastGateTickTime<.038)return;this.lastGateTickTime=n;let r=t.createOscillator(),i=t.createGain();r.type=`triangle`;let a=e>0&&e<4?540+(e-1)*320:420+(Math.max(-25,Math.min(35,e))+25)*11;r.frequency.setValueAtTime(a,n),r.frequency.exponentialRampToValueAtTime(a*1.18,n+.042),i.gain.setValueAtTime(.048,n),i.gain.exponentialRampToValueAtTime(.001,n+.048),r.connect(i).connect(t.destination),r.start(n),r.stop(n+.052)}playGateFlipChime(){this.vibrate(12);let e=this.ensureReady();if(!e)return;let t=[523.25,659.25,783.99,1046.5],n=e.currentTime;for(let r=0;r<t.length;r++){let i=e.createOscillator(),a=e.createGain();i.type=`triangle`;let o=n+r*.045;i.frequency.setValueAtTime(t[r],o),a.gain.setValueAtTime(.08,o),a.gain.exponentialRampToValueAtTime(.001,o+.14),i.connect(a).connect(e.destination),i.start(o),i.stop(o+.15)}}playGateCollect(e){let t=this.ensureReady();if(!t)return;let n=t.currentTime,r=t.createOscillator(),i=t.createGain();r.type=e?`triangle`:`sawtooth`,e?(r.frequency.setValueAtTime(440,n),r.frequency.exponentialRampToValueAtTime(880,n+.14)):(r.frequency.setValueAtTime(220,n),r.frequency.exponentialRampToValueAtTime(85,n+.18)),i.gain.setValueAtTime(.09,n),i.gain.exponentialRampToValueAtTime(.001,n+.19),r.connect(i).connect(t.destination),r.start(n),r.stop(n+.2)}playRicochet(){let e=this.ensureReady();if(!e)return;let t=e.currentTime;if(t-this.lastGateTickTime<.07)return;this.lastGateTickTime=t;let n=e.createOscillator(),r=e.createGain();n.type=`square`,n.frequency.setValueAtTime(1350,t),n.frequency.exponentialRampToValueAtTime(680,t+.035),r.gain.setValueAtTime(.022,t),r.gain.exponentialRampToValueAtTime(.001,t+.04),n.connect(r).connect(e.destination),n.start(t),n.stop(t+.045)}playTireBreak(e){this.vibrate(12);let t=this.ensureReady();if(!t)return;let n=t.currentTime,r=t.createOscillator(),i=t.createGain();r.type=`triangle`,r.frequency.setValueAtTime(190,n),r.frequency.exponentialRampToValueAtTime(55,n+.11),i.gain.setValueAtTime(.11,n),i.gain.exponentialRampToValueAtTime(.001,n+.12),r.connect(i).connect(t.destination),r.start(n),r.stop(n+.13);let a=e?[587.33,880,1174.66]:[659.25,987.77];for(let e=0;e<a.length;e++){let r=t.createOscillator(),i=t.createGain();r.type=`sine`;let o=n+.04+e*.05;r.frequency.setValueAtTime(a[e],o),i.gain.setValueAtTime(.075,o),i.gain.exponentialRampToValueAtTime(.001,o+.13),r.connect(i).connect(t.destination),r.start(o),r.stop(o+.14)}}playEnemyPop(){let e=this.ensureReady();if(!e)return;let t=e.currentTime,n=e.createOscillator(),r=e.createGain();n.type=`sine`,n.frequency.setValueAtTime(280,t),n.frequency.exponentialRampToValueAtTime(95,t+.06),r.gain.setValueAtTime(.05,t),r.gain.exponentialRampToValueAtTime(.001,t+.065),n.connect(r).connect(e.destination),n.start(t),n.stop(t+.07)}playBossDefeat(){this.vibrate(12);let e=this.ensureReady();if(!e)return;let t=[523.25,659.25,783.99,1046.5,1318.5],n=e.currentTime;for(let r=0;r<t.length;r++){let i=e.createOscillator(),a=e.createGain();i.type=`triangle`;let o=n+r*.065;i.frequency.setValueAtTime(t[r],o),a.gain.setValueAtTime(.09,o),a.gain.exponentialRampToValueAtTime(.001,o+.35),i.connect(a).connect(e.destination),i.start(o),i.stop(o+.36)}}playBossSalvoWarning(){this.vibrate(10);let e=this.ensureReady();if(!e)return;let t=e.currentTime;for(let n=0;n<2;n++){let r=e.createOscillator(),i=e.createGain();r.type=`sawtooth`;let a=t+n*.12;r.frequency.setValueAtTime(540,a),r.frequency.exponentialRampToValueAtTime(820,a+.09),i.gain.setValueAtTime(.055,a),i.gain.exponentialRampToValueAtTime(.001,a+.1),r.connect(i).connect(e.destination),r.start(a),r.stop(a+.11)}}playBossSalvoImpact(e){e||this.vibrate(20);let t=this.ensureReady();if(!t)return;let n=t.currentTime,r=t.createOscillator(),i=t.createGain();e?(r.type=`triangle`,r.frequency.setValueAtTime(620,n),r.frequency.exponentialRampToValueAtTime(980,n+.09),i.gain.setValueAtTime(.055,n),i.gain.exponentialRampToValueAtTime(.001,n+.1),r.connect(i).connect(t.destination),r.start(n),r.stop(n+.11)):(r.type=`sawtooth`,r.frequency.setValueAtTime(165,n),r.frequency.exponentialRampToValueAtTime(42,n+.22),i.gain.setValueAtTime(.13,n),i.gain.exponentialRampToValueAtTime(.001,n+.24),r.connect(i).connect(t.destination),r.start(n),r.stop(n+.25))}playUpgradeBuy(e=1){this.vibrate(10);let t=this.ensureReady();if(!t)return;let n=t.currentTime,r=1+(Math.max(1,e)-1)%5*.06,i=[587.33*r,783.99*r,1174.66*r];for(let e=0;e<i.length;e++){let r=t.createOscillator(),a=t.createGain();r.type=`triangle`;let o=n+e*.042;r.frequency.setValueAtTime(i[e],o),a.gain.setValueAtTime(.072,o),a.gain.exponentialRampToValueAtTime(.001,o+.13),r.connect(a).connect(t.destination),r.start(o),r.stop(o+.14)}}},te=1e3,ne=1001,re=1002,ie=1003,ae=1004,oe=1005,se=1006,ce=1007,le=1008,ue=1009,de=1010,fe=1011,pe=1012,me=1013,he=1014,ge=1015,_e=1016,ve=1017,ye=1018,be=1020,xe=35902,Se=35899,Ce=1021,we=1022,Te=1023,Ee=1026,De=1027,Oe=1028,ke=1029,Ae=1030,je=1031,Me=1033,Ne=33776,Pe=33777,Fe=33778,Ie=33779,N=35840,Le=35841,Re=35842,ze=35843,P=36196,Be=37492,F=37496,I=37488,Ve=37489,He=37490,Ue=37491,We=37808,Ge=37809,Ke=37810,qe=37811,Je=37812,Ye=37813,Xe=37814,Ze=37815,Qe=37816,$e=37817,et=37818,tt=37819,nt=37820,rt=37821,it=36492,at=36494,ot=36495,st=36283,ct=36284,lt=36285,ut=36286,dt=2300,ft=2301,pt=2302,mt=2303,ht=2400,gt=2401,_t=2402,vt=3200,yt=`srgb`,bt=`srgb-linear`,xt=`linear`,St=`srgb`,Ct=7680,wt=35044,Tt=35048,Et=2e3;function Dt(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Ot(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function kt(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function At(){let e=kt(`canvas`);return e.style.display=`block`,e}var jt={};function Mt(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function Nt(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function L(...e){e=Nt(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function R(...e){e=Nt(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function Pt(...e){let t=e.join(` `);t in jt||(jt[t]=!0,L(...e))}function Ft(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var It={0:0,2:6,4:4,3:5,1:1,6:2,7:7,5:3},Lt=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},Rt=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),zt=Math.PI/180,Bt=180/Math.PI;function Vt(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Rt[e&255]+Rt[e>>8&255]+Rt[e>>16&255]+Rt[e>>24&255]+`-`+Rt[t&255]+Rt[t>>8&255]+`-`+Rt[t>>16&15|64]+Rt[t>>24&255]+`-`+Rt[n&63|128]+Rt[n>>8&255]+`-`+Rt[n>>16&255]+Rt[n>>24&255]+Rt[r&255]+Rt[r>>8&255]+Rt[r>>16&255]+Rt[r>>24&255]).toLowerCase()}function z(e,t,n){return Math.max(t,Math.min(n,e))}function Ht(e,t){return(e%t+t)%t}function Ut(e,t,n){return(1-n)*e+n*t}function Wt(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function Gt(e){switch(e.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Kt(e,t){if(t.constructor===Float32Array)return e;let n=Gt(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.max(e/n,-1)}function qt(e,t){if(t.constructor===Float32Array)return e;let n=Gt(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.round(e*n)}var B=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(z(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Jt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:L(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(z(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},V=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Xt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Xt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this.z=z(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this.z=z(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Yt.copy(this).projectOnVector(e),this.sub(Yt)}reflect(e){return this.sub(Yt.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(z(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Yt=new V,Xt=new Jt,H=class{static{this.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return Pt(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(Zt.makeScale(e,t)),this}rotate(e){return Pt(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(Zt.makeRotation(-e)),this}translate(e,t){return Pt(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(Zt.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Zt=new H,Qt=new H().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),$t=new H().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function en(){let e={enabled:!0,workingColorSpace:bt,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=nn(e.r),e.g=nn(e.g),e.b=nn(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=rn(e.r),e.g=rn(e.g),e.b=rn(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?xt:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[n].fromXYZ).multiply(this.spaces[t].toXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[bt]:{primaries:t,whitePoint:r,transfer:xt,toXYZ:Qt,fromXYZ:$t,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:yt},outputColorSpaceConfig:{drawingBufferColorSpace:yt}},[yt]:{primaries:t,whitePoint:r,transfer:St,toXYZ:Qt,fromXYZ:$t,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:yt}}}),e}var tn=en();function nn(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function rn(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var an,on=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{an===void 0&&(an=kt(`canvas`)),an.width=e.width,an.height=e.height;let t=an.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=an}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=kt(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=nn(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(nn(t[e]/255)*255):t[e]=nn(t[e]);return{data:t,width:e.width,height:e.height}}return L(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},sn=0,cn=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:sn++}),this.uuid=Vt(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width||0,t.height||0,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(ln(r[t].image)):e.push(ln(r[t]))}else e=ln(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function ln(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?on.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(L(`Texture: Unable to serialize Texture.`),{})}var un=0,dn=new V,fn=class e extends Lt{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=ne,i=ne,a=se,o=le,s=Te,c=ue,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:un++}),this.uuid=Vt(),this.name=``,this.source=new cn(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new B(0,0),this.repeat=new B(1,1),this.center=new B(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new H,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(dn).x}get height(){return this.source.getSize(dn).y}get depth(){return this.source.getSize(dn).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){L(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?L(`Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case te:e.x-=Math.floor(e.x);break;case ne:e.x=e.x<0?0:1;break;case re:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case te:e.y-=Math.floor(e.y);break;case ne:e.y=e.y<0?0:1;break;case re:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};fn.DEFAULT_IMAGE=null,fn.DEFAULT_MAPPING=300,fn.DEFAULT_ANISOTROPY=1;var pn=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this.z=z(this.z,e.z,t.z),this.w=z(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this.z=z(this.z,e,t),this.w=z(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},mn=class extends Lt{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:se,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new pn(0,0,e,t),this.scissorTest=!1,this.viewport=new pn(0,0,e,t),this.textures=[];let r=n.count;for(let i=0;i<r;i++)this.textures[i]=new fn({width:e,height:t,depth:n.depth}),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:se,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new cn(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},hn=class extends mn{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},gn=class extends fn{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=ie,this.minFilter=ie,this.wrapR=ne,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},_n=class extends fn{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=ie,this.minFilter=ie,this.wrapR=ne,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},vn=class e{static{this.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/yn.setFromMatrixColumn(e,0).length(),i=1/yn.setFromMatrixColumn(e,1).length(),a=1/yn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(xn,e,Sn)}lookAt(e,t,n){let r=this.elements;return Tn.subVectors(e,t),Tn.lengthSq()===0&&(Tn.z=1),Tn.normalize(),Cn.crossVectors(n,Tn),Cn.lengthSq()===0&&(Math.abs(n.z)===1?Tn.x+=1e-4:Tn.z+=1e-4,Tn.normalize(),Cn.crossVectors(n,Tn)),Cn.normalize(),wn.crossVectors(Tn,Cn),r[0]=Cn.x,r[4]=wn.x,r[8]=Tn.x,r[1]=Cn.y,r[5]=wn.y,r[9]=Tn.y,r[2]=Cn.z,r[6]=wn.z,r[10]=Tn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],ee=r[14],M=r[3],te=r[7],ne=r[11],re=r[15];return i[0]=a*x+o*T+s*k+c*M,i[4]=a*S+o*E+s*A+c*te,i[8]=a*C+o*D+s*j+c*ne,i[12]=a*w+o*O+s*ee+c*re,i[1]=l*x+u*T+d*k+f*M,i[5]=l*S+u*E+d*A+f*te,i[9]=l*C+u*D+d*j+f*ne,i[13]=l*w+u*O+d*ee+f*re,i[2]=p*x+m*T+h*k+g*M,i[6]=p*S+m*E+h*A+g*te,i[10]=p*C+m*D+h*j+g*ne,i[14]=p*w+m*O+h*ee+g*re,i[3]=_*x+v*T+y*k+b*M,i[7]=_*S+v*E+y*A+b*te,i[11]=_*C+v*D+y*j+b*ne,i[15]=_*w+v*O+y*ee+b*re,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=yn.set(r[0],r[1],r[2]).length(),o=yn.set(r[4],r[5],r[6]).length(),s=yn.set(r[8],r[9],r[10]).length();i<0&&(a=-a),bn.copy(this);let c=1/a,l=1/o,u=1/s;return bn.elements[0]*=c,bn.elements[1]*=c,bn.elements[2]*=c,bn.elements[4]*=l,bn.elements[5]*=l,bn.elements[6]*=l,bn.elements[8]*=u,bn.elements[9]*=u,bn.elements[10]*=u,t.setFromRotationMatrix(bn),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=Et,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=Et,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},yn=new V,bn=new vn,xn=new V(0,0,0),Sn=new V(1,1,1),Cn=new V,wn=new V,Tn=new V,En=new vn,Dn=new Jt,On=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(z(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-z(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(z(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-z(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(z(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-z(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:L(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return En.makeRotationFromQuaternion(e),this.setFromRotationMatrix(En,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Dn.setFromEuler(this),this.setFromQuaternion(Dn,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};On.DEFAULT_ORDER=`XYZ`;var kn=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},An=0,jn=new V,Mn=new Jt,Nn=new vn,Pn=new V,Fn=new V,In=new V,Ln=new Jt,Rn=new V(1,0,0),zn=new V(0,1,0),Bn=new V(0,0,1),Vn={type:`added`},Hn={type:`removed`},Un={type:`childadded`,child:null},Wn={type:`childremoved`,child:null},Gn=class e extends Lt{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:An++}),this.uuid=Vt(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new V,n=new On,r=new Jt,i=new V(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new vn},normalMatrix:{value:new H}}),this.matrix=new vn,this.matrixWorld=new vn,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new kn,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Mn.setFromAxisAngle(e,t),this.quaternion.multiply(Mn),this}rotateOnWorldAxis(e,t){return Mn.setFromAxisAngle(e,t),this.quaternion.premultiply(Mn),this}rotateX(e){return this.rotateOnAxis(Rn,e)}rotateY(e){return this.rotateOnAxis(zn,e)}rotateZ(e){return this.rotateOnAxis(Bn,e)}translateOnAxis(e,t){return jn.copy(e).applyQuaternion(this.quaternion),this.position.add(jn.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Rn,e)}translateY(e){return this.translateOnAxis(zn,e)}translateZ(e){return this.translateOnAxis(Bn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Nn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Pn.copy(e):Pn.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Fn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Nn.lookAt(Fn,Pn,this.up):Nn.lookAt(Pn,Fn,this.up),this.quaternion.setFromRotationMatrix(Nn),r&&(Nn.extractRotation(r.matrixWorld),Mn.setFromRotationMatrix(Nn),this.quaternion.premultiply(Mn.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(R(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Vn),Un.child=e,this.dispatchEvent(Un),Un.child=null):R(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Hn),Wn.child=e,this.dispatchEvent(Wn),Wn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Nn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Nn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Nn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Vn),Un.child=e,this.dispatchEvent(Un),Un.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fn,e,In),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fn,Ln,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};Gn.DEFAULT_UP=new V(0,1,0),Gn.DEFAULT_MATRIX_AUTO_UPDATE=!0,Gn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var U=class extends Gn{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Kn={type:`move`},qn=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new U,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new U,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new V,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new V),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new U,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new V,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new V,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.quaternion,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.quaternion,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Kn)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new U;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Jn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Yn={h:0,s:0,l:0},Xn={h:0,s:0,l:0};function Zn(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var W=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=yt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,tn.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=tn.workingColorSpace){return this.r=e,this.g=t,this.b=n,tn.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=tn.workingColorSpace){if(e=Ht(e,1),t=z(t,0,1),n=z(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Zn(i,r,e+1/3),this.g=Zn(i,r,e),this.b=Zn(i,r,e-1/3)}return tn.colorSpaceToWorking(this,r),this}setStyle(e,t=yt){function n(t){t!==void 0&&parseFloat(t)<1&&L(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseFloat(i[1]))/100,Math.min(100,parseFloat(i[2]))/100,Math.min(100,parseFloat(i[3]))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:L(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);L(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=yt){let n=Jn[e.toLowerCase()];return n===void 0?L(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=nn(e.r),this.g=nn(e.g),this.b=nn(e.b),this}copyLinearToSRGB(e){return this.r=rn(e.r),this.g=rn(e.g),this.b=rn(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=yt){return tn.workingToColorSpace(Qn.copy(this),e),Math.round(z(Qn.r*255,0,255))*65536+Math.round(z(Qn.g*255,0,255))*256+Math.round(z(Qn.b*255,0,255))}getHexString(e=yt){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=tn.workingColorSpace){tn.workingToColorSpace(Qn.copy(this),t);let n=Qn.r,r=Qn.g,i=Qn.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=tn.workingColorSpace){return tn.workingToColorSpace(Qn.copy(this),t),e.r=Qn.r,e.g=Qn.g,e.b=Qn.b,e}getStyle(e=yt){tn.workingToColorSpace(Qn.copy(this),e);let t=Qn.r,n=Qn.g,r=Qn.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(Yn),this.setHSL(Yn.h+e,Yn.s+t,Yn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Yn),e.getHSL(Xn);let n=Ut(Yn.h,Xn.h,t),r=Ut(Yn.s,Xn.s,t),i=Ut(Yn.l,Xn.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Qn=new W;W.NAMES=Jn;var $n=class e{constructor(e,t=25e-5){this.isFogExp2=!0,this.name=``,this.color=new W(e),this.density=t}clone(){return new e(this.color,this.density)}toJSON(){return{type:`FogExp2`,name:this.name,color:this.color.getHex(),density:this.density}}},er=class extends Gn{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new On,this.environmentIntensity=1,this.environmentRotation=new On,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background===null?null:e.background.clone(),this.environment=e.environment===null?null:e.environment.clone(),this.fog=e.fog===null?null:e.fog.clone(),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial===null?null:e.overrideMaterial.clone(),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},tr=new V,nr=new V,rr=new V,ir=new V,ar=new V,or=new V,sr=new V,cr=new V,lr=new V,ur=new V,dr=new pn,fr=new pn,pr=new pn,mr=class e{constructor(e=new V,t=new V,n=new V){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),tr.subVectors(e,t),r.cross(tr);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){tr.subVectors(r,t),nr.subVectors(n,t),rr.subVectors(e,t);let a=tr.dot(tr),o=tr.dot(nr),s=tr.dot(rr),c=nr.dot(nr),l=nr.dot(rr),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,ir)!==null&&ir.x>=0&&ir.y>=0&&ir.x+ir.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,ir)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,ir.x),s.addScaledVector(a,ir.y),s.addScaledVector(o,ir.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return dr.setScalar(0),fr.setScalar(0),pr.setScalar(0),dr.fromBufferAttribute(e,t),fr.fromBufferAttribute(e,n),pr.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(dr,i.x),a.addScaledVector(fr,i.y),a.addScaledVector(pr,i.z),a}static isFrontFacing(e,t,n,r){return tr.subVectors(n,t),nr.subVectors(e,t),tr.cross(nr).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return tr.subVectors(this.c,this.b),nr.subVectors(this.a,this.b),tr.cross(nr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;ar.subVectors(r,n),or.subVectors(i,n),cr.subVectors(e,n);let s=ar.dot(cr),c=or.dot(cr);if(s<=0&&c<=0)return t.copy(n);lr.subVectors(e,r);let l=ar.dot(lr),u=or.dot(lr);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0&&s-l>0)return a=s/(s-l),t.copy(n).addScaledVector(ar,a);ur.subVectors(e,i);let f=ar.dot(ur),p=or.dot(ur);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(or,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return sr.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(sr,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(ar,a).addScaledVector(or,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},hr=class{constructor(e=new V(1/0,1/0,1/0),t=new V(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(_r.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(_r.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=_r.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,_r):_r.fromBufferAttribute(r,t),_r.applyMatrix4(e.matrixWorld),this.expandByPoint(_r);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),vr.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),vr.copy(e.boundingBox)),vr.applyMatrix4(e.matrixWorld),this.union(vr)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,_r),_r.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Tr),Er.subVectors(this.max,Tr),yr.subVectors(e.a,Tr),br.subVectors(e.b,Tr),xr.subVectors(e.c,Tr),Sr.subVectors(br,yr),Cr.subVectors(xr,br),wr.subVectors(yr,xr);let t=[0,-Sr.z,Sr.y,0,-Cr.z,Cr.y,0,-wr.z,wr.y,Sr.z,0,-Sr.x,Cr.z,0,-Cr.x,wr.z,0,-wr.x,-Sr.y,Sr.x,0,-Cr.y,Cr.x,0,-wr.y,wr.x,0];return!kr(t,yr,br,xr,Er)||(t=[1,0,0,0,1,0,0,0,1],!kr(t,yr,br,xr,Er))?!1:(Dr.crossVectors(Sr,Cr),t=[Dr.x,Dr.y,Dr.z],kr(t,yr,br,xr,Er))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,_r).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(_r).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(gr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),gr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),gr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),gr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),gr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),gr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),gr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),gr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(gr)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},gr=[new V,new V,new V,new V,new V,new V,new V,new V],_r=new V,vr=new hr,yr=new V,br=new V,xr=new V,Sr=new V,Cr=new V,wr=new V,Tr=new V,Er=new V,Dr=new V,Or=new V;function kr(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){Or.fromArray(e,a);let o=i.x*Math.abs(Or.x)+i.y*Math.abs(Or.y)+i.z*Math.abs(Or.z),s=t.dot(Or),c=n.dot(Or),l=r.dot(Or);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var Ar=new V,jr=new B,Mr=0,Nr=class extends Lt{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Mr++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=wt,this.updateRanges=[],this.gpuType=ge,this.version=0,this._normalizationScale=e===void 0?void 0:Gt(e)}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)jr.fromBufferAttribute(this,t),jr.applyMatrix3(e),this.setXY(t,jr.x,jr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ar.fromBufferAttribute(this,t),Ar.applyMatrix3(e),this.setXYZ(t,Ar.x,Ar.y,Ar.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ar.fromBufferAttribute(this,t),Ar.applyMatrix4(e),this.setXYZ(t,Ar.x,Ar.y,Ar.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ar.fromBufferAttribute(this,t),Ar.applyNormalMatrix(e),this.setXYZ(t,Ar.x,Ar.y,Ar.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ar.fromBufferAttribute(this,t),Ar.transformDirection(e),this.setXYZ(t,Ar.x,Ar.y,Ar.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),i=this._normalize(i)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}_denormalize(e){let t=this._normalizationScale;return t===void 0?Kt(e,this.array):Math.max(e/t,-1)}_normalize(e){let t=this._normalizationScale;return t===void 0?qt(e,this.array):Math.round(e*t)}},Pr=class extends Nr{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Fr=class extends Nr{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Ir=class extends Nr{constructor(e,t,n){super(new Float32Array(e),t,n)}},Lr=new hr,Rr=new V,zr=new V,Br=class{constructor(e=new V,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?Lr.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Rr.subVectors(e,this.center);let t=Rr.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(Rr,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(zr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Rr.copy(e.center).add(zr)),this.expandByPoint(Rr.copy(e.center).sub(zr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Vr=0,Hr=new vn,Ur=new Gn,Wr=new V,Gr=new hr,Kr=new hr,qr=new V,Jr=class e extends Lt{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Vr++}),this.uuid=Vt(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(Dt(e)?Fr:Pr)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new H().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Hr.makeRotationFromQuaternion(e),this.applyMatrix4(Hr),this}rotateX(e){return Hr.makeRotationX(e),this.applyMatrix4(Hr),this}rotateY(e){return Hr.makeRotationY(e),this.applyMatrix4(Hr),this}rotateZ(e){return Hr.makeRotationZ(e),this.applyMatrix4(Hr),this}translate(e,t,n){return Hr.makeTranslation(e,t,n),this.applyMatrix4(Hr),this}scale(e,t,n){return Hr.makeScale(e,t,n),this.applyMatrix4(Hr),this}lookAt(e){return Ur.lookAt(e),Ur.updateMatrix(),this.applyMatrix4(Ur.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Wr).negate(),this.translate(Wr.x,Wr.y,Wr.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new Ir(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&L(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new hr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)R(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new V(-1/0,-1/0,-1/0),new V(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Gr.setFromBufferAttribute(n),this.morphTargetsRelative?(qr.addVectors(this.boundingBox.min,Gr.min),this.boundingBox.expandByPoint(qr),qr.addVectors(this.boundingBox.max,Gr.max),this.boundingBox.expandByPoint(qr)):(this.boundingBox.expandByPoint(Gr.min),this.boundingBox.expandByPoint(Gr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&R(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Br);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)R(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new V,1/0);else if(e){let n=this.boundingSphere.center;if(Gr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Kr.setFromBufferAttribute(n),this.morphTargetsRelative?(qr.addVectors(Gr.min,Kr.min),Gr.expandByPoint(qr),qr.addVectors(Gr.max,Kr.max),Gr.expandByPoint(qr)):(Gr.expandByPoint(Kr.min),Gr.expandByPoint(Kr.max))}Gr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)qr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(qr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)qr.fromBufferAttribute(a,t),o&&(Wr.fromBufferAttribute(e,t),qr.add(Wr)),r=Math.max(r,n.distanceToSquared(qr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&R(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){R(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new Nr(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[],c=new Uint8Array(n.count);for(let e=0;e<n.count;e++)o[e]=new V,s[e]=new V;let l=new V,u=new V,d=new V,f=new B,p=new B,m=new B,h=new V,g=new V;function _(e,t,r){c[e]=c[t]=c[r]=1,l.fromBufferAttribute(n,e),u.fromBufferAttribute(n,t),d.fromBufferAttribute(n,r),f.fromBufferAttribute(i,e),p.fromBufferAttribute(i,t),m.fromBufferAttribute(i,r),u.sub(l),d.sub(l),p.sub(f),m.sub(f);let a=1/(p.x*m.y-m.x*p.y);isFinite(a)&&(h.copy(u).multiplyScalar(m.y).addScaledVector(d,-p.y).multiplyScalar(a),g.copy(d).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(a),o[e].add(h),o[t].add(h),o[r].add(h),s[e].add(g),s[t].add(g),s[r].add(g))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let t=0,n=v.length;t<n;++t){let n=v[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)_(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let y=new V,b=new V,x=new V,S=new V;function C(e){x.fromBufferAttribute(r,e),S.copy(x);let t=o[e];y.copy(t),y.sub(x.multiplyScalar(x.dot(t))).normalize(),b.crossVectors(S,t);let n=b.dot(s[e])<0?-1:1;a.setXYZW(e,y.x,y.y,y.z,n)}for(let e=0,t=n.count;e<t;++e)c[e]&&C(e);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new Nr(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new V,i=new V,a=new V,o=new V,s=new V,c=new V,l=new V,u=new V;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)qr.fromBufferAttribute(e,t),qr.normalize(),e.setXYZ(t,qr.x,qr.y,qr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Nr(a,r,i)}if(this.index===null)return L(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},Yr=new V,Xr=new V,Zr=new H,Qr=class{constructor(e=new V(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Yr.subVectors(n,t).cross(Xr.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(Yr),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Zr.getNormalMatrix(e),r=this.coplanarPoint(Yr).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},$r=0,ei=class extends Lt{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:$r++}),this.uuid=Vt(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new W(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ct,this.stencilZFail=Ct,this.stencilZPass=Ct,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){L(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?L(`Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new W().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new Qr().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new B().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new B().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},ti=new V,ni=new V,ri=new V,ii=new V,ai=class{constructor(e=new V,t=new V(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ti)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=ti.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ti.copy(this.origin).addScaledVector(this.direction,t),ti.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){ni.copy(e).add(t).multiplyScalar(.5),ri.copy(t).sub(e).normalize(),ii.copy(this.origin).sub(ni);let i=e.distanceTo(t)*.5,a=-this.direction.dot(ri),o=ii.dot(this.direction),s=-ii.dot(ri),c=ii.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(ni).addScaledVector(ri,d),f}intersectSphere(e,t){if(e.radius<0)return null;ti.subVectors(e.center,this.origin);let n=ti.dot(this.direction),r=ti.dot(ti)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,ti)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,j,ee,M;if(y>=b&&y>=x?(w=s,D=u,A=p,M=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,j=_,ee=v):(S=l,C=c,T=f,E=d,O=h,k=m,j=v,ee=_)):b>=x?(w=c,D=d,A=m,M=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,j=v,ee=g):(S=s,C=l,T=u,E=f,O=p,k=h,j=g,ee=v)):(w=l,D=f,A=h,M=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,j=g,ee=_):(S=c,C=s,T=d,E=u,O=m,k=p,j=_,ee=g)),w===0)return null;let te=S/w,ne=C/w,re=1/w,ie=T-te*D,ae=E-ne*D,oe=O-te*A,se=k-ne*A,ce=j-te*M,le=ee-ne*M,ue=ce*se-le*oe,de=ie*le-ae*ce,fe=oe*ae-se*ie;if(r){if(ue<0||de<0||fe<0)return null}else if((ue<0||de<0||fe<0)&&(ue>0||de>0||fe>0))return null;let pe=ue+de+fe;if(pe===0)return null;let me=re*(ue*D+de*A+fe*M);return(pe>0?me<0:me>0)?null:this.at(me/pe,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},G=class extends ei{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new W(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new On,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},oi=new vn,si=new ai,ci=new Br,li=new V,ui=new V,di=new V,fi=new V,pi=new V,mi=new V,hi=new V,gi=new V,K=class extends Gn{constructor(e=new Jr,t=new G){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){mi.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(pi.fromBufferAttribute(s,e),a?mi.addScaledVector(pi,r):mi.addScaledVector(pi.sub(t),r))}t.add(mi)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ci.copy(n.boundingSphere),ci.applyMatrix4(i),si.copy(e.ray).recast(e.near),ci.containsPoint(si.origin)===!1&&(si.intersectSphere(ci,li)===null||si.origin.distanceToSquared(li)>(e.far-e.near)**2)||(oi.copy(i).invert(),si.copy(e.ray).applyMatrix4(oi),(n.boundingBox===null||si.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,si)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=vi(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=vi(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=vi(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=vi(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function _i(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;gi.copy(s),gi.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(gi);return l<n.near||l>n.far?null:{distance:l,point:gi.clone(),object:e}}function vi(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,ui),e.getVertexPosition(c,di),e.getVertexPosition(l,fi);let u=_i(e,t,n,r,ui,di,fi,hi);if(u){let e=new V;mr.getBarycoord(hi,ui,di,fi,e),i&&(u.uv=mr.getInterpolatedAttribute(i,s,c,l,e,new B)),a&&(u.uv1=mr.getInterpolatedAttribute(a,s,c,l,e,new B)),o&&(u.normal=mr.getInterpolatedAttribute(o,s,c,l,e,new V),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new V,materialIndex:0};mr.getNormal(ui,di,fi,t.normal),u.face=t,u.barycoord=e}return u}var yi=class extends fn{constructor(e=null,t=1,n=1,r,i,a,o,s,c=ie,l=ie,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},bi=class extends Nr{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},xi=new vn,Si=new vn,Ci=[],wi=new hr,Ti=new vn,Ei=new K,Di=new Br,Oi=class extends K{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new bi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,Ti)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new hr),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,xi),wi.copy(e.boundingBox).applyMatrix4(xi),this.boundingBox.union(wi)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Br),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,xi),Di.copy(e.boundingSphere).applyMatrix4(xi),this.boundingSphere.union(Di)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture===null?null:e.morphTexture.clone(),this.instanceColor=e.instanceColor===null?null:e.instanceColor.clone(),this.count=e.count,this.boundingBox=e.boundingBox===null?null:e.boundingBox.clone(),this.boundingSphere=e.boundingSphere===null?null:e.boundingSphere.clone(),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Ei.geometry=this.geometry,Ei.material=this.material,Ei.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Di.copy(this.boundingSphere),Di.applyMatrix4(n),e.ray.intersectsSphere(Di)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,xi),Si.multiplyMatrices(n,xi),Ei.matrixWorld=Si,Ei.raycast(e,Ci);for(let e=0,n=Ci.length;e<n;e++){let n=Ci[e];n.instanceId=i,n.object=this,t.push(n)}Ci.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new bi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new yi(new Float32Array(r*this.count),r,this.count,Oe,ge));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},ki=new Br,Ai=new B(.5,.5),ji=new V,Mi=class{constructor(e=new Qr,t=new Qr,n=new Qr,r=new Qr,i=new Qr,a=new Qr){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Et,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ki.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ki.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ki)}intersectsSprite(e){return ki.center.set(0,0,0),ki.radius=.7071067811865476+Ai.distanceTo(e.center),ki.applyMatrix4(e.matrixWorld),this.intersectsSphere(ki)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(ji.x=r.normal.x>0?e.max.x:e.min.x,ji.y=r.normal.y>0?e.max.y:e.min.y,ji.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(ji)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Ni=new vn,Pi=class e{constructor(){this.coordinateSystem=Et,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let e=0;e<t.length;e++){let r=t[e];Ni.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[e]===void 0&&(n[e]=new Mi),n[e].setFromProjectionMatrix(Ni,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let r=0;r<e._count;r++)t[r]===void 0&&(t[r]=new Mi),t[r].copy(n[r]);return this._count=e._count,this}clone(){return new e().copy(this)}},Fi=class extends ei{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new W(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Ii=new vn,Li=new ai,Ri=new Br,zi=new V,Bi=class extends Gn{constructor(e=new Jr,t=new Fi){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ri.copy(n.boundingSphere),Ri.applyMatrix4(r),Ri.radius+=i,e.ray.intersectsSphere(Ri)===!1)return;Ii.copy(r).invert(),Li.copy(e.ray).applyMatrix4(Ii);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);zi.fromBufferAttribute(l,n),Vi(zi,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)zi.fromBufferAttribute(l,a),Vi(zi,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Vi(e,t,n,r,i,a,o){let s=Li.distanceSqToPoint(e);if(s<n){let n=new V;Li.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Hi=class extends fn{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ui=class extends fn{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Wi=class extends fn{constructor(e,t,n=he,r,i,a,o=ie,s=ie,c,l=Ee,u=1){if(l!==1026&&l!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new cn(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Gi=class extends Wi{constructor(e,t=he,n=301,r,i,a=ie,o=ie,s,c=Ee){let l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,r,i,a,o,s,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Ki=class extends fn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},q=class e extends Jr{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new Ir(c,3)),this.setAttribute(`normal`,new Ir(l,3)),this.setAttribute(`uv`,new Ir(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new V;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},qi=class e extends Jr{constructor(e=1,t=1,n=4,r=8,i=1){super(),this.type=`CapsuleGeometry`,this.parameters={radius:e,height:t,capSegments:n,radialSegments:r,heightSegments:i},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),r=Math.max(3,Math.floor(r)),i=Math.max(1,Math.floor(i));let a=[],o=[],s=[],c=[],l=t/2,u=Math.PI/2*e,d=t,f=2*u+d,p=n*2+i,m=r+1,h=new V,g=new V;for(let _=0;_<=p;_++){let v=0,y=0,b=0,x=0;if(_<=n){let t=_/n,r=t*Math.PI/2;y=-l-e*Math.cos(r),b=e*Math.sin(r),x=-e*Math.cos(r),v=t*u}else if(_<=n+i){let r=(_-n)/i;y=-l+r*t,b=e,x=0,v=u+r*d}else{let t=(_-n-i)/n,r=t*Math.PI/2;y=l+e*Math.sin(r),b=e*Math.cos(r),x=e*Math.sin(r),v=u+d+t*u}let S=Math.max(0,Math.min(1,v/f)),C=0;_===0?C=.5/r:_===p&&(C=-.5/r);for(let e=0;e<=r;e++){let t=e/r,n=t*Math.PI*2,i=Math.sin(n),a=Math.cos(n);g.x=-b*a,g.y=y,g.z=b*i,o.push(g.x,g.y,g.z),h.set(-b*a,x,b*i),h.normalize(),s.push(h.x,h.y,h.z),c.push(t+C,S)}if(_>0){let e=(_-1)*m;for(let t=0;t<r;t++){let n=e+t,r=e+t+1,i=_*m+t,o=_*m+t+1;a.push(n,r,i),a.push(r,o,i)}}}this.setIndex(a),this.setAttribute(`position`,new Ir(o,3)),this.setAttribute(`normal`,new Ir(s,3)),this.setAttribute(`uv`,new Ir(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},Ji=class e extends Jr{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new V,l=new B;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new Ir(a,3)),this.setAttribute(`normal`,new Ir(o,3)),this.setAttribute(`uv`,new Ir(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},J=class e extends Jr{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new Ir(u,3)),this.setAttribute(`normal`,new Ir(d,3)),this.setAttribute(`uv`,new Ir(f,2));function _(){let a=new V,_=new V,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new B,m=new V,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Yi=class e extends J{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Xi=class e extends Jr{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new Ir(i,3)),this.setAttribute(`normal`,new Ir(i.slice(),3)),this.setAttribute(`uv`,new Ir(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new V,r=new V,i=new V;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new V;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new V;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new V,t=new V,n=new V,r=new V,o=new B,s=new B,c=new B;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},Zi=class e extends Xi{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=1/n,i=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-r,-n,0,-r,n,0,r,-n,0,r,n,-r,-n,0,-r,n,0,r,-n,0,r,n,0,-n,0,-r,n,0,-r,-n,0,r,n,0,r];super(i,[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9],e,t),this.type=`DodecahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Qi=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){L(`Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new B:new V);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new V,r=[],i=[],a=[],o=new V,s=new vn;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new V)}i[0]=new V,a[0]=new V;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(z(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(z(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}},$i=class extends Qi{constructor(e=0,t=0,n=1,r=1,i=0,a=Math.PI*2,o=!1,s=0){super(),this.isEllipseCurve=!0,this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=i,this.aEndAngle=a,this.aClockwise=o,this.aRotation=s}getPoint(e,t=new B){let n=t,r=Math.PI*2,i=this.aEndAngle-this.aStartAngle,a=Math.abs(i)<2**-52;for(;i<0;)i+=r;for(;i>r;)i-=r;i<2**-52&&(i=a?0:r),this.aClockwise===!0&&!a&&(i===r?i=-r:i-=r);let o=this.aStartAngle+e*i,s=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let e=Math.cos(this.aRotation),t=Math.sin(this.aRotation),n=s-this.aX,r=c-this.aY;s=n*e-r*t+this.aX,c=n*t+r*e+this.aY}return n.set(s,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},ea=class extends $i{constructor(e,t,n,r,i,a){super(e,t,n,n,r,i,a),this.isArcCurve=!0,this.type=`ArcCurve`}};function ta(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var na=new V,ra=new V,ia=new ta,aa=new ta,oa=new ta,sa=class extends Qi{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new V){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(ra.subVectors(r[0],r[1]).add(r[0]),c=ra);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(na.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=na),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),ia.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),aa.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),oa.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&(ia.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),aa.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),oa.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set(ia.calc(s),aa.calc(s),oa.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new V().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function ca(e,t,n,r,i){let a=(r-t)*.5,o=(i-n)*.5,s=e*e,c=e*s;return(2*n-2*r+a+o)*c+(-3*n+3*r-2*a-o)*s+a*e+n}function la(e,t){let n=1-e;return n*n*t}function ua(e,t){return 2*(1-e)*e*t}function da(e,t){return e*e*t}function fa(e,t,n,r){return la(e,t)+ua(e,n)+da(e,r)}function pa(e,t){let n=1-e;return n*n*n*t}function ma(e,t){let n=1-e;return 3*n*n*e*t}function ha(e,t){return 3*(1-e)*e*e*t}function ga(e,t){return e*e*e*t}function _a(e,t,n,r,i){return pa(e,t)+ma(e,n)+ha(e,r)+ga(e,i)}var va=class extends Qi{constructor(e=new B,t=new B,n=new B,r=new B){super(),this.isCubicBezierCurve=!0,this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new B){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(_a(e,r.x,i.x,a.x,o.x),_a(e,r.y,i.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ya=class extends Qi{constructor(e=new V,t=new V,n=new V,r=new V){super(),this.isCubicBezierCurve3=!0,this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new V){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(_a(e,r.x,i.x,a.x,o.x),_a(e,r.y,i.y,a.y,o.y),_a(e,r.z,i.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ba=class extends Qi{constructor(e=new B,t=new B){super(),this.isLineCurve=!0,this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new B){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new B){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},xa=class extends Qi{constructor(e=new V,t=new V){super(),this.isLineCurve3=!0,this.type=`LineCurve3`,this.v1=e,this.v2=t}getPoint(e,t=new V){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new V){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Sa=class extends Qi{constructor(e=new B,t=new B,n=new B){super(),this.isQuadraticBezierCurve=!0,this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new B){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(fa(e,r.x,i.x,a.x),fa(e,r.y,i.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ca=class extends Qi{constructor(e=new V,t=new V,n=new V){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new V){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(fa(e,r.x,i.x,a.x),fa(e,r.y,i.y,a.y),fa(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},wa=Object.freeze({__proto__:null,ArcCurve:ea,CatmullRomCurve3:sa,CubicBezierCurve:va,CubicBezierCurve3:ya,EllipseCurve:$i,LineCurve:ba,LineCurve3:xa,QuadraticBezierCurve:Sa,QuadraticBezierCurve3:Ca,SplineCurve:class extends Qi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type=`SplineCurve`,this.points=e}getPoint(e,t=new B){let n=t,r=this.points,i=(r.length-1)*e,a=Math.floor(i),o=i-a,s=r[a===0?a:a-1],c=r[a],l=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return n.set(ca(o,s.x,c.x,l.x,u.x),ca(o,s.y,c.y,l.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new B().fromArray(n))}return this}}}),Ta=class e extends Jr{constructor(e=[new B(0,-.5),new B(.5,0),new B(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type=`LatheGeometry`,this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=z(r,0,Math.PI*2);let i=[],a=[],o=[],s=[],c=[],l=1/t,u=new V,d=new B,f=new V,p=new V,m=new V,h=0,g=0;for(let t=0;t<=e.length-1;t++)switch(t){case 0:h=e[t+1].x-e[t].x,g=e[t+1].y-e[t].y,f.x=g*1,f.y=-h,f.z=g*0,m.copy(f),f.normalize(),s.push(f.x,f.y,f.z);break;case e.length-1:m.normalize(),s.push(m.x,m.y,m.z);break;default:h=e[t+1].x-e[t].x,g=e[t+1].y-e[t].y,f.x=g*1,f.y=-h,f.z=g*0,p.copy(f),f.x+=m.x,f.y+=m.y,f.z+=m.z,f.normalize(),s.push(f.x,f.y,f.z),m.copy(p)}for(let i=0;i<=t;i++){let f=n+i*l*r,p=Math.sin(f),m=Math.cos(f);for(let n=0;n<=e.length-1;n++){u.x=e[n].x*p,u.y=e[n].y,u.z=e[n].x*m,a.push(u.x,u.y,u.z),d.x=i/t,d.y=n/(e.length-1),o.push(d.x,d.y);let r=s[3*n+0]*p,l=s[3*n+1],f=s[3*n+0]*m;c.push(r,l,f)}}for(let n=0;n<t;n++)for(let t=0;t<e.length-1;t++){let r=t+n*e.length,a=r,o=r+e.length,s=r+e.length+1,c=r+1;i.push(a,o,c),i.push(s,c,o)}this.setIndex(i),this.setAttribute(`position`,new Ir(a,3)),this.setAttribute(`uv`,new Ir(o,2)),this.setAttribute(`normal`,new Ir(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.points,t.segments,t.phiStart,t.phiLength)}},Ea=class e extends Xi{constructor(e=1,t=0){super([1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],e,t),this.type=`OctahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Da=class e extends Jr{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new Ir(p,3)),this.setAttribute(`normal`,new Ir(m,3)),this.setAttribute(`uv`,new Ir(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},Oa=class e extends Jr{constructor(e=.5,t=1,n=32,r=1,i=0,a=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:i,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],s=[],c=[],l=[],u=e,d=(t-e)/r,f=new V,p=new B;for(let e=0;e<=r;e++){for(let e=0;e<=n;e++){let r=i+e/n*a;f.x=u*Math.cos(r),f.y=u*Math.sin(r),s.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,l.push(p.x,p.y)}u+=d}for(let e=0;e<r;e++){let t=e*(n+1);for(let e=0;e<n;e++){let r=e+t,i=r,a=r+n+1,s=r+n+2,c=r+1;o.push(i,a,c),o.push(a,s,c)}}this.setIndex(o),this.setAttribute(`position`,new Ir(s,3)),this.setAttribute(`normal`,new Ir(c,3)),this.setAttribute(`uv`,new Ir(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},ka=class e extends Jr{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new V,d=new V,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new Ir(p,3)),this.setAttribute(`normal`,new Ir(m,3)),this.setAttribute(`uv`,new Ir(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},Aa=class e extends Jr{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2,a=0,o=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);let s=[],c=[],l=[],u=[],d=new V,f=new V,p=new V;for(let s=0;s<=n;s++){let m=a+s/n*o;for(let a=0;a<=r;a++){let o=a/r*i;f.x=(e+t*Math.cos(m))*Math.cos(o),f.y=(e+t*Math.cos(m))*Math.sin(o),f.z=t*Math.sin(m),c.push(f.x,f.y,f.z),d.x=e*Math.cos(o),d.y=e*Math.sin(o),p.subVectors(f,d).normalize(),l.push(p.x,p.y,p.z),u.push(a/r),u.push(s/n)}}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,a=(r+1)*(e-1)+t,o=(r+1)*e+t;s.push(n,i,o),s.push(i,a,o)}this.setIndex(s),this.setAttribute(`position`,new Ir(c,3)),this.setAttribute(`normal`,new Ir(l,3)),this.setAttribute(`uv`,new Ir(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}},ja=class e extends Jr{constructor(e=new Ca(new V(-1,-1,0),new V(-1,1,0),new V(1,1,0)),t=64,n=1,r=8,i=!1){super(),this.type=`TubeGeometry`,this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:r,closed:i};let a=e.computeFrenetFrames(t,i);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new V,s=new V,c=new B,l=new V,u=[],d=[],f=[],p=[];m(),this.setIndex(p),this.setAttribute(`position`,new Ir(u,3)),this.setAttribute(`normal`,new Ir(d,3)),this.setAttribute(`uv`,new Ir(f,2));function m(){for(let e=0;e<t;e++)h(e);h(i===!1?t:0),_(),g()}function h(i){l=e.getPointAt(i/t,l);let c=a.normals[i],f=a.binormals[i];for(let e=0;e<=r;e++){let t=e/r*Math.PI*2,i=Math.sin(t),a=-Math.cos(t);s.x=a*c.x+i*f.x,s.y=a*c.y+i*f.y,s.z=a*c.z+i*f.z,s.normalize(),d.push(s.x,s.y,s.z),o.x=l.x+n*s.x,o.y=l.y+n*s.y,o.z=l.z+n*s.z,u.push(o.x,o.y,o.z)}}function g(){for(let e=1;e<=t;e++)for(let t=1;t<=r;t++){let n=(r+1)*(e-1)+(t-1),i=(r+1)*e+(t-1),a=(r+1)*e+t,o=(r+1)*(e-1)+t;p.push(n,i,o),p.push(i,a,o)}}function _(){for(let e=0;e<=t;e++)for(let n=0;n<=r;n++)c.x=e/t,c.y=n/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(t){return new e(new wa[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}};function Ma(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(Pa(i))i.isRenderTargetTexture?(L(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(Pa(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function Na(e){let t={};for(let n=0;n<e.length;n++){let r=Ma(e[n]);for(let e in r)t[e]=r[e]}return t}function Pa(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Fa(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function Ia(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:tn.workingColorSpace}var La={clone:Ma,merge:Na},Ra=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,za=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ba=class extends ei{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ra,this.fragmentShader=za,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ma(e.uniforms),this.uniformsGroups=Fa(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new W().setHex(r.value);break;case`v2`:this.uniforms[n].value=new B().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new V().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new pn().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new H().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new vn().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Va=class extends Ba{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Y=class extends ei{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new W(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new W(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new B(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new On,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Ha=class extends ei{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=vt,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ua=class extends ei{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Wa(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function Ga(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var Ka=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},qa=class extends Ka{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ht,endingEnd:ht}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case gt:i=e,o=2*t-n;break;case _t:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case gt:a=e,s=2*n-t;break;case _t:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Ja=class extends Ka{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Ya=class extends Ka{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Xa=class extends Ka{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=$a(n,t,g,y,r);i[p]=Za(x,o,_,b,m)}return i}};function Za(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function Qa(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function $a(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=Za(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=Qa(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var eo=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Wa(t,this.TimeBufferType),this.values=Wa(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Wa(e.times,Array),values:Wa(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),Ga(e.settings)&&(n.settings={inTangents:Wa(e.settings.inTangents,Array),outTangents:Wa(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Ya(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ja(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new qa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Xa(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case dt:t=this.InterpolantFactoryMethodDiscrete;break;case ft:t=this.InterpolantFactoryMethodLinear;break;case pt:t=this.InterpolantFactoryMethodSmooth;break;case mt:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return L(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return dt;case this.InterpolantFactoryMethodLinear:return ft;case this.InterpolantFactoryMethodSmooth:return pt;case this.InterpolantFactoryMethodBezier:return mt}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e;Ga(this.settings)&&(to(this.settings.inTangents,e),to(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;Ga(this.settings)&&(no(this.settings.inTangents,e),no(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(R(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(R(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){R(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){R(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Ot(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){R(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===pt,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,Ga(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function to(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]+=t}function no(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}eo.prototype.ValueTypeName=``,eo.prototype.TimeBufferType=Float32Array,eo.prototype.ValueBufferType=Float32Array,eo.prototype.DefaultInterpolation=ft;var ro=class extends eo{constructor(e,t,n){super(e,t,n)}};ro.prototype.ValueTypeName=`bool`,ro.prototype.ValueBufferType=Array,ro.prototype.DefaultInterpolation=dt,ro.prototype.InterpolantFactoryMethodLinear=void 0,ro.prototype.InterpolantFactoryMethodSmooth=void 0;var io=class extends eo{constructor(e,t,n,r){super(e,t,n,r)}};io.prototype.ValueTypeName=`color`;var ao=class extends eo{constructor(e,t,n,r){super(e,t,n,r)}};ao.prototype.ValueTypeName=`number`;var oo=class extends Ka{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Jt.slerpFlat(i,0,a,c-o,a,c,s);return i}},so=class extends eo{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new oo(this.times,this.values,this.getValueSize(),e)}};so.prototype.ValueTypeName=`quaternion`,so.prototype.InterpolantFactoryMethodSmooth=void 0;var co=class extends eo{constructor(e,t,n){super(e,t,n)}};co.prototype.ValueTypeName=`string`,co.prototype.ValueBufferType=Array,co.prototype.DefaultInterpolation=dt,co.prototype.InterpolantFactoryMethodLinear=void 0,co.prototype.InterpolantFactoryMethodSmooth=void 0;var lo=class extends eo{constructor(e,t,n,r){super(e,t,n,r)}};lo.prototype.ValueTypeName=`vector`;var uo=class extends Gn{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new W(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},fo=class extends uo{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(Gn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new W(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},po=new vn,mo=new V,ho=new V,go=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new B(512,512),this.mapType=ue,this.map=null,this.mapPass=null,this.matrix=new vn,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Mi,this._frameExtents=new B(1,1),this._viewportCount=1,this._viewports=[new pn(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;mo.setFromMatrixPosition(e.matrixWorld),t.position.copy(mo),ho.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ho),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){po.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(po,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(po)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},_o=new V,vo=new Jt,yo=new V,bo=class extends Gn{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new vn,this.projectionMatrix=new vn,this.projectionMatrixInverse=new vn,this.coordinateSystem=Et,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(_o,vo,yo),yo.x===1&&yo.y===1&&yo.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(_o,vo,yo.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(_o,vo,yo),yo.x===1&&yo.y===1&&yo.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(_o,vo,yo.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},xo=new V,So=new B,Co=new B,wo=class extends bo{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Bt*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(zt*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Bt*2*Math.atan(Math.tan(zt*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){xo.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(xo.x,xo.y).multiplyScalar(-e/xo.z),xo.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(xo.x,xo.y).multiplyScalar(-e/xo.z)}getViewSize(e,t){return this.getViewBounds(e,So,Co),t.subVectors(Co,So)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(zt*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},To=class extends bo{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Eo=class extends go{constructor(){super(new To(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Do=class extends uo{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(Gn.DEFAULT_UP),this.updateMatrix(),this.target=new Gn,this.shadow=new Eo}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},Oo=-90,ko=1,Ao=class extends Gn{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new wo(Oo,ko,e,t);r.layers=this.layers,this.add(r);let i=new wo(Oo,ko,e,t);i.layers=this.layers,this.add(i);let a=new wo(Oo,ko,e,t);a.layers=this.layers,this.add(a);let o=new wo(Oo,ko,e,t);o.layers=this.layers,this.add(o);let s=new wo(Oo,ko,e,t);s.layers=this.layers,this.add(s);let c=new wo(Oo,ko,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},jo=class extends wo{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}},Mo=`\\[\\]\\.:\\/`,No=RegExp(`[\\[\\]\\.:\\/]`,`g`),Po=`[^\\[\\]\\.:\\/]`,Fo=`[^`+Mo.replace(`\\.`,``)+`]`,Io=`((?:WC+[\\/:])*)`.replace(`WC`,Po),Lo=`(WCOD+)?`.replace(`WCOD`,Fo),Ro=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,Po),zo=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,Po),Bo=RegExp(`^`+Io+Lo+Ro+zo+`$`),Vo=[`material`,`materials`,`bones`,`map`],Ho=class{constructor(e,t,n){let r=n||Uo.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Uo=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(No,``)}static parseTrackName(e){let t=Bo.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Vo.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){L(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){R(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){R(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){R(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){R(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){R(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){R(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){R(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;R(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){R(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){R(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Uo.Composite=Ho,Uo.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Uo.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Uo.prototype.GetterByBindingType=[Uo.prototype._getValue_direct,Uo.prototype._getValue_array,Uo.prototype._getValue_arrayElement,Uo.prototype._getValue_toArray],Uo.prototype.SetterByBindingTypeAndVersioning=[[Uo.prototype._setValue_direct,Uo.prototype._setValue_direct_setNeedsUpdate,Uo.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Uo.prototype._setValue_array,Uo.prototype._setValue_array_setNeedsUpdate,Uo.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Uo.prototype._setValue_arrayElement,Uo.prototype._setValue_arrayElement_setNeedsUpdate,Uo.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Uo.prototype._setValue_fromArray,Uo.prototype._setValue_fromArray_setNeedsUpdate,Uo.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]],class{static{this.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}};function Wo(e,t,n,r){let i=Go(r);switch(n){case Ce:return e*t;case Oe:return e*t/i.components*i.byteLength;case ke:return e*t/i.components*i.byteLength;case Ae:return e*t*2/i.components*i.byteLength;case je:return e*t*2/i.components*i.byteLength;case we:return e*t*3/i.components*i.byteLength;case Te:return e*t*4/i.components*i.byteLength;case Me:return e*t*4/i.components*i.byteLength;case Ne:case Pe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Fe:case Ie:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Le:case ze:return Math.max(e,16)*Math.max(t,8)/4;case N:case Re:return Math.max(e,8)*Math.max(t,8)/2;case P:case Be:case I:case Ve:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case F:case He:case Ue:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case We:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Ge:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case Ke:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case qe:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Je:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case Ye:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Xe:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Ze:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Qe:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case $e:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case et:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case tt:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case nt:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case rt:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case it:case at:case ot:return Math.ceil(e/4)*Math.ceil(t/4)*16;case st:case ct:return Math.ceil(e/4)*Math.ceil(t/4)*8;case lt:case ut:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Go(e){switch(e){case ue:case de:return{byteLength:1,components:1};case pe:case fe:case _e:return{byteLength:2,components:1};case ve:case ye:return{byteLength:2,components:4};case he:case me:case ge:return{byteLength:4,components:1};case xe:case Se:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`187`}})),typeof window<`u`&&(window.__THREE__?L(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`187`);function Ko(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function qo(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var X={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},Z={common:{diffuse:{value:new W(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new H}},envmap:{envMap:{value:null},envMapRotation:{value:new H},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new H}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new H}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new H},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new H},normalScale:{value:new B(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new H},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new H}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new H}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new H}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new W(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new W(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0},uvTransform:{value:new H}},sprite:{diffuse:{value:new W(16777215)},opacity:{value:1},center:{value:new B(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}}},Jo={basic:{uniforms:Na([Z.common,Z.specularmap,Z.envmap,Z.aomap,Z.lightmap,Z.fog]),vertexShader:X.meshbasic_vert,fragmentShader:X.meshbasic_frag},lambert:{uniforms:Na([Z.common,Z.specularmap,Z.envmap,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.fog,Z.lights,{emissive:{value:new W(0)},envMapIntensity:{value:1}}]),vertexShader:X.meshlambert_vert,fragmentShader:X.meshlambert_frag},phong:{uniforms:Na([Z.common,Z.specularmap,Z.envmap,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.fog,Z.lights,{emissive:{value:new W(0)},specular:{value:new W(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:X.meshphong_vert,fragmentShader:X.meshphong_frag},standard:{uniforms:Na([Z.common,Z.envmap,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.roughnessmap,Z.metalnessmap,Z.fog,Z.lights,{emissive:{value:new W(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:X.meshphysical_vert,fragmentShader:X.meshphysical_frag},toon:{uniforms:Na([Z.common,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.gradientmap,Z.fog,Z.lights,{emissive:{value:new W(0)}}]),vertexShader:X.meshtoon_vert,fragmentShader:X.meshtoon_frag},matcap:{uniforms:Na([Z.common,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.fog,{matcap:{value:null}}]),vertexShader:X.meshmatcap_vert,fragmentShader:X.meshmatcap_frag},points:{uniforms:Na([Z.points,Z.fog]),vertexShader:X.points_vert,fragmentShader:X.points_frag},dashed:{uniforms:Na([Z.common,Z.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:X.linedashed_vert,fragmentShader:X.linedashed_frag},depth:{uniforms:Na([Z.common,Z.displacementmap]),vertexShader:X.depth_vert,fragmentShader:X.depth_frag},normal:{uniforms:Na([Z.common,Z.bumpmap,Z.normalmap,Z.displacementmap,{opacity:{value:1}}]),vertexShader:X.meshnormal_vert,fragmentShader:X.meshnormal_frag},sprite:{uniforms:Na([Z.sprite,Z.fog]),vertexShader:X.sprite_vert,fragmentShader:X.sprite_frag},background:{uniforms:{uvTransform:{value:new H},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:X.background_vert,fragmentShader:X.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new H}},vertexShader:X.backgroundCube_vert,fragmentShader:X.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:X.cube_vert,fragmentShader:X.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:X.equirect_vert,fragmentShader:X.equirect_frag},distance:{uniforms:Na([Z.common,Z.displacementmap,{referencePosition:{value:new V},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:X.distance_vert,fragmentShader:X.distance_frag},shadow:{uniforms:Na([Z.lights,Z.fog,{color:{value:new W(0)},opacity:{value:1}}]),vertexShader:X.shadow_vert,fragmentShader:X.shadow_frag}};Jo.physical={uniforms:Na([Jo.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new H},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new H},clearcoatNormalScale:{value:new B(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new H},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new H},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new H},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new H},sheen:{value:0},sheenColor:{value:new W(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new H},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new H},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new H},transmissionSamplerSize:{value:new B},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new H},attenuationDistance:{value:0},attenuationColor:{value:new W(0)},specularColor:{value:new W(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new H},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new H},anisotropyVector:{value:new B},anisotropyMap:{value:null},anisotropyMapTransform:{value:new H}}]),vertexShader:X.meshphysical_vert,fragmentShader:X.meshphysical_frag};var Yo={r:0,b:0,g:0},Xo=new vn,Zo=new H;Zo.set(-1,0,0,0,1,0,0,0,1);function Qo(e,t,n,r,i,a){let o=new W(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&i.isCubeTexture?(l===void 0&&(l=new K(new q(1,1,1),new Ba({name:`BackgroundCubeMaterial`,uniforms:Ma(Jo.backgroundCube.uniforms),vertexShader:Jo.backgroundCube.vertexShader,fragmentShader:Jo.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Xo.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Zo),l.material.toneMapped=tn.getTransfer(i.colorSpace)!==St,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new K(new Da(2,2),new Ba({name:`BackgroundMaterial`,uniforms:Ma(Jo.background.uniforms),vertexShader:Jo.background.vertexShader,fragmentShader:Jo.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=tn.getTransfer(i.colorSpace)!==St,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(Yo,Ia(e)),n.buffers.color.setClear(Yo.r,Yo.g,Yo.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function $o(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.isInterleavedBuffer===!0?t.stride:t.itemSize,p=s.offset;if(t.isInstancedInterleavedBuffer||t.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function es(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function ts(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(L(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),f=n.logarithmicDepthBuffer===!0&&d===!1;n.reversedDepthBuffer===!0&&d===!1&&L(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`),n.logarithmicDepthBuffer===!0&&d===!0&&L(`WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function ns(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Qr,s=new H,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var rs=class extends hn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Hi(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new q(5,5,5),i=new Ba({name:`CubemapFromEquirect`,uniforms:Ma(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new K(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=se),new Ao(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},is=256,as=3,os=20,ss=256,cs=16,ls=3,us=new V,ds=new W,fs=class e{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Ao(1,10,null),this._boxMesh=new K(new q(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=us}=i,s=this._renderer;this._setSize(a);let c=this._allocateTarget(),l=this._getSourceTarget(!0);t>0&&(l.texture.mipmapsAutoUpdate=!1);let u=s.autoClear,d=s.autoClearColor,f=s.autoClearDepth,p=s.autoClearStencil,m=e.background;s.autoClear=!0,s.autoClearColor=!0,s.autoClearDepth=!0,s.autoClearStencil=!0,m===null&&(e.background=s.getClearColor(ds));let h=new Ao(n,r,l);return h.position.copy(o),h.update(s,e),s.autoClear=u,s.autoClearColor=d,s.autoClearDepth=f,s.autoClearStencil=p,e.background=m,t>0&&(l.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ys(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=vs(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(is,Wt(e))}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?is:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=ps(e,!1,!1),n=Math.log2(e)-as;for(let r=0;r<=n;r++)t.texture.mipmaps.push({width:e>>r,height:e>>r});return t.texture.name=`PMREM`,t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=ps(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let r=this._boxMesh,i=this._cubeCamera;r.material=n,i.renderTarget=e,i.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),i.update(this._renderer,r),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===301||e.mapping===302?(this._cubemapMaterial===null&&(this._cubemapMaterial=ys()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=vs()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=hs(),this._integrationMaterial=gs());let n=this._cubeSize,r=t.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let a=this._integrationMaterial.uniforms;a.envMap.value=this._sourceTarget.texture,a.sourceLod.value=Math.log2(n/cs);for(let o=0;o<=r;o++){let s=e.lodToRoughness(o,r);if(o>r-ls)a.roughness.value=s,this._renderCube(t,o,this._integrationMaterial);else{let e=s>0?Math.log2(n)+.5*Math.log2(6/(ss*s**4))+.5:0;i.roughness.value=s,i.lodBias.value=e,this._renderCube(t,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=_s());let n=this._blurMaterial,r=n.uniforms,i=this._sourceTarget;r.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,r.envMap.value=i.texture,this._renderCube(e,0,n),r.envMap.value=e.texture,this._renderCube(i,0,n)}};function ps(e,t,n){return new rs(e,{minFilter:le,generateMipmaps:t,type:_e,colorSpace:bt,depthBuffer:n})}function ms(e,t,n){return new Ba({name:e,uniforms:t,vertexShader:X.cube_vert,fragmentShader:n,side:1,blending:0,depthTest:!1,depthWrite:!1})}function hs(){return ms(`PMREMGGXConvolution`,{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${ss}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function gs(){return ms(`PMREMGGXIntegration`,{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:cs}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function _s(){return ms(`PMREMSphericalGaussianBlur`,{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${os}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function vs(){return ms(`PMREMEquirectangularToCubemap`,{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function ys(){return ms(`PMREMCubemapToCubemap`,{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function bs(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new rs(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture&&t.isPMREMTexture!==!0){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new fs(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new fs(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function xs(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Pt(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Ss(e,t,n,r){let i={},a=new WeakMap,o=new FinalizationRegistry(e=>delete i[e]);function s(e){c(e.target)}function c(e){e.index!==null&&t.remove(e.index);for(let n in e.attributes)t.remove(e.attributes[n]);e.removeEventListener(`dispose`,s),delete i[e.id],o.unregister(e);let c=a.get(e);c&&(t.remove(c),a.delete(e)),r.releaseStatesOfGeometry(e),e.isInstancedBufferGeometry===!0&&delete e._maxInstanceCount,n.memory.geometries--}function l(e,t){return i[t.id]===void 0&&(t.addEventListener(`dispose`,s),i[t.id]=new WeakRef(t),o.register(t,t.id,t),n.memory.geometries++),t}function u(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function d(e){let n=e.index,r=e.attributes.position,i=0;if(r===void 0)return;let o=n===null?r.array.length/3-1:n.array.length,s=new(r.count>=65535?Fr:Pr)(Math.ceil(o/3)*6,1),c=s.array;if(n!==null){let e=n.array;i=n.version;for(let t=0,n=0;t<o;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];c[n++]=r,c[n++]=i,c[n++]=i,c[n++]=a,c[n++]=a,c[n++]=r}}else{i=r.version;for(let e=0,t=0;e<o;e+=3){let n=e+0,r=e+1,i=e+2;c[t++]=n,c[t++]=r,c[t++]=r,c[t++]=i,c[t++]=i,c[t++]=n}}s.version=i;let l=a.get(e);l&&t.remove(l),a.set(e,s)}function f(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&d(e)}else d(e);return a.get(e)}function p(){for(let e in i){let t=i[e].deref();t!==void 0&&c(t)}}return{get:l,update:u,getWireframeAttribute:f,dispose:p}}function Cs(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function ws(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:R(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Ts(e,t,n){let r=new WeakMap,i=new pn;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new gn(h,p,m,u);g.type=ge,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new B(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Es(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var Ds={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function Os(e,t,n,r,i,a){let o=new hn(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=null,u=new Jr;u.setAttribute(`position`,new Ir([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute(`uv`,new Ir([0,2,0,0,2,0],2));let d=new Va({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new K(u,d),p=new To(-1,1,1,-1,0,1),m=null,h=null,g=!1,_,v=null,y=[],b=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<y.length;n++){let r=y[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){y=e,b=y.length>0&&y[0].isRenderPass===!0;let t=o.width,n=o.height;y.length>0&&s===null&&(s=new hn(t,n,{type:_e,depthBuffer:!1,stencilBuffer:!1}),c=new hn(t,n,{type:_e,depthBuffer:!1,stencilBuffer:!1}));let r=i===!0&&y.some(e=>e.needsDepthTexture===!0);r!==(o.depthTexture!==null)&&(r===!0&&l===null&&(l=new Wi(t,n),a===!0&&(l.format=De,l.type=be)),o.dispose(),o.depthTexture=r?l:null,o.resolveDepthBuffer=r,o.storeMultisampledDepthBuffer=r);for(let e=0;e<y.length;e++){let i=y[e];i.setSize&&i.setSize(t,n),r&&i.needsDepthTexture===!0&&i.setDepthTexture&&i.setDepthTexture(l)}},this.begin=function(e,t){if(g||e.toneMapping===0&&y.length===0)return!1;if(v=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return b===!1&&e.setRenderTarget(o),_=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return b},this.end=function(e,t){e.toneMapping=_,g=!0;let n=o,r=s;for(let i=0;i<y.length;i++){let a=y[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(m!==e.outputColorSpace||h!==e.toneMapping){m=e.outputColorSpace,h=e.toneMapping,d.defines={},tn.getTransfer(m)===`srgb`&&(d.defines.SRGB_TRANSFER=``);let t=Ds[h];t&&(d.defines[t]=``),d.needsUpdate=!0}d.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(v),e.render(f,p),v=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),u.dispose(),d.dispose()}}var ks=new fn,As=new Wi(1,1),js=new Gi(1),Ms=new gn,Ns=new _n,Ps=new Hi,Fs=[],Is=[],Ls=new Float32Array(16),Rs=new Float32Array(9),zs=new Float32Array(4);function Bs(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Fs[i];if(a===void 0&&(a=new Float32Array(i),Fs[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Vs(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Hs(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Us(e,t){let n=Is[t];n===void 0&&(n=new Int32Array(t),Is[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Ws(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Gs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Vs(n,t))return;e.uniform2fv(this.addr,t),Hs(n,t)}}function Ks(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Vs(n,t))return;e.uniform3fv(this.addr,t),Hs(n,t)}}function qs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Vs(n,t))return;e.uniform4fv(this.addr,t),Hs(n,t)}}function Js(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Vs(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Hs(n,t)}else{if(Vs(n,r))return;zs.set(r),e.uniformMatrix2fv(this.addr,!1,zs),Hs(n,r)}}function Ys(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Vs(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Hs(n,t)}else{if(Vs(n,r))return;Rs.set(r),e.uniformMatrix3fv(this.addr,!1,Rs),Hs(n,r)}}function Xs(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Vs(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Hs(n,t)}else{if(Vs(n,r))return;Ls.set(r),e.uniformMatrix4fv(this.addr,!1,Ls),Hs(n,r)}}function Zs(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Qs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Vs(n,t))return;e.uniform2iv(this.addr,t),Hs(n,t)}}function $s(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Vs(n,t))return;e.uniform3iv(this.addr,t),Hs(n,t)}}function ec(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Vs(n,t))return;e.uniform4iv(this.addr,t),Hs(n,t)}}function tc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function nc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Vs(n,t))return;e.uniform2uiv(this.addr,t),Hs(n,t)}}function rc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Vs(n,t))return;e.uniform3uiv(this.addr,t),Hs(n,t)}}function ic(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Vs(n,t))return;e.uniform4uiv(this.addr,t),Hs(n,t)}}function ac(e){return e.version===0&&(e.compareFunction=519,e.needsUpdate=!0),e}function oc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_2D_SHADOW?ac(As):ks,n.setTexture2D(t||a,i)}function sc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Ns,i)}function cc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_CUBE_SHADOW?ac(js):Ps,n.setTextureCube(t||a,i)}function lc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Ms,i)}function uc(e){switch(e){case 5126:return Ws;case 35664:return Gs;case 35665:return Ks;case 35666:return qs;case 35674:return Js;case 35675:return Ys;case 35676:return Xs;case 5124:case 35670:return Zs;case 35667:case 35671:return Qs;case 35668:case 35672:return $s;case 35669:case 35673:return ec;case 5125:return tc;case 36294:return nc;case 36295:return rc;case 36296:return ic;case 35678:case 36198:case 36298:case 36306:case 35682:return oc;case 35679:case 36299:case 36307:return sc;case 35680:case 36300:case 36308:case 36293:return cc;case 36289:case 36303:case 36311:case 36292:return lc}}function dc(e,t){e.uniform1fv(this.addr,t)}function fc(e,t){let n=Bs(t,this.size,2);e.uniform2fv(this.addr,n)}function pc(e,t){let n=Bs(t,this.size,3);e.uniform3fv(this.addr,n)}function mc(e,t){let n=Bs(t,this.size,4);e.uniform4fv(this.addr,n)}function hc(e,t){let n=Bs(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function gc(e,t){let n=Bs(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function _c(e,t){let n=Bs(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function vc(e,t){e.uniform1iv(this.addr,t)}function yc(e,t){e.uniform2iv(this.addr,t)}function bc(e,t){e.uniform3iv(this.addr,t)}function xc(e,t){e.uniform4iv(this.addr,t)}function Sc(e,t){e.uniform1uiv(this.addr,t)}function Cc(e,t){e.uniform2uiv(this.addr,t)}function wc(e,t){e.uniform3uiv(this.addr,t)}function Tc(e,t){e.uniform4uiv(this.addr,t)}function Ec(e,t,n){let r=this.cache,i=t.length,a=Us(n,i);Vs(r,a)||(e.uniform1iv(this.addr,a),Hs(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?ac(As):ks;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function Dc(e,t,n){let r=this.cache,i=t.length,a=Us(n,i);Vs(r,a)||(e.uniform1iv(this.addr,a),Hs(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Ns,a[e])}function Oc(e,t,n){let r=this.cache,i=t.length,a=Us(n,i);Vs(r,a)||(e.uniform1iv(this.addr,a),Hs(r,a));let o;o=this.type===e.SAMPLER_CUBE_SHADOW?ac(js):Ps;for(let e=0;e!==i;++e)n.setTextureCube(t[e]||o,a[e])}function kc(e,t,n){let r=this.cache,i=t.length,a=Us(n,i);Vs(r,a)||(e.uniform1iv(this.addr,a),Hs(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Ms,a[e])}function Ac(e){switch(e){case 5126:return dc;case 35664:return fc;case 35665:return pc;case 35666:return mc;case 35674:return hc;case 35675:return gc;case 35676:return _c;case 5124:case 35670:return vc;case 35667:case 35671:return yc;case 35668:case 35672:return bc;case 35669:case 35673:return xc;case 5125:return Sc;case 36294:return Cc;case 36295:return wc;case 36296:return Tc;case 35678:case 36198:case 36298:case 36306:case 35682:return Ec;case 35679:case 36299:case 36307:return Dc;case 35680:case 36300:case 36308:case 36293:return Oc;case 36289:case 36303:case 36311:case 36292:return kc}}var jc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=uc(t.type)}},Mc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Ac(t.type)}},Nc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Pc=/(\w+)(\])?(\[|\.)?/g;function Fc(e,t){e.seq.push(t),e.map[t.id]=t}function Ic(e,t,n){let r=e.name,i=r.length;for(Pc.lastIndex=0;;){let a=Pc.exec(r),o=Pc.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Fc(n,l===void 0?new jc(s,e,t):new Mc(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Nc(s),Fc(n,e)),n=e}}}var Lc=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Ic(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Rc(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var zc=37297,Bc=0;function Vc(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Hc=new H;function Uc(e){tn._getMatrix(Hc,tn.workingColorSpace,e);let t=`mat3( ${Hc.elements.map(e=>e.toFixed(4))} )`;switch(tn.getTransfer(e)){case xt:return[t,`LinearTransferOETF`];case St:return[t,`sRGBTransferOETF`];default:return L(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Wc(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Vc(e.getShaderSource(t),r)}return i}function Gc(e,t){let n=Uc(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( ${n[0]} * value.rgb, value.a ) );`,`}`].join(`
`)}var Kc={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function qc(e,t){let n=Kc[t];return n===void 0?(L(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Jc=new V;function Yc(){return tn.getLuminanceCoefficients(Jc),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Jc.x.toFixed(4)}, ${Jc.y.toFixed(4)}, ${Jc.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Xc(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter($c).join(`
`)}function Zc(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Qc(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function $c(e){return e!==``}function el(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function tl(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var nl=/^[ \t]*#include +<([\w\d./]+)>/gm;function rl(e){return e.replace(nl,il)}function il(e,t){let n=X[t];if(n===void 0)throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`);return rl(n)}var al=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ol(e){return e.replace(al,sl)}function sl(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function cl(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var ll={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function ul(e){return ll[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var dl={302:`ENVMAP_MODE_REFRACTION`};function fl(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:dl[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var pl={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function ml(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:pl[e.combine]||`ENVMAP_BLENDING_NONE`}function hl(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=ul(n),l=n.envMapPMREM===!0?`ENVMAP_TYPE_PMREM`:`ENVMAP_TYPE_CUBE`,u=fl(n),d=ml(n),f=Xc(n),p=Zc(a),m=i.createProgram(),h,g,_=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(h=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter($c).join(`
`),h.length>0&&(h+=`
`),g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter($c).join(`
`),g.length>0&&(g+=`
`)):(h=[cl(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.diffuseRoughnessMapUv?`#define DIFFUSE_ROUGHNESSMAP_UV `+n.diffuseRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter($c).join(`
`),g=[cl(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,n.envMapPMREM?`#define ENVMAP_MAX_LOD `+n.envMapMaxLod+`.0`:``,n.envMapPMREM?`#define ENVMAP_SIZE `+n.envMapSize+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughness?`#define USE_DIFFUSE_ROUGHNESS`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:X.tonemapping_pars_fragment,n.toneMapping===0?``:qc(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,X.colorspace_pars_fragment,Gc(`linearToOutputTexel`,n.outputColorSpace),Yc(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter($c).join(`
`)),o=rl(o),o=el(o,n),o=tl(o,n),s=rl(s),s=el(s,n),s=tl(s,n),o=ol(o),s=ol(s),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,h=[f,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+h,g=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+g);let v=_+h+o,y=_+g+s,b=Rc(i,i.VERTEX_SHADER,v),x=Rc(i,i.FRAGMENT_SHADER,y);i.attachShader(m,b),i.attachShader(m,x),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(m,0,`position`):i.bindAttribLocation(m,0,n.index0AttributeName),i.linkProgram(m);function S(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(m)||``,r=i.getShaderInfoLog(b)||``,a=i.getShaderInfoLog(x)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(m,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,m,b,x);else{let e=Wc(i,b,`vertex`),n=Wc(i,x,`fragment`);R(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(m,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):L(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:h},fragmentShader:{log:c,prefix:g}})}i.deleteShader(b),i.deleteShader(x),C=new Lc(i,m),w=Qc(i,m)}let C;this.getUniforms=function(){return C===void 0&&S(this),C};let w;this.getAttributes=function(){return w===void 0&&S(this),w};let T=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=i.getProgramParameter(m,zc)),T},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Bc++,this.cacheKey=t,this.usedTimes=1,this.program=m,this.vertexShader=b,this.fragmentShader=x,this}var gl=0,_l=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new vl(e),t.set(e,n)),n}},vl=class{constructor(e){this.id=gl++,this.code=e,this.usedTimes=0}};function yl(e){return e===1030||e===37490||e===36285}function bl(e,t,n,r,i,a){let o=new kn,s=new _l,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function p(e){return c.add(e),e===0?`uv`:`uv${e}`}function m(i,o,l,u,m,h){let g=u.fog,_=m.geometry,v=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,b=t.get(i.envMap||v,y),x=f[i.type],S=r.precision;i.precision!==null&&(S=r.getMaxPrecision(i.precision),S!==i.precision&&L(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,S,`instead.`));let C=_.morphAttributes.position||_.morphAttributes.normal||_.morphAttributes.color,w=C===void 0?0:C.length,T=0;_.morphAttributes.position!==void 0&&(T=1),_.morphAttributes.normal!==void 0&&(T=2),_.morphAttributes.color!==void 0&&(T=3);let E,D,O,k;if(x){let e=Jo[x];E=e.vertexShader,D=e.fragmentShader}else{E=i.vertexShader,D=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),O=e.id,k=t.id}let A=e.getRenderTarget(),j=e.state.buffers.depth.getReversed(),ee=m.isInstancedMesh===!0,M=m.isBatchedMesh===!0,te=!!i.map,ne=!!i.matcap,re=!!b,ie=re&&b.isPMREMTexture===!0,ae=!!i.aoMap,oe=!!i.lightMap,se=!!i.bumpMap&&i.wireframe===!1,ce=!!i.normalMap,le=!!i.displacementMap,ue=!!i.emissiveMap,de=!!i.metalnessMap,fe=!!i.roughnessMap,pe=i.anisotropy>0,me=i.clearcoat>0,he=i.diffuseRoughness>0,ge=i.dispersion>0,_e=i.retroreflectivity>0,ve=i.iridescence>0,ye=i.sheen>0,be=i.transmission>0,xe=pe&&!!i.anisotropyMap,Se=me&&!!i.clearcoatMap,Ce=me&&!!i.clearcoatNormalMap,we=me&&!!i.clearcoatRoughnessMap,Te=he&&!!i.diffuseRoughnessMap,Ee=ve&&!!i.iridescenceMap,De=ve&&!!i.iridescenceThicknessMap,Oe=ye&&!!i.sheenColorMap,ke=ye&&!!i.sheenRoughnessMap,Ae=!!i.specularMap,je=!!i.specularColorMap,Me=!!i.specularIntensityMap,Ne=be&&!!i.transmissionMap,Pe=be&&!!i.thicknessMap,Fe=!!i.gradientMap,Ie=!!i.alphaMap,N=i.alphaTest>0,Le=!!i.alphaHash,Re=!!i.extensions,ze=0;i.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(ze=e.toneMapping);let P=ie?b.isCompressedCubeTexture?b.image[0].mipmaps:b.mipmaps:null,Be={shaderID:x,shaderType:i.type,shaderName:i.name,vertexShader:E,fragmentShader:D,defines:i.defines,customVertexShaderID:O,customFragmentShaderID:k,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:S,batching:M,batchingColor:M&&m._colorsTexture!==null,instancing:ee,instancingColor:ee&&m.instanceColor!==null,instancingMorph:ee&&m.morphTexture!==null,outputColorSpace:A===null?e.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:tn.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:te,matcap:ne,envMap:re,envMapMode:re&&b.mapping,envMapPMREM:ie,envMapMaxLod:ie?P.length-1:null,envMapSize:ie?P[0].width:null,aoMap:ae,lightMap:oe,bumpMap:se,normalMap:ce,displacementMap:le,emissiveMap:ue,normalMapObjectSpace:ce&&i.normalMapType===1,normalMapTangentSpace:ce&&i.normalMapType===0,packedNormalMap:ce&&i.normalMapType===0&&yl(i.normalMap.format),metalnessMap:de,roughnessMap:fe,anisotropy:pe,anisotropyMap:xe,clearcoat:me,clearcoatMap:Se,clearcoatNormalMap:Ce,clearcoatRoughnessMap:we,diffuseRoughness:he,diffuseRoughnessMap:Te,dispersion:ge,retroreflection:_e,iridescence:ve,iridescenceMap:Ee,iridescenceThicknessMap:De,sheen:ye,sheenColorMap:Oe,sheenRoughnessMap:ke,specularMap:Ae,specularColorMap:je,specularIntensityMap:Me,transmission:be,transmissionMap:Ne,thicknessMap:Pe,gradientMap:Fe,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Ie,alphaTest:N,alphaHash:Le,combine:i.combine,mapUv:te&&p(i.map.channel),aoMapUv:ae&&p(i.aoMap.channel),lightMapUv:oe&&p(i.lightMap.channel),bumpMapUv:se&&p(i.bumpMap.channel),normalMapUv:ce&&p(i.normalMap.channel),displacementMapUv:le&&p(i.displacementMap.channel),emissiveMapUv:ue&&p(i.emissiveMap.channel),metalnessMapUv:de&&p(i.metalnessMap.channel),roughnessMapUv:fe&&p(i.roughnessMap.channel),anisotropyMapUv:xe&&p(i.anisotropyMap.channel),clearcoatMapUv:Se&&p(i.clearcoatMap.channel),clearcoatNormalMapUv:Ce&&p(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:we&&p(i.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:Te&&p(i.diffuseRoughnessMap.channel),iridescenceMapUv:Ee&&p(i.iridescenceMap.channel),iridescenceThicknessMapUv:De&&p(i.iridescenceThicknessMap.channel),sheenColorMapUv:Oe&&p(i.sheenColorMap.channel),sheenRoughnessMapUv:ke&&p(i.sheenRoughnessMap.channel),specularMapUv:Ae&&p(i.specularMap.channel),specularColorMapUv:je&&p(i.specularColorMap.channel),specularIntensityMapUv:Me&&p(i.specularIntensityMap.channel),transmissionMapUv:Ne&&p(i.transmissionMap.channel),thicknessMapUv:Pe&&p(i.thicknessMap.channel),alphaMapUv:Ie&&p(i.alphaMap.channel),vertexTangents:!!_.attributes.tangent&&(ce||pe),vertexNormals:!!_.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!_.attributes.color&&_.attributes.color.itemSize===4,pointsUvs:m.isPoints===!0&&!!_.attributes.uv&&(te||Ie),fog:!!g,useFog:i.fog===!0,fogExp2:!!g&&g.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||_.attributes.normal===void 0&&ce===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:j,skinning:m.isSkinnedMesh===!0,hasPositionAttribute:_.attributes.position!==void 0,morphTargets:_.morphAttributes.position!==void 0,morphNormals:_.morphAttributes.normal!==void 0,morphColors:_.morphAttributes.color!==void 0,morphTargetsCount:w,morphTextureStride:T,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:h.filter(e=>e.texture!==null).length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:ze,decodeVideoTexture:te&&i.map.isVideoTexture===!0&&tn.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ue&&i.emissiveMap.isVideoTexture===!0&&tn.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Re&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Re&&i.extensions.multiDraw===!0||M)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Be.vertexUv1s=c.has(1),Be.vertexUv2s=c.has(2),Be.vertexUv3s=c.has(3),c.clear(),Be}function h(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(g(n,t),_(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function g(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapPMREM),e.push(t.envMapMaxLod),e.push(t.envMapSize),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.diffuseRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.numLightProbeGrids),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function _(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.diffuseRoughness&&o.enable(25),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function v(e){let t=f[e.type],n;if(t){let e=Jo[t];n=La.clone(e.uniforms)}else n=e.uniforms;return n}function y(t,n){let r=u.get(n);return r===void 0?(r=new hl(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function b(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function x(e){s.remove(e)}function S(){s.dispose()}return{getParameters:m,getProgramCacheKey:h,getUniforms:v,acquireProgram:y,releaseProgram:b,releaseShaderCache:x,programs:l,dispose:S}}function xl(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Sl(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Cl(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function wl(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||Sl),r.length>1&&r.sort(t||Cl),i.length>1&&i.sort(t||Cl)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function Tl(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new wl,e.set(t,[i])):n>=r.length?(i=new wl,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function El(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new V,color:new W};break;case`SpotLight`:n={position:new V,direction:new V,color:new W,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new V,color:new W,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new V,skyColor:new W,groundColor:new W};break;case`RectAreaLight`:n={color:new W,position:new V,halfWidth:new V,halfHeight:new V}}return e[t.id]=n,n}}}function Dl(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Ol=0;function kl(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Al(e){let t=new El,n=Dl(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new V);let i=new V,a=new vn,o=new vn;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(kl);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=Z.LTC_FLOAT_1,r.rectAreaLTC2=Z.LTC_FLOAT_2):(r.rectAreaLTC1=Z.LTC_HALF_1,r.rectAreaLTC2=Z.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=Ol++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function jl(e){let t=new Al(e),n=[],r=[],i=[];function a(e){u.camera=e,n.length=0,r.length=0,i.length=0}function o(e){e.isLightProbeGrid?i.push(e):n.push(e)}function s(e){r.push(e)}function c(){t.setup(n),i.sort((e,t)=>e.priority-t.priority||e.id-t.id)}function l(e){t.setupView(n,e)}let u={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:u,setupLights:c,setupLightsView:l,pushLight:o,pushShadow:s}}function Ml(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new jl(e),t.set(n,[a])):r>=i.length?(a=new jl(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Nl=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Pl=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Fl=[new V(1,0,0),new V(-1,0,0),new V(0,1,0),new V(0,-1,0),new V(0,0,1),new V(0,0,-1)],Il=[new V(0,-1,0),new V(0,-1,0),new V(0,0,1),new V(0,0,-1),new V(0,-1,0),new V(0,-1,0)],Ll=new vn,Rl=new V,zl=new V;function Bl(e,t,n){let r=new Mi,i=new B,a=new B,o=new pn,s=new Ha,c=new Ua,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new Ba({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new B},radius:{value:4}},vertexShader:Nl,fragmentShader:Pl}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Jr;m.setAttribute(`position`,new Nr(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new K(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;this.type===2&&(L(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==this.type;p&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){L(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let m=d.getFrameExtents();i.multiply(m),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/m.x),i.x=a.x*m.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/m.y),i.y=a.y*m.y,d.mapSize.y=a.y));let h=e.state.buffers.depth.getReversed();if(d.camera._reversedDepth=h,d.map===null||p===!0){if(d.map!==null&&(d.map.depthTexture!==null&&(d.map.depthTexture.dispose(),d.map.depthTexture=null),d.map.dispose()),this.type===3){if(l.isPointLight){L(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}d.map=new hn(i.x,i.y,{format:Ae,type:_e,minFilter:se,magFilter:se,generateMipmaps:!1}),d.map.texture.name=l.name+`.shadowMap`,d.map.depthTexture=new Wi(i.x,i.y,ge),d.map.depthTexture.name=l.name+`.shadowMapDepth`,d.map.depthTexture.format=Ee,d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=ie,d.map.depthTexture.magFilter=ie}else l.isPointLight?(d.map=new rs(i.x),d.map.depthTexture=new Gi(i.x,he)):(d.map=new hn(i.x,i.y),d.map.depthTexture=new Wi(i.x,i.y,he)),d.map.depthTexture.name=l.name+`.shadowMap`,d.map.depthTexture.format=Ee,this.type===1?(d.map.depthTexture.compareFunction=h?518:515,d.map.depthTexture.minFilter=se,d.map.depthTexture.magFilter=se):(d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=ie,d.map.depthTexture.magFilter=ie);d.camera.updateProjectionMatrix()}d.map.isWebGLCubeRenderTarget!==!0&&(d.map.width!==i.x||d.map.height!==i.y)&&d.map.setSize(i.x,i.y);let g=d.map.isWebGLCubeRenderTarget?6:d.getViewportCount();l.isPointLight!==!0&&d.updateMatrices(l,s);let _=d.camera.layers.mask&4294967294?d.camera.layers:s.layers;for(let t=0;t<g;t++){let i=d.getCamera(t);if(l.isPointLight){let e=d.camera,n=d.matrix,r=l.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Rl.setFromMatrixPosition(l.matrixWorld),e.position.copy(Rl),zl.copy(e.position),zl.add(Fl[t]),e.up.copy(Il[t]),e.lookAt(zl),e.updateMatrixWorld(),n.makeTranslation(-Rl.x,-Rl.y,-Rl.z),Ll.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),d._frustum.setFromProjectionMatrix(Ll,e.coordinateSystem,e.reversedDepth)}if(d.map.isWebGLCubeRenderTarget)e.setRenderTarget(d.map,t),e.clear();else{t===0&&(e.setRenderTarget(d.map),e.clear());let n=d.getViewport(t);o.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),f.viewport(o)}r=d.getFrustum(t),b(n,s,i,l,_,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null?n.mapPass=new hn(i.x,i.y,{format:Ae,type:_e}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),f.uniforms.shadow_pass.value=n.map.depthTexture,f.uniforms.resolution.value.set(n.map.width,n.map.height),f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value.set(n.map.width,n.map.height),p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s,c){if(n.visible===!1)return;if(n.layers.test(s)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&c===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),s=n.material;if(Array.isArray(s)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=s[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,c);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(s.visible){let t=y(n,s,o,c);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let l=n.children;for(let e=0,t=l.length;e<t;e++)b(l[e],i,a,o,s,c)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Vl(e,t){function n(){let t=!1,n=new pn,r=null,i=new pn(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?de(e.DEPTH_TEST):fe(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=It[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?de(e.STENCIL_TEST):fe(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c={},l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new W(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,ee=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),M=!1,te=0,ne=e.getParameter(e.VERSION);ne.indexOf(`WebGL`)===-1?ne.indexOf(`OpenGL ES`)!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(ne)[1]),M=te>=2):(te=parseFloat(/^WebGL (\d)/.exec(ne)[1]),M=te>=1);let re=null,ie={},ae=e.getParameter(e.SCISSOR_BOX),oe=e.getParameter(e.VIEWPORT),se=new pn().fromArray(ae),ce=new pn().fromArray(oe);function le(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ue={};ue[e.TEXTURE_2D]=le(e.TEXTURE_2D,e.TEXTURE_2D,1),ue[e.TEXTURE_CUBE_MAP]=le(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ue[e.TEXTURE_2D_ARRAY]=le(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ue[e.TEXTURE_3D]=le(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),de(e.DEPTH_TEST),o.setFunc(3),be(!1),xe(1),de(e.CULL_FACE),ve(0);function de(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function fe(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function pe(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function me(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function he(t){return h!==t&&(e.useProgram(t),h=t,!0)}let ge={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};ge[103]=e.MIN,ge[104]=e.MAX;let _e={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function ve(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(fe(e.BLEND),g=!1);else if(g===!1&&(de(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:R(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:R(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:R(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:R(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(ge[n],ge[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(_e[r],_e[i],_e[o],_e[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function ye(t,n){t.side===2?fe(e.CULL_FACE):de(e.CULL_FACE);let r=t.side===1;n&&(r=!r),be(r),t.blending===1&&t.transparent===!1?ve(0):ve(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),Ce(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?de(e.SAMPLE_ALPHA_TO_COVERAGE):fe(e.SAMPLE_ALPHA_TO_COVERAGE)}function be(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function xe(t){t===0?fe(e.CULL_FACE):(de(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function Se(t){t!==k&&(M&&e.lineWidth(t),k=t)}function Ce(t,n,r){t?(de(e.POLYGON_OFFSET_FILL),(A!==n||j!==r)&&(A=n,j=r,o.getReversed()&&(n=-n,r=-r),e.polygonOffset(n,r))):fe(e.POLYGON_OFFSET_FILL)}function we(t){t?de(e.SCISSOR_TEST):fe(e.SCISSOR_TEST)}function Te(t){t===void 0&&(t=e.TEXTURE0+ee-1),re!==t&&(e.activeTexture(t),re=t)}function Ee(t,n,r){r===void 0&&(r=re===null?e.TEXTURE0+ee-1:re);let i=ie[r];i===void 0&&(i={type:void 0,texture:void 0},ie[r]=i),(i.type!==t||i.texture!==n)&&(re!==r&&(e.activeTexture(r),re=r),e.bindTexture(t,n||ue[t]),i.type=t,i.texture=n)}function De(){let t=ie[re];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Oe(){try{e.compressedTexImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function ke(){try{e.compressedTexImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ae(){try{e.texSubImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function je(){try{e.texSubImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Me(){try{e.compressedTexSubImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ne(){try{e.compressedTexSubImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Pe(){try{e.texStorage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Fe(){try{e.texStorage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ie(){try{e.texImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function N(){try{e.texImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Le(t){return d[t]===void 0?e.getParameter(t):d[t]}function Re(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function ze(t){se.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),se.copy(t))}function P(t){ce.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ce.copy(t))}function Be(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),e.uniformBlockBinding(n,i,i),r.set(t,i))}function F(t,n,r){let i=l.get(n).get(t);c[i]!==r&&(e.bindBufferBase(e.UNIFORM_BUFFER,i,r),c[i]=r)}function I(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},re=null,ie={},f={},c={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new W(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,se.set(0,0,e.canvas.width,e.canvas.height),ce.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:de,disable:fe,bindFramebuffer:pe,drawBuffers:me,useProgram:he,setBlending:ve,setMaterial:ye,setFlipSided:be,setCullFace:xe,setLineWidth:Se,setPolygonOffset:Ce,setScissorTest:we,activeTexture:Te,bindTexture:Ee,unbindTexture:De,compressedTexImage2D:Oe,compressedTexImage3D:ke,texImage2D:Ie,texImage3D:N,pixelStorei:Re,getParameter:Le,updateUBOMapping:Be,uniformBlockBinding:F,texStorage2D:Pe,texStorage3D:Fe,texSubImage2D:Ae,texSubImage3D:je,compressedTexSubImage2D:Me,compressedTexSubImage3D:Ne,scissor:ze,viewport:P,reset:I}}function Hl(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new B,u=new WeakMap,d=new Set,f,p=new WeakMap,m=new Set,h=new FinalizationRegistry(e=>m.delete(e)),g=!1;try{g=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function _(e,t){return g?new OffscreenCanvas(e,t):kt(`canvas`)}function v(e,t,n){let r=1,i=I(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);f===void 0&&(f=_(n,a));let o=t?_(n,a):f;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),L(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&L(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function y(e){return e.generateMipmaps}function b(t){e.generateMipmap(t)}function x(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function S(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];L(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||L(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?xt:tn.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function C(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,L(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function w(e,t){return y(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function T(e){let t=new WeakRef(e);r.get(e).__ref=t,m.add(t),h.register(e,t,t)}function E(e){let t=r.get(e).__ref;t!==void 0&&(m.delete(t),h.unregister(t))}function D(e){k(e.target)}function O(e){A(e.target)}function k(e){e.removeEventListener(`dispose`,D),E(e),ee(e),e.isVideoTexture&&u.delete(e),e.isHTMLTexture&&d.delete(e)}function A(e){e.removeEventListener(`dispose`,O),E(e),ue(e)}function j(){for(let e of m){let t=e.deref();t!==void 0&&(t.isRenderTarget===!0?A(t):k(t))}m.clear(),d.clear()}function ee(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=p.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&M(e),Object.keys(i).length===0&&p.delete(n)}r.remove(e)}function M(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=p.get(i);delete a[n.__cacheKey],o.memory.textures--}function ue(t){let n=r.get(t);n.__depthDisposeCallback&&n.__depthDisposeCallback();let i=t.depthTexture;if(i&&i.renderTarget===t&&k(i),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let a=t.textures;for(let t=0,n=a.length;t<n;t++){let n=r.get(a[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(a[t])}r.remove(t)}let de=0;function fe(){de=0}function pe(){return de}function me(e){de=e}function he(){let e=de;return e>=i.maxTextures&&L(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+i.maxTextures),de+=1,e}function ge(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.mipmapsAutoUpdate),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function _e(t,i){let a=r.get(t);if(t.isVideoTexture&&Be(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)L(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)L(`WebGLRenderer: Texture marked for update but image is incomplete`);else{ke(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function ve(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?ke(a,t,i):(t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i))}function ye(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?ke(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function be(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?Ae(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let xe={[te]:e.REPEAT,[ne]:e.CLAMP_TO_EDGE,[re]:e.MIRRORED_REPEAT},Se={[ie]:e.NEAREST,[ae]:e.NEAREST_MIPMAP_NEAREST,[oe]:e.NEAREST_MIPMAP_LINEAR,[se]:e.LINEAR,[ce]:e.LINEAR_MIPMAP_NEAREST,[le]:e.LINEAR_MIPMAP_LINEAR},Ce={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function we(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&L(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,xe[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,xe[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,xe[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,Se[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,Se[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,Ce[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function Te(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,D),T(n));let i=n.source,a=p.get(i);a===void 0&&(a={},p.set(i,a));let s=ge(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&M(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function Ee(e,t,n){return Math.floor(Math.floor(e/n)/t)}function Oe(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=Ee(n.start,r.width,4),c=Ee(t.start,r.width,4);n.start<=i+1&&a===c&&Ee(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function ke(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=Te(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let f=r.get(u);if(u.version!==f.__version||l===!0){if(n.activeTexture(e.TEXTURE0+s),!(typeof ImageBitmap<`u`&&o.image instanceof ImageBitmap)){let t=tn.getPrimaries(tn.workingColorSpace),r=o.colorSpace===``?null:tn.getPrimaries(o.colorSpace),i=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment);let t=v(o.image,!1,i.maxTextureSize);t=F(o,t);let r=a.convert(o.format,o.colorSpace),p=a.convert(o.type),m=S(o.internalFormat,r,p,o.normalized,o.colorSpace,o.isVideoTexture);we(c,o);let h,g=o.mipmaps,_=o.isVideoTexture!==!0,x=f.__version===void 0||l===!0,T=u.dataReady,E=w(o,t);if(o.isDepthTexture)m=C(o.format===De,o.type),x&&(_?n.texStorage2D(e.TEXTURE_2D,1,m,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,null));else if(o.isDataTexture){if(g.length>0){_&&x&&n.texStorage2D(e.TEXTURE_2D,E,m,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)h=g[t],_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data);o.generateMipmaps=!1}else _?(x&&n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height),T&&Oe(o,t,r,p)):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,t.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){_&&x&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,g[0].width,g[0].height,t.depth);for(let i=0,a=g.length;i<a;i++)if(h=g[i],o.format!==1023){if(r!==null){if(_){if(T){if(o.layerUpdates.size>0){let t=Wo(h.width,h.height,o.format,o.type);for(let a of o.layerUpdates){let o=h.data.subarray(a*t/h.data.BYTES_PER_ELEMENT,(a+1)*t/h.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,a,h.width,h.height,1,r,o)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,h.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,h.data,0,0)}else L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else _?T&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,p,h.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,r,p,h.data);o.layerUpdates.size>0&&o.clearLayerUpdates()}else{_&&x&&n.texStorage2D(e.TEXTURE_2D,E,m,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)h=g[t],o.format===1023?_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data):r===null?L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):_?T&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,h.data):n.compressedTexImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,h.data)}}else if(o.isDataArrayTexture){if(_){if(x&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,t.width,t.height,t.depth),T){if(o.layerUpdates.size>0){let i=Wo(t.width,t.height,o.format,o.type);for(let a of o.layerUpdates){let o=t.data.subarray(a*i/t.data.BYTES_PER_ELEMENT,(a+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,a,t.width,t.height,1,r,p,o)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,m,t.width,t.height,t.depth,0,r,p,t.data)}else if(o.isData3DTexture)_?(x&&n.texStorage3D(e.TEXTURE_3D,E,m,t.width,t.height,t.depth),T&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)):n.texImage3D(e.TEXTURE_3D,0,m,t.width,t.height,t.depth,0,r,p,t.data);else if(o.isFramebufferTexture){if(x){if(_)n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height);else{let i=t.width,a=t.height;for(let t=0;t<E;t++)n.texImage2D(e.TEXTURE_2D,t,m,i,a,0,r,p,null),i>>=1,a>>=1}}}else if(o.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),d.add(o),n.onpaint=e=>{let t=e.changedElements;for(let e of d)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(g.length>0){if(_&&x){let t=I(g[0]);n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height)}for(let t=0,i=g.length;t<i;t++)h=g[t],_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,p,h):n.texImage2D(e.TEXTURE_2D,t,m,r,p,h);o.generateMipmaps=!1}else if(_){if(x){let r=I(t);n.texStorage2D(e.TEXTURE_2D,E,m,r.width,r.height)}T&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,p,t)}else n.texImage2D(e.TEXTURE_2D,0,m,r,p,t);y(o)&&o.mipmapsAutoUpdate===!0&&b(c),f.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function Ae(t,o,s){if(o.image.length!==6)return;let c=Te(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=tn.getPrimaries(tn.workingColorSpace),r=o.colorSpace===``?null:tn.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=v(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=F(o,m[e]);let h=m[0],g=a.convert(o.format,o.colorSpace),_=a.convert(o.type),x=S(o.internalFormat,g,_,o.normalized,o.colorSpace),T=o.isVideoTexture!==!0,E=u.__version===void 0||c===!0,D=l.dataReady,O=w(o,h);we(e.TEXTURE_CUBE_MAP,o);let k;if(o.isDepthTexture){if(x=C(o.format===De,o.type),E){if(T)n.texStorage2D(e.TEXTURE_CUBE_MAP,1,x,h.width,h.height);else for(let t=0;t<6;t++)n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,h.width,h.height,0,g,_,null)}}else if(f){T&&E&&n.texStorage2D(e.TEXTURE_CUBE_MAP,O,x,h.width,h.height);for(let t=0;t<6;t++){k=m[t].mipmaps;for(let r=0;r<k.length;r++){let i=k[r];o.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,x,i.width,i.height,0,g,_,i.data):g===null?L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,x,i.width,i.height,0,i.data)}}}else{if(k=o.mipmaps,T&&E){k.length>0&&O++;let t=I(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,O,x,t.width,t.height)}for(let t=0;t<6;t++)if(p){T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,g,_,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,m[t].width,m[t].height,0,g,_,m[t].data);for(let r=0;r<k.length;r++){let i=k[r].image[t].image;T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,x,i.width,i.height,0,g,_,i.data)}}else{T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,g,_,m[t]);for(let r=0;r<k.length;r++){let i=k[r];T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,g,_,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,x,g,_,i.image[t])}}}y(o)&&o.mipmapsAutoUpdate===!0&&b(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function je(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=S(o.internalFormat,d,f,o.normalized,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),P(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,ze(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function Me(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=C(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;P(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ze(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,ze(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=S(o.internalFormat,c,l,o.normalized,o.colorSpace);P(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ze(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,ze(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Ne(t,i,a){let o=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let c=r.get(i.depthTexture);c.__renderTarget=i;let l=o?i.depthTexture.image[0]:i.depthTexture.image;c.__webglTexture&&l.width===i.width&&l.height===i.height||(l.width=i.width,l.height=i.height,i.depthTexture.needsUpdate=!0),o?be(i.depthTexture,0):_e(i.depthTexture,0);let u=c.__webglTexture,d=ze(i),f=o?e.TEXTURE_CUBE_MAP_POSITIVE_X+a:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)P(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)P(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function Pe(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)for(let e=0;e<6;e++)Ne(i.__webglFramebuffer[e],t,e);else t.texture.mipmaps.length>0?Ne(i.__webglFramebuffer[0],t,0):Ne(i.__webglFramebuffer,t,0)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),Me(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else if(t.texture.mipmaps.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),Me(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}n.bindFramebuffer(e.FRAMEBUFFER,null)}function Fe(t,n,i){let a=r.get(t);n!==void 0&&je(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&Pe(t)}function Ie(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,O),T(t);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&P(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=S(r.internalFormat,i,o,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),u=ze(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),Me(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),we(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)je(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else je(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);y(i)?b(e.TEXTURE_CUBE_MAP):i.mipmaps.length>0&&e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),we(c,a),je(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),y(a)&&b(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),we(r,i),i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)je(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else je(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);y(i)?b(r):i.mipmaps.length>0&&e.texParameteri(r,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}t.depthBuffer&&Pe(t)}function N(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(y(a)&&a.mipmapsAutoUpdate===!0){let t=x(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),b(t),n.unbindTexture()}}}let Le=[];function Re(t){if(t.samples>0){if(P(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer),t.texture.mipmaps.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(Le.length=0,Le.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&Le.push(l),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Le))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function ze(e){return Math.min(i.maxSamples,e.samples)}function P(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function Be(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function F(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(tn.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&L(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):R(`WebGLTextures: Unsupported texture color space:`,n)),t}function I(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=he,this.resetTextureUnits=fe,this.getTextureUnits=pe,this.setTextureUnits=me,this.setTexture2D=_e,this.setTexture2DArray=ve,this.setTexture3D=ye,this.setTextureCube=be,this.rebindTextures=Fe,this.setupRenderTarget=Ie,this.updateRenderTargetMipmap=N,this.updateMultisampleRenderTarget=Re,this.setupDepthRenderbuffer=Pe,this.setupFrameBufferTexture=je,this.useMultisampledRTT=P,this.dispose=j}function Ul(e,t){function n(n,r=``){let i,a=tn.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Wl=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Gl=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Kl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Ki(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Ba({vertexShader:Wl,fragmentShader:Gl,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new K(new Da(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ql=class extends Lt{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new Kl,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new B,C=null,w=null,T=new wo;T.viewport=new pn;let E=new wo;E.viewport=new pn;let D=[T,E],O=new jo,k=null,A=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new qn,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new qn,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new qn,b[e]=t),t.getHandSpace()};function j(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ee(){r.removeEventListener(`select`,j),r.removeEventListener(`selectstart`,j),r.removeEventListener(`selectend`,j),r.removeEventListener(`squeeze`,j),r.removeEventListener(`squeezestart`,j),r.removeEventListener(`squeezeend`,j),r.removeEventListener(`end`,ee),r.removeEventListener(`inputsourceschange`,M);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}k=null,A=null,h.reset();for(let e in g)delete g[e];if(e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,ae.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),w!==null){let e=w.camera;e.fov=w.fov,e.zoom=w.zoom,e.updateProjectionMatrix(),w=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&L(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&L(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,j),r.addEventListener(`selectstart`,j),r.addEventListener(`selectend`,j),r.addEventListener(`squeeze`,j),r.addEventListener(`squeezestart`,j),r.addEventListener(`squeezeend`,j),r.addEventListener(`end`,ee),r.addEventListener(`inputsourceschange`,M),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?De:Ee,a=_.stencil?be:he);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new hn(d.textureWidth,d.textureHeight,{format:Te,type:ue,depthTexture:new Wi(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new hn(f.framebufferWidth,f.framebufferHeight,{format:Te,type:ue,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),ae.setContext(r),ae.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function M(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}function te(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),O.near=E.near=T.near=t,O.far=E.far=T.far=n,(k!==O.near||A!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),k=O.near,A=O.far),O.layers.mask=e.layers.mask|6,T.layers.mask=O.layers.mask&-5,E.layers.mask=O.layers.mask&-3;let i=e.parent,a=O.cameras;te(O,i);for(let e=0;e<a.length;e++)te(a[e],i);O.projectionMatrix.copy(T.projectionMatrix),O.projectionMatrixInverse.copy(T.projectionMatrixInverse),w===null&&e.isPerspectiveCamera&&(w={camera:e,fov:e.fov,zoom:e.zoom}),ne(e,O,i)};function ne(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Bt*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(O)},this.getCameraTexture=function(e){return g[e]};let re=null;function ie(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==O.cameras.length&&(O.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=D[n];o===void 0&&(o=new wo,o.layers.enable(n),o.viewport=new pn,D[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(O.matrix.copy(o.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),i===!0&&O.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new Ki,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}re&&re(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let ae=new Ko;ae.setAnimationLoop(ie),this.setAnimationLoop=function(e){re=e},this.dispose=function(){}}},Jl=new vn,Yl=new H;Yl.set(-1,0,0,0,1,0,0,0,1);function Xl(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Ia(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Jl.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(Yl),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.diffuseRoughness>0&&(e.diffuseRoughness.value=t.diffuseRoughness,t.diffuseRoughnessMap&&(e.diffuseRoughnessMap.value=t.diffuseRoughnessMap,n(t.diffuseRoughnessMap,e.diffuseRoughnessMapTransform))),t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessMinimum,e.iridescenceThicknessMaximum.value=t.iridescenceThicknessMaximum,t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Zl(e,t,n,r){let i={},a={};function o(e,t){let n=t.program;r.uniformBlockBinding(e,n,i[e.id])}function s(e,n){let o=i[e.id];o===void 0&&(m(e),o=c(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let u=t.render.frame;a[e.id]!==u&&(l(e),a[e.id]=u)}function c(t){let n=e.createBuffer(),r=t.__size,i=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,n),e.bufferData(e.UNIFORM_BUFFER,r,i),e.bindBuffer(e.UNIFORM_BUFFER,null),n}function l(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)u(t[n],e,n,a);else u(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function u(t,n,r,i){if(f(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=h(i,!0);d(i,t.__data,e),e+=a.storage/Float32Array.BYTES_PER_ELEMENT}}else d(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function d(e,t,n){typeof e==`number`||typeof e==`boolean`?t[n]=e:e.isMatrix3?(t[n]=e.elements[0],t[n+1]=e.elements[1],t[n+2]=e.elements[2],t[n+3]=0,t[n+4]=e.elements[3],t[n+5]=e.elements[4],t[n+6]=e.elements[5],t[n+7]=0,t[n+8]=e.elements[6],t[n+9]=e.elements[7],t[n+10]=e.elements[8],t[n+11]=0):ArrayBuffer.isView(e)?t.set(e.subarray(0,t.length-n),n):e.toArray(t,n)}function f(e,t,n,r){let i=e.value,a=t+`_`+n;if(Array.isArray(i)){r[a]===void 0&&(r[a]=[]);let e=r[a],t=!1;for(let n=0;n<i.length;n++)p(i[n],e,n)===!0&&(t=!0);return t}return p(i,r,a)}function p(e,t,n){if(t[n]===void 0)return t[n]=typeof e==`number`||typeof e==`boolean`?e:ArrayBuffer.isView(e)?e.slice():e.clone(),!0;{let r=t[n];if(typeof e==`number`||typeof e==`boolean`){if(r!==e)return t[n]=e,!0}else if(ArrayBuffer.isView(e))return!0;else if(r.equals(e)===!1)return r.copy(e),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let i=0,a=r.length;i<a;i++){let a=r[i],o=Array.isArray(a.value)?a.value:[a.value],s=Array.isArray(t[e])||Array.isArray(a.value),c=n;for(let e=0,t=o.length;e<t;e++){let t=o[e],r=h(t,s),i=n%16,a=i%r.boundary,l=i+a;n+=a,l!==0&&16-l<r.storage&&(n+=16-l),e===0&&(c=n),n+=r.storage}a.__data=new(a.type===`int`?Int32Array:a.type===`uint`?Uint32Array:Float32Array)((n-c)/Float32Array.BYTES_PER_ELEMENT),a.__offset=c}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e,t){let n={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(n.boundary=4,n.storage=4):e.isVector2?(n.boundary=8,n.storage=8):e.isVector3||e.isColor?(n.boundary=16,n.storage=12):e.isVector4?(n.boundary=16,n.storage=16):e.isMatrix3?(n.boundary=16,n.storage=48):e.isMatrix4?(n.boundary=16,n.storage=64):e.isTexture?L(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(n.boundary=16,n.storage=e.byteLength):L(`WebGLRenderer: Unsupported uniform value type.`,e),t===!0&&(n.boundary=16,n.storage=Math.ceil(n.storage/16)*16),n}function g(t){let n=t.target;n.removeEventListener(`dispose`,g),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);i={},a={}}return{bind:o,update:s,dispose:_}}var Ql=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),$l=null;function eu(){return $l===null&&($l=new yi(Ql,16,16,Ae,_e),$l.name=`DFG_LUT`,$l.minFilter=se,$l.magFilter=se,$l.wrapS=ne,$l.wrapT=ne,$l.generateMipmaps=!1,$l.needsUpdate=!0),$l}var tu=class{constructor(e={}){let{canvas:t=At(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=ue}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);p=n.getContextAttributes().alpha}else p=a;let m=f,h=new Set([Me,je,ke]),g=new Set([ue,he,pe,be,ve,ye]),_=new Uint32Array(4),v=new Int32Array(4),y={textures:[],min:[],max:[],resolution:[]},b=null,x=null,S=[],C=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let T=this,E=!1,D=null,O=null,k=null,A=null;this._outputColorSpace=yt;let j=0,ee=0,M=null,te=-1,ne=null,re=new pn,ie=new pn,ae=null,oe=new W(0),se=0,ce=t.width,de=t.height,fe=1,me=null,ge=null,xe=new pn(0,0,ce,de),Se=new pn(0,0,ce,de),Ce=!1,we=new Mi,Te=new Pi,Ee=!1,De=!1,Oe=new vn,Ae=new V,Ne=new pn,Pe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Fe=!1;function Ie(){return M===null?fe:1}let N=n;function Le(e,n){return t.getContext(e,n)}let Re,ze,P,Be,F,I,Ve,He,Ue,We,Ge,Ke,qe,Je,Ye,Xe,Ze,Qe,$e,et,tt,nt,rt;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r187`),t.addEventListener(`webglcontextlost`,ot,!1),t.addEventListener(`webglcontextrestored`,st,!1),t.addEventListener(`webglcontextcreationerror`,ct,!1),N===null){let t=`webgl2`;if(N=Le(t,e),N===null)throw Le(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}it()}catch(e){throw t.removeEventListener(`webglcontextlost`,ot,!1),t.removeEventListener(`webglcontextrestored`,st,!1),t.removeEventListener(`webglcontextcreationerror`,ct,!1),R(`WebGLRenderer: `+e.message),e}function it(){Re=new xs(N),Re.init(),tt=new Ul(N,Re),ze=new ts(N,Re,e,tt),P=new Vl(N,Re),ze.reversedDepthBuffer&&d&&P.buffers.depth.setReversed(!0),O=N.createFramebuffer(),k=N.createFramebuffer(),A=N.createFramebuffer(),Be=new ws(N),F=new xl,I=new Hl(N,Re,P,F,ze,tt,Be),Ve=new bs(T),He=new qo(N),nt=new $o(N,He),Ue=new Ss(N,He,Be,nt),We=new Es(N,Ue,He,nt,Be),Qe=new Ts(N,ze,I),Ye=new ns(F),Ge=new bl(T,Ve,Re,ze,nt,Ye),Ke=new Xl(T,F),qe=new Tl,Je=new Ml(Re),Ze=new Qo(T,Ve,P,We,p,s),Xe=new Bl(T,We,ze),rt=new Zl(N,Be,ze,P),$e=new es(N,Re,Be),et=new Cs(N,Re,Be),Be.programs=Ge.programs,T.capabilities=ze,T.extensions=Re,T.properties=F,T.renderLists=qe,T.shadowMap=Xe,T.state=P,T.info=Be}m!==1009&&(w=new Os(m,t.width,t.height,o,r,i));let at=new ql(T,N);this.xr=at,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){let e=Re.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Re.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return fe},this.setPixelRatio=function(e){e!==void 0&&(fe=e,this.setSize(ce,de,!1))},this.getSize=function(e){return e.set(ce,de)},this.setSize=function(e,n,r=!0){at.isPresenting?L(`WebGLRenderer: Can't change size while VR device is presenting.`):(ce=e,de=n,t.width=Math.floor(e*fe),t.height=Math.floor(n*fe),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(ce*fe,de*fe).floor()},this.setDrawingBufferSize=function(e,n,r){ce=e,de=n,fe=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(m===1009)R(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){L(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}w.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(re)},this.getViewport=function(e){return e.copy(xe)},this.setViewport=function(e,t,n,r){e.isVector4?xe.set(e.x,e.y,e.z,e.w):xe.set(e,t,n,r),P.viewport(re.copy(xe).multiplyScalar(Ie()).round())},this.getScissor=function(e){return e.copy(Se)},this.setScissor=function(e,t,n,r){e.isVector4?Se.set(e.x,e.y,e.z,e.w):Se.set(e,t,n,r),P.scissor(ie.copy(Se).multiplyScalar(Ie()).round())},this.getScissorTest=function(){return Ce},this.setScissorTest=function(e){P.setScissorTest(Ce=e)},this.setOpaqueSort=function(e){me=e},this.setTransparentSort=function(e){ge=e},this.getClearColor=function(e){return e.copy(Ze.getClearColor())},this.setClearColor=function(){Ze.setClearColor(...arguments)},this.getClearAlpha=function(){return Ze.getClearAlpha()},this.setClearAlpha=function(){Ze.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(M!==null){let t=M.texture.format;e=h.has(t)}if(e){let e=M.texture.type,t=g.has(e),n=Ze.getClearColor(),r=Ze.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(_[0]=i,_[1]=a,_[2]=o,_[3]=r,N.clearBufferuiv(N.COLOR,0,_)):(v[0]=i,v[1]=a,v[2]=o,v[3]=r,N.clearBufferiv(N.COLOR,0,v))}else r|=N.COLOR_BUFFER_BIT}t&&(r|=N.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&N.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),D=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,ot,!1),t.removeEventListener(`webglcontextrestored`,st,!1),t.removeEventListener(`webglcontextcreationerror`,ct,!1),Ze.dispose(),qe.dispose(),Je.dispose(),I.dispose(),F.dispose(),Ve.dispose(),We.dispose(),Ue.dispose(),nt.dispose(),rt.dispose(),Ge.dispose(),at.dispose(),at.removeEventListener(`sessionstart`,ht),at.removeEventListener(`sessionend`,gt),_t.stop()};function ot(e){e.preventDefault(),Mt(`WebGLRenderer: Context Lost.`),E=!0}function st(){Mt(`WebGLRenderer: Context Restored.`),E=!1;let e=Be.autoReset,t=Xe.enabled,n=Xe.autoUpdate,r=Xe.needsUpdate,i=Xe.type;it(),Be.autoReset=e,Xe.enabled=t,Xe.autoUpdate=n,Xe.needsUpdate=r,Xe.type=i}function ct(e){R(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function lt(e){let t=e.target;t.removeEventListener(`dispose`,lt),ut(t)}function ut(e){dt(e),F.remove(e)}function dt(e){let t=F.get(e).programs;t!==void 0&&(t.forEach(function(e){Ge.releaseProgram(e)}),e.isShaderMaterial&&Ge.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=Pe);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=jt(e,t,n,r,i);P.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Ue.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;nt.setup(i,r,s,n,c);let h,g=$e;if(c!==null&&(h=He.get(c),g=et,g.setIndex(h)),i.isMesh)r.wireframe===!0?(P.setLineWidth(r.wireframeLinewidth*Ie()),g.setMode(N.LINES)):g.setMode(N.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),P.setLineWidth(e*Ie()),i.isLineSegments?g.setMode(N.LINES):i.isLineLoop?g.setMode(N.LINE_LOOP):g.setMode(N.LINE_STRIP)}else i.isPoints?g.setMode(N.POINTS):i.isSprite&&g.setMode(N.TRIANGLES);if(i.isBatchedMesh){if(Re.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?He.get(c).bytesPerElement:1,o=F.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(N,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function ft(e,t,n,r){D!==null&&e.isNodeMaterial&&D.setObject(r,e),Ee===!0&&Ye.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Tt(e,t,r),e.side=0,e.needsUpdate=!0,Tt(e,t,r),e.side=2):Tt(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),D!==null&&D.renderStart(e,t,n),x=Je.get(n),x.init(t),C.push(x),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),x.setupLights(),D!==null&&D.updateLights(x.state.lightsArray),De=this.localClippingEnabled,Ee=Ye.init(this.clippingPlanes,De),Ee===!0&&Ye.setGlobalState(this.clippingPlanes,t),D!==null&&Xe.render(x.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];ft(o,n,t,e),r.add(o)}else ft(i,n,t,e),r.add(i)}}),x=C.pop(),D!==null&&D.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=F.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}Re.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let pt=null;function mt(e){pt&&pt(e)}function ht(){_t.stop()}function gt(){_t.start()}let _t=new Ko;_t.setAnimationLoop(mt),typeof self<`u`&&_t.setContext(self),this.setAnimationLoop=function(e){pt=e,at.setAnimationLoop(e),e===null?_t.stop():_t.start()},at.addEventListener(`sessionstart`,ht),at.addEventListener(`sessionend`,gt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){R(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(E===!0)return;D!==null&&D.renderStart(e,t);let n=at.enabled===!0&&at.isPresenting===!0,r=w!==null&&(M===null||n)&&w.begin(T,M);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),at.enabled===!0&&at.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(at.cameraAutoUpdate===!0&&at.updateCamera(t),t=at.getCamera()),e.isScene===!0&&e.onBeforeRender(T,e,t,M),x=Je.get(e,C.length),x.init(t),x.state.textureUnits=I.getTextureUnits(),C.push(x),Oe.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),t.isArrayCamera?Te.setFromArrayCamera(t):we.setFromProjectionMatrix(Oe,Et,t.reversedDepth),De=this.localClippingEnabled,Ee=Ye.init(this.clippingPlanes,De),b=qe.get(e,S.length),b.init(),S.push(b),this.info.render.frame++,at.enabled===!0&&at.isPresenting===!0){let e=T.xr.getDepthSensingMesh();e!==null&&vt(e,t,-1/0,T.sortObjects)}vt(e,t,0,T.sortObjects),b.finish(),D!==null&&D.updateLights(x.state.lightsArray),T.sortObjects===!0&&b.sort(me,ge),Fe=at.enabled===!1||at.isPresenting===!1||at.hasDepthSensing()===!1,Fe&&Ze.addToRenderList(b,e),this.info.autoReset===!0&&this.info.reset(),Ee===!0&&Ye.beginShadows();let i=x.state.shadowsArray;if(Xe.render(i,e,t),Ee===!0&&Ye.endShadows(),(r&&w.hasRenderPass())===!1){let n=b.opaque,r=b.transmissive;if(x.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];xt(n,r,e,a)}Fe&&Ze.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];bt(b,e,n,n.viewport)}}else r.length>0&&xt(n,r,e,t),Fe&&Ze.render(e),bt(b,e,t)}M!==null&&ee===0&&(I.updateMultisampleRenderTarget(M),I.updateRenderTargetMipmap(M)),r&&w.end(T),e.isScene===!0&&e.onAfterRender(T,e,t),nt.resetDefaultState(),te=-1,ne=null,C.pop(),C.length>0?(x=C[C.length-1],I.setTextureUnits(x.state.textureUnits),Ee===!0&&Ye.setGlobalState(T.clippingPlanes,x.state.camera)):x=null,S.pop(),b=S.length>0?S[S.length-1]:null,D!==null&&D.renderEnd()};function vt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)x.pushLight(e),e.castShadow&&x.pushShadow(e);else if(e.isSprite){let i=t.isArrayCamera?Te:we;if(!e.frustumCulled||e.intersectsFrustum(i)){r&&Ne.setFromMatrixPosition(e.matrixWorld).applyMatrix4(Oe);let i=We.update(e),a=e.material;a.visible&&b.push(e,i,a,n,Ne.z,null,t)}}else if(e.isMesh||e.isLine||e.isPoints){let i=t.isArrayCamera?Te:we;if(!e.frustumCulled||e.intersectsFrustum(i)){let i=We.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),Ne.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),Ne.copy(e.boundingSphere.center)),Ne.applyMatrix4(e.matrixWorld).applyMatrix4(Oe)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&b.push(e,i,c,n,Ne.z,s,t)}}else a.visible&&b.push(e,i,a,n,Ne.z,null,t)}}}let i=e.children;for(let e=0,a=i.length;e<a;e++)vt(i[e],t,n,r)}function bt(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;x.setupLightsView(n),Ee===!0&&Ye.setGlobalState(T.clippingPlanes,n),r&&P.viewport(re.copy(r)),i.length>0&&St(i,t,n),a.length>0&&St(a,t,n),o.length>0&&St(o,t,n),P.buffers.depth.setTest(!0),P.buffers.depth.setMask(!0),P.buffers.color.setMask(!0),P.setPolygonOffset(!1)}function xt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[r.id]===void 0){let e=Re.has(`EXT_color_buffer_half_float`)||Re.has(`EXT_color_buffer_float`);x.state.transmissionRenderTarget[r.id]=new hn(1,1,{generateMipmaps:!0,type:e?_e:ue,minFilter:le,samples:Math.max(4,ze.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:tn.workingColorSpace})}let a=x.state.transmissionRenderTarget[r.id],o=r.viewport||re;a.setSize(o.z*T.transmissionResolutionScale,o.w*T.transmissionResolutionScale);let s=T.getRenderTarget(),c=T.getActiveCubeFace(),l=T.getActiveMipmapLevel();T.setRenderTarget(a),T.getClearColor(oe),se=T.getClearAlpha(),se<1&&T.setClearColor(16777215,.5),T.clear(),Fe&&Ze.render(n);let u=T.toneMapping;T.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),x.setupLightsView(r),Ee===!0&&Ye.setGlobalState(T.clippingPlanes,r),St(e,n,r),I.updateMultisampleRenderTarget(a),I.updateRenderTargetMipmap(a),Re.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,Ct(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(I.updateMultisampleRenderTarget(a),I.updateRenderTargetMipmap(a))}T.setRenderTarget(s,c,l),T.setClearColor(oe,se),d!==void 0&&(r.viewport=d),T.toneMapping=u}function St(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&Ct(o,t,n,s,l,c)}}function Ct(e,t,n,r,i,a){D!==null&&i.isNodeMaterial&&D.setObject(e,i),e.onBeforeRender(T,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(T,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=2):T.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(T,t,n,r,i,a)}function wt(e){let t=0;for(let n of e)n.texture!==null&&t++;return t}function Tt(e,t,n){t.isScene!==!0&&(t=Pe);let r=F.get(e),i=x.state.lights,a=x.state.shadowsArray,o=i.state.version,s=Ge.getParameters(e,i.state,a,t,n,x.state.lightProbeGridArray),c=Ge.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Ve.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,lt),l=new Map,r.programs=l,r.programVariants=new Map);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return kt(e,s),d}else s.uniforms=Ge.getUniforms(e),D!==null&&e.isNodeMaterial&&D.build(e,n,s),e.onBeforeCompile(s,T),d=Ge.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Ye.uniform),kt(e,s),r.needsLights=Pt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.numLightProbeGrids=wt(x.state.lightProbeGridArray),r.currentProgram=d,r.uniformsList=null,d}function Dt(e,t,n,r,i){let a=F.get(e),o=a.currentProgram.id+`,`+r+`,`+i,s=a.programVariants.get(o);return s===void 0?(s=Tt(e,t,n),a.programVariants.set(o,s)):(a.currentProgram=s,a.uniformsList=null,a.outputColorSpace=r,a.toneMapping=i),s}function Ot(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Lc.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function kt(e,t){let n=F.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function jt(e,t,n,r,i){t.isScene!==!0&&(t=Pe),I.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=M===null?T.outputColorSpace:M.isXRRenderTarget===!0?M.texture.colorSpace:tn.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Ve.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(M===null||M.isXRRenderTarget===!0)&&(h=T.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=F.get(r),b=x.state.lights;if(Ee===!0&&(De===!0||e!==ne)){let t=e===ne&&r.id===te;Ye.setState(r,e,t)}let S=!1,C=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==b.state.version||i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?S=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Ye.numPlanes||v.numIntersection!==Ye.numIntersection)?S=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.morphTargetsCount===_&&v.numLightProbeGrids===wt(x.state.lightProbeGridArray)?(v.outputColorSpace!==s||v.toneMapping!==h)&&(C=!0):S=!0:S=!0:(S=!0,v.__version=r.version);let w=v.currentProgram;(S===!0||C===!0)&&(w=C===!0?Dt(r,t,i,s,h):Tt(r,t,i),D&&r.isNodeMaterial&&D.onUpdateProgram(r,w,v));let E=!1,O=!1,k=!1,A=w.getUniforms(),j=v.uniforms;if(P.useProgram(w.program)&&(E=!0,O=!0,k=!0),r.id!==te&&(te=r.id,O=!0),E||ne!==e){P.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),A.setValue(N,`projectionMatrix`,e.projectionMatrix),A.setValue(N,`viewMatrix`,e.matrixWorldInverse);let t=A.map.cameraPosition;t!==void 0&&t.setValue(N,Ae.setFromMatrixPosition(e.matrixWorld)),ze.logarithmicDepthBuffer&&A.setValue(N,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&A.setValue(N,`isOrthographic`,e.isOrthographicCamera===!0),ne!==e&&(ne=e,O=!0,k=!0)}if(v.needsLights&&(b.state.sunShadowMap.length>0&&A.setValue(N,`sunShadowMap`,b.state.sunShadowMap,I),b.state.directionalShadowMap.length>0&&A.setValue(N,`directionalShadowMap`,b.state.directionalShadowMap,I),b.state.spotShadowMap.length>0&&A.setValue(N,`spotShadowMap`,b.state.spotShadowMap,I),b.state.pointShadowMap.length>0&&A.setValue(N,`pointShadowMap`,b.state.pointShadowMap,I)),i.isSkinnedMesh){A.setOptional(N,i,`bindMatrix`),A.setOptional(N,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),A.setValue(N,`boneTexture`,e.boneTexture,I))}i.isBatchedMesh&&(A.setOptional(N,i,`batchingTexture`),A.setValue(N,`batchingTexture`,i._matricesTexture,I),A.setOptional(N,i,`batchingIdTexture`),A.setValue(N,`batchingIdTexture`,i._indirectTexture,I),A.setOptional(N,i,`batchingColorTexture`),i._colorsTexture!==null&&A.setValue(N,`batchingColorTexture`,i._colorsTexture,I));let ee=n.morphAttributes;if((ee.position!==void 0||ee.normal!==void 0||ee.color!==void 0)&&Qe.update(i,n,w),(O||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,A.setValue(N,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(j.envMapIntensity.value=t.environmentIntensity),j.dfgLUT!==void 0&&(j.dfgLUT.value=eu()),O){if(A.setValue(N,`toneMappingExposure`,T.toneMappingExposure),v.needsLights&&Nt(j,k),a&&r.fog===!0&&Ke.refreshFogUniforms(j,a),Ke.refreshMaterialUniforms(j,r,fe,de,x.state.transmissionRenderTarget[e.id]),v.needsLights&&v.numLightProbeGrids>0){let e=y,t=0;for(let n of x.state.lightProbeGridArray)n.texture!==null&&(e.textures[t]=n.texture,e.min[t]=n.boundingBox.min,e.max[t]=n.boundingBox.max,e.resolution[t]=n.resolution,t++);for(let n in e)e[n].length=t;j.probesSH.value=e.textures,j.probesMin.value=e.min,j.probesMax.value=e.max,j.probesResolution.value=e.resolution}Lc.upload(N,Ot(v),j,I)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Lc.upload(N,Ot(v),j,I),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&A.setValue(N,`center`,i.center),A.setValue(N,`modelViewMatrix`,i.modelViewMatrix),A.setValue(N,`normalMatrix`,i.normalMatrix),A.setValue(N,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];rt.update(n,w),rt.bind(n,w)}}return w}function Nt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function Pt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return j},this.getActiveMipmapLevel=function(){return ee},this.getRenderTarget=function(){return M},this.setRenderTargetTextures=function(e,t,n){let r=F.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),F.get(e.texture).__webglTexture=t,F.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=F.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){M=e,j=t,ee=n;let r=null,i=!1,a=!1;if(e){let o=F.get(e);if(o.__useDefaultFramebuffer!==void 0){P.bindFramebuffer(N.FRAMEBUFFER,o.__webglFramebuffer),re.copy(e.viewport),ie.copy(e.scissor),ae=e.scissorTest,P.viewport(re),P.scissor(ie),P.setScissorTest(ae),te=-1;return}if(o.__webglFramebuffer===void 0)I.setupRenderTarget(e);else if(o.__hasExternalTextures)I.rebindTextures(e,F.get(e.texture).__webglTexture,F.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&F.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);I.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=F.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&I.useMultisampledRTT(e)===!1?F.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,re.copy(e.viewport),ie.copy(e.scissor),ae=e.scissorTest}else re.copy(xe).multiplyScalar(fe).floor(),ie.copy(Se).multiplyScalar(fe).floor(),ae=Ce;if(n!==0&&(r=O),P.bindFramebuffer(N.FRAMEBUFFER,r)&&P.drawBuffers(e,r),P.viewport(re),P.scissor(ie),P.setScissorTest(ae),i){let r=F.get(e.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=F.get(e.textures[t]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=F.get(e.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,t.__webglTexture,n)}te=-1};function It(e){let t=F.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=ze.textureFormatReadable(e.format),t.__typeReadable=ze.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=F.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){P.bindFramebuffer(N.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+s);let u=It(o);if(u.__formatReadable===!1){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&N.readPixels(t,n,r,i,tt.convert(c),tt.convert(l),a)}finally{let e=M===null?null:F.get(M).__webglFramebuffer;P.bindFramebuffer(N.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=F.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){P.bindFramebuffer(N.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+s);let d=It(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,f),N.bufferData(N.PIXEL_PACK_BUFFER,a.byteLength,N.STREAM_READ),N.readPixels(t,n,r,i,tt.convert(l),tt.convert(u),0),N.bindBuffer(N.PIXEL_PACK_BUFFER,null);let p=M===null?null:F.get(M).__webglFramebuffer;P.bindFramebuffer(N.FRAMEBUFFER,p);let m=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await Ft(N,m,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,f),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,a),N.bindBuffer(N.PIXEL_PACK_BUFFER,null),N.deleteBuffer(f),N.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;I.setTexture2D(e,0),N.copyTexSubImage2D(N.TEXTURE_2D,n,0,0,o,s,i,a),P.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=tt.convert(t.format),_=tt.convert(t.type),v;t.isData3DTexture?(I.setTexture3D(t,0),v=N.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(I.setTexture2DArray(t,0),v=N.TEXTURE_2D_ARRAY):(I.setTexture2D(t,0),v=N.TEXTURE_2D),P.activeTexture(N.TEXTURE0),P.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,t.flipY),P.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),P.pixelStorei(N.UNPACK_ALIGNMENT,t.unpackAlignment);let y=P.getParameter(N.UNPACK_ROW_LENGTH),b=P.getParameter(N.UNPACK_IMAGE_HEIGHT),x=P.getParameter(N.UNPACK_SKIP_PIXELS),S=P.getParameter(N.UNPACK_SKIP_ROWS),C=P.getParameter(N.UNPACK_SKIP_IMAGES);P.pixelStorei(N.UNPACK_ROW_LENGTH,h.width),P.pixelStorei(N.UNPACK_IMAGE_HEIGHT,h.height),P.pixelStorei(N.UNPACK_SKIP_PIXELS,l),P.pixelStorei(N.UNPACK_SKIP_ROWS,u),P.pixelStorei(N.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=F.get(e),r=F.get(t),h=F.get(n.__renderTarget),g=F.get(r.__renderTarget);P.bindFramebuffer(N.READ_FRAMEBUFFER,h.__webglFramebuffer),P.bindFramebuffer(N.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,F.get(e).__webglTexture,i,d+n),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,F.get(t).__webglTexture,a,m+n)),N.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,N.DEPTH_BUFFER_BIT,N.NEAREST);P.bindFramebuffer(N.READ_FRAMEBUFFER,null),P.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||F.has(e)){let n=F.get(e),r=F.get(t);P.bindFramebuffer(N.READ_FRAMEBUFFER,k),P.bindFramebuffer(N.DRAW_FRAMEBUFFER,A);for(let e=0;e<c;e++)w?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,n.__webglTexture,i),T?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,r.__webglTexture,a),i===0?T?N.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):N.copyTexSubImage2D(v,a,f,p,l,u,o,s):N.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,N.COLOR_BUFFER_BIT,N.NEAREST);P.bindFramebuffer(N.READ_FRAMEBUFFER,null),P.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?N.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?N.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):N.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):N.texSubImage2D(N.TEXTURE_2D,a,f,p,o,s,g,_,h);P.pixelStorei(N.UNPACK_ROW_LENGTH,y),P.pixelStorei(N.UNPACK_IMAGE_HEIGHT,b),P.pixelStorei(N.UNPACK_SKIP_PIXELS,x),P.pixelStorei(N.UNPACK_SKIP_ROWS,S),P.pixelStorei(N.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps===!0&&t.mipmapsAutoUpdate===!0&&N.generateMipmap(v),P.unbindTexture()},this.initRenderTarget=function(e){F.get(e).__webglFramebuffer===void 0&&I.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?I.setTextureCube(e,0):e.isData3DTexture?I.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?I.setTexture2DArray(e,0):I.setTexture2D(e,0),P.unbindTexture()},this.resetState=function(){j=0,ee=0,M=null,P.reset(),nt.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Et}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=tn._getDrawingBufferColorSpace(e),t.unpackColorSpace=tn._getUnpackColorSpace()}};function nu(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new Jr;c.morphTargetsRelative=s;let l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0,p=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let t in d.morphAttributes){if(!i.has(t))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;if(d.morphAttributes[t].length!==e[0].morphAttributes[t].length)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have the same number of morph targets for the "`+t+`" morph attribute.`),null;o[t]===void 0&&(o[t]=[]),o[t].push(d.morphAttributes[t]),p++}if(p!==i.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of morph attributes.`),null;if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=ru(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t!==0){c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=ru(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}}return c}function ru(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new Nr(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}var iu=1.42,au=Math.PI/180,ou={1:{tier:1,name:`Sidearm Pistol`,shortBadge:`Lv1 PISTOL`,pattern:`SINGLE`,fireRate:3.4,damageMultiplier:1,projectileSpeed:29,pierceCount:1,spreadRadians:0,colorHex:6485247,bossArmorFactor:1},2:{tier:2,name:`Tactical SMG`,shortBadge:`Lv2 SMG`,pattern:`SINGLE`,fireRate:6.2,damageMultiplier:1.08,projectileSpeed:33,pierceCount:1,spreadRadians:.8*au,colorHex:4587487,bossArmorFactor:1},3:{tier:3,name:`Assault Rifle`,shortBadge:`Lv3 RIFLE`,pattern:`BURST_2`,fireRate:4.5,damageMultiplier:1.85,projectileSpeed:36,pierceCount:1,spreadRadians:.4*au,colorHex:16769126,bossArmorFactor:1},4:{tier:4,name:`Rotary Minigun`,shortBadge:`Lv4 MINIGUN`,pattern:`TWIN_SPREAD`,fireRate:7.4,damageMultiplier:1.75,projectileSpeed:39,pierceCount:1,spreadRadians:2.6*au,colorHex:16752451,bossArmorFactor:1},5:{tier:5,name:`Plasma Pulse Rifle`,shortBadge:`Lv5 PLASMA`,pattern:`PIERCING`,fireRate:5.2,damageMultiplier:3.15,projectileSpeed:42,pierceCount:2,spreadRadians:0,colorHex:3733247,bossArmorFactor:1.35}};function su(e,t){return t>e?{equippedTier:t,upgraded:!0,lockedBonusTriggered:!1,bonusCoins:0,bonusSquad:0,bannerText:`${ou[t].shortBadge} EQUIPPED!`}:{equippedTier:e,upgraded:!1,lockedBonusTriggered:!0,bonusCoins:25,bonusSquad:1,bannerText:`WEAPON LOCKED: +25 COINS`}}function cu(e){return e<=0?0:e<=5?e:5+(e-5)*.82}function lu(e,t,n,r){if(e<=0)return{visualSoldiers:0,activeEmitters:0,projectilesPerEmitter:0,damagePerProjectile:0,intervalSeconds:1};let i=ou[t],a=Math.min(e,10),o=Math.min(a,10),s=Math.min(a,10),c=i.pattern===`BURST_2`||i.pattern===`TWIN_SPREAD`?2:1,l=5*r*i.damageMultiplier,u=cu(a)/s;return{visualSoldiers:o,activeEmitters:s,projectilesPerEmitter:c,damagePerProjectile:l/c*u,intervalSeconds:1/Math.max(.5,i.fireRate*n)}}function uu(e,t,n=0){e.attributes.normal||e.computeVertexNormals();let r=e.index?e.toNonIndexed():e.clone(),i=r.attributes.normal;for(let e=0;e<i.count;e++){let t=i.getX(e),n=i.getY(e),r=i.getZ(e),a=Math.max(1e-4,Math.hypot(t,n,r));i.setXYZ(e,t/a,n/a,r/a)}let a=r.attributes.position.count,o=new Float32Array(a*3),s=new Float32Array(a),c=new W(t);for(let e=0;e<a;e++)o[e*3]=c.r,o[e*3+1]=c.g,o[e*3+2]=c.b,s[e]=n;return r.setAttribute(`color`,new Nr(o,3)),r.setAttribute(`aSpinPart`,new Nr(s,1)),r.deleteAttribute(`uv`),r}var du=.255,fu=.575;function pu(e){let t=[],n=du,r=2502717,i=8821424,a=1580582;if(e===1){let e=new q(.056,.052,.24);e.translate(n,.565,-.31),t.push(uu(e,a));let o=new q(.062,.056,.26);o.translate(n,.607,-.32),t.push(uu(o,i));let s=new q(.058,.052,.065);s.translate(n,.603,-.47),t.push(uu(s,16103470));let c=new J(.018,.018,.085,8);c.rotateX(Math.PI/2),c.translate(n,.5469999999999999,-.4),t.push(uu(c,16770688));let l=new q(.05,.12,.068);l.rotateX(.22),l.translate(n,.51,-.22),t.push(uu(l,r));let u=new q(.054,.022,.024);u.translate(n,.643,-.21),t.push(uu(u,16767066))}else if(e===2){let e=new q(.072,.095,.38);e.translate(n,.59,-.34),t.push(uu(e,r));let o=new q(.052,.024,.34);o.translate(n,.6469999999999999,-.34),t.push(uu(o,16770669));let s=new q(.064,.054,.085);s.translate(n,.6799999999999999,-.31),t.push(uu(s,i));let c=new J(.028,.028,.2,10);c.rotateX(Math.PI/2),c.translate(n,.593,-.61),t.push(uu(c,i));let l=new q(.044,.2,.062);l.rotateX(-.26),l.translate(n,.46499999999999997,-.39),t.push(uu(l,16103470));let u=new J(.018,.02,.1,8);u.translate(n,.49999999999999994,-.49),t.push(uu(u,a))}else if(e===3){let e=new q(.078,.096,.48);e.translate(n,.597,-.38),t.push(uu(e,3885145));let o=new q(.074,.082,.28);o.translate(n,.595,-.68),t.push(uu(o,14715692));let s=new J(.02,.022,.24,8);s.rotateX(Math.PI/2),s.translate(n,.599,-.89),t.push(uu(s,i));let c=new q(.048,.044,.075);c.translate(n,.599,-1.01),t.push(uu(c,16756290));let l=new J(.032,.028,.17,10);l.rotateX(Math.PI/2),l.translate(n,.6799999999999999,-.36),t.push(uu(l,r));let u=new J(.026,.026,.02,10);u.rotateX(Math.PI/2),u.translate(n,.6799999999999999,-.45),t.push(uu(u,16756290));let d=new q(.048,.19,.082);d.rotateX(-.22),d.translate(n,.47,-.44),t.push(uu(d,r));let f=new q(.068,.11,.19);f.translate(n,.58,-.11),t.push(uu(f,a))}else if(e===4){let e=new J(.095,.1,.3,12);e.rotateX(Math.PI/2),e.translate(n,.5549999999999999,-.32),t.push(uu(e,r));let a=new J(.115,.115,.18,12);a.rotateZ(Math.PI/2),a.translate(.28500000000000003,.43999999999999995,-.34),t.push(uu(a,15100959));let o=new q(.09,.032,.24);o.translate(n,.6749999999999999,-.35),t.push(uu(o,16752451));let s=.5549999999999999;for(let e=0;e<6;e++){let r=e/6*Math.PI*2,a=n+Math.cos(r)*.056,o=s+Math.sin(r)*.056,c=new J(.015,.015,.56,6);c.rotateX(Math.PI/2),c.translate(a,o,-.73),t.push(uu(c,i,1))}for(let e of[-.66,-.94]){let r=new J(.084,.084,.038,12);r.rotateX(Math.PI/2),r.translate(n,s,e),t.push(uu(r,16747576,1))}}else{let e=new q(.092,.115,.48);e.translate(n,.585,-.34),t.push(uu(e,1976632));let r=new q(.068,.036,.54);r.translate(n,.6509999999999999,-.76),t.push(uu(r,i));let a=new q(.068,.034,.5);a.translate(n,.5409999999999999,-.74),t.push(uu(a,i));let o=new q(.044,.048,.56);o.translate(n,.597,-.75),t.push(uu(o,3733247));for(let e of[-.58,-.74,-.9]){let r=new q(.104,.118,.034);r.translate(n,.597,e),t.push(uu(r,7403775))}let s=new J(.042,.042,.18,10);s.rotateX(-.2),s.translate(n,.475,-.4),t.push(uu(s,1692902));let c=new q(.084,.062,.14);c.translate(n,.6829999999999999,-.35),t.push(uu(c,3733247))}let o=nu(t,!1);for(let e of t)e.dispose();return o.translate(-.255,-.5549999999999999,.28),o.scale(1.34,1.34,1.34),o.translate(n,.5549999999999999,-.28),hu(o,`aSpinPart`),o}function mu(e){let t=new U,n=null,r=ou[e].colorHex,i=new Y({color:2502975,roughness:.34,metalness:.48}),a=new Y({color:9413560,roughness:.26,metalness:.5}),o=new Y({color:1448738,roughness:.68,metalness:.14}),s=new Y({color:r,emissive:r,emissiveIntensity:e===5?.65:.28,roughness:.28,metalness:.36}),c=new G({color:r});if(e===1){let e=new K(new q(.66,.15,.12),a);e.position.set(.04,.12,0);let n=new K(new q(.58,.1,.11),i);n.position.set(.01,.01,0);let r=new K(new q(.14,.145,.115),s);r.position.set(.42,.115,0);let l=new K(new J(.032,.032,.1,12),i);l.rotation.z=Math.PI/2,l.position.set(.51,.12,0);let u=new K(new q(.16,.36,.105),o);u.position.set(-.18,-.17,0),u.rotation.z=.24;let d=new K(new q(.18,.05,.115),s);d.position.set(-.23,-.35,0),d.rotation.z=.24;let f=new K(new q(.16,.09,.04),i);f.position.set(-.02,-.08,0);let p=new K(new J(.042,.042,.2,12),i);p.rotation.z=Math.PI/2,p.position.set(.22,-.05,0);let m=new K(new J(.036,.036,.02,12),c);m.rotation.z=Math.PI/2,m.position.set(.325,-.05,0);let h=new K(new q(.04,.045,.04),c);h.position.set(.34,.21,0);let g=new K(new q(.05,.045,.09),s);g.position.set(-.24,.21,0),t.add(e,n,r,l,u,d,f,p,m,h,g)}else if(e===2){let e=new K(new q(.68,.2,.13),i);e.position.set(0,.08,0);let n=new K(new q(.62,.045,.138),s);n.position.set(.01,.14,0);let r=new K(new J(.058,.058,.38,14),a);r.rotation.z=Math.PI/2,r.position.set(.51,.09,0);let l=new K(new q(.2,.11,.11),o);l.position.set(-.02,.23,0);let u=new K(new q(.03,.08,.09),c);u.position.set(.06,.24,0);let d=new K(new q(.14,.3,.1),o);d.position.set(-.16,-.14,0),d.rotation.z=.22;let f=new K(new q(.12,.44,.088),s);f.position.set(.14,-.22,0),f.rotation.z=-.24;let p=new K(new J(.036,.04,.22,10),o);p.position.set(.29,-.12,0);let m=new K(new q(.3,.04,.09),a);m.position.set(-.46,.09,0);let h=new K(new q(.06,.24,.1),o);h.position.set(-.62,.04,0),t.add(e,n,r,l,u,d,f,p,m,h)}else if(e===3){let e=new K(new q(.76,.22,.14),i);e.position.set(-.04,.08,0);let n=new K(new q(.46,.17,.135),s);n.position.set(.48,.09,0);let r=new K(new J(.036,.04,.4,12),a);r.rotation.z=Math.PI/2,r.position.set(.86,.1,0);let l=new K(new q(.13,.09,.09),i);l.position.set(1.06,.1,0);let u=new K(new J(.062,.052,.32,12),o);u.rotation.z=Math.PI/2,u.position.set(-.02,.26,0);let d=new K(new J(.05,.05,.02,12),c);d.rotation.z=Math.PI/2,d.position.set(.145,.26,0);let f=new K(new q(.16,.4,.095),a);f.position.set(.12,-.2,0),f.rotation.z=-.2;let p=new K(new q(.14,.3,.1),o);p.position.set(-.2,-.14,0),p.rotation.z=.24;let m=new K(new q(.42,.23,.12),o);m.position.set(-.6,.05,0);let h=new K(new q(.24,.06,.126),s);h.position.set(-.56,.17,0),t.add(e,n,r,l,u,d,f,p,m,h)}else if(e===4){let e=new K(new J(.2,.21,.52,16),i);e.rotation.z=Math.PI/2,e.position.set(-.26,.02,0);let r=new K(new J(.23,.23,.34,16),s);r.rotation.x=Math.PI/2,r.position.set(-.22,-.24,0);let c=new K(new q(.32,.055,.22),a);c.position.set(-.12,.28,0);let l=new K(new q(.05,.14,.04),o);l.position.set(-.12,.21,.09);let u=new K(new q(.05,.14,.04),o);u.position.set(-.12,.21,-.09);let d=new K(new q(.16,.26,.12),o);d.position.set(-.58,.06,0),d.rotation.z=-.25,n=new U,n.position.set(0,.02,0);let f=new J(.028,.028,.94,8);f.rotateZ(Math.PI/2);for(let e=0;e<6;e++){let t=e/6*Math.PI*2,r=new K(f,a);r.position.set(.47,Math.cos(t)*.115,Math.sin(t)*.115),n.add(r)}for(let e of[.34,.78]){let t=new K(new J(.165,.165,.065,16),s);t.rotation.z=Math.PI/2,t.position.set(e,0,0),n.add(t)}t.add(e,r,c,l,u,d,n)}else{let e=new K(new q(.76,.25,.17),i);e.position.set(-.18,.05,0);let n=new K(new q(.86,.068,.13),a);n.position.set(.54,.15,0);let r=new K(new q(.8,.062,.13),a);r.position.set(.51,-.04,0);let l=new K(new q(.92,.075,.085),c);l.position.set(.48,.055,0);for(let e of[.22,.48,.74]){let n=new K(new Aa(.145,.026,8,18),s);n.rotation.y=Math.PI/2,n.position.set(e,.055,0),t.add(n)}let u=new K(new J(.078,.078,.34,14),s);u.position.set(-.04,-.2,0),u.rotation.z=-.22;let d=new K(new q(.28,.11,.14),i);d.position.set(-.12,.24,0);let f=new K(new q(.18,.055,.15),c);f.position.set(-.12,.24,0);let p=new K(new q(.36,.22,.14),o);p.position.set(-.68,.02,0),t.add(e,n,r,l,u,d,f,p)}return{tier:e,root:t,spinCluster:n}}function hu(e,t){let n=e.attributes.position,r=e.attributes.normal,i=t?e.attributes[t]:void 0,a=n.count,o=new Map,s=Array(a);for(let e=0;e<a;e++){let t=Math.round(n.getX(e)*800),a=Math.round(n.getY(e)*800),c=Math.round(n.getZ(e)*800),l=`${i?Math.round(i.getX(e)*10):0}:${t},${a},${c}`;s[e]=l;let u=r.getX(e),d=r.getY(e),f=r.getZ(e),p=o.get(l);p?(p[0]+=u,p[1]+=d,p[2]+=f):(p=[u,d,f],o.set(l,p))}let c=new Float32Array(a*3);for(let e=0;e<a;e++){let t=o.get(s[e]),n=t[0],i=t[1],a=t[2],l=Math.hypot(n,i,a);l<1e-4&&(n=r.getX(e),i=r.getY(e),a=r.getZ(e),l=Math.max(1e-4,Math.hypot(n,i,a))),c[e*3]=n/l,c[e*3+1]=i/l,c[e*3+2]=a/l}e.setAttribute(`aOutlineNormal`,new Nr(c,3))}function Q(e,t,n=0){e.attributes.normal||e.computeVertexNormals();let r=e.index?e.toNonIndexed():e.clone(),i=r.attributes.normal;for(let e=0;e<i.count;e++){let t=i.getX(e),n=i.getY(e),r=i.getZ(e),a=Math.max(1e-4,Math.hypot(t,n,r));i.setXYZ(e,t/a,n/a,r/a)}let a=r.attributes.position.count,o=new Float32Array(a*3),s=new Float32Array(a),c=new W(t);for(let e=0;e<a;e++)o[e*3]=c.r,o[e*3+1]=c.g,o[e*3+2]=c.b,s[e]=n;return r.setAttribute(`color`,new Nr(o,3)),r.setAttribute(`aPartId`,new Nr(s,1)),r.deleteAttribute(`uv`),r}function gu(){let e=[],t=9479608,n=1474800,r=1647150,i=15776402;for(let[t,i]of[[-1,1],[1,2]]){let a=t*.096,o=new qi(.064,.135,8,14);o.translate(a,.3,0),e.push(Q(o,n,i));let s=new qi(.054,.125,8,14);s.translate(a,.135,.008),e.push(Q(s,n,i));let c=new qi(.056,.09,8,12);c.rotateX(Math.PI/2),c.scale(1.04,.84,1.08),c.translate(a,.046,-.032),e.push(Q(c,r,i))}let a=new J(.142,.128,.105,16);a.scale(1.1,1,.84),a.translate(0,.4,0),e.push(Q(a,n,0));let o=new J(.149,.146,.044,16);o.scale(1.11,1,.86),o.translate(0,.432,0),e.push(Q(o,r,0));let s=new J(.178,.14,.33,18);s.scale(1.12,1,.84),s.translate(0,.565,0),e.push(Q(s,t,0));let c=new ka(.176,18,12);c.scale(1.16,.46,.82),c.translate(0,.695,0),e.push(Q(c,t,0));let l=new q(.24,.2,.06);l.translate(0,.575,-.115),e.push(Q(l,6058373,0));for(let t of[-.088,.088]){let n=new q(.036,.25,.195);n.translate(t,.595,0),e.push(Q(n,r,0))}let u=new q(.06,.09,.042);u.translate(-.088,.56,.105),e.push(Q(u,16764758,0));let d=new J(.072,.082,.09,14);d.translate(0,.745,-.008),e.push(Q(d,i,0));let f=new ka(.142,20,16);f.scale(.98,1.02,.98),f.translate(0,.855,-.012),e.push(Q(f,i,0));let p=new ka(.18,24,18,0,Math.PI*2,0,Math.PI*.6);p.scale(1.04,.98,1.07),p.rotateX(-.08),p.translate(0,.885,-.006),e.push(Q(p,1742591,0));let m=new Aa(.172,.024,12,24);m.rotateX(Math.PI/2-.08),m.translate(0,.85,-.008),e.push(Q(m,1010390,0));let h=new qi(.026,.14,6,10);h.rotateZ(Math.PI/2),h.translate(0,.865,-.155),e.push(Q(h,7273471,0));let g=new qi(.052,.125,8,12);g.rotateZ(.32),g.rotateX(.48),g.translate(.215,.61,-.05),e.push(Q(g,t,4));let _=new qi(.046,.135,8,12);_.rotateX(1.28),_.rotateY(-.08),_.translate(.255,.555,-.165),e.push(Q(_,t,4));let v=new ka(.052,12,10);v.translate(.255,.55,-.245),e.push(Q(v,r,4));let y=new qi(.05,.135,8,12);y.rotateX(.82),y.rotateZ(-.55),y.translate(-.145,.6,-.095),e.push(Q(y,t,4));let b=new qi(.044,.19,8,12);b.rotateX(1.38),b.rotateZ(-.95),b.translate(.075,.56,-.285),e.push(Q(b,t,4));let x=new ka(.05,12,10);x.translate(.235,.56,-.405),e.push(Q(x,r,4));let S=nu(e,!1);for(let t of e)t.dispose();return hu(S,`aPartId`),S}function _u(){let e=[],t=15740486,n=12852789,r=15259068,i=15447184;for(let[n,r]of[[-1,1],[1,2]]){let i=n*.098,a=new qi(.064,.13,8,12);a.translate(i,.3,0),e.push(Q(a,t,r));let o=new qi(.054,.12,8,12);o.translate(i,.13,-.008),e.push(Q(o,t,r));let s=new qi(.054,.085,8,10);s.rotateX(Math.PI/2),s.scale(1.04,.84,1.08),s.translate(i,.044,.032),e.push(Q(s,1909550,r))}let a=new J(.146,.132,.11,14);a.scale(1.14,1,.85),a.translate(0,.4,0),e.push(Q(a,n,0));let o=new J(.186,.142,.33,16);o.scale(1.16,1,.85),o.translate(0,.56,0),e.push(Q(o,r,0));let s=new ka(.18,16,10);s.scale(1.16,.45,.82),s.translate(0,.685,0),e.push(Q(s,r,0));let c=new q(.24,.18,.06);c.translate(0,.56,.115),e.push(Q(c,n,0));let l=new J(.072,.084,.09,12);l.translate(0,.75,.01),e.push(Q(l,i,0));let u=new ka(.136,18,14);u.translate(0,.855,.015),e.push(Q(u,i,0));let d=new ka(.174,20,14,0,Math.PI*2,0,Math.PI*.62);d.scale(1.04,.98,1.08),d.translate(0,.882,0),e.push(Q(d,t,0));let f=new qi(.025,.13,6,10);f.rotateZ(Math.PI/2),f.translate(0,.865,.148),e.push(Q(f,16741762,0));let p=new qi(.05,.18,8,10);p.rotateX(-.95),p.translate(.185,.56,.13),e.push(Q(p,i,4));let m=new qi(.048,.18,8,10);m.rotateX(-1.05),m.rotateZ(.38),m.translate(-.14,.56,.16),e.push(Q(m,i,4));let h=new q(.068,.088,.42);h.translate(.1,.55,.3),e.push(Q(h,3687250,4));let g=nu(e,!1);for(let t of e)t.dispose();return hu(g,`aPartId`),g}function vu(){let e=[],t=6791480,n=4550692,r=15085122,i=16099882,a=1712169,o=4016214;for(let[i,o]of[[-1,1],[1,2]]){let s=i*.135,c=new qi(.088,.14,8,12);c.translate(s,.31,0),e.push(Q(c,n,o));let l=new ka(.072,10,8);l.scale(1,.85,.85),l.translate(s,.21,.062),e.push(Q(l,r,o));let u=new qi(.078,.13,8,12);u.translate(s,.13,0),e.push(Q(u,t,o));let d=new qi(.074,.11,8,10);d.rotateX(Math.PI/2),d.scale(1.06,.82,1.08),d.translate(s,.048,.04),e.push(Q(d,a,o))}let s=new J(.2,.18,.13,14);s.scale(1.16,1,.88),s.translate(0,.41,0),e.push(Q(s,a,0));let c=new J(.26,.19,.38,16);c.scale(1.25,1,.92),c.translate(0,.59,0),e.push(Q(c,t,0));let l=new q(.4,.26,.22);l.translate(0,.6,.045),e.push(Q(l,n,0));let u=new q(.23,.11,.04);u.translate(0,.61,.162),e.push(Q(u,i,0));for(let n of[-1,1]){let r=new ka(.152,16,12);r.scale(1.12,.92,1.15),r.translate(n*.31,.7,.02),e.push(Q(r,t,0));let a=new Aa(.13,.028,8,16,Math.PI);a.rotateZ(-n*.25),a.translate(n*.315,.73,.02),e.push(Q(a,i,0))}let d=new J(.17,.2,.09,14);d.translate(0,.79,.02),e.push(Q(d,o,0));let f=new ka(.155,16,12);f.translate(0,.89,.03),e.push(Q(f,t,0));let p=new ka(.198,20,14,0,Math.PI*2,0,Math.PI*.62);p.scale(1.08,.96,1.12),p.translate(0,.915,.02),e.push(Q(p,r,0));let m=new qi(.032,.16,6,10);m.rotateZ(Math.PI/2),m.translate(0,.89,.185),e.push(Q(m,16760379,0));for(let n of[-1,1]){let r=new qi(.072,.2,8,12);r.rotateX(-.92),r.rotateZ(-n*.22),r.translate(n*.25,.56,.16),e.push(Q(r,t,4))}let h=new q(.16,.13,.5);h.translate(0,.5,.34),e.push(Q(h,o,4));for(let t of[-.04,.04]){let n=new J(.024,.024,.26,10);n.rotateX(Math.PI/2),n.translate(t,.51,.65),e.push(Q(n,i,4))}let g=nu(e,!1);for(let t of e)t.dispose();return hu(g,`aPartId`),g}function yu(){let e=[],t=new ka(.096,12,10);t.scale(.92,.92,1.38),t.translate(0,0,-.24),e.push(Q(t,16777215,0));let n=new Yi(.088,.72,10);n.rotateX(Math.PI/2),n.translate(0,0,.15),e.push(Q(n,14220031,0));let r=new Yi(.148,.9,10);r.rotateX(Math.PI/2),r.translate(0,0,.11),e.push(Q(r,5687528,0));let i=nu(e,!1);for(let t of e)t.dispose();return i.deleteAttribute(`aPartId`),i}function bu(){let e=new U,t=new Y({color:16764459,emissive:8410112,roughness:.24,metalness:.36}),n=new Y({color:16770170,emissive:9396224,roughness:.2,metalness:.4}),r=new G({color:1446152,side:1}),i=new J(.6,.6,.22,26);i.rotateX(Math.PI/2),e.add(new K(i,t));let a=new J(.66,.66,.28,26);a.rotateX(Math.PI/2),e.add(new K(a,r));let o=new K(new Aa(.54,.075,10,26),n);o.position.z=.065,e.add(o);let s=new K(new Aa(.54,.075,10,26),n);s.position.z=-.065,e.add(s);let c=new K(new q(.11,.56,.28),n),l=new K(new q(.34,.1,.27),n);l.position.y=.14;let u=new K(new q(.34,.1,.27),n);return u.position.y=-.14,e.add(c,l,u),e}function xu(){let e=new U,t=new Y({color:1742591,emissive:671098,roughness:.28,metalness:.24}),n=new G({color:7404543}),r=new G({color:856860,side:1}),i=new K(new ka(.45,22,16,0,Math.PI*2,0,Math.PI*.62),t);i.position.y=.05,e.add(i);let a=new K(new ka(.5,22,16,0,Math.PI*2,0,Math.PI*.64),r);a.position.y=.05,e.add(a);let o=new K(new qi(.07,.34,6,10),n);return o.rotation.z=Math.PI/2,o.position.set(0,-.02,.37),e.add(o),e}function Su(){let e=new U,t=new Y({color:14722612,metalness:.45,roughness:.28}),n=new Y({color:3884628,metalness:.48,roughness:.32}),r=new Y({color:14871282,metalness:.52,roughness:.2}),i=new G({color:16726832}),a=new K(new q(.66,.54,.26),n),o=new K(new q(.54,.42,.28),t);e.add(a,o);let s=new K(new Aa(.2,.062,10,18,Math.PI),r);s.position.set(0,.26,0),e.add(s);let c=new K(new J(.085,.085,.3,10),n);c.rotateX(Math.PI/2),c.position.set(0,-.02,0),e.add(c);let l=new K(new ka(.045,8,8),i);return l.position.set(0,.11,.15),e.add(l),e}function Cu(){let e=new G({color:527378,side:1});return e.customProgramCacheKey=()=>`boss-cel-outline-v41`,e.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
        attribute vec3 aOutlineNormal;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
        transformed += aOutlineNormal * 0.032;`)},e}var wu=Cu();function Tu(e){let t=[];e.traverse(e=>{e instanceof K&&e.material instanceof Y&&!e.userData.isBossOutline&&t.push(e)});for(let e=0;e<t.length;e++){let n=t[e],r=n.geometry;r.attributes.aOutlineNormal||(r.attributes.normal||r.computeVertexNormals(),hu(r));let i=new K(r,wu);i.userData.isBossOutline=!0,n.add(i)}}function Eu(e,t,n){let r=new Y({color:e,roughness:.34,metalness:.36,emissive:0}),i=new Y({color:t,roughness:.3,metalness:.32,emissive:0}),a=new Y({color:n,roughness:.26,metalness:.42,emissive:0}),o=new Y({color:2502717,roughness:.42,metalness:.38,emissive:0});return{primaryMat:r,accentMat:i,trimMat:a,darkSteelMat:o,glowMat:new G({color:n}),flashMaterials:[r,i,a,o]}}function Du(e,t=2.45){let n=new K(new Ji(t,28),new G({color:329741,transparent:!0,opacity:.56,depthWrite:!1}));n.rotation.x=-Math.PI/2,n.position.y=.03,e.add(n);let r=new K(new Oa(t-.38,t,36),new G({color:16726862,transparent:!0,opacity:.46,side:2,depthWrite:!1}));return r.rotation.x=-Math.PI/2,r.position.y=.045,e.add(r),r}function Ou(){let e=Eu(3687250,13183550,16102446),t=new U,n=Du(t,2.35),r=t=>{let n=new U;n.position.set(t*.72,1.52,0);let r=new K(new J(.24,.24,.34,12),e.darkSteelMat);r.rotation.z=Math.PI/2,n.add(r);let i=new K(new qi(.22,.48,6,12),e.primaryMat);i.position.set(0,-.34,.08),i.rotation.x=-.22,n.add(i);let a=new K(new q(.46,.34,.44),e.accentMat);a.position.set(0,-.68,.22),n.add(a);let o=new K(new J(.2,.28,.68,10),e.darkSteelMat);o.position.set(0,-1.04,.04),o.rotation.x=.16,n.add(o);let s=new K(new q(.68,.24,1.02),e.primaryMat);s.position.set(0,-1.4,.16);let c=new K(new q(.72,.16,.32),e.trimMat);return c.position.set(0,-1.44,.64),n.add(s,c),n},i=r(-1),a=r(1);t.add(i,a);let o=new U;o.position.set(0,1.58,0);let s=new K(new J(.72,.56,.44,8),e.darkSteelMat);s.position.set(0,.04,0),o.add(s);let c=new K(new J(1.06,.78,1.24,8),e.primaryMat);c.scale.set(1.18,1,.88),c.position.set(0,.82,0),o.add(c);let l=new K(new q(1.42,.58,.96),e.accentMat);l.position.set(0,.92,.38),l.rotation.x=.12,o.add(l);let u=new K(new q(1.14,.18,.14),e.glowMat);u.position.set(0,.98,.85),o.add(u);let d=new K(new J(.28,.28,.16,16),e.glowMat);d.rotation.x=Math.PI/2,d.position.set(0,.52,.78);let f=new K(new Aa(.32,.055,8,20),e.trimMat);f.position.set(0,.52,.82),o.add(d,f);let p=[];for(let t of[-1,1]){let n=new K(new q(.68,.56,.74),e.primaryMat);n.position.set(t*1.18,1.54,-.05),n.rotation.z=-t*.12;let r=new K(new q(.56,.42,.08),e.darkSteelMat);r.position.set(t*1.18,1.54,.34),o.add(n,r);for(let n=0;n<2;n++)for(let r=0;r<3;r++){let i=new K(new ka(.068,8,6),e.trimMat);i.position.set(t*1.18+(r-1)*.16,1.46+n*.17,.39),o.add(i)}let i=new U;i.position.set(t*1.48,.78,.2);let a=new K(new ka(.42,12,10),e.accentMat);a.scale.set(1.1,.9,1.2),i.add(a);let s=new K(new J(.26,.28,.58,12),e.darkSteelMat);s.rotation.x=Math.PI/2,s.position.set(0,-.22,.32),i.add(s);let c=new U;c.position.set(0,-.22,.62);let l=new J(.042,.042,1.08,8);l.rotateX(Math.PI/2);for(let t=0;t<6;t++){let n=t/6*Math.PI*2,r=new K(l,e.trimMat);r.position.set(Math.cos(n)*.14,Math.sin(n)*.14,.44),c.add(r)}let u=new K(new J(.2,.2,.08,14),e.accentMat);u.rotation.x=Math.PI/2,u.position.set(0,0,.76),c.add(u),i.add(c),p.push(c),o.add(i)}return t.add(o),Tu(t),{chassis:`WARDEN_MECH`,root:t,bodyGroup:o,turretGroup:null,leftLeg:i,rightLeg:a,spiderLegs:null,spinClusters:p,recoilBarrels:[],meleeArm:null,wingPylons:null,hazardRing:n,...e}}function ku(){let e=Eu(8002600,2370357,16758311),t=new U,n=Du(t,2.75),r=new U;r.position.set(0,.55,0);for(let t of[-1,1]){let n=new U;n.position.set(t*1.32,0,0);let i=new K(new q(.72,.88,3.35),e.darkSteelMat);n.add(i);let a=new K(new q(.16,.54,3.1),e.primaryMat);a.position.set(t*.34,.12,0),n.add(a);for(let t=0;t<5;t++){let r=new K(new J(.32,.32,.78,12),e.trimMat);r.rotation.z=Math.PI/2,r.position.set(0,-.14,-1.24+t*.62),n.add(r)}r.add(n)}let i=new K(new q(2.15,.82,3.05),e.primaryMat);i.position.set(0,.28,-.05),r.add(i);for(let t of[-1,1]){let n=new K(new q(1.58,.78,.24),e.accentMat);n.position.set(t*.72,-.06,1.72),n.rotation.y=-t*.26,n.rotation.x=.22;let i=new K(new q(1.56,.14,.28),e.trimMat);i.position.set(t*.72,-.38,1.8),i.rotation.y=-t*.26,r.add(n,i)}for(let t of[-1,1]){let n=new K(new J(.12,.12,.08,12),e.glowMat);n.rotation.x=Math.PI/2,n.position.set(t*.78,.56,1.48),r.add(n)}let a=new U;a.position.set(0,.92,-.15);let o=new K(new J(1.12,1.28,.68,8),e.primaryMat);o.scale.set(1.05,1,1.22),a.add(o);let s=new K(new q(1.92,.52,1.24),e.accentMat);s.position.set(0,.04,.18),a.add(s);let c=new K(new q(.76,.14,.12),e.glowMat);c.position.set(0,.28,.82),a.add(c);let l=[];for(let t of[-1,1]){let n=new U;n.position.set(t*.42,.06,.76);let r=new K(new q(.34,.34,.44),e.darkSteelMat),i=new K(new J(.12,.15,2.05,12),e.darkSteelMat);i.rotation.x=Math.PI/2,i.position.set(0,0,1.05);let o=new K(new q(.32,.28,.38),e.trimMat);o.position.set(0,0,2.08),n.add(r,i,o),l.push(n),a.add(n)}let u=new U;u.position.set(.48,.56,-.12);let d=new J(.028,.028,.78,6);d.rotateX(Math.PI/2);for(let t=0;t<6;t++){let n=t/6*Math.PI*2,r=new K(d,e.trimMat);r.position.set(Math.cos(n)*.08,Math.sin(n)*.08,.38),u.add(r)}return a.add(u),r.add(a),t.add(r),Tu(t),{chassis:`SIEGE_TANK`,root:t,bodyGroup:r,turretGroup:a,leftLeg:null,rightLeg:null,spiderLegs:null,spinClusters:[u],recoilBarrels:l,meleeArm:null,wingPylons:null,hazardRing:n,...e}}function Au(){let e=Eu(1910326,15215695,3733247),t=new U,n=Du(t,2.85),r=(t,n,r)=>{let i=new U;i.position.set(t*.95,1.36,n*.78),i.rotation.y=r;let a=new K(new ka(.28,10,8),e.accentMat);i.add(a);let o=new K(new J(.16,.2,1.25,10),e.primaryMat);o.position.set(t*.56,.34,0),o.rotation.z=-t*1.05,i.add(o);let s=new K(new ka(.24,10,8),e.trimMat);s.position.set(t*1.12,.64,0),i.add(s);let c=new K(new Yi(.2,2.15,8),e.darkSteelMat);c.rotation.x=Math.PI,c.rotation.z=t*.16,c.position.set(t*1.32,-.36,0),i.add(c);let l=new K(new J(.22,.08,.22,8),e.accentMat);return l.position.set(t*1.48,-1.28,0),i.add(l),i},i=r(-1,1,.48),a=r(1,1,-.48),o=r(-1,-1,-.48),s=r(1,-1,.48);t.add(i,a,o,s);let c=new U;c.position.set(0,1.48,0);let l=new K(new J(1.28,.92,.64,10),e.darkSteelMat);c.add(l);let u=new K(new ka(1.32,18,12,0,Math.PI*2,0,Math.PI*.58),e.primaryMat);u.scale.set(1.12,.88,1.24),u.position.set(0,.22,-.08),c.add(u);let d=new K(new q(.44,.36,1.85),e.accentMat);d.position.set(0,1.06,-.15),c.add(d);for(let t=-2;t<=2;t++){let n=new K(new ka(t===0?.22:.13,10,8),e.glowMat);n.position.set(t*.34,.56-Math.abs(t)*.06,1.34-Math.abs(t)*.14),c.add(n)}let f=[];for(let t of[-1,1]){let n=new U;n.position.set(t*.66,-.22,.75);let r=new K(new q(.38,.34,.86),e.accentMat),i=new K(new J(.11,.14,1.15,10),e.trimMat);i.rotation.x=Math.PI/2,i.position.set(0,0,.72);let a=new K(new Aa(.15,.04,8,14),e.glowMat);a.position.set(0,0,1.26),n.add(r,i,a),f.push(n),c.add(n)}let p=new U;p.position.set(0,-.34,0);let m=new K(new Aa(.56,.08,8,18),e.trimMat);return m.rotation.x=Math.PI/2,p.add(m),c.add(p),t.add(c),Tu(t),{chassis:`KRAKEN_WALKER`,root:t,bodyGroup:c,turretGroup:null,leftLeg:null,rightLeg:null,spiderLegs:[i,a,o,s],spinClusters:[p],recoilBarrels:f,meleeArm:null,wingPylons:null,hazardRing:n,...e}}function ju(){let e=Eu(2890281,16102446,3733247),t=new U,n=Du(t,2.75),r=t=>{let n=new U;n.position.set(t*.78,1.72,0);let r=new K(new q(.56,.86,.62),e.primaryMat);r.position.set(0,-.4,0);let i=new K(new J(.28,.38,.92,8),e.darkSteelMat);i.position.set(0,-1.16,.06);let a=new K(new Yi(.22,.52,6),e.accentMat);a.rotation.x=Math.PI/3,a.position.set(0,-.78,.42);let o=new K(new q(.74,.28,1.08),e.accentMat);return o.position.set(0,-1.58,.18),n.add(r,i,a,o),n},i=r(-1),a=r(1);t.add(i,a);let o=new U;o.position.set(0,1.78,0);let s=new K(new J(.78,.64,.54,8),e.darkSteelMat),c=new K(new J(1.32,.84,1.38,8),e.primaryMat);c.scale.set(1.18,1,.88),c.position.set(0,.88,0),o.add(s,c);let l=new K(new q(1.44,.86,.38),e.accentMat);l.position.set(0,.96,.56);let u=new K(new q(1.12,.24,.72),e.trimMat);u.position.set(0,1.54,.14);let d=new K(new Aa(.34,.065,8,18),e.darkSteelMat);d.position.set(0,.96,.75);let f=new K(new ka(.28,14,12),e.glowMat);f.position.set(0,.96,.76),o.add(l,u,d,f);let p=new K(new ka(.48,12,10),e.primaryMat);p.scale.set(.96,1.05,1.08),p.position.set(0,1.94,.1);let m=new K(new q(.76,.44,.64),e.darkSteelMat);m.position.set(0,1.82,.16);let h=new K(new q(.68,.15,.14),e.glowMat);h.position.set(0,1.9,.48);let g=new K(new Ea(.14,0),e.glowMat);g.position.set(0,2.12,.5),o.add(p,m,h,g);for(let t of[-1,1]){let n=new K(new q(.82,.14,.08),e.accentMat);n.position.set(t*.44,2.3,.42),n.rotation.z=t*.52,n.rotation.y=-t*.18;let r=new K(new Yi(.12,.72,6),e.trimMat);r.position.set(t*.36,2.28,-.06),r.rotation.z=-t*.36,r.rotation.x=-.24,o.add(n,r)}let _=t=>{let n=new U;n.position.set(t*.76,1.38,-.46),n.rotation.z=-t*.32,n.rotation.y=-t*.22;let r=new K(new q(.46,.62,.38),e.darkSteelMat);n.add(r);for(let r=0;r<3;r++){let i=1.85-r*.28,a=.46-r*.36,o=t*(.28-r*.22),s=new K(new q(i,.24,.12),e.primaryMat);s.position.set(t*(.35+i*.45),a,0),s.rotation.z=o;let c=new K(new q(i*.92,.1,.15),e.glowMat);c.position.set(t*(.42+i*.45),a-.1,.02),c.rotation.z=o,n.add(s,c)}return n},v=_(-1),y=_(1);o.add(v,y);let b=new U;b.position.set(-1.58,1.04,.18);let x=new K(new q(.78,.56,.86),e.primaryMat);x.rotation.z=.28,x.position.set(-.06,.24,0);let S=new K(new q(.84,.14,.9),e.accentMat);S.rotation.z=.28,S.position.set(-.06,.46,0),b.add(x,S);let C=new U;C.position.set(0,-.26,.46);let w=new J(.058,.058,1.38,8);w.rotateX(Math.PI/2);for(let t=0;t<6;t++){let n=t/6*Math.PI*2,r=new K(w,e.trimMat);r.position.set(Math.cos(n)*.17,Math.sin(n)*.17,.52),C.add(r)}let T=new K(new J(.24,.24,.12,12),e.accentMat);T.rotation.x=Math.PI/2,T.position.set(0,0,.95),C.add(T),b.add(C),o.add(b);let E=new U;E.position.set(1.58,1.06,.18);let D=new K(new q(.78,.56,.86),e.primaryMat);D.rotation.z=-.28,D.position.set(.06,.24,0);let O=new K(new q(.84,.14,.9),e.accentMat);O.rotation.z=-.28,O.position.set(.06,.46,0);let k=new K(new q(.44,.48,.74),e.darkSteelMat);k.position.set(0,-.24,.28);let A=new U;A.position.set(0,-.18,.62),A.rotation.x=.52;let j=new K(new J(.062,.062,2.85,10),e.accentMat);j.position.set(0,.35,0);let ee=new K(new q(.24,.32,.3),e.darkSteelMat);ee.position.set(0,1.48,0);let M=new K(new Yi(.18,.95,4),e.glowMat);M.scale.set(.45,1,1.35),M.position.set(0,2.08,.04);let te=new K(new Yi(.15,.72,4),e.glowMat);return te.scale.set(.42,1,1.25),te.rotation.x=1.15,te.position.set(0,1.62,.38),A.add(j,ee,M,te),E.add(D,O,k,A),o.add(E),t.add(o),Tu(t),{chassis:`SOVEREIGN_TITAN`,root:t,bodyGroup:o,turretGroup:null,leftLeg:i,rightLeg:a,spiderLegs:null,spinClusters:[C],recoilBarrels:[],meleeArm:E,wingPylons:[v,y],hazardRing:n,...e}}function Mu(){return{WARDEN_MECH:Ou(),SIEGE_TANK:ku(),KRAKEN_WALKER:Au(),SOVEREIGN_TITAN:ju()}}var Nu=[-3.1,0,3.1],Pu=.95,Fu=25,Iu=8,Lu=[[!0,!1,!1],[!1,!0,!1],[!1,!1,!0]],Ru=[[[!0,!0,!1],[!0,!1,!0]],[[!0,!0,!1],[!1,!0,!0]],[[!1,!0,!0],[!0,!1,!0]]];function zu(e,t,n){let r=e<-1.15?0:e>1.15?2:1;if(t===1)return Lu[r];let i=Math.abs(Math.floor(n))%2;return Ru[r][i]}function Bu(){let e=document.createElement(`canvas`);e.width=128,e.height=128;let t=e.getContext(`2d`);t.clearRect(0,0,128,128),t.fillStyle=`rgba(255, 36, 66, 0.34)`,t.fillRect(0,0,128,128),t.fillStyle=`rgba(255, 196, 72, 0.88)`;for(let e of[26,90])t.beginPath(),t.moveTo(14,e-18),t.lineTo(64,e+16),t.lineTo(114,e-18),t.lineTo(114,e+4),t.lineTo(64,e+38),t.lineTo(14,e+4),t.closePath(),t.fill();let n=new Ui(e);return n.wrapS=ne,n.wrapT=te,n.colorSpace=yt,n}var Vu=class{entityId=999;rigs;activeChassis=`WARDEN_MECH`;active=!1;defeated=!1;name=`Iron Warden Mk-I`;maxHp=1100;currentHp=1100;segments=5;advanceSpeed=1.25;salvoLanes=1;salvoInterval=2.5;salvoDamage=5;rewardCoins=75;x=0;z=-280;walkPhase=0;lastFootstepCycle=0;hitFlash=0;hitFlashCooldown=0;slamTimer=0;barrelSpin=0;laneVisuals=[];chevronTex;warheads=[];lockedLaneMask=[!1,!1,!1];telegraphTimer=0;salvoCooldown=.85;salvoCycleIndex=0;lastStepTriggeredShake=!1;lastStepSlamDamage=0;lastStepSalvoWarning=!1;lastStepSalvoLaunched=!1;lastStepSalvoHitDamage=0;lastStepSalvoHitX=0;lastStepSalvoDodgedCount=0;lastStepSalvoDodgeX=0;lastStepSegmentBroken=!1;constructor(e){this.rigs=Mu();for(let t of Object.keys(this.rigs))this.rigs[t].root.visible=!1,e.add(this.rigs[t].root);this.chevronTex=Bu();let t=new Da(2.44,1);t.rotateX(-Math.PI/2);let n=new Da(.16,1);n.rotateX(-Math.PI/2);let r=new Oa(.55,1.08,24);r.rotateX(-Math.PI/2);for(let i=0;i<3;i++){let i=new U;i.visible=!1;let a=new G({color:16777215,map:this.chevronTex,transparent:!0,opacity:.56,blending:2,side:2,depthWrite:!1}),o=new G({color:16752430,transparent:!0,opacity:.78,blending:2,side:2,depthWrite:!1}),s=new G({color:16729943,transparent:!0,opacity:.85,blending:2,side:2,depthWrite:!1}),c=new U,l=new K(t,a),u=new K(n,o);u.position.x=-1.22;let d=new K(n,o);d.position.x=1.22,c.add(l,u,d);let f=new K(r,s);i.add(c,f),e.add(i),this.laneVisuals.push({root:i,carpetGroup:c,carpetMat:a,railMat:o,reticleRing:f,reticleMat:s})}let i=new Ea(.42,1),a=new G({color:16768894}),o=new Ea(.62,0),s=new G({color:16723532,transparent:!0,opacity:.72,blending:2,depthWrite:!1}),c=new Yi(.46,2.1,10);c.rotateX(-Math.PI/2);let l=new G({color:16735787,transparent:!0,opacity:.65,blending:2,depthWrite:!1}),u=new Oa(.32,.92,18);u.rotateX(-Math.PI/2);let d=new G({color:16726092,transparent:!0,opacity:.62,blending:2,side:2,depthWrite:!1});for(let t=0;t<Iu;t++){let t=new U;t.visible=!1;let n=new K(i,a);n.position.y=.92;let r=new K(o,s);r.position.y=.92,n.add(r);let f=new K(c,l);f.position.set(0,.92,-1.05);let p=new K(u,d);p.position.set(0,.05,0),t.add(n,f,p),e.add(t),this.warheads.push({root:t,coreMesh:n,active:!1,laneIndex:1,x:0,z:0,damage:5})}}get activeRig(){return this.rigs[this.activeChassis]}get isTelegraphingSalvo(){return this.telegraphTimer>0}configure(e,t){this.active=!0,this.defeated=!1,this.name=e.name,this.activeChassis=e.chassis,this.maxHp=e.maxHp,this.currentHp=e.maxHp,this.segments=e.segments,this.advanceSpeed=e.advanceSpeed,this.salvoLanes=e.salvoLanes,this.salvoInterval=e.salvoInterval,this.salvoDamage=e.salvoDamage,this.rewardCoins=e.rewardCoins,this.x=0,this.z=-t-16.5,this.walkPhase=0,this.lastFootstepCycle=0,this.hitFlash=0,this.hitFlashCooldown=0,this.slamTimer=0,this.barrelSpin=0,this.clearSalvoVisuals(),this.salvoCooldown=.85,this.salvoCycleIndex=0;for(let t of Object.keys(this.rigs)){let n=this.rigs[t],r=t===e.chassis;n.root.visible=r,r&&(n.primaryMat.color.setHex(e.primaryHex),n.accentMat.color.setHex(e.accentHex),n.trimMat.color.setHex(e.trimHex),n.glowMat.color.setHex(e.trimHex),n.bodyGroup.rotation.set(0,0,0),n.leftLeg&&n.leftLeg.rotation.set(0,0,0),n.rightLeg&&n.rightLeg.rotation.set(0,0,0),n.turretGroup&&n.turretGroup.rotation.set(0,0,0),n.meleeArm&&n.meleeArm.rotation.set(0,0,0),n.root.position.set(this.x,0,this.z))}this.applyFlash(0)}clearSalvoVisuals(){this.telegraphTimer=0,this.lockedLaneMask=[!1,!1,!1];for(let e=0;e<3;e++)this.laneVisuals[e].root.visible=!1;for(let e=0;e<Iu;e++)this.warheads[e].active=!1,this.warheads[e].root.visible=!1}hide(){this.active=!1,this.clearSalvoVisuals();for(let e of Object.keys(this.rigs))this.rigs[e].root.visible=!1}applyFlash(e){let t=this.activeRig,n=e*.14,r=e*.3;t.primaryMat.emissive.setRGB(n,n*.65,n*.45),t.darkSteelMat.emissive.setRGB(n*.6,n*.4,n*.3),t.accentMat.emissive.setRGB(r,r*.62,r*.25),t.trimMat.emissive.setRGB(r,r*.72,r*.35)}update(e,t,n,r,i){if(this.lastStepTriggeredShake=!1,this.lastStepSlamDamage=0,this.lastStepSalvoWarning=!1,this.lastStepSalvoLaunched=!1,this.lastStepSalvoHitDamage=0,this.lastStepSalvoDodgedCount=0,!this.active||this.defeated)return;let a=this.activeRig;this.hitFlashCooldown>0&&(this.hitFlashCooldown=Math.max(0,this.hitFlashCooldown-e)),this.hitFlash>0&&(this.hitFlash=Math.max(0,this.hitFlash-e*16),this.applyFlash(this.hitFlash));let o=this.telegraphTimer>0?30:t?18.5:3.5;this.barrelSpin+=e*o;for(let e=0;e<a.spinClusters.length;e++){let t=e%2==0?1:-1;this.activeChassis===`KRAKEN_WALKER`?a.spinClusters[e].rotation.y=this.barrelSpin*.5:a.spinClusters[e].rotation.z=this.barrelSpin*t}let s=1+Math.sin(this.barrelSpin*.32)*.06;a.hazardRing.scale.set(s,s,1);let c=this.activeChassis===`SIEGE_TANK`?.55:this.activeChassis===`KRAKEN_WALKER`?1.48:this.activeChassis===`SOVEREIGN_TITAN`?1.78:1.58;if(!t){if(this.walkPhase+=e*2.2,a.bodyGroup.position.y=c+Math.sin(this.walkPhase)*.05,a.bodyGroup.rotation.x=0,a.wingPylons){let e=Math.sin(this.walkPhase*.9)*.06;a.wingPylons[0].rotation.z=.42+e,a.wingPylons[1].rotation.z=-.42-e}return}let l=r-2.35;if(this.z<l){this.z=Math.min(l,this.z+this.advanceSpeed*e);let t=Math.max(-1.55,Math.min(1.55,n*.55))-this.x;this.x+=Math.sign(t)*Math.min(Math.abs(t),1.25*e);let r=this.activeChassis===`KRAKEN_WALKER`?6.6:4.6;this.walkPhase+=e*r;let i=Math.floor(this.walkPhase/Math.PI);i!==this.lastFootstepCycle&&(this.lastFootstepCycle=i,this.lastStepTriggeredShake=!0),this.animateChassisAdvance(a,c,n)}else i>0&&(this.slamTimer-=e,this.slamTimer<=0&&(this.slamTimer=.22,this.lastStepTriggeredShake=!0,this.lastStepSlamDamage=Math.max(2,Math.ceil(i*.28))),a.bodyGroup.position.y=c+Math.sin(this.slamTimer*30)*.18,a.bodyGroup.rotation.x=.15+Math.sin(this.slamTimer*30)*.09,a.meleeArm&&(a.meleeArm.rotation.x=.55+Math.sin(this.slamTimer*30)*.65));a.root.position.set(this.x,0,this.z),this.updateSalvoAttacks(e,n,r,i)}updateSalvoAttacks(e,t,n,r){this.telegraphTimer>0?(this.telegraphTimer+=e,this.telegraphTimer>=.95&&(this.telegraphTimer=0,this.salvoCooldown=this.salvoInterval,this.spawnSalvoWarheads(),this.lastStepSalvoLaunched=!0)):r>0&&this.z<n-4.5&&(this.salvoCooldown-=e,this.salvoCooldown<=0&&(this.lockedLaneMask=zu(t,this.salvoLanes,this.salvoCycleIndex++),this.telegraphTimer=.001,this.lastStepSalvoWarning=!0));let i=!1,a=!1,o=!1;for(let s=0;s<Iu;s++){let c=this.warheads[s];c.active&&(c.z+=Fu*e,c.coreMesh.rotation.z+=e*15,c.coreMesh.rotation.x+=e*9,c.root.position.set(c.x,0,c.z),c.z>=n-.18?(c.active=!1,c.root.visible=!1,r>0&&(Math.abs(t-c.x)<1.35?(this.lastStepSalvoHitDamage+=c.damage,this.lastStepSalvoHitX=c.x):(this.lastStepSalvoDodgedCount+=1,this.lastStepSalvoDodgeX=c.x))):c.laneIndex===0?i=!0:c.laneIndex===1?a=!0:o=!0)}let s=this.telegraphTimer>0,c=s?Math.min(1,this.telegraphTimer/Pu):1,l=s?.55+.45*Math.sin(c*Math.PI*7):.55,u=this.z+1.4,d=n+1.5,f=Math.max(2,d-u),p=(u+d)*.5;this.chevronTex.repeat.set(1,Math.max(2,f*.42)),this.chevronTex.offset.y=(this.chevronTex.offset.y+e*3.6)%1;for(let e=0;e<3;e++){let t=this.laneVisuals[e],r=e===0?i:e===1?a:o,u=s&&this.lockedLaneMask[e]||r;if(t.root.visible=u,!u)continue;let d=Nu[e];t.carpetGroup.position.set(d,.045,p),t.carpetGroup.scale.set(1,1,f),t.carpetMat.opacity=s?.38+.42*c*l:.34,t.railMat.opacity=s?.55+.45*l:.48;let m=s?1.25-.35*c:.92;t.reticleRing.position.set(d,.055,n),t.reticleRing.scale.set(m,m,1),t.reticleMat.opacity=s?.55+.42*l:.48}}spawnSalvoWarheads(){let e=this.z+1.5;for(let t=0;t<3;t++)if(this.lockedLaneMask[t])for(let n=0;n<Iu;n++){let r=this.warheads[n];if(!r.active){r.active=!0,r.laneIndex=t,r.x=Nu[t],r.z=e,r.damage=this.salvoDamage,r.root.position.set(r.x,0,r.z),r.root.visible=!0;break}}}animateChassisAdvance(e,t,n){let r=this.walkPhase;if(this.activeChassis===`WARDEN_MECH`||this.activeChassis===`SOVEREIGN_TITAN`){let n=Math.sin(r)*.38;if(e.leftLeg&&(e.leftLeg.rotation.x=n),e.rightLeg&&(e.rightLeg.rotation.x=-n),e.bodyGroup.position.y=t+Math.abs(Math.cos(r))*.12,e.bodyGroup.rotation.x=.06+Math.abs(Math.sin(r))*.04,e.bodyGroup.rotation.z=Math.sin(r)*.035,e.wingPylons){let t=Math.sin(r*1.5)*.1;e.wingPylons[0].rotation.z=.46+t,e.wingPylons[1].rotation.z=-.46-t}e.meleeArm&&(e.meleeArm.rotation.x=Math.sin(r)*.24)}else if(this.activeChassis===`SIEGE_TANK`){if(e.bodyGroup.position.y=t+Math.sin(r*2.8)*.035,e.bodyGroup.rotation.x=Math.sin(r*1.4)*.025,e.turretGroup){let t=Math.max(-.35,Math.min(.35,(n-this.x)*.14));e.turretGroup.rotation.y=t}for(let t=0;t<e.recoilBarrels.length;t++){let n=Math.max(0,Math.sin(r*2.2+t*Math.PI))*.28;e.recoilBarrels[t].position.z=.76-n}}else if(this.activeChassis===`KRAKEN_WALKER`&&e.spiderLegs){let[n,i,a,o]=e.spiderLegs,s=Math.sin(r),c=Math.sin(r+Math.PI);n.rotation.y=.48+s*.28,n.rotation.z=Math.max(0,s)*.18,o.rotation.y=.48-s*.28,o.rotation.z=-Math.max(0,s)*.18,i.rotation.y=-.48-c*.28,i.rotation.z=-Math.max(0,c)*.18,a.rotation.y=-.48+c*.28,a.rotation.z=Math.max(0,c)*.18,e.bodyGroup.position.y=t+Math.sin(r*2)*.08,e.bodyGroup.rotation.z=Math.sin(r)*.05;for(let t=0;t<e.recoilBarrels.length;t++){let n=Math.max(0,Math.sin(r*2+t*Math.PI))*.2;e.recoilBarrels[t].position.z=.75-n}}}tryBulletHit(e,t,n,r,i,a){if(this.lastStepSegmentBroken=!1,!this.active||this.defeated||a===this.entityId)return`NONE`;let o=this.activeChassis===`SIEGE_TANK`?1.65:1.45,s=this.activeChassis===`KRAKEN_WALKER`||this.activeChassis===`SIEGE_TANK`?2.25:2.05,c=Math.min(t,n)-o,l=Math.max(t,n)+o;if(this.z<c||this.z>l||Math.abs(e-this.x)>s)return`NONE`;let u=Math.max(1,this.segments),d=Math.ceil(this.currentHp/Math.max(1,this.maxHp)*u);this.currentHp-=r*i;let f=Math.ceil(Math.max(0,this.currentHp)/Math.max(1,this.maxHp)*u);return this.hitFlashCooldown<=0&&(this.hitFlash=1,this.hitFlashCooldown=.14,this.applyFlash(1)),this.currentHp<=0?(this.currentHp=0,this.defeated=!0,this.active=!1,this.hide(),`DEFEATED`):(f<d&&(this.lastStepSegmentBroken=!0),`HIT`)}},Hu=.88,Uu=.96,Wu=.34,Gu=4.9,Ku=.22;function qu(e,t,n){let r=Math.max(1,Math.min(10,Math.floor(t))),i=Math.max(0,Math.min(r-1,e)),a=0,o=0;return i<5?(a=(i-(Math.min(5,r)-1)*.5)*Hu,o=0):(a=(i-5-(r-5-1)*.5)*Hu,o=Uu),n?(n.x=a,n.z=o,n):{x:a,z:o}}function Ju(e=10,t=Hu){let n=[];for(let r=0;r<e;r++){let e=Math.floor(r/5),i=r%5,a=i===0?0:(i%2==1?-1:1)*Math.ceil(i/2)*t,o=e*Uu;n.push({x:a,z:o,radius:Math.hypot(a,o)})}return n.sort((e,t)=>e.radius-t.radius),n}Ju(10,Hu);function Yu(e){return e<=0?0:(Math.min(5,Math.min(e,10))-1)*.5*Hu+Wu}function Xu(e,t,n=Gu,r=Ku){let i=Yu(t),a=Math.max(.4,n-i-r);return e<-a?-a:e>a?a:e}var Zu=24,Qu=class{entityId;active=!1;aliveCount=0;initialCount=0;hpPerEnemy=15;speed=2.1;x=0;z=0;marchPhase=0;unitCountCap=Zu;unitAlive=new Uint8Array(Zu);unitIsHeavy=new Uint8Array(Zu);unitX=new Float32Array(Zu);unitZ=new Float32Array(Zu);unitHp=new Float32Array(Zu);unitMaxHp=new Float32Array(Zu);unitHitFlash=new Float32Array(Zu);unitCoins=new Float32Array(Zu);lastKillCount=0;lastKills=[];totalConfigured=0;constructor(e){this.entityId=800+e;for(let e=0;e<6;e++)this.lastKills.push({x:0,z:0,isHeavy:!1,coinReward:0})}configure(e){this.active=!0,this.totalConfigured=Math.max(1,Math.min(Zu,e.count)),this.initialCount=this.totalConfigured,this.aliveCount=this.totalConfigured,this.hpPerEnemy=Math.max(2,e.hpPerEnemy),this.speed=e.speed,this.x=e.lane===`LEFT`?-2:e.lane===`RIGHT`?2:0,this.z=e.z,this.marchPhase=0,this.lastKillCount=0;let t=e.heavyCount??Math.max(1,Math.floor(this.totalConfigured*.26)),n=e.coinPerKill??5,r=e.lane===`CENTER`?3.55:2.15,i=e.lane===`CENTER`?5:3,a=Math.floor(i/2),o=[];for(let e=0;e<this.totalConfigured;e++)o.push(e);o.sort((e,t)=>{let n=Math.floor(e/i),r=Math.floor(t/i);return n===r?Math.abs(e%i-a)-Math.abs(t%i-a):n-r});let s=new Set(o.slice(0,Math.max(0,t)));for(let t=0;t<this.totalConfigured;t++){this.unitAlive[t]=1;let a=+!!s.has(t);this.unitIsHeavy[t]=a;let o=Math.floor(t/i),c=t%i,l=i>1?c/(i-1)-.5:0,u=((t*17+5)%11-5)*.085,d=((t*13+3)%9-4)*.14,f=Math.max(-4.15,Math.min(4.15,this.x+l*r*2+u)),p=e.z-o*1.18+d;this.unitX[t]=f,this.unitZ[t]=p;let m=a?this.hpPerEnemy*3.8:this.hpPerEnemy;this.unitMaxHp[t]=m,this.unitHp[t]=m,this.unitHitFlash[t]=0,this.unitCoins[t]=a?Math.round(n*3.4):n}}hide(){this.active=!1,this.aliveCount=0,this.totalConfigured=0}update(e,t,n){if(!this.active||this.aliveCount<=0)return;let r=n-this.z<33;r&&(this.z+=this.speed*e,this.marchPhase+=e*8.8);let i=0,a=0,o=-999999;for(let s=0;s<this.totalConfigured;s++)if(this.unitAlive[s]!==0){if(this.unitHitFlash[s]>0&&(this.unitHitFlash[s]=Math.max(0,this.unitHitFlash[s]-e*6.5)),r){let r=this.unitIsHeavy[s]===1?.86:1;this.unitZ[s]+=this.speed*r*e;let i=n-this.unitZ[s];if(i<8.5&&i>-1){let n=t-this.unitX[s];this.unitX[s]+=Math.sign(n)*Math.min(Math.abs(n),.25*e)}}this.unitZ[s]>n+14?this.unitAlive[s]=0:(i++,a+=this.unitX[s],this.unitZ[s]>o&&(o=this.unitZ[s]))}this.aliveCount=i,i<=0?this.active=!1:(this.x=a/i,this.z=o)}pushInstances(e){if(!(!this.active||this.aliveCount<=0))for(let t=0;t<this.totalConfigured;t++)this.unitAlive[t]!==0&&(this.unitIsHeavy[t]===1?e.pushHeavyEnemySoldier(this.unitX[t],this.unitZ[t],this.marchPhase+t*.65,this.unitHitFlash[t]):e.pushEnemySoldier(this.unitX[t],this.unitZ[t],this.marchPhase+t*.85,this.unitHitFlash[t]))}tryBulletHit(e,t,n,r,i){if(!this.active||this.aliveCount<=0)return-1;let a=-1,o=-999999,s=Math.min(t,n),c=Math.max(t,n);for(let t=0;t<this.totalConfigured;t++){if(this.unitAlive[t]===0||this.entityId*32+t===i)continue;let n=this.unitIsHeavy[t]===1?.66:.48,r=this.unitZ[t];r<s-n||r>c+n||Math.abs(e-this.unitX[t])>n||r>o&&(o=r,a=t)}if(a<0)return-1;if(this.lastKillCount=0,this.unitHitFlash[a]=1,this.unitHp[a]-=r,this.unitHp[a]<=0){this.unitAlive[a]=0,this.aliveCount=Math.max(0,this.aliveCount-1);let e=this.lastKills[0];return e.x=this.unitX[a],e.z=this.unitZ[a],e.isHeavy=this.unitIsHeavy[a]===1,e.coinReward=this.unitCoins[a],this.lastKillCount=1,this.aliveCount<=0&&(this.active=!1),1}return 0}resolveSquadCollision(e,t,n){if(!this.active||this.aliveCount<=0||n<=0)return null;let r=Yu(n),i=0,a=e,o=t;for(let s=0;s<this.totalConfigured;s++){if(this.unitAlive[s]===0)continue;let c=this.unitIsHeavy[s]===1?.56:.4;if(Math.abs(this.unitZ[s]-t)<=.72+c*.4&&Math.abs(this.unitX[s]-e)<=r+c){let e=this.unitIsHeavy[s]===1?2:1;if(i+=e,a=this.unitX[s],o=this.unitZ[s],this.unitAlive[s]=0,this.aliveCount=Math.max(0,this.aliveCount-1),i>=n)break}}return this.aliveCount<=0&&(this.active=!1),i<=0?null:{playerLosses:Math.min(n,i),hitX:a,hitZ:o}}getConfiguredCount(){return this.totalConfigured}},$u=2.2,ed=.32,td=.16;function nd(e,t,n=`ADD`){return n===`MUL`?e*(1+Math.max(0,Math.round((t-1)*10))*td):t<0?e:e*(1+t*ed)}function rd(e,t){if(e.isLocked||e.operator===`DIV`||e.damagePerIncrement<=0||t<=0)return{value:e.value,hitAccumulator:e.hitAccumulator,deltaIncrements:0,crossedZeroOrPositive:!1,flippedToPositive:!1,ricochet:e.isLocked,ringProgress:0};if(e.operator===`MUL`){let n=Math.round(e.value*10),r=Math.round($u*10);if(n>=r)return{value:$u,hitAccumulator:0,deltaIncrements:0,crossedZeroOrPositive:!1,flippedToPositive:!1,ricochet:!1,ringProgress:.999};let i=n,a=e.hitAccumulator+t,o=0;for(;i<r;){let t=nd(e.damagePerIncrement,i/10,`MUL`);if(a+1e-9<t)break;a=Math.max(0,a-t),i+=1,o+=1}i>=r&&(a=0);let s=i/10,c=nd(e.damagePerIncrement,s,`MUL`),l=n<15&&i>=15;return{value:s,hitAccumulator:a,deltaIncrements:o,crossedZeroOrPositive:l,flippedToPositive:l,ricochet:!1,ringProgress:i>=r?.999:Math.min(.999,Math.max(0,a/c))}}if(e.value>=8)return{value:e.value,hitAccumulator:0,deltaIncrements:0,crossedZeroOrPositive:!1,flippedToPositive:!1,ricochet:!1,ringProgress:.999};let n=e.value,r=e.hitAccumulator+t,i=0;for(;n<8;){let t=nd(e.damagePerIncrement,n,`ADD`);if(r+1e-9<t)break;r=Math.max(0,r-t),n+=1,i+=1}n>=8&&(r=0);let a=nd(e.damagePerIncrement,n,`ADD`),o=e.value<0&&n>=0,s=e.value<=0&&n>0;return{value:n,hitAccumulator:r,deltaIncrements:i,crossedZeroOrPositive:o,flippedToPositive:s,ricochet:!1,ringProgress:n>=8?.999:Math.min(.999,Math.max(0,r/a))}}function id(e,t,n,r=10){if(e<=0)return 0;let i=e;switch(t){case`ADD`:i=e+Math.round(n);break;case`MUL`:i=Math.round(e*Math.max(1,n));break;case`DIV`:i=Math.max(1,Math.floor(e/Math.max(1,n)))}return Math.min(r,Math.max(0,i))}function ad(e,t,n=!0){if(e===`MUL`){if(!n){let e=Math.round(t*10)/10;return Number.isInteger(e)?`X${e.toFixed(0)}`:`X${e.toFixed(1)}`}return`x${Math.round(t)}`}if(e===`DIV`)return`÷${Math.round(t)}`;let r=Math.round(t);return r>=0?`+${r}`:`${r}`}function od(e,t,n,r,i,a){e.beginPath(),e.moveTo(t+a,n),e.lineTo(t+r-a,n),e.lineTo(t+r,n+a),e.lineTo(t+r,n+i-a),e.lineTo(t+r-a,n+i),e.lineTo(t+a,n+i),e.lineTo(t,n+i-a),e.lineTo(t,n+a),e.closePath()}var sd=class{canvas;ctx;texture;lastSignature=``;constructor(e=!1){this.canvas=document.createElement(`canvas`),this.canvas.width=e?1024:512,this.canvas.height=264;let t=this.canvas.getContext(`2d`);if(!t)throw Error(`2D canvas context unavailable`);this.ctx=t,this.texture=new Ui(this.canvas),this.texture.colorSpace=yt,this.texture.minFilter=se,this.texture.magFilter=se}redrawIfDirty(e,t,n,r,i){let a=Math.round(e===`MUL`&&!n?t*10:t),o=n?0:Math.floor(r*16),s=+(i>.15),c=`${e}:${a}:${+!!n}:${o}:${s}`;if(c===this.lastSignature)return;this.lastSignature=c;let l=this.ctx,u=this.canvas.width,d=this.canvas.height;l.clearRect(0,0,u,d);let f=`rgba(24, 198, 255, 0.50)`,p=`rgba(10, 120, 212, 0.62)`,m=`#62f4ff`;n&&e===`MUL`?(f=`rgba(235, 168, 24, 0.56)`,p=`rgba(138, 76, 10, 0.66)`,m=`#ffe066`):n&&e===`DIV`?(f=`rgba(224, 38, 56, 0.58)`,p=`rgba(116, 14, 28, 0.68)`,m=`#ff8a65`):e===`ADD`&&t<0&&(f=`rgba(232, 42, 64, 0.56)`,p=`rgba(128, 16, 32, 0.68)`,m=`#ff6b81`),l.save(),od(l,10,10,u-20,d-20,22),l.clip();let h=l.createLinearGradient(0,10,0,d-10);h.addColorStop(0,f),h.addColorStop(1,p),l.fillStyle=h,l.fillRect(0,0,u,d),l.fillStyle=`rgba(255, 255, 255, 0.08)`;for(let e=22;e<d-22;e+=24)l.fillRect(10,e,u-20,4);s&&(l.fillStyle=`rgba(255, 255, 255, 0.34)`,l.fillRect(10,10,u-20,d-20)),l.restore(),od(l,10,10,u-20,d-20,22),l.lineWidth=8,l.strokeStyle=m,l.stroke();let g=ad(e,t,n);if(l.textAlign=`center`,l.textBaseline=`middle`,l.font=`900 142px system-ui, -apple-system, sans-serif`,l.lineJoin=`round`,l.lineWidth=22,l.strokeStyle=`#09111c`,l.strokeText(g,u/2,d/2-4),l.fillStyle=`#ffffff`,l.fillText(g,u/2,d/2-4),!n){let e=Math.min(340,u-120),t=(u-e)/2,n=d-28;l.fillStyle=`rgba(7, 12, 20, 0.72)`,l.fillRect(t-4,n-4,e+8,16),l.fillStyle=`#ffffff`,l.fillRect(t,n,Math.round(o/16*e),8)}this.texture.needsUpdate=!0}},cd=class{canvas;ctx;texture;lastSignature=``;constructor(){this.canvas=document.createElement(`canvas`),this.canvas.width=384,this.canvas.height=224;let e=this.canvas.getContext(`2d`);if(!e)throw Error(`2D canvas context unavailable`);this.ctx=e,this.texture=new Ui(this.canvas),this.texture.colorSpace=yt,this.texture.minFilter=se,this.texture.magFilter=se}redrawIfDirty(e,t=0){let n=Math.max(0,Math.ceil(e)),r=+(t>.25),i=`${n}:${r}`;if(i===this.lastSignature)return;this.lastSignature=i;let a=this.ctx,o=this.canvas.width,s=this.canvas.height;a.clearRect(0,0,o,s);let c=`${n}`,l=n>=1e3?124:n>=100?148:168;a.textAlign=`center`,a.textBaseline=`middle`,a.font=`900 ${l}px system-ui, -apple-system, sans-serif`,a.lineJoin=`round`,a.lineWidth=34,a.strokeStyle=`rgba(14, 8, 4, 0.92)`,a.strokeText(c,o/2,s/2+6),a.lineWidth=22,a.strokeStyle=r?`#ff3b1f`:`#ea5212`,a.strokeText(c,o/2,s/2+2),a.fillStyle=r?`#fff4d6`:`#ffffff`,a.fillText(c,o/2,s/2+2),this.texture.needsUpdate=!0}};function ld(e){let t=document.createElement(`canvas`);t.width=320,t.height=96;let n=t.getContext(`2d`);if(!n)throw Error(`2D canvas context unavailable`);let r=ou[e],i=`#${r.colorHex.toString(16).padStart(6,`0`)}`;od(n,8,10,304,76,14),n.fillStyle=`rgba(13, 18, 25, 0.94)`,n.fill(),n.lineWidth=5,n.strokeStyle=i,n.stroke(),n.textAlign=`center`,n.textBaseline=`middle`,n.font=`900 36px system-ui, -apple-system, sans-serif`,n.fillStyle=i,n.fillText(r.shortBadge.toUpperCase(),160,49);let a=new Ui(t);return a.colorSpace=yt,a}var ud=4.72,dd=9.64,fd=2.48,pd=class{root=new U;z=0;active=!1;triggered=!1;isFullSpan=!1;centerPostGroup=new U;leftSlot;rightSlot;fullSlot;constructor(e){let t=new Y({color:2503749,metalness:.42,roughness:.34}),n=new G({color:724758,side:1}),r=new K(new Da(10.2,.55),new G({color:329741,transparent:!0,opacity:.32,depthWrite:!1}));r.rotation.x=-Math.PI/2,r.position.set(0,.018,.06),this.root.add(r);for(let e of[-4.92,0,4.92]){let r=e===0?this.centerPostGroup:this.root,i=new K(new J(.14,.17,2.75,12),t);i.position.set(e,1.38,0);let a=new K(new J(.18,.21,2.81,12),n);a.position.set(e,1.38,0);let o=new K(new ka(.2,10,8),t);o.position.set(e,2.78,0),r.add(i,a,o)}this.root.add(this.centerPostGroup),this.leftSlot=this.createGateSlot(e*3+100,`LEFT`,-2.46,ud,-4.88,-.06,!1),this.rightSlot=this.createGateSlot(e*3+101,`RIGHT`,2.46,ud,.06,4.88,!1),this.fullSlot=this.createGateSlot(e*3+102,`LEFT`,0,dd,-4.88,4.88,!0),this.root.visible=!1}createGateSlot(e,t,n,r,i,a,o){let s=new U;s.position.set(n,0,0);let c=new sd(o),l=new G({map:c.texture,transparent:!0,side:2,depthWrite:!1}),u=new K(new Da(r,fd),l);u.position.set(0,1.34,0),s.add(u);let d=new G({color:3733247}),f=new J(.08,.08,2.52,8),p=r*.5-.04,m=new K(f,d);m.position.set(-p,1.34,0);let h=new K(f,d);h.position.set(p,1.34,0),s.add(m,h);let g=Su();return g.position.set(0,2.75,.1),s.add(g),this.root.add(s),{entityId:e,laneTag:t,minX:i,maxX:a,centerX:n,group:s,ledMat:d,padlockGroup:g,labelTex:c,active:!1,operator:`ADD`,value:0,hitAccumulator:0,damagePerIncrement:1,isLocked:!1,ringProgress:0,flashTimer:0}}syncLedColor(e){e.isLocked&&e.operator===`MUL`?e.ledMat.color.setRGB(1.35,1,.25):e.isLocked&&e.operator===`DIV`?e.ledMat.color.setRGB(1.42,.25,.24):e.operator===`ADD`&&e.value<0?e.ledMat.color.setRGB(1.4,.24,.34):e.ledMat.color.setRGB(.24,1.25,1.48)}configure(e){this.z=e.z,this.active=!0,this.triggered=!1,this.root.position.set(0,0,e.z),this.root.visible=!0,e.full?(this.isFullSpan=!0,this.centerPostGroup.visible=!1,this.configureSlot(this.leftSlot,null),this.configureSlot(this.rightSlot,null),this.configureSlot(this.fullSlot,e.full)):(this.isFullSpan=!1,this.centerPostGroup.visible=!0,this.configureSlot(this.fullSlot,null),this.configureSlot(this.leftSlot,e.left),this.configureSlot(this.rightSlot,e.right))}configureSlot(e,t){t?(e.active=!0,e.group.visible=!0,e.operator=t.operator,e.value=t.initialValue,e.hitAccumulator=0,e.damagePerIncrement=t.damagePerIncrement,e.isLocked=t.isLocked,e.ringProgress=0,e.flashTimer=0,e.padlockGroup.visible=t.isLocked,this.syncLedColor(e),e.labelTex.redrawIfDirty(t.operator,t.initialValue,t.isLocked,0,0)):(e.active=!1,e.group.visible=!1)}hide(){this.active=!1,this.triggered=!0,this.root.visible=!1}updateVisuals(e,t){this.active&&((this.triggered||t<this.z-2)&&(this.triggered=!0,this.root.position.y-=e*18,this.root.position.y<=-3.4||t<this.z-4.8)?this.hide():(this.tickSide(this.leftSlot,e),this.tickSide(this.rightSlot,e),this.tickSide(this.fullSlot,e)))}tickSide(e,t){e.active&&(e.flashTimer>0&&(e.flashTimer=Math.max(0,e.flashTimer-t*6.5)),e.labelTex.redrawIfDirty(e.operator,e.value,e.isLocked,e.ringProgress,e.flashTimer))}tryBulletHit(e,t,n,r,i){if(!this.active||this.triggered)return null;let a=Math.min(t,n)-.35,o=Math.max(t,n)+.35;if(this.z<a||this.z>o)return null;let s=null;if(this.isFullSpan&&this.fullSlot.active?e>=this.fullSlot.minX&&e<=this.fullSlot.maxX&&(s=this.fullSlot):e>=this.leftSlot.minX&&e<=this.leftSlot.maxX&&this.leftSlot.active?s=this.leftSlot:e>=this.rightSlot.minX&&e<=this.rightSlot.maxX&&this.rightSlot.active&&(s=this.rightSlot),!s||s.entityId===i)return null;let c=rd({operator:s.operator,value:s.value,hitAccumulator:s.hitAccumulator,damagePerIncrement:s.damagePerIncrement,isLocked:s.isLocked},r);return s.value=c.value,s.hitAccumulator=c.hitAccumulator,s.ringProgress=c.ringProgress,s.flashTimer=1,this.syncLedColor(s),s.labelTex.redrawIfDirty(s.operator,s.value,s.isLocked,s.ringProgress,s.flashTimer),{lane:s.laneTag,entityId:s.entityId,hitX:e,hitZ:this.z,newValue:c.value,deltaIncrements:c.deltaIncrements,crossedZeroOrPositive:c.crossedZeroOrPositive,flippedToPositive:c.flippedToPositive,ricochet:c.ricochet,formattedLabel:ad(s.operator,c.value,s.isLocked)}}trySquadCollect(e,t,n){if(!this.active||this.triggered||t>this.z+.48||t<this.z-2.2)return null;let r=null;if(r=this.isFullSpan&&this.fullSlot.active?this.fullSlot:e<0&&this.leftSlot.active||!this.rightSlot.active?this.leftSlot:this.rightSlot,!r||!r.active)return null;this.triggered=!0,r.active=!1,r.group.visible=!1;let i=id(n,r.operator,r.value,999),a=id(n,r.operator,r.value),o=a-n,s=ad(r.operator,r.value,r.isLocked);return{lane:r.laneTag,worldX:this.isFullSpan?e:r.centerX,worldZ:this.z,nextSquadCount:a,rawUnclampedCount:i,deltaSquad:o,label:s,positive:i>=n}}},md=6.5,hd={x:0,z:0},gd=class{logicalCount=1;peakCount=1;weaponTier=1;x=0;z=0;marchPhase=0;steerBankAngle=0;recoilImpulse=0;barrelSpinAngle=0;soldierWorldX=new Float32Array(10);soldierWorldZ=new Float32Array(10);fireCooldown=0;emitterCursor=0;pendingBurstTimer=-1;pendingBurstDamage=0;pendingBurstEmitters=0;resetForRun(e){this.logicalCount=Math.max(1,Math.min(10,Math.floor(e))),this.peakCount=this.logicalCount,this.weaponTier=1,this.x=0,this.z=0,this.marchPhase=0,this.steerBankAngle=0,this.recoilImpulse=0,this.barrelSpinAngle=0,this.fireCooldown=.06,this.emitterCursor=0,this.pendingBurstTimer=-1;let t=Math.min(this.logicalCount,10);for(let e=0;e<t;e++)qu(e,t,hd),this.soldierWorldX[e]=this.x+hd.x,this.soldierWorldZ[e]=this.z+hd.z}setLogicalCount(e){let t=Math.min(this.logicalCount,10),n=Math.max(0,Math.floor(e)),r=Math.max(0,n-10);this.logicalCount=Math.min(10,n),this.logicalCount>this.peakCount&&(this.peakCount=this.logicalCount),this.x=Xu(this.x,this.logicalCount);let i=Math.min(this.logicalCount,10);for(let e=t;e<i;e++)qu(e,i,hd),this.soldierWorldX[e]=this.x+hd.x*.25,this.soldierWorldZ[e]=this.z+hd.z*.25;return r}updateMovement(e,t,n,r){if(this.logicalCount<=0)return;let i=this.x;this.x=Xu(this.x+t,this.logicalCount);let a=e>0?(this.x-i)/e:0,o=Math.max(-.22,Math.min(.22,a*.02));this.steerBankAngle+=(o-this.steerBankAngle)*Math.min(1,e*14),this.recoilImpulse>0&&(this.recoilImpulse=Math.max(0,this.recoilImpulse-e*9.5)),n&&(this.z-=md*e),r?(this.marchPhase+=e,this.barrelSpinAngle+=e*(this.weaponTier===4?24:4)):(this.marchPhase+=e*.35,this.barrelSpinAngle+=e*3.2);let s=Math.min(this.logicalCount,10),c=Math.min(1,e*15);for(let e=0;e<s;e++){qu(e,s,hd);let t=this.x+hd.x,n=this.z+hd.z;this.soldierWorldX[e]+=(t-this.soldierWorldX[e])*c,this.soldierWorldZ[e]+=(n-this.soldierWorldZ[e])*c}}updateAutoFire(e,t,n,r,i=0){if(this.logicalCount<=0)return!1;let a=!1,o=ou[this.weaponTier];if(this.pendingBurstTimer>=0&&(this.pendingBurstTimer-=e,this.pendingBurstTimer<=0&&(this.pendingBurstTimer=-1,this.emitVolleyStream(this.pendingBurstEmitters,this.pendingBurstDamage,o.spreadRadians,!1,r,i),a=!0)),this.fireCooldown-=e,this.fireCooldown<=0){let e=lu(this.logicalCount,this.weaponTier,t,n);this.fireCooldown=Math.max(.03,e.intervalSeconds),o.pattern===`BURST_2`?(this.emitVolleyStream(e.activeEmitters,e.damagePerProjectile,o.spreadRadians,!1,r,i),this.pendingBurstTimer=.062,this.pendingBurstDamage=e.damagePerProjectile,this.pendingBurstEmitters=e.activeEmitters):o.pattern===`TWIN_SPREAD`?this.emitVolleyStream(e.activeEmitters,e.damagePerProjectile,o.spreadRadians,!0,r,i):this.emitVolleyStream(e.activeEmitters,e.damagePerProjectile,o.spreadRadians,!1,r,i),a=!0}return a&&(this.recoilImpulse=1),a}emitVolleyStream(e,t,n,r,i,a){let o=Math.min(this.logicalCount,10);if(o<=0||e<=0)return;let s=ou[this.weaponTier],c=s.projectileSpeed,l=1.24,u=1.32,d=.255*iu,f=.548*iu,p=-.68*iu;for(let m=0;m<e;m++){let e=(this.emitterCursor+m)%o,h=this.soldierWorldX[e]+d,g=this.soldierWorldZ[e]+p;if(r){let e=a-n;i.spawn(h-.08,f,g,Math.sin(e)*c,-Math.cos(e)*c,t,s.pierceCount,u,l,this.weaponTier,s.colorHex);let r=a+n;i.spawn(h+.08,f,g,Math.sin(r)*c,-Math.cos(r)*c,t,s.pierceCount,u,l,this.weaponTier,s.colorHex)}else{let r=a+(n>0?((e*7+m*3)%9-4)*.25*n:0);i.spawn(h,f,g,Math.sin(r)*c,-Math.cos(r)*c,t,s.pierceCount,u,l,this.weaponTier,s.colorHex)}}this.emitterCursor=(this.emitterCursor+e)%Math.max(1,o)}},_d=1.34;function vd(e){switch(e){case`LEFT`:return-3.15;case`RIGHT`:return 3.15;case`LEFT_MID`:return-1.68;case`RIGHT_MID`:return 1.68;default:return 0}}function yd(){let e=document.createElement(`canvas`);e.width=256,e.height=256;let t=e.getContext(`2d`),n=t.createLinearGradient(0,0,0,256);n.addColorStop(0,`#755330`),n.addColorStop(.22,`#9c7344`),n.addColorStop(.5,`#b08450`),n.addColorStop(.78,`#9c7344`),n.addColorStop(1,`#755330`),t.fillStyle=n,t.fillRect(0,0,256,256);for(let e=0;e<16;e++){let n=e*16;t.fillStyle=e%2==0?`rgba(255, 226, 178, 0.08)`:`rgba(30, 16, 6, 0.08)`,t.fillRect(n,0,16,256),t.fillStyle=`rgba(28, 16, 8, 0.42)`,t.fillRect(n,0,2.5,256)}let r=new Ui(e);return r.wrapS=te,r.wrapT=ne,r.colorSpace=yt,r}function bd(){let e=e=>{let t=[new B(0,-1.12-e),new B(.76+e,-1.12-e),new B(.83+e,-1.04-e*.4)];for(let n=0;n<=10;n++){let r=n/10,i=-1.02+r*2.04,a=.84+(1-(r*2-1)**2)*.21+e;t.push(new B(a,i))}t.push(new B(.83+e,1.04+e*.4),new B(.76+e,1.12+e),new B(0,1.12+e));let n=new Ta(t,22);return n.rotateZ(Math.PI/2),n.scale(1,1.04,1.02),n.computeVertexNormals(),n};return{bodyGeo:e(0),outlineGeo:e(.052)}}function xd(){let e=document.createElement(`canvas`);e.width=128,e.height=128;let t=e.getContext(`2d`);t.clearRect(0,0,128,128);let n=t.createRadialGradient(64,64,5,64,64,62);n.addColorStop(0,`rgba(255, 250, 196, 0.96)`),n.addColorStop(.42,`rgba(255, 210, 64, 0.52)`),n.addColorStop(1,`rgba(255, 180, 20, 0.0)`),t.fillStyle=n,t.fillRect(0,0,128,128),t.save(),t.translate(64,64),t.fillStyle=`rgba(255, 248, 205, 0.36)`;for(let e=0;e<8;e++)t.rotate(Math.PI/4),t.beginPath(),t.moveTo(-4,0),t.lineTo(0,-58),t.lineTo(4,0),t.closePath(),t.fill();return t.restore(),new Ui(e)}var Sd=yd(),Cd=bd(),wd=xd(),Td=(()=>{let e=new J(.955,.955,.19,22,1,!0);return e.rotateZ(Math.PI/2),e.scale(1,1.045,1.025),e})(),Ed=class{entityId;root=new U;active=!1;broken=!1;x=0;z=0;initialHp=25;remainingHp=25;rewardType=`COINS`;rewardValue=20;drumBodyGroup=new U;drumMat;hoopMat;hpLabelMesh;hpLabelTex;pickupPivot=new U;glowHaloMesh;coinGroup;recruitGroup;weaponRigs;weaponBadges;flashTimer=0;spinAngle=0;constructor(e){this.entityId=300+e;let t=new K(new Ji(1.36,20),new G({color:329741,transparent:!0,opacity:.44,depthWrite:!1}));t.rotation.x=-Math.PI/2,t.position.set(0,.02,.08),this.root.add(t),this.drumMat=new Y({color:16777215,map:Sd,roughness:.56,metalness:.14,emissive:0}),this.hoopMat=new Y({color:8162204,roughness:.34,metalness:.48,emissive:0});let n=new K(Cd.bodyGeo,this.drumMat);n.position.y=1.04,this.drumBodyGroup.add(n);for(let e of[-.66,.66]){let t=new K(Td,this.hoopMat);t.position.set(e,1.04,0),this.drumBodyGroup.add(t)}let r=new K(Cd.outlineGeo,new G({color:1314055,side:1}));r.position.y=1.04,this.drumBodyGroup.add(r),this.root.add(this.drumBodyGroup),this.hpLabelTex=new cd,this.hpLabelMesh=new K(new Da(2.28,1.34),new G({map:this.hpLabelTex.texture,transparent:!0,depthWrite:!1})),this.hpLabelMesh.position.set(0,.98,1.14),this.root.add(this.hpLabelMesh),this.pickupPivot.position.set(0,2.56,0),this.root.add(this.pickupPivot),this.glowHaloMesh=new K(new Da(1.95,1.95),new G({map:wd,transparent:!0,blending:2,depthWrite:!1})),this.glowHaloMesh.position.set(0,.04,-.14),this.pickupPivot.add(this.glowHaloMesh),this.coinGroup=bu(),this.pickupPivot.add(this.coinGroup),this.recruitGroup=xu(),this.pickupPivot.add(this.recruitGroup),this.weaponRigs={1:mu(1),2:mu(2),3:mu(3),4:mu(4),5:mu(5)};let i=new Da(2.05,.6);this.weaponBadges={1:new K(i,new G({map:ld(1),transparent:!0})),2:new K(i,new G({map:ld(2),transparent:!0})),3:new K(i,new G({map:ld(3),transparent:!0})),4:new K(i,new G({map:ld(4),transparent:!0})),5:new K(i,new G({map:ld(5),transparent:!0}))};for(let e of[1,2,3,4,5]){let t=this.weaponRigs[e];t.root.scale.setScalar(1.28),t.root.rotation.z=.18,this.pickupPivot.add(t.root),this.weaponBadges[e].position.set(0,.9,0),this.pickupPivot.add(this.weaponBadges[e])}this.root.visible=!1}configure(e){this.active=!0,this.broken=!1,this.z=e.z,this.x=vd(e.lane),this.initialHp=Math.max(1,e.hp),this.remainingHp=this.initialHp,this.rewardType=e.rewardType,this.rewardValue=e.rewardValue,this.flashTimer=0,this.spinAngle=Math.abs(this.x*.45+this.z*.08),this.root.position.set(this.x,0,this.z),this.root.visible=!0,this.drumBodyGroup.scale.set(1,1,1),this.drumMat.emissive.setRGB(0,0,0),this.hoopMat.emissive.setRGB(0,0,0);let t=e.rewardType===`COINS`,n=e.rewardType===`RECRUIT`,r=e.rewardType===`WEAPON`;r?(this.drumMat.color.setHex(15235950),this.hoopMat.color.setHex(13935180)):n?(this.drumMat.color.setHex(13361912),this.hoopMat.color.setHex(5154047)):(this.drumMat.color.setHex(16772050),this.hoopMat.color.setHex(8162204)),this.coinGroup.visible=t,this.recruitGroup.visible=n,this.glowHaloMesh.visible=!0;let i=Math.max(1,Math.min(5,Math.round(e.rewardValue)));for(let e of[1,2,3,4,5]){let t=r&&e===i;this.weaponRigs[e].root.visible=t,this.weaponBadges[e].visible=t}r?this.glowHaloMesh.material.color.setHex(ou[i].colorHex):n?this.glowHaloMesh.material.color.setHex(4577791):this.glowHaloMesh.material.color.setHex(16769126),this.hpLabelTex.redrawIfDirty(this.remainingHp,0)}hide(){this.active=!1,this.broken=!0,this.root.visible=!1}update(e,t){if(!this.active||this.broken)return;if(t<this.z-3.4){this.root.position.y-=e*16,(this.root.position.y<=-3.5||t<this.z-5.2)&&this.hide();return}this.spinAngle+=e*2.4;let n=Math.sin(this.spinAngle*1.5)*.08;if(this.pickupPivot.position.y=2.56+n,this.glowHaloMesh.rotation.z=this.spinAngle*.45,this.coinGroup.visible)this.coinGroup.rotation.y=Math.sin(this.spinAngle*1.15)*.58;else if(this.recruitGroup.visible)this.recruitGroup.rotation.y=Math.sin(this.spinAngle*.95)*.48;else{let t=Math.max(1,Math.min(5,Math.round(this.rewardValue))),n=this.weaponRigs[t];n.root.rotation.y=Math.sin(this.spinAngle*.9)*.72,n.spinCluster&&(n.spinCluster.rotation.x+=e*12)}if(this.flashTimer>0){this.flashTimer=Math.max(0,this.flashTimer-e*7.5),this.drumMat.emissive.setRGB(this.flashTimer*.85,this.flashTimer*.18,.02),this.hoopMat.emissive.setRGB(this.flashTimer*.45,this.flashTimer*.12,.01);let t=1+this.flashTimer*.06;this.drumBodyGroup.scale.set(t,1-this.flashTimer*.035,t)}else this.drumMat.emissive.setRGB(0,0,0),this.hoopMat.emissive.setRGB(0,0,0),this.drumBodyGroup.scale.set(1,1,1);this.hpLabelTex.redrawIfDirty(this.remainingHp,this.flashTimer)}tryBulletHit(e,t,n,r,i){if(!this.active||this.broken||i===this.entityId)return`NONE`;let a=Math.min(t,n)-1.05,o=Math.max(t,n)+1.05;return this.z<a||this.z>o||Math.abs(e-this.x)>_d?`NONE`:(this.remainingHp-=r,this.flashTimer=1,this.remainingHp<=0?(this.remainingHp=0,this.broken=!0,this.active=!1,this.root.visible=!1,`SHATTERED`):(this.hpLabelTex.redrawIfDirty(this.remainingHp,1),`HIT`))}checkUnbrokenSquadBump(e,t,n){return!this.active||this.broken?!1:Math.abs(t-this.z)<.92+n*.25&&Math.abs(e-this.x)<1.12+n*.55&&(this.broken=!0,this.active=!1,this.root.visible=!1,!0)}},Dd=5,Od=1.56;function kd(){let e=document.createElement(`canvas`);e.width=256,e.height=128;let t=e.getContext(`2d`);t.fillStyle=`#14171c`,t.fillRect(0,0,256,128),t.fillStyle=`#2d3540`;for(let e=0;e<256;e+=16)t.fillRect(e+2,6,10,50),t.fillRect(e+8,70,10,50);t.fillStyle=`#0d0f13`,t.fillRect(0,60,256,8);let n=new Ui(e);return n.wrapS=te,n.wrapT=te,n.repeat.set(6,2),n.colorSpace=yt,n}var Ad=kd(),jd=class{entityId;root=new U;active=!1;broken=!1;x=0;z=0;initialBreakCount=150;remainingBreakCount=150;weaponTier=null;coinReward=40;tireMeshes=[];rubberMat;holoBeamMat;outerHoloRing;plaqueMesh;plaqueTex;pickupPivot=new U;coinPickupGroup;weaponRigs;badgeMeshes;flashTimer=0;spinAngle=0;retiring=!1;constructor(e){this.entityId=500+e,this.rubberMat=new Y({color:16777215,map:Ad,bumpMap:Ad,bumpScale:.04,roughness:.8,metalness:.1,emissive:0});let t=new Y({color:5793656,roughness:.34,metalness:.46}),n=new G({color:526862,side:1}),r=new K(new Ji(1.58,20),new G({color:329741,transparent:!0,opacity:.52,depthWrite:!1}));r.rotation.x=-Math.PI/2,r.position.set(0,.02,.08),this.root.add(r);let i=new Aa(1.12,.34,12,24);i.rotateX(Math.PI/2);let a=new Aa(1.12,.39,10,24);a.rotateX(Math.PI/2);let o=new J(.84,.84,.48,16);for(let e=0;e<Dd;e++){let r=new U,s=e%2==0?.02:-.025;r.position.set(s,.32+e*.52,0),r.rotation.y=e*.45;let c=new K(i,this.rubberMat),l=new K(a,n),u=new K(o,t);r.add(c,l,u),this.tireMeshes.push(r),this.root.add(r)}this.plaqueTex=new cd;let s=new G({map:this.plaqueTex.texture,transparent:!0,depthWrite:!1});this.plaqueMesh=new K(new Da(2.55,1.48),s),this.plaqueMesh.position.set(0,1.15,1.56),this.root.add(this.plaqueMesh),this.root.add(this.pickupPivot),this.holoBeamMat=new G({color:16766023,transparent:!0,opacity:.22,blending:2,side:2,depthWrite:!1});let c=new K(new J(.92,.56,1.05,18,1,!0),this.holoBeamMat);c.position.set(0,.02,0),this.pickupPivot.add(c),this.outerHoloRing=new K(new Aa(.84,.028,8,24),this.holoBeamMat),this.outerHoloRing.rotation.x=Math.PI/2.2,this.outerHoloRing.position.set(0,-.34,0),this.pickupPivot.add(this.outerHoloRing),this.coinPickupGroup=bu(),this.pickupPivot.add(this.coinPickupGroup),this.weaponRigs={1:mu(1),2:mu(2),3:mu(3),4:mu(4),5:mu(5)};let l=new Da(2.18,.64);this.badgeMeshes={1:new K(l,new G({map:ld(1),transparent:!0})),2:new K(l,new G({map:ld(2),transparent:!0})),3:new K(l,new G({map:ld(3),transparent:!0})),4:new K(l,new G({map:ld(4),transparent:!0})),5:new K(l,new G({map:ld(5),transparent:!0}))};for(let e of[1,2,3,4,5]){let t=this.weaponRigs[e];t.root.scale.setScalar(1.32),t.root.rotation.z=.2,this.pickupPivot.add(t.root),this.badgeMeshes[e].position.set(0,1.04,0),this.pickupPivot.add(this.badgeMeshes[e])}this.root.visible=!1}configure(e){this.active=!0,this.broken=!1,this.retiring=!1,this.z=e.z,this.x=e.lane===`LEFT`?-3.15:e.lane===`RIGHT`?3.15:0,this.initialBreakCount=Math.max(1,e.breakCount),this.remainingBreakCount=this.initialBreakCount,this.weaponTier=e.weaponTier??null,this.coinReward=e.coinReward??45,this.flashTimer=0,this.root.position.set(this.x,0,this.z),this.root.visible=!0;let t=this.weaponTier!==null,n=!t&&this.coinReward>0;this.pickupPivot.visible=t||n,this.coinPickupGroup.visible=n,this.weaponTier?this.holoBeamMat.color.setHex(ou[this.weaponTier].colorHex):this.holoBeamMat.color.setHex(16766023);for(let e of[1,2,3,4,5]){let t=this.weaponTier===e;this.weaponRigs[e].root.visible=t,this.badgeMeshes[e].visible=t}this.syncStackHeight(),this.plaqueTex.redrawIfDirty(this.remainingBreakCount,0)}hide(){this.active=!1,this.broken=!0,this.root.visible=!1}retireCheckpointSibling(){this.active&&!this.broken&&(this.retiring=!0)}syncStackHeight(){let e=Math.max(0,this.remainingBreakCount/this.initialBreakCount),t=this.initialBreakCount>=400?5:this.initialBreakCount>=140?4:3,n=Math.max(1,Math.ceil(e*t));for(let e=0;e<Dd;e++)this.tireMeshes[e].visible=e<n;let r=.42+n*.52;this.pickupPivot.position.set(0,r+.68,0),this.plaqueMesh.position.y=Math.max(.75,r*.52)}update(e,t){if(this.active&&!this.broken){if(this.retiring||t<this.z-2.6)this.retiring=!0,this.root.position.y-=e*18,(this.root.position.y<=-3.8||t<this.z-5.4)&&this.hide();else{if(this.spinAngle+=e*2.35,this.outerHoloRing.rotation.z=-this.spinAngle*.85,this.weaponTier){let t=this.weaponRigs[this.weaponTier];t.root.visible&&(t.root.rotation.y=Math.sin(this.spinAngle*.9)*.68,t.root.position.y=.08+Math.sin(this.spinAngle*1.6)*.09,t.spinCluster&&(t.spinCluster.rotation.x+=e*14))}else this.coinPickupGroup.visible&&(this.coinPickupGroup.rotation.y=Math.sin(this.spinAngle*1.15)*.58,this.coinPickupGroup.position.y=Math.sin(this.spinAngle*1.8)*.07);if(this.flashTimer>0){this.flashTimer=Math.max(0,this.flashTimer-e*8);let t=this.flashTimer*.62;this.rubberMat.emissive.setRGB(t,t*.25,.04)}else this.rubberMat.emissive.setRGB(0,0,0);this.plaqueTex.redrawIfDirty(this.remainingBreakCount,this.flashTimer)}}}tryBulletHit(e,t,n,r,i){if(!this.active||this.broken||this.retiring||i===this.entityId)return`NONE`;let a=Math.min(t,n)-1.25,o=Math.max(t,n)+1.25;return this.z<a||this.z>o||Math.abs(e-this.x)>Od?`NONE`:(this.remainingBreakCount-=r,this.flashTimer=1,this.remainingBreakCount<=0?(this.remainingBreakCount=0,this.broken=!0,this.active=!1,this.root.visible=!1,`SHATTERED`):(this.syncStackHeight(),this.plaqueTex.redrawIfDirty(this.remainingBreakCount,1),`HIT`))}resolveUnbrokenSquadCrash(e,t,n){if(!this.active||this.broken||this.retiring)return 0;if(Math.abs(t-this.z)<1.18+n*.28&&Math.abs(e-this.x)<1.46+n*.45){let e=Math.max(2,Math.ceil(this.remainingBreakCount/35));return this.broken=!0,this.active=!1,this.root.visible=!1,e}return 0}},Md={fireRate:{key:`fireRate`,title:`Fire Rate`,shortcutKey:`1`,baseCost:22,costGrowth:1.28,maxLevel:999,description:`+10% volley speed`},bulletPower:{key:`bulletPower`,title:`Damage`,shortcutKey:`2`,baseCost:25,costGrowth:1.28,maxLevel:999,description:`+18% bullet damage`},warChest:{key:`warChest`,title:`Revenue`,shortcutKey:`3`,baseCost:25,costGrowth:1.28,maxLevel:999,description:`+15% coin bounty`},startingSquad:{key:`startingSquad`,title:`Add Soldier`,shortcutKey:`4`,baseCost:65,costGrowth:1.55,maxLevel:5,description:`+1 starting commando`}},Nd=[`fireRate`,`bulletPower`,`warChest`,`startingSquad`];function Pd(e,t){let n=Md[e],r=Math.max(0,Math.floor(t));return Math.round(n.baseCost*n.costGrowth**+r)}function Fd(e){return 1+.1*Math.max(0,e)}function Id(e){return 1+.18*Math.max(0,e)}function Ld(e){return 1+Math.min(5,Math.max(0,Math.floor(e)))}function Rd(e){return 1+.15*Math.max(0,e)}function zd(e,t){switch(e){case`fireRate`:return{currentLabel:`+${Math.round(t*10)}%`,nextLabel:`+${Math.round((t+1)*10)}%`};case`bulletPower`:return{currentLabel:`+${Math.round(t*18)}%`,nextLabel:`+${Math.round((t+1)*18)}%`};case`startingSquad`:{let e=Ld(t),n=Ld(t+1);return{currentLabel:`${e}`,nextLabel:t>=5?`MAX`:`${n}`}}case`warChest`:return{currentLabel:`x${Rd(t).toFixed(2)}`,nextLabel:`x${Rd(t+1).toFixed(2)}`}}}function Bd(e){let t=Math.max(0,e.progressRatio),n=18+e.stageNumber*8,r=Math.max(5,Math.round(t*n)),i=Math.round(e.enemiesDefeated*(1.2+e.stageNumber*.35)),a=e.clearedStage?e.bossRewardCoins:0,o=Math.round(e.bonusCoinsCollected+a),s=Rd(e.warChestLevel),c=r+i+o;return{distanceCoins:r,killCoins:i,bonusCoins:o,warChestMultiplier:s,totalCoinsEarned:Math.round(c*s)}}function Vd(e,t,n){let r=Md[n],i=t[n],a=Pd(n,i);return i>=r.maxLevel||e<a?{purchased:!1,remainingCoins:e,nextUpgrades:t,cost:a}:{purchased:!0,remainingCoins:e-a,nextUpgrades:{...t,[n]:i+1},cost:a}}function Hd(e){let t=e>>>0;return()=>{t|=0,t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function Ud(){let e=Hd(1337),t=document.createElement(`canvas`);t.width=512,t.height=512;let n=t.getContext(`2d`),r=document.createElement(`canvas`);r.width=512,r.height=512;let i=r.getContext(`2d`),a=document.createElement(`canvas`);a.width=512,a.height=512;let o=a.getContext(`2d`);n.fillStyle=`#9a9186`,n.fillRect(0,0,512,512),i.fillStyle=`#808080`,i.fillRect(0,0,512,512),o.fillStyle=`#d4d4d4`,o.fillRect(0,0,512,512);let s=n.getImageData(0,0,512,512),c=i.getImageData(0,0,512,512),l=o.getImageData(0,0,512,512);for(let t=0;t<512;t++)for(let n=0;n<512;n++){let r=(t*512+n)*4,i=n/512,a=Math.abs(i-.285),o=Math.abs(i-.715),u=Math.exp(-a*a*190)+Math.exp(-o*o*190),d=Math.floor(n/128),f=Math.floor(t/128),p=((d*7+f*13)%5-2)*3.2,m=(e()-.5)*18+(e()-.5)*10,h=Math.sin(n*.08)*Math.cos(t*.07)*4,g=152+p-u*9+m*.55+h;s.data[r]=Math.max(92,Math.min(208,g+8)),s.data[r+1]=Math.max(88,Math.min(198,g+1)),s.data[r+2]=Math.max(80,Math.min(186,g-9)),s.data[r+3]=255;let _=Math.max(0,Math.min(255,128+m*2.1));c.data[r]=_,c.data[r+1]=_,c.data[r+2]=_,c.data[r+3]=255;let v=Math.max(95,Math.min(242,206-u*42+m*.8));l.data[r]=v,l.data[r+1]=v,l.data[r+2]=v,l.data[r+3]=255}n.putImageData(s,0,0),i.putImageData(c,0,0),o.putImageData(l,0,0);for(let e=128;e<512;e+=128)n.fillStyle=`rgba(66, 60, 54, 0.58)`,n.fillRect(e-2,0,4,512),n.fillStyle=`rgba(218, 208, 194, 0.34)`,n.fillRect(e+2,0,2,512),i.fillStyle=`#383838`,i.fillRect(e-2,0,4,512);for(let e=0;e<512;e+=128){let t=e===0;n.fillStyle=t?`#423d37`:`rgba(66, 60, 54, 0.62)`,n.fillRect(0,e,512,t?7:4),n.fillStyle=`rgba(222, 212, 198, 0.38)`,n.fillRect(0,e+(t?7:4),512,2),i.fillStyle=`#303030`,i.fillRect(0,e,512,t?7:4)}for(let t=0;t<11;t++){let t=e()*512,r=e()*512;n.strokeStyle=`rgba(64, 58, 52, 0.52)`,i.strokeStyle=`rgba(42, 42, 42, 0.72)`,n.lineWidth=1.5,i.lineWidth=2,n.beginPath(),i.beginPath(),n.moveTo(t,r),i.moveTo(t,r);for(let a=0;a<5;a++)t+=(e()-.5)*32,r+=e()*24,n.lineTo(t,r),i.lineTo(t,r);n.stroke(),i.stroke()}n.fillStyle=`rgba(214, 152, 36, 0.78)`,n.fillRect(20,0,7,512),n.fillRect(485,0,7,512),n.fillStyle=`rgba(248, 245, 236, 0.72)`;for(let e=26;e<512;e+=128)n.fillRect(252,e,8,72);let u=(e,t,n,r)=>(e.wrapS=te,e.wrapT=te,e.repeat.set(t,n),e.anisotropy=4,r&&(e.colorSpace=yt),e),d=u(new Ui(t),1,4,!0),f=u(new Ui(r),1,4,!1),p=u(new Ui(a),1,4,!1),m=document.createElement(`canvas`);m.width=128,m.height=256;let h=m.getContext(`2d`);h.fillStyle=`#d49424`,h.fillRect(0,0,128,256),h.fillStyle=`#1d2128`;for(let e=-128;e<384;e+=64)h.beginPath(),h.moveTo(0,e),h.lineTo(128,e+48),h.lineTo(128,e+80),h.lineTo(0,e+32),h.closePath(),h.fill();h.fillStyle=`rgba(18, 20, 24, 0.24)`;for(let t=0;t<180;t++)h.fillRect(e()*128,e()*256,2+e()*8,2+e()*6);let g=u(new Ui(m),1,14,!0),_=document.createElement(`canvas`);_.width=256,_.height=256;let v=_.getContext(`2d`);v.fillStyle=`#7e8791`,v.fillRect(0,0,256,256);for(let t=0;t<700;t++){let t=105+Math.floor(e()*42);v.fillStyle=`rgba(${t},${t+2},${t+5},0.22)`,v.fillRect(e()*256,e()*256,2+e()*16,1+e()*3)}v.strokeStyle=`rgba(24, 28, 34, 0.55)`,v.lineWidth=3,v.strokeRect(4,4,248,120),v.strokeRect(4,132,248,120),v.fillStyle=`#b6c0cb`;for(let e=16;e<248;e+=28)for(let t of[14,114,142,242])v.beginPath(),v.arc(e,t,3,0,Math.PI*2),v.fill();let y=u(new Ui(_),1,4,!1),b=document.createElement(`canvas`);b.width=256,b.height=128;let x=b.getContext(`2d`);x.fillStyle=`#181b20`,x.fillRect(0,0,256,128),x.fillStyle=`#2d333c`;for(let e=0;e<256;e+=16)x.fillRect(e+2,8,10,48),x.fillRect(e+8,72,10,48);return{albedo:d,bump:f,roughness:p,hazardCurb:g,steelPlate:y,tireTread:u(new Ui(b),4,1,!0)}}function Wd(){let e={uTime:{value:0}},t=new K(new ka(235,36,24),new Ba({side:1,depthWrite:!1,fog:!1,uniforms:e,vertexShader:`
      varying vec3 vWorldDir;
      void main() {
        vWorldDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform float uTime;
      varying vec3 vWorldDir;

      float hash11(float p) {
        p = fract(p * 0.1031);
        p *= p + 33.33;
        p *= p + p;
        return fract(p);
      }

      float noise2(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash11(i.x + i.y * 57.0);
        float b = hash11(i.x + 1.0 + i.y * 57.0);
        float c = hash11(i.x + (i.y + 1.0) * 57.0);
        float d = hash11(i.x + 1.0 + (i.y + 1.0) * 57.0);
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        vec3 dir = normalize(vWorldDir);
        float y = dir.y;

        // Rich tactical twilight-to-golden-hour gradient
        vec3 zenith = vec3(0.065, 0.105, 0.195);
        vec3 upperHaze = vec3(0.21, 0.19, 0.28);
        vec3 sunsetBand = vec3(0.76, 0.35, 0.20);
        vec3 horizonGlow = vec3(0.96, 0.56, 0.26);

        float h1 = smoothstep(-0.02, 0.16, y);
        float h2 = smoothstep(0.12, 0.42, y);
        float h3 = smoothstep(0.35, 0.85, y);

        vec3 col = mix(horizonGlow, sunsetBand, h1);
        col = mix(col, upperHaze, h2);
        col = mix(col, zenith, h3);

        // Low-angle blazing sunset ahead-left of the bridge
        vec3 sunDir = normalize(vec3(-0.38, 0.21, -0.90));
        float sunCos = max(0.0001, dot(dir, sunDir));
        col += vec3(0.95, 0.48, 0.18) * pow(sunCos, 6.0) * 0.68;
        col += vec3(1.38, 0.94, 0.56) * smoothstep(0.9962, 0.9992, sunCos);

        // Stratified sunset clouds lit from underneath
        if (y > 0.01) {
          vec2 cloudUv = dir.xz / (y + 0.18) * 1.45 + vec2(uTime * 0.012, -uTime * 0.006);
          float c1 = noise2(cloudUv * 2.2);
          float c2 = noise2(cloudUv * 5.1 - 3.4);
          float cloud = smoothstep(0.47, 0.78, c1 * 0.68 + c2 * 0.32) * smoothstep(0.01, 0.11, y) * (1.0 - smoothstep(0.38, 0.72, y));
          vec3 cloudDark = vec3(0.14, 0.13, 0.20);
          vec3 cloudRim = vec3(0.98, 0.55, 0.28);
          vec3 cloudCol = mix(cloudDark, cloudRim, pow(sunCos, 2.2) * 0.85 + 0.15);
          col = mix(col, cloudCol, cloud * 0.68);
        }

        // Distant jagged bay headlands along horizon (computed without atan division!)
        float ridgeWave =
          0.028 +
          0.024 * sin(dir.x * 3.8 + dir.z * 2.1 + 0.7) +
          0.012 * sin(dir.x * 9.5 - dir.z * 7.4 - 1.2) +
          0.006 * cos(dir.x * 18.0 + dir.z * 13.0);
        float channelClear = smoothstep(0.09, 0.36, abs(dir.x));
        float ridge1 = ridgeWave * channelClear;

        if (y > -0.04 && y < ridge1) {
          vec3 mtnCol = mix(vec3(0.11, 0.11, 0.15), vec3(0.24, 0.16, 0.17), pow(sunCos, 3.0));
          col = mix(col, mtnCol, smoothstep(ridge1, ridge1 - 0.006, y));
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `}));return t.frustumCulled=!1,{mesh:t,uniforms:e}}var Gd=`
  uniform float uTime;
  varying vec3 vWorldPos;
  varying float vWaveElev;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    float w1 = sin(worldPos.x * 0.12 + worldPos.z * 0.05 + uTime * 1.45) * 0.28;
    float w2 = cos(worldPos.x * -0.07 + worldPos.z * 0.14 - uTime * 1.15) * 0.22;
    float w3 = sin(worldPos.x * 0.23 - worldPos.z * 0.19 + uTime * 2.1) * 0.09;
    worldPos.y += w1 + w2 + w3;
    vWorldPos = worldPos.xyz;
    vWaveElev = w1 + w2 + w3;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`,Kd=`
  uniform float uTime;
  uniform vec3 uCamPos;
  varying vec3 vWorldPos;
  varying float vWaveElev;

  void main() {
    vec2 p = vWorldPos.xz;

    // Multi-directional analytic wave derivatives for crisp wind-chopped ocean normals
    float dx =
      0.16 * cos(p.x * 0.34 + p.y * 0.21 + uTime * 1.8) -
      0.13 * sin(p.x * -0.27 + p.y * 0.43 - uTime * 1.4) +
      0.09 * cos(p.x * 0.78 - p.y * 0.61 + uTime * 2.7);
    float dz =
      0.11 * cos(p.x * 0.34 + p.y * 0.21 + uTime * 1.8) +
      0.18 * sin(p.x * -0.27 + p.y * 0.43 - uTime * 1.4) -
      0.08 * cos(p.x * 0.78 - p.y * 0.61 + uTime * 2.7);

    vec3 N = normalize(vec3(-dx, 1.0, -dz));
    vec3 V = normalize(uCamPos - vWorldPos);

    // Schlick Fresnel sky reflection (strictly positive pow base for mobile GLSL ES)
    float NoV = clamp(dot(N, V), 0.02, 0.9999);
    float fresnel = pow(max(0.0001, 1.0 - NoV), 4.0);

    vec3 deepTrough = vec3(0.028, 0.068, 0.105);
    vec3 seaBody = vec3(0.055, 0.145, 0.195);
    vec3 skyReflect = mix(vec3(0.22, 0.26, 0.36), vec3(0.88, 0.44, 0.21), smoothstep(-0.2, 0.85, -V.z));

    float crestMix = smoothstep(-0.38, 0.42, vWaveElev);
    vec3 col = mix(deepTrough, seaBody, crestMix);
    col = mix(col, skyReflect, clamp(fresnel * 0.78 + 0.08, 0.0, 0.88));

    // Golden-Hour Sun Specular Glitter Path across the bay
    vec3 sunDir = normalize(vec3(-0.38, 0.21, -0.90));
    vec3 H = normalize(sunDir + V);
    float NoH = max(0.0001, dot(N, H));
    float specTight = pow(NoH, 96.0);
    float specBroad = pow(NoH, 18.0);
    col += vec3(1.55, 0.86, 0.38) * specTight * 1.35;
    col += vec3(0.55, 0.26, 0.10) * specBroad * 0.42;

    // Subtle whitecap foam streaks on high wave crests
    float chop = sin(p.x * 0.63 + p.y * 0.39 + uTime * 2.1) * cos(p.x * -0.49 + p.y * 0.71 - uTime * 1.6);
    float whitecap = smoothstep(0.32, 0.56, vWaveElev + chop * 0.22);
    col = mix(col, vec3(0.76, 0.72, 0.68), whitecap * 0.28);

    // Bridge deck shadow band directly beneath roadway (X in [-5.8, +5.8])
    float underBridge = 1.0 - smoothstep(5.2, 10.5, abs(p.x));
    col *= (1.0 - underBridge * 0.44);

    // Distance atmospheric golden-haze blend
    float dist = length(uCamPos.xz - p);
    float dNorm = dist * 0.0046;
    float fogFactor = 1.0 - exp(-(dNorm * dNorm));
    col = mix(col, vec3(0.56, 0.31, 0.22), clamp(fogFactor, 0.0, 0.92));

    gl_FragColor = vec4(col, 1.0);
  }
`,qd=40,Jd=10;function Yd(e,t){let n=Math.max(0,Math.min(1,-t/qd)),r=e===0?1-n:n;return 3.65+13.75*r*r}function Xd(e,t){let n=[];for(let r=0;r<=16;r++){let i=-(r/16)*qd;n.push(new V(t,Yd(e,i),i))}return new ja(new sa(n),20,.17,8,!1)}var Zd=class{root=new U;textures;waterMesh;waterUniforms;chunks=[];bossPlatform;atmospherePoints;motePositions;moteCount=160;constructor(){this.textures=Ud(),this.waterUniforms={uTime:{value:0},uCamPos:{value:new V(0,9,14)}};let e=new Da(420,560,64,84);e.rotateX(-Math.PI/2);let t=new Ba({vertexShader:Gd,fragmentShader:Kd,uniforms:this.waterUniforms});this.waterMesh=new K(e,t),this.waterMesh.position.set(0,-4.6,-140),this.root.add(this.waterMesh);let n=new Y({map:this.textures.albedo,bumpMap:this.textures.bump,bumpScale:.045,roughnessMap:this.textures.roughness,roughness:.86,metalness:.12}),r=new Y({color:6646902,bumpMap:this.textures.bump,bumpScale:.03,roughness:.82,metalness:.08}),i=new Y({map:this.textures.hazardCurb,roughness:.56,metalness:.16}),a=new Y({color:5661038,bumpMap:this.textures.steelPlate,bumpScale:.025,roughness:.36,metalness:.42}),o=new Y({color:8556445,roughness:.3,metalness:.46}),s=new Y({color:11024425,bumpMap:this.textures.steelPlate,bumpScale:.035,roughness:.44,metalness:.32}),c=new Y({color:16765578,emissive:16751416,emissiveIntensity:2.1,roughness:.2}),l=new Y({color:16731469,emissive:16719398,emissiveIntensity:2.6,roughness:.2}),u={0:[Xd(0,-6.05),Xd(0,6.05)],1:[Xd(1,-6.05),Xd(1,6.05)]};for(let e=0;e<Jd;e++){let t=e%2,d=this.createBridgeChunk(t,u[t],n,r,i,a,o,s,c,l);d.position.z=40-e*qd,this.chunks.push(d),this.root.add(d)}this.bossPlatform=this.createBossPlatform(n,r,i,a,s,c),this.root.add(this.bossPlatform),this.motePositions=new Float32Array(this.moteCount*3);let d=new Float32Array(this.moteCount*3),f=new W;for(let e=0;e<this.moteCount;e++)this.motePositions[e*3]=e*37%36-18,this.motePositions[e*3+1]=.4+e*19%11*.85,this.motePositions[e*3+2]=-(e*29%140)+15,e%3==0?f.setHex(16752451):f.setHex(14468788),d[e*3]=f.r,d[e*3+1]=f.g,d[e*3+2]=f.b;let p=document.createElement(`canvas`);p.width=64,p.height=64;let m=p.getContext(`2d`),h=m.createRadialGradient(32,32,2,32,32,30);h.addColorStop(0,`rgba(255, 255, 255, 1.0)`),h.addColorStop(.38,`rgba(255, 236, 198, 0.65)`),h.addColorStop(1,`rgba(255, 200, 140, 0.0)`),m.fillStyle=h,m.fillRect(0,0,64,64);let g=new Ui(p),_=new Jr;_.setAttribute(`position`,new Nr(this.motePositions,3)),_.setAttribute(`color`,new Nr(d,3));let v=new Fi({size:.24,map:g,vertexColors:!0,transparent:!0,opacity:.76,blending:2,depthWrite:!1});this.atmospherePoints=new Bi(_,v),this.root.add(this.atmospherePoints)}createBridgeChunk(e,t,n,r,i,a,o,s,c,l){let u=new U,d=new K(new q(11.5,.55,qd),n);d.position.set(0,-.275,-20),d.receiveShadow=!0,u.add(d);let f=new K(new q(12.2,1.05,qd),a);f.position.set(0,-1.05,-20),u.add(f);let p=new K(t[0],o),m=new K(t[1],o);p.castShadow=!0,m.castShadow=!0,u.add(p,m);for(let t=0;t<2;t++){let n=t===0?-1:1,s=new K(new q(.36,.18,qd),i);s.position.set(n*5.18,.09,-20),s.receiveShadow=!0,u.add(s);let l=new K(new q(.46,.52,qd),r);l.position.set(n*5.54,.26,-20),l.castShadow=!0,l.receiveShadow=!0,u.add(l);let d=new K(new q(.16,.12,qd),a);d.position.set(n*5.62,.88,-20),u.add(d);for(let e=-3;e>=-38;e-=5){let t=new K(new q(.14,.45,.14),a);t.position.set(n*5.62,.68,e),u.add(t)}for(let t=-4;t>=-37;t-=8){let r=Yd(e,t),i=Math.max(1,r-.5),s=new K(new J(.032,.032,i,6),o);s.position.set(n*6.05,.5+i*.5,t),u.add(s);let c=new K(new J(.22,.22,.24,8),a);c.rotation.x=Math.PI/2,c.position.set(n*6.05,r,t),u.add(c)}let f=new K(new J(.08,.12,6.2,8),a);f.position.set(n*5.72,3.1,-20),f.castShadow=!0,u.add(f);let p=new K(new q(1.45,.1,.12),a);p.position.set(n*5.05,6.12,-20),p.rotation.z=-n*.12,u.add(p);let m=new K(new q(.42,.09,.24),c);m.position.set(n*4.42,6,-20),u.add(m)}if(e===0){let e=new K(new q(15.6,4.2,3.4),r);e.position.set(0,-3.4,0),u.add(e);for(let e of[-1,1]){let t=new K(new q(1.55,13,1.75),s);t.position.set(e*6.05,4.95,0),t.castShadow=!0,t.receiveShadow=!0,u.add(t);let n=new K(new q(1.22,8.6,1.4),s);n.position.set(e*6.05,14.8,0),n.castShadow=!0,u.add(n);let r=new K(new q(1.35,.55,1.65),a);r.position.set(e*6.05,19.25,0),u.add(r);let i=new K(new ka(.22,10,8),l);i.position.set(e*6.05,19.72,0),u.add(i)}for(let e of[11.6,15,18.1]){let t=new K(new q(13.4,.9,1.12),s);t.position.set(0,e,0),t.castShadow=!0,u.add(t)}for(let e of[13.3,16.55])for(let t of[-1,1]){let n=new K(new q(11.6,.26,.34),a);n.position.set(0,e,0),n.rotation.z=t*.28,u.add(n)}}return u}createBossPlatform(e,t,n,r,i,a){let o=new U,s=new K(new q(16.2,.84,30),e);s.position.set(0,-.39,-13),s.receiveShadow=!0,o.add(s);for(let e of[-1,1]){let s=new K(new q(.75,.85,30),t);s.position.set(e*7.7,.42,-13),s.castShadow=!0,s.receiveShadow=!0,o.add(s);let c=new K(new q(.45,.24,30),n);c.position.set(e*7.15,.12,-13),o.add(c);let l=new K(new q(1.55,10.5,1.65),i);l.position.set(e*7.65,5,-25),l.castShadow=!0,o.add(l);let u=new K(new q(1.1,.55,.45),r);u.position.set(e*7.3,9.4,-24.2),u.rotation.x=.35,o.add(u);let d=new K(new Da(.92,.38),a);d.position.set(e*7.3,9.32,-23.95),d.rotation.x=.35,o.add(d)}return o}configureBossPlatformZ(e){this.bossPlatform.position.set(0,.01,e+8)}update(e,t,n,r){this.waterUniforms.uTime.value=t,r&&this.waterUniforms.uCamPos.value.copy(r),this.waterMesh.position.z=n-130;for(let e=0;e<this.chunks.length;e++){let t=this.chunks[e];t.position.z-qd>n+50?t.position.z-=400:t.position.z<n-400+50&&(t.position.z+=400)}let i=this.atmospherePoints.geometry.getAttribute(`position`);for(let r=0;r<this.moteCount;r++){let i=r*3,a=this.motePositions[i]+e*(.85+r%4*.22);a>18&&(a=-18),this.motePositions[i]=a;let o=this.motePositions[i+1]+Math.sin(t*2+r)*e*.25;o<.3&&(o=8.5),o>9.5&&(o=.4),this.motePositions[i+1]=o;let s=this.motePositions[i+2];s>n+22?s-=145:s<n-125&&(s+=145),this.motePositions[i+2]=s}i.needsUpdate=!0}},Qd=32,$d={x:0,y:0,visible:!1},ef=class{pool=[];cursor=0;constructor(e){for(let t=0;t<Qd;t++){let t=document.createElement(`div`);t.className=`combat-popup`,t.style.opacity=`0`,e.appendChild(t),this.pool.push({el:t,active:!1,worldX:0,worldY:0,worldZ:0,age:0,maxAge:.75})}}spawn(e,t,n,r,i,a=.82){for(let t=0;t<Qd;t++){let r=this.pool[t];r.active&&r.age<.45&&Math.abs(r.worldX-e)<1.6&&Math.abs(r.worldZ-n)<2.8&&(r.worldY+=.56)}let o=this.pool[this.cursor];this.cursor=(this.cursor+1)%Qd,o.active=!0,o.worldX=e,o.worldY=t,o.worldZ=n,o.age=0,o.maxAge=a,o.el.textContent=r,o.el.className=`combat-popup combat-popup--${i}`}update(e,t){for(let n=0;n<Qd;n++){let r=this.pool[n];if(!r.active)continue;if(r.age+=e,r.age>=r.maxAge){r.active=!1,r.el.style.opacity=`0`;continue}let i=r.age/r.maxAge,a=r.worldY+i*1.45;if(t.projectToScreen(r.worldX,a,r.worldZ,$d),!$d.visible){r.el.style.opacity=`0`;continue}let o=Math.max(64,Math.min(Math.max(64,window.innerWidth-64),$d.x)),s=Math.max(64,Math.min(Math.max(64,window.innerHeight-64),$d.y)),c=i<.7?1:1-(i-.7)/.3,l=i<.16?.75+i/.16*.35:1.1-i*.12;r.el.style.opacity=c.toFixed(2),r.el.style.transform=`translate3d(${o.toFixed(1)}px, ${s.toFixed(1)}px, 0) translate(-50%, -50%) scale(${l.toFixed(2)})`}}clear(){for(let e=0;e<Qd;e++)this.pool[e].active=!1,this.pool[e].el.style.opacity=`0`}},tf=28,nf=36,rf=56,af=new V,of=new Jt,sf=new On,cf=new V,lf=new vn,uf=new W,df=class{ringMesh;ringX=new Float32Array(tf);ringZ=new Float32Array(tf);ringAge=new Float32Array(tf);ringMaxAge=new Float32Array(tf);ringMaxRadius=new Float32Array(tf);ringR=new Float32Array(tf);ringG=new Float32Array(tf);ringB=new Float32Array(tf);activeRings=0;flashMesh;flashX=new Float32Array(nf);flashY=new Float32Array(nf);flashZ=new Float32Array(nf);flashAge=new Float32Array(nf);flashMaxAge=new Float32Array(nf);flashScale=new Float32Array(nf);flashR=new Float32Array(nf);flashG=new Float32Array(nf);flashB=new Float32Array(nf);activeFlashes=0;splashMesh;splashX=new Float32Array(rf);splashY=new Float32Array(rf);splashZ=new Float32Array(rf);splashAge=new Float32Array(rf);splashMaxAge=new Float32Array(rf);splashScale=new Float32Array(rf);splashR=new Float32Array(rf);splashG=new Float32Array(rf);splashB=new Float32Array(rf);activeSplashes=0;constructor(e){let t=new Oa(.76,1,28);t.rotateX(-Math.PI/2);let n=new G({color:16777215,side:2,transparent:!0,opacity:.9,blending:2,depthWrite:!1});this.ringMesh=new Oi(t,n,tf),this.ringMesh.instanceMatrix.setUsage(Tt),this.ringMesh.frustumCulled=!1,this.ringMesh.count=0;for(let e=0;e<tf;e++)this.ringMesh.setColorAt(e,uf.setRGB(1,1,1));e.add(this.ringMesh);let r=new q(.28,.045,.42),i=new q(.045,.28,.42),a=new q(.12,.12,.24),o=r.toNonIndexed(),s=i.toNonIndexed(),c=a.toNonIndexed(),l=new Float32Array((o.attributes.position.count+s.attributes.position.count+c.attributes.position.count)*3);l.set(o.attributes.position.array,0),l.set(s.attributes.position.array,o.attributes.position.array.length),l.set(c.attributes.position.array,o.attributes.position.array.length+s.attributes.position.array.length),r.dispose(),i.dispose(),a.dispose(),o.dispose(),s.dispose(),c.dispose();let u=new Jr;u.setAttribute(`position`,new Nr(l,3)),u.computeVertexNormals();let d=new G({color:16777215,transparent:!0,opacity:.95,blending:2,depthWrite:!1});this.flashMesh=new Oi(u,d,nf),this.flashMesh.instanceMatrix.setUsage(Tt),this.flashMesh.frustumCulled=!1,this.flashMesh.count=0;for(let e=0;e<nf;e++)this.flashMesh.setColorAt(e,uf.setRGB(1,1,1));e.add(this.flashMesh);let f=document.createElement(`canvas`);f.width=128,f.height=128;let p=f.getContext(`2d`),m=p.createRadialGradient(64,64,4,64,64,58);m.addColorStop(0,`rgba(255, 255, 255, 1.0)`),m.addColorStop(.45,`rgba(255, 245, 210, 0.72)`),m.addColorStop(.72,`rgba(255, 220, 140, 0.28)`),m.addColorStop(1,`rgba(255, 200, 90, 0.0)`),p.fillStyle=m,p.fillRect(0,0,128,128),p.save(),p.translate(64,64),p.fillStyle=`rgba(255, 255, 255, 0.88)`;for(let e=0;e<6;e++)p.rotate(Math.PI/3),p.beginPath(),p.moveTo(-5,0),p.lineTo(0,-60),p.lineTo(5,0),p.closePath(),p.fill();p.restore();let h=new Da(.95,.95);h.rotateX(-.42);let g=new G({color:16777215,map:new Ui(f),transparent:!0,opacity:.95,blending:2,side:2,depthWrite:!1});this.splashMesh=new Oi(h,g,rf),this.splashMesh.instanceMatrix.setUsage(Tt),this.splashMesh.frustumCulled=!1,this.splashMesh.count=0;for(let e=0;e<rf;e++)this.splashMesh.setColorAt(e,uf.setRGB(1,1,1));e.add(this.splashMesh)}clear(){this.activeRings=0,this.activeFlashes=0,this.activeSplashes=0,this.ringMesh.count=0,this.flashMesh.count=0,this.splashMesh.count=0}spawnShockwave(e,t,n,r,i){if(this.activeRings>=tf)return;let a=this.activeRings++;this.ringX[a]=e,this.ringZ[a]=t,this.ringAge[a]=0,this.ringMaxAge[a]=Math.max(.08,r),this.ringMaxRadius[a]=n,uf.setHex(i),this.ringR[a]=uf.r*1.45,this.ringG[a]=uf.g*1.45,this.ringB[a]=uf.b*1.45}spawnMuzzleFlash(e,t,n,r,i){if(this.activeFlashes>=nf)return;let a=this.activeFlashes++;this.flashX[a]=e,this.flashY[a]=t,this.flashZ[a]=n,this.flashAge[a]=0,this.flashMaxAge[a]=.055,this.flashScale[a]=r,uf.setHex(i),this.flashR[a]=uf.r*1.9,this.flashG[a]=uf.g*1.7,this.flashB[a]=uf.b*1.4}spawnImpactSplash(e,t,n,r,i){if(this.activeSplashes>=rf)return;let a=this.activeSplashes++;this.splashX[a]=e,this.splashY[a]=t,this.splashZ[a]=n,this.splashAge[a]=0,this.splashMaxAge[a]=.11,this.splashScale[a]=r,uf.setHex(i),this.splashR[a]=uf.r*1.65,this.splashG[a]=uf.g*1.55,this.splashB[a]=uf.b*1.35}updateAndSync(e){let t=0;for(;t<this.activeRings;){let n=this.ringAge[t]+e;if(n>=this.ringMaxAge[t]){let e=this.activeRings-1;t!==e&&(this.ringX[t]=this.ringX[e],this.ringZ[t]=this.ringZ[e],this.ringAge[t]=this.ringAge[e],this.ringMaxAge[t]=this.ringMaxAge[e],this.ringMaxRadius[t]=this.ringMaxRadius[e],this.ringR[t]=this.ringR[e],this.ringG[t]=this.ringG[e],this.ringB[t]=this.ringB[e]),this.activeRings=e;continue}this.ringAge[t]=n;let r=n/this.ringMaxAge[t],i=.35+(1-(1-r)*(1-r))*this.ringMaxRadius[t],a=1-r;af.set(this.ringX[t],.06,this.ringZ[t]),of.identity(),cf.set(i,1,i),lf.compose(af,of,cf),this.ringMesh.setMatrixAt(t,lf),uf.setRGB(this.ringR[t]*a,this.ringG[t]*a,this.ringB[t]*a),this.ringMesh.setColorAt(t,uf),t++}this.ringMesh.count=this.activeRings,this.ringMesh.instanceMatrix.needsUpdate=!0,this.ringMesh.instanceColor&&(this.ringMesh.instanceColor.needsUpdate=!0);let n=0;for(;n<this.activeFlashes;){let t=this.flashAge[n]+e;if(t>=this.flashMaxAge[n]){let e=this.activeFlashes-1;n!==e&&(this.flashX[n]=this.flashX[e],this.flashY[n]=this.flashY[e],this.flashZ[n]=this.flashZ[e],this.flashAge[n]=this.flashAge[e],this.flashMaxAge[n]=this.flashMaxAge[e],this.flashScale[n]=this.flashScale[e],this.flashR[n]=this.flashR[e],this.flashG[n]=this.flashG[e],this.flashB[n]=this.flashB[e]),this.activeFlashes=e;continue}this.flashAge[n]=t;let r=1-t/this.flashMaxAge[n],i=this.flashScale[n]*(.65+r*.55);af.set(this.flashX[n],this.flashY[n],this.flashZ[n]),sf.set(0,0,n*1.1+t*28),of.setFromEuler(sf),cf.set(i,i,i*1.25),lf.compose(af,of,cf),this.flashMesh.setMatrixAt(n,lf),uf.setRGB(this.flashR[n]*r,this.flashG[n]*r,this.flashB[n]*r),this.flashMesh.setColorAt(n,uf),n++}this.flashMesh.count=this.activeFlashes,this.flashMesh.instanceMatrix.needsUpdate=!0,this.flashMesh.instanceColor&&(this.flashMesh.instanceColor.needsUpdate=!0);let r=0;for(;r<this.activeSplashes;){let t=this.splashAge[r]+e;if(t>=this.splashMaxAge[r]){let e=this.activeSplashes-1;r!==e&&(this.splashX[r]=this.splashX[e],this.splashY[r]=this.splashY[e],this.splashZ[r]=this.splashZ[e],this.splashAge[r]=this.splashAge[e],this.splashMaxAge[r]=this.splashMaxAge[e],this.splashScale[r]=this.splashScale[e],this.splashR[r]=this.splashR[e],this.splashG[r]=this.splashG[e],this.splashB[r]=this.splashB[e]),this.activeSplashes=e;continue}this.splashAge[r]=t;let n=1-t/this.splashMaxAge[r],i=this.splashScale[r]*(.45+(1-n*n)*.85);af.set(this.splashX[r],this.splashY[r],this.splashZ[r]),sf.set(0,0,r*.85+t*14),of.setFromEuler(sf),cf.set(i,i,i),lf.compose(af,of,cf),this.splashMesh.setMatrixAt(r,lf),uf.setRGB(this.splashR[r]*n,this.splashG[r]*n,this.splashB[r]*n),this.splashMesh.setColorAt(r,uf),r++}this.splashMesh.count=this.activeSplashes,this.splashMesh.instanceMatrix.needsUpdate=!0,this.splashMesh.instanceColor&&(this.splashMesh.instanceColor.needsUpdate=!0)}},ff=140,pf=48,mf=64,hf=10+ff+pf,gf=1.28,_f=1.48,vf=new V,yf=new Jt,bf=new On,xf=new V,Sf=new vn,Cf=new W;function wf(){let e=document.createElement(`canvas`);e.width=64,e.height=64;let t=e.getContext(`2d`),n=t.createRadialGradient(32,32,3,32,32,30);return n.addColorStop(0,`rgba(6, 9, 14, 0.82)`),n.addColorStop(.55,`rgba(6, 9, 14, 0.42)`),n.addColorStop(1,`rgba(6, 9, 14, 0.0)`),t.fillStyle=n,t.fillRect(0,0,64,64),new Ui(e)}var Tf=`
  {
    float phase = uStrideTime + float(gl_InstanceID) * 0.92;
    float sRaw = sin(phase);
    float strideVal = sRaw * uStrideAmp;
    float limbAngle = 0.0;
    float bootLift = 0.0;
    float pivotY = 0.38;
    if (aPartId > 0.5 && aPartId < 1.5) {
      limbAngle = strideVal;
      bootLift = max(0.0, sRaw) * uStrideAmp * 0.065;
    } else if (aPartId > 1.5 && aPartId < 2.5) {
      limbAngle = -strideVal;
      bootLift = max(0.0, -sRaw) * uStrideAmp * 0.065;
    } else if (aPartId > 2.5 && aPartId < 3.5) {
      limbAngle = -strideVal * 0.25;
      pivotY = 0.45;
    } else if (aPartId > 3.5) {
      limbAngle = uRecoilKick * 0.08;
      pivotY = 0.58;
      transformed.z += uRecoilKick * 0.055;
      transformed.y += uRecoilKick * 0.015;
    }
    if (abs(limbAngle) > 0.001) {
      float c = cos(limbAngle);
      float s = sin(limbAngle);
      vec3 rel = transformed - vec3(0.0, pivotY, 0.0);
      transformed.y = pivotY + rel.y * c - rel.z * s + bootLift;
      transformed.z = rel.y * s + rel.z * c;
    }
  }
`;function Ef(e,t,n,r=!1){e.customProgramCacheKey=()=>n,e.onBeforeCompile=e=>{e.uniforms.uStrideTime=t.uStrideTime,e.uniforms.uStrideAmp=t.uStrideAmp,e.uniforms.uRecoilKick=t.uRecoilKick,e.vertexShader=e.vertexShader.replace(`#include <common>`,`
        #include <common>
        attribute float aPartId;
        ${r?`attribute float aHitFlash;
varying float vHitFlash;`:``}
        varying vec3 vToonWorldNormal;
        uniform float uStrideTime;
        uniform float uStrideAmp;
        uniform float uRecoilKick;
        `).replace(`#include <beginnormal_vertex>`,`
        #include <beginnormal_vertex>
        {
          float phase = uStrideTime + float(gl_InstanceID) * 0.92;
          float strideVal = sin(phase) * uStrideAmp;
          float nAngle = 0.0;
          if (aPartId > 0.5 && aPartId < 1.5) {
            nAngle = strideVal;
          } else if (aPartId > 1.5 && aPartId < 2.5) {
            nAngle = -strideVal;
          } else if (aPartId > 2.5 && aPartId < 3.5) {
            nAngle = -strideVal * 0.25;
          } else if (aPartId > 3.5) {
            nAngle = uRecoilKick * 0.09;
          }
          if (abs(nAngle) > 0.001) {
            float cn = cos(nAngle);
            float sn = sin(nAngle);
            float ny = objectNormal.y * cn - objectNormal.z * sn;
            float nz = objectNormal.y * sn + objectNormal.z * cn;
            objectNormal.y = ny;
            objectNormal.z = nz;
          }
        }
        `).replace(`#include <begin_vertex>`,`
        #include <begin_vertex>
        ${r?`vHitFlash = aHitFlash;`:``}
        ${Tf}
        {
          vec3 wn = mat3(modelMatrix) * objectNormal;
          #ifdef USE_INSTANCING
            wn = mat3(instanceMatrix) * objectNormal;
          #endif
          vToonWorldNormal = wn / max(0.0001, length(wn));
        }
        `),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`
        #include <common>
        ${r?`varying float vHitFlash;`:``}
        varying vec3 vToonWorldNormal;
        `).replace(`#include <dithering_fragment>`,`
        #include <dithering_fragment>
        {
          // Crisp stylized 2-band cel-saturation lift + sky rim so characters stay vivid in shadow!
          vec3 wn = vToonWorldNormal / max(0.0001, length(vToonWorldNormal));
          float topBand = smoothstep(-0.22, 0.35, wn.y * 0.72 - wn.z * 0.38 - wn.x * 0.25);
          gl_FragColor.rgb *= mix(0.92, 1.18, topBand);
          float skyRim = smoothstep(0.55, 0.92, wn.y);
          gl_FragColor.rgb += vec3(0.05, 0.07, 0.10) * skyRim;
        }
        ${r?`
        if (vHitFlash > 0.01) {
          gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.22, 1.25, 1.32), clamp(vHitFlash * 1.18, 0.0, 0.96));
        }
        `:``}
        `)}}function Df(e,t,n){let r=new G({color:725016,side:1}),i=t.toFixed(4);return r.customProgramCacheKey=()=>n,r.onBeforeCompile=t=>{t.uniforms.uStrideTime=e.uStrideTime,t.uniforms.uStrideAmp=e.uStrideAmp,t.uniforms.uRecoilKick=e.uRecoilKick,t.vertexShader=t.vertexShader.replace(`#include <common>`,`
        #include <common>
        attribute float aPartId;
        attribute vec3 aOutlineNormal;
        uniform float uStrideTime;
        uniform float uStrideAmp;
        uniform float uRecoilKick;
        `).replace(`#include <begin_vertex>`,`
        #include <begin_vertex>
        {
          vec3 safeNorm = aOutlineNormal / max(0.0001, length(aOutlineNormal));
          transformed += safeNorm * ${i};
        }
        ${Tf}
        `)},r}function Of(e,t,n){let r=du.toFixed(4),i=(fu-.02).toFixed(4);e.customProgramCacheKey=()=>n,e.onBeforeCompile=e=>{e.uniforms.uBarrelSpin=t.uBarrelSpin,e.uniforms.uRecoilKick=t.uRecoilKick,e.vertexShader=e.vertexShader.replace(`#include <common>`,`
        #include <common>
        attribute float aSpinPart;
        uniform float uBarrelSpin;
        uniform float uRecoilKick;
        `).replace(`#include <begin_vertex>`,`
        #include <begin_vertex>
        {
          if (aSpinPart > 0.5) {
            float ang = uBarrelSpin + float(gl_InstanceID) * 0.55;
            float cs = cos(ang);
            float sn = sin(ang);
            vec2 relXY = transformed.xy - vec2(${r}, ${i});
            transformed.x = ${r} + relXY.x * cs - relXY.y * sn;
            transformed.y = ${i} + relXY.x * sn + relXY.y * cs;
          }
          transformed.z += uRecoilKick * 0.062;
          transformed.y += uRecoilKick * 0.018;
        }
        `)}}function kf(e,t,n){let r=du.toFixed(4),i=(fu-.02).toFixed(4),a=t.toFixed(4),o=new G({color:725016,side:1});return o.customProgramCacheKey=()=>n,o.onBeforeCompile=t=>{t.uniforms.uBarrelSpin=e.uBarrelSpin,t.uniforms.uRecoilKick=e.uRecoilKick,t.vertexShader=t.vertexShader.replace(`#include <common>`,`
        #include <common>
        attribute float aSpinPart;
        attribute vec3 aOutlineNormal;
        uniform float uBarrelSpin;
        uniform float uRecoilKick;
        `).replace(`#include <begin_vertex>`,`
        #include <begin_vertex>
        {
          vec3 safeNorm = aOutlineNormal / max(0.0001, length(aOutlineNormal));
          transformed += safeNorm * ${a};
          if (aSpinPart > 0.5) {
            float ang = uBarrelSpin + float(gl_InstanceID) * 0.55;
            float cs = cos(ang);
            float sn = sin(ang);
            vec2 relXY = transformed.xy - vec2(${r}, ${i});
            transformed.x = ${r} + relXY.x * cs - relXY.y * sn;
            transformed.y = ${i} + relXY.x * sn + relXY.y * cs;
          }
          transformed.z += uRecoilKick * 0.062;
          transformed.y += uRecoilKick * 0.018;
        }
        `)},o}var Af=class{playerMesh;playerOutlineMesh;enemyMesh;enemyOutlineMesh;heavyEnemyMesh;heavyEnemyOutlineMesh;squadWeaponMeshes;squadWeaponOutlineMeshes;playerRagdollMesh;enemyRagdollMesh;bulletMesh;particleMesh;enemyHitFlashAttr;heavyHitFlashAttr;playerUniforms={uStrideTime:{value:0},uStrideAmp:{value:0},uRecoilKick:{value:0}};enemyUniforms={uStrideTime:{value:0},uStrideAmp:{value:.68},uRecoilKick:{value:0}};weaponUniforms={uBarrelSpin:{value:0},uRecoilKick:{value:0}};shadowDiscMesh;shadowDiscCursor=0;constructor(e,t,n){let r=gu(),i=new Y({vertexColors:!0,roughness:.4,metalness:.14});Ef(i,this.playerUniforms,`commando-player-v41`,!1),this.playerMesh=new Oi(r,i,10),this.playerMesh.instanceMatrix.setUsage(Tt),this.playerMesh.frustumCulled=!1,this.playerMesh.count=0,e.add(this.playerMesh);let a=Df(this.playerUniforms,.023,`commando-player-outline-v41`);this.playerOutlineMesh=new Oi(r,a,10),this.playerOutlineMesh.instanceMatrix=this.playerMesh.instanceMatrix,this.playerOutlineMesh.frustumCulled=!1,this.playerOutlineMesh.count=0,e.add(this.playerOutlineMesh);let o=new Y({vertexColors:!0,roughness:.28,metalness:.42});Of(o,this.weaponUniforms,`commando-weapon-v41`);let s=kf(this.weaponUniforms,.017,`commando-weapon-outline-v41`),c={},l={};for(let t of[1,2,3,4,5]){let n=pu(t),r=new Oi(n,o,10);r.instanceMatrix.setUsage(Tt),r.frustumCulled=!1,r.count=0,r.visible=t===1,e.add(r),c[t]=r;let i=new Oi(n,s,10);i.instanceMatrix=r.instanceMatrix,i.frustumCulled=!1,i.count=0,i.visible=t===1,e.add(i),l[t]=i}this.squadWeaponMeshes=c,this.squadWeaponOutlineMeshes=l;let u=_u();this.enemyHitFlashAttr=new bi(new Float32Array(ff),1),this.enemyHitFlashAttr.setUsage(Tt),u.setAttribute(`aHitFlash`,this.enemyHitFlashAttr);let d=new Y({vertexColors:!0,roughness:.4,metalness:.14});Ef(d,this.enemyUniforms,`commando-enemy-v41`,!0),this.enemyMesh=new Oi(u,d,ff),this.enemyMesh.instanceMatrix.setUsage(Tt),this.enemyMesh.frustumCulled=!1,this.enemyMesh.count=0,e.add(this.enemyMesh);let f=Df(this.enemyUniforms,.023,`commando-enemy-outline-v41`);this.enemyOutlineMesh=new Oi(u,f,ff),this.enemyOutlineMesh.instanceMatrix=this.enemyMesh.instanceMatrix,this.enemyOutlineMesh.frustumCulled=!1,this.enemyOutlineMesh.count=0,e.add(this.enemyOutlineMesh);let p=vu();this.heavyHitFlashAttr=new bi(new Float32Array(pf),1),this.heavyHitFlashAttr.setUsage(Tt),p.setAttribute(`aHitFlash`,this.heavyHitFlashAttr);let m=new Y({vertexColors:!0,roughness:.38,metalness:.2});Ef(m,this.enemyUniforms,`commando-heavy-v41`,!0),this.heavyEnemyMesh=new Oi(p,m,pf),this.heavyEnemyMesh.instanceMatrix.setUsage(Tt),this.heavyEnemyMesh.frustumCulled=!1,this.heavyEnemyMesh.count=0,e.add(this.heavyEnemyMesh);let h=Df(this.enemyUniforms,.026,`commando-heavy-outline-v41`);this.heavyEnemyOutlineMesh=new Oi(p,h,pf),this.heavyEnemyOutlineMesh.instanceMatrix=this.heavyEnemyMesh.instanceMatrix,this.heavyEnemyOutlineMesh.frustumCulled=!1,this.heavyEnemyOutlineMesh.count=0,e.add(this.heavyEnemyOutlineMesh);let g=gu(),_=new Y({vertexColors:!0,roughness:.44,metalness:.16});this.playerRagdollMesh=new Oi(g,_,mf),this.playerRagdollMesh.instanceMatrix.setUsage(Tt),this.playerRagdollMesh.frustumCulled=!1,this.playerRagdollMesh.count=0,e.add(this.playerRagdollMesh);let v=_u(),y=new Y({vertexColors:!0,roughness:.42,metalness:.18});this.enemyRagdollMesh=new Oi(v,y,mf),this.enemyRagdollMesh.instanceMatrix.setUsage(Tt),this.enemyRagdollMesh.frustumCulled=!1,this.enemyRagdollMesh.count=0,e.add(this.enemyRagdollMesh);let b=new Da(.95,.95);b.rotateX(-Math.PI/2);let x=new G({map:wf(),transparent:!0,depthWrite:!1});this.shadowDiscMesh=new Oi(b,x,hf),this.shadowDiscMesh.instanceMatrix.setUsage(Tt),this.shadowDiscMesh.frustumCulled=!1,this.shadowDiscMesh.count=0,e.add(this.shadowDiscMesh);let S=yu(),C=new G({color:16777215,vertexColors:!0,transparent:!0,opacity:.96,blending:2,depthWrite:!1});this.bulletMesh=new Oi(S,C,t),this.bulletMesh.instanceMatrix.setUsage(Tt),this.bulletMesh.frustumCulled=!1,this.bulletMesh.count=0;for(let e=0;e<t;e++)this.bulletMesh.setColorAt(e,Cf.setRGB(1,1,1));e.add(this.bulletMesh);let w=new Zi(.58,0),T=new Y({color:16777215,roughness:.36,metalness:.32});this.particleMesh=new Oi(w,T,n),this.particleMesh.instanceMatrix.setUsage(Tt),this.particleMesh.frustumCulled=!1,this.particleMesh.count=0;for(let e=0;e<n;e++)this.particleMesh.setColorAt(e,Cf.setRGB(1,1,1));e.add(this.particleMesh)}syncPlayerSoldiers(e,t,n,r,i,a,o=0,s=0,c=0,l=0,u=0){let d=Math.min(e,10);this.playerMesh.count=d,this.playerOutlineMesh.count=d,this.shadowDiscCursor=0,this.playerUniforms.uStrideTime.value=r*11.8,this.playerUniforms.uStrideAmp.value=i?.66:.28,this.playerUniforms.uRecoilKick.value=s,this.weaponUniforms.uBarrelSpin.value=c,this.weaponUniforms.uRecoilKick.value=s,this.enemyUniforms.uStrideTime.value=r*10.6;let f=this.squadWeaponMeshes[a];for(let e of[1,2,3,4,5]){let t=this.squadWeaponMeshes[e],n=this.squadWeaponOutlineMeshes[e];e===a?(t.visible=d>0,t.count=d,n.visible=d>0,n.count=d):(t.visible=!1,t.count=0,n.visible=!1,n.count=0)}let p=Math.sin(u*Math.PI)*.34,m=iu*(1+Math.sin(u*Math.PI)*.08);for(let e=0;e<d;e++){let a=r*11.8+e*.92,s=(i?Math.abs(Math.sin(a))*.072:Math.sin(r*2.4+e*.7)*.016)+p,c=i?Math.sin(a)*.036:0;vf.set(t[e],s,n[e]),bf.set(i?-.06:-.03,l+-.3-o*.35,c-o),yf.setFromEuler(bf),xf.set(m,m,m),Sf.compose(vf,yf,xf),this.playerMesh.setMatrixAt(e,Sf),bf.set(i?-.04:-.02,l-o*.35,c*.5-o*.7),yf.setFromEuler(bf),Sf.compose(vf,yf,xf),f.setMatrixAt(e,Sf),vf.set(t[e],.022,n[e]),yf.identity();let u=Math.max(.7,1.18-s*.95);xf.set(u,1,u),Sf.compose(vf,yf,xf),this.shadowDiscMesh.setMatrixAt(this.shadowDiscCursor++,Sf)}this.playerMesh.instanceMatrix.needsUpdate=!0,f.instanceMatrix.needsUpdate=!0}beginEnemyFrame(){this.enemyMesh.count=0,this.enemyOutlineMesh.count=0,this.heavyEnemyMesh.count=0,this.heavyEnemyOutlineMesh.count=0}pushEnemySoldier(e,t,n,r){let i=this.enemyMesh.count;if(i>=ff)return;this.enemyMesh.count=i+1,this.enemyOutlineMesh.count=i+1;let a=Math.abs(Math.sin(n))*.068,o=gf*(1+r*.11);if(vf.set(e,a,t),bf.set(.08,0,Math.sin(n)*.048),yf.setFromEuler(bf),xf.set(o,o,o),Sf.compose(vf,yf,xf),this.enemyMesh.setMatrixAt(i,Sf),this.enemyHitFlashAttr.setX(i,r),this.shadowDiscCursor<hf){vf.set(e,.022,t),yf.identity();let n=1.05-a*1.1;xf.set(n,1,n),Sf.compose(vf,yf,xf),this.shadowDiscMesh.setMatrixAt(this.shadowDiscCursor++,Sf)}}pushHeavyEnemySoldier(e,t,n,r){let i=this.heavyEnemyMesh.count;if(i>=pf)return;this.heavyEnemyMesh.count=i+1,this.heavyEnemyOutlineMesh.count=i+1;let a=Math.abs(Math.sin(n*.85))*.058,o=_f*(1+r*.1);if(vf.set(e,a,t),bf.set(.09,0,Math.sin(n*.85)*.042),yf.setFromEuler(bf),xf.set(o,o,o),Sf.compose(vf,yf,xf),this.heavyEnemyMesh.setMatrixAt(i,Sf),this.heavyHitFlashAttr.setX(i,r),this.shadowDiscCursor<hf){vf.set(e,.022,t),yf.identity();let n=1.42-a*1.1;xf.set(n,1,n),Sf.compose(vf,yf,xf),this.shadowDiscMesh.setMatrixAt(this.shadowDiscCursor++,Sf)}}finishEnemyFrame(){this.enemyMesh.instanceMatrix.needsUpdate=!0,this.enemyHitFlashAttr.needsUpdate=!0,this.heavyEnemyMesh.instanceMatrix.needsUpdate=!0,this.heavyHitFlashAttr.needsUpdate=!0,this.shadowDiscMesh.count=this.shadowDiscCursor,this.shadowDiscMesh.instanceMatrix.needsUpdate=!0}syncRagdolls(e){let t=0,n=0,r=e.activeCount;for(let i=0;i<r;i++){let r=1-e.age[i]/e.maxAge[i],a=(e.isEnemy[i]===1?gf:iu)*(r<.3?Math.max(.05,r/.3):1);vf.set(e.x[i],e.y[i],e.z[i]),bf.set(e.rx[i],e.ry[i],e.rz[i]),yf.setFromEuler(bf),xf.set(a,a,a),Sf.compose(vf,yf,xf),e.isEnemy[i]===1?n<mf&&this.enemyRagdollMesh.setMatrixAt(n++,Sf):t<mf&&this.playerRagdollMesh.setMatrixAt(t++,Sf)}this.playerRagdollMesh.count=t,this.enemyRagdollMesh.count=n,t>0&&(this.playerRagdollMesh.instanceMatrix.needsUpdate=!0),n>0&&(this.enemyRagdollMesh.instanceMatrix.needsUpdate=!0)}syncBullets(e){let t=e.activeCount;this.bulletMesh.count=t;for(let n=0;n<t;n++){vf.set(e.x[n],e.y[n],e.z[n]);let t=Math.atan2(e.vx[n],e.vz[n]);bf.set(0,t+Math.PI,0),yf.setFromEuler(bf);let r=e.scale[n];xf.set(r,r,r*1.28),Sf.compose(vf,yf,xf),this.bulletMesh.setMatrixAt(n,Sf),Cf.setRGB(e.colorR[n]*1.85,e.colorG[n]*1.85,e.colorB[n]*1.85),this.bulletMesh.setColorAt(n,Cf)}this.bulletMesh.instanceMatrix.needsUpdate=!0,this.bulletMesh.instanceColor&&(this.bulletMesh.instanceColor.needsUpdate=!0)}syncParticles(e){let t=e.activeCount;this.particleMesh.count=t;for(let n=0;n<t;n++){let t=1-e.age[n]/e.maxAge[n],r=Math.max(.01,e.baseScale[n]*t);vf.set(e.x[n],e.y[n],e.z[n]);let i=e.age[n]*e.spin[n];bf.set(i,i*.7,i*.35),yf.setFromEuler(bf),xf.set(r,r,r),Sf.compose(vf,yf,xf),this.particleMesh.setMatrixAt(n,Sf);let a=e.colorR[n],o=e.colorG[n],s=e.colorB[n],c=a+o+s>1.35?1.45:1;Cf.setRGB(a*c,o*c,s*c),this.particleMesh.setColorAt(n,Cf)}this.particleMesh.instanceMatrix.needsUpdate=!0,this.particleMesh.instanceColor&&(this.particleMesh.instanceColor.needsUpdate=!0)}},jf=44,Mf=-12,Nf=new V,Pf=new V,Ff=new V,If=class{scene;camera;renderer;sunLight;rimLight;skyDome;skyUniforms;armoryRoot=new U;armoryTurntable=new U;armoryRingMat;armoryOuterRing;armoryWeapons;armoryBosses;armoryMode=`WEAPONS`;armoryWeaponTier=1;armoryBossChassis=`WARDEN_MECH`;armoryYaw=-.45;armoryDragSpinFreeze=0;shakeTrauma=0;shakeTime=0;smoothCamX=0;elapsedSkyTime=0;portraitFactor=0;currentCamPos=new V(0,4.9,6.9);currentLookAt=new V(0,.25,-11.5);lastFramingMode=`LIVE_BRIDGE`;constructor(e){this.scene=new er,this.scene.background=new W(1579300),this.scene.fog=new $n(7160374,.0052);let t=Math.max(1,window.innerWidth),n=Math.max(1,window.innerHeight);this.camera=new wo(47,t/n,.3,320),this.camera.position.copy(this.currentCamPos),this.camera.lookAt(this.currentLookAt),this.renderer=new tu({antialias:!0,powerPreference:`default`,stencil:!1,alpha:!1});let r=Math.min(window.devicePixelRatio||1,1.75);this.renderer.setPixelRatio(r),this.renderer.setSize(t,n),this.renderer.toneMapping=4,this.renderer.toneMappingExposure=1.15,this.renderer.domElement.addEventListener(`webglcontextlost`,e=>{e.preventDefault()}),e.appendChild(this.renderer.domElement);let i=Wd();this.skyDome=i.mesh,this.skyUniforms=i.uniforms,this.scene.add(this.skyDome);let a=new fo(16766118,3030096,1.48);this.scene.add(a),this.sunLight=new Do(16757865,2.8),this.sunLight.position.set(-19,17,-24),this.scene.add(this.sunLight),this.scene.add(this.sunLight.target),this.rimLight=new Do(8173810,1.55),this.rimLight.position.set(18,13,18),this.scene.add(this.rimLight),this.scene.add(this.rimLight.target);let o=new Do(16770244,.72);o.position.set(0,10,22),this.scene.add(o),this.armoryRoot.position.set(0,jf,Mf),this.armoryRoot.visible=!1;let s=new K(new J(5.4,5.8,.34,36),new Y({color:1317668,roughness:.48,metalness:.42}));s.position.set(0,-1.04,-.4),this.armoryRoot.add(s);let c=new Y({color:2042167,roughness:.34,metalness:.46}),l=new K(new J(1.75,1.98,.28,28),c);l.position.set(0,-.78,0),this.armoryRoot.add(l);let u=new K(new J(1.32,1.44,.14,28),new Y({color:3095888,roughness:.28,metalness:.48}));u.position.set(0,-.6,0),this.armoryRoot.add(u),this.armoryRingMat=new G({color:16767066,transparent:!0,opacity:.68,blending:2,side:2,depthWrite:!1});let d=new K(new Oa(3.15,3.24,36),this.armoryRingMat);d.rotation.x=-Math.PI/2,d.position.set(0,-.86,-.2),this.armoryRoot.add(d);let f=new K(new Aa(1.22,.032,8,32),this.armoryRingMat);f.rotation.x=Math.PI/2,f.position.set(0,-.5,0),this.armoryRoot.add(f),this.armoryOuterRing=new K(new Oa(1.52,1.62,32),this.armoryRingMat),this.armoryOuterRing.rotation.x=-Math.PI/2,this.armoryOuterRing.position.set(0,-.52,0),this.armoryRoot.add(this.armoryOuterRing);let p=new K(new J(1.48,1.18,1.35,24,1,!0),new G({color:3733247,transparent:!0,opacity:.09,blending:2,side:2,depthWrite:!1}));p.position.set(0,.12,0),this.armoryRoot.add(p),this.armoryRoot.add(this.armoryTurntable),this.armoryWeapons={1:mu(1),2:mu(2),3:mu(3),4:mu(4),5:mu(5)};for(let e of[1,2,3,4,5]){let t=this.armoryWeapons[e],n=e===1?1.85:e===2?1.55:1.38;t.root.scale.setScalar(n),t.root.position.set(0,.18,0),t.root.rotation.z=.1,this.armoryTurntable.add(t.root)}this.armoryBosses=Mu();for(let e of Object.keys(this.armoryBosses)){let t=this.armoryBosses[e],n=e===`SOVEREIGN_TITAN`?.42:.46;t.root.scale.setScalar(n),t.root.position.set(0,-.52,0),t.root.visible=!1,this.armoryTurntable.add(t.root)}this.scene.add(this.armoryRoot),this.syncArmoryVisibility(),this.applyViewportFraming(),window.addEventListener(`resize`,this.handleResize)}applyViewportFraming(){let e=Math.max(1,window.innerWidth),t=Math.max(1,window.innerHeight),n=e/t,r=Math.min(window.devicePixelRatio||1,1.75);this.camera.aspect=n,this.portraitFactor=Math.max(0,Math.min(1,(.95-n)/.5)),this.camera.fov=46+this.portraitFactor*21,this.camera.updateProjectionMatrix(),this.renderer.setPixelRatio(r),this.renderer.setSize(e,t)}handleResize=()=>{this.applyViewportFraming()};configureArmoryWeapon(e){this.armoryMode=`WEAPONS`,this.armoryWeaponTier=e,this.armoryYaw=-.36,this.armoryRingMat.color.setHex(ou[e].colorHex),this.syncArmoryVisibility()}configureArmoryBoss(e){this.armoryMode=`BOSSES`,this.armoryBossChassis=e.chassis,this.armoryYaw=-.44;let t=this.armoryBosses[e.chassis];t.primaryMat.color.setHex(e.primaryHex),t.accentMat.color.setHex(e.accentHex),t.trimMat.color.setHex(e.trimHex),t.glowMat.color.setHex(e.trimHex),this.armoryRingMat.color.setHex(e.trimHex),this.syncArmoryVisibility()}rotateArmoryTurntable(e){this.armoryYaw+=e,this.armoryDragSpinFreeze=1.6}syncArmoryVisibility(){for(let e of[1,2,3,4,5])this.armoryWeapons[e].root.visible=this.armoryMode===`WEAPONS`&&e===this.armoryWeaponTier;for(let e of Object.keys(this.armoryBosses))this.armoryBosses[e].root.visible=this.armoryMode===`BOSSES`&&e===this.armoryBossChassis}addShake(e){this.shakeTrauma=Math.min(1,this.shakeTrauma+e)}updateCamera(e,t,n,r){this.elapsedSkyTime+=e,this.skyUniforms.uTime.value=this.elapsedSkyTime,this.shakeTime+=e*38,this.shakeTrauma=Math.max(0,this.shakeTrauma-e*2.6);let i=this.shakeTrauma*this.shakeTrauma*.45,a=Math.sin(this.shakeTime*1.13)*i,o=Math.cos(this.shakeTime*1.71)*i*.75,s=this.portraitFactor,c=r===`ARMORY_INSPECT`;if(this.armoryRoot.visible=c,c){if(this.armoryDragSpinFreeze>0?this.armoryDragSpinFreeze=Math.max(0,this.armoryDragSpinFreeze-e):this.armoryYaw+=e*.52,this.armoryTurntable.rotation.y=this.armoryYaw,this.armoryOuterRing.rotation.z=-this.elapsedSkyTime*.5,this.armoryMode===`WEAPONS`){let t=this.armoryWeapons[this.armoryWeaponTier];t.root.position.y=.18+Math.sin(this.elapsedSkyTime*2.2)*.05,t.spinCluster&&(t.spinCluster.rotation.x+=e*12)}else{let t=this.armoryBosses[this.armoryBossChassis];for(let n=0;n<t.spinClusters.length;n++)this.armoryBossChassis===`KRAKEN_WALKER`?t.spinClusters[n].rotation.y+=e*3.5:t.spinClusters[n].rotation.z+=e*9}Pf.set(0,44.52,-7.95+s*.9),Ff.set(0,43.84-s*.38,Mf)}else if(r===`LIVE_BRIDGE`){let r=t*.38;this.smoothCamX+=(r-this.smoothCamX)*Math.min(1,e*9),Pf.set(this.smoothCamX,4.65+s*.55,n+5.75+s*1.35),Ff.set(this.smoothCamX*.55,.18-s*.62,n-11.4)}else{let i=r===`BOSS_TACTICAL`,a=t*(i?.3:.44-s*.1);this.smoothCamX+=(a-this.smoothCamX)*Math.min(1,e*9.5);let o=i?6.45+s*.45:4.55+s*.5,c=i?8.6+s*2.1:5.85+s*1.45;Pf.set(this.smoothCamX,o,n+c),Ff.set(this.smoothCamX*.58,(i?1.15:.72)-s*.25,n-(i?12.2:11.6))}let l=c!==(this.lastFramingMode===`ARMORY_INSPECT`);if(this.lastFramingMode=r,l)this.currentCamPos.copy(Pf),this.currentLookAt.copy(Ff);else{let t=Math.min(1,e*8.5);this.currentCamPos.lerp(Pf,t),this.currentLookAt.lerp(Ff,t)}this.camera.position.set(this.currentCamPos.x+a,this.currentCamPos.y+o,this.currentCamPos.z),this.camera.lookAt(this.currentLookAt.x+a*.4,this.currentLookAt.y,this.currentLookAt.z),this.skyDome.position.copy(this.camera.position);let u=c?Mf:n,d=c?jf:0;this.sunLight.position.set(-19,d+18,u-36),this.sunLight.target.position.set(0,d,u-12),this.rimLight.position.set(18,d+13,u+14),this.rimLight.target.position.set(0,d,u-10)}projectToScreen(e,t,n,r){Nf.set(e,t,n),Nf.project(this.camera),Nf.z>1||Nf.z<-1?r.visible=!1:(r.x=(Nf.x*.5+.5)*window.innerWidth,r.y=(-Nf.y*.5+.5)*window.innerHeight,r.visible=!0)}render(){this.renderer.render(this.scene,this.camera)}};function Lf(e,t){return{operator:`ADD`,initialValue:e,damagePerIncrement:t,isLocked:!1}}function Rf(e,t){return{operator:`MUL`,initialValue:e,damagePerIncrement:t,isLocked:!1}}function zf(e){return{operator:`MUL`,initialValue:e,damagePerIncrement:0,isLocked:!0}}function Bf(e){return{operator:`DIV`,initialValue:e,damagePerIncrement:0,isLocked:!0}}function Vf(e,t,n,r,i,a,o){return[{z:e,lane:`LEFT`,breakCount:t,weaponTier:i===`LEFT`?a:void 0,coinReward:i===`LEFT`?void 0:o},{z:e,lane:`CENTER`,breakCount:n,weaponTier:i===`CENTER`?a:void 0,coinReward:i===`CENTER`?void 0:o},{z:e,lane:`RIGHT`,breakCount:r,weaponTier:i===`RIGHT`?a:void 0,coinReward:i===`RIGHT`?void 0:o}]}var Hf=[{stageNumber:1,title:`Golden Span Outpost`,trackLength:260,supplyDrums:[{z:-17.5,lane:`LEFT_MID`,hp:22,rewardType:`COINS`,rewardValue:20},{z:-19.2,lane:`RIGHT_MID`,hp:34,rewardType:`COINS`,rewardValue:24},{z:-44,lane:`LEFT`,hp:32,rewardType:`COINS`,rewardValue:16},{z:-45.5,lane:`RIGHT`,hp:38,rewardType:`WEAPON`,rewardValue:2},{z:-72,lane:`CENTER`,hp:30,rewardType:`COINS`,rewardValue:16},{z:-75.5,lane:`LEFT`,hp:42,rewardType:`WEAPON`,rewardValue:2},{z:-75.5,lane:`RIGHT`,hp:44,rewardType:`RECRUIT`,rewardValue:1},{z:-131,lane:`LEFT_MID`,hp:72,rewardType:`COINS`,rewardValue:18},{z:-133,lane:`RIGHT_MID`,hp:80,rewardType:`RECRUIT`,rewardValue:1},{z:-167,lane:`CENTER`,hp:96,rewardType:`COINS`,rewardValue:20},{z:-171,lane:`LEFT`,hp:108,rewardType:`WEAPON`,rewardValue:3},{z:-171,lane:`RIGHT`,hp:102,rewardType:`RECRUIT`,rewardValue:1}],gatePairs:[{z:-53,left:null,right:null,full:Rf(1,11.5)},{z:-144,left:Lf(1,14),right:Lf(-14,11)},{z:-232,left:Bf(2),right:Rf(1.1,16)}],tireStacks:[...Vf(-118,290,265,310,`CENTER`,3,40),...Vf(-212,440,520,355,`CENTER`,4,55)],enemyWaves:[{z:-36,lane:`CENTER`,count:5,hpPerEnemy:8.5,heavyCount:0,speed:1.65,coinPerKill:6},{z:-96,lane:`CENTER`,count:8,hpPerEnemy:15.5,heavyCount:2,speed:1.95,coinPerKill:4},{z:-190,lane:`CENTER`,count:12,hpPerEnemy:22,heavyCount:3,speed:2.15,coinPerKill:3},{z:-246,lane:`CENTER`,count:14,hpPerEnemy:24,heavyCount:4,speed:2.2,coinPerKill:3}],boss:{name:`Iron Warden Mk-I`,chassis:`WARDEN_MECH`,primaryHex:4740713,accentHex:14233670,trimHex:16102446,maxHp:2200,segments:5,advanceSpeed:1.18,salvoLanes:1,salvoInterval:2.45,salvoDamage:2,rewardCoins:55}},{stageNumber:2,title:`Crosswind Viaduct`,trackLength:272,supplyDrums:[{z:-18,lane:`LEFT`,hp:46,rewardType:`COINS`,rewardValue:24},{z:-18,lane:`CENTER`,hp:34,rewardType:`COINS`,rewardValue:20},{z:-18,lane:`RIGHT`,hp:52,rewardType:`RECRUIT`,rewardValue:1},{z:-78,lane:`LEFT_MID`,hp:72,rewardType:`COINS`,rewardValue:32},{z:-78,lane:`RIGHT_MID`,hp:64,rewardType:`WEAPON`,rewardValue:2},{z:-176,lane:`LEFT`,hp:145,rewardType:`RECRUIT`,rewardValue:1},{z:-176,lane:`CENTER`,hp:128,rewardType:`COINS`,rewardValue:44},{z:-176,lane:`RIGHT`,hp:155,rewardType:`WEAPON`,rewardValue:3}],gatePairs:[{z:-56,left:Lf(-12,10),right:Lf(1,13)},{z:-150,left:null,right:null,full:Rf(1,14)},{z:-242,left:zf(2),right:Bf(2)}],tireStacks:[...Vf(-124,340,290,260,`RIGHT`,3,68),...Vf(-220,560,680,740,`LEFT`,4,92)],enemyWaves:[{z:-37,lane:`CENTER`,count:8,hpPerEnemy:16,heavyCount:1,speed:1.95,coinPerKill:6},{z:-102,lane:`RIGHT`,count:10,hpPerEnemy:22,heavyCount:2,speed:2.1,coinPerKill:7},{z:-198,lane:`CENTER`,count:14,hpPerEnemy:28,heavyCount:3,speed:2.2,coinPerKill:8},{z:-256,lane:`CENTER`,count:16,hpPerEnemy:32,heavyCount:4,speed:2.25,coinPerKill:9}],boss:{name:`Bastion Enforcer`,chassis:`SIEGE_TANK`,primaryHex:4410686,accentHex:14254635,trimHex:16240980,maxHp:3500,segments:5,advanceSpeed:1.22,salvoLanes:1,salvoInterval:2.38,salvoDamage:2,rewardCoins:155}},{stageNumber:3,title:`Crimson Causeway`,trackLength:284,supplyDrums:[{z:-18,lane:`LEFT_MID`,hp:62,rewardType:`COINS`,rewardValue:30},{z:-18,lane:`RIGHT_MID`,hp:78,rewardType:`WEAPON`,rewardValue:2},{z:-82,lane:`LEFT`,hp:105,rewardType:`RECRUIT`,rewardValue:1},{z:-82,lane:`CENTER`,hp:92,rewardType:`COINS`,rewardValue:38},{z:-82,lane:`RIGHT`,hp:115,rewardType:`COINS`,rewardValue:45},{z:-184,lane:`LEFT_MID`,hp:195,rewardType:`COINS`,rewardValue:56},{z:-184,lane:`RIGHT_MID`,hp:215,rewardType:`RECRUIT`,rewardValue:1}],gatePairs:[{z:-58,left:null,right:null,full:Rf(1,16)},{z:-156,left:Lf(-18,15),right:Lf(2,18)},{z:-252,left:Bf(2),right:zf(2)}],tireStacks:[...Vf(-130,390,480,440,`LEFT`,3,85),...Vf(-228,920,780,980,`CENTER`,4,115)],enemyWaves:[{z:-38,lane:`CENTER`,count:10,hpPerEnemy:22,heavyCount:2,speed:2.05,coinPerKill:7},{z:-106,lane:`CENTER`,count:12,hpPerEnemy:30,heavyCount:3,speed:2.18,coinPerKill:8},{z:-206,lane:`LEFT`,count:15,hpPerEnemy:36,heavyCount:4,speed:2.26,coinPerKill:9},{z:-268,lane:`CENTER`,count:18,hpPerEnemy:40,heavyCount:4,speed:2.3,coinPerKill:10}],boss:{name:`Crimson Juggernaut`,chassis:`SIEGE_TANK`,primaryHex:8002600,accentHex:2370357,trimHex:16758311,maxHp:5400,segments:6,advanceSpeed:1.25,salvoLanes:1,salvoInterval:2.3,salvoDamage:2,rewardCoins:195}},{stageNumber:4,title:`Steel Truss Gauntlet`,trackLength:294,supplyDrums:[{z:-18,lane:`LEFT`,hp:85,rewardType:`COINS`,rewardValue:36},{z:-18,lane:`CENTER`,hp:105,rewardType:`RECRUIT`,rewardValue:1},{z:-18,lane:`RIGHT`,hp:85,rewardType:`COINS`,rewardValue:36},{z:-86,lane:`LEFT_MID`,hp:135,rewardType:`WEAPON`,rewardValue:3},{z:-86,lane:`RIGHT_MID`,hp:125,rewardType:`COINS`,rewardValue:50},{z:-190,lane:`LEFT`,hp:260,rewardType:`COINS`,rewardValue:68},{z:-190,lane:`CENTER`,hp:290,rewardType:`WEAPON`,rewardValue:4},{z:-190,lane:`RIGHT`,hp:270,rewardType:`RECRUIT`,rewardValue:1}],gatePairs:[{z:-60,left:Lf(2,22),right:Lf(-20,18)},{z:-162,left:null,right:null,full:Rf(1,22)},{z:-260,left:Rf(1.1,26),right:Bf(2)}],tireStacks:[...Vf(-134,620,540,660,`CENTER`,3,105),...Vf(-236,1250,1120,1020,`RIGHT`,4,140)],enemyWaves:[{z:-39,lane:`CENTER`,count:11,hpPerEnemy:30,heavyCount:2,speed:2.1,coinPerKill:8},{z:-110,lane:`RIGHT`,count:14,hpPerEnemy:38,heavyCount:3,speed:2.22,coinPerKill:9},{z:-214,lane:`CENTER`,count:16,hpPerEnemy:46,heavyCount:4,speed:2.3,coinPerKill:11},{z:-278,lane:`CENTER`,count:19,hpPerEnemy:52,heavyCount:5,speed:2.34,coinPerKill:12}],boss:{name:`Vulcan Siege Mech`,chassis:`WARDEN_MECH`,primaryHex:2831424,accentHex:15100959,trimHex:16765276,maxHp:8200,segments:6,advanceSpeed:1.28,salvoLanes:1,salvoInterval:2.22,salvoDamage:3,rewardCoins:245}},{stageNumber:5,title:`Stormsurge Suspension`,trackLength:304,supplyDrums:[{z:-18,lane:`LEFT_MID`,hp:115,rewardType:`COINS`,rewardValue:46},{z:-18,lane:`RIGHT_MID`,hp:130,rewardType:`WEAPON`,rewardValue:3},{z:-88,lane:`LEFT`,hp:175,rewardType:`COINS`,rewardValue:60},{z:-88,lane:`CENTER`,hp:195,rewardType:`RECRUIT`,rewardValue:1},{z:-88,lane:`RIGHT`,hp:175,rewardType:`COINS`,rewardValue:60},{z:-196,lane:`LEFT_MID`,hp:350,rewardType:`RECRUIT`,rewardValue:1},{z:-196,lane:`RIGHT_MID`,hp:380,rewardType:`WEAPON`,rewardValue:5}],gatePairs:[{z:-60,left:null,right:null,full:Rf(1,26)},{z:-168,left:Lf(-24,24),right:Lf(2,26)},{z:-268,left:Bf(2),right:zf(2)}],tireStacks:[...Vf(-138,740,860,820,`LEFT`,4,130),...Vf(-244,1620,1380,1680,`CENTER`,5,175)],enemyWaves:[{z:-40,lane:`CENTER`,count:12,hpPerEnemy:38,heavyCount:3,speed:2.15,coinPerKill:10},{z:-114,lane:`CENTER`,count:15,hpPerEnemy:48,heavyCount:4,speed:2.26,coinPerKill:11},{z:-220,lane:`LEFT`,count:18,hpPerEnemy:58,heavyCount:4,speed:2.34,coinPerKill:12},{z:-288,lane:`CENTER`,count:20,hpPerEnemy:64,heavyCount:5,speed:2.38,coinPerKill:13}],boss:{name:`Tempest Goliath`,chassis:`KRAKEN_WALKER`,primaryHex:2504778,accentHex:3000319,trimHex:16103470,maxHp:12200,segments:7,advanceSpeed:1.3,salvoLanes:2,salvoInterval:2.4,salvoDamage:3,rewardCoins:310}},{stageNumber:6,title:`Twin-Tower Overwatch`,trackLength:312,supplyDrums:[{z:-18,lane:`LEFT`,hp:150,rewardType:`COINS`,rewardValue:55},{z:-18,lane:`CENTER`,hp:165,rewardType:`RECRUIT`,rewardValue:1},{z:-18,lane:`RIGHT`,hp:150,rewardType:`COINS`,rewardValue:55},{z:-90,lane:`LEFT_MID`,hp:235,rewardType:`WEAPON`,rewardValue:3},{z:-90,lane:`RIGHT_MID`,hp:255,rewardType:`COINS`,rewardValue:72},{z:-202,lane:`LEFT`,hp:440,rewardType:`COINS`,rewardValue:90},{z:-202,lane:`CENTER`,hp:480,rewardType:`RECRUIT`,rewardValue:1},{z:-202,lane:`RIGHT`,hp:460,rewardType:`WEAPON`,rewardValue:5}],gatePairs:[{z:-62,left:Lf(2,30),right:Lf(-26,26)},{z:-172,left:null,right:null,full:Rf(1,32)},{z:-276,left:zf(2),right:Bf(2)}],tireStacks:[...Vf(-142,1080,940,1120,`CENTER`,4,155),...Vf(-252,1980,2120,1740,`RIGHT`,5,210)],enemyWaves:[{z:-41,lane:`CENTER`,count:13,hpPerEnemy:48,heavyCount:3,speed:2.2,coinPerKill:11},{z:-116,lane:`RIGHT`,count:16,hpPerEnemy:60,heavyCount:4,speed:2.3,coinPerKill:12},{z:-226,lane:`CENTER`,count:19,hpPerEnemy:72,heavyCount:5,speed:2.38,coinPerKill:14},{z:-296,lane:`CENTER`,count:21,hpPerEnemy:78,heavyCount:5,speed:2.4,coinPerKill:15}],boss:{name:`Aegis Dreadnought`,chassis:`SIEGE_TANK`,primaryHex:2898251,accentHex:14235722,trimHex:4777471,maxHp:17500,segments:7,advanceSpeed:1.32,salvoLanes:2,salvoInterval:2.32,salvoDamage:3,rewardCoins:380}},{stageNumber:7,title:`Cobalt Strait Crossing`,trackLength:320,supplyDrums:[{z:-18,lane:`LEFT_MID`,hp:190,rewardType:`COINS`,rewardValue:68},{z:-18,lane:`RIGHT_MID`,hp:210,rewardType:`WEAPON`,rewardValue:3},{z:-92,lane:`LEFT`,hp:310,rewardType:`RECRUIT`,rewardValue:1},{z:-92,lane:`CENTER`,hp:290,rewardType:`COINS`,rewardValue:85},{z:-92,lane:`RIGHT`,hp:320,rewardType:`COINS`,rewardValue:90},{z:-208,lane:`LEFT_MID`,hp:580,rewardType:`WEAPON`,rewardValue:5},{z:-208,lane:`RIGHT_MID`,hp:610,rewardType:`RECRUIT`,rewardValue:1}],gatePairs:[{z:-62,left:null,right:null,full:Rf(1,38)},{z:-178,left:Lf(-28,32),right:Lf(3,36)},{z:-284,left:Bf(2),right:Rf(1.1,44)}],tireStacks:[...Vf(-146,1180,1380,1320,`LEFT`,4,185),...Vf(-260,2450,2150,2550,`CENTER`,5,250)],enemyWaves:[{z:-42,lane:`CENTER`,count:14,hpPerEnemy:60,heavyCount:3,speed:2.24,coinPerKill:13},{z:-120,lane:`CENTER`,count:17,hpPerEnemy:74,heavyCount:4,speed:2.34,coinPerKill:14},{z:-234,lane:`RIGHT`,count:20,hpPerEnemy:88,heavyCount:5,speed:2.4,coinPerKill:15},{z:-304,lane:`CENTER`,count:22,hpPerEnemy:96,heavyCount:5,speed:2.44,coinPerKill:16}],boss:{name:`Kraken Command Rig`,chassis:`KRAKEN_WALKER`,primaryHex:1910326,accentHex:15215695,trimHex:3733247,maxHp:24e3,segments:8,advanceSpeed:1.35,salvoLanes:2,salvoInterval:2.25,salvoDamage:3,rewardCoins:460}},{stageNumber:8,title:`Ironclad Skyway`,trackLength:328,supplyDrums:[{z:-18,lane:`LEFT`,hp:230,rewardType:`COINS`,rewardValue:82},{z:-18,lane:`CENTER`,hp:250,rewardType:`RECRUIT`,rewardValue:1},{z:-18,lane:`RIGHT`,hp:230,rewardType:`COINS`,rewardValue:82},{z:-94,lane:`LEFT_MID`,hp:390,rewardType:`WEAPON`,rewardValue:4},{z:-94,lane:`RIGHT_MID`,hp:370,rewardType:`COINS`,rewardValue:105},{z:-214,lane:`LEFT`,hp:740,rewardType:`RECRUIT`,rewardValue:1},{z:-214,lane:`CENTER`,hp:710,rewardType:`COINS`,rewardValue:125},{z:-214,lane:`RIGHT`,hp:780,rewardType:`WEAPON`,rewardValue:5}],gatePairs:[{z:-64,left:Lf(-30,38),right:Lf(3,42)},{z:-182,left:null,right:null,full:Rf(1,46)},{z:-292,left:zf(2),right:Bf(2)}],tireStacks:[...Vf(-150,1680,1480,1740,`CENTER`,4,220),...Vf(-268,2650,3050,3150,`LEFT`,5,295)],enemyWaves:[{z:-42,lane:`CENTER`,count:15,hpPerEnemy:74,heavyCount:4,speed:2.28,coinPerKill:14},{z:-124,lane:`LEFT`,count:18,hpPerEnemy:90,heavyCount:4,speed:2.36,coinPerKill:15},{z:-240,lane:`CENTER`,count:21,hpPerEnemy:106,heavyCount:5,speed:2.44,coinPerKill:17},{z:-312,lane:`CENTER`,count:23,hpPerEnemy:116,heavyCount:6,speed:2.46,coinPerKill:18}],boss:{name:`Obsidian Titan`,chassis:`SOVEREIGN_TITAN`,primaryHex:1908776,accentHex:14231096,trimHex:16754219,maxHp:32e3,segments:8,advanceSpeed:1.38,salvoLanes:2,salvoInterval:2.18,salvoDamage:4,rewardCoins:560}},{stageNumber:9,title:`Plasma Horizon Span`,trackLength:334,supplyDrums:[{z:-18,lane:`LEFT_MID`,hp:265,rewardType:`COINS`,rewardValue:96},{z:-18,lane:`RIGHT_MID`,hp:295,rewardType:`WEAPON`,rewardValue:4},{z:-96,lane:`LEFT`,hp:470,rewardType:`COINS`,rewardValue:120},{z:-96,lane:`CENTER`,hp:510,rewardType:`RECRUIT`,rewardValue:1},{z:-96,lane:`RIGHT`,hp:470,rewardType:`COINS`,rewardValue:120},{z:-218,lane:`LEFT_MID`,hp:920,rewardType:`RECRUIT`,rewardValue:1},{z:-218,lane:`RIGHT_MID`,hp:960,rewardType:`WEAPON`,rewardValue:5}],gatePairs:[{z:-64,left:null,right:null,full:Rf(1,54)},{z:-186,left:Lf(3,50),right:Lf(-32,46)},{z:-298,left:Bf(2),right:zf(2)}],tireStacks:[...Vf(-154,2050,2180,1820,`RIGHT`,5,260),...Vf(-274,3450,3100,3550,`CENTER`,5,340)],enemyWaves:[{z:-43,lane:`CENTER`,count:16,hpPerEnemy:88,heavyCount:4,speed:2.32,coinPerKill:16},{z:-126,lane:`CENTER`,count:19,hpPerEnemy:108,heavyCount:5,speed:2.4,coinPerKill:17},{z:-246,lane:`LEFT`,count:22,hpPerEnemy:128,heavyCount:6,speed:2.46,coinPerKill:19},{z:-318,lane:`CENTER`,count:24,hpPerEnemy:140,heavyCount:6,speed:2.5,coinPerKill:20}],boss:{name:`Hyperion Warlord`,chassis:`SOVEREIGN_TITAN`,primaryHex:2503240,accentHex:3601407,trimHex:16762949,maxHp:41e3,segments:9,advanceSpeed:1.4,salvoLanes:2,salvoInterval:2.12,salvoDamage:4,rewardCoins:680}},{stageNumber:10,title:`Omega Citadel Bridge`,trackLength:340,supplyDrums:[{z:-18,lane:`LEFT`,hp:310,rewardType:`COINS`,rewardValue:115},{z:-18,lane:`CENTER`,hp:340,rewardType:`RECRUIT`,rewardValue:1},{z:-18,lane:`RIGHT`,hp:310,rewardType:`COINS`,rewardValue:115},{z:-98,lane:`LEFT_MID`,hp:580,rewardType:`WEAPON`,rewardValue:4},{z:-98,lane:`RIGHT_MID`,hp:620,rewardType:`RECRUIT`,rewardValue:1},{z:-222,lane:`LEFT`,hp:1080,rewardType:`COINS`,rewardValue:165},{z:-222,lane:`CENTER`,hp:1180,rewardType:`WEAPON`,rewardValue:5},{z:-222,lane:`RIGHT`,hp:1120,rewardType:`RECRUIT`,rewardValue:1}],gatePairs:[{z:-66,left:null,right:null,full:Rf(1,64)},{z:-190,left:Lf(-35,55),right:Lf(4,60)},{z:-304,left:zf(2),right:Rf(1.2,72)}],tireStacks:[...Vf(-158,2250,2550,2480,`LEFT`,5,310),...Vf(-280,4100,3650,4200,`CENTER`,5,420)],enemyWaves:[{z:-44,lane:`CENTER`,count:18,hpPerEnemy:105,heavyCount:4,speed:2.35,coinPerKill:18},{z:-130,lane:`RIGHT`,count:20,hpPerEnemy:128,heavyCount:5,speed:2.42,coinPerKill:20},{z:-252,lane:`CENTER`,count:23,hpPerEnemy:150,heavyCount:6,speed:2.48,coinPerKill:22},{z:-324,lane:`CENTER`,count:24,hpPerEnemy:165,heavyCount:7,speed:2.52,coinPerKill:24}],boss:{name:`Apex Sovereign Mech`,chassis:`SOVEREIGN_TITAN`,primaryHex:4596800,accentHex:16103470,trimHex:3733247,maxHp:52e3,segments:10,advanceSpeed:1.44,salvoLanes:2,salvoInterval:2.05,salvoDamage:4,rewardCoins:850}}];function Uf(e){if(e.stageNumber===1||e.supplyDrums.length>=11)return e;let t=e.supplyDrums[0]?.hp??60,n=e.supplyDrums[0]?.rewardType===`COINS`?e.supplyDrums[0].rewardValue:36,r=Math.min(5,2+Math.floor(e.stageNumber/3)),i=e.supplyDrums.map((e,t)=>({...e,z:t%2==1?e.z-1.8:e.z}));return i.push({z:-45,lane:e.stageNumber%2==0?`LEFT_MID`:`LEFT`,hp:Math.round(t*.92),rewardType:`COINS`,rewardValue:Math.round(n*.9)},{z:-47,lane:e.stageNumber%2==0?`RIGHT_MID`:`RIGHT`,hp:Math.round(t*1.08),rewardType:`RECRUIT`,rewardValue:1},{z:-136,lane:`LEFT`,hp:Math.round(t*1.85),rewardType:`COINS`,rewardValue:Math.round(n*1.25)},{z:-138.5,lane:`RIGHT`,hp:Math.round(t*2.05),rewardType:`WEAPON`,rewardValue:r}),i.sort((e,t)=>t.z-e.z),{...e,supplyDrums:i}}var Wf=Hf.map(Uf);function Gf(e){return Wf[Math.max(0,Math.min(Wf.length-1,Math.floor(e)-1))]}var Kf=[{chassis:`WARDEN_MECH`,label:`Warden`,primaryHex:4609128,accentHex:14235722,trimHex:16102446},{chassis:`SIEGE_TANK`,label:`Juggernaut`,primaryHex:7220027,accentHex:16747576,trimHex:16765276},{chassis:`KRAKEN_WALKER`,label:`Kraken`,primaryHex:2900570,accentHex:3601407,trimHex:16729943},{chassis:`SOVEREIGN_TITAN`,label:`Sovereign`,primaryHex:4860752,accentHex:16103470,trimHex:3733247}];function qf(e){let t=Math.max(1,Math.floor(e)),n=1.34**(t-1),r=Math.round(8*n),i=-(12+t*3),a=Math.min(5,1+Math.floor(t/3)),o=Math.min(5,2+Math.floor((t-1)/2)),s=Math.min(5,3+Math.floor(t/2)),c=[{z:-17.5,lane:`LEFT_MID`,hp:Math.round(28*n),rewardType:`COINS`,rewardValue:Math.round(18+t*7)},{z:-19.5,lane:`RIGHT_MID`,hp:Math.round(38*n),rewardType:t%2==1?`COINS`:`RECRUIT`,rewardValue:t%2==1?Math.round(24+t*8):1},{z:-45,lane:`LEFT`,hp:Math.round(42*n),rewardType:`COINS`,rewardValue:Math.round(20+t*7)},{z:-47,lane:`RIGHT`,hp:Math.round(48*n),rewardType:`RECRUIT`,rewardValue:1},{z:-78,lane:`CENTER`,hp:Math.round(44*n),rewardType:`COINS`,rewardValue:Math.round(24+t*8)},{z:-81.5,lane:`LEFT`,hp:Math.round(54*n),rewardType:`WEAPON`,rewardValue:o},{z:-81.5,lane:`RIGHT`,hp:Math.round(58*n),rewardType:`RECRUIT`,rewardValue:1},{z:-138,lane:`LEFT_MID`,hp:Math.round(88*n),rewardType:`COINS`,rewardValue:Math.round(32+t*10)},{z:-140,lane:`RIGHT_MID`,hp:Math.round(96*n),rewardType:`WEAPON`,rewardValue:s},{z:-182,lane:`LEFT_MID`,hp:Math.round(115*n),rewardType:`COINS`,rewardValue:Math.round(36+t*12)},{z:-184.5,lane:`RIGHT_MID`,hp:Math.round(128*n),rewardType:`RECRUIT`,rewardValue:1}],l=[{z:-56,left:null,right:null,full:Rf(1,Math.max(8,r))},{z:-154,left:t%2==1?Lf(a,r*1.4):Lf(i,r*1.2),right:t%2==1?Lf(i,r*1.2):Lf(a,r*1.4)},{z:-250,left:t%2==0?zf(2):Bf(2),right:t%2==0?Bf(2):Rf(1.1,Math.max(14,r*1.8))}],u=[`CENTER`,`RIGHT`,`LEFT`],d=u[(t-1)%3],f=u[t%3],p=Math.round(195*n),m=Math.round(390*n),h=Kf[(t-1)%Kf.length];return{stageNumber:t,title:`Endless Sector ${t}`,trackLength:290,supplyDrums:c,gatePairs:l,tireStacks:[...Vf(-126,d===`LEFT`?p:Math.round(p*1.22),d===`CENTER`?p:Math.round(p*1.2),d===`RIGHT`?p:Math.round(p*1.24),d,o,Math.round(55+t*18)),...Vf(-224,f===`LEFT`?m:Math.round(m*1.22),f===`CENTER`?m:Math.round(m*1.24),f===`RIGHT`?m:Math.round(m*1.2),f,s,Math.round(80+t*24))],enemyWaves:[{z:-36,lane:`CENTER`,count:Math.min(18,6+t*2),hpPerEnemy:Math.round(12*n),heavyCount:Math.min(4,Math.floor(t/2)),speed:1.9+Math.min(.65,t*.05),coinPerKill:5+t*2},{z:-102,lane:`CENTER`,count:Math.min(20,9+t*2),hpPerEnemy:Math.round(17*n),heavyCount:Math.min(5,1+Math.floor(t/2)),speed:2.05+Math.min(.65,t*.05),coinPerKill:6+t*2},{z:-202,lane:`CENTER`,count:Math.min(22,12+t*2),hpPerEnemy:Math.round(23*n),heavyCount:Math.min(6,2+Math.floor(t/2)),speed:2.15+Math.min(.65,t*.05),coinPerKill:7+t*2},{z:-268,lane:`CENTER`,count:Math.min(24,14+t*2),hpPerEnemy:Math.round(26*n),heavyCount:Math.min(7,3+Math.floor(t/2)),speed:2.22+Math.min(.65,t*.05),coinPerKill:8+t*2}],boss:{name:`Sector-${t} ${h.label}`,chassis:h.chassis,primaryHex:h.primaryHex,accentHex:h.accentHex,trimHex:h.trimHex,maxHp:Math.round(2400*1.38**(t-1)),segments:Math.min(10,5+Math.floor(t/2)),advanceSpeed:Math.min(1.52,1.2+t*.025),salvoLanes:t>=5?2:1,salvoInterval:Math.max(1.98,2.48-t*.04),salvoDamage:Math.min(5,2+Math.floor(t/3)),rewardCoins:120+t*45}}}var Jf=10,Yf={WARDEN_MECH:`BIPEDAL VULCAN MECH`,SIEGE_TANK:`TRACKED SIEGE JUGGERNAUT`,KRAKEN_WALKER:`QUAD-LEG ARACHNID WALKER`,SOVEREIGN_TITAN:`CROWNED SOVEREIGN TITAN`},Xf={SINGLE:`PRECISION AUTOMATIC`,BURST_2:`2-ROUND TACTICAL BURST`,TWIN_SPREAD:`6-BARREL TWIN STREAM`,PIERCING:`PLASMA PIERCE (×2)`},Zf={x:0,y:0,visible:!1};function $(e){let t=document.getElementById(e);if(!t)throw Error(`Missing required HUD element #${e}`);return t}var Qf=class{callbacks;hubLeftToolsEl=$(`hub-left-tools`);hubStageBannerEl=$(`hub-stage-banner`);hubSectorKickerEl=$(`hub-sector-kicker`);hubSectorTitleEl=$(`hub-sector-title`);hubBossPreviewEl=$(`hub-boss-preview`);runProgressCard=$(`run-progress-card`);topWeaponPill=$(`top-weapon-pill`);progressFillEl=$(`track-progress-fill`);progressPctEl=$(`progress-pct-text`);coinCountEl=$(`coin-count`);liveCoinTickerEl=$(`live-coin-ticker`);btnSettings=$(`btn-settings`);btnPause=$(`btn-pause`);squadPillEl=$(`squad-pill`);squadCountEl=$(`squad-count-text`);squadWeaponEl=$(`squad-weapon-badge`);heavyHpBars=[];heavyHpFills=[];bossHudEl=$(`boss-hud`);bossNameEl=$(`boss-name-text`);bossHpEl=$(`boss-hp-text`);bossFillEl=$(`boss-hp-fill`);bossSegmentsEl=$(`boss-hp-segments`);stagingOverlayEl=$(`pre-run-overlay`);tabPanels;btnStartMarch=$(`start-march-btn`);btnAddSoldier=$(`btn-add-soldier`);btnArmoryWeapons=$(`btn-armory-weapons`);btnArmoryBosses=$(`btn-armory-bosses`);armorySelectorStrip=$(`armory-selector-strip`);armoryItemKicker=$(`armory-item-kicker`);armoryItemName=$(`armory-item-name`);btnArmoryPreviewEquip=$(`btn-armory-preview-equip`);armoryStatBars=$(`armory-stat-bars`);armoryItemNote=$(`armory-item-note`);mapProgressBadge=$(`map-progress-badge`);sectorMapList=$(`sector-map-list`);settingsDrawerEl=$(`settings-drawer`);badgeMuteEl=$(`badge-mute`);badgeHapticsEl=$(`badge-haptics`);recordSquadEl=$(`record-squad`);recordEndlessEl=$(`record-endless`);pauseModalEl=$(`pause-modal`);pauseSquadEl=$(`pause-squad`);pauseWeaponEl=$(`pause-weapon`);pauseProgressEl=$(`pause-progress`);pauseKillsEl=$(`pause-kills`);badgePauseMuteEl=$(`badge-pause-mute`);badgePauseHapticsEl=$(`badge-pause-haptics`);summaryModalEl=$(`run-summary-modal`);summaryKickerEl=$(`summary-kicker`);summaryTitleEl=$(`summary-title`);sumDistanceEl=$(`sum-distance`);sumDrumsEl=$(`sum-drums`);sumEnemiesEl=$(`sum-enemies`);sumLiveCoinsEl=$(`sum-live-coins`);sumBonusCoinsEl=$(`sum-bonus-coins`);sumMultEl=$(`sum-mult`);sumTotalCoinsEl=$(`sum-total-coins`);btnSummaryContinue=$(`btn-summary-continue`);activeTab=`BATTLE`;armorySubTab=`WEAPONS`;selectedArmoryWeapon=1;selectedArmoryBossStage=1;hubPreviewWeaponTier=1;latestSaveSnapshot=null;lastSquadCount=-1;lastWeaponTier=-1;lastBossSegments=-1;coinRollupRaf=0;liveTickerAccum=0;liveTickerHideTimer=0;constructor(e){this.callbacks=e,this.tabPanels={BATTLE:$(`tab-panel-battle`),ARMORY:$(`tab-panel-armory`),MAP:$(`tab-panel-map`)};for(let e of[`fireRate`,`bulletPower`,`warChest`]){let t=document.querySelector(`[data-pips="${e}"]`);if(t){t.innerHTML=``;for(let e=0;e<5;e++){let e=document.createElement(`span`);e.className=`mini-pips__seg`,t.appendChild(e)}}}let t=$(`world-overlay-layer`);for(let e=0;e<Jf;e++){let e=document.createElement(`div`);e.className=`heavy-hp-bar is-hidden`;let n=document.createElement(`div`);n.className=`heavy-hp-bar__fill`,e.appendChild(n),t.appendChild(e),this.heavyHpBars.push(e),this.heavyHpFills.push(n)}this.bindEvents(),this.renderArmoryPanel()}get currentTab(){return this.activeTab}get isSettingsOpen(){return!this.settingsDrawerEl.classList.contains(`is-hidden`)}closeSettingsDrawer(){this.settingsDrawerEl.classList.add(`is-hidden`)}bindEvents(){this.btnStartMarch.addEventListener(`click`,()=>this.callbacks.onStartMarch()),document.querySelectorAll(`[data-upgrade]`).forEach(e=>{let t=e.dataset.upgrade;e.addEventListener(`click`,e=>{e.stopPropagation(),this.callbacks.onBuyUpgrade(t)})}),document.querySelectorAll(`[data-hub-tab]`).forEach(e=>{let t=e.dataset.hubTab;e.addEventListener(`click`,e=>{e.stopPropagation();let n=t!==`BATTLE`&&this.activeTab===t?`BATTLE`:t;this.switchHubTab(n)})}),this.btnArmoryWeapons.addEventListener(`click`,()=>{this.armorySubTab=`WEAPONS`,this.renderArmoryPanel(),this.emitHubState()}),this.btnArmoryBosses.addEventListener(`click`,()=>{this.armorySubTab=`BOSSES`,this.renderArmoryPanel(),this.emitHubState()}),this.btnArmoryPreviewEquip.addEventListener(`click`,()=>{this.armorySubTab===`WEAPONS`&&(this.hubPreviewWeaponTier=this.selectedArmoryWeapon,this.renderArmoryPanel(),this.emitHubState())}),this.btnSettings.addEventListener(`click`,e=>{e.stopPropagation(),this.settingsDrawerEl.classList.toggle(`is-hidden`)}),$(`btn-close-settings`).addEventListener(`click`,()=>{this.settingsDrawerEl.classList.add(`is-hidden`)}),this.btnPause.addEventListener(`click`,()=>{this.callbacks.onPauseRequest()}),$(`btn-pause-resume`).addEventListener(`click`,()=>{this.callbacks.onResumeRequest()}),$(`btn-pause-restart`).addEventListener(`click`,()=>{this.callbacks.onRestartRequest()}),$(`btn-pause-retreat`).addEventListener(`click`,()=>{this.callbacks.onRetreatToHubRequest()}),$(`btn-toggle-mute`).addEventListener(`click`,()=>{this.callbacks.onToggleMute()}),$(`btn-pause-mute`).addEventListener(`click`,()=>{this.callbacks.onToggleMute()}),$(`btn-toggle-haptics`).addEventListener(`click`,()=>{this.callbacks.onToggleHaptics()}),$(`btn-pause-haptics`).addEventListener(`click`,()=>{this.callbacks.onToggleHaptics()}),$(`btn-export-save`).addEventListener(`click`,()=>{this.callbacks.onExportSave()}),$(`btn-reset-save`).addEventListener(`click`,()=>{this.callbacks.onResetSave(),this.settingsDrawerEl.classList.add(`is-hidden`)}),this.btnSummaryContinue.addEventListener(`click`,()=>{this.callbacks.onSummaryContinue()})}switchHubTab(e){let t=e===`UPGRADES`?`BATTLE`:e;this.activeTab=t,this.settingsDrawerEl.classList.add(`is-hidden`),this.tabPanels.BATTLE.classList.toggle(`is-hidden`,t!==`BATTLE`),this.tabPanels.ARMORY.classList.toggle(`is-hidden`,t!==`ARMORY`),this.tabPanels.MAP.classList.toggle(`is-hidden`,t!==`MAP`),this.hubStageBannerEl.classList.toggle(`is-hidden`,t!==`BATTLE`),t===`ARMORY`?this.renderArmoryPanel():t===`MAP`&&this.latestSaveSnapshot&&this.renderSectorMap(this.latestSaveSnapshot),this.emitHubState()}emitHubState(){this.callbacks.onHubStateChange({tab:this.activeTab,armorySubTab:this.armorySubTab,armoryWeaponTier:this.selectedArmoryWeapon,armoryBossStage:this.selectedArmoryBossStage,hubPreviewWeaponTier:this.hubPreviewWeaponTier})}syncTopHudForState(e){let t=e===`PRE_RUN`,n=e===`RUNNING`||e===`BOSS_FIGHT`||e===`PAUSED`;this.hubLeftToolsEl.classList.toggle(`is-hidden`,!t),this.hubStageBannerEl.classList.toggle(`is-hidden`,!t||this.activeTab!==`BATTLE`),this.runProgressCard.classList.toggle(`is-hidden`,t),this.topWeaponPill.classList.toggle(`is-hidden`,t),this.btnPause.classList.toggle(`is-hidden`,!n),t?this.resetLiveCoinTicker():this.settingsDrawerEl.classList.add(`is-hidden`)}setStagingVisible(e){this.stagingOverlayEl.classList.toggle(`is-hidden`,!e),e?this.switchHubTab(`BATTLE`):this.settingsDrawerEl.classList.add(`is-hidden`)}showPauseModal(e,t,n,r){this.pauseSquadEl.textContent=`${e}`,this.pauseWeaponEl.textContent=ou[t].shortBadge,this.pauseProgressEl.textContent=`${Math.round(n*100)}%`,this.pauseKillsEl.textContent=`${r}`,this.pauseModalEl.classList.remove(`is-hidden`)}hidePauseModal(){this.pauseModalEl.classList.add(`is-hidden`)}flashLiveCoinGain(e,t){this.coinCountEl.textContent=`${t}`,e<=0||(this.liveTickerAccum+=e,this.liveCoinTickerEl.textContent=`+${this.liveTickerAccum}`,this.liveCoinTickerEl.classList.remove(`is-hidden`),this.liveTickerHideTimer&&window.clearTimeout(this.liveTickerHideTimer),this.liveTickerHideTimer=window.setTimeout(()=>{this.resetLiveCoinTicker()},1500))}resetLiveCoinTicker(){this.liveTickerHideTimer&&=(window.clearTimeout(this.liveTickerHideTimer),0),this.liveTickerAccum=0,this.liveCoinTickerEl.classList.add(`is-hidden`)}syncSaveState(e,t,n,r){this.latestSaveSnapshot=e,this.coinCountEl.textContent=`${e.coins}`;let i=e.selectedMode===`CAMPAIGN`;this.hubSectorKickerEl.textContent=i?`SECTOR ${e.selectedStage}`:`ENDLESS WAVE ${r}`,this.hubSectorTitleEl.textContent=t.toUpperCase(),this.hubBossPreviewEl.textContent=`BOSS: ${n.toUpperCase()}`;let a=e.settings.muted?`OFF`:`ON`,o=e.settings.haptics?`ON`:`OFF`;this.badgeMuteEl.textContent=a,this.badgePauseMuteEl.textContent=a,this.badgeHapticsEl.textContent=o,this.badgePauseHapticsEl.textContent=o,this.recordSquadEl.textContent=`${e.highScoreSquad}`,this.recordEndlessEl.textContent=`${Math.round(e.bestEndlessDistance)}m`;for(let t of Nd){let n=e.upgrades[t],r=Pd(t,n),i=zd(t,n);if(t===`startingSquad`){let t=n>=5,i=!t&&e.coins>=r;this.btnAddSoldier.classList.toggle(`is-affordable`,i),this.btnAddSoldier.disabled=t;let a=Ld(n),o=document.querySelector(`[data-lvl="startingSquad"]`);o&&(o.textContent=`${a}/6`);let s=document.querySelector(`[data-cost="startingSquad"]`);s&&(s.textContent=t?`MAX`:`${r}`);continue}let a=e.coins>=r,o=document.querySelector(`.tactical-upg-card[data-upgrade="${t}"]`);o&&o.classList.toggle(`is-affordable`,a);let s=document.querySelector(`[data-lvl="${t}"]`);s&&(s.textContent=`${n+1}`);let c=document.querySelector(`[data-cost="${t}"]`);c&&(c.textContent=`${r}`);let l=document.querySelector(`[data-stat="${t}"]`);l&&(l.textContent=`${i.currentLabel} → ${i.nextLabel}`);let u=document.querySelector(`[data-pips="${t}"]`);if(u){let e=n>0&&n%5==0?5:n%5,t=n>=5,r=u.children;for(let n=0;n<r.length;n++)r[n].classList.toggle(`is-filled`,n<e),r[n].classList.toggle(`is-prestige`,t&&n<e)}}this.mapProgressBadge.textContent=`${e.unlockedStage} / 10`,this.activeTab===`MAP`&&this.renderSectorMap(e)}renderArmoryPanel(){let e=this.armorySubTab===`WEAPONS`;if(this.btnArmoryWeapons.classList.toggle(`is-active`,e),this.btnArmoryBosses.classList.toggle(`is-active`,!e),this.btnArmoryPreviewEquip.classList.toggle(`is-hidden`,!e),this.armorySelectorStrip.innerHTML=``,e){for(let e of[1,2,3,4,5]){let t=document.createElement(`button`);t.type=`button`,t.className=`armory-chip${e===this.selectedArmoryWeapon?` is-active`:``}`,t.textContent=ou[e].shortBadge,t.addEventListener(`click`,()=>{this.selectedArmoryWeapon=e,this.renderArmoryPanel(),this.emitHubState()}),this.armorySelectorStrip.appendChild(t)}let e=ou[this.selectedArmoryWeapon];this.armoryItemKicker.textContent=`TIER ${e.tier} // ${Xf[e.pattern]}`,this.armoryItemName.textContent=e.name.toUpperCase();let t=this.hubPreviewWeaponTier===e.tier;this.btnArmoryPreviewEquip.classList.toggle(`is-equipped`,t),this.btnArmoryPreviewEquip.textContent=t?`HELD ON BRIDGE ✓`:`HOLD ON BRIDGE`;let n=Math.min(100,Math.round(e.fireRate/8*100)),r=Math.min(100,Math.round(e.damageMultiplier/2.75*100)),i=Math.min(100,Math.round(e.projectileSpeed/40*100)),a=e.bossArmorFactor>1?100:65;this.armoryStatBars.innerHTML=`
        <div class="stat-meter">
          <div class="stat-meter__top"><span>FIRE RATE</span><strong>${e.fireRate.toFixed(1)}/s</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${n}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>DAMAGE MULT</span><strong>×${e.damageMultiplier.toFixed(2)}</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${r}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>MUZZLE VEL</span><strong>${e.projectileSpeed}m/s</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${i}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>BOSS ARMOR</span><strong>${Math.round(e.bossArmorFactor*100)}%</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${a}%"></div></div>
        </div>
      `,this.armoryItemNote.textContent=e.tier===1?`Standard sidearm equipped at launch. Shatter Supply Drums & Tire Walls on the bridge to upgrade live!`:`Weapon Lock Rule: Breaking lower/equal weapon drops keeps this gun and awards +25 Coins & +1 Commando (overflow >10 converts to +10 Coins).`}else{for(let e of Hf){let t=document.createElement(`button`);t.type=`button`,t.className=`armory-chip${e.stageNumber===this.selectedArmoryBossStage?` is-active`:``}`,t.textContent=`S${String(e.stageNumber).padStart(2,`0`)}`,t.addEventListener(`click`,()=>{this.selectedArmoryBossStage=e.stageNumber,this.renderArmoryPanel(),this.emitHubState()}),this.armorySelectorStrip.appendChild(t)}let e=Hf[this.selectedArmoryBossStage-1],t=e.boss;this.armoryItemKicker.textContent=`SECTOR ${e.stageNumber} // ${Yf[t.chassis]}`,this.armoryItemName.textContent=t.name.toUpperCase();let n=Math.min(100,Math.max(10,Math.round(t.maxHp/52e3*100))),r=Math.round(t.segments/10*100),i=Math.round(t.advanceSpeed/1.5*100),a=Math.round(t.rewardCoins/850*100);this.armoryStatBars.innerHTML=`
        <div class="stat-meter">
          <div class="stat-meter__top"><span>ARMOR HP</span><strong>${t.maxHp}</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${n}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>LANE SALVO</span><strong>${t.salvoLanes}x (-${t.salvoDamage})</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${r}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>MARCH SPEED</span><strong>${t.advanceSpeed.toFixed(2)}m/s</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${i}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>CLEAR BOUNTY</span><strong>+${t.rewardCoins} Coins</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${a}%"></div></div>
        </div>
      `,this.armoryItemNote.textContent=`Guarding ${e.title} (${e.trackLength}m). Fires ${t.salvoLanes}-lane telegraphed plasma salvos every ${t.salvoInterval.toFixed(1)}s — steer into the open lane!`}}renderSectorMap(e){this.sectorMapList.innerHTML=``;let t=document.createElement(`button`);t.type=`button`;let n=e.selectedMode===`ENDLESS`;t.className=`sector-node${n?` is-selected`:``}`,t.innerHTML=`
      <div class="sector-node__num">∞</div>
      <div class="sector-node__info">
        <span class="sector-node__title">ENDLESS BRIDGE GAUNTLET</span>
        <span class="sector-node__sub">Escalating Drums, Tire Walls &amp; Bosses • Best: ${Math.round(e.bestEndlessDistance)}m</span>
      </div>
      <span class="sector-node__status">${n?`ACTIVE`:`DEPLOY`}</span>
    `,t.addEventListener(`click`,()=>{this.callbacks.onSelectMode(`ENDLESS`),this.switchHubTab(`BATTLE`)}),this.sectorMapList.appendChild(t);for(let t of Hf){let n=t.stageNumber<=e.unlockedStage,r=t.stageNumber<e.unlockedStage,i=e.selectedMode===`CAMPAIGN`&&e.selectedStage===t.stageNumber,a=document.createElement(`button`);a.type=`button`,a.disabled=!n,a.className=[`sector-node`,i?`is-selected`:``,r&&!i?`is-cleared`:``,n?``:`is-locked`].filter(Boolean).join(` `);let o=n?i?`ACTIVE`:r?`CLEARED ✓`:`READY`:`LOCKED`;a.innerHTML=`
        <div class="sector-node__num">${String(t.stageNumber).padStart(2,`0`)}</div>
        <div class="sector-node__info">
          <span class="sector-node__title">${t.title.toUpperCase()}</span>
          <span class="sector-node__sub">${t.boss.name} • +${t.boss.rewardCoins} Clear Coins</span>
        </div>
        <span class="sector-node__status">${o}</span>
      `,n&&a.addEventListener(`click`,()=>{this.callbacks.onSelectStageDirect(t.stageNumber),this.switchHubTab(`BATTLE`)}),this.sectorMapList.appendChild(a)}}updateCoins(e){this.coinCountEl.textContent=`${e}`}updateTrackProgress(e,t,n,r){let i=Math.max(0,Math.min(100,e*100));this.progressFillEl.style.width=`${i.toFixed(1)}%`,this.progressPctEl.textContent=t===`ENDLESS`?`W${r} • ${Math.round(i)}%`:`${Math.round(i)}%`}updateWorldOverlays(e,t,n,r,i,a,o,s,c,l,u,d){let f=t===`RUNNING`||t===`BOSS_FIGHT`,p=i>0&&f;if(a!==this.lastWeaponTier&&(this.lastWeaponTier=a,this.squadWeaponEl.textContent=ou[a].shortBadge),p){let t=Math.min(4.2,n+.74);e.projectToScreen(t,1.56,r,Zf),Zf.visible?(this.squadPillEl.classList.remove(`is-hidden`),this.squadPillEl.style.transform=`translate3d(${Zf.x.toFixed(1)}px, ${Zf.y.toFixed(1)}px, 0) translate(-50%, -100%)`,i!==this.lastSquadCount&&(this.lastSquadCount=i,this.squadCountEl.textContent=`${i}`)):this.squadPillEl.classList.add(`is-hidden`)}else this.squadPillEl.classList.add(`is-hidden`);let m=0;if(f)for(let t=0;t<o.length&&m<Jf;t++){let n=o[t];if(!n||!n.active||n.aliveCount<=0)continue;let i=n.getConfiguredCount();for(let t=0;t<i&&m<Jf;t++){if(n.unitAlive[t]===0||n.unitIsHeavy[t]===0)continue;let i=n.unitZ[t],a=r-i;if(a>38||a<-4||(e.projectToScreen(n.unitX[t],1.98,i,Zf),!Zf.visible))continue;let o=this.heavyHpBars[m],s=this.heavyHpFills[m],c=Math.max(0,Math.min(1,n.unitHp[t]/Math.max(1,n.unitMaxHp[t])));o.classList.remove(`is-hidden`),o.style.transform=`translate3d(${Zf.x.toFixed(1)}px, ${Zf.y.toFixed(1)}px, 0) translate(-50%, -100%)`,s.style.width=`${(c*100).toFixed(1)}%`,m++}}for(let e=m;e<Jf;e++)this.heavyHpBars[e].classList.add(`is-hidden`);if(s&&l>0){this.bossHudEl.classList.remove(`is-hidden`),this.bossNameEl.textContent=c.toUpperCase();let e=Math.max(0,Math.ceil(l));this.bossHpEl.textContent=`${e} / ${u}`;let t=Math.max(0,Math.min(100,l/Math.max(1,u)*100));if(this.bossFillEl.style.width=`${t.toFixed(1)}%`,d!==this.lastBossSegments){this.lastBossSegments=d,this.bossSegmentsEl.innerHTML=``;for(let e=1;e<d;e++){let e=document.createElement(`div`);e.className=`boss-hud__seg-tick`,this.bossSegmentsEl.appendChild(e)}}}else this.bossHudEl.classList.add(`is-hidden`)}showSummaryModal(e){let t=e.outcome===`VICTORY`,n=e.mode===`ENDLESS`?`ENDLESS WAVE ${e.stageNumber}`:`SECTOR ${e.stageNumber}`;this.summaryKickerEl.textContent=t?`${n} CLEARED!`:`${n} — ${Math.round(e.progressRatio*100)}% PROGRESS`,this.summaryTitleEl.textContent=t?`VICTORY!`:`RUN COMPLETE`,this.summaryTitleEl.classList.toggle(`summary-card__title--victory`,t),this.summaryTitleEl.classList.toggle(`summary-card__title--defeat`,!t),this.sumDistanceEl.textContent=`${Math.round(e.distanceMeters)}m`,this.sumDrumsEl.textContent=`${e.drumsBroken}`,this.sumEnemiesEl.textContent=`${e.enemiesDefeated}`;let r=Math.max(0,e.totalCoinsEarned-e.liveCoinsEarned);this.sumLiveCoinsEl.textContent=`+${e.liveCoinsEarned}`,this.sumBonusCoinsEl.textContent=`+${r}`,this.sumMultEl.textContent=`×${e.warChestMultiplier.toFixed(2)}`,this.btnSummaryContinue.textContent=`NEXT`,this.coinRollupRaf&&=(cancelAnimationFrame(this.coinRollupRaf),0);let i=e.totalCoinsEarned,a=performance.now();if(this.sumTotalCoinsEl.textContent=`+${i}`,i>0){let e=t=>{let n=Math.min(1,(t-a)/460),r=1-(1-n)**3,o=Math.round(i*r);this.sumTotalCoinsEl.textContent=`+${o}`,n<1?this.coinRollupRaf=requestAnimationFrame(e):(this.sumTotalCoinsEl.textContent=`+${i}`,this.coinRollupRaf=0)};this.coinRollupRaf=requestAnimationFrame(e)}this.summaryModalEl.classList.remove(`is-hidden`)}hideSummaryModal(){this.coinRollupRaf&&=(cancelAnimationFrame(this.coinRollupRaf),0),this.summaryModalEl.classList.add(`is-hidden`)}},$f=1/60,ep=.1,tp=class{onFixedUpdate;onRender;accumulator=0;lastTimestamp=0;rafId=0;running=!1;constructor(e,t){this.onFixedUpdate=e,this.onRender=t}start(){this.running||(this.running=!0,this.lastTimestamp=performance.now(),this.rafId=requestAnimationFrame(this.tick))}stop(){this.running=!1,cancelAnimationFrame(this.rafId)}tick=e=>{if(!this.running)return;let t=Math.max(0,(e-this.lastTimestamp)/1e3);this.lastTimestamp=e;let n=Math.min(ep,t);for(this.accumulator+=n;this.accumulator>=$f;)this.onFixedUpdate($f),this.accumulator-=$f;let r=this.accumulator/$f;this.onRender(n,r),this.rafId=requestAnimationFrame(this.tick)}},np=.8,rp=.28,ip=class{current=`PRE_RUN`;pausedFromState=`RUNNING`;wipeoutTimer=0;wipeoutModalReady=!1;listeners=[];get state(){return this.current}get resumeTargetState(){return this.pausedFromState}get isWipeoutModalReady(){return this.current===`DEFEAT`&&this.wipeoutModalReady}get timeScale(){return this.current===`PAUSED`?0:this.current===`DEFEAT`&&!this.wipeoutModalReady?rp:1}onChange(e){this.listeners.push(e)}pause(){return this.current!==`RUNNING`&&this.current!==`BOSS_FIGHT`?!1:(this.pausedFromState=this.current,this.transitionTo(`PAUSED`),!0)}resume(){return this.current===`PAUSED`&&(this.transitionTo(this.pausedFromState),!0)}transitionTo(e){if(this.current===e)return;let t=this.current;this.current=e,e===`DEFEAT`?(this.wipeoutTimer=np,this.wipeoutModalReady=!1):e!==`PAUSED`&&(this.wipeoutTimer=0,this.wipeoutModalReady=!1);for(let n=0;n<this.listeners.length;n++)this.listeners[n](e,t)}tickRealTime(e){return this.current===`DEFEAT`&&!this.wipeoutModalReady&&(this.wipeoutTimer-=e,this.wipeoutTimer<=0)&&(this.wipeoutTimer=0,this.wipeoutModalReady=!0,!0)}},ap=class{callbacks;leftPressed=!1;rightPressed=!1;pointerActive=!1;activePointerId=-1;lastPointerClientX=0;accumulatedDragDeltaWorldX=0;constructor(e,t){this.callbacks=t,this.bindEvents(e)}bindEvents(e){window.addEventListener(`keydown`,e=>{if(!(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement))switch(this.callbacks.onFirstGesture(),e.code){case`ArrowLeft`:case`KeyA`:this.leftPressed=!0,this.callbacks.onBridgePointerLaunch();break;case`ArrowRight`:case`KeyD`:this.rightPressed=!0,this.callbacks.onBridgePointerLaunch();break;case`Space`:e.preventDefault(),this.callbacks.onStartRequest(),this.callbacks.onContinueModal();break;case`Enter`:this.callbacks.onContinueModal();break;case`Escape`:case`KeyP`:this.callbacks.onTogglePause();break;case`Digit1`:case`Numpad1`:this.callbacks.onUpgradeShortcut(0);break;case`Digit2`:case`Numpad2`:this.callbacks.onUpgradeShortcut(1);break;case`Digit3`:case`Numpad3`:this.callbacks.onUpgradeShortcut(2);break;case`Digit4`:case`Numpad4`:this.callbacks.onUpgradeShortcut(3)}}),window.addEventListener(`keyup`,e=>{switch(e.code){case`ArrowLeft`:case`KeyA`:this.leftPressed=!1;break;case`ArrowRight`:case`KeyD`:this.rightPressed=!1}}),e.addEventListener(`pointerdown`,t=>{this.callbacks.onFirstGesture(),this.pointerActive=!0,this.activePointerId=t.pointerId,this.lastPointerClientX=t.clientX;try{e.setPointerCapture(t.pointerId)}catch{}this.callbacks.onBridgePointerLaunch()}),window.addEventListener(`pointermove`,e=>{if(!this.pointerActive||this.activePointerId!==-1&&e.pointerId!==this.activePointerId)return;let t=e.clientX-this.lastPointerClientX;this.lastPointerClientX=e.clientX,this.callbacks.onMenuCanvasDrag(t),Math.abs(t)>=2&&this.callbacks.onBridgePointerLaunch();let n=Math.max(320,window.innerWidth),r=Gu*2,i=n>768?1.55:1.34;this.accumulatedDragDeltaWorldX+=t/n*r*i});let t=e=>{(this.activePointerId===-1||e.pointerId===this.activePointerId)&&(this.pointerActive=!1,this.activePointerId=-1)};window.addEventListener(`pointerup`,t),window.addEventListener(`pointercancel`,t),window.addEventListener(`blur`,()=>{this.leftPressed=!1,this.rightPressed=!1,this.pointerActive=!1,this.activePointerId=-1})}consumeHorizontalDelta(e){let t=this.accumulatedDragDeltaWorldX;this.accumulatedDragDeltaWorldX=0;let n=0;if(this.leftPressed&&--n,this.rightPressed&&(n+=1),typeof navigator.getGamepads==`function`){let e=navigator.getGamepads();for(let t=0;t<e.length;t++){let r=e[t];if(!r||!r.connected)continue;let i=r.axes[0]??0;Math.abs(i)>.14&&(n+=i,this.callbacks.onBridgePointerLaunch()),r.buttons[14]?.pressed&&(--n,this.callbacks.onBridgePointerLaunch()),r.buttons[15]?.pressed&&(n+=1,this.callbacks.onBridgePointerLaunch());break}}return t+=Math.max(-1,Math.min(1,n))*11.2*e,t}resetFrameDeltas(){this.accumulatedDragDeltaWorldX=0}},op=class{capacity;activeCount=0;x;y;z;vx;vz;damage;age;maxAge;scale;pierceLeft;lastHitEntityId;weaponTier;colorR;colorG;colorB;constructor(e=1200){this.capacity=e,this.x=new Float32Array(e),this.y=new Float32Array(e),this.z=new Float32Array(e),this.vx=new Float32Array(e),this.vz=new Float32Array(e),this.damage=new Float32Array(e),this.age=new Float32Array(e),this.maxAge=new Float32Array(e),this.scale=new Float32Array(e),this.pierceLeft=new Int16Array(e),this.lastHitEntityId=new Int32Array(e),this.weaponTier=new Uint8Array(e),this.colorR=new Float32Array(e),this.colorG=new Float32Array(e),this.colorB=new Float32Array(e)}spawn(e,t,n,r,i,a,o,s,c,l,u){if(this.activeCount>=this.capacity)return-1;let d=this.activeCount++;return this.x[d]=e,this.y[d]=t,this.z[d]=n,this.vx[d]=r,this.vz[d]=i,this.damage[d]=a,this.age[d]=0,this.maxAge[d]=s,this.scale[d]=c,this.pierceLeft[d]=o,this.lastHitEntityId[d]=-1,this.weaponTier[d]=l,this.colorR[d]=(u>>16&255)/255,this.colorG[d]=(u>>8&255)/255,this.colorB[d]=(u&255)/255,d}deactivate(e){if(e<0||e>=this.activeCount)return;let t=--this.activeCount;e!==t&&(this.x[e]=this.x[t],this.y[e]=this.y[t],this.z[e]=this.z[t],this.vx[e]=this.vx[t],this.vz[e]=this.vz[t],this.damage[e]=this.damage[t],this.age[e]=this.age[t],this.maxAge[e]=this.maxAge[t],this.scale[e]=this.scale[t],this.pierceLeft[e]=this.pierceLeft[t],this.lastHitEntityId[e]=this.lastHitEntityId[t],this.weaponTier[e]=this.weaponTier[t],this.colorR[e]=this.colorR[t],this.colorG[e]=this.colorG[t],this.colorB[e]=this.colorB[t])}clear(){this.activeCount=0}},sp=class{capacity;activeCount=0;x;y;z;vx;vy;vz;gravity;age;maxAge;baseScale;spin;colorR;colorG;colorB;constructor(e=900){this.capacity=e,this.x=new Float32Array(e),this.y=new Float32Array(e),this.z=new Float32Array(e),this.vx=new Float32Array(e),this.vy=new Float32Array(e),this.vz=new Float32Array(e),this.gravity=new Float32Array(e),this.age=new Float32Array(e),this.maxAge=new Float32Array(e),this.baseScale=new Float32Array(e),this.spin=new Float32Array(e),this.colorR=new Float32Array(e),this.colorG=new Float32Array(e),this.colorB=new Float32Array(e)}spawn(e,t,n,r,i,a,o,s,c,l){if(this.activeCount>=this.capacity)return;let u=this.activeCount++;this.x[u]=e,this.y[u]=t,this.z[u]=n,this.vx[u]=r,this.vy[u]=i,this.vz[u]=a,this.gravity[u]=o,this.age[u]=0,this.maxAge[u]=s,this.baseScale[u]=c,this.spin[u]=u%7*.9-2.7,this.colorR[u]=(l>>16&255)/255,this.colorG[u]=(l>>8&255)/255,this.colorB[u]=(l&255)/255}spawnBurst(e,t,n,r,i,a,o=.16,s=.48,c=-16){for(let l=0;l<r;l++){let u=l/r*Math.PI*2+this.activeCount*.37,d=i*(.45+l*17%11*.06),f=i*(.4+l*13%9*.08);this.spawn(e,t,n,Math.cos(u)*d,f,Math.sin(u)*d,c,s,o,a)}}update(e){let t=0;for(;t<this.activeCount;){let n=this.age[t]+e;n>=this.maxAge[t]?this.deactivate(t):(this.age[t]=n,this.vy[t]+=this.gravity[t]*e,this.x[t]+=this.vx[t]*e,this.y[t]+=this.vy[t]*e,this.z[t]+=this.vz[t]*e,this.y[t]<.04&&(this.y[t]=.04,this.vy[t]=Math.abs(this.vy[t])*.35),t++)}}deactivate(e){if(e<0||e>=this.activeCount)return;let t=--this.activeCount;e!==t&&(this.x[e]=this.x[t],this.y[e]=this.y[t],this.z[e]=this.z[t],this.vx[e]=this.vx[t],this.vy[e]=this.vy[t],this.vz[e]=this.vz[t],this.gravity[e]=this.gravity[t],this.age[e]=this.age[t],this.maxAge[e]=this.maxAge[t],this.baseScale[e]=this.baseScale[t],this.spin[e]=this.spin[t],this.colorR[e]=this.colorR[t],this.colorG[e]=this.colorG[t],this.colorB[e]=this.colorB[t])}clear(){this.activeCount=0}},cp=class{capacity;activeCount=0;x;y;z;vx;vy;vz;rx;ry;rz;spinX;spinY;spinZ;age;maxAge;isEnemy;seedCounter=1;constructor(e=64){this.capacity=e,this.x=new Float32Array(e),this.y=new Float32Array(e),this.z=new Float32Array(e),this.vx=new Float32Array(e),this.vy=new Float32Array(e),this.vz=new Float32Array(e),this.rx=new Float32Array(e),this.ry=new Float32Array(e),this.rz=new Float32Array(e),this.spinX=new Float32Array(e),this.spinY=new Float32Array(e),this.spinZ=new Float32Array(e),this.age=new Float32Array(e),this.maxAge=new Float32Array(e),this.isEnemy=new Uint8Array(e)}spawnKnockback(e,t,n,r=1){this.activeCount>=this.capacity&&this.deactivate(0);let i=this.activeCount++,a=this.seedCounter++,o=a%2==0?1:-1,s=o*(1.1+a*7%11*.24)*r;this.x[i]=e+(a*5%7-3)*.08,this.y[i]=.22,this.z[i]=t,this.vx[i]=s,this.vy[i]=(4.6+a*13%9*.28)*r,this.vz[i]=(n?-1:1)*(6.2+a*11%9*.42)*r,this.rx[i]=0,this.ry[i]=n?0:Math.PI,this.rz[i]=0,this.spinX[i]=(n?-1:1)*(8.5+a%5*1.4),this.spinY[i]=o*(3.2+a%4*1.1),this.spinZ[i]=-o*(5.4+a%6*.9),this.age[i]=0,this.maxAge[i]=.62,this.isEnemy[i]=+!!n}update(e){let t=0;for(;t<this.activeCount;){let n=this.age[t]+e;n>=this.maxAge[t]?this.deactivate(t):(this.age[t]=n,this.vy[t]-=21*e,this.x[t]+=this.vx[t]*e,this.y[t]+=this.vy[t]*e,this.z[t]+=this.vz[t]*e,this.rx[t]+=this.spinX[t]*e,this.ry[t]+=this.spinY[t]*e,this.rz[t]+=this.spinZ[t]*e,this.y[t]<.16&&(this.y[t]=.16,this.vy[t]=Math.abs(this.vy[t])*.34,this.vx[t]*=.72,this.vz[t]*=.72,this.spinX[t]*=.68),t++)}}deactivate(e){if(e<0||e>=this.activeCount)return;let t=--this.activeCount;e!==t&&(this.x[e]=this.x[t],this.y[e]=this.y[t],this.z[e]=this.z[t],this.vx[e]=this.vx[t],this.vy[e]=this.vy[t],this.vz[e]=this.vz[t],this.rx[e]=this.rx[t],this.ry[e]=this.ry[t],this.rz[e]=this.rz[t],this.spinX[e]=this.spinX[t],this.spinY[e]=this.spinY[t],this.spinZ[e]=this.spinZ[t],this.age[e]=this.age[t],this.maxAge[e]=this.maxAge[t],this.isEnemy[e]=this.isEnemy[t])}clear(){this.activeCount=0}},lp=`bridge_blitz_save_v1`;function up(){return{version:1,coins:0,unlockedStage:1,selectedStage:1,selectedMode:`CAMPAIGN`,upgrades:{fireRate:0,bulletPower:0,startingSquad:0,warChest:0},highScoreSquad:1,bestEndlessDistance:0,settings:{muted:!1,haptics:!0}}}function dp(e,t){return typeof e!=`number`||!Number.isFinite(e)?t:Math.max(0,Math.floor(e))}function fp(e){let t=up();if(!e||typeof e!=`object`)return t;let n=e,r=n.upgrades&&typeof n.upgrades==`object`?n.upgrades:{},i=n.settings&&typeof n.settings==`object`?n.settings:{},a=Math.min(10,Math.max(1,dp(n.unlockedStage,1))),o=Math.min(a,Math.max(1,dp(n.selectedStage,a)));return{version:1,coins:dp(n.coins,t.coins),unlockedStage:a,selectedStage:o,selectedMode:n.selectedMode===`ENDLESS`?`ENDLESS`:`CAMPAIGN`,upgrades:{fireRate:dp(r.fireRate,0),bulletPower:dp(r.bulletPower,0),startingSquad:dp(r.startingSquad,0),warChest:dp(r.warChest,0)},highScoreSquad:Math.max(1,dp(n.highScoreSquad,1)),bestEndlessDistance:dp(n.bestEndlessDistance,0),settings:{muted:typeof i.muted==`boolean`?i.muted:t.settings.muted,haptics:typeof i.haptics==`boolean`?i.haptics:t.settings.haptics}}}var pp=class{data;constructor(){this.data=this.load()}getData(){return this.data}load(){try{let e=window.localStorage.getItem(lp);return e?fp(JSON.parse(e)):up()}catch{return up()}}save(e){e&&(this.data=fp(e));try{window.localStorage.setItem(lp,JSON.stringify(this.data))}catch{}}update(e){let t={...this.data,upgrades:{...this.data.upgrades},settings:{...this.data.settings}};return e(t),this.save(t),this.data}exportJson(){return JSON.stringify(this.data,null,2)}reset(){let e=up();return this.save(e),this.data}},mp=24,hp=6,gp=12,_p=6,vp=class{saveManager=new pp;stateMachine=new ip;sound;sceneManager;bridgeEnv;bulletPool=new op(1200);particlePool=new sp(900);ragdollPool=new cp(64);batchRenderer;vfx;combatText;squad=new gd;supplyDrums=[];gatePairs=[];tireStacks=[];enemyWaves=[];boss;hud;input;loop;activeStageDef;activeMenuTab=`BATTLE`;hubPreviewWeaponTier=1;commandoFacingYaw=0;sectorBaseZ=0;endlessWave=1;elapsedTime=0;coinFountainTimer=0;celebrateHopTimer=0;liveCoinsThisRun=0;drumsBrokenThisRun=0;enemiesDefeatedThisRun=0;gatesFlippedThisRun=0;tiresBrokenThisRun=0;weaponLocksThisRun=0;bossSalvosDodgedThisRun=0;pendingSummary=null;constructor(){let e=document.getElementById(`canvas-container`),t=document.getElementById(`combat-text-layer`);if(!e||!t)throw Error(`Required root DOM containers missing`);let n=this.saveManager.getData();this.sound=new M(n.settings),this.sceneManager=new If(e),this.bridgeEnv=new Zd,this.sceneManager.scene.add(this.bridgeEnv.root),this.batchRenderer=new Af(this.sceneManager.scene,this.bulletPool.capacity,this.particlePool.capacity),this.vfx=new df(this.sceneManager.scene),this.combatText=new ef(t);for(let e=0;e<mp;e++){let t=new Ed(e);this.supplyDrums.push(t),this.sceneManager.scene.add(t.root)}for(let e=0;e<hp;e++){let t=new pd(e);this.gatePairs.push(t),this.sceneManager.scene.add(t.root)}for(let e=0;e<gp;e++){let t=new jd(e);this.tireStacks.push(t),this.sceneManager.scene.add(t.root)}for(let e=0;e<_p;e++)this.enemyWaves.push(new Qu(e));this.boss=new Vu(this.sceneManager.scene),this.activeStageDef=Gf(n.selectedStage),this.hud=new Qf({onStartMarch:()=>this.startRunIfStaging(),onBuyUpgrade:e=>this.handleBuyUpgrade(e),onSelectMode:e=>this.handleSelectMode(e),onSelectStageDirect:e=>this.handleSelectStageDirect(e),onHubStateChange:e=>{if(this.activeMenuTab=e.tab,this.hubPreviewWeaponTier=e.hubPreviewWeaponTier,e.tab===`ARMORY`){if(e.armorySubTab===`WEAPONS`)this.sceneManager.configureArmoryWeapon(e.armoryWeaponTier);else{let t=Math.max(0,Math.min(Hf.length-1,e.armoryBossStage-1));this.sceneManager.configureArmoryBoss(Hf[t].boss)}}},onPauseRequest:()=>this.handlePauseRequest(),onResumeRequest:()=>this.handleResumeRequest(),onRestartRequest:()=>this.handleRestartSector(),onRetreatToHubRequest:()=>this.handleRetreatToHub(),onToggleMute:()=>this.handleToggleMute(),onToggleHaptics:()=>this.handleToggleHaptics(),onExportSave:()=>this.handleExportSave(),onResetSave:()=>this.handleResetSave(),onSummaryContinue:()=>this.handleSummaryContinue()}),this.stateMachine.onChange(e=>{this.hud.syncTopHudForState(e)}),this.input=new ap(e,{onStartRequest:()=>this.startRunIfStaging(),onBridgePointerLaunch:()=>{this.stateMachine.state===`PRE_RUN`&&(this.hud.isSettingsOpen?this.hud.closeSettingsDrawer():this.activeMenuTab===`BATTLE`&&this.startRunIfStaging())},onMenuCanvasDrag:e=>{this.stateMachine.state===`PRE_RUN`&&this.activeMenuTab===`ARMORY`&&this.sceneManager.rotateArmoryTurntable(e*.012)},onTogglePause:()=>{this.stateMachine.state===`PAUSED`?this.handleResumeRequest():(this.stateMachine.state===`RUNNING`||this.stateMachine.state===`BOSS_FIGHT`)&&this.handlePauseRequest()},onUpgradeShortcut:e=>{this.stateMachine.state===`PRE_RUN`&&this.handleBuyUpgrade(Nd[e])},onFirstGesture:()=>this.sound.unlockOnGesture(),onContinueModal:()=>{(this.stateMachine.state===`VICTORY`||this.stateMachine.isWipeoutModalReady)&&this.handleSummaryContinue()}}),this.prepareStagingArea(),this.loop=new tp(e=>this.fixedUpdate(e),e=>this.renderFrame(e)),this.loop.start()}prepareStagingArea(){let e=this.saveManager.getData();this.endlessWave=1,this.sectorBaseZ=0,this.liveCoinsThisRun=0,this.drumsBrokenThisRun=0,this.enemiesDefeatedThisRun=0,this.gatesFlippedThisRun=0,this.tiresBrokenThisRun=0,this.weaponLocksThisRun=0,this.bossSalvosDodgedThisRun=0,this.pendingSummary=null,this.coinFountainTimer=0,this.celebrateHopTimer=0,this.commandoFacingYaw=0,this.bulletPool.clear(),this.particlePool.clear(),this.ragdollPool.clear(),this.vfx.clear(),this.combatText.clear(),this.input.resetFrameDeltas(),this.activeStageDef=e.selectedMode===`ENDLESS`?qf(1):Gf(e.selectedStage),this.populateSectorEntities(this.activeStageDef,0);let t=Ld(e.upgrades.startingSquad);this.squad.resetForRun(t),this.stateMachine.transitionTo(`PRE_RUN`),this.hud.hidePauseModal(),this.hud.hideSummaryModal(),this.hud.setStagingVisible(!0),this.hud.syncTopHudForState(`PRE_RUN`),this.hud.syncSaveState(e,this.activeStageDef.title,this.activeStageDef.boss.name,this.endlessWave),this.hud.updateTrackProgress(0,e.selectedMode,0,this.endlessWave)}populateSectorEntities(e,t){for(let n=0;n<mp;n++){let r=e.supplyDrums[n];r?this.supplyDrums[n].configure({...r,z:t+r.z}):this.supplyDrums[n].hide()}for(let n=0;n<hp;n++){let r=e.gatePairs[n];r?this.gatePairs[n].configure({...r,z:t+r.z}):this.gatePairs[n].hide()}for(let n=0;n<gp;n++){let r=e.tireStacks[n];r?this.tireStacks[n].configure({...r,z:t+r.z}):this.tireStacks[n].hide()}for(let n=0;n<_p;n++){let r=e.enemyWaves[n];r?this.enemyWaves[n].configure({...r,z:t+r.z}):this.enemyWaves[n].hide()}let n=-t+e.trackLength;this.bridgeEnv.configureBossPlatformZ(t-e.trackLength),this.boss.configure(e.boss,n)}startRunIfStaging(){this.stateMachine.state===`PRE_RUN`&&(this.sound.unlockOnGesture(),this.squad.weaponTier=1,this.hud.setStagingVisible(!1),this.stateMachine.transitionTo(`RUNNING`))}awardLiveCoins(e,t,n,r){if(e<=0)return 0;let i=Rd(this.saveManager.getData().upgrades.warChest),a=Math.max(1,Math.round(e*i));this.liveCoinsThisRun+=a;let o=this.saveManager.update(e=>{e.coins+=a});return this.hud.flashLiveCoinGain(a,o.coins),r&&this.combatText.spawn(t,1.95,n,`+${a} COINS`,`gold`,.85),a}applySquadCountWithOverflow(e,t,n){let r=this.squad.setLogicalCount(e);if(r>0){let e=this.awardLiveCoins(r*10,t,n,!1);this.combatText.spawn(t,2.2,n,`MAX SQUAD! +${e} COINS`,`gold`,.95)}}handlePauseRequest(){if(!this.stateMachine.pause())return;let e=Math.max(0,Math.min(1,(this.sectorBaseZ-this.squad.z)/this.activeStageDef.trackLength));this.hud.showPauseModal(this.squad.logicalCount,this.squad.weaponTier,e,this.enemiesDefeatedThisRun)}handleResumeRequest(){this.stateMachine.resume()&&this.hud.hidePauseModal()}handleRestartSector(){this.hud.hidePauseModal(),this.prepareStagingArea(),this.startRunIfStaging()}handleRetreatToHub(){this.hud.hidePauseModal(),this.prepareStagingArea()}handleBuyUpgrade(e){if(this.stateMachine.state!==`PRE_RUN`)return;this.sound.unlockOnGesture();let t=this.saveManager.getData(),n=Vd(t.coins,t.upgrades,e);if(!n.purchased)return;let r=this.saveManager.update(e=>{e.coins=n.remainingCoins,e.upgrades=n.nextUpgrades}),i=r.upgrades[e];if(this.sound.playUpgradeBuy(i),this.celebrateHopTimer=.38,e===`startingSquad`){let e=Ld(r.upgrades.startingSquad);this.squad.setLogicalCount(e),this.vfx.spawnShockwave(this.squad.x,this.squad.z,2.7,.38,3928200),this.vfx.spawnImpactSplash(this.squad.x,1.1,this.squad.z,1.45,5701533),this.particlePool.spawnBurst(this.squad.x,.9,this.squad.z,18,5.2,3928200),this.combatText.spawn(this.squad.x,1.95,this.squad.z,`+1 SOLDIER!`,`positive`,.85)}else{let t=e===`fireRate`?3733247:e===`bulletPower`?16752451:16765286;this.vfx.spawnShockwave(this.squad.x,this.squad.z,2.5,.36,t),this.vfx.spawnImpactSplash(this.squad.x,1.1,this.squad.z,1.35,t),this.particlePool.spawnBurst(this.squad.x,.9,this.squad.z,14,4.6,t);let n=e===`fireRate`?`+10% FIRE RATE!`:e===`bulletPower`?`+18% DAMAGE!`:`+15% REVENUE!`;this.combatText.spawn(this.squad.x,1.95,this.squad.z,n,e===`warChest`?`gold`:`cyan`,.82)}this.hud.syncSaveState(r,this.activeStageDef.title,this.activeStageDef.boss.name,this.endlessWave)}handleSelectMode(e){this.stateMachine.state===`PRE_RUN`&&(this.saveManager.update(t=>{t.selectedMode=e}),this.prepareStagingArea())}handleSelectStageDirect(e){this.stateMachine.state===`PRE_RUN`&&(this.saveManager.update(t=>{t.selectedMode=`CAMPAIGN`,t.selectedStage=Math.max(1,Math.min(t.unlockedStage,e))}),this.prepareStagingArea())}handleToggleMute(){let e=this.saveManager.update(e=>{e.settings.muted=!e.settings.muted});this.sound.updateSettings(e.settings),this.hud.syncSaveState(e,this.activeStageDef.title,this.activeStageDef.boss.name,this.endlessWave)}handleToggleHaptics(){let e=this.saveManager.update(e=>{e.settings.haptics=!e.settings.haptics});this.sound.updateSettings(e.settings),this.hud.syncSaveState(e,this.activeStageDef.title,this.activeStageDef.boss.name,this.endlessWave)}handleExportSave(){let e=this.saveManager.exportJson();try{let t=new Blob([e],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`bridge-blitz-save.json`,r.click(),URL.revokeObjectURL(n)}catch{}}handleResetSave(){let e=this.saveManager.reset();this.sound.updateSettings(e.settings),this.prepareStagingArea()}handleSummaryContinue(){this.prepareStagingArea()}spawnVolleyMuzzleVfx(){let e=Math.min(this.squad.logicalCount,10);if(e<=0)return;let t=this.squad.weaponTier,n=t===5?3733247:16763471,r=t>=4?1.42:1.08,i=Math.min(3,e),a=Math.floor(this.elapsedTime*60),o=.255*iu,s=.548*iu,c=-.68*iu;for(let t=0;t<i;t++){let i=(a+t*3)%e,l=this.squad.soldierWorldX[i]+o,u=this.squad.soldierWorldZ[i]+c;this.vfx.spawnMuzzleFlash(l,s,u,r,n),t===0&&this.particlePool.spawn(l+.1,s,u+.28,1.9+a%3*.45,2.6,.6,-14,.34,.075,16103470)}}computeCameraFramingMode(){let e=this.stateMachine.state;if(e===`PRE_RUN`)return this.activeMenuTab===`ARMORY`?`ARMORY_INSPECT`:`LIVE_BRIDGE`;let t=e===`PAUSED`?this.stateMachine.resumeTargetState:e;return t===`BOSS_FIGHT`||t===`VICTORY`?`BOSS_TACTICAL`:`RUN_TACTICAL`}fixedUpdate(e){let t=e*this.stateMachine.timeScale,n=this.stateMachine.state;if(n===`PAUSED`){this.input.resetFrameDeltas();return}this.elapsedTime+=t,this.celebrateHopTimer>0&&(this.celebrateHopTimer=Math.max(0,this.celebrateHopTimer-t));let r=this.saveManager.getData(),i=n===`RUNNING`||n===`BOSS_FIGHT`?this.input.consumeHorizontalDelta(t):0;n!==`RUNNING`&&n!==`BOSS_FIGHT`&&this.input.resetFrameDeltas();let a=n===`BOSS_FIGHT`&&this.boss.active?Math.max(-.34,Math.min(.34,Math.atan2(this.boss.x-this.squad.x,Math.max(2.2,this.squad.z-this.boss.z)))):0,o=n===`BOSS_FIGHT`?-a:0;this.commandoFacingYaw+=(o-this.commandoFacingYaw)*Math.min(1,t*12),n===`PRE_RUN`?this.squad.updateMovement(t,0,!1,!1):n===`RUNNING`?(this.squad.updateMovement(t,i,!0,!0),this.squad.updateAutoFire(t,Fd(r.upgrades.fireRate),Id(r.upgrades.bulletPower),this.bulletPool,0)&&(this.sound.playGunfire(this.squad.weaponTier),this.spawnVolleyMuzzleVfx()),this.sectorBaseZ-this.squad.z>=this.activeStageDef.trackLength&&(this.squad.z=this.sectorBaseZ-this.activeStageDef.trackLength,this.stateMachine.transitionTo(`BOSS_FIGHT`),this.combatText.spawn(0,2.6,this.boss.z,`${this.boss.name.toUpperCase()}!`,`negative`,1.1))):n===`BOSS_FIGHT`&&(this.squad.updateMovement(t,i,!1,!0),this.squad.updateAutoFire(t,Fd(r.upgrades.fireRate),Id(r.upgrades.bulletPower),this.bulletPool,a)&&(this.sound.playGunfire(this.squad.weaponTier),this.spawnVolleyMuzzleVfx()));let s=Yu(this.squad.logicalCount);for(let e=0;e<mp;e++){let r=this.supplyDrums[e];r.update(t,this.squad.z),n===`RUNNING`&&this.squad.logicalCount>0&&r.checkUnbrokenSquadBump(this.squad.x,this.squad.z,s)&&(this.sceneManager.addShake(.28),this.vfx.spawnShockwave(r.x,r.z,2.2,.28,16729943),this.particlePool.spawnBurst(r.x,.9,r.z,14,5.2,9990982),this.ragdollPool.spawnKnockback(r.x,this.squad.z,!1,1),this.squad.setLogicalCount(this.squad.logicalCount-1),this.combatText.spawn(r.x,1.6,r.z,`-1 DRUM HIT`,`negative`),this.squad.logicalCount<=0&&this.triggerRunDefeat())}for(let e=0;e<hp;e++){let r=this.gatePairs[e];if(r.updateVisuals(t,this.squad.z),n===`RUNNING`&&this.squad.logicalCount>0){let e=r.trySquadCollect(this.squad.x,this.squad.z,this.squad.logicalCount);if(e){if(e.deltaSquad<0){let t=Math.min(3,Math.abs(e.deltaSquad));for(let e=0;e<t;e++)this.ragdollPool.spawnKnockback(this.squad.x,this.squad.z,!1,.95)}this.applySquadCountWithOverflow(e.rawUnclampedCount,e.worldX,e.worldZ),this.sound.playGateCollect(e.positive);let t=e.positive?3733247:16729943;this.vfx.spawnShockwave(e.worldX,e.worldZ,2.9,.34,t),this.particlePool.spawnBurst(e.worldX,1.2,e.worldZ,18,5.8,t);let n=e.deltaSquad>=0?`+`:``;this.combatText.spawn(e.worldX,1.9,e.worldZ,`${e.label} (${n}${e.deltaSquad})`,e.positive?`positive`:`negative`),this.squad.logicalCount<=0&&this.triggerRunDefeat()}}}for(let e=0;e<gp;e++){let r=this.tireStacks[e];if(r.update(t,this.squad.z),n===`RUNNING`&&this.squad.logicalCount>0){let e=r.resolveUnbrokenSquadCrash(this.squad.x,this.squad.z,s);if(e>0){this.retireSiblingTireStacks(r.z);let t=Math.min(this.squad.logicalCount,e);this.sceneManager.addShake(.42),this.vfx.spawnShockwave(r.x,r.z,2.8,.34,16726870),this.particlePool.spawnBurst(r.x,.9,r.z,18,5.6,2962752);let n=Math.min(3,t);for(let e=0;e<n;e++)this.ragdollPool.spawnKnockback(r.x,this.squad.z,!1,1.15);this.squad.setLogicalCount(this.squad.logicalCount-t),this.sound.playEnemyPop(),this.combatText.spawn(r.x,1.65,r.z,`-${t} BARRICADE!`,`negative`,.9),this.squad.logicalCount<=0&&this.triggerRunDefeat()}}}for(let e=0;e<_p;e++){let r=this.enemyWaves[e];if((n===`RUNNING`||n===`BOSS_FIGHT`)&&(r.update(t,this.squad.x,this.squad.z),this.squad.logicalCount>0)){let e=r.resolveSquadCollision(this.squad.x,this.squad.z,this.squad.logicalCount);if(e&&e.playerLosses>0){let t=e.playerLosses;this.squad.setLogicalCount(this.squad.logicalCount-t);let n=Math.min(2,t);for(let t=0;t<n;t++)this.ragdollPool.spawnKnockback(e.hitX,e.hitZ,!0,.95),this.ragdollPool.spawnKnockback(this.squad.x,this.squad.z,!1,.95);this.sceneManager.addShake(.28),this.sound.playEnemyPop(),this.particlePool.spawnBurst(e.hitX,.8,e.hitZ,12,5.2,16729943),this.combatText.spawn(this.squad.x,1.6,this.squad.z,`-${t}`,`negative`,.65),this.squad.logicalCount<=0&&this.triggerRunDefeat()}}}if(n===`RUNNING`||n===`BOSS_FIGHT`){if(this.boss.update(t,n===`BOSS_FIGHT`,this.squad.x,this.squad.z,this.squad.logicalCount),this.boss.lastStepSalvoWarning&&(this.sound.playBossSalvoWarning(),this.combatText.spawn(this.squad.x,1.95,this.squad.z-1.2,`DODGE LANE!`,`gold`,.75)),this.boss.lastStepSalvoLaunched&&(this.sceneManager.addShake(.22),this.vfx.spawnShockwave(this.boss.x,this.boss.z+1.4,2.8,.26,16735787)),this.boss.lastStepSalvoHitDamage>0&&this.squad.logicalCount>0){let e=Math.min(this.squad.logicalCount,this.boss.lastStepSalvoHitDamage),t=Math.min(3,e);for(let e=0;e<t;e++)this.ragdollPool.spawnKnockback(this.squad.x,this.squad.z,!1,1.3);this.squad.setLogicalCount(this.squad.logicalCount-e),this.sound.playBossSalvoImpact(!1),this.sceneManager.addShake(.46),this.vfx.spawnShockwave(this.boss.lastStepSalvoHitX,this.squad.z,3.6,.36,16723532),this.particlePool.spawnBurst(this.boss.lastStepSalvoHitX,.9,this.squad.z,20,6.6,16726092),this.combatText.spawn(this.squad.x,1.8,this.squad.z,`-${e} SALVO!`,`negative`,.95),this.squad.logicalCount<=0&&this.triggerRunDefeat()}else this.boss.lastStepSalvoDodgedCount>0&&this.squad.logicalCount>0&&(this.bossSalvosDodgedThisRun+=this.boss.lastStepSalvoDodgedCount,this.sound.playBossSalvoImpact(!0),this.vfx.spawnShockwave(this.boss.lastStepSalvoDodgeX,this.squad.z+.3,2.2,.26,16752451),this.particlePool.spawnBurst(this.boss.lastStepSalvoDodgeX,.6,this.squad.z+.3,10,4.4,16756290),this.combatText.spawn(this.squad.x,1.7,this.squad.z,`DODGED!`,`cyan`,.75));if(this.boss.lastStepTriggeredShake){let e=this.boss.lastStepSlamDamage>0;this.sceneManager.addShake(e?.55:.16),this.vfx.spawnShockwave(this.boss.x,this.boss.z+.4,e?4.2:2.5,e?.38:.28,16729943)}if(this.boss.lastStepSlamDamage>0&&this.squad.logicalCount>0){let e=Math.min(this.squad.logicalCount,this.boss.lastStepSlamDamage),t=Math.min(3,e);for(let e=0;e<t;e++)this.ragdollPool.spawnKnockback(this.squad.x,this.squad.z,!1,1.35);this.squad.setLogicalCount(this.squad.logicalCount-e),this.sound.playEnemyPop(),this.particlePool.spawnBurst(this.squad.x,.9,this.squad.z,18,6.8,16726072),this.combatText.spawn(this.squad.x,1.75,this.squad.z,`-${e} SLAM!`,`negative`),this.squad.logicalCount<=0&&this.triggerRunDefeat()}}if(this.updateBullets(t),this.stateMachine.state===`VICTORY`&&(this.coinFountainTimer-=t,this.coinFountainTimer<=0)){this.coinFountainTimer=.055;for(let e=0;e<3;e++){let t=(this.elapsedTime*7+e*2.1)%(Math.PI*2);this.particlePool.spawn(Math.cos(t)*.8,.9,this.squad.z-5.5,Math.cos(t)*4.5,9.8+e%3*1.4,Math.sin(t)*3.5,-18,1.1,.22,16765286)}}this.particlePool.update(t),this.ragdollPool.update(t),this.sceneManager.updateCamera(t,this.squad.x,this.squad.z,this.computeCameraFramingMode()),this.bridgeEnv.update(t,this.elapsedTime,this.squad.z,this.sceneManager.camera.position)}updateBullets(e){let t=this.bulletPool,n=ou[this.squad.weaponTier].bossArmorFactor,r=0;for(;r<t.activeCount;){let i=t.age[r]+e;if(i>=t.maxAge[r]){t.deactivate(r);continue}let a=t.z[r],o=t.x[r]+t.vx[r]*e,s=a+t.vz[r]*e;if(s<this.squad.z-29){t.deactivate(r);continue}t.age[r]=i,t.x[r]=o,t.z[r]=s;let c=t.damage[r],l=t.lastHitEntityId[r],u=!1;for(let e=0;e<mp;e++){let n=this.supplyDrums[e],i=n.tryBulletHit(o,s,a,c,l);if(i!==`NONE`){t.lastHitEntityId[r]=n.entityId,u=!0,i===`HIT`?(this.vfx.spawnImpactSplash(o,1.02,n.z+1,.82,16765286),this.particlePool.spawnBurst(o,1,n.z,3,4.2,16755259,.1,.24)):i===`SHATTERED`&&this.handleSupplyDrumShattered(n);break}}if(!u)for(let e=0;e<hp;e++){let n=this.gatePairs[e].tryBulletHit(o,s,a,c,l);if(n){if(t.lastHitEntityId[r]=n.entityId,u=!0,n.ricochet)this.sound.playRicochet(),this.vfx.spawnImpactSplash(n.hitX,1.22,n.hitZ,.65,16769126),this.particlePool.spawnBurst(n.hitX,1.2,n.hitZ,3,4.2,16769126,.1,.25);else{let e=n.newValue>=0?6485247:16739201;this.vfx.spawnImpactSplash(n.hitX,1.24,n.hitZ,.78,e),this.particlePool.spawnBurst(n.hitX,1.2,n.hitZ,3,3.5,e,.11,.24),n.flippedToPositive?(this.gatesFlippedThisRun++,this.sound.playGateFlipChime(),this.sceneManager.addShake(.2),this.vfx.spawnShockwave(n.hitX,n.hitZ,3.2,.38,3601407),this.particlePool.spawnBurst(n.hitX,1.5,n.hitZ,20,6.5,3601407,.18,.55),this.combatText.spawn(n.hitX,2.3,n.hitZ,`${n.formattedLabel}!`,`cyan`,.95)):n.deltaIncrements>0&&(this.sound.playGateTick(n.newValue),this.combatText.spawn(n.hitX,2,n.hitZ,n.formattedLabel,n.newValue>=0?`positive`:`gold`,.45))}break}}if(!u)for(let e=0;e<gp;e++){let n=this.tireStacks[e],i=n.tryBulletHit(o,s,a,c,l);if(i!==`NONE`){t.lastHitEntityId[r]=n.entityId,u=!0,i===`HIT`?(this.vfx.spawnImpactSplash(o,1.05,n.z+1.2,.85,16765286),this.particlePool.spawnBurst(o,.95,n.z,3,4,16765286,.11,.25)):i===`SHATTERED`&&this.handleTireStackShattered(n);break}}if(!u)for(let e=0;e<_p;e++){let n=this.enemyWaves[e],i=n.tryBulletHit(o,s,a,c,l);if(!(i<0)){if(t.lastHitEntityId[r]=n.entityId,u=!0,i>0&&n.lastKillCount>0){let e=n.lastKills[0];this.enemiesDefeatedThisRun+=i,this.sound.playEnemyPop(),this.vfx.spawnImpactSplash(e.x,.95,e.z,e.isHeavy?1.45:.92,e.isHeavy?16768857:16739201),this.ragdollPool.spawnKnockback(e.x,e.z,!0,e.isHeavy?1.25:.98),this.particlePool.spawnBurst(e.x,.85,e.z,e.isHeavy?16:7,5.6,e.isHeavy?16756290:16726092),e.isHeavy&&this.spawnGoldConfettiShower(e.x,1.2,e.z,12),this.awardLiveCoins(e.coinReward,e.x,e.z,e.isHeavy||this.enemiesDefeatedThisRun%3==0)}else this.vfx.spawnImpactSplash(o,.92,s,.68,16774354),this.particlePool.spawnBurst(o,.85,s,2,3.2,16777215,.09,.2);break}}if(!u&&this.stateMachine.state===`BOSS_FIGHT`&&this.boss.active){let e=this.boss.tryBulletHit(o,s,a,c,n,l);if(e!==`NONE`){if(t.lastHitEntityId[r]=this.boss.entityId,u=!0,this.vfx.spawnImpactSplash(o,1.45,this.boss.z+.95,.95,16768870),this.particlePool.spawnBurst(o,1.4,this.boss.z+.6,4,4.6,16760379,.12,.28),this.boss.lastStepSegmentBroken){this.sound.playTireBreak(!1),this.sceneManager.addShake(.28),this.vfx.spawnShockwave(this.boss.x,this.boss.z+.5,3.4,.34,16758832),this.spawnGoldConfettiShower(this.boss.x,2.2,this.boss.z+.6,14);let e=this.awardLiveCoins(8,this.boss.x,this.boss.z+.8,!1);this.combatText.spawn(this.boss.x,3.9,this.boss.z,`ARMOR BREAK! +${e}`,`gold`,.78)}e===`DEFEATED`&&this.handleBossDefeated()}}u&&(--t.pierceLeft[r],t.pierceLeft[r]<=0)?t.deactivate(r):r++}}spawnGoldConfettiShower(e,t,n,r){for(let i=0;i<r;i++){let a=i/r*Math.PI*2+this.elapsedTime*3.1,o=2.6+i%3*1.35;this.particlePool.spawn(e+Math.cos(a)*.25,t,n+Math.sin(a)*.25,Math.cos(a)*o,5.8+i%4*1.15,Math.sin(a)*o*.85,-16.5,.72,.19,i%2==0?16768845:16773273)}}retireSiblingTireStacks(e){for(let t=0;t<gp;t++){let n=this.tireStacks[t];n.active&&!n.broken&&Math.abs(n.z-e)<1&&n.retireCheckpointSibling()}}applyWeaponDrop(e,t,n){let r=su(this.squad.weaponTier,e);if(this.sound.playTireBreak(r.upgraded),r.upgraded){this.squad.weaponTier=r.equippedTier;let e=ou[r.equippedTier].colorHex;this.particlePool.spawnBurst(this.squad.x,1.2,this.squad.z,20,6,e,.18,.55),this.combatText.spawn(t,2.15,n,r.bannerText,r.equippedTier===5?`cyan`:`gold`,1.1)}else{this.weaponLocksThisRun++;let e=this.awardLiveCoins(r.bonusCoins,t,n,!1);this.applySquadCountWithOverflow(this.squad.logicalCount+r.bonusSquad,t,n),this.spawnGoldConfettiShower(t,1.4,n,12),this.combatText.spawn(t,2.25,n,`WEAPON LOCK! +${e} COINS`,`gold`,1.1)}}handleSupplyDrumShattered(e){if(this.drumsBrokenThisRun++,this.sceneManager.addShake(.24),this.vfx.spawnShockwave(e.x,e.z,2.6,.34,16760379),this.vfx.spawnImpactSplash(e.x,1.25,e.z+.5,1.6,16769126),this.particlePool.spawnBurst(e.x,1,e.z,20,6.2,10253124,.18,.5),e.rewardType===`COINS`)this.sound.playTireBreak(!1),this.spawnGoldConfettiShower(e.x,1.45,e.z,14),this.awardLiveCoins(e.rewardValue,e.x,e.z,!0);else if(e.rewardType===`RECRUIT`)this.sound.playGateCollect(!0),this.particlePool.spawnBurst(e.x,1.4,e.z,18,5.5,3733247,.18,.55),this.applySquadCountWithOverflow(this.squad.logicalCount+e.rewardValue,e.x,e.z),this.combatText.spawn(e.x,2.05,e.z,`+${e.rewardValue} COMMANDO!`,`positive`,1);else{let t=Math.max(1,Math.min(5,Math.round(e.rewardValue)));this.applyWeaponDrop(t,e.x,e.z)}}handleTireStackShattered(e){this.tiresBrokenThisRun++,this.retireSiblingTireStacks(e.z),this.sceneManager.addShake(.36);let t=e.weaponTier?ou[e.weaponTier].colorHex:16766023;this.vfx.spawnShockwave(e.x,e.z,3.3,.42,t),this.vfx.spawnImpactSplash(e.x,1.35,e.z+.8,1.75,t),this.particlePool.spawnBurst(e.x,1.1,e.z,24,6.8,2962752,.2,.55),e.weaponTier===null?(this.sound.playTireBreak(!1),this.spawnGoldConfettiShower(e.x,1.5,e.z,16),this.awardLiveCoins(e.coinReward,e.x,e.z,!0)):this.applyWeaponDrop(e.weaponTier,e.x,e.z)}handleBossDefeated(){if(this.sound.playBossDefeat(),this.sceneManager.addShake(.68),this.vfx.spawnShockwave(this.boss.x,this.boss.z,6.5,.62,16756290),this.vfx.spawnShockwave(this.boss.x,this.boss.z,4.2,.44,16726092),this.particlePool.spawnBurst(this.boss.x,2,this.boss.z,46,9.5,16756290,.26,.85),this.particlePool.spawnBurst(this.boss.x,2.2,this.boss.z,32,8,16726092,.24,.75),this.saveManager.getData().selectedMode===`ENDLESS`){let e=this.awardLiveCoins(this.boss.rewardCoins,0,this.squad.z-4,!1);this.combatText.spawn(0,2.6,this.squad.z-4,`WAVE ${this.endlessWave} CLEARED! +${e} COINS`,`gold`,1.3),this.endlessWave+=1,this.sectorBaseZ=this.squad.z,this.activeStageDef=qf(this.endlessWave),this.populateSectorEntities(this.activeStageDef,this.sectorBaseZ),this.stateMachine.transitionTo(`RUNNING`);return}let e=this.finalizeRunRewards(`VICTORY`,!0);this.pendingSummary=e,this.stateMachine.transitionTo(`VICTORY`),this.hud.showSummaryModal(e)}triggerRunDefeat(){if(this.stateMachine.state===`DEFEAT`||this.stateMachine.state===`VICTORY`)return;this.squad.setLogicalCount(0),this.sceneManager.addShake(.55);let e=this.finalizeRunRewards(`DEFEAT`,!1);this.pendingSummary=e,this.stateMachine.transitionTo(`DEFEAT`)}finalizeRunRewards(e,t){let n=this.saveManager.getData(),r=Math.max(0,-this.squad.z),i=Math.max(0,Math.min(1,(this.sectorBaseZ-this.squad.z)/this.activeStageDef.trackLength)),a=Bd({progressRatio:n.selectedMode===`ENDLESS`?r/290:t?1:i,stageNumber:this.activeStageDef.stageNumber,enemiesDefeated:0,bonusCoinsCollected:0,bossRewardCoins:this.boss.rewardCoins,clearedStage:t,warChestLevel:n.upgrades.warChest}),o=this.liveCoinsThisRun+a.totalCoinsEarned,s={outcome:e,mode:n.selectedMode,stageNumber:n.selectedMode===`ENDLESS`?this.endlessWave:n.selectedStage,distanceMeters:t&&n.selectedMode===`CAMPAIGN`?this.activeStageDef.trackLength:r,progressRatio:t?1:i,enemiesDefeated:this.enemiesDefeatedThisRun,drumsBroken:this.drumsBrokenThisRun,gatesFlipped:this.gatesFlippedThisRun,peakSquad:this.squad.peakCount,liveCoinsEarned:this.liveCoinsThisRun,distanceCoins:a.distanceCoins,killCoins:a.killCoins,bonusCoins:a.bonusCoins,warChestMultiplier:a.warChestMultiplier,totalCoinsEarned:o},c=this.saveManager.update(e=>{e.coins+=a.totalCoinsEarned,e.highScoreSquad=Math.max(e.highScoreSquad,this.squad.peakCount),e.selectedMode===`ENDLESS`?e.bestEndlessDistance=Math.max(e.bestEndlessDistance,Math.round(r)):t&&(e.selectedStage>=e.unlockedStage&&e.unlockedStage<10&&(e.unlockedStage+=1),e.selectedStage<10&&(e.selectedStage+=1))});return this.hud.updateCoins(c.coins),s}renderFrame(e){this.stateMachine.tickRealTime(e)&&this.pendingSummary&&this.hud.showSummaryModal(this.pendingSummary);let t=this.stateMachine.state,n=t===`RUNNING`||t===`BOSS_FIGHT`,r=t===`PRE_RUN`?this.hubPreviewWeaponTier:this.squad.weaponTier,i=this.celebrateHopTimer>0?1-this.celebrateHopTimer/.38:0;this.batchRenderer.syncPlayerSoldiers(this.squad.logicalCount,this.squad.soldierWorldX,this.squad.soldierWorldZ,this.squad.marchPhase,n,r,this.squad.steerBankAngle,this.squad.recoilImpulse,this.squad.barrelSpinAngle,this.commandoFacingYaw,i),this.batchRenderer.beginEnemyFrame();for(let e=0;e<_p;e++)this.enemyWaves[e].pushInstances(this.batchRenderer);this.batchRenderer.finishEnemyFrame(),this.batchRenderer.syncRagdolls(this.ragdollPool),this.batchRenderer.syncBullets(this.bulletPool),this.batchRenderer.syncParticles(this.particlePool),this.vfx.updateAndSync(e*this.stateMachine.timeScale),this.sceneManager.render();let a=this.saveManager.getData(),o=Math.max(0,Math.min(1,(this.sectorBaseZ-this.squad.z)/this.activeStageDef.trackLength));this.hud.updateTrackProgress(o,a.selectedMode,Math.max(0,-this.squad.z),this.endlessWave);let s=(t===`BOSS_FIGHT`||t===`PAUSED`&&this.stateMachine.resumeTargetState===`BOSS_FIGHT`)&&this.boss.active;this.hud.updateWorldOverlays(this.sceneManager,t,this.squad.x,this.squad.z,this.squad.logicalCount,this.squad.weaponTier,this.enemyWaves,s,this.boss.name,this.boss.currentHp,this.boss.maxHp,this.boss.segments),t!==`PAUSED`&&this.combatText.update(e,this.sceneManager)}advanceSimulation(e,t,n=!1){let r=1/60,i=Math.max(1,Math.round(e/r));for(let e=0;e<i;e++){if(typeof t==`number`){let e=t-this.squad.x;this.squad.x+=Math.sign(e)*Math.min(Math.abs(e),12*r)}this.fixedUpdate(r),e<i-1&&(this.vfx.updateAndSync(r*this.stateMachine.timeScale),this.stateMachine.state!==`PAUSED`&&this.combatText.update(r,this.sceneManager),this.stateMachine.tickRealTime(r)&&this.pendingSummary&&this.hud.showSummaryModal(this.pendingSummary))}return n?(this.vfx.updateAndSync(r*this.stateMachine.timeScale),this.stateMachine.tickRealTime(r)&&this.pendingSummary&&this.hud.showSummaryModal(this.pendingSummary)):this.renderFrame(r),this.getTelemetrySnapshot()}getTelemetrySnapshot(){let e=this.saveManager.getData(),t=Math.max(0,Math.min(1,(this.sectorBaseZ-this.squad.z)/this.activeStageDef.trackLength));return{state:this.stateMachine.state,mode:e.selectedMode,stage:e.selectedMode===`ENDLESS`?this.endlessWave:e.selectedStage,coins:e.coins,liveCoinsThisRun:this.liveCoinsThisRun,logicalSquad:this.squad.logicalCount,visualSquad:Math.min(this.squad.logicalCount,10),squadX:this.squad.x,squadZ:this.squad.z,progress:t,weaponTier:this.squad.weaponTier,weaponBadge:ou[this.squad.weaponTier].shortBadge,bossHp:this.boss.currentHp,bossMaxHp:this.boss.maxHp,drumsBrokenThisRun:this.drumsBrokenThisRun,gatesFlippedThisRun:this.gatesFlippedThisRun,tiresBrokenThisRun:this.tiresBrokenThisRun,weaponLocksTriggeredThisRun:this.weaponLocksThisRun,enemiesDefeatedThisRun:this.enemiesDefeatedThisRun,bossSalvosDodgedThisRun:this.bossSalvosDodgedThisRun,activeBullets:this.bulletPool.activeCount,activeParticles:this.particlePool.activeCount,upgrades:{...e.upgrades}}}};j();var yp=new vp;window.__BRIDGE_BLITZ__={getSnapshot:()=>yp.getTelemetrySnapshot(),step:(e,t,n)=>yp.advanceSimulation(e,t,n)};export{y as n,o as r,v as t};