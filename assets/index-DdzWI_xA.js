(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e;(function(e){e.Unimplemented=`UNIMPLEMENTED`,e.Unavailable=`UNAVAILABLE`})(e||={});var t=class extends Error{constructor(e,t,n){super(e),this.message=e,this.code=t,this.data=n}},n=e=>e?.androidBridge?`android`:e?.webkit?.messageHandlers?.bridge?`ios`:`web`,r=r=>{let i=r.CapacitorCustomPlatform||null,a=r.Capacitor||{},o=a.Plugins=a.Plugins||{},s=()=>i===null?n(r):i.name,c=()=>s()!==`web`,l=e=>!!(f.get(e)?.platforms.has(s())||u(e)),u=e=>a.PluginHeaders?.find(t=>t.name===e),d=e=>r.console.error(e),f=new Map;return a.convertFileSrc||=e=>e,a.getPlatform=s,a.handleError=d,a.isNativePlatform=c,a.isPluginAvailable=l,a.registerPlugin=(n,r={})=>{let c=f.get(n);if(c)return console.warn(`Capacitor plugin "${n}" already registered. Cannot register plugins twice.`),c.proxy;let l=s(),d=u(n),p,m=async()=>(!p&&l in r?p=p=typeof r[l]==`function`?await r[l]():r[l]:i!==null&&!p&&`web`in r&&(p=p=typeof r.web==`function`?await r.web():r.web),p),h=(r,i)=>{if(d){let e=d?.methods.find(e=>i===e.name);if(e)return e.rtype===`promise`?e=>a.nativePromise(n,i.toString(),e):(e,t)=>a.nativeCallback(n,i.toString(),e,t);if(r)return r[i]?.bind(r)}else if(r)return r[i]?.bind(r);else throw new t(`"${n}" plugin is not implemented on ${l}`,e.Unimplemented)},g=r=>{let i,a=(...a)=>{let o=m().then(o=>{let s=h(o,r);if(s){let e=s(...a);return i=e?.remove,e}throw new t(`"${n}.${r}()" is not implemented on ${l}`,e.Unimplemented)});return r===`addListener`&&(o.remove=async()=>i()),o};return a.toString=()=>`${r.toString()}() { [capacitor code] }`,Object.defineProperty(a,"name",{value:r,writable:!1,configurable:!1}),a},_=g(`addListener`),v=g(`removeListener`),y=(e,t)=>{let n=_({eventName:e},t),r=async()=>{let r=await n;v({eventName:e,callbackId:r},t)},i=new Promise(e=>n.then(()=>e({remove:r})));return i.remove=async()=>{console.warn(`Using addListener() without 'await' is deprecated.`),await r()},i},b=new Proxy({},{get(e,t){switch(t){case`$$typeof`:return;case`toJSON`:return()=>({});case`addListener`:return d?y:_;case`removeListener`:return v;default:return g(t)}}});return o[n]=b,f.set(n,{name:n,proxy:b,platforms:new Set([...Object.keys(r),...d?[l]:[]])}),b},a.Exception=t,a.DEBUG=!!a.DEBUG,a.isLoggingEnabled=!!a.isLoggingEnabled,a},i=(e=>e.Capacitor=r(e))(typeof globalThis<`u`?globalThis:typeof self<`u`?self:typeof window<`u`?window:typeof global<`u`?global:{}),a=i.registerPlugin,o=class{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(e,t){let n=!1;this.listeners[e]||(this.listeners[e]=[],n=!0),this.listeners[e].push(t);let r=this.windowListeners[e];return r&&!r.registered&&this.addWindowListener(r),n&&this.sendRetainedArgumentsForEvent(e),Promise.resolve({remove:async()=>this.removeListener(e,t)})}async removeAllListeners(){this.listeners={};for(let e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t,n){let r=this.listeners[e];if(r)r.forEach(e=>e(t));else if(n){let n=this.retainedEventArguments[e];n||=[],n.push(t),this.retainedEventArguments[e]=n}}hasListeners(e){return!!this.listeners[e]?.length}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:e=>{this.notifyListeners(t,e)}}}unimplemented(t=`not implemented`){return new i.Exception(t,e.Unimplemented)}unavailable(t=`not available`){return new i.Exception(t,e.Unavailable)}async removeListener(e,t){let n=this.listeners[e];if(!n)return;let r=n.indexOf(t);r!==-1&&this.listeners[e].splice(r,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}sendRetainedArgumentsForEvent(e){let t=this.retainedEventArguments[e];t&&(delete this.retainedEventArguments[e],t.forEach(t=>{this.notifyListeners(e,t)}))}},s=e=>encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),c=e=>e.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent),l=class extends o{async getCookies(){let e=document.cookie,t={};return e.split(`;`).forEach(e=>{if(e.length<=0)return;let[n,r]=e.replace(/=/,`CAP_COOKIE`).split(`CAP_COOKIE`);n=c(n).trim(),r=c(r).trim(),t[n]=r}),t}async setCookie(e){try{let t=s(e.key),n=s(e.value),r=e.expires?`; expires=${e.expires.replace(`expires=`,``)}`:``,i=(e.path||`/`).replace(`path=`,``),a=e.url!=null&&e.url.length>0?`domain=${e.url}`:``;document.cookie=`${t}=${n||``}${r}; path=${i}; ${a};`}catch(e){return Promise.reject(e)}}async deleteCookie(e){try{document.cookie=`${e.key}=; Max-Age=0`}catch(e){return Promise.reject(e)}}async clearCookies(){try{let e=document.cookie.split(`;`)||[];for(let t of e)document.cookie=t.replace(/^ +/,``).replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}};a(`CapacitorCookies`,{web:()=>new l});var u=async e=>new Promise((t,n)=>{let r=new FileReader;r.onload=()=>{let e=r.result;t(e.indexOf(`,`)>=0?e.split(`,`)[1]:e)},r.onerror=e=>n(e),r.readAsDataURL(e)}),d=(e={})=>{let t=Object.keys(e);return Object.keys(e).map(e=>e.toLocaleLowerCase()).reduce((n,r,i)=>(n[r]=e[t[i]],n),{})},f=(e,t=!0)=>e?Object.entries(e).reduce((e,n)=>{let[r,i]=n,a,o;return Array.isArray(i)?(o=``,i.forEach(e=>{a=t?encodeURIComponent(e):e,o+=`${r}=${a}&`}),o.slice(0,-1)):(a=t?encodeURIComponent(i):i,o=`${r}=${a}`),`${e}&${o}`},``).substr(1):null,p=(e,t={})=>{let n=Object.assign({method:e.method||`GET`,headers:e.headers},t),r=d(e.headers)[`content-type`]||``;if(typeof e.data==`string`)n.body=e.data;else if(r.includes(`application/x-www-form-urlencoded`)){let t=new URLSearchParams;for(let[n,r]of Object.entries(e.data||{}))t.set(n,r);n.body=t.toString()}else if(r.includes(`multipart/form-data`)||e.data instanceof FormData){let t=new FormData;if(e.data instanceof FormData)e.data.forEach((e,n)=>{t.append(n,e)});else for(let n of Object.keys(e.data))t.append(n,e.data[n]);n.body=t;let r=new Headers(n.headers);r.delete(`content-type`),n.headers=r}else(r.includes(`application/json`)||typeof e.data==`object`)&&(n.body=JSON.stringify(e.data));return n},m=class extends o{async request(e){let t=p(e,e.webFetchExtra),n=f(e.params,e.shouldEncodeUrlParams),r=n?`${e.url}?${n}`:e.url,i=await fetch(r,t),a=i.headers.get(`content-type`)||``,{responseType:o=`text`}=i.ok?e:{};a.includes(`application/json`)&&(o=`json`);let s,c;switch(o){case`arraybuffer`:case`blob`:c=await i.blob(),s=await u(c);break;case`json`:s=await i.json();break;default:s=await i.text()}let l={};return i.headers.forEach((e,t)=>{l[t]=e}),{data:s,headers:l,status:i.status,url:i.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:`GET`}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:`POST`}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:`PUT`}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:`PATCH`}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:`DELETE`}))}};a(`CapacitorHttp`,{web:()=>new m});var h;(function(e){e.Dark=`DARK`,e.Light=`LIGHT`,e.Default=`DEFAULT`})(h||={});var g;(function(e){e.StatusBar=`StatusBar`,e.NavigationBar=`NavigationBar`})(g||={});var _=class extends o{async setStyle(){this.unavailable(`not available for web`)}async setAnimation(){this.unavailable(`not available for web`)}async show(){this.unavailable(`not available for web`)}async hide(){this.unavailable(`not available for web`)}};a(`SystemBars`,{web:()=>new _});var v;(function(e){e.Heavy=`HEAVY`,e.Medium=`MEDIUM`,e.Light=`LIGHT`})(v||={});var y;(function(e){e.Success=`SUCCESS`,e.Warning=`WARNING`,e.Error=`ERROR`})(y||={});var b=`modulepreload`,x=function(e,t){return new URL(e,t).href},S={},C=function(e){return e.pathname.endsWith(`.css`)},w=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},T=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=x(t,n);let r=s(t),i=C(r);return w(S,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:b,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{let i=a=>{t.removeEventListener(`load`,i),t.removeEventListener(`error`,i),a.type===`error`?n(Error(`Unable to preload CSS for ${r}`)):e(a)};t.addEventListener(`load`,i),t.addEventListener(`error`,i)})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},E=a(`Haptics`,{web:()=>T(()=>import(`./web-BrgpY5Zb.js`).then(e=>new e.HapticsWeb),[],import.meta.url)}),D;(function(e){e.Dark=`DARK`,e.Light=`LIGHT`,e.Default=`DEFAULT`})(D||={});var O;(function(e){e.None=`NONE`,e.Slide=`SLIDE`,e.Fade=`FADE`})(O||={});var k=a(`StatusBar`),A=null;async function j(){if(i.isNativePlatform())try{await k.setOverlaysWebView({overlay:!0}),await k.setStyle({style:D.Dark})}catch{}else`serviceWorker`in navigator&&window.location.protocol.startsWith(`http`)&&window.addEventListener(`load`,()=>{navigator.serviceWorker.register(`./sw.js`,{scope:`./`}).catch(()=>{})});let e=async()=>{let e=navigator;if(e.wakeLock&&document.visibilityState===`visible`)try{A=await e.wakeLock.request(`screen`)}catch{}};e(),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&!A&&e()})}function ee(e=12){if(i.isNativePlatform())E.impact({style:e>=20?v.Medium:v.Light}).catch(()=>{});else if(typeof navigator<`u`&&typeof navigator.vibrate==`function`)try{navigator.vibrate(e)}catch{}}var M=class{ctx=null;noiseBuffer=null;settings;lastShotSoundTime=0;lastGateTickTime=0;lastGateDecayTime=0;lastCoinSoundTime=0;noiseCursor=0;constructor(e){this.settings=e}updateSettings(e){this.settings=e}unlockOnGesture(){if(!this.settings.muted){if(!this.ctx){let e=window.AudioContext||window.webkitAudioContext;e&&(this.ctx=new e)}if(this.ctx&&!this.noiseBuffer){let e=this.ctx.sampleRate,t=this.ctx.createBuffer(1,e,e),n=t.getChannelData(0),r=2654435769;for(let t=0;t<e;t++)r=r*1664525+1013904223|0,n[t]=(r>>>0)/4294967295*2-1;this.noiseBuffer=t}this.ctx&&this.ctx.state===`suspended`&&this.ctx.resume()}}vibrate(e=12){this.settings.haptics&&ee(e)}ensureReady(){return this.settings.muted||!this.ctx||this.ctx.state!==`running`?null:this.ctx}playFilteredNoise(e,t,n,r,i,a,o){if(!this.noiseBuffer||o<=5e-4)return;let s=e.createBufferSource();s.buffer=this.noiseBuffer;let c=e.createBiquadFilter();c.type=r,c.frequency.setValueAtTime(i,t),c.Q.setValueAtTime(a,t);let l=e.createGain();l.gain.setValueAtTime(o,t),l.gain.exponentialRampToValueAtTime(8e-4,t+n),s.connect(c).connect(l).connect(e.destination),this.noiseCursor=(this.noiseCursor+.13)%.72,s.start(t,this.noiseCursor,n+.01)}playGunfire(e,t=1){let n=this.ensureReady();if(!n)return;let r=n.currentTime;if(r-this.lastShotSoundTime<.052)return;this.lastShotSoundTime=r;let i=Math.min(1,Math.max(0,(t-1)/39)),a=1+i*.28,o=n.createOscillator(),s=n.createGain();if(e===5){o.type=`sine`,o.frequency.setValueAtTime(960,r),o.frequency.exponentialRampToValueAtTime(220,r+.068),s.gain.setValueAtTime(.054*a,r),s.gain.exponentialRampToValueAtTime(.001,r+.068),o.connect(s).connect(n.destination),o.start(r),o.stop(r+.072),this.playFilteredNoise(n,r,.032,`bandpass`,3200,2.4,.022*a);return}o.type=e>=3?`sawtooth`:`triangle`;let c=e===4?275:e===3?220:e===2?320:295;o.frequency.setValueAtTime(c*(1-i*.06),r),o.frequency.exponentialRampToValueAtTime(64,r+.048),s.gain.setValueAtTime(.044*a,r),s.gain.exponentialRampToValueAtTime(.001,r+.048),o.connect(s).connect(n.destination),o.start(r),o.stop(r+.052);let l=e>=3?1850:2400,u=(e===4?.036:.028)*a;this.playFilteredNoise(n,r,.03,`bandpass`,l,1.4,u)}playCoinPickup(){let e=this.ensureReady();if(!e)return;let t=e.currentTime;if(t-this.lastCoinSoundTime<.068)return;this.lastCoinSoundTime=t;let n=[1318.51,1760];for(let r=0;r<n.length;r++){let i=e.createOscillator(),a=e.createGain();i.type=`sine`;let o=t+r*.032;i.frequency.setValueAtTime(n[r],o),a.gain.setValueAtTime(.038,o),a.gain.exponentialRampToValueAtTime(8e-4,o+.085),i.connect(a).connect(e.destination),i.start(o),i.stop(o+.09)}}playGateTick(e){let t=this.ensureReady();if(!t)return;let n=t.currentTime;if(n-this.lastGateTickTime<.038)return;this.lastGateTickTime=n;let r=t.createOscillator(),i=t.createGain();r.type=`triangle`;let a=e>0&&e<4?540+(e-1)*320:420+(Math.max(-25,Math.min(35,e))+25)*11;r.frequency.setValueAtTime(a,n),r.frequency.exponentialRampToValueAtTime(a*1.18,n+.042),i.gain.setValueAtTime(.048,n),i.gain.exponentialRampToValueAtTime(.001,n+.048),r.connect(i).connect(t.destination),r.start(n),r.stop(n+.052)}playGateDecayTick(e){let t=this.ensureReady();if(!t)return;let n=t.currentTime;if(n-this.lastGateDecayTime<.058)return;this.lastGateDecayTime=n;let r=t.createOscillator(),i=t.createGain();r.type=`triangle`;let a=e>0&&e<4?440+(e-1)*190:360+(Math.max(-25,Math.min(35,e))+25)*7.5;r.frequency.setValueAtTime(a,n),r.frequency.exponentialRampToValueAtTime(Math.max(140,a*.78),n+.044),i.gain.setValueAtTime(.032,n),i.gain.exponentialRampToValueAtTime(8e-4,n+.048),r.connect(i).connect(t.destination),r.start(n),r.stop(n+.052)}playBarrelCrash(){this.vibrate(18);let e=this.ensureReady();if(!e)return;let t=e.currentTime,n=e.createOscillator(),r=e.createGain();n.type=`sawtooth`,n.frequency.setValueAtTime(170,t),n.frequency.exponentialRampToValueAtTime(48,t+.16),r.gain.setValueAtTime(.11,t),r.gain.exponentialRampToValueAtTime(.001,t+.17),n.connect(r).connect(e.destination),n.start(t),n.stop(t+.18),this.playFilteredNoise(e,t,.12,`bandpass`,780,.9,.075)}playGateFlipChime(){this.vibrate(12);let e=this.ensureReady();if(!e)return;let t=[523.25,659.25,783.99,1046.5],n=e.currentTime;for(let r=0;r<t.length;r++){let i=e.createOscillator(),a=e.createGain();i.type=`triangle`;let o=n+r*.045;i.frequency.setValueAtTime(t[r],o),a.gain.setValueAtTime(.08,o),a.gain.exponentialRampToValueAtTime(.001,o+.14),i.connect(a).connect(e.destination),i.start(o),i.stop(o+.15)}}playGateCollect(e){let t=this.ensureReady();if(!t)return;let n=t.currentTime,r=t.createOscillator(),i=t.createGain();r.type=e?`triangle`:`sawtooth`,e?(r.frequency.setValueAtTime(440,n),r.frequency.exponentialRampToValueAtTime(880,n+.14)):(r.frequency.setValueAtTime(220,n),r.frequency.exponentialRampToValueAtTime(85,n+.18)),i.gain.setValueAtTime(.09,n),i.gain.exponentialRampToValueAtTime(.001,n+.19),r.connect(i).connect(t.destination),r.start(n),r.stop(n+.2)}playRicochet(){let e=this.ensureReady();if(!e)return;let t=e.currentTime;if(t-this.lastGateTickTime<.07)return;this.lastGateTickTime=t;let n=e.createOscillator(),r=e.createGain();n.type=`square`,n.frequency.setValueAtTime(1350,t),n.frequency.exponentialRampToValueAtTime(680,t+.035),r.gain.setValueAtTime(.022,t),r.gain.exponentialRampToValueAtTime(.001,t+.04),n.connect(r).connect(e.destination),n.start(t),n.stop(t+.045)}playTireBreak(e){this.vibrate(12);let t=this.ensureReady();if(!t)return;let n=t.currentTime,r=t.createOscillator(),i=t.createGain();r.type=`triangle`,r.frequency.setValueAtTime(205,n),r.frequency.exponentialRampToValueAtTime(52,n+.12),i.gain.setValueAtTime(.11,n),i.gain.exponentialRampToValueAtTime(.001,n+.13),r.connect(i).connect(t.destination),r.start(n),r.stop(n+.14),this.playFilteredNoise(t,n,.095,`bandpass`,920,.9,.068);let a=e?[587.33,880,1174.66]:[659.25,987.77];for(let e=0;e<a.length;e++){let r=t.createOscillator(),i=t.createGain();r.type=`sine`;let o=n+.04+e*.05;r.frequency.setValueAtTime(a[e],o),i.gain.setValueAtTime(.075,o),i.gain.exponentialRampToValueAtTime(.001,o+.13),r.connect(i).connect(t.destination),r.start(o),r.stop(o+.14)}}playEnemyPop(){let e=this.ensureReady();if(!e)return;let t=e.currentTime,n=e.createOscillator(),r=e.createGain();n.type=`sine`,n.frequency.setValueAtTime(280,t),n.frequency.exponentialRampToValueAtTime(95,t+.06),r.gain.setValueAtTime(.05,t),r.gain.exponentialRampToValueAtTime(.001,t+.065),n.connect(r).connect(e.destination),n.start(t),n.stop(t+.07),this.playFilteredNoise(e,t,.038,`lowpass`,1100,1,.025)}playBossDefeat(){this.vibrate(12);let e=this.ensureReady();if(!e)return;let t=e.currentTime;this.playFilteredNoise(e,t,.26,`lowpass`,620,.8,.095);let n=[523.25,659.25,783.99,1046.5,1318.5];for(let r=0;r<n.length;r++){let i=e.createOscillator(),a=e.createGain();i.type=`triangle`;let o=t+r*.065;i.frequency.setValueAtTime(n[r],o),a.gain.setValueAtTime(.09,o),a.gain.exponentialRampToValueAtTime(.001,o+.35),i.connect(a).connect(e.destination),i.start(o),i.stop(o+.36)}}playBossSalvoWarning(){this.vibrate(10);let e=this.ensureReady();if(!e)return;let t=e.currentTime;for(let n=0;n<2;n++){let r=e.createOscillator(),i=e.createGain();r.type=`sawtooth`;let a=t+n*.12;r.frequency.setValueAtTime(540,a),r.frequency.exponentialRampToValueAtTime(820,a+.09),i.gain.setValueAtTime(.055,a),i.gain.exponentialRampToValueAtTime(.001,a+.1),r.connect(i).connect(e.destination),r.start(a),r.stop(a+.11)}}playBossSalvoImpact(e){e||this.vibrate(20);let t=this.ensureReady();if(!t)return;let n=t.currentTime,r=t.createOscillator(),i=t.createGain();e?(r.type=`triangle`,r.frequency.setValueAtTime(620,n),r.frequency.exponentialRampToValueAtTime(980,n+.09),i.gain.setValueAtTime(.055,n),i.gain.exponentialRampToValueAtTime(.001,n+.1),r.connect(i).connect(t.destination),r.start(n),r.stop(n+.11)):(r.type=`sawtooth`,r.frequency.setValueAtTime(165,n),r.frequency.exponentialRampToValueAtTime(42,n+.22),i.gain.setValueAtTime(.13,n),i.gain.exponentialRampToValueAtTime(.001,n+.24),r.connect(i).connect(t.destination),r.start(n),r.stop(n+.25),this.playFilteredNoise(t,n,.16,`lowpass`,540,1.1,.085))}playUpgradeBuy(e=1){this.vibrate(10);let t=this.ensureReady();if(!t)return;let n=t.currentTime,r=1+(Math.max(1,e)-1)%5*.06,i=[587.33*r,783.99*r,1174.66*r];for(let e=0;e<i.length;e++){let r=t.createOscillator(),a=t.createGain();r.type=`triangle`;let o=n+e*.042;r.frequency.setValueAtTime(i[e],o),a.gain.setValueAtTime(.072,o),a.gain.exponentialRampToValueAtTime(.001,o+.13),r.connect(a).connect(t.destination),r.start(o),r.stop(o+.14)}}playUnicornVictoryFanfare(){this.vibrate(18);let e=this.ensureReady();if(!e)return;let t=e.currentTime,n=[523.25,659.25,783.99,987.77,1174.66,1567.98];for(let r=0;r<n.length;r++){let i=e.createOscillator(),a=e.createGain();i.type=r>=4?`sine`:`triangle`;let o=t+r*.068;i.frequency.setValueAtTime(n[r],o),a.gain.setValueAtTime(r===n.length-1?.095:.072,o),a.gain.exponentialRampToValueAtTime(8e-4,o+(r===n.length-1?.55:.28)),i.connect(a).connect(e.destination),i.start(o),i.stop(o+(r===n.length-1?.57:.3))}}playUnicornFireworkBurst(e=0){this.vibrate(8);let t=this.ensureReady();if(!t)return;let n=t.currentTime,r=1+(e%4-1)*.08,i=t.createOscillator(),a=t.createGain();i.type=`sine`,i.frequency.setValueAtTime(420*r,n),i.frequency.exponentialRampToValueAtTime(1260*r,n+.085),a.gain.setValueAtTime(.032,n),a.gain.exponentialRampToValueAtTime(.001,n+.09),i.connect(a).connect(t.destination),i.start(n),i.stop(n+.095);let o=n+.075,s=t.createOscillator(),c=t.createGain();s.type=`triangle`,s.frequency.setValueAtTime(210*r,o),s.frequency.exponentialRampToValueAtTime(48,o+.14),c.gain.setValueAtTime(.085,o),c.gain.exponentialRampToValueAtTime(.001,o+.15),s.connect(c).connect(t.destination),s.start(o),s.stop(o+.16),this.playFilteredNoise(t,o,.18,`bandpass`,2650*r,1.4,.046)}},te=1e3,ne=1001,re=1002,N=1003,ie=1004,ae=1005,oe=1006,se=1007,ce=1008,le=1009,ue=1010,de=1011,fe=1012,pe=1013,me=1014,he=1015,ge=1016,_e=1017,ve=1018,ye=1020,be=35902,xe=35899,Se=1021,Ce=1022,we=1023,Te=1026,Ee=1027,De=1028,Oe=1029,ke=1030,Ae=1031,je=1033,Me=33776,Ne=33777,Pe=33778,Fe=33779,P=35840,Ie=35841,Le=35842,Re=35843,F=36196,ze=37492,I=37496,Be=37488,Ve=37489,He=37490,Ue=37491,We=37808,Ge=37809,Ke=37810,qe=37811,Je=37812,Ye=37813,Xe=37814,Ze=37815,Qe=37816,$e=37817,et=37818,tt=37819,nt=37820,rt=37821,it=36492,at=36494,ot=36495,st=36283,ct=36284,lt=36285,ut=36286,dt=2300,ft=2301,pt=2302,mt=2303,ht=2400,gt=2401,_t=2402,vt=3200,yt=`srgb`,bt=`srgb-linear`,xt=`linear`,St=`srgb`,Ct=7680,wt=35044,Tt=35048,Et=2e3;function Dt(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Ot(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function kt(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function At(){let e=kt(`canvas`);return e.style.display=`block`,e}var jt={};function Mt(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function Nt(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function L(...e){e=Nt(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function R(...e){e=Nt(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function Pt(...e){let t=e.join(` `);t in jt||(jt[t]=!0,L(...e))}function Ft(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var It={0:0,2:6,4:4,3:5,1:1,6:2,7:7,5:3},Lt=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},Rt=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),zt=Math.PI/180,Bt=180/Math.PI;function Vt(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Rt[e&255]+Rt[e>>8&255]+Rt[e>>16&255]+Rt[e>>24&255]+`-`+Rt[t&255]+Rt[t>>8&255]+`-`+Rt[t>>16&15|64]+Rt[t>>24&255]+`-`+Rt[n&63|128]+Rt[n>>8&255]+`-`+Rt[n>>16&255]+Rt[n>>24&255]+Rt[r&255]+Rt[r>>8&255]+Rt[r>>16&255]+Rt[r>>24&255]).toLowerCase()}function Ht(e,t,n){return Math.max(t,Math.min(n,e))}function Ut(e,t){return(e%t+t)%t}function Wt(e,t,n){return(1-n)*e+n*t}function Gt(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function Kt(e){switch(e.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function qt(e,t){if(t.constructor===Float32Array)return e;let n=Kt(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.max(e/n,-1)}function Jt(e,t){if(t.constructor===Float32Array)return e;let n=Kt(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.round(e*n)}var z=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ht(this.x,e.x,t.x),this.y=Ht(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ht(this.x,e,t),this.y=Ht(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ht(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ht(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Yt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:L(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ht(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},B=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Zt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Zt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ht(this.x,e.x,t.x),this.y=Ht(this.y,e.y,t.y),this.z=Ht(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ht(this.x,e,t),this.y=Ht(this.y,e,t),this.z=Ht(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ht(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Xt.copy(this).projectOnVector(e),this.sub(Xt)}reflect(e){return this.sub(Xt.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ht(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Xt=new B,Zt=new Yt,V=class{static{this.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return Pt(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(Qt.makeScale(e,t)),this}rotate(e){return Pt(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(Qt.makeRotation(-e)),this}translate(e,t){return Pt(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(Qt.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Qt=new V,$t=new V().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),en=new V().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function tn(){let e={enabled:!0,workingColorSpace:bt,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=rn(e.r),e.g=rn(e.g),e.b=rn(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=an(e.r),e.g=an(e.g),e.b=an(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?xt:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[n].fromXYZ).multiply(this.spaces[t].toXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[bt]:{primaries:t,whitePoint:r,transfer:xt,toXYZ:$t,fromXYZ:en,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:yt},outputColorSpaceConfig:{drawingBufferColorSpace:yt}},[yt]:{primaries:t,whitePoint:r,transfer:St,toXYZ:$t,fromXYZ:en,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:yt}}}),e}var nn=tn();function rn(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function an(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var on,sn=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{on===void 0&&(on=kt(`canvas`)),on.width=e.width,on.height=e.height;let t=on.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=on}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=kt(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=rn(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(rn(t[e]/255)*255):t[e]=rn(t[e]);return{data:t,width:e.width,height:e.height}}return L(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},cn=0,ln=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:cn++}),this.uuid=Vt(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width||0,t.height||0,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(un(r[t].image)):e.push(un(r[t]))}else e=un(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function un(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?sn.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(L(`Texture: Unable to serialize Texture.`),{})}var dn=0,fn=new B,pn=class e extends Lt{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=ne,i=ne,a=oe,o=ce,s=we,c=le,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:dn++}),this.uuid=Vt(),this.name=``,this.source=new ln(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new z(0,0),this.repeat=new z(1,1),this.center=new z(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new V,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(fn).x}get height(){return this.source.getSize(fn).y}get depth(){return this.source.getSize(fn).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){L(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?L(`Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case te:e.x-=Math.floor(e.x);break;case ne:e.x=e.x<0?0:1;break;case re:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case te:e.y-=Math.floor(e.y);break;case ne:e.y=e.y<0?0:1;break;case re:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};pn.DEFAULT_IMAGE=null,pn.DEFAULT_MAPPING=300,pn.DEFAULT_ANISOTROPY=1;var mn=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ht(this.x,e.x,t.x),this.y=Ht(this.y,e.y,t.y),this.z=Ht(this.z,e.z,t.z),this.w=Ht(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ht(this.x,e,t),this.y=Ht(this.y,e,t),this.z=Ht(this.z,e,t),this.w=Ht(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ht(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},hn=class extends Lt{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:oe,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new mn(0,0,e,t),this.scissorTest=!1,this.viewport=new mn(0,0,e,t),this.textures=[];let r=n.count;for(let i=0;i<r;i++)this.textures[i]=new pn({width:e,height:t,depth:n.depth}),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:oe,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new ln(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},gn=class extends hn{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},_n=class extends pn{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=N,this.minFilter=N,this.wrapR=ne,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},vn=class extends pn{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=N,this.minFilter=N,this.wrapR=ne,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},yn=class e{static{this.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/bn.setFromMatrixColumn(e,0).length(),i=1/bn.setFromMatrixColumn(e,1).length(),a=1/bn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Sn,e,Cn)}lookAt(e,t,n){let r=this.elements;return En.subVectors(e,t),En.lengthSq()===0&&(En.z=1),En.normalize(),wn.crossVectors(n,En),wn.lengthSq()===0&&(Math.abs(n.z)===1?En.x+=1e-4:En.z+=1e-4,En.normalize(),wn.crossVectors(n,En)),wn.normalize(),Tn.crossVectors(En,wn),r[0]=wn.x,r[4]=Tn.x,r[8]=En.x,r[1]=wn.y,r[5]=Tn.y,r[9]=En.y,r[2]=wn.z,r[6]=Tn.z,r[10]=En.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],ee=r[14],M=r[3],te=r[7],ne=r[11],re=r[15];return i[0]=a*x+o*T+s*k+c*M,i[4]=a*S+o*E+s*A+c*te,i[8]=a*C+o*D+s*j+c*ne,i[12]=a*w+o*O+s*ee+c*re,i[1]=l*x+u*T+d*k+f*M,i[5]=l*S+u*E+d*A+f*te,i[9]=l*C+u*D+d*j+f*ne,i[13]=l*w+u*O+d*ee+f*re,i[2]=p*x+m*T+h*k+g*M,i[6]=p*S+m*E+h*A+g*te,i[10]=p*C+m*D+h*j+g*ne,i[14]=p*w+m*O+h*ee+g*re,i[3]=_*x+v*T+y*k+b*M,i[7]=_*S+v*E+y*A+b*te,i[11]=_*C+v*D+y*j+b*ne,i[15]=_*w+v*O+y*ee+b*re,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=bn.set(r[0],r[1],r[2]).length(),o=bn.set(r[4],r[5],r[6]).length(),s=bn.set(r[8],r[9],r[10]).length();i<0&&(a=-a),xn.copy(this);let c=1/a,l=1/o,u=1/s;return xn.elements[0]*=c,xn.elements[1]*=c,xn.elements[2]*=c,xn.elements[4]*=l,xn.elements[5]*=l,xn.elements[6]*=l,xn.elements[8]*=u,xn.elements[9]*=u,xn.elements[10]*=u,t.setFromRotationMatrix(xn),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=Et,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=Et,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},bn=new B,xn=new yn,Sn=new B(0,0,0),Cn=new B(1,1,1),wn=new B,Tn=new B,En=new B,Dn=new yn,On=new Yt,kn=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(Ht(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-Ht(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(Ht(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-Ht(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(Ht(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-Ht(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:L(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Dn.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Dn,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return On.setFromEuler(this),this.setFromQuaternion(On,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};kn.DEFAULT_ORDER=`XYZ`;var An=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},jn=0,Mn=new B,Nn=new Yt,Pn=new yn,Fn=new B,In=new B,Ln=new B,Rn=new Yt,zn=new B(1,0,0),Bn=new B(0,1,0),Vn=new B(0,0,1),Hn={type:`added`},Un={type:`removed`},Wn={type:`childadded`,child:null},Gn={type:`childremoved`,child:null},Kn=class e extends Lt{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:jn++}),this.uuid=Vt(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new B,n=new kn,r=new Yt,i=new B(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new yn},normalMatrix:{value:new V}}),this.matrix=new yn,this.matrixWorld=new yn,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new An,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Nn.setFromAxisAngle(e,t),this.quaternion.multiply(Nn),this}rotateOnWorldAxis(e,t){return Nn.setFromAxisAngle(e,t),this.quaternion.premultiply(Nn),this}rotateX(e){return this.rotateOnAxis(zn,e)}rotateY(e){return this.rotateOnAxis(Bn,e)}rotateZ(e){return this.rotateOnAxis(Vn,e)}translateOnAxis(e,t){return Mn.copy(e).applyQuaternion(this.quaternion),this.position.add(Mn.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(zn,e)}translateY(e){return this.translateOnAxis(Bn,e)}translateZ(e){return this.translateOnAxis(Vn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Pn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Fn.copy(e):Fn.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),In.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Pn.lookAt(In,Fn,this.up):Pn.lookAt(Fn,In,this.up),this.quaternion.setFromRotationMatrix(Pn),r&&(Pn.extractRotation(r.matrixWorld),Nn.setFromRotationMatrix(Pn),this.quaternion.premultiply(Nn.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(R(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Hn),Wn.child=e,this.dispatchEvent(Wn),Wn.child=null):R(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Un),Gn.child=e,this.dispatchEvent(Gn),Gn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Pn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Pn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Pn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Hn),Wn.child=e,this.dispatchEvent(Wn),Wn.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(In,e,Ln),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(In,Rn,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};Kn.DEFAULT_UP=new B(0,1,0),Kn.DEFAULT_MATRIX_AUTO_UPDATE=!0,Kn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var H=class extends Kn{constructor(){super(),this.isGroup=!0,this.type=`Group`}},qn={type:`move`},Jn=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new H,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new H,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new B,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new B),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new H,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new B,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new B,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.quaternion,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.quaternion,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(qn)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new H;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Yn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Xn={h:0,s:0,l:0},Zn={h:0,s:0,l:0};function Qn(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var U=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=yt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,nn.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=nn.workingColorSpace){return this.r=e,this.g=t,this.b=n,nn.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=nn.workingColorSpace){if(e=Ut(e,1),t=Ht(t,0,1),n=Ht(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Qn(i,r,e+1/3),this.g=Qn(i,r,e),this.b=Qn(i,r,e-1/3)}return nn.colorSpaceToWorking(this,r),this}setStyle(e,t=yt){function n(t){t!==void 0&&parseFloat(t)<1&&L(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseFloat(i[1]))/100,Math.min(100,parseFloat(i[2]))/100,Math.min(100,parseFloat(i[3]))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:L(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);L(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=yt){let n=Yn[e.toLowerCase()];return n===void 0?L(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=rn(e.r),this.g=rn(e.g),this.b=rn(e.b),this}copyLinearToSRGB(e){return this.r=an(e.r),this.g=an(e.g),this.b=an(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=yt){return nn.workingToColorSpace($n.copy(this),e),Math.round(Ht($n.r*255,0,255))*65536+Math.round(Ht($n.g*255,0,255))*256+Math.round(Ht($n.b*255,0,255))}getHexString(e=yt){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=nn.workingColorSpace){nn.workingToColorSpace($n.copy(this),t);let n=$n.r,r=$n.g,i=$n.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=nn.workingColorSpace){return nn.workingToColorSpace($n.copy(this),t),e.r=$n.r,e.g=$n.g,e.b=$n.b,e}getStyle(e=yt){nn.workingToColorSpace($n.copy(this),e);let t=$n.r,n=$n.g,r=$n.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(Xn),this.setHSL(Xn.h+e,Xn.s+t,Xn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Xn),e.getHSL(Zn);let n=Wt(Xn.h,Zn.h,t),r=Wt(Xn.s,Zn.s,t),i=Wt(Xn.l,Zn.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},$n=new U;U.NAMES=Yn;var er=class e{constructor(e,t=25e-5){this.isFogExp2=!0,this.name=``,this.color=new U(e),this.density=t}clone(){return new e(this.color,this.density)}toJSON(){return{type:`FogExp2`,name:this.name,color:this.color.getHex(),density:this.density}}},tr=class extends Kn{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new kn,this.environmentIntensity=1,this.environmentRotation=new kn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background===null?null:e.background.clone(),this.environment=e.environment===null?null:e.environment.clone(),this.fog=e.fog===null?null:e.fog.clone(),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial===null?null:e.overrideMaterial.clone(),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},nr=new B,rr=new B,ir=new B,ar=new B,or=new B,sr=new B,cr=new B,lr=new B,ur=new B,dr=new B,fr=new mn,pr=new mn,mr=new mn,hr=class e{constructor(e=new B,t=new B,n=new B){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),nr.subVectors(e,t),r.cross(nr);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){nr.subVectors(r,t),rr.subVectors(n,t),ir.subVectors(e,t);let a=nr.dot(nr),o=nr.dot(rr),s=nr.dot(ir),c=rr.dot(rr),l=rr.dot(ir),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,ar)!==null&&ar.x>=0&&ar.y>=0&&ar.x+ar.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,ar)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,ar.x),s.addScaledVector(a,ar.y),s.addScaledVector(o,ar.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return fr.setScalar(0),pr.setScalar(0),mr.setScalar(0),fr.fromBufferAttribute(e,t),pr.fromBufferAttribute(e,n),mr.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(fr,i.x),a.addScaledVector(pr,i.y),a.addScaledVector(mr,i.z),a}static isFrontFacing(e,t,n,r){return nr.subVectors(n,t),rr.subVectors(e,t),nr.cross(rr).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return nr.subVectors(this.c,this.b),rr.subVectors(this.a,this.b),nr.cross(rr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;or.subVectors(r,n),sr.subVectors(i,n),lr.subVectors(e,n);let s=or.dot(lr),c=sr.dot(lr);if(s<=0&&c<=0)return t.copy(n);ur.subVectors(e,r);let l=or.dot(ur),u=sr.dot(ur);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0&&s-l>0)return a=s/(s-l),t.copy(n).addScaledVector(or,a);dr.subVectors(e,i);let f=or.dot(dr),p=sr.dot(dr);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(sr,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return cr.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(cr,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(or,a).addScaledVector(sr,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},gr=class{constructor(e=new B(1/0,1/0,1/0),t=new B(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(vr.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(vr.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=vr.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,vr):vr.fromBufferAttribute(r,t),vr.applyMatrix4(e.matrixWorld),this.expandByPoint(vr);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),yr.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),yr.copy(e.boundingBox)),yr.applyMatrix4(e.matrixWorld),this.union(yr)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,vr),vr.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Er),Dr.subVectors(this.max,Er),br.subVectors(e.a,Er),xr.subVectors(e.b,Er),Sr.subVectors(e.c,Er),Cr.subVectors(xr,br),wr.subVectors(Sr,xr),Tr.subVectors(br,Sr);let t=[0,-Cr.z,Cr.y,0,-wr.z,wr.y,0,-Tr.z,Tr.y,Cr.z,0,-Cr.x,wr.z,0,-wr.x,Tr.z,0,-Tr.x,-Cr.y,Cr.x,0,-wr.y,wr.x,0,-Tr.y,Tr.x,0];return!Ar(t,br,xr,Sr,Dr)||(t=[1,0,0,0,1,0,0,0,1],!Ar(t,br,xr,Sr,Dr))?!1:(Or.crossVectors(Cr,wr),t=[Or.x,Or.y,Or.z],Ar(t,br,xr,Sr,Dr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,vr).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(vr).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(_r[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),_r[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),_r[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),_r[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),_r[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),_r[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),_r[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),_r[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(_r)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},_r=[new B,new B,new B,new B,new B,new B,new B,new B],vr=new B,yr=new gr,br=new B,xr=new B,Sr=new B,Cr=new B,wr=new B,Tr=new B,Er=new B,Dr=new B,Or=new B,kr=new B;function Ar(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){kr.fromArray(e,a);let o=i.x*Math.abs(kr.x)+i.y*Math.abs(kr.y)+i.z*Math.abs(kr.z),s=t.dot(kr),c=n.dot(kr),l=r.dot(kr);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var jr=new B,Mr=new z,Nr=0,Pr=class extends Lt{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Nr++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=wt,this.updateRanges=[],this.gpuType=he,this.version=0,this._normalizationScale=e===void 0?void 0:Kt(e)}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Mr.fromBufferAttribute(this,t),Mr.applyMatrix3(e),this.setXY(t,Mr.x,Mr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)jr.fromBufferAttribute(this,t),jr.applyMatrix3(e),this.setXYZ(t,jr.x,jr.y,jr.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)jr.fromBufferAttribute(this,t),jr.applyMatrix4(e),this.setXYZ(t,jr.x,jr.y,jr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)jr.fromBufferAttribute(this,t),jr.applyNormalMatrix(e),this.setXYZ(t,jr.x,jr.y,jr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)jr.fromBufferAttribute(this,t),jr.transformDirection(e),this.setXYZ(t,jr.x,jr.y,jr.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),i=this._normalize(i)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}_denormalize(e){let t=this._normalizationScale;return t===void 0?qt(e,this.array):Math.max(e/t,-1)}_normalize(e){let t=this._normalizationScale;return t===void 0?Jt(e,this.array):Math.round(e*t)}},Fr=class extends Pr{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Ir=class extends Pr{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Lr=class extends Pr{constructor(e,t,n){super(new Float32Array(e),t,n)}},Rr=new gr,zr=new B,Br=new B,Vr=class{constructor(e=new B,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?Rr.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;zr.subVectors(e,this.center);let t=zr.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(zr,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Br.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(zr.copy(e.center).add(Br)),this.expandByPoint(zr.copy(e.center).sub(Br))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Hr=0,Ur=new yn,Wr=new Kn,Gr=new B,Kr=new gr,qr=new gr,Jr=new B,Yr=class e extends Lt{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Hr++}),this.uuid=Vt(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(Dt(e)?Ir:Fr)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new V().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Ur.makeRotationFromQuaternion(e),this.applyMatrix4(Ur),this}rotateX(e){return Ur.makeRotationX(e),this.applyMatrix4(Ur),this}rotateY(e){return Ur.makeRotationY(e),this.applyMatrix4(Ur),this}rotateZ(e){return Ur.makeRotationZ(e),this.applyMatrix4(Ur),this}translate(e,t,n){return Ur.makeTranslation(e,t,n),this.applyMatrix4(Ur),this}scale(e,t,n){return Ur.makeScale(e,t,n),this.applyMatrix4(Ur),this}lookAt(e){return Wr.lookAt(e),Wr.updateMatrix(),this.applyMatrix4(Wr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Gr).negate(),this.translate(Gr.x,Gr.y,Gr.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new Lr(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&L(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new gr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)R(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new B(-1/0,-1/0,-1/0),new B(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Kr.setFromBufferAttribute(n),this.morphTargetsRelative?(Jr.addVectors(this.boundingBox.min,Kr.min),this.boundingBox.expandByPoint(Jr),Jr.addVectors(this.boundingBox.max,Kr.max),this.boundingBox.expandByPoint(Jr)):(this.boundingBox.expandByPoint(Kr.min),this.boundingBox.expandByPoint(Kr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&R(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Vr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)R(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new B,1/0);else if(e){let n=this.boundingSphere.center;if(Kr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];qr.setFromBufferAttribute(n),this.morphTargetsRelative?(Jr.addVectors(Kr.min,qr.min),Kr.expandByPoint(Jr),Jr.addVectors(Kr.max,qr.max),Kr.expandByPoint(Jr)):(Kr.expandByPoint(qr.min),Kr.expandByPoint(qr.max))}Kr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)Jr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(Jr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)Jr.fromBufferAttribute(a,t),o&&(Gr.fromBufferAttribute(e,t),Jr.add(Gr)),r=Math.max(r,n.distanceToSquared(Jr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&R(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){R(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new Pr(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[],c=new Uint8Array(n.count);for(let e=0;e<n.count;e++)o[e]=new B,s[e]=new B;let l=new B,u=new B,d=new B,f=new z,p=new z,m=new z,h=new B,g=new B;function _(e,t,r){c[e]=c[t]=c[r]=1,l.fromBufferAttribute(n,e),u.fromBufferAttribute(n,t),d.fromBufferAttribute(n,r),f.fromBufferAttribute(i,e),p.fromBufferAttribute(i,t),m.fromBufferAttribute(i,r),u.sub(l),d.sub(l),p.sub(f),m.sub(f);let a=1/(p.x*m.y-m.x*p.y);isFinite(a)&&(h.copy(u).multiplyScalar(m.y).addScaledVector(d,-p.y).multiplyScalar(a),g.copy(d).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(a),o[e].add(h),o[t].add(h),o[r].add(h),s[e].add(g),s[t].add(g),s[r].add(g))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let t=0,n=v.length;t<n;++t){let n=v[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)_(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let y=new B,b=new B,x=new B,S=new B;function C(e){x.fromBufferAttribute(r,e),S.copy(x);let t=o[e];y.copy(t),y.sub(x.multiplyScalar(x.dot(t))).normalize(),b.crossVectors(S,t);let n=b.dot(s[e])<0?-1:1;a.setXYZW(e,y.x,y.y,y.z,n)}for(let e=0,t=n.count;e<t;++e)c[e]&&C(e);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new Pr(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new B,i=new B,a=new B,o=new B,s=new B,c=new B,l=new B,u=new B;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Jr.fromBufferAttribute(e,t),Jr.normalize(),e.setXYZ(t,Jr.x,Jr.y,Jr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Pr(a,r,i)}if(this.index===null)return L(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},Xr=new B,Zr=new B,Qr=new V,$r=class{constructor(e=new B(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Xr.subVectors(n,t).cross(Zr.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(Xr),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Qr.getNormalMatrix(e),r=this.coplanarPoint(Xr).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},ei=0,ti=class extends Lt{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ei++}),this.uuid=Vt(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new U(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ct,this.stencilZFail=Ct,this.stencilZPass=Ct,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){L(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?L(`Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new U().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new $r().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new z().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new z().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},ni=new B,ri=new B,ii=new B,ai=new B,oi=class{constructor(e=new B,t=new B(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ni)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=ni.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ni.copy(this.origin).addScaledVector(this.direction,t),ni.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){ri.copy(e).add(t).multiplyScalar(.5),ii.copy(t).sub(e).normalize(),ai.copy(this.origin).sub(ri);let i=e.distanceTo(t)*.5,a=-this.direction.dot(ii),o=ai.dot(this.direction),s=-ai.dot(ii),c=ai.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(ri).addScaledVector(ii,d),f}intersectSphere(e,t){if(e.radius<0)return null;ni.subVectors(e.center,this.origin);let n=ni.dot(this.direction),r=ni.dot(ni)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,ni)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,j,ee,M;if(y>=b&&y>=x?(w=s,D=u,A=p,M=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,j=_,ee=v):(S=l,C=c,T=f,E=d,O=h,k=m,j=v,ee=_)):b>=x?(w=c,D=d,A=m,M=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,j=v,ee=g):(S=s,C=l,T=u,E=f,O=p,k=h,j=g,ee=v)):(w=l,D=f,A=h,M=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,j=g,ee=_):(S=c,C=s,T=d,E=u,O=m,k=p,j=_,ee=g)),w===0)return null;let te=S/w,ne=C/w,re=1/w,N=T-te*D,ie=E-ne*D,ae=O-te*A,oe=k-ne*A,se=j-te*M,ce=ee-ne*M,le=se*oe-ce*ae,ue=N*ce-ie*se,de=ae*ie-oe*N;if(r){if(le<0||ue<0||de<0)return null}else if((le<0||ue<0||de<0)&&(le>0||ue>0||de>0))return null;let fe=le+ue+de;if(fe===0)return null;let pe=re*(le*D+ue*A+de*M);return(fe>0?pe<0:pe>0)?null:this.at(pe/fe,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},W=class extends ti{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new U(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new kn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},si=new yn,ci=new oi,li=new Vr,ui=new B,di=new B,fi=new B,pi=new B,mi=new B,hi=new B,gi=new B,_i=new B,G=class extends Kn{constructor(e=new Yr,t=new W){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){hi.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(mi.fromBufferAttribute(s,e),a?hi.addScaledVector(mi,r):hi.addScaledVector(mi.sub(t),r))}t.add(hi)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),li.copy(n.boundingSphere),li.applyMatrix4(i),ci.copy(e.ray).recast(e.near),li.containsPoint(ci.origin)===!1&&(ci.intersectSphere(li,ui)===null||ci.origin.distanceToSquared(ui)>(e.far-e.near)**2)||(si.copy(i).invert(),ci.copy(e.ray).applyMatrix4(si),(n.boundingBox===null||ci.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,ci)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=yi(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=yi(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=yi(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=yi(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function vi(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;_i.copy(s),_i.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(_i);return l<n.near||l>n.far?null:{distance:l,point:_i.clone(),object:e}}function yi(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,di),e.getVertexPosition(c,fi),e.getVertexPosition(l,pi);let u=vi(e,t,n,r,di,fi,pi,gi);if(u){let e=new B;hr.getBarycoord(gi,di,fi,pi,e),i&&(u.uv=hr.getInterpolatedAttribute(i,s,c,l,e,new z)),a&&(u.uv1=hr.getInterpolatedAttribute(a,s,c,l,e,new z)),o&&(u.normal=hr.getInterpolatedAttribute(o,s,c,l,e,new B),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new B,materialIndex:0};hr.getNormal(di,fi,pi,t.normal),u.face=t,u.barycoord=e}return u}var bi=class extends pn{constructor(e=null,t=1,n=1,r,i,a,o,s,c=N,l=N,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},xi=class extends Pr{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Si=new yn,Ci=new yn,wi=[],Ti=new gr,Ei=new yn,Di=new G,Oi=new Vr,ki=class extends G{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new xi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,Ei)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new gr),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Si),Ti.copy(e.boundingBox).applyMatrix4(Si),this.boundingBox.union(Ti)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Vr),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Si),Oi.copy(e.boundingSphere).applyMatrix4(Si),this.boundingSphere.union(Oi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture===null?null:e.morphTexture.clone(),this.instanceColor=e.instanceColor===null?null:e.instanceColor.clone(),this.count=e.count,this.boundingBox=e.boundingBox===null?null:e.boundingBox.clone(),this.boundingSphere=e.boundingSphere===null?null:e.boundingSphere.clone(),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Di.geometry=this.geometry,Di.material=this.material,Di.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Oi.copy(this.boundingSphere),Oi.applyMatrix4(n),e.ray.intersectsSphere(Oi)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,Si),Ci.multiplyMatrices(n,Si),Di.matrixWorld=Ci,Di.raycast(e,wi);for(let e=0,n=wi.length;e<n;e++){let n=wi[e];n.instanceId=i,n.object=this,t.push(n)}wi.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new xi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new bi(new Float32Array(r*this.count),r,this.count,De,he));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Ai=new Vr,ji=new z(.5,.5),Mi=new B,Ni=class{constructor(e=new $r,t=new $r,n=new $r,r=new $r,i=new $r,a=new $r){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Et,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ai.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ai.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ai)}intersectsSprite(e){return Ai.center.set(0,0,0),Ai.radius=.7071067811865476+ji.distanceTo(e.center),Ai.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ai)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Mi.x=r.normal.x>0?e.max.x:e.min.x,Mi.y=r.normal.y>0?e.max.y:e.min.y,Mi.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Mi)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Pi=new yn,Fi=class e{constructor(){this.coordinateSystem=Et,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let e=0;e<t.length;e++){let r=t[e];Pi.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[e]===void 0&&(n[e]=new Ni),n[e].setFromProjectionMatrix(Pi,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let r=0;r<e._count;r++)t[r]===void 0&&(t[r]=new Ni),t[r].copy(n[r]);return this._count=e._count,this}clone(){return new e().copy(this)}},Ii=class extends ti{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new U(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Li=new yn,Ri=new oi,zi=new Vr,Bi=new B,Vi=class extends Kn{constructor(e=new Yr,t=new Ii){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),zi.copy(n.boundingSphere),zi.applyMatrix4(r),zi.radius+=i,e.ray.intersectsSphere(zi)===!1)return;Li.copy(r).invert(),Ri.copy(e.ray).applyMatrix4(Li);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);Bi.fromBufferAttribute(l,n),Hi(Bi,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)Bi.fromBufferAttribute(l,a),Hi(Bi,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Hi(e,t,n,r,i,a,o){let s=Ri.distanceSqToPoint(e);if(s<n){let n=new B;Ri.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Ui=class extends pn{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Wi=class extends pn{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Gi=class extends pn{constructor(e,t,n=me,r,i,a,o=N,s=N,c,l=Te,u=1){if(l!==1026&&l!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ln(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Ki=class extends Gi{constructor(e,t=me,n=301,r,i,a=N,o=N,s,c=Te){let l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,r,i,a,o,s,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},qi=class extends pn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},K=class e extends Yr{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new Lr(c,3)),this.setAttribute(`normal`,new Lr(l,3)),this.setAttribute(`uv`,new Lr(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new B;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Ji=class e extends Yr{constructor(e=1,t=1,n=4,r=8,i=1){super(),this.type=`CapsuleGeometry`,this.parameters={radius:e,height:t,capSegments:n,radialSegments:r,heightSegments:i},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),r=Math.max(3,Math.floor(r)),i=Math.max(1,Math.floor(i));let a=[],o=[],s=[],c=[],l=t/2,u=Math.PI/2*e,d=t,f=2*u+d,p=n*2+i,m=r+1,h=new B,g=new B;for(let _=0;_<=p;_++){let v=0,y=0,b=0,x=0;if(_<=n){let t=_/n,r=t*Math.PI/2;y=-l-e*Math.cos(r),b=e*Math.sin(r),x=-e*Math.cos(r),v=t*u}else if(_<=n+i){let r=(_-n)/i;y=-l+r*t,b=e,x=0,v=u+r*d}else{let t=(_-n-i)/n,r=t*Math.PI/2;y=l+e*Math.sin(r),b=e*Math.cos(r),x=e*Math.sin(r),v=u+d+t*u}let S=Math.max(0,Math.min(1,v/f)),C=0;_===0?C=.5/r:_===p&&(C=-.5/r);for(let e=0;e<=r;e++){let t=e/r,n=t*Math.PI*2,i=Math.sin(n),a=Math.cos(n);g.x=-b*a,g.y=y,g.z=b*i,o.push(g.x,g.y,g.z),h.set(-b*a,x,b*i),h.normalize(),s.push(h.x,h.y,h.z),c.push(t+C,S)}if(_>0){let e=(_-1)*m;for(let t=0;t<r;t++){let n=e+t,r=e+t+1,i=_*m+t,o=_*m+t+1;a.push(n,r,i),a.push(r,o,i)}}}this.setIndex(a),this.setAttribute(`position`,new Lr(o,3)),this.setAttribute(`normal`,new Lr(s,3)),this.setAttribute(`uv`,new Lr(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},Yi=class e extends Yr{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new B,l=new z;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new Lr(a,3)),this.setAttribute(`normal`,new Lr(o,3)),this.setAttribute(`uv`,new Lr(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},q=class e extends Yr{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new Lr(u,3)),this.setAttribute(`normal`,new Lr(d,3)),this.setAttribute(`uv`,new Lr(f,2));function _(){let a=new B,_=new B,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new z,m=new B,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},J=class e extends q{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Xi=class e extends Yr{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new Lr(i,3)),this.setAttribute(`normal`,new Lr(i.slice(),3)),this.setAttribute(`uv`,new Lr(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new B,r=new B,i=new B;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new B;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new B;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new B,t=new B,n=new B,r=new B,o=new z,s=new z,c=new z;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},Zi=class e extends Xi{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=1/n,i=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-r,-n,0,-r,n,0,r,-n,0,r,n,-r,-n,0,-r,n,0,r,-n,0,r,n,0,-n,0,-r,n,0,-r,-n,0,r,n,0,r];super(i,[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9],e,t),this.type=`DodecahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Qi=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){L(`Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new z:new B);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new B,r=[],i=[],a=[],o=new B,s=new yn;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new B)}i[0]=new B,a[0]=new B;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(Ht(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(Ht(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}},$i=class extends Qi{constructor(e=0,t=0,n=1,r=1,i=0,a=Math.PI*2,o=!1,s=0){super(),this.isEllipseCurve=!0,this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=i,this.aEndAngle=a,this.aClockwise=o,this.aRotation=s}getPoint(e,t=new z){let n=t,r=Math.PI*2,i=this.aEndAngle-this.aStartAngle,a=Math.abs(i)<2**-52;for(;i<0;)i+=r;for(;i>r;)i-=r;i<2**-52&&(i=a?0:r),this.aClockwise===!0&&!a&&(i===r?i=-r:i-=r);let o=this.aStartAngle+e*i,s=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let e=Math.cos(this.aRotation),t=Math.sin(this.aRotation),n=s-this.aX,r=c-this.aY;s=n*e-r*t+this.aX,c=n*t+r*e+this.aY}return n.set(s,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},ea=class extends $i{constructor(e,t,n,r,i,a){super(e,t,n,n,r,i,a),this.isArcCurve=!0,this.type=`ArcCurve`}};function ta(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var na=new B,ra=new B,ia=new ta,aa=new ta,oa=new ta,sa=class extends Qi{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new B){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(ra.subVectors(r[0],r[1]).add(r[0]),c=ra);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(na.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=na),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),ia.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),aa.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),oa.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&(ia.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),aa.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),oa.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set(ia.calc(s),aa.calc(s),oa.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new B().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function ca(e,t,n,r,i){let a=(r-t)*.5,o=(i-n)*.5,s=e*e,c=e*s;return(2*n-2*r+a+o)*c+(-3*n+3*r-2*a-o)*s+a*e+n}function la(e,t){let n=1-e;return n*n*t}function ua(e,t){return 2*(1-e)*e*t}function da(e,t){return e*e*t}function fa(e,t,n,r){return la(e,t)+ua(e,n)+da(e,r)}function pa(e,t){let n=1-e;return n*n*n*t}function ma(e,t){let n=1-e;return 3*n*n*e*t}function ha(e,t){return 3*(1-e)*e*e*t}function ga(e,t){return e*e*e*t}function _a(e,t,n,r,i){return pa(e,t)+ma(e,n)+ha(e,r)+ga(e,i)}var va=class extends Qi{constructor(e=new z,t=new z,n=new z,r=new z){super(),this.isCubicBezierCurve=!0,this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new z){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(_a(e,r.x,i.x,a.x,o.x),_a(e,r.y,i.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ya=class extends Qi{constructor(e=new B,t=new B,n=new B,r=new B){super(),this.isCubicBezierCurve3=!0,this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new B){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(_a(e,r.x,i.x,a.x,o.x),_a(e,r.y,i.y,a.y,o.y),_a(e,r.z,i.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ba=class extends Qi{constructor(e=new z,t=new z){super(),this.isLineCurve=!0,this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new z){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new z){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},xa=class extends Qi{constructor(e=new B,t=new B){super(),this.isLineCurve3=!0,this.type=`LineCurve3`,this.v1=e,this.v2=t}getPoint(e,t=new B){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new B){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Sa=class extends Qi{constructor(e=new z,t=new z,n=new z){super(),this.isQuadraticBezierCurve=!0,this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new z){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(fa(e,r.x,i.x,a.x),fa(e,r.y,i.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ca=class extends Qi{constructor(e=new B,t=new B,n=new B){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new B){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(fa(e,r.x,i.x,a.x),fa(e,r.y,i.y,a.y),fa(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},wa=Object.freeze({__proto__:null,ArcCurve:ea,CatmullRomCurve3:sa,CubicBezierCurve:va,CubicBezierCurve3:ya,EllipseCurve:$i,LineCurve:ba,LineCurve3:xa,QuadraticBezierCurve:Sa,QuadraticBezierCurve3:Ca,SplineCurve:class extends Qi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type=`SplineCurve`,this.points=e}getPoint(e,t=new z){let n=t,r=this.points,i=(r.length-1)*e,a=Math.floor(i),o=i-a,s=r[a===0?a:a-1],c=r[a],l=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return n.set(ca(o,s.x,c.x,l.x,u.x),ca(o,s.y,c.y,l.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new z().fromArray(n))}return this}}}),Ta=class e extends Xi{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Ea=class e extends Yr{constructor(e=[new z(0,-.5),new z(.5,0),new z(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type=`LatheGeometry`,this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=Ht(r,0,Math.PI*2);let i=[],a=[],o=[],s=[],c=[],l=1/t,u=new B,d=new z,f=new B,p=new B,m=new B,h=0,g=0;for(let t=0;t<=e.length-1;t++)switch(t){case 0:h=e[t+1].x-e[t].x,g=e[t+1].y-e[t].y,f.x=g*1,f.y=-h,f.z=g*0,m.copy(f),f.normalize(),s.push(f.x,f.y,f.z);break;case e.length-1:m.normalize(),s.push(m.x,m.y,m.z);break;default:h=e[t+1].x-e[t].x,g=e[t+1].y-e[t].y,f.x=g*1,f.y=-h,f.z=g*0,p.copy(f),f.x+=m.x,f.y+=m.y,f.z+=m.z,f.normalize(),s.push(f.x,f.y,f.z),m.copy(p)}for(let i=0;i<=t;i++){let f=n+i*l*r,p=Math.sin(f),m=Math.cos(f);for(let n=0;n<=e.length-1;n++){u.x=e[n].x*p,u.y=e[n].y,u.z=e[n].x*m,a.push(u.x,u.y,u.z),d.x=i/t,d.y=n/(e.length-1),o.push(d.x,d.y);let r=s[3*n+0]*p,l=s[3*n+1],f=s[3*n+0]*m;c.push(r,l,f)}}for(let n=0;n<t;n++)for(let t=0;t<e.length-1;t++){let r=t+n*e.length,a=r,o=r+e.length,s=r+e.length+1,c=r+1;i.push(a,o,c),i.push(s,c,o)}this.setIndex(i),this.setAttribute(`position`,new Lr(a,3)),this.setAttribute(`uv`,new Lr(o,2)),this.setAttribute(`normal`,new Lr(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.points,t.segments,t.phiStart,t.phiLength)}},Da=class e extends Xi{constructor(e=1,t=0){super([1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],e,t),this.type=`OctahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Oa=class e extends Yr{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new Lr(p,3)),this.setAttribute(`normal`,new Lr(m,3)),this.setAttribute(`uv`,new Lr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},ka=class e extends Yr{constructor(e=.5,t=1,n=32,r=1,i=0,a=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:i,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],s=[],c=[],l=[],u=e,d=(t-e)/r,f=new B,p=new z;for(let e=0;e<=r;e++){for(let e=0;e<=n;e++){let r=i+e/n*a;f.x=u*Math.cos(r),f.y=u*Math.sin(r),s.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,l.push(p.x,p.y)}u+=d}for(let e=0;e<r;e++){let t=e*(n+1);for(let e=0;e<n;e++){let r=e+t,i=r,a=r+n+1,s=r+n+2,c=r+1;o.push(i,a,c),o.push(a,s,c)}}this.setIndex(o),this.setAttribute(`position`,new Lr(s,3)),this.setAttribute(`normal`,new Lr(c,3)),this.setAttribute(`uv`,new Lr(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Aa=class e extends Yr{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new B,d=new B,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new Lr(p,3)),this.setAttribute(`normal`,new Lr(m,3)),this.setAttribute(`uv`,new Lr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},ja=class e extends Yr{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2,a=0,o=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);let s=[],c=[],l=[],u=[],d=new B,f=new B,p=new B;for(let s=0;s<=n;s++){let m=a+s/n*o;for(let a=0;a<=r;a++){let o=a/r*i;f.x=(e+t*Math.cos(m))*Math.cos(o),f.y=(e+t*Math.cos(m))*Math.sin(o),f.z=t*Math.sin(m),c.push(f.x,f.y,f.z),d.x=e*Math.cos(o),d.y=e*Math.sin(o),p.subVectors(f,d).normalize(),l.push(p.x,p.y,p.z),u.push(a/r),u.push(s/n)}}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,a=(r+1)*(e-1)+t,o=(r+1)*e+t;s.push(n,i,o),s.push(i,a,o)}this.setIndex(s),this.setAttribute(`position`,new Lr(c,3)),this.setAttribute(`normal`,new Lr(l,3)),this.setAttribute(`uv`,new Lr(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}},Ma=class e extends Yr{constructor(e=new Ca(new B(-1,-1,0),new B(-1,1,0),new B(1,1,0)),t=64,n=1,r=8,i=!1){super(),this.type=`TubeGeometry`,this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:r,closed:i};let a=e.computeFrenetFrames(t,i);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new B,s=new B,c=new z,l=new B,u=[],d=[],f=[],p=[];m(),this.setIndex(p),this.setAttribute(`position`,new Lr(u,3)),this.setAttribute(`normal`,new Lr(d,3)),this.setAttribute(`uv`,new Lr(f,2));function m(){for(let e=0;e<t;e++)h(e);h(i===!1?t:0),_(),g()}function h(i){l=e.getPointAt(i/t,l);let c=a.normals[i],f=a.binormals[i];for(let e=0;e<=r;e++){let t=e/r*Math.PI*2,i=Math.sin(t),a=-Math.cos(t);s.x=a*c.x+i*f.x,s.y=a*c.y+i*f.y,s.z=a*c.z+i*f.z,s.normalize(),d.push(s.x,s.y,s.z),o.x=l.x+n*s.x,o.y=l.y+n*s.y,o.z=l.z+n*s.z,u.push(o.x,o.y,o.z)}}function g(){for(let e=1;e<=t;e++)for(let t=1;t<=r;t++){let n=(r+1)*(e-1)+(t-1),i=(r+1)*e+(t-1),a=(r+1)*e+t,o=(r+1)*(e-1)+t;p.push(n,i,o),p.push(i,a,o)}}function _(){for(let e=0;e<=t;e++)for(let n=0;n<=r;n++)c.x=e/t,c.y=n/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(t){return new e(new wa[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}};function Na(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(Fa(i))i.isRenderTargetTexture?(L(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(Fa(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function Pa(e){let t={};for(let n=0;n<e.length;n++){let r=Na(e[n]);for(let e in r)t[e]=r[e]}return t}function Fa(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Ia(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function La(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:nn.workingColorSpace}var Ra={clone:Na,merge:Pa},za=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Ba=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Va=class extends ti{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=za,this.fragmentShader=Ba,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Na(e.uniforms),this.uniformsGroups=Ia(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new U().setHex(r.value);break;case`v2`:this.uniforms[n].value=new z().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new B().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new mn().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new V().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new yn().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Ha=class extends Va{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Y=class extends ti{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new U(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new U(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new z(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new kn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Ua=class extends ti{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=vt,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Wa=class extends ti{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Ga(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function Ka(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var qa=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},Ja=class extends qa{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ht,endingEnd:ht}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case gt:i=e,o=2*t-n;break;case _t:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case gt:a=e,s=2*n-t;break;case _t:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Ya=class extends qa{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Xa=class extends qa{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Za=class extends qa{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=eo(n,t,g,y,r);i[p]=Qa(x,o,_,b,m)}return i}};function Qa(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function $a(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function eo(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=Qa(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=$a(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var to=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Ga(t,this.TimeBufferType),this.values=Ga(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ga(e.times,Array),values:Ga(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),Ka(e.settings)&&(n.settings={inTangents:Ga(e.settings.inTangents,Array),outTangents:Ga(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Xa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ya(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ja(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Za(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case dt:t=this.InterpolantFactoryMethodDiscrete;break;case ft:t=this.InterpolantFactoryMethodLinear;break;case pt:t=this.InterpolantFactoryMethodSmooth;break;case mt:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return L(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return dt;case this.InterpolantFactoryMethodLinear:return ft;case this.InterpolantFactoryMethodSmooth:return pt;case this.InterpolantFactoryMethodBezier:return mt}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e;Ka(this.settings)&&(no(this.settings.inTangents,e),no(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;Ka(this.settings)&&(ro(this.settings.inTangents,e),ro(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(R(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(R(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){R(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){R(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Ot(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){R(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===pt,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,Ka(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function no(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]+=t}function ro(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}to.prototype.ValueTypeName=``,to.prototype.TimeBufferType=Float32Array,to.prototype.ValueBufferType=Float32Array,to.prototype.DefaultInterpolation=ft;var io=class extends to{constructor(e,t,n){super(e,t,n)}};io.prototype.ValueTypeName=`bool`,io.prototype.ValueBufferType=Array,io.prototype.DefaultInterpolation=dt,io.prototype.InterpolantFactoryMethodLinear=void 0,io.prototype.InterpolantFactoryMethodSmooth=void 0;var ao=class extends to{constructor(e,t,n,r){super(e,t,n,r)}};ao.prototype.ValueTypeName=`color`;var oo=class extends to{constructor(e,t,n,r){super(e,t,n,r)}};oo.prototype.ValueTypeName=`number`;var so=class extends qa{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Yt.slerpFlat(i,0,a,c-o,a,c,s);return i}},co=class extends to{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new so(this.times,this.values,this.getValueSize(),e)}};co.prototype.ValueTypeName=`quaternion`,co.prototype.InterpolantFactoryMethodSmooth=void 0;var lo=class extends to{constructor(e,t,n){super(e,t,n)}};lo.prototype.ValueTypeName=`string`,lo.prototype.ValueBufferType=Array,lo.prototype.DefaultInterpolation=dt,lo.prototype.InterpolantFactoryMethodLinear=void 0,lo.prototype.InterpolantFactoryMethodSmooth=void 0;var uo=class extends to{constructor(e,t,n,r){super(e,t,n,r)}};uo.prototype.ValueTypeName=`vector`;var fo=class extends Kn{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new U(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},po=class extends fo{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(Kn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new U(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},mo=new yn,ho=new B,go=new B,_o=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new z(512,512),this.mapType=le,this.map=null,this.mapPass=null,this.matrix=new yn,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ni,this._frameExtents=new z(1,1),this._viewportCount=1,this._viewports=[new mn(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;ho.setFromMatrixPosition(e.matrixWorld),t.position.copy(ho),go.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(go),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){mo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(mo,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(mo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},vo=new B,yo=new Yt,bo=new B,xo=class extends Kn{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new yn,this.projectionMatrix=new yn,this.projectionMatrixInverse=new yn,this.coordinateSystem=Et,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(vo,yo,bo),bo.x===1&&bo.y===1&&bo.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(vo,yo,bo.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(vo,yo,bo),bo.x===1&&bo.y===1&&bo.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(vo,yo,bo.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},So=new B,Co=new z,wo=new z,To=class extends xo{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Bt*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(zt*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Bt*2*Math.atan(Math.tan(zt*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){So.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(So.x,So.y).multiplyScalar(-e/So.z),So.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(So.x,So.y).multiplyScalar(-e/So.z)}getViewSize(e,t){return this.getViewBounds(e,Co,wo),t.subVectors(wo,Co)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(zt*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Eo=class extends xo{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Do=class extends _o{constructor(){super(new Eo(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Oo=class extends fo{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(Kn.DEFAULT_UP),this.updateMatrix(),this.target=new Kn,this.shadow=new Do}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},ko=-90,Ao=1,jo=class extends Kn{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new To(ko,Ao,e,t);r.layers=this.layers,this.add(r);let i=new To(ko,Ao,e,t);i.layers=this.layers,this.add(i);let a=new To(ko,Ao,e,t);a.layers=this.layers,this.add(a);let o=new To(ko,Ao,e,t);o.layers=this.layers,this.add(o);let s=new To(ko,Ao,e,t);s.layers=this.layers,this.add(s);let c=new To(ko,Ao,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Mo=class extends To{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}},No=`\\[\\]\\.:\\/`,Po=RegExp(`[\\[\\]\\.:\\/]`,`g`),Fo=`[^\\[\\]\\.:\\/]`,Io=`[^`+No.replace(`\\.`,``)+`]`,Lo=`((?:WC+[\\/:])*)`.replace(`WC`,Fo),Ro=`(WCOD+)?`.replace(`WCOD`,Io),zo=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,Fo),Bo=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,Fo),Vo=RegExp(`^`+Lo+Ro+zo+Bo+`$`),Ho=[`material`,`materials`,`bones`,`map`],Uo=class{constructor(e,t,n){let r=n||Wo.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Wo=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(Po,``)}static parseTrackName(e){let t=Vo.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Ho.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){L(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){R(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){R(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){R(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){R(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){R(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){R(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){R(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;R(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){R(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){R(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Wo.Composite=Uo,Wo.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Wo.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Wo.prototype.GetterByBindingType=[Wo.prototype._getValue_direct,Wo.prototype._getValue_array,Wo.prototype._getValue_arrayElement,Wo.prototype._getValue_toArray],Wo.prototype.SetterByBindingTypeAndVersioning=[[Wo.prototype._setValue_direct,Wo.prototype._setValue_direct_setNeedsUpdate,Wo.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Wo.prototype._setValue_array,Wo.prototype._setValue_array_setNeedsUpdate,Wo.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Wo.prototype._setValue_arrayElement,Wo.prototype._setValue_arrayElement_setNeedsUpdate,Wo.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Wo.prototype._setValue_fromArray,Wo.prototype._setValue_fromArray_setNeedsUpdate,Wo.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]],class{static{this.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}};function Go(e,t,n,r){let i=Ko(r);switch(n){case Se:return e*t;case De:return e*t/i.components*i.byteLength;case Oe:return e*t/i.components*i.byteLength;case ke:return e*t*2/i.components*i.byteLength;case Ae:return e*t*2/i.components*i.byteLength;case Ce:return e*t*3/i.components*i.byteLength;case we:return e*t*4/i.components*i.byteLength;case je:return e*t*4/i.components*i.byteLength;case Me:case Ne:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Pe:case Fe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Ie:case Re:return Math.max(e,16)*Math.max(t,8)/4;case P:case Le:return Math.max(e,8)*Math.max(t,8)/2;case F:case ze:case Be:case Ve:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case I:case He:case Ue:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case We:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Ge:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case Ke:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case qe:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Je:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case Ye:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Xe:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Ze:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Qe:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case $e:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case et:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case tt:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case nt:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case rt:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case it:case at:case ot:return Math.ceil(e/4)*Math.ceil(t/4)*16;case st:case ct:return Math.ceil(e/4)*Math.ceil(t/4)*8;case lt:case ut:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Ko(e){switch(e){case le:case ue:return{byteLength:1,components:1};case fe:case de:case ge:return{byteLength:2,components:1};case _e:case ve:return{byteLength:2,components:4};case me:case pe:case he:return{byteLength:4,components:1};case be:case xe:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`187`}})),typeof window<`u`&&(window.__THREE__?L(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`187`);function qo(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Jo(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var Yo={alphahash_fragment:`#ifdef USE_ALPHAHASH
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
}`},X={common:{diffuse:{value:new U(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new V},alphaMap:{value:null},alphaMapTransform:{value:new V},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new V}},envmap:{envMap:{value:null},envMapRotation:{value:new V},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new V}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new V}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new V},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new V},normalScale:{value:new z(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new V},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new V}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new V}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new V}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new U(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new U(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new V},alphaTest:{value:0},uvTransform:{value:new V}},sprite:{diffuse:{value:new U(16777215)},opacity:{value:1},center:{value:new z(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new V},alphaMap:{value:null},alphaMapTransform:{value:new V},alphaTest:{value:0}}},Xo={basic:{uniforms:Pa([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.fog]),vertexShader:Yo.meshbasic_vert,fragmentShader:Yo.meshbasic_frag},lambert:{uniforms:Pa([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.fog,X.lights,{emissive:{value:new U(0)},envMapIntensity:{value:1}}]),vertexShader:Yo.meshlambert_vert,fragmentShader:Yo.meshlambert_frag},phong:{uniforms:Pa([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.fog,X.lights,{emissive:{value:new U(0)},specular:{value:new U(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Yo.meshphong_vert,fragmentShader:Yo.meshphong_frag},standard:{uniforms:Pa([X.common,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.roughnessmap,X.metalnessmap,X.fog,X.lights,{emissive:{value:new U(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Yo.meshphysical_vert,fragmentShader:Yo.meshphysical_frag},toon:{uniforms:Pa([X.common,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.gradientmap,X.fog,X.lights,{emissive:{value:new U(0)}}]),vertexShader:Yo.meshtoon_vert,fragmentShader:Yo.meshtoon_frag},matcap:{uniforms:Pa([X.common,X.bumpmap,X.normalmap,X.displacementmap,X.fog,{matcap:{value:null}}]),vertexShader:Yo.meshmatcap_vert,fragmentShader:Yo.meshmatcap_frag},points:{uniforms:Pa([X.points,X.fog]),vertexShader:Yo.points_vert,fragmentShader:Yo.points_frag},dashed:{uniforms:Pa([X.common,X.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Yo.linedashed_vert,fragmentShader:Yo.linedashed_frag},depth:{uniforms:Pa([X.common,X.displacementmap]),vertexShader:Yo.depth_vert,fragmentShader:Yo.depth_frag},normal:{uniforms:Pa([X.common,X.bumpmap,X.normalmap,X.displacementmap,{opacity:{value:1}}]),vertexShader:Yo.meshnormal_vert,fragmentShader:Yo.meshnormal_frag},sprite:{uniforms:Pa([X.sprite,X.fog]),vertexShader:Yo.sprite_vert,fragmentShader:Yo.sprite_frag},background:{uniforms:{uvTransform:{value:new V},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Yo.background_vert,fragmentShader:Yo.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new V}},vertexShader:Yo.backgroundCube_vert,fragmentShader:Yo.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Yo.cube_vert,fragmentShader:Yo.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Yo.equirect_vert,fragmentShader:Yo.equirect_frag},distance:{uniforms:Pa([X.common,X.displacementmap,{referencePosition:{value:new B},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Yo.distance_vert,fragmentShader:Yo.distance_frag},shadow:{uniforms:Pa([X.lights,X.fog,{color:{value:new U(0)},opacity:{value:1}}]),vertexShader:Yo.shadow_vert,fragmentShader:Yo.shadow_frag}};Xo.physical={uniforms:Pa([Xo.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new V},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new V},clearcoatNormalScale:{value:new z(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new V},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new V},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new V},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new V},sheen:{value:0},sheenColor:{value:new U(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new V},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new V},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new V},transmissionSamplerSize:{value:new z},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new V},attenuationDistance:{value:0},attenuationColor:{value:new U(0)},specularColor:{value:new U(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new V},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new V},anisotropyVector:{value:new z},anisotropyMap:{value:null},anisotropyMapTransform:{value:new V}}]),vertexShader:Yo.meshphysical_vert,fragmentShader:Yo.meshphysical_frag};var Zo={r:0,b:0,g:0},Qo=new yn,$o=new V;$o.set(-1,0,0,0,1,0,0,0,1);function es(e,t,n,r,i,a){let o=new U(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&i.isCubeTexture?(l===void 0&&(l=new G(new K(1,1,1),new Va({name:`BackgroundCubeMaterial`,uniforms:Na(Xo.backgroundCube.uniforms),vertexShader:Xo.backgroundCube.vertexShader,fragmentShader:Xo.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Qo.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply($o),l.material.toneMapped=nn.getTransfer(i.colorSpace)!==St,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new G(new Oa(2,2),new Va({name:`BackgroundMaterial`,uniforms:Na(Xo.background.uniforms),vertexShader:Xo.background.vertexShader,fragmentShader:Xo.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=nn.getTransfer(i.colorSpace)!==St,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(Zo,La(e)),n.buffers.color.setClear(Zo.r,Zo.g,Zo.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function ts(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.isInterleavedBuffer===!0?t.stride:t.itemSize,p=s.offset;if(t.isInstancedInterleavedBuffer||t.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function ns(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function rs(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(L(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),f=n.logarithmicDepthBuffer===!0&&d===!1;n.reversedDepthBuffer===!0&&d===!1&&L(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`),n.logarithmicDepthBuffer===!0&&d===!0&&L(`WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function is(e){let t=this,n=null,r=0,i=!1,a=!1,o=new $r,s=new V,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var as=class extends gn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Ui(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new K(5,5,5),i=new Va({name:`CubemapFromEquirect`,uniforms:Na(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new G(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=oe),new jo(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},os=256,ss=3,cs=20,ls=256,us=16,ds=3,fs=new B,ps=new U,ms=class e{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new jo(1,10,null),this._boxMesh=new G(new K(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=fs}=i,s=this._renderer;this._setSize(a);let c=this._allocateTarget(),l=this._getSourceTarget(!0);t>0&&(l.texture.mipmapsAutoUpdate=!1);let u=s.autoClear,d=s.autoClearColor,f=s.autoClearDepth,p=s.autoClearStencil,m=e.background;s.autoClear=!0,s.autoClearColor=!0,s.autoClearDepth=!0,s.autoClearStencil=!0,m===null&&(e.background=s.getClearColor(ps));let h=new jo(n,r,l);return h.position.copy(o),h.update(s,e),s.autoClear=u,s.autoClearColor=d,s.autoClearDepth=f,s.autoClearStencil=p,e.background=m,t>0&&(l.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=xs(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=bs(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(os,Gt(e))}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?os:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=hs(e,!1,!1),n=Math.log2(e)-ss;for(let r=0;r<=n;r++)t.texture.mipmaps.push({width:e>>r,height:e>>r});return t.texture.name=`PMREM`,t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=hs(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let r=this._boxMesh,i=this._cubeCamera;r.material=n,i.renderTarget=e,i.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),i.update(this._renderer,r),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===301||e.mapping===302?(this._cubemapMaterial===null&&(this._cubemapMaterial=xs()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=bs()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=_s(),this._integrationMaterial=vs());let n=this._cubeSize,r=t.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let a=this._integrationMaterial.uniforms;a.envMap.value=this._sourceTarget.texture,a.sourceLod.value=Math.log2(n/us);for(let o=0;o<=r;o++){let s=e.lodToRoughness(o,r);if(o>r-ds)a.roughness.value=s,this._renderCube(t,o,this._integrationMaterial);else{let e=s>0?Math.log2(n)+.5*Math.log2(6/(ls*s**4))+.5:0;i.roughness.value=s,i.lodBias.value=e,this._renderCube(t,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=ys());let n=this._blurMaterial,r=n.uniforms,i=this._sourceTarget;r.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,r.envMap.value=i.texture,this._renderCube(e,0,n),r.envMap.value=e.texture,this._renderCube(i,0,n)}};function hs(e,t,n){return new as(e,{minFilter:ce,generateMipmaps:t,type:ge,colorSpace:bt,depthBuffer:n})}function gs(e,t,n){return new Va({name:e,uniforms:t,vertexShader:Yo.cube_vert,fragmentShader:n,side:1,blending:0,depthTest:!1,depthWrite:!1})}function _s(){return gs(`PMREMGGXConvolution`,{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${ls}u

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
	`)}function vs(){return gs(`PMREMGGXIntegration`,{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:us}},`

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
	`)}function ys(){return gs(`PMREMSphericalGaussianBlur`,{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${cs}
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
	`)}function bs(){return gs(`PMREMEquirectangularToCubemap`,{envMap:{value:null}},`

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
	`)}function xs(){return gs(`PMREMCubemapToCubemap`,{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function Ss(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new as(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture&&t.isPMREMTexture!==!0){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new ms(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new ms(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function Cs(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Pt(`WebGLRenderer: `+e+` extension not supported.`),t}}}function ws(e,t,n,r){let i={},a=new WeakMap,o=new FinalizationRegistry(e=>delete i[e]);function s(e){c(e.target)}function c(e){e.index!==null&&t.remove(e.index);for(let n in e.attributes)t.remove(e.attributes[n]);e.removeEventListener(`dispose`,s),delete i[e.id],o.unregister(e);let c=a.get(e);c&&(t.remove(c),a.delete(e)),r.releaseStatesOfGeometry(e),e.isInstancedBufferGeometry===!0&&delete e._maxInstanceCount,n.memory.geometries--}function l(e,t){return i[t.id]===void 0&&(t.addEventListener(`dispose`,s),i[t.id]=new WeakRef(t),o.register(t,t.id,t),n.memory.geometries++),t}function u(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function d(e){let n=e.index,r=e.attributes.position,i=0;if(r===void 0)return;let o=n===null?r.array.length/3-1:n.array.length,s=new(r.count>=65535?Ir:Fr)(Math.ceil(o/3)*6,1),c=s.array;if(n!==null){let e=n.array;i=n.version;for(let t=0,n=0;t<o;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];c[n++]=r,c[n++]=i,c[n++]=i,c[n++]=a,c[n++]=a,c[n++]=r}}else{i=r.version;for(let e=0,t=0;e<o;e+=3){let n=e+0,r=e+1,i=e+2;c[t++]=n,c[t++]=r,c[t++]=r,c[t++]=i,c[t++]=i,c[t++]=n}}s.version=i;let l=a.get(e);l&&t.remove(l),a.set(e,s)}function f(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&d(e)}else d(e);return a.get(e)}function p(){for(let e in i){let t=i[e].deref();t!==void 0&&c(t)}}return{get:l,update:u,getWireframeAttribute:f,dispose:p}}function Ts(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function Es(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:R(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Ds(e,t,n){let r=new WeakMap,i=new mn;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new _n(h,p,m,u);g.type=he,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new z(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Os(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var ks={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function As(e,t,n,r,i,a){let o=new gn(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=null,u=new Yr;u.setAttribute(`position`,new Lr([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute(`uv`,new Lr([0,2,0,0,2,0],2));let d=new Ha({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),f=new G(u,d),p=new Eo(-1,1,1,-1,0,1),m=null,h=null,g=!1,_,v=null,y=[],b=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<y.length;n++){let r=y[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){y=e,b=y.length>0&&y[0].isRenderPass===!0;let t=o.width,n=o.height;y.length>0&&s===null&&(s=new gn(t,n,{type:ge,depthBuffer:!1,stencilBuffer:!1}),c=new gn(t,n,{type:ge,depthBuffer:!1,stencilBuffer:!1}));let r=i===!0&&y.some(e=>e.needsDepthTexture===!0);r!==(o.depthTexture!==null)&&(r===!0&&l===null&&(l=new Gi(t,n),a===!0&&(l.format=Ee,l.type=ye)),o.dispose(),o.depthTexture=r?l:null,o.resolveDepthBuffer=r,o.storeMultisampledDepthBuffer=r);for(let e=0;e<y.length;e++){let i=y[e];i.setSize&&i.setSize(t,n),r&&i.needsDepthTexture===!0&&i.setDepthTexture&&i.setDepthTexture(l)}},this.begin=function(e,t){if(g||e.toneMapping===0&&y.length===0)return!1;if(v=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return b===!1&&e.setRenderTarget(o),_=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return b},this.end=function(e,t){e.toneMapping=_,g=!0;let n=o,r=s;for(let i=0;i<y.length;i++){let a=y[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(m!==e.outputColorSpace||h!==e.toneMapping){m=e.outputColorSpace,h=e.toneMapping,d.defines={},nn.getTransfer(m)===`srgb`&&(d.defines.SRGB_TRANSFER=``);let t=ks[h];t&&(d.defines[t]=``),d.needsUpdate=!0}d.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(v),e.render(f,p),v=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),u.dispose(),d.dispose()}}var js=new pn,Ms=new Gi(1,1),Ns=new Ki(1),Ps=new _n,Fs=new vn,Is=new Ui,Ls=[],Rs=[],zs=new Float32Array(16),Bs=new Float32Array(9),Vs=new Float32Array(4);function Hs(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Ls[i];if(a===void 0&&(a=new Float32Array(i),Ls[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Us(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Ws(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Gs(e,t){let n=Rs[t];n===void 0&&(n=new Int32Array(t),Rs[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Ks(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function qs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Us(n,t))return;e.uniform2fv(this.addr,t),Ws(n,t)}}function Js(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Us(n,t))return;e.uniform3fv(this.addr,t),Ws(n,t)}}function Ys(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Us(n,t))return;e.uniform4fv(this.addr,t),Ws(n,t)}}function Xs(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Us(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Ws(n,t)}else{if(Us(n,r))return;Vs.set(r),e.uniformMatrix2fv(this.addr,!1,Vs),Ws(n,r)}}function Zs(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Us(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Ws(n,t)}else{if(Us(n,r))return;Bs.set(r),e.uniformMatrix3fv(this.addr,!1,Bs),Ws(n,r)}}function Qs(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Us(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Ws(n,t)}else{if(Us(n,r))return;zs.set(r),e.uniformMatrix4fv(this.addr,!1,zs),Ws(n,r)}}function $s(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function ec(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Us(n,t))return;e.uniform2iv(this.addr,t),Ws(n,t)}}function tc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Us(n,t))return;e.uniform3iv(this.addr,t),Ws(n,t)}}function nc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Us(n,t))return;e.uniform4iv(this.addr,t),Ws(n,t)}}function rc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function ic(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Us(n,t))return;e.uniform2uiv(this.addr,t),Ws(n,t)}}function ac(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Us(n,t))return;e.uniform3uiv(this.addr,t),Ws(n,t)}}function oc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Us(n,t))return;e.uniform4uiv(this.addr,t),Ws(n,t)}}function sc(e){return e.version===0&&(e.compareFunction=519,e.needsUpdate=!0),e}function cc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_2D_SHADOW?sc(Ms):js,n.setTexture2D(t||a,i)}function lc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Fs,i)}function uc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_CUBE_SHADOW?sc(Ns):Is,n.setTextureCube(t||a,i)}function dc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Ps,i)}function fc(e){switch(e){case 5126:return Ks;case 35664:return qs;case 35665:return Js;case 35666:return Ys;case 35674:return Xs;case 35675:return Zs;case 35676:return Qs;case 5124:case 35670:return $s;case 35667:case 35671:return ec;case 35668:case 35672:return tc;case 35669:case 35673:return nc;case 5125:return rc;case 36294:return ic;case 36295:return ac;case 36296:return oc;case 35678:case 36198:case 36298:case 36306:case 35682:return cc;case 35679:case 36299:case 36307:return lc;case 35680:case 36300:case 36308:case 36293:return uc;case 36289:case 36303:case 36311:case 36292:return dc}}function pc(e,t){e.uniform1fv(this.addr,t)}function mc(e,t){let n=Hs(t,this.size,2);e.uniform2fv(this.addr,n)}function hc(e,t){let n=Hs(t,this.size,3);e.uniform3fv(this.addr,n)}function gc(e,t){let n=Hs(t,this.size,4);e.uniform4fv(this.addr,n)}function _c(e,t){let n=Hs(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function vc(e,t){let n=Hs(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function yc(e,t){let n=Hs(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function bc(e,t){e.uniform1iv(this.addr,t)}function xc(e,t){e.uniform2iv(this.addr,t)}function Sc(e,t){e.uniform3iv(this.addr,t)}function Cc(e,t){e.uniform4iv(this.addr,t)}function wc(e,t){e.uniform1uiv(this.addr,t)}function Tc(e,t){e.uniform2uiv(this.addr,t)}function Ec(e,t){e.uniform3uiv(this.addr,t)}function Dc(e,t){e.uniform4uiv(this.addr,t)}function Oc(e,t,n){let r=this.cache,i=t.length,a=Gs(n,i);Us(r,a)||(e.uniform1iv(this.addr,a),Ws(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?sc(Ms):js;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function kc(e,t,n){let r=this.cache,i=t.length,a=Gs(n,i);Us(r,a)||(e.uniform1iv(this.addr,a),Ws(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Fs,a[e])}function Ac(e,t,n){let r=this.cache,i=t.length,a=Gs(n,i);Us(r,a)||(e.uniform1iv(this.addr,a),Ws(r,a));let o;o=this.type===e.SAMPLER_CUBE_SHADOW?sc(Ns):Is;for(let e=0;e!==i;++e)n.setTextureCube(t[e]||o,a[e])}function jc(e,t,n){let r=this.cache,i=t.length,a=Gs(n,i);Us(r,a)||(e.uniform1iv(this.addr,a),Ws(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Ps,a[e])}function Mc(e){switch(e){case 5126:return pc;case 35664:return mc;case 35665:return hc;case 35666:return gc;case 35674:return _c;case 35675:return vc;case 35676:return yc;case 5124:case 35670:return bc;case 35667:case 35671:return xc;case 35668:case 35672:return Sc;case 35669:case 35673:return Cc;case 5125:return wc;case 36294:return Tc;case 36295:return Ec;case 36296:return Dc;case 35678:case 36198:case 36298:case 36306:case 35682:return Oc;case 35679:case 36299:case 36307:return kc;case 35680:case 36300:case 36308:case 36293:return Ac;case 36289:case 36303:case 36311:case 36292:return jc}}var Nc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=fc(t.type)}},Pc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Mc(t.type)}},Fc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Ic=/(\w+)(\])?(\[|\.)?/g;function Lc(e,t){e.seq.push(t),e.map[t.id]=t}function Rc(e,t,n){let r=e.name,i=r.length;for(Ic.lastIndex=0;;){let a=Ic.exec(r),o=Ic.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Lc(n,l===void 0?new Nc(s,e,t):new Pc(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Fc(s),Lc(n,e)),n=e}}}var zc=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Rc(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Bc(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Vc=37297,Hc=0;function Uc(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Wc=new V;function Gc(e){nn._getMatrix(Wc,nn.workingColorSpace,e);let t=`mat3( ${Wc.elements.map(e=>e.toFixed(4))} )`;switch(nn.getTransfer(e)){case xt:return[t,`LinearTransferOETF`];case St:return[t,`sRGBTransferOETF`];default:return L(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Kc(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Uc(e.getShaderSource(t),r)}return i}function qc(e,t){let n=Gc(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( ${n[0]} * value.rgb, value.a ) );`,`}`].join(`
`)}var Jc={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Yc(e,t){let n=Jc[t];return n===void 0?(L(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Xc=new B;function Zc(){return nn.getLuminanceCoefficients(Xc),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Xc.x.toFixed(4)}, ${Xc.y.toFixed(4)}, ${Xc.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Qc(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(tl).join(`
`)}function $c(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function el(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function tl(e){return e!==``}function nl(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function rl(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var il=/^[ \t]*#include +<([\w\d./]+)>/gm;function al(e){return e.replace(il,ol)}function ol(e,t){let n=Yo[t];if(n===void 0)throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`);return al(n)}var sl=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function cl(e){return e.replace(sl,ll)}function ll(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function ul(e){let t=`precision ${e.precision} float;
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
#define LOW_PRECISION`),t}var dl={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function fl(e){return dl[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var pl={302:`ENVMAP_MODE_REFRACTION`};function ml(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:pl[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var hl={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function gl(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:hl[e.combine]||`ENVMAP_BLENDING_NONE`}function _l(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=fl(n),l=n.envMapPMREM===!0?`ENVMAP_TYPE_PMREM`:`ENVMAP_TYPE_CUBE`,u=ml(n),d=gl(n),f=Qc(n),p=$c(a),m=i.createProgram(),h,g,_=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(h=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(tl).join(`
`),h.length>0&&(h+=`
`),g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(tl).join(`
`),g.length>0&&(g+=`
`)):(h=[ul(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.diffuseRoughnessMapUv?`#define DIFFUSE_ROUGHNESSMAP_UV `+n.diffuseRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(tl).join(`
`),g=[ul(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,n.envMapPMREM?`#define ENVMAP_MAX_LOD `+n.envMapMaxLod+`.0`:``,n.envMapPMREM?`#define ENVMAP_SIZE `+n.envMapSize+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughness?`#define USE_DIFFUSE_ROUGHNESS`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Yo.tonemapping_pars_fragment,n.toneMapping===0?``:Yc(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Yo.colorspace_pars_fragment,qc(`linearToOutputTexel`,n.outputColorSpace),Zc(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(tl).join(`
`)),o=al(o),o=nl(o,n),o=rl(o,n),s=al(s),s=nl(s,n),s=rl(s,n),o=cl(o),s=cl(s),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,h=[f,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+h,g=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+g);let v=_+h+o,y=_+g+s,b=Bc(i,i.VERTEX_SHADER,v),x=Bc(i,i.FRAGMENT_SHADER,y);i.attachShader(m,b),i.attachShader(m,x),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(m,0,`position`):i.bindAttribLocation(m,0,n.index0AttributeName),i.linkProgram(m);function S(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(m)||``,r=i.getShaderInfoLog(b)||``,a=i.getShaderInfoLog(x)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(m,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,m,b,x);else{let e=Kc(i,b,`vertex`),n=Kc(i,x,`fragment`);R(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(m,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):L(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:h},fragmentShader:{log:c,prefix:g}})}i.deleteShader(b),i.deleteShader(x),C=new zc(i,m),w=el(i,m)}let C;this.getUniforms=function(){return C===void 0&&S(this),C};let w;this.getAttributes=function(){return w===void 0&&S(this),w};let T=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=i.getProgramParameter(m,Vc)),T},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Hc++,this.cacheKey=t,this.usedTimes=1,this.program=m,this.vertexShader=b,this.fragmentShader=x,this}var vl=0,yl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new bl(e),t.set(e,n)),n}},bl=class{constructor(e){this.id=vl++,this.code=e,this.usedTimes=0}};function xl(e){return e===1030||e===37490||e===36285}function Sl(e,t,n,r,i,a){let o=new An,s=new yl,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function p(e){return c.add(e),e===0?`uv`:`uv${e}`}function m(i,o,l,u,m,h){let g=u.fog,_=m.geometry,v=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,b=t.get(i.envMap||v,y),x=f[i.type],S=r.precision;i.precision!==null&&(S=r.getMaxPrecision(i.precision),S!==i.precision&&L(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,S,`instead.`));let C=_.morphAttributes.position||_.morphAttributes.normal||_.morphAttributes.color,w=C===void 0?0:C.length,T=0;_.morphAttributes.position!==void 0&&(T=1),_.morphAttributes.normal!==void 0&&(T=2),_.morphAttributes.color!==void 0&&(T=3);let E,D,O,k;if(x){let e=Xo[x];E=e.vertexShader,D=e.fragmentShader}else{E=i.vertexShader,D=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),O=e.id,k=t.id}let A=e.getRenderTarget(),j=e.state.buffers.depth.getReversed(),ee=m.isInstancedMesh===!0,M=m.isBatchedMesh===!0,te=!!i.map,ne=!!i.matcap,re=!!b,N=re&&b.isPMREMTexture===!0,ie=!!i.aoMap,ae=!!i.lightMap,oe=!!i.bumpMap&&i.wireframe===!1,se=!!i.normalMap,ce=!!i.displacementMap,le=!!i.emissiveMap,ue=!!i.metalnessMap,de=!!i.roughnessMap,fe=i.anisotropy>0,pe=i.clearcoat>0,me=i.diffuseRoughness>0,he=i.dispersion>0,ge=i.retroreflectivity>0,_e=i.iridescence>0,ve=i.sheen>0,ye=i.transmission>0,be=fe&&!!i.anisotropyMap,xe=pe&&!!i.clearcoatMap,Se=pe&&!!i.clearcoatNormalMap,Ce=pe&&!!i.clearcoatRoughnessMap,we=me&&!!i.diffuseRoughnessMap,Te=_e&&!!i.iridescenceMap,Ee=_e&&!!i.iridescenceThicknessMap,De=ve&&!!i.sheenColorMap,Oe=ve&&!!i.sheenRoughnessMap,ke=!!i.specularMap,Ae=!!i.specularColorMap,je=!!i.specularIntensityMap,Me=ye&&!!i.transmissionMap,Ne=ye&&!!i.thicknessMap,Pe=!!i.gradientMap,Fe=!!i.alphaMap,P=i.alphaTest>0,Ie=!!i.alphaHash,Le=!!i.extensions,Re=0;i.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(Re=e.toneMapping);let F=N?b.isCompressedCubeTexture?b.image[0].mipmaps:b.mipmaps:null,ze={shaderID:x,shaderType:i.type,shaderName:i.name,vertexShader:E,fragmentShader:D,defines:i.defines,customVertexShaderID:O,customFragmentShaderID:k,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:S,batching:M,batchingColor:M&&m._colorsTexture!==null,instancing:ee,instancingColor:ee&&m.instanceColor!==null,instancingMorph:ee&&m.morphTexture!==null,outputColorSpace:A===null?e.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:nn.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:te,matcap:ne,envMap:re,envMapMode:re&&b.mapping,envMapPMREM:N,envMapMaxLod:N?F.length-1:null,envMapSize:N?F[0].width:null,aoMap:ie,lightMap:ae,bumpMap:oe,normalMap:se,displacementMap:ce,emissiveMap:le,normalMapObjectSpace:se&&i.normalMapType===1,normalMapTangentSpace:se&&i.normalMapType===0,packedNormalMap:se&&i.normalMapType===0&&xl(i.normalMap.format),metalnessMap:ue,roughnessMap:de,anisotropy:fe,anisotropyMap:be,clearcoat:pe,clearcoatMap:xe,clearcoatNormalMap:Se,clearcoatRoughnessMap:Ce,diffuseRoughness:me,diffuseRoughnessMap:we,dispersion:he,retroreflection:ge,iridescence:_e,iridescenceMap:Te,iridescenceThicknessMap:Ee,sheen:ve,sheenColorMap:De,sheenRoughnessMap:Oe,specularMap:ke,specularColorMap:Ae,specularIntensityMap:je,transmission:ye,transmissionMap:Me,thicknessMap:Ne,gradientMap:Pe,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Fe,alphaTest:P,alphaHash:Ie,combine:i.combine,mapUv:te&&p(i.map.channel),aoMapUv:ie&&p(i.aoMap.channel),lightMapUv:ae&&p(i.lightMap.channel),bumpMapUv:oe&&p(i.bumpMap.channel),normalMapUv:se&&p(i.normalMap.channel),displacementMapUv:ce&&p(i.displacementMap.channel),emissiveMapUv:le&&p(i.emissiveMap.channel),metalnessMapUv:ue&&p(i.metalnessMap.channel),roughnessMapUv:de&&p(i.roughnessMap.channel),anisotropyMapUv:be&&p(i.anisotropyMap.channel),clearcoatMapUv:xe&&p(i.clearcoatMap.channel),clearcoatNormalMapUv:Se&&p(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ce&&p(i.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:we&&p(i.diffuseRoughnessMap.channel),iridescenceMapUv:Te&&p(i.iridescenceMap.channel),iridescenceThicknessMapUv:Ee&&p(i.iridescenceThicknessMap.channel),sheenColorMapUv:De&&p(i.sheenColorMap.channel),sheenRoughnessMapUv:Oe&&p(i.sheenRoughnessMap.channel),specularMapUv:ke&&p(i.specularMap.channel),specularColorMapUv:Ae&&p(i.specularColorMap.channel),specularIntensityMapUv:je&&p(i.specularIntensityMap.channel),transmissionMapUv:Me&&p(i.transmissionMap.channel),thicknessMapUv:Ne&&p(i.thicknessMap.channel),alphaMapUv:Fe&&p(i.alphaMap.channel),vertexTangents:!!_.attributes.tangent&&(se||fe),vertexNormals:!!_.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!_.attributes.color&&_.attributes.color.itemSize===4,pointsUvs:m.isPoints===!0&&!!_.attributes.uv&&(te||Fe),fog:!!g,useFog:i.fog===!0,fogExp2:!!g&&g.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||_.attributes.normal===void 0&&se===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:j,skinning:m.isSkinnedMesh===!0,hasPositionAttribute:_.attributes.position!==void 0,morphTargets:_.morphAttributes.position!==void 0,morphNormals:_.morphAttributes.normal!==void 0,morphColors:_.morphAttributes.color!==void 0,morphTargetsCount:w,morphTextureStride:T,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:h.filter(e=>e.texture!==null).length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Re,decodeVideoTexture:te&&i.map.isVideoTexture===!0&&nn.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:le&&i.emissiveMap.isVideoTexture===!0&&nn.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Le&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Le&&i.extensions.multiDraw===!0||M)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return ze.vertexUv1s=c.has(1),ze.vertexUv2s=c.has(2),ze.vertexUv3s=c.has(3),c.clear(),ze}function h(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(g(n,t),_(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function g(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapPMREM),e.push(t.envMapMaxLod),e.push(t.envMapSize),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.diffuseRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.numLightProbeGrids),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function _(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.diffuseRoughness&&o.enable(25),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function v(e){let t=f[e.type],n;if(t){let e=Xo[t];n=Ra.clone(e.uniforms)}else n=e.uniforms;return n}function y(t,n){let r=u.get(n);return r===void 0?(r=new _l(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function b(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function x(e){s.remove(e)}function S(){s.dispose()}return{getParameters:m,getProgramCacheKey:h,getUniforms:v,acquireProgram:y,releaseProgram:b,releaseShaderCache:x,programs:l,dispose:S}}function Cl(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function wl(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Tl(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function El(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||wl),r.length>1&&r.sort(t||Tl),i.length>1&&i.sort(t||Tl)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function Dl(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new El,e.set(t,[i])):n>=r.length?(i=new El,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Ol(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new B,color:new U};break;case`SpotLight`:n={position:new B,direction:new B,color:new U,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new B,color:new U,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new B,skyColor:new U,groundColor:new U};break;case`RectAreaLight`:n={color:new U,position:new B,halfWidth:new B,halfHeight:new B}}return e[t.id]=n,n}}}function kl(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new z};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new z};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new z,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Al=0;function jl(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Ml(e){let t=new Ol,n=kl(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new B);let i=new B,a=new yn,o=new yn;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(jl);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=X.LTC_FLOAT_1,r.rectAreaLTC2=X.LTC_FLOAT_2):(r.rectAreaLTC1=X.LTC_HALF_1,r.rectAreaLTC2=X.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=Al++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function Nl(e){let t=new Ml(e),n=[],r=[],i=[];function a(e){u.camera=e,n.length=0,r.length=0,i.length=0}function o(e){e.isLightProbeGrid?i.push(e):n.push(e)}function s(e){r.push(e)}function c(){t.setup(n),i.sort((e,t)=>e.priority-t.priority||e.id-t.id)}function l(e){t.setupView(n,e)}let u={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:u,setupLights:c,setupLightsView:l,pushLight:o,pushShadow:s}}function Pl(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Nl(e),t.set(n,[a])):r>=i.length?(a=new Nl(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Fl=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Il=`uniform sampler2D shadow_pass;
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
}`,Ll=[new B(1,0,0),new B(-1,0,0),new B(0,1,0),new B(0,-1,0),new B(0,0,1),new B(0,0,-1)],Rl=[new B(0,-1,0),new B(0,-1,0),new B(0,0,1),new B(0,0,-1),new B(0,-1,0),new B(0,-1,0)],zl=new yn,Bl=new B,Vl=new B;function Hl(e,t,n){let r=new Ni,i=new z,a=new z,o=new mn,s=new Ua,c=new Wa,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new Va({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new z},radius:{value:4}},vertexShader:Fl,fragmentShader:Il}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Yr;m.setAttribute(`position`,new Pr(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new G(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;this.type===2&&(L(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==this.type;p&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){L(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let m=d.getFrameExtents();i.multiply(m),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/m.x),i.x=a.x*m.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/m.y),i.y=a.y*m.y,d.mapSize.y=a.y));let h=e.state.buffers.depth.getReversed();if(d.camera._reversedDepth=h,d.map===null||p===!0){if(d.map!==null&&(d.map.depthTexture!==null&&(d.map.depthTexture.dispose(),d.map.depthTexture=null),d.map.dispose()),this.type===3){if(l.isPointLight){L(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}d.map=new gn(i.x,i.y,{format:ke,type:ge,minFilter:oe,magFilter:oe,generateMipmaps:!1}),d.map.texture.name=l.name+`.shadowMap`,d.map.depthTexture=new Gi(i.x,i.y,he),d.map.depthTexture.name=l.name+`.shadowMapDepth`,d.map.depthTexture.format=Te,d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=N,d.map.depthTexture.magFilter=N}else l.isPointLight?(d.map=new as(i.x),d.map.depthTexture=new Ki(i.x,me)):(d.map=new gn(i.x,i.y),d.map.depthTexture=new Gi(i.x,i.y,me)),d.map.depthTexture.name=l.name+`.shadowMap`,d.map.depthTexture.format=Te,this.type===1?(d.map.depthTexture.compareFunction=h?518:515,d.map.depthTexture.minFilter=oe,d.map.depthTexture.magFilter=oe):(d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=N,d.map.depthTexture.magFilter=N);d.camera.updateProjectionMatrix()}d.map.isWebGLCubeRenderTarget!==!0&&(d.map.width!==i.x||d.map.height!==i.y)&&d.map.setSize(i.x,i.y);let g=d.map.isWebGLCubeRenderTarget?6:d.getViewportCount();l.isPointLight!==!0&&d.updateMatrices(l,s);let _=d.camera.layers.mask&4294967294?d.camera.layers:s.layers;for(let t=0;t<g;t++){let i=d.getCamera(t);if(l.isPointLight){let e=d.camera,n=d.matrix,r=l.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Bl.setFromMatrixPosition(l.matrixWorld),e.position.copy(Bl),Vl.copy(e.position),Vl.add(Ll[t]),e.up.copy(Rl[t]),e.lookAt(Vl),e.updateMatrixWorld(),n.makeTranslation(-Bl.x,-Bl.y,-Bl.z),zl.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),d._frustum.setFromProjectionMatrix(zl,e.coordinateSystem,e.reversedDepth)}if(d.map.isWebGLCubeRenderTarget)e.setRenderTarget(d.map,t),e.clear();else{t===0&&(e.setRenderTarget(d.map),e.clear());let n=d.getViewport(t);o.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),f.viewport(o)}r=d.getFrustum(t),b(n,s,i,l,_,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null?n.mapPass=new gn(i.x,i.y,{format:ke,type:ge}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),f.uniforms.shadow_pass.value=n.map.depthTexture,f.uniforms.resolution.value.set(n.map.width,n.map.height),f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value.set(n.map.width,n.map.height),p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s,c){if(n.visible===!1)return;if(n.layers.test(s)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&c===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),s=n.material;if(Array.isArray(s)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=s[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,c);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(s.visible){let t=y(n,s,o,c);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let l=n.children;for(let e=0,t=l.length;e<t;e++)b(l[e],i,a,o,s,c)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Ul(e,t){function n(){let t=!1,n=new mn,r=null,i=new mn(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?ue(e.DEPTH_TEST):de(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=It[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?ue(e.STENCIL_TEST):de(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c={},l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new U(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,ee=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),M=!1,te=0,ne=e.getParameter(e.VERSION);ne.indexOf(`WebGL`)===-1?ne.indexOf(`OpenGL ES`)!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(ne)[1]),M=te>=2):(te=parseFloat(/^WebGL (\d)/.exec(ne)[1]),M=te>=1);let re=null,N={},ie=e.getParameter(e.SCISSOR_BOX),ae=e.getParameter(e.VIEWPORT),oe=new mn().fromArray(ie),se=new mn().fromArray(ae);function ce(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let le={};le[e.TEXTURE_2D]=ce(e.TEXTURE_2D,e.TEXTURE_2D,1),le[e.TEXTURE_CUBE_MAP]=ce(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),le[e.TEXTURE_2D_ARRAY]=ce(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),le[e.TEXTURE_3D]=ce(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),ue(e.DEPTH_TEST),o.setFunc(3),ye(!1),be(1),ue(e.CULL_FACE),_e(0);function ue(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function de(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function fe(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function pe(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function me(t){return h!==t&&(e.useProgram(t),h=t,!0)}let he={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};he[103]=e.MIN,he[104]=e.MAX;let ge={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function _e(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(de(e.BLEND),g=!1);else if(g===!1&&(ue(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:R(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:R(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:R(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:R(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(he[n],he[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(ge[r],ge[i],ge[o],ge[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function ve(t,n){t.side===2?de(e.CULL_FACE):ue(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ye(r),t.blending===1&&t.transparent===!1?_e(0):_e(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),Se(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?ue(e.SAMPLE_ALPHA_TO_COVERAGE):de(e.SAMPLE_ALPHA_TO_COVERAGE)}function ye(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function be(t){t===0?de(e.CULL_FACE):(ue(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function xe(t){t!==k&&(M&&e.lineWidth(t),k=t)}function Se(t,n,r){t?(ue(e.POLYGON_OFFSET_FILL),(A!==n||j!==r)&&(A=n,j=r,o.getReversed()&&(n=-n,r=-r),e.polygonOffset(n,r))):de(e.POLYGON_OFFSET_FILL)}function Ce(t){t?ue(e.SCISSOR_TEST):de(e.SCISSOR_TEST)}function we(t){t===void 0&&(t=e.TEXTURE0+ee-1),re!==t&&(e.activeTexture(t),re=t)}function Te(t,n,r){r===void 0&&(r=re===null?e.TEXTURE0+ee-1:re);let i=N[r];i===void 0&&(i={type:void 0,texture:void 0},N[r]=i),(i.type!==t||i.texture!==n)&&(re!==r&&(e.activeTexture(r),re=r),e.bindTexture(t,n||le[t]),i.type=t,i.texture=n)}function Ee(){let t=N[re];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function De(){try{e.compressedTexImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Oe(){try{e.compressedTexImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function ke(){try{e.texSubImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ae(){try{e.texSubImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function je(){try{e.compressedTexSubImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Me(){try{e.compressedTexSubImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ne(){try{e.texStorage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Pe(){try{e.texStorage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Fe(){try{e.texImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function P(){try{e.texImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ie(t){return d[t]===void 0?e.getParameter(t):d[t]}function Le(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function Re(t){oe.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),oe.copy(t))}function F(t){se.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),se.copy(t))}function ze(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),e.uniformBlockBinding(n,i,i),r.set(t,i))}function I(t,n,r){let i=l.get(n).get(t);c[i]!==r&&(e.bindBufferBase(e.UNIFORM_BUFFER,i,r),c[i]=r)}function Be(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},re=null,N={},f={},c={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new U(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,oe.set(0,0,e.canvas.width,e.canvas.height),se.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:ue,disable:de,bindFramebuffer:fe,drawBuffers:pe,useProgram:me,setBlending:_e,setMaterial:ve,setFlipSided:ye,setCullFace:be,setLineWidth:xe,setPolygonOffset:Se,setScissorTest:Ce,activeTexture:we,bindTexture:Te,unbindTexture:Ee,compressedTexImage2D:De,compressedTexImage3D:Oe,texImage2D:Fe,texImage3D:P,pixelStorei:Le,getParameter:Ie,updateUBOMapping:ze,uniformBlockBinding:I,texStorage2D:Ne,texStorage3D:Pe,texSubImage2D:ke,texSubImage3D:Ae,compressedTexSubImage2D:je,compressedTexSubImage3D:Me,scissor:Re,viewport:F,reset:Be}}function Wl(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new z,u=new WeakMap,d=new Set,f,p=new WeakMap,m=new Set,h=new FinalizationRegistry(e=>m.delete(e)),g=!1;try{g=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function _(e,t){return g?new OffscreenCanvas(e,t):kt(`canvas`)}function v(e,t,n){let r=1,i=Be(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);f===void 0&&(f=_(n,a));let o=t?_(n,a):f;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),L(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&L(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function y(e){return e.generateMipmaps}function b(t){e.generateMipmap(t)}function x(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function S(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];L(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||L(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?xt:nn.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function C(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,L(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function w(e,t){return y(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function T(e){let t=new WeakRef(e);r.get(e).__ref=t,m.add(t),h.register(e,t,t)}function E(e){let t=r.get(e).__ref;t!==void 0&&(m.delete(t),h.unregister(t))}function D(e){k(e.target)}function O(e){A(e.target)}function k(e){e.removeEventListener(`dispose`,D),E(e),ee(e),e.isVideoTexture&&u.delete(e),e.isHTMLTexture&&d.delete(e)}function A(e){e.removeEventListener(`dispose`,O),E(e),le(e)}function j(){for(let e of m){let t=e.deref();t!==void 0&&(t.isRenderTarget===!0?A(t):k(t))}m.clear(),d.clear()}function ee(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=p.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&M(e),Object.keys(i).length===0&&p.delete(n)}r.remove(e)}function M(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=p.get(i);delete a[n.__cacheKey],o.memory.textures--}function le(t){let n=r.get(t);n.__depthDisposeCallback&&n.__depthDisposeCallback();let i=t.depthTexture;if(i&&i.renderTarget===t&&k(i),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let a=t.textures;for(let t=0,n=a.length;t<n;t++){let n=r.get(a[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(a[t])}r.remove(t)}let ue=0;function de(){ue=0}function fe(){return ue}function pe(e){ue=e}function me(){let e=ue;return e>=i.maxTextures&&L(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+i.maxTextures),ue+=1,e}function he(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.mipmapsAutoUpdate),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function ge(t,i){let a=r.get(t);if(t.isVideoTexture&&ze(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)L(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)L(`WebGLRenderer: Texture marked for update but image is incomplete`);else{Oe(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function _e(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?Oe(a,t,i):(t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i))}function ve(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?Oe(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function ye(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?ke(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let be={[te]:e.REPEAT,[ne]:e.CLAMP_TO_EDGE,[re]:e.MIRRORED_REPEAT},xe={[N]:e.NEAREST,[ie]:e.NEAREST_MIPMAP_NEAREST,[ae]:e.NEAREST_MIPMAP_LINEAR,[oe]:e.LINEAR,[se]:e.LINEAR_MIPMAP_NEAREST,[ce]:e.LINEAR_MIPMAP_LINEAR},Se={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function Ce(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&L(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,be[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,be[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,be[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,xe[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,xe[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,Se[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function we(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,D),T(n));let i=n.source,a=p.get(i);a===void 0&&(a={},p.set(i,a));let s=he(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&M(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function Te(e,t,n){return Math.floor(Math.floor(e/n)/t)}function De(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=Te(n.start,r.width,4),c=Te(t.start,r.width,4);n.start<=i+1&&a===c&&Te(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function Oe(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=we(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let f=r.get(u);if(u.version!==f.__version||l===!0){if(n.activeTexture(e.TEXTURE0+s),!(typeof ImageBitmap<`u`&&o.image instanceof ImageBitmap)){let t=nn.getPrimaries(nn.workingColorSpace),r=o.colorSpace===``?null:nn.getPrimaries(o.colorSpace),i=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment);let t=v(o.image,!1,i.maxTextureSize);t=I(o,t);let r=a.convert(o.format,o.colorSpace),p=a.convert(o.type),m=S(o.internalFormat,r,p,o.normalized,o.colorSpace,o.isVideoTexture);Ce(c,o);let h,g=o.mipmaps,_=o.isVideoTexture!==!0,x=f.__version===void 0||l===!0,T=u.dataReady,E=w(o,t);if(o.isDepthTexture)m=C(o.format===Ee,o.type),x&&(_?n.texStorage2D(e.TEXTURE_2D,1,m,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,null));else if(o.isDataTexture){if(g.length>0){_&&x&&n.texStorage2D(e.TEXTURE_2D,E,m,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)h=g[t],_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data);o.generateMipmaps=!1}else _?(x&&n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height),T&&De(o,t,r,p)):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,t.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){_&&x&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,g[0].width,g[0].height,t.depth);for(let i=0,a=g.length;i<a;i++)if(h=g[i],o.format!==1023){if(r!==null){if(_){if(T){if(o.layerUpdates.size>0){let t=Go(h.width,h.height,o.format,o.type);for(let a of o.layerUpdates){let o=h.data.subarray(a*t/h.data.BYTES_PER_ELEMENT,(a+1)*t/h.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,a,h.width,h.height,1,r,o)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,h.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,h.data,0,0)}else L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else _?T&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,p,h.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,r,p,h.data);o.layerUpdates.size>0&&o.clearLayerUpdates()}else{_&&x&&n.texStorage2D(e.TEXTURE_2D,E,m,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)h=g[t],o.format===1023?_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data):r===null?L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):_?T&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,h.data):n.compressedTexImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,h.data)}}else if(o.isDataArrayTexture){if(_){if(x&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,t.width,t.height,t.depth),T){if(o.layerUpdates.size>0){let i=Go(t.width,t.height,o.format,o.type);for(let a of o.layerUpdates){let o=t.data.subarray(a*i/t.data.BYTES_PER_ELEMENT,(a+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,a,t.width,t.height,1,r,p,o)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,m,t.width,t.height,t.depth,0,r,p,t.data)}else if(o.isData3DTexture)_?(x&&n.texStorage3D(e.TEXTURE_3D,E,m,t.width,t.height,t.depth),T&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)):n.texImage3D(e.TEXTURE_3D,0,m,t.width,t.height,t.depth,0,r,p,t.data);else if(o.isFramebufferTexture){if(x){if(_)n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height);else{let i=t.width,a=t.height;for(let t=0;t<E;t++)n.texImage2D(e.TEXTURE_2D,t,m,i,a,0,r,p,null),i>>=1,a>>=1}}}else if(o.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),d.add(o),n.onpaint=e=>{let t=e.changedElements;for(let e of d)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(g.length>0){if(_&&x){let t=Be(g[0]);n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height)}for(let t=0,i=g.length;t<i;t++)h=g[t],_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,p,h):n.texImage2D(e.TEXTURE_2D,t,m,r,p,h);o.generateMipmaps=!1}else if(_){if(x){let r=Be(t);n.texStorage2D(e.TEXTURE_2D,E,m,r.width,r.height)}T&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,p,t)}else n.texImage2D(e.TEXTURE_2D,0,m,r,p,t);y(o)&&o.mipmapsAutoUpdate===!0&&b(c),f.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function ke(t,o,s){if(o.image.length!==6)return;let c=we(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=nn.getPrimaries(nn.workingColorSpace),r=o.colorSpace===``?null:nn.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=v(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=I(o,m[e]);let h=m[0],g=a.convert(o.format,o.colorSpace),_=a.convert(o.type),x=S(o.internalFormat,g,_,o.normalized,o.colorSpace),T=o.isVideoTexture!==!0,E=u.__version===void 0||c===!0,D=l.dataReady,O=w(o,h);Ce(e.TEXTURE_CUBE_MAP,o);let k;if(o.isDepthTexture){if(x=C(o.format===Ee,o.type),E){if(T)n.texStorage2D(e.TEXTURE_CUBE_MAP,1,x,h.width,h.height);else for(let t=0;t<6;t++)n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,h.width,h.height,0,g,_,null)}}else if(f){T&&E&&n.texStorage2D(e.TEXTURE_CUBE_MAP,O,x,h.width,h.height);for(let t=0;t<6;t++){k=m[t].mipmaps;for(let r=0;r<k.length;r++){let i=k[r];o.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,x,i.width,i.height,0,g,_,i.data):g===null?L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,x,i.width,i.height,0,i.data)}}}else{if(k=o.mipmaps,T&&E){k.length>0&&O++;let t=Be(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,O,x,t.width,t.height)}for(let t=0;t<6;t++)if(p){T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,g,_,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,m[t].width,m[t].height,0,g,_,m[t].data);for(let r=0;r<k.length;r++){let i=k[r].image[t].image;T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,x,i.width,i.height,0,g,_,i.data)}}else{T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,g,_,m[t]);for(let r=0;r<k.length;r++){let i=k[r];T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,g,_,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,x,g,_,i.image[t])}}}y(o)&&o.mipmapsAutoUpdate===!0&&b(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function Ae(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=S(o.internalFormat,d,f,o.normalized,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),F(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,Re(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function je(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=C(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;F(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Re(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Re(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=S(o.internalFormat,c,l,o.normalized,o.colorSpace);F(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Re(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Re(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Me(t,i,a){let o=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let c=r.get(i.depthTexture);c.__renderTarget=i;let l=o?i.depthTexture.image[0]:i.depthTexture.image;c.__webglTexture&&l.width===i.width&&l.height===i.height||(l.width=i.width,l.height=i.height,i.depthTexture.needsUpdate=!0),o?ye(i.depthTexture,0):ge(i.depthTexture,0);let u=c.__webglTexture,d=Re(i),f=o?e.TEXTURE_CUBE_MAP_POSITIVE_X+a:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)F(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)F(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function Ne(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)for(let e=0;e<6;e++)Me(i.__webglFramebuffer[e],t,e);else t.texture.mipmaps.length>0?Me(i.__webglFramebuffer[0],t,0):Me(i.__webglFramebuffer,t,0)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),je(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else if(t.texture.mipmaps.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),je(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}n.bindFramebuffer(e.FRAMEBUFFER,null)}function Pe(t,n,i){let a=r.get(t);n!==void 0&&Ae(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&Ne(t)}function Fe(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,O),T(t);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&F(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=S(r.internalFormat,i,o,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),u=Re(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),je(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),Ce(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)Ae(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else Ae(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);y(i)?b(e.TEXTURE_CUBE_MAP):i.mipmaps.length>0&&e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),Ce(c,a),Ae(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),y(a)&&b(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),Ce(r,i),i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)Ae(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else Ae(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);y(i)?b(r):i.mipmaps.length>0&&e.texParameteri(r,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}t.depthBuffer&&Ne(t)}function P(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(y(a)&&a.mipmapsAutoUpdate===!0){let t=x(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),b(t),n.unbindTexture()}}}let Ie=[];function Le(t){if(t.samples>0){if(F(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer),t.texture.mipmaps.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(Ie.length=0,Ie.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&Ie.push(l),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Ie))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function Re(e){return Math.min(i.maxSamples,e.samples)}function F(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function ze(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function I(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(nn.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&L(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):R(`WebGLTextures: Unsupported texture color space:`,n)),t}function Be(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=me,this.resetTextureUnits=de,this.getTextureUnits=fe,this.setTextureUnits=pe,this.setTexture2D=ge,this.setTexture2DArray=_e,this.setTexture3D=ve,this.setTextureCube=ye,this.rebindTextures=Pe,this.setupRenderTarget=Fe,this.updateRenderTargetMipmap=P,this.updateMultisampleRenderTarget=Le,this.setupDepthRenderbuffer=Ne,this.setupFrameBufferTexture=Ae,this.useMultisampledRTT=F,this.dispose=j}function Gl(e,t){function n(n,r=``){let i,a=nn.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Kl=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ql=`
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

}`,Jl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new qi(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Va({vertexShader:Kl,fragmentShader:ql,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new G(new Oa(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Yl=class extends Lt{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new Jl,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new z,C=null,w=null,T=new To;T.viewport=new mn;let E=new To;E.viewport=new mn;let D=[T,E],O=new Mo,k=null,A=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new Jn,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new Jn,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new Jn,b[e]=t),t.getHandSpace()};function j(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ee(){r.removeEventListener(`select`,j),r.removeEventListener(`selectstart`,j),r.removeEventListener(`selectend`,j),r.removeEventListener(`squeeze`,j),r.removeEventListener(`squeezestart`,j),r.removeEventListener(`squeezeend`,j),r.removeEventListener(`end`,ee),r.removeEventListener(`inputsourceschange`,M);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}k=null,A=null,h.reset();for(let e in g)delete g[e];if(e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,ie.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),w!==null){let e=w.camera;e.fov=w.fov,e.zoom=w.zoom,e.updateProjectionMatrix(),w=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&L(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&L(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,j),r.addEventListener(`selectstart`,j),r.addEventListener(`selectend`,j),r.addEventListener(`squeeze`,j),r.addEventListener(`squeezestart`,j),r.addEventListener(`squeezeend`,j),r.addEventListener(`end`,ee),r.addEventListener(`inputsourceschange`,M),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?Ee:Te,a=_.stencil?ye:me);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new gn(d.textureWidth,d.textureHeight,{format:we,type:le,depthTexture:new Gi(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new gn(f.framebufferWidth,f.framebufferHeight,{format:we,type:le,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),ie.setContext(r),ie.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function M(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}function te(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),O.near=E.near=T.near=t,O.far=E.far=T.far=n,(k!==O.near||A!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),k=O.near,A=O.far),O.layers.mask=e.layers.mask|6,T.layers.mask=O.layers.mask&-5,E.layers.mask=O.layers.mask&-3;let i=e.parent,a=O.cameras;te(O,i);for(let e=0;e<a.length;e++)te(a[e],i);O.projectionMatrix.copy(T.projectionMatrix),O.projectionMatrixInverse.copy(T.projectionMatrixInverse),w===null&&e.isPerspectiveCamera&&(w={camera:e,fov:e.fov,zoom:e.zoom}),ne(e,O,i)};function ne(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Bt*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(O)},this.getCameraTexture=function(e){return g[e]};let re=null;function N(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==O.cameras.length&&(O.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=D[n];o===void 0&&(o=new To,o.layers.enable(n),o.viewport=new mn,D[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(O.matrix.copy(o.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),i===!0&&O.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new qi,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}re&&re(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let ie=new qo;ie.setAnimationLoop(N),this.setAnimationLoop=function(e){re=e},this.dispose=function(){}}},Xl=new yn,Zl=new V;Zl.set(-1,0,0,0,1,0,0,0,1);function Ql(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,La(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Xl.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(Zl),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.diffuseRoughness>0&&(e.diffuseRoughness.value=t.diffuseRoughness,t.diffuseRoughnessMap&&(e.diffuseRoughnessMap.value=t.diffuseRoughnessMap,n(t.diffuseRoughnessMap,e.diffuseRoughnessMapTransform))),t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessMinimum,e.iridescenceThicknessMaximum.value=t.iridescenceThicknessMaximum,t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function $l(e,t,n,r){let i={},a={};function o(e,t){let n=t.program;r.uniformBlockBinding(e,n,i[e.id])}function s(e,n){let o=i[e.id];o===void 0&&(m(e),o=c(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let u=t.render.frame;a[e.id]!==u&&(l(e),a[e.id]=u)}function c(t){let n=e.createBuffer(),r=t.__size,i=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,n),e.bufferData(e.UNIFORM_BUFFER,r,i),e.bindBuffer(e.UNIFORM_BUFFER,null),n}function l(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)u(t[n],e,n,a);else u(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function u(t,n,r,i){if(f(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=h(i,!0);d(i,t.__data,e),e+=a.storage/Float32Array.BYTES_PER_ELEMENT}}else d(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function d(e,t,n){typeof e==`number`||typeof e==`boolean`?t[n]=e:e.isMatrix3?(t[n]=e.elements[0],t[n+1]=e.elements[1],t[n+2]=e.elements[2],t[n+3]=0,t[n+4]=e.elements[3],t[n+5]=e.elements[4],t[n+6]=e.elements[5],t[n+7]=0,t[n+8]=e.elements[6],t[n+9]=e.elements[7],t[n+10]=e.elements[8],t[n+11]=0):ArrayBuffer.isView(e)?t.set(e.subarray(0,t.length-n),n):e.toArray(t,n)}function f(e,t,n,r){let i=e.value,a=t+`_`+n;if(Array.isArray(i)){r[a]===void 0&&(r[a]=[]);let e=r[a],t=!1;for(let n=0;n<i.length;n++)p(i[n],e,n)===!0&&(t=!0);return t}return p(i,r,a)}function p(e,t,n){if(t[n]===void 0)return t[n]=typeof e==`number`||typeof e==`boolean`?e:ArrayBuffer.isView(e)?e.slice():e.clone(),!0;{let r=t[n];if(typeof e==`number`||typeof e==`boolean`){if(r!==e)return t[n]=e,!0}else if(ArrayBuffer.isView(e))return!0;else if(r.equals(e)===!1)return r.copy(e),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let i=0,a=r.length;i<a;i++){let a=r[i],o=Array.isArray(a.value)?a.value:[a.value],s=Array.isArray(t[e])||Array.isArray(a.value),c=n;for(let e=0,t=o.length;e<t;e++){let t=o[e],r=h(t,s),i=n%16,a=i%r.boundary,l=i+a;n+=a,l!==0&&16-l<r.storage&&(n+=16-l),e===0&&(c=n),n+=r.storage}a.__data=new(a.type===`int`?Int32Array:a.type===`uint`?Uint32Array:Float32Array)((n-c)/Float32Array.BYTES_PER_ELEMENT),a.__offset=c}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e,t){let n={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(n.boundary=4,n.storage=4):e.isVector2?(n.boundary=8,n.storage=8):e.isVector3||e.isColor?(n.boundary=16,n.storage=12):e.isVector4?(n.boundary=16,n.storage=16):e.isMatrix3?(n.boundary=16,n.storage=48):e.isMatrix4?(n.boundary=16,n.storage=64):e.isTexture?L(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(n.boundary=16,n.storage=e.byteLength):L(`WebGLRenderer: Unsupported uniform value type.`,e),t===!0&&(n.boundary=16,n.storage=Math.ceil(n.storage/16)*16),n}function g(t){let n=t.target;n.removeEventListener(`dispose`,g),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);i={},a={}}return{bind:o,update:s,dispose:_}}var eu=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),tu=null;function nu(){return tu===null&&(tu=new bi(eu,16,16,ke,ge),tu.name=`DFG_LUT`,tu.minFilter=oe,tu.magFilter=oe,tu.wrapS=ne,tu.wrapT=ne,tu.generateMipmaps=!1,tu.needsUpdate=!0),tu}var ru=class{constructor(e={}){let{canvas:t=At(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=le}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);p=n.getContextAttributes().alpha}else p=a;let m=f,h=new Set([je,Ae,Oe]),g=new Set([le,me,fe,ye,_e,ve]),_=new Uint32Array(4),v=new Int32Array(4),y={textures:[],min:[],max:[],resolution:[]},b=null,x=null,S=[],C=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let T=this,E=!1,D=null,O=null,k=null,A=null;this._outputColorSpace=yt;let j=0,ee=0,M=null,te=-1,ne=null,re=new mn,N=new mn,ie=null,ae=new U(0),oe=0,se=t.width,ue=t.height,de=1,pe=null,he=null,be=new mn(0,0,se,ue),xe=new mn(0,0,se,ue),Se=!1,Ce=new Ni,we=new Fi,Te=!1,Ee=!1,De=new yn,ke=new B,Me=new mn,Ne={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Pe=!1;function Fe(){return M===null?de:1}let P=n;function Ie(e,n){return t.getContext(e,n)}let Le,Re,F,ze,I,Be,Ve,He,Ue,We,Ge,Ke,qe,Je,Ye,Xe,Ze,Qe,$e,et,tt,nt,rt;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r187`),t.addEventListener(`webglcontextlost`,ot,!1),t.addEventListener(`webglcontextrestored`,st,!1),t.addEventListener(`webglcontextcreationerror`,ct,!1),P===null){let t=`webgl2`;if(P=Ie(t,e),P===null)throw Ie(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}it()}catch(e){throw t.removeEventListener(`webglcontextlost`,ot,!1),t.removeEventListener(`webglcontextrestored`,st,!1),t.removeEventListener(`webglcontextcreationerror`,ct,!1),R(`WebGLRenderer: `+e.message),e}function it(){Le=new Cs(P),Le.init(),tt=new Gl(P,Le),Re=new rs(P,Le,e,tt),F=new Ul(P,Le),Re.reversedDepthBuffer&&d&&F.buffers.depth.setReversed(!0),O=P.createFramebuffer(),k=P.createFramebuffer(),A=P.createFramebuffer(),ze=new Es(P),I=new Cl,Be=new Wl(P,Le,F,I,Re,tt,ze),Ve=new Ss(T),He=new Jo(P),nt=new ts(P,He),Ue=new ws(P,He,ze,nt),We=new Os(P,Ue,He,nt,ze),Qe=new Ds(P,Re,Be),Ye=new is(I),Ge=new Sl(T,Ve,Le,Re,nt,Ye),Ke=new Ql(T,I),qe=new Dl,Je=new Pl(Le),Ze=new es(T,Ve,F,We,p,s),Xe=new Hl(T,We,Re),rt=new $l(P,ze,Re,F),$e=new ns(P,Le,ze),et=new Ts(P,Le,ze),ze.programs=Ge.programs,T.capabilities=Re,T.extensions=Le,T.properties=I,T.renderLists=qe,T.shadowMap=Xe,T.state=F,T.info=ze}m!==1009&&(w=new As(m,t.width,t.height,o,r,i));let at=new Yl(T,P);this.xr=at,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let e=Le.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Le.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return de},this.setPixelRatio=function(e){e!==void 0&&(de=e,this.setSize(se,ue,!1))},this.getSize=function(e){return e.set(se,ue)},this.setSize=function(e,n,r=!0){at.isPresenting?L(`WebGLRenderer: Can't change size while VR device is presenting.`):(se=e,ue=n,t.width=Math.floor(e*de),t.height=Math.floor(n*de),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(se*de,ue*de).floor()},this.setDrawingBufferSize=function(e,n,r){se=e,ue=n,de=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(m===1009)R(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){L(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}w.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(re)},this.getViewport=function(e){return e.copy(be)},this.setViewport=function(e,t,n,r){e.isVector4?be.set(e.x,e.y,e.z,e.w):be.set(e,t,n,r),F.viewport(re.copy(be).multiplyScalar(Fe()).round())},this.getScissor=function(e){return e.copy(xe)},this.setScissor=function(e,t,n,r){e.isVector4?xe.set(e.x,e.y,e.z,e.w):xe.set(e,t,n,r),F.scissor(N.copy(xe).multiplyScalar(Fe()).round())},this.getScissorTest=function(){return Se},this.setScissorTest=function(e){F.setScissorTest(Se=e)},this.setOpaqueSort=function(e){pe=e},this.setTransparentSort=function(e){he=e},this.getClearColor=function(e){return e.copy(Ze.getClearColor())},this.setClearColor=function(){Ze.setClearColor(...arguments)},this.getClearAlpha=function(){return Ze.getClearAlpha()},this.setClearAlpha=function(){Ze.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(M!==null){let t=M.texture.format;e=h.has(t)}if(e){let e=M.texture.type,t=g.has(e),n=Ze.getClearColor(),r=Ze.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(_[0]=i,_[1]=a,_[2]=o,_[3]=r,P.clearBufferuiv(P.COLOR,0,_)):(v[0]=i,v[1]=a,v[2]=o,v[3]=r,P.clearBufferiv(P.COLOR,0,v))}else r|=P.COLOR_BUFFER_BIT}t&&(r|=P.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&P.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),D=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,ot,!1),t.removeEventListener(`webglcontextrestored`,st,!1),t.removeEventListener(`webglcontextcreationerror`,ct,!1),Ze.dispose(),qe.dispose(),Je.dispose(),Be.dispose(),I.dispose(),Ve.dispose(),We.dispose(),Ue.dispose(),nt.dispose(),rt.dispose(),Ge.dispose(),at.dispose(),at.removeEventListener(`sessionstart`,ht),at.removeEventListener(`sessionend`,gt),_t.stop()};function ot(e){e.preventDefault(),Mt(`WebGLRenderer: Context Lost.`),E=!0}function st(){Mt(`WebGLRenderer: Context Restored.`),E=!1;let e=ze.autoReset,t=Xe.enabled,n=Xe.autoUpdate,r=Xe.needsUpdate,i=Xe.type;it(),ze.autoReset=e,Xe.enabled=t,Xe.autoUpdate=n,Xe.needsUpdate=r,Xe.type=i}function ct(e){R(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function lt(e){let t=e.target;t.removeEventListener(`dispose`,lt),ut(t)}function ut(e){dt(e),I.remove(e)}function dt(e){let t=I.get(e).programs;t!==void 0&&(t.forEach(function(e){Ge.releaseProgram(e)}),e.isShaderMaterial&&Ge.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=Ne);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=jt(e,t,n,r,i);F.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Ue.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;nt.setup(i,r,s,n,c);let h,g=$e;if(c!==null&&(h=He.get(c),g=et,g.setIndex(h)),i.isMesh)r.wireframe===!0?(F.setLineWidth(r.wireframeLinewidth*Fe()),g.setMode(P.LINES)):g.setMode(P.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),F.setLineWidth(e*Fe()),i.isLineSegments?g.setMode(P.LINES):i.isLineLoop?g.setMode(P.LINE_LOOP):g.setMode(P.LINE_STRIP)}else i.isPoints?g.setMode(P.POINTS):i.isSprite&&g.setMode(P.TRIANGLES);if(i.isBatchedMesh){if(Le.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?He.get(c).bytesPerElement:1,o=I.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(P,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function ft(e,t,n,r){D!==null&&e.isNodeMaterial&&D.setObject(r,e),Te===!0&&Ye.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Tt(e,t,r),e.side=0,e.needsUpdate=!0,Tt(e,t,r),e.side=2):Tt(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),D!==null&&D.renderStart(e,t,n),x=Je.get(n),x.init(t),C.push(x),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),x.setupLights(),D!==null&&D.updateLights(x.state.lightsArray),Ee=this.localClippingEnabled,Te=Ye.init(this.clippingPlanes,Ee),Te===!0&&Ye.setGlobalState(this.clippingPlanes,t),D!==null&&Xe.render(x.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];ft(o,n,t,e),r.add(o)}else ft(i,n,t,e),r.add(i)}}),x=C.pop(),D!==null&&D.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=I.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}Le.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let pt=null;function mt(e){pt&&pt(e)}function ht(){_t.stop()}function gt(){_t.start()}let _t=new qo;_t.setAnimationLoop(mt),typeof self<`u`&&_t.setContext(self),this.setAnimationLoop=function(e){pt=e,at.setAnimationLoop(e),e===null?_t.stop():_t.start()},at.addEventListener(`sessionstart`,ht),at.addEventListener(`sessionend`,gt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){R(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(E===!0)return;D!==null&&D.renderStart(e,t);let n=at.enabled===!0&&at.isPresenting===!0,r=w!==null&&(M===null||n)&&w.begin(T,M);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),at.enabled===!0&&at.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(at.cameraAutoUpdate===!0&&at.updateCamera(t),t=at.getCamera()),e.isScene===!0&&e.onBeforeRender(T,e,t,M),x=Je.get(e,C.length),x.init(t),x.state.textureUnits=Be.getTextureUnits(),C.push(x),De.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),t.isArrayCamera?we.setFromArrayCamera(t):Ce.setFromProjectionMatrix(De,Et,t.reversedDepth),Ee=this.localClippingEnabled,Te=Ye.init(this.clippingPlanes,Ee),b=qe.get(e,S.length),b.init(),S.push(b),this.info.render.frame++,at.enabled===!0&&at.isPresenting===!0){let e=T.xr.getDepthSensingMesh();e!==null&&vt(e,t,-1/0,T.sortObjects)}vt(e,t,0,T.sortObjects),b.finish(),D!==null&&D.updateLights(x.state.lightsArray),T.sortObjects===!0&&b.sort(pe,he),Pe=at.enabled===!1||at.isPresenting===!1||at.hasDepthSensing()===!1,Pe&&Ze.addToRenderList(b,e),this.info.autoReset===!0&&this.info.reset(),Te===!0&&Ye.beginShadows();let i=x.state.shadowsArray;if(Xe.render(i,e,t),Te===!0&&Ye.endShadows(),(r&&w.hasRenderPass())===!1){let n=b.opaque,r=b.transmissive;if(x.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];xt(n,r,e,a)}Pe&&Ze.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];bt(b,e,n,n.viewport)}}else r.length>0&&xt(n,r,e,t),Pe&&Ze.render(e),bt(b,e,t)}M!==null&&ee===0&&(Be.updateMultisampleRenderTarget(M),Be.updateRenderTargetMipmap(M)),r&&w.end(T),e.isScene===!0&&e.onAfterRender(T,e,t),nt.resetDefaultState(),te=-1,ne=null,C.pop(),C.length>0?(x=C[C.length-1],Be.setTextureUnits(x.state.textureUnits),Te===!0&&Ye.setGlobalState(T.clippingPlanes,x.state.camera)):x=null,S.pop(),b=S.length>0?S[S.length-1]:null,D!==null&&D.renderEnd()};function vt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)x.pushLight(e),e.castShadow&&x.pushShadow(e);else if(e.isSprite){let i=t.isArrayCamera?we:Ce;if(!e.frustumCulled||e.intersectsFrustum(i)){r&&Me.setFromMatrixPosition(e.matrixWorld).applyMatrix4(De);let i=We.update(e),a=e.material;a.visible&&b.push(e,i,a,n,Me.z,null,t)}}else if(e.isMesh||e.isLine||e.isPoints){let i=t.isArrayCamera?we:Ce;if(!e.frustumCulled||e.intersectsFrustum(i)){let i=We.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),Me.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),Me.copy(e.boundingSphere.center)),Me.applyMatrix4(e.matrixWorld).applyMatrix4(De)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&b.push(e,i,c,n,Me.z,s,t)}}else a.visible&&b.push(e,i,a,n,Me.z,null,t)}}}let i=e.children;for(let e=0,a=i.length;e<a;e++)vt(i[e],t,n,r)}function bt(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;x.setupLightsView(n),Te===!0&&Ye.setGlobalState(T.clippingPlanes,n),r&&F.viewport(re.copy(r)),i.length>0&&St(i,t,n),a.length>0&&St(a,t,n),o.length>0&&St(o,t,n),F.buffers.depth.setTest(!0),F.buffers.depth.setMask(!0),F.buffers.color.setMask(!0),F.setPolygonOffset(!1)}function xt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[r.id]===void 0){let e=Le.has(`EXT_color_buffer_half_float`)||Le.has(`EXT_color_buffer_float`);x.state.transmissionRenderTarget[r.id]=new gn(1,1,{generateMipmaps:!0,type:e?ge:le,minFilter:ce,samples:Math.max(4,Re.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:nn.workingColorSpace})}let a=x.state.transmissionRenderTarget[r.id],o=r.viewport||re;a.setSize(o.z*T.transmissionResolutionScale,o.w*T.transmissionResolutionScale);let s=T.getRenderTarget(),c=T.getActiveCubeFace(),l=T.getActiveMipmapLevel();T.setRenderTarget(a),T.getClearColor(ae),oe=T.getClearAlpha(),oe<1&&T.setClearColor(16777215,.5),T.clear(),Pe&&Ze.render(n);let u=T.toneMapping;T.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),x.setupLightsView(r),Te===!0&&Ye.setGlobalState(T.clippingPlanes,r),St(e,n,r),Be.updateMultisampleRenderTarget(a),Be.updateRenderTargetMipmap(a),Le.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,Ct(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(Be.updateMultisampleRenderTarget(a),Be.updateRenderTargetMipmap(a))}T.setRenderTarget(s,c,l),T.setClearColor(ae,oe),d!==void 0&&(r.viewport=d),T.toneMapping=u}function St(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&Ct(o,t,n,s,l,c)}}function Ct(e,t,n,r,i,a){D!==null&&i.isNodeMaterial&&D.setObject(e,i),e.onBeforeRender(T,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(T,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=2):T.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(T,t,n,r,i,a)}function wt(e){let t=0;for(let n of e)n.texture!==null&&t++;return t}function Tt(e,t,n){t.isScene!==!0&&(t=Ne);let r=I.get(e),i=x.state.lights,a=x.state.shadowsArray,o=i.state.version,s=Ge.getParameters(e,i.state,a,t,n,x.state.lightProbeGridArray),c=Ge.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Ve.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,lt),l=new Map,r.programs=l,r.programVariants=new Map);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return kt(e,s),d}else s.uniforms=Ge.getUniforms(e),D!==null&&e.isNodeMaterial&&D.build(e,n,s),e.onBeforeCompile(s,T),d=Ge.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Ye.uniform),kt(e,s),r.needsLights=Pt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.numLightProbeGrids=wt(x.state.lightProbeGridArray),r.currentProgram=d,r.uniformsList=null,d}function Dt(e,t,n,r,i){let a=I.get(e),o=a.currentProgram.id+`,`+r+`,`+i,s=a.programVariants.get(o);return s===void 0?(s=Tt(e,t,n),a.programVariants.set(o,s)):(a.currentProgram=s,a.uniformsList=null,a.outputColorSpace=r,a.toneMapping=i),s}function Ot(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=zc.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function kt(e,t){let n=I.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function jt(e,t,n,r,i){t.isScene!==!0&&(t=Ne),Be.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=M===null?T.outputColorSpace:M.isXRRenderTarget===!0?M.texture.colorSpace:nn.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Ve.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(M===null||M.isXRRenderTarget===!0)&&(h=T.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=I.get(r),b=x.state.lights;if(Te===!0&&(Ee===!0||e!==ne)){let t=e===ne&&r.id===te;Ye.setState(r,e,t)}let S=!1,C=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==b.state.version||i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?S=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Ye.numPlanes||v.numIntersection!==Ye.numIntersection)?S=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.morphTargetsCount===_&&v.numLightProbeGrids===wt(x.state.lightProbeGridArray)?(v.outputColorSpace!==s||v.toneMapping!==h)&&(C=!0):S=!0:S=!0:(S=!0,v.__version=r.version);let w=v.currentProgram;(S===!0||C===!0)&&(w=C===!0?Dt(r,t,i,s,h):Tt(r,t,i),D&&r.isNodeMaterial&&D.onUpdateProgram(r,w,v));let E=!1,O=!1,k=!1,A=w.getUniforms(),j=v.uniforms;if(F.useProgram(w.program)&&(E=!0,O=!0,k=!0),r.id!==te&&(te=r.id,O=!0),E||ne!==e){F.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),A.setValue(P,`projectionMatrix`,e.projectionMatrix),A.setValue(P,`viewMatrix`,e.matrixWorldInverse);let t=A.map.cameraPosition;t!==void 0&&t.setValue(P,ke.setFromMatrixPosition(e.matrixWorld)),Re.logarithmicDepthBuffer&&A.setValue(P,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&A.setValue(P,`isOrthographic`,e.isOrthographicCamera===!0),ne!==e&&(ne=e,O=!0,k=!0)}if(v.needsLights&&(b.state.sunShadowMap.length>0&&A.setValue(P,`sunShadowMap`,b.state.sunShadowMap,Be),b.state.directionalShadowMap.length>0&&A.setValue(P,`directionalShadowMap`,b.state.directionalShadowMap,Be),b.state.spotShadowMap.length>0&&A.setValue(P,`spotShadowMap`,b.state.spotShadowMap,Be),b.state.pointShadowMap.length>0&&A.setValue(P,`pointShadowMap`,b.state.pointShadowMap,Be)),i.isSkinnedMesh){A.setOptional(P,i,`bindMatrix`),A.setOptional(P,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),A.setValue(P,`boneTexture`,e.boneTexture,Be))}i.isBatchedMesh&&(A.setOptional(P,i,`batchingTexture`),A.setValue(P,`batchingTexture`,i._matricesTexture,Be),A.setOptional(P,i,`batchingIdTexture`),A.setValue(P,`batchingIdTexture`,i._indirectTexture,Be),A.setOptional(P,i,`batchingColorTexture`),i._colorsTexture!==null&&A.setValue(P,`batchingColorTexture`,i._colorsTexture,Be));let ee=n.morphAttributes;if((ee.position!==void 0||ee.normal!==void 0||ee.color!==void 0)&&Qe.update(i,n,w),(O||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,A.setValue(P,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(j.envMapIntensity.value=t.environmentIntensity),j.dfgLUT!==void 0&&(j.dfgLUT.value=nu()),O){if(A.setValue(P,`toneMappingExposure`,T.toneMappingExposure),v.needsLights&&Nt(j,k),a&&r.fog===!0&&Ke.refreshFogUniforms(j,a),Ke.refreshMaterialUniforms(j,r,de,ue,x.state.transmissionRenderTarget[e.id]),v.needsLights&&v.numLightProbeGrids>0){let e=y,t=0;for(let n of x.state.lightProbeGridArray)n.texture!==null&&(e.textures[t]=n.texture,e.min[t]=n.boundingBox.min,e.max[t]=n.boundingBox.max,e.resolution[t]=n.resolution,t++);for(let n in e)e[n].length=t;j.probesSH.value=e.textures,j.probesMin.value=e.min,j.probesMax.value=e.max,j.probesResolution.value=e.resolution}zc.upload(P,Ot(v),j,Be)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(zc.upload(P,Ot(v),j,Be),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&A.setValue(P,`center`,i.center),A.setValue(P,`modelViewMatrix`,i.modelViewMatrix),A.setValue(P,`normalMatrix`,i.normalMatrix),A.setValue(P,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];rt.update(n,w),rt.bind(n,w)}}return w}function Nt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function Pt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return j},this.getActiveMipmapLevel=function(){return ee},this.getRenderTarget=function(){return M},this.setRenderTargetTextures=function(e,t,n){let r=I.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),I.get(e.texture).__webglTexture=t,I.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=I.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){M=e,j=t,ee=n;let r=null,i=!1,a=!1;if(e){let o=I.get(e);if(o.__useDefaultFramebuffer!==void 0){F.bindFramebuffer(P.FRAMEBUFFER,o.__webglFramebuffer),re.copy(e.viewport),N.copy(e.scissor),ie=e.scissorTest,F.viewport(re),F.scissor(N),F.setScissorTest(ie),te=-1;return}if(o.__webglFramebuffer===void 0)Be.setupRenderTarget(e);else if(o.__hasExternalTextures)Be.rebindTextures(e,I.get(e.texture).__webglTexture,I.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&I.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);Be.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=I.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&Be.useMultisampledRTT(e)===!1?I.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,re.copy(e.viewport),N.copy(e.scissor),ie=e.scissorTest}else re.copy(be).multiplyScalar(de).floor(),N.copy(xe).multiplyScalar(de).floor(),ie=Se;if(n!==0&&(r=O),F.bindFramebuffer(P.FRAMEBUFFER,r)&&F.drawBuffers(e,r),F.viewport(re),F.scissor(N),F.setScissorTest(ie),i){let r=I.get(e.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=I.get(e.textures[t]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=I.get(e.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,t.__webglTexture,n)}te=-1};function It(e){let t=I.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=Re.textureFormatReadable(e.format),t.__typeReadable=Re.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){F.bindFramebuffer(P.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+s);let u=It(o);if(u.__formatReadable===!1){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&P.readPixels(t,n,r,i,tt.convert(c),tt.convert(l),a)}finally{let e=M===null?null:I.get(M).__webglFramebuffer;F.bindFramebuffer(P.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){F.bindFramebuffer(P.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+s);let d=It(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,f),P.bufferData(P.PIXEL_PACK_BUFFER,a.byteLength,P.STREAM_READ),P.readPixels(t,n,r,i,tt.convert(l),tt.convert(u),0),P.bindBuffer(P.PIXEL_PACK_BUFFER,null);let p=M===null?null:I.get(M).__webglFramebuffer;F.bindFramebuffer(P.FRAMEBUFFER,p);let m=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await Ft(P,m,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,f),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,a),P.bindBuffer(P.PIXEL_PACK_BUFFER,null),P.deleteBuffer(f),P.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;Be.setTexture2D(e,0),P.copyTexSubImage2D(P.TEXTURE_2D,n,0,0,o,s,i,a),F.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=tt.convert(t.format),_=tt.convert(t.type),v;t.isData3DTexture?(Be.setTexture3D(t,0),v=P.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(Be.setTexture2DArray(t,0),v=P.TEXTURE_2D_ARRAY):(Be.setTexture2D(t,0),v=P.TEXTURE_2D),F.activeTexture(P.TEXTURE0),F.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,t.flipY),F.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),F.pixelStorei(P.UNPACK_ALIGNMENT,t.unpackAlignment);let y=F.getParameter(P.UNPACK_ROW_LENGTH),b=F.getParameter(P.UNPACK_IMAGE_HEIGHT),x=F.getParameter(P.UNPACK_SKIP_PIXELS),S=F.getParameter(P.UNPACK_SKIP_ROWS),C=F.getParameter(P.UNPACK_SKIP_IMAGES);F.pixelStorei(P.UNPACK_ROW_LENGTH,h.width),F.pixelStorei(P.UNPACK_IMAGE_HEIGHT,h.height),F.pixelStorei(P.UNPACK_SKIP_PIXELS,l),F.pixelStorei(P.UNPACK_SKIP_ROWS,u),F.pixelStorei(P.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=I.get(e),r=I.get(t),h=I.get(n.__renderTarget),g=I.get(r.__renderTarget);F.bindFramebuffer(P.READ_FRAMEBUFFER,h.__webglFramebuffer),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,I.get(e).__webglTexture,i,d+n),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,I.get(t).__webglTexture,a,m+n)),P.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,P.DEPTH_BUFFER_BIT,P.NEAREST);F.bindFramebuffer(P.READ_FRAMEBUFFER,null),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||I.has(e)){let n=I.get(e),r=I.get(t);F.bindFramebuffer(P.READ_FRAMEBUFFER,k),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,A);for(let e=0;e<c;e++)w?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,n.__webglTexture,i),T?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,r.__webglTexture,a),i===0?T?P.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):P.copyTexSubImage2D(v,a,f,p,l,u,o,s):P.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,P.COLOR_BUFFER_BIT,P.NEAREST);F.bindFramebuffer(P.READ_FRAMEBUFFER,null),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?P.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?P.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):P.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):P.texSubImage2D(P.TEXTURE_2D,a,f,p,o,s,g,_,h);F.pixelStorei(P.UNPACK_ROW_LENGTH,y),F.pixelStorei(P.UNPACK_IMAGE_HEIGHT,b),F.pixelStorei(P.UNPACK_SKIP_PIXELS,x),F.pixelStorei(P.UNPACK_SKIP_ROWS,S),F.pixelStorei(P.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps===!0&&t.mipmapsAutoUpdate===!0&&P.generateMipmap(v),F.unbindTexture()},this.initRenderTarget=function(e){I.get(e).__webglFramebuffer===void 0&&Be.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?Be.setTextureCube(e,0):e.isData3DTexture?Be.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?Be.setTexture2DArray(e,0):Be.setTexture2D(e,0),F.unbindTexture()},this.resetState=function(){j=0,ee=0,M=null,F.reset(),nt.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Et}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=nn._getDrawingBufferColorSpace(e),t.unpackColorSpace=nn._getUnpackColorSpace()}},iu=1.5;function au(e,t){return{operator:`ADD`,initialValue:e,damagePerIncrement:Math.max(4,Math.round(t)),isLocked:!1}}function ou(e,t){return{operator:`MUL`,initialValue:e,damagePerIncrement:Math.max(6,Math.round(t)),isLocked:!1}}function su(e,t,n,r,i,a,o,s=3.1){return[{z:e,lane:`CENTER`,hp:Math.max(18,Math.round(n)),rewardType:a.type,rewardValue:a.val,rollSpeed:s},{z:e-2.6,lane:`LEFT`,hp:Math.max(18,Math.round(t)),rewardType:i.type,rewardValue:i.val,rollSpeed:Number((s+.15).toFixed(2))},{z:e-2.6,lane:`RIGHT`,hp:Math.max(18,Math.round(r)),rewardType:o.type,rewardValue:o.val,rollSpeed:Number((s+.15).toFixed(2))}]}function cu(e,t,n,r,i,a,o,s=3.4){return[{z:e,lane:t,hp:Math.max(22,Math.round(r)),rewardType:a.type,rewardValue:a.val,rollSpeed:s},{z:e-2.4,lane:n,hp:Math.max(22,Math.round(i)),rewardType:o.type,rewardValue:o.val,rollSpeed:Number((s+.2).toFixed(2))}]}function lu(e,t,n,r,i,a,o){return[{z:e,lane:`LEFT`,breakCount:Math.max(140,Math.round(t)),weaponTier:i===`LEFT`?a:void 0,coinReward:i===`LEFT`?void 0:o},{z:e,lane:`CENTER`,breakCount:Math.max(140,Math.round(n)),weaponTier:i===`CENTER`?a:void 0,coinReward:i===`CENTER`?void 0:o},{z:e,lane:`RIGHT`,breakCount:Math.max(140,Math.round(r)),weaponTier:i===`RIGHT`?a:void 0,coinReward:i===`RIGHT`?void 0:o}]}function uu(e,t,n,r,i,a,o,s,c,l){let u=iu,d=Math.round((352+(e-1)*9)*1.3),f=Math.min(6.2,Math.max(5.25,r*2.12+e*.1))*1.3,p=[{kind:`GATE`,operator:`ADD`,value:2},{kind:`GATE`,operator:`ADD`,value:2},{kind:`WEAPON`,weaponTier:2},{kind:`GATE`,operator:`MUL`,value:1.5},{kind:`GATE`,operator:`ADD`,value:3},{kind:`WEAPON`,weaponTier:3},{kind:`COINS`,coins:Math.round(80*t)},{kind:`GATE`,operator:`ADD`,value:3},{kind:`GATE`,operator:`MUL`,value:1.5},{kind:`GATE`,operator:`ADD`,value:4},{kind:`WEAPON`,weaponTier:4},{kind:`COINS`,coins:Math.round(135*t)},{kind:`GATE`,operator:`ADD`,value:4},{kind:`GATE`,operator:`MUL`,value:1.5},{kind:`GATE`,operator:`ADD`,value:5},{kind:`WEAPON`,weaponTier:5},{kind:`COINS`,coins:Math.round(195*t)},{kind:`GATE`,operator:`MUL`,value:1.5},{kind:`GATE`,operator:`ADD`,value:5},{kind:`GATE`,operator:`MUL`,value:1.5},{kind:`COINS`,coins:Math.round(260*t)},{kind:`GATE`,operator:`ADD`,value:6},{kind:`GATE`,operator:`MUL`,value:1.5},{kind:`GATE`,operator:`ADD`,value:6},{kind:`COINS`,coins:Math.round(330*t)},{kind:`GATE`,operator:`MUL`,value:2},{kind:`GATE`,operator:`ADD`,value:8},{kind:`GATE`,operator:`MUL`,value:2}],m=[18,32,54,92,148,225,325,455,630,860,1160,1550,2050,2680,3480,4480,5700,7200,9e3,11200,13800,16900,20600,25e3,30200,36400,43800,52500],h=[];for(let e=0;e<p.length;e++){let n=e===0?t**.68:t**.92,r=Math.max(40,Math.round(m[e]*u*n*1.55));h.push({barrelHp:r,reward:p[e]})}let g=[],_=21.5;for(let t=0;t<26;t++){let r=t/25,a=1;t===0||t>=3&&t%4==3?a=0:(t===2||t>=6&&t%4==2||t>=23)&&(a=2);let o=a===2||t===0?5:t<=5?6:7,s=a===2?3:4,c=1+r**1.45*2.05,l=a===2?1.95:a===0?t===0?.68:.85:1,d=Math.max(7,Math.round(n*u*c*l)),p=a===2?f*.94:a===0?f*1.08:f,m=a===2?Math.round((i+2)*3):Math.max(3,i+Math.floor(r*4));g.push({startZ:Number(_.toFixed(1)),rows:s,cols:o,rank:a,hpPerUnit:d,speed:Number(p.toFixed(2)),coinPerKill:m});let h=s*(a===2?1.42:1.04),v=t===0?9.4:13+(e-1)*.26;_+=h+v}let v=Math.min(4.35,Math.max(3.55,s*1.76))*1.3,y=[{z:-Math.round(d*.34),name:`${a} Alpha`,maxHp:Math.round(o*.13),speed:Number(v.toFixed(2)),clubDamage:Math.max(7,c-1),coinReward:Math.round(l*.8)},{z:-Math.round(d*.64),name:a,maxHp:Math.round(o*.22),speed:Number(Math.min(5.85,v+.2).toFixed(2)),clubDamage:c,coinReward:l},{z:-Math.round(d*.88),name:`${a} Prime`,maxHp:Math.round(o*.3),speed:Number(Math.min(5.98,v+.36).toFixed(2)),clubDamage:c+2,coinReward:Math.round(l*1.25)}];return{siegeColumnSpan:d,marchSpeed:Number(f.toFixed(2)),dividerStartZ:8.2,dividerLength:108,leftQueue:h,rightEchelons:g,goliathSpawns:y}}function du(e){let t=iu,n=Math.max(380,Math.round(e.baseSpan*1.36)),r=Math.round(n*4)+38,i=[],a=[],o=[],s=[],c=[`LEFT`,`RIGHT`],l=[`LEFT`,`RIGHT`,`CENTER`,`LEFT`];for(let r=0;r<4;r++){let u=-r*n,d=1+r*.46,f=e.hpScale*t*d,p=e.gateK*t*(1+r*.34),m=Math.min(5,2+Math.floor((e.stageNumber-1)/3)+Math.floor(r/2)),h=Math.min(5,m+1),g=Math.min(5,h+ +(r>=1)),_=(e.stageNumber+r)%2==0,v=_?[`LEFT`,`RIGHT`]:[`CENTER`,`LEFT`],y=_?[`CENTER`,`RIGHT`]:[`LEFT`,`RIGHT`],b=_?[`RIGHT`,`CENTER`]:[`RIGHT`,`LEFT`];r===0?i.push(...su(u-18,24*e.hpScale,76*f,22*e.hpScale,{type:`RECRUIT`,val:1},{type:`COINS`,val:Math.round(32+e.stageNumber*12)},{type:`RECRUIT`,val:2},2.8),...su(u-Math.round(n*.115),46*f,255*f,48*f,{type:`RECRUIT`,val:2},{type:`COINS`,val:Math.round(52+e.stageNumber*18)},{type:`WEAPON`,val:m},3.05),...cu(u-Math.round(n*.268),v[0],v[1],72*f,82*f,{type:`RECRUIT`,val:2},{type:`COINS`,val:Math.round(48+e.stageNumber*16)},3.25),...cu(u-Math.round(n*.432),y[0],y[1],115*f,128*f,{type:`COINS`,val:Math.round(64+e.stageNumber*20)},{type:`RECRUIT`,val:2},3.35),...cu(u-Math.round(n*.545),b[0],b[1],145*f,158*f,{type:`RECRUIT`,val:2},{type:`COINS`,val:Math.round(74+e.stageNumber*24)},3.45),...su(u-Math.round(n*.795),190*f,150*f,210*f,{type:`COINS`,val:Math.round(85+e.stageNumber*28)},{type:`RECRUIT`,val:3},{type:`WEAPON`,val:h},3.4)):i.push(...su(u-Math.round(n*.065),115*f,168*f,125*f,{type:`WEAPON`,val:m},{type:`COINS`,val:Math.round((32+e.stageNumber*12)*(1+r*.3))},{type:`RECRUIT`,val:2+Math.floor(r/2)},3.15),...su(u-Math.round(n*.125),106*f,275*f,120*f,{type:`RECRUIT`,val:3},{type:`COINS`,val:Math.round((52+e.stageNumber*18)*(1+r*.35))},{type:`WEAPON`,val:h},3.25),...cu(u-Math.round(n*.268),v[0],v[1],152*f,164*f,{type:`RECRUIT`,val:2},{type:`COINS`,val:Math.round((56+e.stageNumber*18)*(1+r*.32))},3.4),...cu(u-Math.round(n*.432),y[0],y[1],178*f,192*f,{type:`COINS`,val:Math.round((70+e.stageNumber*22)*(1+r*.35))},{type:`RECRUIT`,val:3},3.5),...cu(u-Math.round(n*.545),b[0],b[1],205*f,218*f,{type:`RECRUIT`,val:3},{type:`COINS`,val:Math.round((80+e.stageNumber*26)*(1+r*.38))},3.55),...su(u-Math.round(n*.795),235*f,180*f,260*f,{type:`COINS`,val:Math.round((88+e.stageNumber*28)*(1+r*.4))},{type:`RECRUIT`,val:4},{type:`WEAPON`,val:g},3.55));let x=Math.max(.05,Number((.22-(e.stageNumber-1)*.02-r*.04).toFixed(2))),S=e.negGateBase-r*5,C=e.posGateBase+Math.floor(r/2),w=(e.stageNumber+r)%2==0;a.push({z:u-Math.round(n*.195),left:null,right:null,full:ou(x,7.2*p)},{z:u-Math.round(n*.468),left:w?au(S,16*p):au(C,18*p),right:w?au(C,18*p):au(S,16*p)},{z:u-Math.round(n*.865),left:w?ou(1,28*p):ou(.1,22*p),right:w?ou(.1,22*p):ou(1,28*p)});let T=r===0?c[e.stageNumber%2]:l[(e.stageNumber+r)%4],E=l[(e.stageNumber+r+1)%4],D=(r===0?235:495)*f,O=(r===0?430:660)*f;o.push(...lu(u-Math.round(n*.39),T===`LEFT`?D:D*1.48,T===`CENTER`?D:D*1.52,T===`RIGHT`?D:D*1.48,T,h,Math.round((95+e.stageNumber*28)*(1+r*.3))),...lu(u-Math.round(n*.665),E===`LEFT`?O:O*1.28,E===`CENTER`?O:O*1.32,E===`RIGHT`?O:O*1.28,E,g,Math.round((135+e.stageNumber*38)*(1+r*.35))));let k=Math.min(3.25,e.enemyBaseSpeed+r*.14),A=e.enemyBaseHp*t*d;s.push({z:u-Math.round(n*.31),lane:`CENTER`,count:Math.min(48,26+e.stageNumber+r*3),hpPerEnemy:Math.max(6,Math.round(A*.72)),heavyCount:Math.min(12,3+Math.floor(e.stageNumber/2)+r),vanguardRatio:.4,speed:Number(k.toFixed(2)),coinPerKill:e.coinBase+r},{z:u-Math.round(n*.585),lane:`CENTER`,count:Math.min(50,32+e.stageNumber+r*3),hpPerEnemy:Math.max(9,Math.round(A*1.02)),heavyCount:Math.min(13,5+Math.floor(e.stageNumber/2)+r),vanguardRatio:.35,speed:Number((k+.12).toFixed(2)),coinPerKill:e.coinBase+r+1},{z:u-Math.round(n*.732),lane:`CENTER`,count:Math.min(52,39+Math.floor(e.stageNumber/2)+r*2),hpPerEnemy:Math.max(13,Math.round(A*1.42)),heavyCount:Math.min(14,6+Math.floor(e.stageNumber/2)+r),vanguardRatio:.3,speed:Number((k+.2).toFixed(2)),coinPerKill:e.coinBase+r+2},{z:u-Math.round(n*.98),lane:`CENTER`,count:Math.min(52,43+Math.floor(e.stageNumber/2)+r*2),hpPerEnemy:Math.max(16,Math.round(A*1.68)),heavyCount:Math.min(15,7+Math.floor(e.stageNumber/2)+r),vanguardRatio:.28,speed:Number((k+.26).toFixed(2)),coinPerKill:e.coinBase+r+2})}let u={z:-Math.round(n*1.625),name:e.bruteName,maxHp:e.bruteMaxHp,speed:e.bruteSpeed,clubDamage:e.bruteDamage,coinReward:e.bruteCoins},d=[{z:-Math.round(n*.625),name:`${e.bruteName} Vanguard`,maxHp:Math.round(e.bruteMaxHp*.3),speed:Math.max(1.92,e.bruteSpeed-.04),clubDamage:Math.max(7,e.bruteDamage-1),coinReward:Math.round(e.bruteCoins*.75)},u,{z:-Math.round(n*3.625),name:`${e.bruteName} Warden`,maxHp:Math.round(e.bruteMaxHp*1.12),speed:Math.min(2.65,e.bruteSpeed+.12),clubDamage:e.bruteDamage+2,coinReward:Math.round(e.bruteCoins*1.3)}],f=e.boardLayout===`SPLIT_CAUSEWAY`?uu(e.stageNumber,e.hpScale,e.enemyBaseHp,e.enemyBaseSpeed,e.coinBase,e.bruteName,e.bruteMaxHp,e.bruteSpeed,e.bruteDamage,e.bruteCoins):void 0;return{stageNumber:e.stageNumber,title:e.title,boardLayout:e.boardLayout,trackLength:r,supplyDrums:i,gatePairs:a,tireStacks:o,enemyWaves:s,midBrute:u,midBrutes:d,splitCauseway:f,boss:e.boss}}var fu=[du({stageNumber:1,title:`Midnight Viaduct Outpost`,boardLayout:`STANDARD_BRIDGE`,baseSpan:280,hpScale:1,gateK:1,negGateBase:-24,posGateBase:2,enemyBaseHp:6.8,enemyBaseSpeed:2.38,coinBase:3,bruteName:`Siege Goliath`,bruteMaxHp:10800,bruteSpeed:2.04,bruteDamage:9,bruteCoins:280,boss:{name:`Obsidian Warden Mk-I`,chassis:`WARDEN_MECH`,primaryHex:2372680,accentHex:15082580,trimHex:2685148,maxHp:19500,segments:5,advanceSpeed:1.38,salvoLanes:1,salvoInterval:1.82,salvoDamage:8,rewardCoins:360}}),du({stageNumber:2,title:`Stormwall Split Causeway`,boardLayout:`SPLIT_CAUSEWAY`,baseSpan:288,hpScale:1.32,gateK:1.25,negGateBase:-26,posGateBase:2,enemyBaseHp:9.2,enemyBaseSpeed:2.46,coinBase:4,bruteName:`Breacher Goliath`,bruteMaxHp:15600,bruteSpeed:2.1,bruteDamage:10,bruteCoins:360,boss:{name:`Stormwall Enforcer`,chassis:`SIEGE_TANK`,primaryHex:1977662,accentHex:16726876,trimHex:2685148,maxHp:26500,segments:5,advanceSpeed:1.42,salvoLanes:2,salvoInterval:1.78,salvoDamage:9,rewardCoins:460}}),du({stageNumber:3,title:`Obsidian Truss Marathon`,boardLayout:`STANDARD_BRIDGE`,baseSpan:296,hpScale:1.68,gateK:1.55,negGateBase:-28,posGateBase:3,enemyBaseHp:12.5,enemyBaseSpeed:2.54,coinBase:5,bruteName:`Crimson Goliath`,bruteMaxHp:18800,bruteSpeed:2.16,bruteDamage:10,bruteCoins:440,boss:{name:`Crimson Juggernaut`,chassis:`SIEGE_TANK`,primaryHex:6034472,accentHex:1845046,trimHex:16758832,maxHp:35e3,segments:6,advanceSpeed:1.45,salvoLanes:2,salvoInterval:1.72,salvoDamage:9,rewardCoins:580}}),du({stageNumber:4,title:`Thunderhead Divide`,boardLayout:`SPLIT_CAUSEWAY`,baseSpan:304,hpScale:2.12,gateK:1.88,negGateBase:-30,posGateBase:3,enemyBaseHp:16.5,enemyBaseSpeed:2.62,coinBase:6,bruteName:`Ironclad Goliath`,bruteMaxHp:22400,bruteSpeed:2.22,bruteDamage:11,bruteCoins:540,boss:{name:`Volt-Core Siege Mech`,chassis:`WARDEN_MECH`,primaryHex:1976376,accentHex:16723544,trimHex:16763192,maxHp:45e3,segments:6,advanceSpeed:1.48,salvoLanes:2,salvoInterval:1.66,salvoDamage:10,rewardCoins:720}}),du({stageNumber:5,title:`Tempest Cable Viaduct`,boardLayout:`STANDARD_BRIDGE`,baseSpan:312,hpScale:2.65,gateK:2.25,negGateBase:-32,posGateBase:3,enemyBaseHp:21.5,enemyBaseSpeed:2.7,coinBase:7,bruteName:`Tempest Goliath`,bruteMaxHp:26500,bruteSpeed:2.28,bruteDamage:11,bruteCoins:660,boss:{name:`Tempest Arachnid`,chassis:`KRAKEN_WALKER`,primaryHex:1715266,accentHex:2685148,trimHex:16726876,maxHp:56500,segments:7,advanceSpeed:1.52,salvoLanes:2,salvoInterval:1.6,salvoDamage:10,rewardCoins:900}}),du({stageNumber:6,title:`Twin-Bulkhead Overwatch`,boardLayout:`SPLIT_CAUSEWAY`,baseSpan:318,hpScale:3.25,gateK:2.68,negGateBase:-34,posGateBase:3,enemyBaseHp:27.5,enemyBaseSpeed:2.78,coinBase:8,bruteName:`Overwatch Goliath`,bruteMaxHp:31200,bruteSpeed:2.34,bruteDamage:12,bruteCoins:800,boss:{name:`Aegis Dreadnought`,chassis:`SIEGE_TANK`,primaryHex:2241094,accentHex:15082580,trimHex:3733247,maxHp:69e3,segments:7,advanceSpeed:1.55,salvoLanes:2,salvoInterval:1.54,salvoDamage:11,rewardCoins:1120}}),du({stageNumber:7,title:`Abyssal Strait Span`,boardLayout:`STANDARD_BRIDGE`,baseSpan:324,hpScale:3.95,gateK:3.15,negGateBase:-36,posGateBase:4,enemyBaseHp:34.5,enemyBaseSpeed:2.86,coinBase:10,bruteName:`Abyssal Goliath`,bruteMaxHp:36500,bruteSpeed:2.38,bruteDamage:12,bruteCoins:960,boss:{name:`Kraken Command Rig`,chassis:`KRAKEN_WALKER`,primaryHex:1450032,accentHex:16722004,trimHex:2685148,maxHp:83500,segments:8,advanceSpeed:1.58,salvoLanes:2,salvoInterval:1.48,salvoDamage:12,rewardCoins:1380}}),du({stageNumber:8,title:`Vortex Partition Causeway`,boardLayout:`SPLIT_CAUSEWAY`,baseSpan:330,hpScale:4.75,gateK:3.68,negGateBase:-38,posGateBase:4,enemyBaseHp:42.5,enemyBaseSpeed:2.94,coinBase:12,bruteName:`Vortex Goliath`,bruteMaxHp:42400,bruteSpeed:2.42,bruteDamage:13,bruteCoins:1140,boss:{name:`Obsidian Sovereign`,chassis:`SOVEREIGN_TITAN`,primaryHex:1580072,accentHex:15081544,trimHex:16758832,maxHp:99500,segments:8,advanceSpeed:1.62,salvoLanes:2,salvoInterval:1.42,salvoDamage:13,rewardCoins:1700}}),du({stageNumber:9,title:`Plasma Horizon Viaduct`,boardLayout:`STANDARD_BRIDGE`,baseSpan:336,hpScale:5.65,gateK:4.25,negGateBase:-40,posGateBase:4,enemyBaseHp:51.5,enemyBaseSpeed:3.02,coinBase:14,bruteName:`Horizon Goliath`,bruteMaxHp:49e3,bruteSpeed:2.46,bruteDamage:14,bruteCoins:1360,boss:{name:`Hyperion Warlord`,chassis:`SOVEREIGN_TITAN`,primaryHex:1977410,accentHex:2685148,trimHex:16762949,maxHp:117500,segments:9,advanceSpeed:1.66,salvoLanes:2,salvoInterval:1.35,salvoDamage:14,rewardCoins:2050}}),du({stageNumber:10,title:`Omega Stormwall Citadel`,boardLayout:`SPLIT_CAUSEWAY`,baseSpan:342,hpScale:6.75,gateK:4.9,negGateBase:-42,posGateBase:4,enemyBaseHp:62,enemyBaseSpeed:3.1,coinBase:17,bruteName:`Omega Goliath`,bruteMaxHp:56500,bruteSpeed:2.5,bruteDamage:15,bruteCoins:1650,boss:{name:`Apex Sovereign Mech`,chassis:`SOVEREIGN_TITAN`,primaryHex:2890808,accentHex:16722008,trimHex:2685148,maxHp:138e3,segments:10,advanceSpeed:1.72,salvoLanes:2,salvoInterval:1.28,salvoDamage:15,rewardCoins:2600}})];function pu(e){return fu[Math.max(0,Math.min(fu.length-1,Math.floor(e)-1))]}var mu=[{chassis:`WARDEN_MECH`,label:`Warden`,primaryHex:2372680,accentHex:15082580,trimHex:2685148},{chassis:`SIEGE_TANK`,label:`Juggernaut`,primaryHex:5118508,accentHex:16731501,trimHex:16763192},{chassis:`KRAKEN_WALKER`,label:`Kraken`,primaryHex:1846852,accentHex:2685148,trimHex:16726876},{chassis:`SOVEREIGN_TITAN`,label:`Sovereign`,primaryHex:2890810,accentHex:16763192,trimHex:2685148}],hu=[`Stormwall Split Causeway`,`Thunderhead Divide`,`Obsidian Bulkhead Wall`,`Crimson Breach Corridor`,`Twin-Channel Viaduct`,`Tempest Shield Causeway`,`Abyssal Siege Partition`,`Vortex Gatehouse`,`Hyperion Split Span`,`Omega Stormwall Citadel`];function gu(e){let t=Math.max(1,Math.floor(e)),n=1.3**(t-1),r=mu[(t-1)%mu.length],i=hu[(t-1)%hu.length];return du({stageNumber:t,title:i,boardLayout:`SPLIT_CAUSEWAY`,baseSpan:Math.min(345,286+t*6),hpScale:1*n,gateK:n,negGateBase:-(22+t*2),posGateBase:Math.min(5,2+Math.floor(t/3)),enemyBaseHp:7*n,enemyBaseSpeed:Math.min(3.05,2.38+t*.06),coinBase:3+t*2,bruteName:`Causeway-${t} Goliath`,bruteMaxHp:Math.round(9800*iu*1.25**(t-1)),bruteSpeed:Math.min(2.5,2.04+t*.04),bruteDamage:Math.min(16,8+Math.floor(t/2)),bruteCoins:Math.round(310*n),boss:{name:`Causeway-${t} ${r.label}`,chassis:r.chassis,primaryHex:r.primaryHex,accentHex:r.accentHex,trimHex:r.trimHex,maxHp:Math.round(14500*iu*1.3**(t-1)),segments:Math.min(10,5+Math.floor(t/2)),advanceSpeed:Math.min(1.72,1.38+t*.03),salvoLanes:t>=2?2:1,salvoInterval:Math.max(1.26,1.82-t*.05),salvoDamage:Math.min(16,8+Math.floor(t/2)),rewardCoins:Math.round(360+t*115*n)}})}function _u(e){let t=Math.max(1,Math.floor(e)),n=1.28**(t-1),r=mu[(t-1)%mu.length],i=t%2==0?`SPLIT_CAUSEWAY`:`STANDARD_BRIDGE`;return du({stageNumber:t,title:i===`SPLIT_CAUSEWAY`?`Endless Causeway ${t}`:`Endless Viaduct ${t}`,boardLayout:i,baseSpan:296,hpScale:n,gateK:n,negGateBase:-(22+t*2),posGateBase:Math.min(5,2+Math.floor(t/3)),enemyBaseHp:6.8*n,enemyBaseSpeed:Math.min(3.05,2.36+t*.055),coinBase:3+t*2,bruteName:`Wave-${t} Goliath`,bruteMaxHp:Math.round(9200*iu*n),bruteSpeed:Math.min(2.48,2.02+t*.04),bruteDamage:Math.min(16,8+Math.floor(t/2)),bruteCoins:Math.round(290*n),boss:{name:`Sector-${t} ${r.label}`,chassis:r.chassis,primaryHex:r.primaryHex,accentHex:r.accentHex,trimHex:r.trimHex,maxHp:Math.round(13500*iu*1.32**(t-1)),segments:Math.min(10,5+Math.floor(t/2)),advanceSpeed:Math.min(1.7,1.36+t*.03),salvoLanes:t>=2?2:1,salvoInterval:Math.max(1.26,1.84-t*.05),salvoDamage:Math.min(16,8+Math.floor(t/2)),rewardCoins:Math.round(350+t*110*n)}})}var vu={"Obsidian Warden Mk-I":`Sapphire Charger Stallion`,"Stormwall Enforcer":`Emerald Chariot Unicorn`,"Crimson Juggernaut":`Cobalt Chariot Stallion`,"Volt-Core Siege Mech":`Verdant Knight Stallion`,"Tempest Arachnid":`Tempest Pegasus Alicorn`,"Aegis Dreadnought":`Aegis Chariot War-Unicorn`,"Kraken Command Rig":`Sky-Wing Pegasus Alicorn`,"Obsidian Sovereign":`Royal Crowned Alicorn`,"Hyperion Warlord":`Emerald King Alicorn`,"Apex Sovereign Mech":`Omega Sovereign Alicorn`},yu={WARDEN_MECH:`CHARGER STALLION`,SIEGE_TANK:`CHARIOT WAR-UNICORN`,KRAKEN_WALKER:`WINGED PEGASUS ALICORN`,SOVEREIGN_TITAN:`CROWNED SOVEREIGN ALICORN`};function bu(e,t){if(t!==`UNICORN`)return{name:e.name,archetypeLabel:{WARDEN_MECH:`BIPEDAL MECH`,SIEGE_TANK:`HEAVY SIEGE TANK`,KRAKEN_WALKER:`ARACHNID WALKER`,SOVEREIGN_TITAN:`SOVEREIGN TITAN`}[e.chassis],primaryHex:e.primaryHex,accentHex:e.accentHex,trimHex:e.trimHex};let n=vu[e.name];n||=e.name.replace(`Warden`,`Charger Stallion`).replace(`Juggernaut`,`Chariot Unicorn`).replace(`Kraken`,`Pegasus Alicorn`).replace(`Sovereign`,`Crowned Alicorn`);let r=e.name.includes(`Stormwall`)||e.name.includes(`Volt`)||e.name.includes(`Kraken`)||e.name.includes(`Hyperion`);return{name:n,archetypeLabel:yu[e.chassis],primaryHex:r?1488978:1598706,accentHex:r?1598706:2017627,trimHex:e.chassis===`SOVEREIGN_TITAN`?16767053:16764728}}function xu(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new Yr;c.morphTargetsRelative=s;let l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0,p=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let t in d.morphAttributes){if(!i.has(t))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;if(d.morphAttributes[t].length!==e[0].morphAttributes[t].length)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have the same number of morph targets for the "`+t+`" morph attribute.`),null;o[t]===void 0&&(o[t]=[]),o[t].push(d.morphAttributes[t]),p++}if(p!==i.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of morph attributes.`),null;if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=Su(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t!==0){c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=Su(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}}return c}function Su(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new Pr(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}var Cu=1.02,wu=4.4;function Tu(e,t=48,n){let r=Math.max(1,e);n.vx=0,n.vz=-r,n.maxAge=Math.max(.15,t/r)}var Eu={1:{tier:1,name:`Sidearm Pistol`,shortBadge:`Lv1 PISTOL`,pattern:`SINGLE`,fireRate:3.4,damageMultiplier:1,projectileSpeed:31,pierceCount:1,spreadRadians:.03,colorHex:2685148,bossArmorFactor:1},2:{tier:2,name:`Tactical SMG`,shortBadge:`Lv2 SMG`,pattern:`SINGLE`,fireRate:5.5,damageMultiplier:1.06,projectileSpeed:35,pierceCount:1,spreadRadians:.042,colorHex:1629439,bossArmorFactor:1},3:{tier:3,name:`Assault Rifle`,shortBadge:`Lv3 RIFLE`,pattern:`BURST_2`,fireRate:4.5,damageMultiplier:1.68,projectileSpeed:38,pierceCount:1,spreadRadians:.038,colorHex:16749099,bossArmorFactor:1},4:{tier:4,name:`Rotary Minigun`,shortBadge:`Lv4 MINIGUN`,pattern:`TWIN_CONVERGE`,fireRate:6.6,damageMultiplier:1.62,projectileSpeed:40,pierceCount:1,spreadRadians:.038,colorHex:16731501,bossArmorFactor:1},5:{tier:5,name:`Plasma Pulse Rifle`,shortBadge:`Lv5 PLASMA`,pattern:`PIERCING`,fireRate:5,damageMultiplier:2.55,projectileSpeed:44,pierceCount:2,spreadRadians:.028,colorHex:3733247,bossArmorFactor:1.25}},Du={1:{...Eu[1],name:`Sparkle Star Wand`,shortBadge:`Lv1 STAR WAND`,colorHex:16735416},2:{...Eu[2],name:`Spiral Unicorn Horn`,shortBadge:`Lv2 UNI-HORN`,colorHex:14247679},3:{...Eu[3],name:`Pegasus Wing Wand`,shortBadge:`Lv3 WING WAND`,colorHex:16764736},4:{...Eu[4],name:`Rainbow Prism Horn`,shortBadge:`Lv4 PRISM HORN`,colorHex:16727450},5:{...Eu[5],name:`Royal Alicorn Wand`,shortBadge:`Lv5 ALICORN`,colorHex:16207359}};function Ou(e,t=`TACTICAL`){return t===`UNICORN`?Du[e]:Eu[e]}function ku(e,t,n=`TACTICAL`){return t>e?{equippedTier:t,upgraded:!0,lockedBonusTriggered:!1,bonusCoins:0,bonusSquad:0,bannerText:`${Ou(t,n).shortBadge} EQUIPPED!`}:{equippedTier:e,upgraded:!1,lockedBonusTriggered:!0,bonusCoins:25,bonusSquad:1,bannerText:n===`UNICORN`?`WAND LOCKED: +25 COINS`:`WEAPON LOCKED: +25 COINS`}}function Au(e){return e<=0?0:e<=6?e:e<=20?6+(e-6)*.78:16.92+(e-20)*.58}function ju(e,t,n,r){if(e<=0)return{visualSoldiers:0,activeEmitters:0,projectilesPerEmitter:0,damagePerProjectile:0,intervalSeconds:1};let i=Eu[t],a=Math.min(e,40),o=Math.min(a,40),s=Math.min(a,26),c=i.pattern===`BURST_2`||i.pattern===`TWIN_CONVERGE`?2:1,l=wu*r*i.damageMultiplier,u=Au(a)/s;return{visualSoldiers:o,activeEmitters:s,projectilesPerEmitter:c,damagePerProjectile:l/c*u,intervalSeconds:1/Math.max(.5,i.fireRate*n)}}function Z(e,t,n=0){e.attributes.normal||e.computeVertexNormals();let r=e.index?e.toNonIndexed():e.clone(),i=r.attributes.normal;for(let e=0;e<i.count;e++){let t=i.getX(e),n=i.getY(e),r=i.getZ(e),a=Math.max(1e-4,Math.hypot(t,n,r));i.setXYZ(e,t/a,n/a,r/a)}let a=r.attributes.position.count,o=new Float32Array(a*3),s=new Float32Array(a),c=new U(t);for(let e=0;e<a;e++)o[e*3]=c.r,o[e*3+1]=c.g,o[e*3+2]=c.b,s[e]=n;return r.setAttribute(`color`,new Pr(o,3)),r.setAttribute(`aSpinPart`,new Pr(s,1)),r.deleteAttribute(`uv`),r}var Mu=.255,Nu=.575;function Pu(e){let t=[],n=Mu,r=Nu,i=16775164,a=16747220,o=16723603,s=16764728,c=13073919,l=6616530,u=5691647;if(e===1){let e=new q(.022,.028,.48,8);e.rotateX(Math.PI/2),e.translate(n,.585,-.34),t.push(Z(e,a));let r=new q(.032,.032,.16,8);r.rotateX(Math.PI/2),r.translate(n,.585,-.22),t.push(Z(r,o));let c=new Da(.046,0);c.translate(n,.585,-.11),t.push(Z(c,s));let l=new q(.042,.034,.055,8);l.rotateX(Math.PI/2),l.translate(n,.585,-.56),t.push(Z(l,s));for(let e=0;e<5;e++){let r=e/5*Math.PI*2-Math.PI/2,i=new J(.038,.135,4);i.translate(0,.068,0),i.rotateZ(r),i.translate(n,.595,-.61),t.push(Z(i,s))}let u=new Da(.052,0);u.translate(n,.595,-.61),t.push(Z(u,o));let d=new J(.028,.12,6);d.rotateX(-Math.PI/2),d.translate(n,.595,-.69),t.push(Z(d,i))}else if(e===2){let e=new q(.038,.044,.22,8);e.rotateX(Math.PI/2),e.translate(n,.585,-.23),t.push(Z(e,o));let u=new ja(.068,.02,6,10);u.translate(n,.59,-.34),t.push(Z(u,s));for(let[e,i,o]of[[-.045,.055,a],[.045,.055,c],[0,.075,l]]){let a=new K(.048,.058,.12);a.rotateX(.28),a.translate(n+e,r+i,-.3),t.push(Z(a,o))}let d=new J(.062,.56,8);d.rotateX(-Math.PI/2),d.translate(n,.595,-.62),t.push(Z(d,i));for(let e=0;e<5;e++){let r=new ja(.056*(1-e/5*.72),.012,6,8);r.rotateY(.38),r.rotateZ(e*.65),r.translate(n,.595,-.39-e*.095),t.push(Z(r,e%2==0?s:a))}}else if(e===3){let e=new q(.024,.03,.62,8);e.rotateX(Math.PI/2),e.translate(n,.585,-.38),t.push(Z(e,s));let r=new q(.034,.034,.22,8);r.rotateX(Math.PI/2),r.translate(n,.585,-.26),t.push(Z(r,o));let c=new Da(.075,0);c.scale(1.1,1.15,.9),c.translate(n,.61,-.58),t.push(Z(c,o));for(let e of[-1,1])for(let r=0;r<3;r++){let o=new K(.13-r*.022,.034,.055);o.rotateZ(e*(.42+r*.22)),o.rotateY(-e*.28),o.translate(n+e*(.095+r*.032),.6399999999999999+r*.038,-.56+r*.025),t.push(Z(o,r===0?i:a))}let l=new J(.044,.36,7);l.rotateX(-Math.PI/2),l.translate(n,.605,-.82),t.push(Z(l,i));let u=new ja(.042,.012,6,8);u.translate(n,.605,-.7),t.push(Z(u,s))}else if(e===4){let e=new q(.082,.088,.28,10);e.rotateX(Math.PI/2),e.translate(n,.5549999999999999,-.31),t.push(Z(e,o));let r=new Da(.105,1);r.translate(.275,.44499999999999995,-.34),t.push(Z(r,c));let i=new K(.085,.034,.22);i.translate(n,.6699999999999999,-.34),t.push(Z(i,s));let d=[o,s,l,u,c,a],f=.5549999999999999;for(let e=0;e<6;e++){let r=e/6*Math.PI*2,i=n+Math.cos(r)*.058,a=f+Math.sin(r)*.058,o=new J(.024,.58,6);o.rotateX(-Math.PI/2),o.translate(i,a,-.73),t.push(Z(o,d[e],1))}for(let e of[-.54,-.84]){let r=new q(.086,.086,.034,10);r.rotateX(Math.PI/2),r.translate(n,f,e),t.push(Z(r,s,1))}}else{let e=new q(.032,.038,.44,8);e.rotateX(Math.PI/2),e.translate(n,.575,-.26),t.push(Z(e,o));let r=new Da(.068,0);r.translate(n,.485,-.36),t.push(Z(r,c));let d=new K(.105,.115,.16);d.translate(n,.63,-.46),t.push(Z(d,i));let f=new K(.082,.078,.11);f.rotateX(.15),f.translate(n,.61,-.57),t.push(Z(f,i));for(let e of[-1,1]){let r=new J(.024,.075,4);r.rotateX(-.2),r.translate(n+e*.038,.72,-.43),t.push(Z(r,a))}let p=new J(.042,.065,5);p.translate(n,.715,-.49),t.push(Z(p,s));for(let[e,r]of[[-.37,o],[-.41,s],[-.45,u]]){let i=new K(.046,.065,.048);i.translate(n,.7,e),t.push(Z(i,r))}let m=new J(.054,.56,8);m.rotateX(-Math.PI/2),m.translate(n,.6499999999999999,-.84),t.push(Z(m,i));let h=new J(.032,.52,6);h.rotateX(-Math.PI/2),h.translate(n,.6499999999999999,-.86),t.push(Z(h,u));for(let[e,r]of[[-.65,s],[-.8,o],[-.95,l]]){let i=new ja(.068,.014,6,10);i.translate(n,.6499999999999999,e),t.push(Z(i,r))}}let d=xu(t,!1);for(let e of t)e.dispose();return d.translate(-.255,-.5549999999999999,.28),d.scale(1.36,1.36,1.36),d.translate(n,.5549999999999999,-.28),Ru(d,`aSpinPart`),d}function Fu(e,t=`TACTICAL`){if(t===`UNICORN`)return Pu(e);let n=[],r=Mu,i=2502717,a=8821424,o=1580582;if(e===1){let e=new K(.056,.052,.24);e.translate(r,.565,-.31),n.push(Z(e,o));let t=new K(.062,.056,.26);t.translate(r,.607,-.32),n.push(Z(t,a));let s=new K(.058,.052,.065);s.translate(r,.603,-.47),n.push(Z(s,16103470));let c=new q(.018,.018,.085,8);c.rotateX(Math.PI/2),c.translate(r,.5469999999999999,-.4),n.push(Z(c,16770688));let l=new K(.05,.12,.068);l.rotateX(.22),l.translate(r,.51,-.22),n.push(Z(l,i));let u=new K(.054,.022,.024);u.translate(r,.643,-.21),n.push(Z(u,16767066))}else if(e===2){let e=new K(.072,.095,.38);e.translate(r,.59,-.34),n.push(Z(e,i));let t=new K(.052,.024,.34);t.translate(r,.6469999999999999,-.34),n.push(Z(t,16770669));let s=new K(.064,.054,.085);s.translate(r,.6799999999999999,-.31),n.push(Z(s,a));let c=new q(.028,.028,.2,10);c.rotateX(Math.PI/2),c.translate(r,.593,-.61),n.push(Z(c,a));let l=new K(.044,.2,.062);l.rotateX(-.26),l.translate(r,.46499999999999997,-.39),n.push(Z(l,16103470));let u=new q(.018,.02,.1,8);u.translate(r,.49999999999999994,-.49),n.push(Z(u,o))}else if(e===3){let e=new K(.078,.096,.48);e.translate(r,.597,-.38),n.push(Z(e,3885145));let t=new K(.074,.082,.28);t.translate(r,.595,-.68),n.push(Z(t,14715692));let s=new q(.02,.022,.24,8);s.rotateX(Math.PI/2),s.translate(r,.599,-.89),n.push(Z(s,a));let c=new K(.048,.044,.075);c.translate(r,.599,-1.01),n.push(Z(c,16756290));let l=new q(.032,.028,.17,10);l.rotateX(Math.PI/2),l.translate(r,.6799999999999999,-.36),n.push(Z(l,i));let u=new q(.026,.026,.02,10);u.rotateX(Math.PI/2),u.translate(r,.6799999999999999,-.45),n.push(Z(u,16756290));let d=new K(.048,.19,.082);d.rotateX(-.22),d.translate(r,.47,-.44),n.push(Z(d,i));let f=new K(.068,.11,.19);f.translate(r,.58,-.11),n.push(Z(f,o))}else if(e===4){let e=new q(.095,.1,.3,12);e.rotateX(Math.PI/2),e.translate(r,.5549999999999999,-.32),n.push(Z(e,i));let t=new q(.115,.115,.18,12);t.rotateZ(Math.PI/2),t.translate(.28500000000000003,.43999999999999995,-.34),n.push(Z(t,15100959));let o=new K(.09,.032,.24);o.translate(r,.6749999999999999,-.35),n.push(Z(o,16752451));let s=.5549999999999999;for(let e=0;e<6;e++){let t=e/6*Math.PI*2,i=r+Math.cos(t)*.056,o=s+Math.sin(t)*.056,c=new q(.015,.015,.56,6);c.rotateX(Math.PI/2),c.translate(i,o,-.73),n.push(Z(c,a,1))}for(let e of[-.66,-.94]){let t=new q(.084,.084,.038,12);t.rotateX(Math.PI/2),t.translate(r,s,e),n.push(Z(t,16747576,1))}}else{let e=new K(.092,.115,.48);e.translate(r,.585,-.34),n.push(Z(e,1976632));let t=new K(.068,.036,.54);t.translate(r,.6509999999999999,-.76),n.push(Z(t,a));let i=new K(.068,.034,.5);i.translate(r,.5409999999999999,-.74),n.push(Z(i,a));let o=new K(.044,.048,.56);o.translate(r,.597,-.75),n.push(Z(o,3733247));for(let e of[-.58,-.74,-.9]){let t=new K(.104,.118,.034);t.translate(r,.597,e),n.push(Z(t,7403775))}let s=new q(.042,.042,.18,10);s.rotateX(-.2),s.translate(r,.475,-.4),n.push(Z(s,1692902));let c=new K(.084,.062,.14);c.translate(r,.6829999999999999,-.35),n.push(Z(c,3733247))}let s=xu(n,!1);for(let e of n)e.dispose();return s.translate(-.255,-.5549999999999999,.28),s.scale(1.34,1.34,1.34),s.translate(r,.5549999999999999,-.28),Ru(s,`aSpinPart`),s}function Iu(e){let t=new H,n=null,r=Ou(e,`UNICORN`).colorHex,i=new Y({color:16775421,emissive:4201016,emissiveIntensity:.22,roughness:.2,metalness:.28}),a=new Y({color:16745936,emissive:6033472,emissiveIntensity:.24,roughness:.28,metalness:.22}),o=new Y({color:16723603,emissive:8392520,emissiveIntensity:.34,roughness:.26,metalness:.3}),s=new Y({color:16764728,emissive:7227392,emissiveIntensity:.28,roughness:.24,metalness:.56}),c=new W({color:r});if(e===1){let e=new G(new q(.042,.052,.86,12),a);e.rotation.z=Math.PI/2,e.position.set(-.12,.04,0);let n=new G(new q(.062,.062,.32,12),o);n.rotation.z=Math.PI/2,n.position.set(-.34,.04,0);let r=new G(new Da(.095,0),s);r.position.set(-.56,.04,0);let i=new G(new q(.072,.056,.1,12),s);i.rotation.z=Math.PI/2,i.position.set(.28,.04,0);let l=new H;l.position.set(.42,.04,0);for(let e=0;e<5;e++){let t=e/5*Math.PI*2+Math.PI/2,n=new J(.078,.28,4);n.translate(0,.14,0);let r=new G(n,s);r.rotation.z=t,l.add(r)}let u=new G(new Da(.11,0),c);l.add(u),t.add(e,n,r,i,l)}else if(e===2){let e=new G(new q(.072,.082,.38,12),o);e.rotation.z=Math.PI/2,e.position.set(-.42,.03,0);let n=new G(new Da(.095,0),s);n.position.set(-.64,.03,0);let r=new G(new ja(.13,.036,8,16),s);r.rotation.y=Math.PI/2,r.position.set(-.22,.03,0);let l=new Y({color:13073919,roughness:.28,metalness:.2});for(let[e,n,r]of[[.12,0,a],[.08,.09,l],[.08,-.09,l]]){let i=new G(new K(.22,.09,.08),r);i.rotation.z=.32,i.position.set(-.28,e,n),t.add(i)}let u=new J(.125,1.04,14);u.rotateZ(-Math.PI/2);let d=new G(u,i);d.position.set(.3,.03,0);for(let e=0;e<6;e++){let n=new G(new ja(.115*(1-e/6*.74),.022,8,14),e%2==0?s:c);n.rotation.y=Math.PI/2+.35,n.rotation.x=e*.7,n.position.set(-.12+e*.15,.03,0),t.add(n)}t.add(e,n,r,d)}else if(e===3){let e=new G(new q(.048,.058,1.12,12),s);e.rotation.z=Math.PI/2,e.position.set(-.14,.02,0);let n=new G(new q(.068,.068,.36,12),o);n.rotation.z=Math.PI/2,n.position.set(-.42,.02,0);let r=new G(new Da(.16,0),o);r.position.set(.28,.06,0);for(let e of[-1,1])for(let n=0;n<3;n++){let r=new G(new K(.24-n*.04,.09,.05),n===0?i:a);r.rotation.z=.42+n*.18,r.rotation.y=e*(.55+n*.12),r.position.set(.22-n*.05,.15+n*.09,e*(.14+n*.07)),t.add(r)}let l=new J(.088,.68,12);l.rotateZ(-Math.PI/2);let u=new G(l,i);u.position.set(.72,.05,0);let d=new G(new ja(.11,.022,8,16),c);d.rotation.y=Math.PI/2,d.position.set(.48,.05,0),t.add(e,n,r,u,d)}else if(e===4){let e=new G(new q(.18,.19,.48,14),o);e.rotation.z=Math.PI/2,e.position.set(-.28,.02,0);let r=new G(new Da(.21,1),c);r.position.set(-.22,-.23,0);let i=new G(new K(.3,.06,.18),s);i.position.set(-.16,.25,0);let l=new G(new K(.15,.26,.11),a);l.position.set(-.58,.05,0),l.rotation.z=-.24,n=new H,n.position.set(0,.02,0);let u=[16723603,16764728,5436088,5032432,13073919,16747220],d=new J(.048,.94,10);d.rotateZ(-Math.PI/2);for(let e=0;e<6;e++){let t=e/6*Math.PI*2,r=new G(d,new Y({color:u[e],emissive:u[e],emissiveIntensity:.3,roughness:.24,metalness:.26}));r.position.set(.46,Math.cos(t)*.12,Math.sin(t)*.12),n.add(r)}for(let e of[.24,.66]){let t=new G(new ja(.155,.026,8,16),s);t.rotation.y=Math.PI/2,t.position.set(e,0,0),n.add(t)}t.add(e,r,i,l,n)}else{let e=new G(new q(.068,.078,.78,12),o);e.rotation.z=Math.PI/2,e.position.set(-.36,0,0);let n=new G(new Da(.12,0),s);n.position.set(-.78,0,0);let r=new G(new K(.3,.24,.2),i);r.position.set(.02,.09,0);let l=new G(new K(.22,.16,.15),i);l.rotation.z=-.14,l.position.set(.22,.05,0);for(let e of[-1,1]){let n=new G(new J(.048,.15,4),a);n.rotation.z=.22,n.position.set(-.04,.27,e*.068),t.add(n)}let u=new G(new J(.075,.14,5),s);u.position.set(.08,.27,0);let d=[16723603,16764728,5691647,13073919];for(let e=0;e<d.length;e++){let n=new W({color:d[e]}),r=new G(new K(.09,.13,.09),n);r.rotation.z=.35,r.position.set(-.14-e*.09,.19-e*.025,0),t.add(r)}let f=new J(.11,.94,14);f.rotateZ(-Math.PI/2);let p=new G(f,i);p.position.set(.66,.13,0);for(let[e,n]of[[.36,s],[.62,c],[.86,s]]){let r=new G(new ja(.14,.024,8,18),n);r.rotation.y=Math.PI/2,r.position.set(e,.13,0),t.add(r)}t.add(e,n,r,l,u,p)}return{tier:e,root:t,spinCluster:n}}function Lu(e,t=`TACTICAL`){if(t===`UNICORN`)return Iu(e);let n=new H,r=null,i=Ou(e,`TACTICAL`).colorHex,a=new Y({color:2502975,roughness:.34,metalness:.48}),o=new Y({color:9413560,roughness:.26,metalness:.5}),s=new Y({color:1448738,roughness:.68,metalness:.14}),c=new Y({color:i,emissive:i,emissiveIntensity:e===5?.65:.28,roughness:.28,metalness:.36}),l=new W({color:i});if(e===1){let e=new G(new K(.66,.15,.12),o);e.position.set(.04,.12,0);let t=new G(new K(.58,.1,.11),a);t.position.set(.01,.01,0);let r=new G(new K(.14,.145,.115),c);r.position.set(.42,.115,0);let i=new G(new q(.032,.032,.1,12),a);i.rotation.z=Math.PI/2,i.position.set(.51,.12,0);let u=new G(new K(.16,.36,.105),s);u.position.set(-.18,-.17,0),u.rotation.z=.24;let d=new G(new K(.18,.05,.115),c);d.position.set(-.23,-.35,0),d.rotation.z=.24;let f=new G(new K(.16,.09,.04),a);f.position.set(-.02,-.08,0);let p=new G(new q(.042,.042,.2,12),a);p.rotation.z=Math.PI/2,p.position.set(.22,-.05,0);let m=new G(new q(.036,.036,.02,12),l);m.rotation.z=Math.PI/2,m.position.set(.325,-.05,0);let h=new G(new K(.04,.045,.04),l);h.position.set(.34,.21,0);let g=new G(new K(.05,.045,.09),c);g.position.set(-.24,.21,0),n.add(e,t,r,i,u,d,f,p,m,h,g)}else if(e===2){let e=new G(new K(.68,.2,.13),a);e.position.set(0,.08,0);let t=new G(new K(.62,.045,.138),c);t.position.set(.01,.14,0);let r=new G(new q(.058,.058,.38,14),o);r.rotation.z=Math.PI/2,r.position.set(.51,.09,0);let i=new G(new K(.2,.11,.11),s);i.position.set(-.02,.23,0);let u=new G(new K(.03,.08,.09),l);u.position.set(.06,.24,0);let d=new G(new K(.14,.3,.1),s);d.position.set(-.16,-.14,0),d.rotation.z=.22;let f=new G(new K(.12,.44,.088),c);f.position.set(.14,-.22,0),f.rotation.z=-.24;let p=new G(new q(.036,.04,.22,10),s);p.position.set(.29,-.12,0);let m=new G(new K(.3,.04,.09),o);m.position.set(-.46,.09,0);let h=new G(new K(.06,.24,.1),s);h.position.set(-.62,.04,0),n.add(e,t,r,i,u,d,f,p,m,h)}else if(e===3){let e=new G(new K(.76,.22,.14),a);e.position.set(-.04,.08,0);let t=new G(new K(.46,.17,.135),c);t.position.set(.48,.09,0);let r=new G(new q(.036,.04,.4,12),o);r.rotation.z=Math.PI/2,r.position.set(.86,.1,0);let i=new G(new K(.13,.09,.09),a);i.position.set(1.06,.1,0);let u=new G(new q(.062,.052,.32,12),s);u.rotation.z=Math.PI/2,u.position.set(-.02,.26,0);let d=new G(new q(.05,.05,.02,12),l);d.rotation.z=Math.PI/2,d.position.set(.145,.26,0);let f=new G(new K(.16,.4,.095),o);f.position.set(.12,-.2,0),f.rotation.z=-.2;let p=new G(new K(.14,.3,.1),s);p.position.set(-.2,-.14,0),p.rotation.z=.24;let m=new G(new K(.42,.23,.12),s);m.position.set(-.6,.05,0);let h=new G(new K(.24,.06,.126),c);h.position.set(-.56,.17,0),n.add(e,t,r,i,u,d,f,p,m,h)}else if(e===4){let e=new G(new q(.2,.21,.52,16),a);e.rotation.z=Math.PI/2,e.position.set(-.26,.02,0);let t=new G(new q(.23,.23,.34,16),c);t.rotation.x=Math.PI/2,t.position.set(-.22,-.24,0);let i=new G(new K(.32,.055,.22),o);i.position.set(-.12,.28,0);let l=new G(new K(.05,.14,.04),s);l.position.set(-.12,.21,.09);let u=new G(new K(.05,.14,.04),s);u.position.set(-.12,.21,-.09);let d=new G(new K(.16,.26,.12),s);d.position.set(-.58,.06,0),d.rotation.z=-.25,r=new H,r.position.set(0,.02,0);let f=new q(.028,.028,.94,8);f.rotateZ(Math.PI/2);for(let e=0;e<6;e++){let t=e/6*Math.PI*2,n=new G(f,o);n.position.set(.47,Math.cos(t)*.115,Math.sin(t)*.115),r.add(n)}for(let e of[.34,.78]){let t=new G(new q(.165,.165,.065,16),c);t.rotation.z=Math.PI/2,t.position.set(e,0,0),r.add(t)}n.add(e,t,i,l,u,d,r)}else{let e=new G(new K(.76,.25,.17),a);e.position.set(-.18,.05,0);let t=new G(new K(.86,.068,.13),o);t.position.set(.54,.15,0);let r=new G(new K(.8,.062,.13),o);r.position.set(.51,-.04,0);let i=new G(new K(.92,.075,.085),l);i.position.set(.48,.055,0);for(let e of[.22,.48,.74]){let t=new G(new ja(.145,.026,8,18),c);t.rotation.y=Math.PI/2,t.position.set(e,.055,0),n.add(t)}let u=new G(new q(.078,.078,.34,14),c);u.position.set(-.04,-.2,0),u.rotation.z=-.22;let d=new G(new K(.28,.11,.14),a);d.position.set(-.12,.24,0);let f=new G(new K(.18,.055,.15),l);f.position.set(-.12,.24,0);let p=new G(new K(.36,.22,.14),s);p.position.set(-.68,.02,0),n.add(e,t,r,i,u,d,f,p)}return{tier:e,root:n,spinCluster:r}}function Ru(e,t){let n=e.attributes.position,r=e.attributes.normal,i=t?e.attributes[t]:void 0,a=n.count,o=new Map,s=Array(a);for(let e=0;e<a;e++){let t=Math.round(n.getX(e)*800),a=Math.round(n.getY(e)*800),c=Math.round(n.getZ(e)*800),l=`${i?Math.round(i.getX(e)*10):0}:${t},${a},${c}`;s[e]=l;let u=r.getX(e),d=r.getY(e),f=r.getZ(e),p=o.get(l);p?(p[0]+=u,p[1]+=d,p[2]+=f):(p=[u,d,f],o.set(l,p))}let c=new Float32Array(a*3);for(let e=0;e<a;e++){let t=o.get(s[e]),n=t[0],i=t[1],a=t[2],l=Math.hypot(n,i,a);l<1e-4&&(n=r.getX(e),i=r.getY(e),a=r.getZ(e),l=Math.max(1e-4,Math.hypot(n,i,a))),c[e*3]=n/l,c[e*3+1]=i/l,c[e*3+2]=a/l}e.setAttribute(`aOutlineNormal`,new Pr(c,3))}function Q(e,t,n=0){e.attributes.normal||e.computeVertexNormals();let r=e.index?e.toNonIndexed():e.clone(),i=r.attributes.normal;for(let e=0;e<i.count;e++){let t=i.getX(e),n=i.getY(e),r=i.getZ(e),a=Math.max(1e-4,Math.hypot(t,n,zu(r)));i.setXYZ(e,t/a,n/a,r/a)}let a=r.attributes.position.count,o=new Float32Array(a*3),s=new Float32Array(a),c=new U(t);for(let e=0;e<a;e++)o[e*3]=c.r,o[e*3+1]=c.g,o[e*3+2]=c.b,s[e]=n;return r.setAttribute(`color`,new Pr(o,3)),r.setAttribute(`aPartId`,new Pr(s,1)),r.deleteAttribute(`uv`),r}function zu(e){return Number.isFinite(e)?e:0}function Bu(){let e=[],t=1583165,n=6981800,r=2376294,i=8825036,a=988964,o=2685148;for(let[r,i]of[[-1,1],[1,2]]){let o=r*.106,s=new K(.118,.18,.128);s.rotateX(-.12),s.rotateZ(-r*.04),s.translate(o,.3,-.012),e.push(Q(s,t,i));let c=new K(.098,.13,.045);c.rotateX(-.12),c.translate(o*1.04,.305,-.068),e.push(Q(c,n,i));let l=new q(.056,.048,.17,6);l.rotateX(.14),l.translate(o*1.03,.14,.004),e.push(Q(l,n,i));let u=new K(.11,.078,.175);u.translate(o*1.03,.042,-.026),e.push(Q(u,a,i))}let s=new q(.146,.13,.105,6);s.scale(1.12,1,.86),s.translate(0,.4,0),e.push(Q(s,t,0));let c=new K(.31,.046,.23);c.translate(0,.435,0),e.push(Q(c,a,0));let l=new q(.185,.142,.33,6);l.scale(1.14,1,.86),l.translate(0,.568,0),e.push(Q(l,t,0));let u=new K(.32,.21,.185);u.translate(0,.595,-.015),e.push(Q(u,n,0));let d=new K(.12,.23,.058);d.translate(0,.59,.102),e.push(Q(d,r,0));let f=new K(.036,.16,.025);f.translate(0,.595,.132),e.push(Q(f,o,0));let p=new K(.09,.07,.03);p.translate(0,.6,-.112),e.push(Q(p,o,0));for(let t of[-1,1]){let n=new K(.125,.088,.165);n.rotateZ(-t*.22),n.translate(t*.205,.685,-.005),e.push(Q(n,r,0));let i=new K(.132,.024,.145);i.rotateZ(-t*.22),i.translate(t*.212,.718,-.005),e.push(Q(i,o,0))}let m=new q(.095,.115,.085,6);m.translate(0,.745,-.005),e.push(Q(m,a,0));let h=new q(.138,.172,.195,6);h.scale(1.04,1,1.1),h.translate(0,.865,-.008),e.push(Q(h,r,0));let g=new q(.082,.138,.068,6);g.scale(1.04,1,1.1),g.translate(0,.985,-.008),e.push(Q(g,n,0));let _=new K(.048,.065,.24);_.rotateX(.14),_.translate(0,1.015,.005),e.push(Q(_,i,0));let v=new K(.255,.068,.11);v.translate(0,.872,-.132),e.push(Q(v,o,0));for(let t of[-1,1]){let n=new K(.032,.155,.072);n.rotateZ(-t*.26),n.rotateX(-.24),n.translate(t*.175,.945,.032),e.push(Q(n,i,0))}let y=new K(.095,.175,.095);y.rotateZ(.32),y.rotateX(.48),y.translate(.215,.61,-.05),e.push(Q(y,t,4));let b=new K(.088,.185,.088);b.rotateX(1.28),b.rotateY(-.08),b.translate(.255,.555,-.165),e.push(Q(b,n,4));let x=new K(.095,.09,.095);x.translate(.255,.55,-.245),e.push(Q(x,a,4));let S=new K(.092,.185,.092);S.rotateX(.82),S.rotateZ(-.55),S.translate(-.145,.6,-.095),e.push(Q(S,t,4));let C=new K(.084,.23,.084);C.rotateX(1.38),C.rotateZ(-.95),C.translate(.075,.56,-.285),e.push(Q(C,n,4));let w=new K(.092,.088,.092);w.translate(.235,.56,-.405),e.push(Q(w,a,4));let T=xu(e,!1);for(let t of e)t.dispose();return Ru(T,`aPartId`),T}function Vu(){let e=[],t=15213144,n=11015230,r=2235184,i=3819097,a=16758830;for(let[n,i]of[[-1,1],[1,2]]){let a=n*.102,o=new K(.112,.175,.12);o.translate(a,.3,0),e.push(Q(o,r,i));let s=new q(.058,.046,.175,6);s.translate(a,.135,.005),e.push(Q(s,t,i));let c=new K(.108,.075,.17);c.translate(a,.042,.032),e.push(Q(c,r,i))}let o=new q(.148,.132,.11,6);o.scale(1.14,1,.86),o.translate(0,.4,0),e.push(Q(o,n,0));let s=new q(.19,.14,.33,6);s.scale(1.18,1,.86),s.translate(0,.565,0),e.push(Q(s,r,0));let c=new K(.33,.21,.18);c.translate(0,.59,.02),e.push(Q(c,t,0));let l=new K(.095,.075,.032);l.translate(0,.595,.115),e.push(Q(l,a,0));for(let t of[-1,1]){let r=new J(.095,.21,4);r.rotateZ(-t*.62),r.translate(t*.225,.7,.01),e.push(Q(r,n,0))}let u=new q(.085,.1,.085,6);u.translate(0,.75,.01),e.push(Q(u,i,0));let d=new q(.135,.165,.2,6);d.scale(1.04,1,1.08),d.translate(0,.87,.01),e.push(Q(d,r,0));let f=new K(.22,.14,.08);f.translate(0,.865,.125),e.push(Q(f,t,0));let p=new K(.21,.052,.045);p.translate(0,.878,.155),e.push(Q(p,a,0));for(let t of[-1,1]){let n=new J(.044,.23,5);n.rotateZ(-t*.44),n.rotateX(-.22),n.translate(t*.155,1.015,-.01),e.push(Q(n,13162214,0))}let m=new K(.092,.24,.092);m.rotateX(-.95),m.translate(.185,.56,.13),e.push(Q(m,n,4));let h=new K(.088,.24,.088);h.rotateX(-1.05),h.rotateZ(.38),h.translate(-.14,.56,.16),e.push(Q(h,n,4));let g=new K(.072,.096,.44);g.translate(.1,.55,.31),e.push(Q(g,i,4));let _=xu(e,!1);for(let t of e)t.dispose();return Ru(_,`aPartId`),_}function Hu(){let e=[],t=2497850,n=13900884,r=10400972,i=16755236,a=1251106,o=4016990;for(let[r,i]of[[-1,1],[1,2]]){let o=r*.138,s=new K(.155,.19,.165);s.translate(o,.31,0),e.push(Q(s,t,i));let c=new J(.068,.13,4);c.rotateX(Math.PI/2),c.translate(o,.215,.105),e.push(Q(c,n,i));let l=new q(.084,.074,.18,6);l.translate(o,.13,0),e.push(Q(l,n,i));let u=new K(.15,.088,.21);u.translate(o,.045,.04),e.push(Q(u,a,i))}let s=new q(.205,.185,.13,6);s.scale(1.18,1,.88),s.translate(0,.41,0),e.push(Q(s,a,0));let c=new q(.265,.195,.38,6);c.scale(1.26,1,.94),c.translate(0,.59,0),e.push(Q(c,t,0));let l=new K(.42,.27,.23);l.translate(0,.605,.048),e.push(Q(l,n,0));let u=new q(.075,.075,.05,6);u.rotateX(Math.PI/2),u.translate(0,.615,.168),e.push(Q(u,i,0));for(let n of[-1,1]){let i=new K(.22,.16,.24);i.rotateZ(-n*.22),i.translate(n*.315,.705,.02),e.push(Q(i,t,0));let a=new J(.058,.19,5);a.rotateZ(-n*.38),a.translate(n*.355,.835,.02),e.push(Q(a,r,0))}let d=new q(.18,.21,.095,6);d.translate(0,.79,.02),e.push(Q(d,o,0));let f=new q(.165,.195,.22,6);f.scale(1.08,1,1.12),f.translate(0,.905,.025),e.push(Q(f,n,0));let p=new K(.26,.062,.06);p.translate(0,.9,.19),e.push(Q(p,i,0));for(let n of[-1,1]){let i=new J(.055,.27,5);i.rotateZ(-n*.48),i.rotateX(-.18),i.translate(n*.195,1.055,0),e.push(Q(i,r,0));let a=new K(.13,.26,.13);a.rotateX(-.92),a.rotateZ(-n*.22),a.translate(n*.25,.56,.16),e.push(Q(a,t,4))}let m=new K(.17,.14,.52);m.translate(0,.5,.34),e.push(Q(m,o,4));for(let t of[-.042,.042]){let n=new q(.026,.026,.28,6);n.rotateX(Math.PI/2),n.translate(t,.51,.65),e.push(Q(n,i,4))}let h=xu(e,!1);for(let t of e)t.dispose();return Ru(h,`aPartId`),h}function Uu(){let e=[],t=16724889,n=16747220,r=14227056,i=16774651,a=16764728,o=16766136;for(let[n,a]of[[-1,1],[1,2]]){let o=n*.102,s=new q(.052,.048,.17,7);s.translate(o,.295,-.008),e.push(Q(s,16763878,a));let c=new q(.056,.048,.165,7);c.translate(o*1.02,.14,.002),e.push(Q(c,i,a));let l=new q(.062,.058,.042,7);l.translate(o*1.02,.215,.002),e.push(Q(l,t,a));let u=new K(.104,.072,.168);u.translate(o*1.02,.04,-.024),e.push(Q(u,r,a))}let s=new q(.125,.238,.175,8);s.scale(1.08,1,.96),s.translate(0,.405,.005),e.push(Q(s,t,3));let c=new q(.228,.246,.032,8);c.scale(1.08,1,.96),c.translate(0,.328,.005),e.push(Q(c,i,3));for(let t of[-1,1]){let r=new K(.095,.068,.042);r.rotateZ(t*.28),r.translate(t*.058,.465,.135),e.push(Q(r,n,3))}let l=new q(.132,.138,.052,8);l.translate(0,.478,0),e.push(Q(l,a,0));let u=new q(.162,.128,.24,8);u.scale(1.08,1,.88),u.translate(0,.595,0),e.push(Q(u,t,0));let d=new K(.28,.055,.2);d.translate(0,.695,.005),e.push(Q(d,i,0));let f=new Da(.052,0);f.translate(0,.615,-.118),e.push(Q(f,a,0));for(let t of[-1,1]){let r=new Zi(.088,0);r.translate(t*.188,.675,-.005),e.push(Q(r,n,0))}let p=new q(.068,.078,.075,7);p.translate(0,.742,-.005),e.push(Q(p,o,0));let m=new q(.115,.098,.13,8);m.translate(0,.825,-.02),e.push(Q(m,o,0));let h=new q(.145,.176,.19,8);h.scale(1.04,1,1.08),h.translate(0,.885,0),e.push(Q(h,t,0));let g=new q(.086,.145,.072,8);g.scale(1.04,1,1.08),g.translate(0,1.005,0),e.push(Q(g,n,0));let _=new K(.28,.036,.25);_.translate(0,.935,-.01),e.push(Q(_,i,0));let v=new K(.245,.064,.105);v.translate(0,.868,-.132),e.push(Q(v,7534824,0));let y=new J(.048,.085,5);y.translate(0,1.045,-.09),e.push(Q(y,a,0));for(let t of[-1,1]){let n=new J(.052,.125,4);n.rotateZ(-t*.24),n.translate(t*.125,1.065,-.01),e.push(Q(n,i,0));let a=new K(.078,.068,.052);a.rotateZ(t*.35),a.translate(t*.148,.845,.135),e.push(Q(a,r,0));let o=new J(.064,.22,6);o.rotateX(-.72),o.rotateZ(-t*.34),o.translate(t*.185,.775,.205),e.push(Q(o,16765530,0))}let b=new K(.086,.17,.086);b.rotateZ(.32),b.rotateX(.48),b.translate(.21,.61,-.05),e.push(Q(b,t,4));let x=new K(.08,.18,.08);x.rotateX(1.28),x.rotateY(-.08),x.translate(.255,.555,-.165),e.push(Q(x,n,4));let S=new K(.088,.085,.088);S.translate(.255,.55,-.245),e.push(Q(S,i,4));let C=new K(.084,.18,.084);C.rotateX(.82),C.rotateZ(-.55),C.translate(-.14,.6,-.095),e.push(Q(C,t,4));let w=new K(.078,.225,.078);w.rotateX(1.38),w.rotateZ(-.95),w.translate(.075,.56,-.285),e.push(Q(w,n,4));let T=new K(.086,.084,.086);T.translate(.235,.56,-.405),e.push(Q(T,i,4));let E=xu(e,!1);for(let t of e)t.dispose();return Ru(E,`aPartId`),E}function Wu(){let e=[],t=1732095,n=1197240,r=1758828,i=15792127,a=16763814;for(let[t,o]of[[-1,1],[1,2]]){let s=t*.102,c=new K(.116,.145,.124);c.translate(s,.315,0),e.push(Q(c,n,o));let l=new q(.048,.042,.155,6);l.translate(s,.155,.004),e.push(Q(l,a,o));let u=new K(.108,.075,.172);u.translate(s,.042,.032),e.push(Q(u,i,o));let d=new K(.112,.026,.176);d.translate(s,.015,.032),e.push(Q(d,r,o))}let o=new q(.146,.136,.11,7);o.scale(1.12,1,.88),o.translate(0,.4,0),e.push(Q(o,n,0));let s=new q(.178,.142,.32,7);s.scale(1.14,1,.88),s.translate(0,.565,0),e.push(Q(s,t,0));let c=new K(.3,.15,.185);c.translate(0,.6,.015),e.push(Q(c,r,0));let l=new K(.22,.042,.19);l.translate(0,.7,.01),e.push(Q(l,i,0));for(let t of[-1,1]){let n=new K(.11,.11,.13);n.rotateZ(-t*.2),n.translate(t*.195,.665,.01),e.push(Q(n,r,0))}let u=new q(.122,.112,.175,8);u.translate(0,.835,.015),e.push(Q(u,a,0));let d=new K(.24,.08,.14);d.translate(0,.855,-.02),e.push(Q(d,4861725,0));for(let t of[-1,1]){let n=new K(.036,.038,.03);n.translate(t*.046,.835,.125),e.push(Q(n,1055792,0))}let f=new q(.132,.154,.135,8);f.scale(1.04,1,1.08),f.translate(0,.935,.008),e.push(Q(f,t,0));let p=new K(.24,.034,.16);p.rotateX(.12),p.translate(0,.892,.145),e.push(Q(p,r,0));let m=new K(.23,.052,.06);m.translate(0,.945,.135),e.push(Q(m,16769095,0));let h=new K(.088,.23,.088);h.rotateX(-.95),h.translate(.18,.56,.13),e.push(Q(h,t,4));let g=new K(.084,.23,.084);g.rotateX(-1.05),g.rotateZ(.38),g.translate(-.135,.56,.16),e.push(Q(g,t,4));let _=new K(.075,.1,.36);_.translate(.1,.55,.29),e.push(Q(_,r,4));let v=new q(.034,.034,.1,7);v.rotateX(Math.PI/2),v.translate(.1,.555,.5),e.push(Q(v,16747546,4));let y=xu(e,!1);for(let t of e)t.dispose();return Ru(y,`aPartId`),y}function Gu(){let e=[],t=1494116,n=1664752,r=15923455,i=16764728;for(let[n,i]of[[-1,1],[1,2]]){let a=n*.136,o=new K(.15,.185,.16);o.translate(a,.31,0),e.push(Q(o,1062028,i));let s=new q(.082,.072,.18,7);s.translate(a,.135,.008),e.push(Q(s,t,i));let c=new K(.148,.086,.205);c.translate(a,.044,.04),e.push(Q(c,r,i))}let a=new q(.2,.18,.13,7);a.scale(1.16,1,.88),a.translate(0,.41,0),e.push(Q(a,n,0));let o=new q(.255,.19,.37,7);o.scale(1.22,1,.92),o.translate(0,.59,0),e.push(Q(o,n,0));let s=new K(.41,.26,.22);s.translate(0,.605,.045),e.push(Q(s,t,0));let c=new q(.072,.072,.048,6);c.rotateX(Math.PI/2),c.translate(0,.615,.162),e.push(Q(c,i,0));for(let i of[-1,1]){let a=new K(.21,.15,.23);a.rotateZ(-i*.18),a.translate(i*.305,.705,.02),e.push(Q(a,t,0));let o=new K(.215,.04,.235);o.rotateZ(-i*.18),o.translate(i*.31,.775,.02),e.push(Q(o,r,0));let s=new K(.125,.25,.125);s.rotateX(-.92),s.rotateZ(-i*.22),s.translate(i*.245,.56,.16),e.push(Q(s,n,4))}let l=new q(.145,.135,.19,8);l.translate(0,.865,.03),e.push(Q(l,16763814,0));let u=new q(.168,.196,.18,8);u.scale(1.06,1,1.1),u.translate(0,.945,.025),e.push(Q(u,t,0));let d=new K(.1,.06,.38);d.translate(0,1.03,.03),e.push(Q(d,n,0));let f=new K(.28,.04,.17);f.translate(0,.915,.175),e.push(Q(f,n,0));let p=new K(.26,.058,.06);p.translate(0,.87,.175),e.push(Q(p,i,0));let m=new K(.18,.14,.46);m.translate(0,.5,.33),e.push(Q(m,n,4));let h=new q(.085,.085,.28,8);h.rotateX(Math.PI/2),h.translate(0,.61,.32),e.push(Q(h,t,4));for(let t of[-.045,.045]){let n=new q(.032,.032,.22,7);n.rotateX(Math.PI/2),n.translate(t,.51,.62),e.push(Q(n,16745755,4))}let g=xu(e,!1);for(let t of e)t.dispose();return Ru(g,`aPartId`),g}function Ku(e,t,n){let r=e.attributes.position,i=new Float32Array(r.count),a=Math.max(.01,n-t);for(let e=0;e<r.count;e++){let n=r.getZ(e),o=Math.max(0,Math.min(1,(n-t)/a));i[e]=(1-o)**1.55}e.setAttribute(`aAlpha`,new Pr(i,1))}var qu=[[1,.16,.3],[1,.56,.1],[1,.92,.14],[.14,.94,.42],[.16,.64,1],[.78,.26,1]];function Ju(){let e=[],t=.044,n=qu.length*t;for(let r=0;r<qu.length;r++){let[i,a,o]=qu[r],s=-n*.5+(r+.5)*t;for(let n=0;n<5;n++){let r=(n+.5)/5,c=1-r*.72,l=-.74+r*1.48,u=new K(t*c*1.08,.056*(1-r*.55),.296*1.12);u.translate(s*c,0,l);let d=Q(u,16777215,0),f=d.getAttribute(`color`).array,p=r<.22?.55:0;for(let e=0;e<f.length;e+=3)f[e]=Math.min(1.45,i*1.15+p),f[e+1]=Math.min(1.45,a*1.15+p),f[e+2]=Math.min(1.45,o*1.15+p);e.push(d)}}let r=new J(.115,.34,6);r.rotateX(-Math.PI/2),r.scale(1.15,.65,1),r.translate(0,.005,-.82);let i=Q(r,16777215,0);{let e=i.getAttribute(`color`).array;for(let t=0;t<e.length;t++)e[t]=1.85}e.push(i);let a=xu(e,!1);for(let t of e)t.dispose();return a.deleteAttribute(`aPartId`),Ku(a,-.99,.74),a}function Yu(){let e=[],t=.06,n=qu.length*t;for(let r=0;r<qu.length;r++){let[i,a,o]=qu[r],s=-n*.5+(r+.5)*t,c=Math.abs(s)/Math.max(.01,n*.5)*.26;for(let n=0;n<5;n++){let r=(n+.5)/5,l=1.04-r*.66,u=-.81+c+r*(1.62-c),d=new K(t*l*1.08,.068*(1-r*.52),.324*1.14);d.translate(s*(1+(1-r)*.14)*l,.01,u);let f=Q(d,16777215,0),p=f.getAttribute(`color`).array,m=n===0?.22:0;for(let e=0;e<p.length;e+=3)p[e]=Math.min(1.45,i*1.14+m),p[e+1]=Math.min(1.45,a*1.14+m),p[e+2]=Math.min(1.45,o*1.14+m);e.push(f)}}let r=new J(.24,.52,4);r.rotateY(Math.PI/4),r.rotateX(-Math.PI/2),r.scale(1.18,.45,1),r.translate(0,.015,-.91);let i=Q(r,16777215,0);{let e=i.getAttribute(`color`).array;for(let t=0;t<e.length;t++)e[t]=2.05}e.push(i);let a=xu(e,!1);for(let t of e)t.dispose();return a.deleteAttribute(`aPartId`),Ku(a,-1.17,.81),a}function Xu(){let e=[],t=new J(.115,1.48,6);t.rotateX(Math.PI/2),t.scale(1,.72,1),t.translate(0,0,.04);let n=Q(t,16745826,0);{let e=n.getAttribute(`color`).array;for(let t=0;t<e.length;t+=3)e[t]=1.28,e[t+1]=.64,e[t+2]=.44}e.push(n);let r=new J(.056,1.06,6);r.rotateX(Math.PI/2),r.translate(0,0,-.14);let i=Q(r,16765624,0);{let e=i.getAttribute(`color`).array;for(let t=0;t<e.length;t+=3)e[t]=1.65,e[t+1]=1.24,e[t+2]=1.02}e.push(i);let a=new J(.088,.34,6);a.rotateX(-Math.PI/2),a.scale(1.05,.68,1),a.translate(0,0,-.78);let o=Q(a,16777215,0);{let e=o.getAttribute(`color`).array;for(let t=0;t<e.length;t++)e[t]=2}e.push(o);let s=xu(e,!1);for(let t of e)t.dispose();return s.deleteAttribute(`aPartId`),Ku(s,-.96,.78),s}function Zu(){let e=[],t=new J(.28,1.54,4);t.rotateY(Math.PI/4),t.rotateX(Math.PI/2),t.scale(1.18,.42,1),t.translate(0,0,.04);let n=Q(t,16767053,0);{let e=n.getAttribute(`color`).array;for(let t=0;t<e.length;t+=3)e[t]=1.48,e[t+1]=1.24,e[t+2]=.44}e.push(n);let r=new J(.16,1.18,4);r.rotateY(Math.PI/4),r.rotateX(Math.PI/2),r.scale(1.12,.48,1),r.translate(0,.005,-.14);let i=Q(r,16775368,0);{let e=i.getAttribute(`color`).array;for(let t=0;t<e.length;t+=3)e[t]=1.95,e[t+1]=1.88,e[t+2]=1.32}e.push(i);let a=new J(.21,.46,4);a.rotateY(Math.PI/4),a.rotateX(-Math.PI/2),a.scale(1.15,.44,1),a.translate(0,.01,-.86);let o=Q(a,16777215,0);{let e=o.getAttribute(`color`).array;for(let t=0;t<e.length;t++)e[t]=2.15}e.push(o);let s=xu(e,!1);for(let t of e)t.dispose();return s.deleteAttribute(`aPartId`),Ku(s,-1.1,.82),s}function Qu(){let e=[],t=new ja(.36,.16,7,12);e.push(Q(t,1975858,0));let n=new q(.22,.22,.18,8);n.rotateX(Math.PI/2),e.push(Q(n,9348802,0));let r=new q(.09,.09,.22,6);r.rotateX(Math.PI/2),e.push(Q(r,16758832,0));let i=xu(e,!1);for(let t of e)t.dispose();return Ru(i),i.deleteAttribute(`aPartId`),i}function $u(){let e=[],t=new q(.32,.32,.1,10);t.rotateX(Math.PI/2),e.push(Q(t,16763432,0));let n=new ja(.3,.05,6,10);e.push(Q(n,16773529,0));let r=new Da(.13,0);r.scale(1,1,.55),e.push(Q(r,2685148,0));let i=xu(e,!1);for(let t of e)t.dispose();return Ru(i),i.deleteAttribute(`aPartId`),i}function ed(){let e=new H,t=new Y({color:16763176,emissive:8015360,roughness:.24,metalness:.42}),n=new W({color:2685148}),r=new W({color:856602,side:1}),i=new q(.6,.6,.22,8);i.rotateX(Math.PI/2),e.add(new G(i,t));let a=new q(.66,.66,.28,8);a.rotateX(Math.PI/2),e.add(new G(a,r));let o=new q(.36,.36,.26,6);return o.rotateX(Math.PI/2),e.add(new G(o,n)),e}function td(){let e=new H,t=new Y({color:2376294,emissive:729661,roughness:.28,metalness:.36}),n=new Y({color:8299207,roughness:.28,metalness:.42}),r=new W({color:2685148}),i=new W({color:593430,side:1}),a=new G(new q(.36,.46,.44,6),t);a.position.y=.08,e.add(a);let o=new G(new q(.41,.51,.5,6),i);o.position.y=.08,e.add(o);let s=new G(new K(.12,.14,.52),n);s.position.set(0,.34,0),e.add(s);let c=new G(new K(.58,.14,.22),r);return c.position.set(0,.08,.32),e.add(c),e}function nd(){let e=new H,t=new Y({color:16724889,emissive:7015227,roughness:.26,metalness:.22}),n=new Y({color:16774651,roughness:.24,metalness:.2}),r=new Y({color:16764728,emissive:6044672,roughness:.25,metalness:.48}),i=new W({color:7534824}),a=new W({color:1836564,side:1}),o=new G(new q(.36,.46,.44,8),t);o.position.y=.08,e.add(o);let s=new G(new q(.41,.51,.5,8),a);s.position.y=.08,e.add(s);for(let t of[-1,1]){let r=new G(new J(.13,.28,4),n);r.rotation.z=-t*.22,r.position.set(t*.26,.4,0),e.add(r)}let c=new G(new J(.14,.24,5),r);c.position.set(0,.42,.16),e.add(c);let l=new G(new K(.58,.14,.22),i);return l.position.set(0,.08,.32),e.add(l),e}function rd(){let e=new H,t=new Y({color:16753704,metalness:.45,roughness:.28}),n=new Y({color:2635337,metalness:.48,roughness:.32}),r=new Y({color:14084344,metalness:.5,roughness:.2}),i=new W({color:16722008}),a=new G(new K(.66,.54,.26),n),o=new G(new K(.54,.42,.28),t);e.add(a,o);let s=new G(new ja(.2,.062,8,12,Math.PI),r);s.position.set(0,.26,0),e.add(s);let c=new G(new Da(.055,0),i);return c.position.set(0,.11,.16),e.add(c),e}function id(){let e=new W({color:527378,side:1});return e.customProgramCacheKey=()=>`boss-cel-outline-v53`,e.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
        attribute vec3 aOutlineNormal;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
        {
          vec3 safeBossNorm = aOutlineNormal / max(0.0001, length(aOutlineNormal));
          transformed += safeBossNorm * 0.032;
        }`)},e}var ad=id();function od(e,t){e.customProgramCacheKey=()=>t,e.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace(`#include <common>`,`
        #include <common>
        varying vec3 vBossWorldNormal;
        `).replace(`#include <begin_vertex>`,`
        #include <begin_vertex>
        {
          vec3 bwn = mat3(modelMatrix) * objectNormal;
          vBossWorldNormal = bwn / max(0.0001, length(bwn));
        }
        `),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`
        #include <common>
        varying vec3 vBossWorldNormal;
        `).replace(`#include <dithering_fragment>`,`
        #include <dithering_fragment>
        {
          // 2-band frontal + top cel-saturation lift so camera-facing Boss armor never goes dark in backlight!
          vec3 wn = vBossWorldNormal / max(0.0001, length(vBossWorldNormal));
          float celBand = smoothstep(-0.26, 0.36, wn.y * 0.58 + wn.z * 0.62 - wn.x * 0.18);
          gl_FragColor.rgb *= mix(1.06, 1.38, celBand);
          float keyRim = smoothstep(0.32, 0.88, max(wn.y, wn.z * 0.82));
          gl_FragColor.rgb += vec3(0.055, 0.065, 0.085) * keyRim;
        }
        `)}}function sd(e){let t=[];e.traverse(e=>{e instanceof G&&e.material instanceof Y&&!e.userData.isBossOutline&&t.push(e)});for(let e=0;e<t.length;e++){let n=t[e],r=n.geometry;r.attributes.aOutlineNormal||(r.attributes.normal||r.computeVertexNormals(),Ru(r));let i=new G(r,ad);i.userData.isBossOutline=!0,n.add(i)}}function cd(e,t,n){let r=new Y({color:e,roughness:.34,metalness:.28,emissive:0}),i=new Y({color:t,roughness:.3,metalness:.26,emissive:0}),a=new Y({color:n,roughness:.26,metalness:.34,emissive:0}),o=new Y({color:3095370,roughness:.4,metalness:.3,emissive:0});return od(r,`boss-cel-std-v53`),od(i,`boss-cel-std-v53`),od(a,`boss-cel-std-v53`),od(o,`boss-cel-std-v53`),{primaryMat:r,accentMat:i,trimMat:a,darkSteelMat:o,glowMat:new W({color:n}),flashMaterials:[r,i,a,o]}}function ld(e,t=2.45){let n=new G(new Yi(t,28),new W({color:329741,transparent:!0,opacity:.56,depthWrite:!1}));n.rotation.x=-Math.PI/2,n.position.y=.03,e.add(n);let r=new G(new ka(t-.38,t,36),new W({color:16726862,transparent:!0,opacity:.46,side:2,depthWrite:!1}));return r.rotation.x=-Math.PI/2,r.position.y=.045,e.add(r),r}function ud(){let e=cd(3687250,13183550,16102446),t=new H,n=ld(t,2.35),r=t=>{let n=new H;n.position.set(t*.72,1.52,0);let r=new G(new q(.24,.24,.34,12),e.darkSteelMat);r.rotation.z=Math.PI/2,n.add(r);let i=new G(new Ji(.22,.48,6,12),e.primaryMat);i.position.set(0,-.34,.08),i.rotation.x=-.22,n.add(i);let a=new G(new K(.46,.34,.44),e.accentMat);a.position.set(0,-.68,.22),n.add(a);let o=new G(new q(.2,.28,.68,10),e.darkSteelMat);o.position.set(0,-1.04,.04),o.rotation.x=.16,n.add(o);let s=new G(new K(.68,.24,1.02),e.primaryMat);s.position.set(0,-1.4,.16);let c=new G(new K(.72,.16,.32),e.trimMat);return c.position.set(0,-1.44,.64),n.add(s,c),n},i=r(-1),a=r(1);t.add(i,a);let o=new H;o.position.set(0,1.58,0);let s=new G(new q(.72,.56,.44,8),e.darkSteelMat);s.position.set(0,.04,0),o.add(s);let c=new G(new q(1.06,.78,1.24,8),e.primaryMat);c.scale.set(1.18,1,.88),c.position.set(0,.82,0),o.add(c);let l=new G(new K(1.42,.58,.96),e.accentMat);l.position.set(0,.92,.38),l.rotation.x=.12,o.add(l);let u=new G(new K(1.14,.18,.14),e.glowMat);u.position.set(0,.98,.85),o.add(u);let d=new G(new q(.28,.28,.16,16),e.glowMat);d.rotation.x=Math.PI/2,d.position.set(0,.52,.78);let f=new G(new ja(.32,.055,8,20),e.trimMat);f.position.set(0,.52,.82),o.add(d,f);let p=[];for(let t of[-1,1]){let n=new G(new K(.68,.56,.74),e.primaryMat);n.position.set(t*1.18,1.54,-.05),n.rotation.z=-t*.12;let r=new G(new K(.56,.42,.08),e.darkSteelMat);r.position.set(t*1.18,1.54,.34),o.add(n,r);for(let n=0;n<2;n++)for(let r=0;r<3;r++){let i=new G(new Aa(.068,8,6),e.trimMat);i.position.set(t*1.18+(r-1)*.16,1.46+n*.17,.39),o.add(i)}let i=new H;i.position.set(t*1.48,.78,.2);let a=new G(new Aa(.42,12,10),e.accentMat);a.scale.set(1.1,.9,1.2),i.add(a);let s=new G(new q(.26,.28,.58,12),e.darkSteelMat);s.rotation.x=Math.PI/2,s.position.set(0,-.22,.32),i.add(s);let c=new H;c.position.set(0,-.22,.62);let l=new q(.042,.042,1.08,8);l.rotateX(Math.PI/2);for(let t=0;t<6;t++){let n=t/6*Math.PI*2,r=new G(l,e.trimMat);r.position.set(Math.cos(n)*.14,Math.sin(n)*.14,.44),c.add(r)}let u=new G(new q(.2,.2,.08,14),e.accentMat);u.rotation.x=Math.PI/2,u.position.set(0,0,.76),c.add(u),i.add(c),p.push(c),o.add(i)}return t.add(o),sd(t),{chassis:`WARDEN_MECH`,root:t,bodyGroup:o,turretGroup:null,leftLeg:i,rightLeg:a,spiderLegs:null,spinClusters:p,recoilBarrels:[],meleeArm:null,wingPylons:null,hazardRing:n,...e}}function dd(){let e=cd(8002600,2370357,16758311),t=new H,n=ld(t,2.75),r=new H;r.position.set(0,.55,0);for(let t of[-1,1]){let n=new H;n.position.set(t*1.32,0,0);let i=new G(new K(.72,.88,3.35),e.darkSteelMat);n.add(i);let a=new G(new K(.16,.54,3.1),e.primaryMat);a.position.set(t*.34,.12,0),n.add(a);for(let t=0;t<5;t++){let r=new G(new q(.32,.32,.78,12),e.trimMat);r.rotation.z=Math.PI/2,r.position.set(0,-.14,-1.24+t*.62),n.add(r)}r.add(n)}let i=new G(new K(2.15,.82,3.05),e.primaryMat);i.position.set(0,.28,-.05),r.add(i);for(let t of[-1,1]){let n=new G(new K(1.58,.78,.24),e.accentMat);n.position.set(t*.72,-.06,1.72),n.rotation.y=-t*.26,n.rotation.x=.22;let i=new G(new K(1.56,.14,.28),e.trimMat);i.position.set(t*.72,-.38,1.8),i.rotation.y=-t*.26,r.add(n,i)}for(let t of[-1,1]){let n=new G(new q(.12,.12,.08,12),e.glowMat);n.rotation.x=Math.PI/2,n.position.set(t*.78,.56,1.48),r.add(n)}let a=new H;a.position.set(0,.92,-.15);let o=new G(new q(1.12,1.28,.68,8),e.primaryMat);o.scale.set(1.05,1,1.22),a.add(o);let s=new G(new K(1.92,.52,1.24),e.accentMat);s.position.set(0,.04,.18),a.add(s);let c=new G(new K(.76,.14,.12),e.glowMat);c.position.set(0,.28,.82),a.add(c);let l=[];for(let t of[-1,1]){let n=new H;n.position.set(t*.42,.06,.76);let r=new G(new K(.34,.34,.44),e.darkSteelMat),i=new G(new q(.12,.15,2.05,12),e.darkSteelMat);i.rotation.x=Math.PI/2,i.position.set(0,0,1.05);let o=new G(new K(.32,.28,.38),e.trimMat);o.position.set(0,0,2.08),n.add(r,i,o),l.push(n),a.add(n)}let u=new H;u.position.set(.48,.56,-.12);let d=new q(.028,.028,.78,6);d.rotateX(Math.PI/2);for(let t=0;t<6;t++){let n=t/6*Math.PI*2,r=new G(d,e.trimMat);r.position.set(Math.cos(n)*.08,Math.sin(n)*.08,.38),u.add(r)}return a.add(u),r.add(a),t.add(r),sd(t),{chassis:`SIEGE_TANK`,root:t,bodyGroup:r,turretGroup:a,leftLeg:null,rightLeg:null,spiderLegs:null,spinClusters:[u],recoilBarrels:l,meleeArm:null,wingPylons:null,hazardRing:n,...e}}function fd(){let e=cd(1910326,15215695,3733247),t=new H,n=ld(t,2.85),r=(t,n,r)=>{let i=new H;i.position.set(t*.95,1.36,n*.78),i.rotation.y=r;let a=new G(new Aa(.28,10,8),e.accentMat);i.add(a);let o=new G(new q(.16,.2,1.25,10),e.primaryMat);o.position.set(t*.56,.34,0),o.rotation.z=-t*1.05,i.add(o);let s=new G(new Aa(.24,10,8),e.trimMat);s.position.set(t*1.12,.64,0),i.add(s);let c=new G(new J(.2,2.15,8),e.darkSteelMat);c.rotation.x=Math.PI,c.rotation.z=t*.16,c.position.set(t*1.32,-.36,0),i.add(c);let l=new G(new q(.22,.08,.22,8),e.accentMat);return l.position.set(t*1.48,-1.28,0),i.add(l),i},i=r(-1,1,.48),a=r(1,1,-.48),o=r(-1,-1,-.48),s=r(1,-1,.48);t.add(i,a,o,s);let c=new H;c.position.set(0,1.48,0);let l=new G(new q(1.28,.92,.64,10),e.darkSteelMat);c.add(l);let u=new G(new Aa(1.32,18,12,0,Math.PI*2,0,Math.PI*.58),e.primaryMat);u.scale.set(1.12,.88,1.24),u.position.set(0,.22,-.08),c.add(u);let d=new G(new K(.44,.36,1.85),e.accentMat);d.position.set(0,1.06,-.15),c.add(d);for(let t=-2;t<=2;t++){let n=new G(new Aa(t===0?.22:.13,10,8),e.glowMat);n.position.set(t*.34,.56-Math.abs(t)*.06,1.34-Math.abs(t)*.14),c.add(n)}let f=[];for(let t of[-1,1]){let n=new H;n.position.set(t*.66,-.22,.75);let r=new G(new K(.38,.34,.86),e.accentMat),i=new G(new q(.11,.14,1.15,10),e.trimMat);i.rotation.x=Math.PI/2,i.position.set(0,0,.72);let a=new G(new ja(.15,.04,8,14),e.glowMat);a.position.set(0,0,1.26),n.add(r,i,a),f.push(n),c.add(n)}let p=new H;p.position.set(0,-.34,0);let m=new G(new ja(.56,.08,8,18),e.trimMat);return m.rotation.x=Math.PI/2,p.add(m),c.add(p),t.add(c),sd(t),{chassis:`KRAKEN_WALKER`,root:t,bodyGroup:c,turretGroup:null,leftLeg:null,rightLeg:null,spiderLegs:[i,a,o,s],spinClusters:[p],recoilBarrels:f,meleeArm:null,wingPylons:null,hazardRing:n,...e}}function pd(){let e=cd(2890281,16102446,3733247),t=new H,n=ld(t,2.75),r=t=>{let n=new H;n.position.set(t*.78,1.72,0);let r=new G(new K(.56,.86,.62),e.primaryMat);r.position.set(0,-.4,0);let i=new G(new q(.28,.38,.92,8),e.darkSteelMat);i.position.set(0,-1.16,.06);let a=new G(new J(.22,.52,6),e.accentMat);a.rotation.x=Math.PI/3,a.position.set(0,-.78,.42);let o=new G(new K(.74,.28,1.08),e.accentMat);return o.position.set(0,-1.58,.18),n.add(r,i,a,o),n},i=r(-1),a=r(1);t.add(i,a);let o=new H;o.position.set(0,1.78,0);let s=new G(new q(.78,.64,.54,8),e.darkSteelMat),c=new G(new q(1.32,.84,1.38,8),e.primaryMat);c.scale.set(1.18,1,.88),c.position.set(0,.88,0),o.add(s,c);let l=new G(new K(1.44,.86,.38),e.accentMat);l.position.set(0,.96,.56);let u=new G(new K(1.12,.24,.72),e.trimMat);u.position.set(0,1.54,.14);let d=new G(new ja(.34,.065,8,18),e.darkSteelMat);d.position.set(0,.96,.75);let f=new G(new Aa(.28,14,12),e.glowMat);f.position.set(0,.96,.76),o.add(l,u,d,f);let p=new G(new Aa(.48,12,10),e.primaryMat);p.scale.set(.96,1.05,1.08),p.position.set(0,1.94,.1);let m=new G(new K(.76,.44,.64),e.darkSteelMat);m.position.set(0,1.82,.16);let h=new G(new K(.68,.15,.14),e.glowMat);h.position.set(0,1.9,.48);let g=new G(new Da(.14,0),e.glowMat);g.position.set(0,2.12,.5),o.add(p,m,h,g);for(let t of[-1,1]){let n=new G(new K(.82,.14,.08),e.accentMat);n.position.set(t*.44,2.3,.42),n.rotation.z=t*.52,n.rotation.y=-t*.18;let r=new G(new J(.12,.72,6),e.trimMat);r.position.set(t*.36,2.28,-.06),r.rotation.z=-t*.36,r.rotation.x=-.24,o.add(n,r)}let _=t=>{let n=new H;n.position.set(t*.76,1.38,-.46),n.rotation.z=-t*.32,n.rotation.y=-t*.22;let r=new G(new K(.46,.62,.38),e.darkSteelMat);n.add(r);for(let r=0;r<3;r++){let i=1.85-r*.28,a=.46-r*.36,o=t*(.28-r*.22),s=new G(new K(i,.24,.12),e.primaryMat);s.position.set(t*(.35+i*.45),a,0),s.rotation.z=o;let c=new G(new K(i*.92,.1,.15),e.glowMat);c.position.set(t*(.42+i*.45),a-.1,.02),c.rotation.z=o,n.add(s,c)}return n},v=_(-1),y=_(1);o.add(v,y);let b=new H;b.position.set(-1.58,1.04,.18);let x=new G(new K(.78,.56,.86),e.primaryMat);x.rotation.z=.28,x.position.set(-.06,.24,0);let S=new G(new K(.84,.14,.9),e.accentMat);S.rotation.z=.28,S.position.set(-.06,.46,0),b.add(x,S);let C=new H;C.position.set(0,-.26,.46);let w=new q(.058,.058,1.38,8);w.rotateX(Math.PI/2);for(let t=0;t<6;t++){let n=t/6*Math.PI*2,r=new G(w,e.trimMat);r.position.set(Math.cos(n)*.17,Math.sin(n)*.17,.52),C.add(r)}let T=new G(new q(.24,.24,.12,12),e.accentMat);T.rotation.x=Math.PI/2,T.position.set(0,0,.95),C.add(T),b.add(C),o.add(b);let E=new H;E.position.set(1.58,1.06,.18);let D=new G(new K(.78,.56,.86),e.primaryMat);D.rotation.z=-.28,D.position.set(.06,.24,0);let O=new G(new K(.84,.14,.9),e.accentMat);O.rotation.z=-.28,O.position.set(.06,.46,0);let k=new G(new K(.44,.48,.74),e.darkSteelMat);k.position.set(0,-.24,.28);let A=new H;A.position.set(0,-.18,.62),A.rotation.x=.52;let j=new G(new q(.062,.062,2.85,10),e.accentMat);j.position.set(0,.35,0);let ee=new G(new K(.24,.32,.3),e.darkSteelMat);ee.position.set(0,1.48,0);let M=new G(new J(.18,.95,4),e.glowMat);M.scale.set(.45,1,1.35),M.position.set(0,2.08,.04);let te=new G(new J(.15,.72,4),e.glowMat);return te.scale.set(.42,1,1.25),te.rotation.x=1.15,te.position.set(0,1.62,.38),A.add(j,ee,M,te),E.add(D,O,k,A),o.add(E),t.add(o),sd(t),{chassis:`SOVEREIGN_TITAN`,root:t,bodyGroup:o,turretGroup:null,leftLeg:i,rightLeg:a,spiderLegs:null,spinClusters:[C],recoilBarrels:[],meleeArm:E,wingPylons:[v,y],hazardRing:n,...e}}function md(){return{WARDEN_MECH:ud(),SIEGE_TANK:dd(),KRAKEN_WALKER:fd(),SOVEREIGN_TITAN:pd()}}function hd(){let e=new W({color:527380,side:1});return e.customProgramCacheKey=()=>`unicorn-boss-cel-outline-v72`,e.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
        attribute vec3 aOutlineNormal;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
        {
          vec3 safeBossNorm = aOutlineNormal / max(0.0001, length(aOutlineNormal));
          transformed += safeBossNorm * 0.032;
        }`)},e}var gd=hd();function _d(e,t){e.customProgramCacheKey=()=>t,e.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace(`#include <common>`,`
        #include <common>
        varying vec3 vUniBossNormal;
        `).replace(`#include <begin_vertex>`,`
        #include <begin_vertex>
        {
          vec3 bwn = mat3(modelMatrix) * objectNormal;
          vUniBossNormal = bwn / max(0.0001, length(bwn));
        }
        `),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`
        #include <common>
        varying vec3 vUniBossNormal;
        `).replace(`#include <dithering_fragment>`,`
        #include <dithering_fragment>
        {
          vec3 wn = vUniBossNormal / max(0.0001, length(vUniBossNormal));
          float celBand = smoothstep(-0.26, 0.36, wn.y * 0.58 + wn.z * 0.62 - wn.x * 0.18);
          gl_FragColor.rgb *= mix(0.95, 1.24, celBand);
          float skyRim = smoothstep(0.45, 0.90, wn.y);
          gl_FragColor.rgb += vec3(0.06, 0.10, 0.14) * skyRim;
        }
        `)}}function vd(e){let t=[];e.traverse(e=>{e instanceof G&&e.material instanceof Y&&!e.userData.isBossOutline&&t.push(e)});for(let e=0;e<t.length;e++){let n=t[e],r=n.geometry;r.attributes.aOutlineNormal||(r.attributes.normal||r.computeVertexNormals(),Ru(r));let i=new G(r,gd);i.userData.isBossOutline=!0,n.add(i)}}function yd(e){let t=new Y({color:1598706,roughness:.28,metalness:.28}),n=new Y({color:2017627,roughness:.28,metalness:.28}),r=new Y({color:16765496,roughness:.22,metalness:.44}),i=new Y({color:16054527,roughness:.34,metalness:.1});_d(t,`uni-boss-prim-${e}`),_d(n,`uni-boss-acc-${e}`),_d(r,`uni-boss-trim-${e}`),_d(i,`uni-boss-coat-${e}`);let a=[16722773,16747546,16770603,2287720,2399743,12073983].map((t,n)=>{let r=new Y({color:t,emissive:t,emissiveIntensity:.24,roughness:.26,metalness:.22});return _d(r,`uni-boss-rb-${e}-${n}`),r});return{primaryMat:t,accentMat:n,trimMat:r,darkSteelMat:i,glowMat:new W({color:16773258}),rainbowMats:a,flashMaterials:[t,n,r,i,...a]}}function bd(e,t=2.85){let n=new ka(t-.34,t,32);n.rotateX(-Math.PI/2);let r=new G(n,e);return r.position.y=.04,r}function xd(e){let t=e===`SOVEREIGN_TITAN`,n=e===`KRAKEN_WALKER`,r=e===`SIEGE_TANK`,i=yd(e.toLowerCase()),a=new H,o=new H,s=t?1.14:1,c=t?1.88:1.65;o.position.y=c;let l=[],u=[],d=new H;d.rotation.y=.2,d.scale.setScalar(s),o.add(d);let f=e=>{let t=new H,n=new G(new q(.32,.26,.78,9),i.darkSteelMat);n.position.set(0,-.36,0);let r=new G(new Da(.27,0),e?i.primaryMat:i.accentMat);r.scale.set(1.05,.92,1.15),r.position.set(0,-.74,.1);let a=new G(new q(.22,.19,.64,9),i.darkSteelMat);a.position.set(0,-1.08,.02);let o=new G(new q(.24,.26,.16,9),e?i.accentMat:i.primaryMat);o.position.set(0,-1.34,.04);let s=new G(new q(.26,.33,.24,9),i.trimMat);return s.position.set(0,-1.5,.08),t.add(n,r,a,o,s),t},p=new H;p.position.set(-.58,-.04,.92),p.add(f(!0));let m=new H;m.position.set(.58,-.04,.92),m.add(f(!1));let h=new H;h.position.set(-.6,-.04,-.88),h.add(f(!0));let g=new H;g.position.set(.6,-.04,-.88),g.add(f(!1)),d.add(p,m,h,g);let _=[p,m,h,g],v=new G(new q(.9,.84,2.12,12),i.darkSteelMat);v.rotation.x=Math.PI/2,v.scale.set(1.08,1,.96),v.position.set(0,.16,.02),d.add(v);let y=new G(new Aa(.95,12,10),i.darkSteelMat);y.scale.set(1.08,1.05,.94),y.position.set(0,.26,.88),d.add(y);let b=new G(new Aa(.88,12,10),i.darkSteelMat);b.scale.set(1.05,1,.96),b.position.set(0,.22,-.88),d.add(b);let x=new G(new K(1.98,.84,1.52),i.primaryMat);x.position.set(0,.36,-.02),d.add(x);let S=new G(new K(2.06,.16,1.6),i.trimMat);S.position.set(0,-.02,-.02),d.add(S);let C=new G(new K(1.28,.34,1.02),i.accentMat);C.position.set(0,.84,-.04),d.add(C);let w=new G(new q(1.02,.96,.72,10,1,!1,-Math.PI*.46,Math.PI*.92),i.accentMat);w.position.set(0,.28,.9),d.add(w);let T=new G(new Da(.34,0),i.trimMat);T.position.set(0,.34,1.88),d.add(T);let E=new G(new Da(.2,0),i.glowMat);E.position.set(0,.34,2.02),d.add(E);for(let e of[-1,1]){let t=new G(new q(.58,.46,.22,6),e<0?i.primaryMat:i.accentMat);t.rotation.z=Math.PI/2,t.position.set(e*1.02,.26,.68),d.add(t);let n=new G(new q(.5,.4,.2,6),e<0?i.accentMat:i.primaryMat);n.rotation.z=Math.PI/2,n.position.set(e*.96,.24,-.68),d.add(n)}let D=new H;D.position.set(-.22,.38,-1.62),D.rotation.set(-.38,-.36,.16);for(let e=0;e<5;e++){let r=t||n?i.rainbowMats[e%i.rainbowMats.length]:e%2==0?i.primaryMat:i.accentMat,a=new G(new J(.34-e*.04,1.48,7),r);a.rotation.x=Math.PI*.72+e*.09,a.position.set(-e*.09,-.24-e*.18,-.34-e*.16),D.add(a)}d.add(D);let O=null;if(n||t){let e=new H,t=new H;e.position.set(-.82,.68,.36),t.position.set(.82,.68,.36);for(let[n,r]of[[e,-1],[t,1]]){let e=new G(new Aa(.36,8,8),i.trimMat);n.add(e);let t=new G(new K(1.95,.22,.24),i.primaryMat);t.rotation.z=-r*.22,t.position.set(r*.96,.28,-.06),n.add(t);for(let e=0;e<5;e++){let t=e===0?i.trimMat:e%2==1?i.darkSteelMat:e===2?i.primaryMat:i.accentMat,a=new G(new J(.22,1.65-e*.18,5),t);a.scale.set(.55,1,1.35),a.rotation.z=-r*(1.18+e*.1),a.rotation.y=r*.12,a.position.set(r*(.58+e*.34),.12-e*.12,-.12-e*.06),n.add(a)}n.rotation.z=-r*.42,d.add(n)}O=[e,t]}if(r)for(let e of[-1,1]){let t=new G(new K(.52,.42,.88),e<0?i.primaryMat:i.accentMat);t.position.set(e*1.28,.62,.32),d.add(t);let n=new H;n.position.set(e*1.34,.68,.76);let r=new G(new q(.22,.26,1.35,8),i.trimMat);r.rotation.x=Math.PI/2,r.position.set(0,0,.45);let a=new G(new ja(.24,.06,6,12),e<0?i.accentMat:i.primaryMat);a.position.set(0,0,1.12);let o=new G(new Da(.18,0),i.glowMat);o.position.set(0,0,1.15),n.add(r,a,o),u.push(n),d.add(n);let s=new H;s.position.set(e*1.28,-.34,-.58),s.rotation.y=Math.PI/2;let c=new G(new ja(.76,.11,8,16),i.trimMat);s.add(c);for(let e=0;e<6;e++){let t=new G(new K(.12,1.44,.1),i.rainbowMats[e]);t.rotation.z=e*Math.PI/6,s.add(t)}l.push(s),d.add(s)}let k=new H;k.position.set(.18*s,.62*s,.96*s),k.scale.setScalar(s),o.add(k);let A=new G(new q(.48,.68,1.48,10),i.darkSteelMat);A.rotation.x=.28,A.position.set(0,.62,.16),k.add(A);let j=new G(new ja(.6,.13,6,14),i.trimMat);j.rotation.x=Math.PI/2+.28,j.position.set(0,.18,.06),k.add(j);for(let e=0;e<6;e++){let r=t||n?i.rainbowMats[e]:e%3==0?i.primaryMat:e%3==1?i.accentMat:i.trimMat,a=new G(new J(.24,.68,5),r);a.rotation.x=-.82,a.rotation.z=(e%2==0?1:-1)*.18,a.position.set(0,.24+e*.26,-.3+e*.06),k.add(a)}let ee=new G(new Aa(.58,12,10),i.darkSteelMat);ee.scale.set(.94,.98,1.14),ee.position.set(0,1.42,.38),k.add(ee);let M=new G(new q(.3,.44,.92,10),i.darkSteelMat);M.rotation.x=Math.PI/2+.34,M.position.set(0,1.22,.98),k.add(M);let te=new G(new Aa(.32,10,8),i.darkSteelMat);te.scale.set(1.04,.86,.92),te.position.set(0,1.06,1.38),k.add(te);let ne=new G(new K(.54,.2,.88),i.primaryMat);ne.rotation.x=.34,ne.position.set(0,1.54,.78),k.add(ne);for(let e of[-1,1]){let t=new G(new J(.16,.56,5),i.darkSteelMat);t.rotation.z=-e*.28,t.rotation.x=-.14,t.position.set(e*.36,1.94,.22),k.add(t);let n=new G(new J(.09,.38,4),e<0?i.primaryMat:i.accentMat);n.rotation.z=-e*.28,n.rotation.x=-.14,n.position.set(e*.36,1.92,.27),k.add(n);let r=new G(new K(.15,.15,.2),i.glowMat);r.position.set(e*.48,1.48,.62),k.add(r)}if(t){let e=new G(new q(.46,.42,.26,8),i.trimMat);e.position.set(0,1.92,.42),k.add(e);for(let e=0;e<6;e++){let t=e/6*Math.PI*2,n=new G(new J(.11,.36,4),e%2==0?i.trimMat:i.rainbowMats[e]);n.position.set(Math.cos(t)*.4,2.18,.42+Math.sin(t)*.4),k.add(n)}}let re=t?2.28:1.96,N=new H;N.position.set(0,1.72,.72),N.rotation.x=.66;let ie=new G(new ja(.24,.08,6,12),i.trimMat);ie.rotation.x=Math.PI/2,N.add(ie);let ae=new G(new J(.25,re,10),i.trimMat);ae.position.set(0,re*.5,0),N.add(ae);let oe=t?6:5;for(let e=0;e<oe;e++){let n=(e+.4)/oe,r=t?i.rainbowMats[e%i.rainbowMats.length]:e%2==0?i.primaryMat:i.accentMat,a=new G(new ja(.24*(1-n*.78),.042,6,12),r);a.rotation.x=Math.PI/2+.16,a.position.set(0,n*re*.88,0),N.add(a)}let se=new H;se.position.set(0,re*.58,0),se.rotation.x=Math.PI/2;let ce=new G(new ja(.56,.045,6,18),i.trimMat);se.add(ce);for(let e=0;e<6;e++){let t=e/6*Math.PI*2,n=new G(new Da(.12,0),i.rainbowMats[e]);n.position.set(Math.cos(t)*.56,Math.sin(t)*.56,0),se.add(n)}N.add(se),l.push(se);let le=new G(new Da(.16,0),i.glowMat);le.position.set(0,re+.04,0),N.add(le),k.add(N);let ue=bd(i.glowMat,t?3.2:2.85);return a.add(ue,o),vd(o),{chassis:e,root:a,bodyGroup:o,turretGroup:k,leftLeg:p,rightLeg:m,spiderLegs:_,spinClusters:l,recoilBarrels:u,meleeArm:N,wingPylons:O,hazardRing:ue,primaryMat:i.primaryMat,accentMat:i.accentMat,trimMat:i.trimMat,darkSteelMat:i.darkSteelMat,glowMat:i.glowMat,flashMaterials:i.flashMaterials}}function Sd(){return{WARDEN_MECH:xd(`WARDEN_MECH`),SIEGE_TANK:xd(`SIEGE_TANK`),KRAKEN_WALKER:xd(`KRAKEN_WALKER`),SOVEREIGN_TITAN:xd(`SOVEREIGN_TITAN`)}}var Cd=[-3.85,0,3.85],wd=.76,Td=30.5,Ed=8,Dd=[[!0,!1,!1],[!1,!0,!1],[!1,!1,!0]],Od=[[[!0,!0,!1],[!0,!1,!0]],[[!0,!0,!1],[!1,!0,!0]],[[!1,!0,!0],[!0,!1,!0]]];function kd(e,t,n){let r=e<-1.45?0:e>1.45?2:1;if(t===1)return Dd[r];let i=Math.abs(Math.floor(n))%2;return Od[r][i]}function Ad(){let e=document.createElement(`canvas`);e.width=128,e.height=128;let t=e.getContext(`2d`);t.clearRect(0,0,128,128),t.fillStyle=`rgba(255, 36, 66, 0.34)`,t.fillRect(0,0,128,128),t.fillStyle=`rgba(255, 196, 72, 0.88)`;for(let e of[26,90])t.beginPath(),t.moveTo(14,e-18),t.lineTo(64,e+16),t.lineTo(114,e-18),t.lineTo(114,e+4),t.lineTo(64,e+38),t.lineTo(14,e+4),t.closePath(),t.fill();let n=new Wi(e);return n.wrapS=ne,n.wrapT=te,n.colorSpace=yt,n}var jd=class{entityId=999;tacticalRigs;unicornRigs;skinTheme=`UNICORN`;latestDef=null;activeChassis=`WARDEN_MECH`;active=!1;defeated=!1;name=`Sapphire Charger Stallion`;maxHp=1100;currentHp=1100;segments=5;advanceSpeed=1.25;salvoLanes=1;salvoInterval=2.5;salvoDamage=5;rewardCoins=75;x=0;z=-280;walkPhase=0;lastFootstepCycle=0;hitFlash=0;hitFlashCooldown=0;slamTimer=0;barrelSpin=0;laneVisuals=[];chevronTex;warheads=[];warheadShellMat;warheadWakeMat;warheadGroundHaloMat;lockedLaneMask=[!1,!1,!1];telegraphTimer=0;salvoCooldown=.85;salvoCycleIndex=0;lastStepTriggeredShake=!1;lastStepSlamDamage=0;lastStepSalvoWarning=!1;lastStepSalvoLaunched=!1;lastStepSalvoHitDamage=0;lastStepSalvoHitX=0;lastStepSalvoDodgedCount=0;lastStepSalvoDodgeX=0;lastStepSegmentBroken=!1;constructor(e){this.tacticalRigs=md(),this.unicornRigs=Sd();for(let t of Object.keys(this.tacticalRigs))this.tacticalRigs[t].root.visible=!1,this.unicornRigs[t].root.visible=!1,e.add(this.tacticalRigs[t].root),e.add(this.unicornRigs[t].root);this.chevronTex=Ad();let t=new Oa(3.06,1);t.rotateX(-Math.PI/2);let n=new Oa(.16,1);n.rotateX(-Math.PI/2);let r=new ka(.65,1.28,24);r.rotateX(-Math.PI/2);for(let i=0;i<3;i++){let i=new H;i.visible=!1;let a=new W({color:16777215,map:this.chevronTex,transparent:!0,opacity:.56,blending:2,side:2,depthWrite:!1}),o=new W({color:16752430,transparent:!0,opacity:.78,blending:2,side:2,depthWrite:!1}),s=new W({color:16729943,transparent:!0,opacity:.85,blending:2,side:2,depthWrite:!1}),c=new H,l=new G(t,a),u=new G(n,o);u.position.x=-1.53;let d=new G(n,o);d.position.x=1.53,c.add(l,u,d);let f=new G(r,s);i.add(c,f),e.add(i),this.laneVisuals.push({root:i,carpetGroup:c,carpetMat:a,railMat:o,reticleRing:f,reticleMat:s})}let i=new Da(.42,1),a=new W({color:16768894}),o=new Da(.62,0);this.warheadShellMat=new W({color:2399743,transparent:!0,opacity:.72,blending:2,depthWrite:!1});let s=new J(.46,2.1,10);s.rotateX(-Math.PI/2),this.warheadWakeMat=new W({color:2287720,transparent:!0,opacity:.65,blending:2,depthWrite:!1});let c=new ka(.32,.92,18);c.rotateX(-Math.PI/2),this.warheadGroundHaloMat=new W({color:16765496,transparent:!0,opacity:.62,blending:2,side:2,depthWrite:!1});for(let t=0;t<Ed;t++){let t=new H;t.visible=!1;let n=new G(i,a);n.position.y=.92;let r=new G(o,this.warheadShellMat);r.position.y=.92,n.add(r);let l=new G(s,this.warheadWakeMat);l.position.set(0,.92,-1.05);let u=new G(c,this.warheadGroundHaloMat);u.position.set(0,.05,0),t.add(n,l,u),e.add(t),this.warheads.push({root:t,coreMesh:n,active:!1,laneIndex:1,x:0,z:0,damage:5})}this.syncSalvoPalette()}get rigs(){return this.skinTheme===`UNICORN`?this.unicornRigs:this.tacticalRigs}get activeRig(){return this.rigs[this.activeChassis]}get isTelegraphingSalvo(){return this.telegraphTimer>0}syncSalvoPalette(){let e=this.skinTheme===`UNICORN`;this.warheadShellMat.color.setHex(e?2399743:16723532),this.warheadWakeMat.color.setHex(e?2287720:16735787),this.warheadGroundHaloMat.color.setHex(e?16765496:16726092);for(let t=0;t<this.laneVisuals.length;t++)this.laneVisuals[t].railMat.color.setHex(e?3725567:16752430),this.laneVisuals[t].reticleMat.color.setHex(e?2399743:16729943)}syncActiveThemeRigAppearance(){let e=this.latestDef,t=this.skinTheme===`UNICORN`,n=t?this.unicornRigs:this.tacticalRigs,r=t?this.tacticalRigs:this.unicornRigs;for(let e of Object.keys(r))r[e].root.visible=!1;if(!e){for(let e of Object.keys(n))n[e].root.visible=!1;return}let i=bu(e,this.skinTheme);this.name=i.name;for(let r of Object.keys(n)){let a=n[r],o=this.active&&!this.defeated&&r===e.chassis;if(a.root.visible=o,o){if(a.primaryMat.color.setHex(i.primaryHex),a.accentMat.color.setHex(i.accentHex),a.trimMat.color.setHex(i.trimHex),a.glowMat.color.setHex(i.trimHex),a.bodyGroup.rotation.set(0,0,0),a.leftLeg&&a.leftLeg.rotation.set(0,0,0),a.rightLeg&&a.rightLeg.rotation.set(0,0,0),a.spiderLegs)for(let e=0;e<a.spiderLegs.length;e++)a.spiderLegs[e].rotation.set(0,0,0);a.turretGroup&&a.turretGroup.rotation.set(0,0,0),a.meleeArm&&a.meleeArm.rotation.set(t?.66:0,0,0),a.root.position.set(this.x,0,this.z)}}this.applyFlash(this.hitFlash)}setSkinTheme(e){this.skinTheme!==e&&(this.skinTheme=e,this.syncSalvoPalette(),this.syncActiveThemeRigAppearance())}configure(e,t){this.latestDef=e,this.active=!0,this.defeated=!1,this.activeChassis=e.chassis,this.maxHp=e.maxHp,this.currentHp=e.maxHp,this.segments=e.segments,this.advanceSpeed=e.advanceSpeed,this.salvoLanes=e.salvoLanes,this.salvoInterval=e.salvoInterval,this.salvoDamage=e.salvoDamage,this.rewardCoins=e.rewardCoins,this.x=0,this.z=-t-16.5,this.walkPhase=0,this.lastFootstepCycle=0,this.hitFlash=0,this.hitFlashCooldown=0,this.slamTimer=0,this.barrelSpin=0,this.clearSalvoVisuals(),this.salvoCooldown=.55,this.salvoCycleIndex=0,this.syncActiveThemeRigAppearance()}clearSalvoVisuals(){this.telegraphTimer=0,this.lockedLaneMask=[!1,!1,!1];for(let e=0;e<3;e++)this.laneVisuals[e].root.visible=!1;for(let e=0;e<Ed;e++)this.warheads[e].active=!1,this.warheads[e].root.visible=!1}hide(){this.active=!1,this.clearSalvoVisuals();for(let e of Object.keys(this.tacticalRigs))this.tacticalRigs[e].root.visible=!1,this.unicornRigs[e].root.visible=!1}applyFlash(e){let t=this.activeRig,n=e>.15?.88:e*2.4;t.primaryMat.emissive.setRGB(n,n,n),t.darkSteelMat.emissive.setRGB(n*.85,n*.85,n*.85),t.accentMat.emissive.setRGB(n,n,n),t.trimMat.emissive.setRGB(n,n,n)}update(e,t,n,r,i){if(this.lastStepTriggeredShake=!1,this.lastStepSlamDamage=0,this.lastStepSalvoWarning=!1,this.lastStepSalvoLaunched=!1,this.lastStepSalvoHitDamage=0,this.lastStepSalvoDodgedCount=0,!this.active||this.defeated)return;let a=this.activeRig,o=this.skinTheme===`UNICORN`;this.hitFlashCooldown>0&&(this.hitFlashCooldown=Math.max(0,this.hitFlashCooldown-e)),this.hitFlash>0&&(this.hitFlash=Math.max(0,this.hitFlash-e*24),this.applyFlash(this.hitFlash));let s=this.telegraphTimer>0?30:t?18.5:3.5;this.barrelSpin+=e*s;for(let e=0;e<a.spinClusters.length;e++){let t=e%2==0?1:-1;!o&&this.activeChassis===`KRAKEN_WALKER`?a.spinClusters[e].rotation.y=this.barrelSpin*.5:a.spinClusters[e].rotation.z=this.barrelSpin*t}let c=1+Math.sin(this.barrelSpin*.32)*.06;a.hazardRing.scale.set(c,c,1);let l=o?this.activeChassis===`SOVEREIGN_TITAN`?1.88:1.65:this.activeChassis===`SIEGE_TANK`?.55:this.activeChassis===`KRAKEN_WALKER`?1.48:this.activeChassis===`SOVEREIGN_TITAN`?1.78:1.58;if(!t){if(this.walkPhase+=e*2.2,a.bodyGroup.position.y=l+Math.sin(this.walkPhase)*.05,a.bodyGroup.rotation.x=0,o&&a.turretGroup&&a.turretGroup.rotation.set(Math.sin(this.walkPhase*.8)*.04,-.18,0),a.wingPylons){let e=Math.sin(this.walkPhase*.9)*(o?.11:.06);a.wingPylons[0].rotation.z=.42+e,a.wingPylons[1].rotation.z=-.42-e}return}let u=r-2.35;if(this.z<u){this.z=Math.min(u,this.z+this.advanceSpeed*e);let t=Math.max(-2.65,Math.min(2.65,n*.68))-this.x;this.x+=Math.sign(t)*Math.min(Math.abs(t),1.65*e);let r=o?5.6:this.activeChassis===`KRAKEN_WALKER`?6.6:4.6;this.walkPhase+=e*r;let i=Math.floor(this.walkPhase/Math.PI);i!==this.lastFootstepCycle&&(this.lastFootstepCycle=i,this.lastStepTriggeredShake=!0),this.animateChassisAdvance(a,l,n)}else i>0&&(this.slamTimer-=e,this.slamTimer<=0&&(this.slamTimer=.22,this.lastStepTriggeredShake=!0,this.lastStepSlamDamage=Math.max(2,Math.ceil(i*.28))),a.bodyGroup.position.y=l+Math.sin(this.slamTimer*30)*.18,a.bodyGroup.rotation.x=.15+Math.sin(this.slamTimer*30)*.09,a.meleeArm&&(a.meleeArm.rotation.x=(o?.66:.55)+Math.sin(this.slamTimer*30)*(o?.38:.65)));a.root.position.set(this.x,0,this.z),this.updateSalvoAttacks(e,n,r,i)}updateSalvoAttacks(e,t,n,r){this.telegraphTimer>0?(this.telegraphTimer+=e,this.telegraphTimer>=.76&&(this.telegraphTimer=0,this.salvoCooldown=this.salvoInterval,this.spawnSalvoWarheads(),this.lastStepSalvoLaunched=!0)):r>0&&this.z<n-4.5&&(this.salvoCooldown-=e,this.salvoCooldown<=0&&(this.lockedLaneMask=kd(t,this.salvoLanes,this.salvoCycleIndex++),this.telegraphTimer=.001,this.lastStepSalvoWarning=!0));let i=!1,a=!1,o=!1;for(let s=0;s<Ed;s++){let c=this.warheads[s];c.active&&(c.z+=Td*e,c.coreMesh.rotation.z+=e*15,c.coreMesh.rotation.x+=e*9,c.root.position.set(c.x,0,c.z),c.z>=n-.18?(c.active=!1,c.root.visible=!1,r>0&&(Math.abs(t-c.x)<1.72?(this.lastStepSalvoHitDamage+=c.damage,this.lastStepSalvoHitX=c.x):(this.lastStepSalvoDodgedCount+=1,this.lastStepSalvoDodgeX=c.x))):c.laneIndex===0?i=!0:c.laneIndex===1?a=!0:o=!0)}let s=this.telegraphTimer>0,c=s?Math.min(1,this.telegraphTimer/wd):1,l=s?.55+.45*Math.sin(c*Math.PI*7):.55,u=this.z+1.4,d=n+1.5,f=Math.max(2,d-u),p=(u+d)*.5;this.chevronTex.repeat.set(1,Math.max(2,f*.42)),this.chevronTex.offset.y=(this.chevronTex.offset.y+e*3.6)%1;for(let e=0;e<3;e++){let t=this.laneVisuals[e],r=e===0?i:e===1?a:o,u=s&&this.lockedLaneMask[e]||r;if(t.root.visible=u,!u)continue;let d=Cd[e];t.carpetGroup.position.set(d,.045,p),t.carpetGroup.scale.set(1,1,f),t.carpetMat.opacity=s?.38+.42*c*l:.34,t.railMat.opacity=s?.55+.45*l:.48;let m=s?1.25-.35*c:.92;t.reticleRing.position.set(d,.055,n),t.reticleRing.scale.set(m,m,1),t.reticleMat.opacity=s?.55+.42*l:.48}}spawnSalvoWarheads(){let e=this.z+1.5;for(let t=0;t<3;t++)if(this.lockedLaneMask[t])for(let n=0;n<Ed;n++){let r=this.warheads[n];if(!r.active){r.active=!0,r.laneIndex=t,r.x=Cd[t],r.z=e,r.damage=this.salvoDamage,r.root.position.set(r.x,0,r.z),r.root.visible=!0;break}}}animateChassisAdvance(e,t,n){let r=this.walkPhase;if(this.skinTheme===`UNICORN`&&e.spiderLegs){let[i,a,o,s]=e.spiderLegs,c=Math.sin(r)*.34;if(i.rotation.x=c,s.rotation.x=c*.88,a.rotation.x=-c,o.rotation.x=-c*.88,e.bodyGroup.position.y=t+Math.abs(Math.sin(r))*.11,e.bodyGroup.rotation.x=.03+Math.sin(r*2)*.035,e.bodyGroup.rotation.z=Math.sin(r)*.025,e.turretGroup){let t=-.18+Math.max(-.3,Math.min(.3,(n-this.x)*.12)),i=this.telegraphTimer>0?Math.min(1,this.telegraphTimer/wd):0;e.turretGroup.rotation.y=t,e.turretGroup.rotation.x=Math.sin(r*2)*.045+i*.28}if(e.wingPylons){let t=Math.sin(r*1.6)*.15;e.wingPylons[0].rotation.z=.44+t,e.wingPylons[1].rotation.z=-.44-t}for(let t=0;t<e.recoilBarrels.length;t++){let n=Math.max(0,Math.sin(r*2.2+t*Math.PI))*.24;e.recoilBarrels[t].position.z=.76-n}}else if(this.activeChassis===`WARDEN_MECH`||this.activeChassis===`SOVEREIGN_TITAN`){let n=Math.sin(r)*.38;if(e.leftLeg&&(e.leftLeg.rotation.x=n),e.rightLeg&&(e.rightLeg.rotation.x=-n),e.bodyGroup.position.y=t+Math.abs(Math.cos(r))*.12,e.bodyGroup.rotation.x=.06+Math.abs(Math.sin(r))*.04,e.bodyGroup.rotation.z=Math.sin(r)*.035,e.wingPylons){let t=Math.sin(r*1.5)*.1;e.wingPylons[0].rotation.z=.46+t,e.wingPylons[1].rotation.z=-.46-t}e.meleeArm&&(e.meleeArm.rotation.x=Math.sin(r)*.24)}else if(this.activeChassis===`SIEGE_TANK`){if(e.bodyGroup.position.y=t+Math.sin(r*2.8)*.035,e.bodyGroup.rotation.x=Math.sin(r*1.4)*.025,e.turretGroup){let t=Math.max(-.35,Math.min(.35,(n-this.x)*.14));e.turretGroup.rotation.y=t}for(let t=0;t<e.recoilBarrels.length;t++){let n=Math.max(0,Math.sin(r*2.2+t*Math.PI))*.28;e.recoilBarrels[t].position.z=.76-n}}else if(this.activeChassis===`KRAKEN_WALKER`&&e.spiderLegs){let[n,i,a,o]=e.spiderLegs,s=Math.sin(r),c=Math.sin(r+Math.PI);n.rotation.y=.48+s*.28,n.rotation.z=Math.max(0,s)*.18,o.rotation.y=.48-s*.28,o.rotation.z=-Math.max(0,s)*.18,i.rotation.y=-.48-c*.28,i.rotation.z=-Math.max(0,c)*.18,a.rotation.y=-.48+c*.28,a.rotation.z=Math.max(0,c)*.18,e.bodyGroup.position.y=t+Math.sin(r*2)*.08,e.bodyGroup.rotation.z=Math.sin(r)*.05;for(let t=0;t<e.recoilBarrels.length;t++){let n=Math.max(0,Math.sin(r*2+t*Math.PI))*.2;e.recoilBarrels[t].position.z=.75-n}}}tryBulletHit(e,t,n,r,i,a){if(this.lastStepSegmentBroken=!1,!this.active||this.defeated||a===this.entityId)return`NONE`;let o=this.activeChassis===`SIEGE_TANK`?1.65:1.45,s=this.activeChassis===`KRAKEN_WALKER`||this.activeChassis===`SIEGE_TANK`?2.45:2.25,c=Math.min(t,n)-o,l=Math.max(t,n)+o;if(this.z<c||this.z>l||Math.abs(e-this.x)>s)return`NONE`;let u=Math.max(1,this.segments),d=Math.ceil(this.currentHp/Math.max(1,this.maxHp)*u);this.currentHp-=r*i;let f=Math.ceil(Math.max(0,this.currentHp)/Math.max(1,this.maxHp)*u);return this.hitFlashCooldown<=0&&(this.hitFlash=1,this.hitFlashCooldown=.14,this.applyFlash(1)),this.currentHp<=0?(this.currentHp=0,this.defeated=!0,this.active=!1,this.hide(),`DEFEATED`):(f<d&&(this.lastStepSegmentBroken=!0),`HIT`)}getRecommendedSafeLaneX(e){if(!this.active||this.defeated)return null;let t=!1,n=!1,r=!1;this.telegraphTimer>0&&(t=this.lockedLaneMask[0],n=this.lockedLaneMask[1],r=this.lockedLaneMask[2]);for(let e=0;e<Ed;e++){let i=this.warheads[e];i.active&&(i.laneIndex===0?t=!0:i.laneIndex===1?n=!0:i.laneIndex===2&&(r=!0))}if(!t&&!n&&!r)return null;let i=null,a=999,o=[t,n,r];for(let t=0;t<3;t++)if(!o[t]){let n=Cd[t],r=Math.abs(e-n);r<a&&(a=r,i=n)}return i}},Md=.72,Nd=.58,Pd=.24,Fd=6.12,Id=5.62,Ld=4.85,Rd=5.1,zd=7.45,Bd=-.88;function Vd(e=40,t=Md,n=Nd){let r=[];for(let e=-5;e<=5;e++){let i=Math.abs(e)%2*.5;for(let a=-5;a<=5;a++){let o=(a+i-(i>0?.5:0))*t;if(Math.abs(o)>2.75)continue;let s=e*n,c=Math.hypot(o*.86,s*1.15),l=Math.abs((e*37+a*17+97)%29),u=e===0&&Math.abs(a)<=1?0:(l%7-3)*.022,d=e===0&&Math.abs(a)<=1?0:(l*3%7-3)*.024;r.push({x:o+u,z:s+d,radius:c})}}r.sort((e,t)=>Math.abs(e.radius-t.radius)>.04?e.radius-t.radius:Math.abs(e.z-t.z)>.04?e.z-t.z:Math.abs(e.x)-Math.abs(t.x));let i=r.slice(0,Math.max(1,e)),a=0;for(let e=0;e<Math.min(8,i.length);e++)i[e].z<a&&(a=i[e].z);let o=-a*.65;return i.map((e,t)=>({x:t===0?0:e.x,z:t===0?0:e.z+o,radius:Math.hypot(e.x,e.z+o)}))}var Hd=Vd(40,Md,Nd);function Ud(e,t,n){let r=Math.max(1,Math.min(40,Math.floor(t))),i=Math.max(0,Math.min(r-1,e)),a=0,o=0;if(r===1)a=0,o=0;else if(r===2)a=(i===0?-.5:.5)*Md,o=0;else if(r===3)a=(i-1)*Md,o=0;else{let e=0,t=999;for(let n=0;n<r;n++){let r=Hd[n];e+=r.x,r.z<t&&(t=r.z)}let n=e/r,s=Hd[i];a=s.x-n,o=s.z-t}return n?(n.x=a,n.z=o,n):{x:a,z:o}}function Wd(e){if(e<=0)return 0;let t=Math.max(1,Math.min(40,Math.floor(e)));if(t===1)return Pd;if(t===2)return .6;if(t===3)return .96;let n=0;for(let e=0;e<t;e++)n+=Hd[e].x;let r=n/t,i=0;for(let e=0;e<t;e++){let t=Math.abs(Hd[e].x-r);t>i&&(i=t)}return i+Pd}function Gd(e,t=1,n=Ld){let r=Math.max(0,n);return e<-r?-r:e>r?r:e}function Kd(e,t=0,n=Rd){let r=Math.max(.5,n);if(e>r)return r-Math.abs(t)*7%5*.055;if(e<-r){let e=Math.abs(t)*7%5*.055;return-r+e}return e}var qd=52,Jd=class{entityId;active=!1;aliveCount=0;initialCount=0;hpPerEnemy=15;speed=2.1;x=0;z=0;marchPhase=0;isMarching=!1;unitCountCap=qd;unitAlive=new Uint8Array(qd);unitIsHeavy=new Uint8Array(qd);unitIsVanguard=new Uint8Array(qd);unitX=new Float32Array(qd);unitZ=new Float32Array(qd);unitHp=new Float32Array(qd);unitMaxHp=new Float32Array(qd);unitHitFlash=new Float32Array(qd);unitCoins=new Float32Array(qd);lastKillCount=0;lastKills=[];totalConfigured=0;withinRenderRange=!0;constructor(e){this.entityId=800+e;for(let e=0;e<8;e++)this.lastKills.push({x:0,z:0,isHeavy:!1,coinReward:0})}configure(e){this.active=!0,this.totalConfigured=Math.max(1,Math.min(qd,e.count)),this.initialCount=this.totalConfigured,this.aliveCount=this.totalConfigured,this.hpPerEnemy=Math.max(2,e.hpPerEnemy),this.speed=e.speed,this.x=e.lane===`LEFT`?-1.85:e.lane===`RIGHT`?1.85:0,this.z=e.z,this.marchPhase=0,this.isMarching=!1,this.withinRenderRange=!0,this.lastKillCount=0;let t=e.heavyCount??Math.max(2,Math.floor(this.totalConfigured*.24)),n=e.vanguardRatio??.34,r=e.coinPerKill??8,i=e.lane===`CENTER`?4.65:2.35,a=e.lane===`CENTER`?7:5,o=Math.max(1,Math.ceil(this.totalConfigured/a)),s=Math.max(1,Math.round(o*n)),c=Math.floor(a/2),l=[];for(let e=0;e<this.totalConfigured;e++)l.push(e);l.sort((e,t)=>{let n=Math.floor(e/a),r=Math.floor(t/a);return n===r?Math.abs(e%a-c)-Math.abs(t%a-c):n-r});let u=new Set(l.slice(0,Math.max(0,t))),d=e.z;for(let t=0;t<this.totalConfigured;t++){this.unitAlive[t]=1;let n=+!!u.has(t);this.unitIsHeavy[t]=n;let o=Math.floor(t/a);this.unitIsVanguard[t]=+(!n&&o<s);let c=t%a,l=a>1?c/(a-1)-.5:0,f=o%2*.28-.14,p=((t*17+5)%11-5)*.08+f,m=((t*13+3)%9-4)*.12,h=Math.max(-5.02,Math.min(5.02,this.x+l*i*2+p)),g=e.z-o*.96+m;this.unitX[t]=h,this.unitZ[t]=g,(t===0||g>d)&&(d=g);let _=n?this.hpPerEnemy*3.4:this.hpPerEnemy;this.unitMaxHp[t]=_,this.unitHp[t]=_,this.unitHitFlash[t]=0,this.unitCoins[t]=n?Math.round(r*3.2):r}this.z=Math.fround(d)}hide(){this.active=!1,this.aliveCount=0,this.totalConfigured=0,this.isMarching=!1}update(e,t,n,r=null){if(!this.active||this.aliveCount<=0)return;if(this.withinRenderRange=n-this.z<126,!this.withinRenderRange){this.isMarching=!1;return}let i=r!==null&&this.z<=r+1.5,a=r===null?1/0:r-32,o=!i&&n-this.z<40;this.isMarching=o,o&&(this.z=Math.min(a,this.z+this.speed*e),this.marchPhase+=e*9.8);let s=0,c=0,l=-999999;for(let r=0;r<this.totalConfigured;r++)if(this.unitAlive[r]!==0){if(this.unitHitFlash[r]>0&&(this.unitHitFlash[r]=Math.max(0,this.unitHitFlash[r]-e*26)),o){let i=this.unitIsHeavy[r]===1?.9:this.unitIsVanguard[r]===1?1.14:1;this.unitZ[r]=Math.min(a,this.unitZ[r]+this.speed*i*e);let o=n-this.unitZ[r];if(o<10.5&&o>-1){let n=t-this.unitX[r],i=this.unitIsVanguard[r]===1?.34:.24;this.unitX[r]+=Math.sign(n)*Math.min(Math.abs(n),i*e)}}else this.unitZ[r]>a&&(this.unitZ[r]=a);this.unitZ[r]>n+14?this.unitAlive[r]=0:(s++,c+=this.unitX[r],this.unitZ[r]>l&&(l=this.unitZ[r]))}this.aliveCount=s,s<=0?this.active=!1:(this.x=c/s,this.z=l)}pushInstances(e,t=!0){if(!this.active||this.aliveCount<=0||!this.withinRenderRange)return;let n=t&&this.isMarching;for(let t=0;t<this.totalConfigured;t++)this.unitAlive[t]!==0&&(this.unitIsHeavy[t]===1?e.pushHeavyEnemySoldier(this.unitX[t],this.unitZ[t],this.marchPhase+t*.65,this.unitHitFlash[t],n):e.pushEnemySoldier(this.unitX[t],this.unitZ[t],this.marchPhase+t*.85,this.unitHitFlash[t],n,this.unitIsVanguard[t]===1))}tryBulletHit(e,t,n,r,i){if(!this.active||this.aliveCount<=0)return-1;let a=-1,o=-999999,s=Math.min(t,n),c=Math.max(t,n);for(let t=0;t<this.totalConfigured;t++){if(this.unitAlive[t]===0||this.entityId*64+t===i)continue;let n=this.unitIsHeavy[t]===1?.66:.48,r=this.unitZ[t];r<s-n||r>c+n||Math.abs(e-this.unitX[t])>n||r>o&&(o=r,a=t)}if(a<0)return-1;if(this.lastKillCount=0,this.unitHitFlash[a]=1,this.unitHp[a]-=r,this.unitHp[a]<=0){this.unitAlive[a]=0,this.aliveCount=Math.max(0,this.aliveCount-1);let e=this.lastKills[0];return e.x=this.unitX[a],e.z=this.unitZ[a],e.isHeavy=this.unitIsHeavy[a]===1,e.coinReward=this.unitCoins[a],this.lastKillCount=1,this.aliveCount<=0&&(this.active=!1),1}return 0}resolveSquadCollision(e,t,n){if(!this.active||this.aliveCount<=0||n<=0)return null;let r=Wd(n),i=0,a=e,o=t;for(let s=0;s<this.totalConfigured;s++){if(this.unitAlive[s]===0)continue;let c=this.unitIsHeavy[s]===1?.56:.4;if(Math.abs(this.unitZ[s]-t)<=.74+c*.42&&Math.abs(this.unitX[s]-e)<=r+c){let e=this.unitIsHeavy[s]===1?2:1;if(i+=e,a=this.unitX[s],o=this.unitZ[s],this.unitAlive[s]=0,this.aliveCount=Math.max(0,this.aliveCount-1),i>=n)break}}return this.aliveCount<=0&&(this.active=!1),i<=0?null:{playerLosses:Math.min(n,i),hitX:a,hitZ:o}}getConfiguredCount(){return this.totalConfigured}},Yd=99.9,Xd=.14,Zd=.13,Qd=.45,$d=4.5,ef=3.8,tf=-6.04,nf=6.04,rf=.315,af=.685;function of(e,t,n){return e===`MUL`?n?16+Math.max(1,t)*9:t>=1?16+(t-1)*20:16+(1-t)*14:e===`DIV`?16+Math.max(1,t)*8:t>=0?16+t*2.55:16+Math.abs(t)*.68}function sf(e,t,n,r,i,a){let o=of(e,t,n),s=of(r,i,a),c=o/Math.max(1e-4,o+s);return Math.max(rf,Math.min(af,c))}function cf(e,t,n=`ADD`){if(n===`MUL`){if(t<1-1e-6)return e;let n=Math.max(0,Math.round((t-1)*10));return e*(1+n*Zd+n*n*.0045)}return t<0?e:e*(1+t*Xd+t*t*.015)}function lf(e,t){if(e.isLocked||e.operator===`DIV`||e.damagePerIncrement<=0||t<=0)return{value:e.value,hitAccumulator:e.hitAccumulator,deltaIncrements:0,crossedZeroOrPositive:!1,flippedToPositive:!1,ricochet:e.isLocked,ringProgress:0};if(e.operator===`MUL`){let n=Math.max(1,Math.round(e.value*20)),r=Math.round(Yd*20);if(n>=r)return{value:Yd,hitAccumulator:0,deltaIncrements:0,crossedZeroOrPositive:!1,flippedToPositive:!1,ricochet:!1,ringProgress:.999};let i=n,a=e.hitAccumulator+t,o=0;for(;i<r;){let t=i/20,n=cf(e.damagePerIncrement,t,`MUL`);if(a+1e-9<n)break;a=Math.max(0,a-n),i<20||i%2!=0?i+=1:i+=2,o+=1}i>=r&&(i=r,a=0);let s=i/20,c=cf(e.damagePerIncrement,s,`MUL`),l=n<20&&i>=20||n>=20&&n<30&&i>=30;return{value:s,hitAccumulator:a,deltaIncrements:o,crossedZeroOrPositive:l,flippedToPositive:l,ricochet:!1,ringProgress:i>=r?.999:Math.min(.999,Math.max(0,a/c))}}if(e.value>=99)return{value:e.value,hitAccumulator:0,deltaIncrements:0,crossedZeroOrPositive:!1,flippedToPositive:!1,ricochet:!1,ringProgress:.999};let n=e.value,r=e.hitAccumulator+t,i=0;for(;n<99;){let t=cf(e.damagePerIncrement,n,`ADD`);if(r+1e-9<t)break;r=Math.max(0,r-t),n+=1,i+=1}n>=99&&(r=0);let a=cf(e.damagePerIncrement,n,`ADD`),o=e.value<0&&n>=0,s=e.value<=0&&n>0;return{value:n,hitAccumulator:r,deltaIncrements:i,crossedZeroOrPositive:o,flippedToPositive:s,ricochet:!1,ringProgress:n>=99?.999:Math.min(.999,Math.max(0,r/a))}}function uf(e,t){if(e.isLocked||e.operator===`DIV`||e.damagePerIncrement<=0||t<=0)return{value:e.value,hitAccumulator:e.hitAccumulator,timeSinceLastHit:e.timeSinceLastHit,decayAccumulator:e.decayAccumulator,deltaDecrements:0,flippedBackToNegative:!1,ringProgress:0};let n=e.timeSinceLastHit+t,r=cf(e.damagePerIncrement,e.value,e.operator);if(n<=.45)return{value:e.value,hitAccumulator:e.hitAccumulator,timeSinceLastHit:n,decayAccumulator:0,deltaDecrements:0,flippedBackToNegative:!1,ringProgress:Math.min(.999,Math.max(0,e.hitAccumulator/Math.max(1e-6,r)))};let i=Math.min(t,n-Qd);if(e.value<=e.initialValue+1e-6&&e.hitAccumulator<=0)return{value:e.initialValue,hitAccumulator:0,timeSinceLastHit:n,decayAccumulator:0,deltaDecrements:0,flippedBackToNegative:!1,ringProgress:0};let a=ff(e.operator,e.value,e.isLocked),o=e.hitAccumulator,s=e.decayAccumulator,c=0;if(o>0){let t=Math.max(1e-4,r)*5,a=t*i;if(a<o)return o-=a,{value:e.value,hitAccumulator:o,timeSinceLastHit:n,decayAccumulator:0,deltaDecrements:0,flippedBackToNegative:!1,ringProgress:Math.min(.999,Math.max(0,o/Math.max(1e-6,r)))};let c=i-o/t;if(o=0,c<=0)return{value:e.value,hitAccumulator:0,timeSinceLastHit:n,decayAccumulator:0,deltaDecrements:0,flippedBackToNegative:!1,ringProgress:0};if(e.operator===`MUL`){let t=Math.round(e.value*20),n=Math.round(e.initialValue*20),r=Math.max(0,t-n),i=ef+Math.min(3,r*.1);s+=c*i}else{let t=Math.max(0,e.value-e.initialValue),n=$d+Math.min(4,t*.14);s+=c*n}}else if(e.operator===`MUL`){let t=Math.round(e.value*20),n=Math.round(e.initialValue*20),r=Math.max(0,t-n),a=ef+Math.min(3,r*.1);s+=i*a}else{let t=Math.max(0,e.value-e.initialValue),n=$d+Math.min(4,t*.14);s+=i*n}if(e.operator===`MUL`){let t=Math.round(e.value*20),r=Math.round(e.initialValue*20);for(;s>=1&&t>r;)--s,t=t>20&&t%2==0?Math.max(r,t-2):Math.max(r,t-1),c+=1;t<=r&&(t=r,s=0);let i=t/20,o=ff(`MUL`,i,e.isLocked);return{value:i,hitAccumulator:0,timeSinceLastHit:n,decayAccumulator:s,deltaDecrements:c,flippedBackToNegative:!a&&o,ringProgress:0}}let l=Math.round(e.value),u=Math.round(e.initialValue);for(;s>=1&&l>u;)--s,--l,c+=1;l<=u&&(l=u,s=0);let d=ff(`ADD`,l,e.isLocked);return{value:l,hitAccumulator:0,timeSinceLastHit:n,decayAccumulator:s,deltaDecrements:c,flippedBackToNegative:!a&&d,ringProgress:0}}function df(e,t,n,r=40){if(e<=0)return 0;let i=e;switch(t){case`ADD`:i=e+Math.round(n);break;case`MUL`:i=n<1-1e-6?Math.floor(e*Math.max(0,n)):Math.round(e*n);break;case`DIV`:i=Math.max(1,Math.floor(e/Math.max(1,n)))}return Math.min(r,Math.max(0,i))}function ff(e,t,n=!1){return e===`DIV`?!0:e===`MUL`?t<1-1e-6:t<0}function pf(e,t,n=!0){if(e===`MUL`){if(!n){let e=Math.round(t*20);return e<20||e%2!=0?`X${(e/20).toFixed(2)}`:`X${(e/20).toFixed(1)}`}return Math.abs(t-Math.round(t))>.01?`X${t.toFixed(1)}`:`X${Math.round(t)}`}if(e===`DIV`)return`÷${Math.round(t)}`;let r=Math.round(t);return r>=0?`+${r}`:`${r}`}var mf={fireRate:{key:`fireRate`,title:`Fire Rate`,shortcutKey:`1`,baseCost:30,costGrowth:1.34,maxLevel:999,description:`+6% volley speed`},bulletPower:{key:`bulletPower`,title:`Ordnance`,shortcutKey:`2`,baseCost:35,costGrowth:1.35,maxLevel:999,description:`+10% bullet damage`},warChest:{key:`warChest`,title:`Bounty`,shortcutKey:`3`,baseCost:35,costGrowth:1.34,maxLevel:999,description:`+10% coin bounty`},startingSquad:{key:`startingSquad`,title:`Vanguard`,shortcutKey:`4`,baseCost:85,costGrowth:1.65,maxLevel:8,description:`+1 starting commando`}},hf=[`fireRate`,`bulletPower`,`warChest`,`startingSquad`];function gf(e,t){let n=mf[e],r=Math.max(0,Math.floor(t));return Math.round(n.baseCost*n.costGrowth**+r)}function _f(e){return 1+.06*Math.max(0,e)}function vf(e){return 1+.1*Math.max(0,e)}function yf(e){return 1+Math.min(8,Math.max(0,Math.floor(e)))}function bf(e){return 1+.1*Math.max(0,e)}function xf(e,t){switch(e){case`fireRate`:return{currentLabel:`+${Math.round(t*6)}%`,nextLabel:`+${Math.round((t+1)*6)}%`};case`bulletPower`:return{currentLabel:`+${Math.round(t*10)}%`,nextLabel:`+${Math.round((t+1)*10)}%`};case`startingSquad`:{let e=yf(t),n=yf(t+1);return{currentLabel:`${e}`,nextLabel:t>=8?`MAX`:`${n}`}}case`warChest`:return{currentLabel:`x${bf(t).toFixed(2)}`,nextLabel:`x${bf(t+1)*1===bf(t+1)?bf(t+1).toFixed(2):`1.00`}`}}}function Sf(e){let t=Math.max(0,e.progressRatio),n=18+e.stageNumber*8,r=Math.max(5,Math.round(t*n)),i=Math.round(e.enemiesDefeated*(1.2+e.stageNumber*.35)),a=e.clearedStage?e.bossRewardCoins:0,o=Math.round(e.bonusCoinsCollected+a),s=bf(e.warChestLevel),c=r+i+o;return{distanceCoins:r,killCoins:i,bonusCoins:o,warChestMultiplier:s,totalCoinsEarned:Math.round(c*s)}}function Cf(e,t,n){let r=mf[n],i=t[n],a=gf(n,i);return i>=r.maxLevel||e<a?{purchased:!1,remainingCoins:e,nextUpgrades:t,cost:a}:{purchased:!0,remainingCoins:e-a,nextUpgrades:{...t,[n]:i+1},cost:a}}function wf(e){let t=e<0?`-`:``,n=Math.abs(Math.round(e));if(n<1e3)return`${t}${n}`;if(n<1e6){let e=n/1e3,r=e>=100?0:e>=10?1:2;return`${t}${e.toFixed(r).replace(/\.0+$/,``).replace(/(\.\d*[1-9])0+$/,`$1`)}K`}if(n<1e9){let e=n/1e6,r=e>=100?0:e>=10?1:2;return`${t}${e.toFixed(r).replace(/\.0+$/,``).replace(/(\.\d*[1-9])0+$/,`$1`)}M`}let r=n/1e9,i=r>=100?0:r>=10?1:2;return`${t}${r.toFixed(i).replace(/\.0+$/,``).replace(/(\.\d*[1-9])0+$/,`$1`)}B`}function Tf(e){let t=Math.max(0,Math.ceil(e));return t<1e4?`${t}`:wf(t)}function Ef(e,t,n,r,i,a){e.beginPath(),e.moveTo(t+a,n),e.lineTo(t+r-a,n),e.lineTo(t+r,n+a),e.lineTo(t+r,n+i-a),e.lineTo(t+r-a,n+i),e.lineTo(t+a,n+i),e.lineTo(t,n+i-a),e.lineTo(t,n+a),e.closePath()}function Df(){let e=new bi(new Uint8Array([255,255,255,255]),1,1);return e.needsUpdate=!0,e}var Of=class{canvas;ctx;texture;lastSignature=``;constructor(e=!1){if(typeof document>`u`){this.canvas=null,this.ctx=null,this.texture=Df();return}this.canvas=document.createElement(`canvas`),this.canvas.width=e?1024:640,this.canvas.height=264;let t=this.canvas.getContext(`2d`);if(!t)throw Error(`2D canvas context unavailable`);this.ctx=t,this.texture=new Wi(this.canvas),this.texture.colorSpace=yt,this.texture.minFilter=oe,this.texture.magFilter=oe}redrawIfDirty(e,t,n,r,i,a=4.76,o=0){if(!this.ctx||!this.canvas)return;let s=Math.round(e===`MUL`?t*100:t),c=+(i>.15),l=+(o>.15),u=Math.round(a*10),d=`${e}:${s}:${+!!n}:${c}:${l}:${u}`;if(d===this.lastSignature)return;this.lastSignature=d;let f=this.ctx,p=this.canvas.width,m=this.canvas.height;f.clearRect(0,0,p,m);let h=Math.max(190,a/2.48*m),g=ff(e,t,n);f.save(),f.scale(p/h,1);let _=f.createLinearGradient(0,6,0,m-6);g?(_.addColorStop(0,`rgba(255, 36, 92, 0.22)`),_.addColorStop(.22,`rgba(232, 24, 78, 0.34)`),_.addColorStop(.65,`rgba(184, 16, 62, 0.50)`),_.addColorStop(.92,`rgba(142, 10, 48, 0.68)`),_.addColorStop(1,`rgba(255, 72, 118, 0.88)`)):(_.addColorStop(0,`rgba(24, 242, 200, 0.22)`),_.addColorStop(.22,`rgba(18, 208, 212, 0.34)`),_.addColorStop(.65,`rgba(12, 152, 198, 0.48)`),_.addColorStop(.92,`rgba(8, 108, 168, 0.66)`),_.addColorStop(1,`rgba(64, 250, 224, 0.88)`)),f.fillStyle=_,f.fillRect(3,8,h-6,m-14),f.strokeStyle=g?`rgba(255, 130, 160, 0.16)`:`rgba(130, 255, 236, 0.16)`,f.lineWidth=2;for(let e=-m;e<h+m;e+=44)f.beginPath(),f.moveTo(e,10),f.lineTo(e+m*.45,m-10),f.stroke();if(f.fillStyle=g?`rgba(255, 128, 158, 0.92)`:`rgba(138, 255, 236, 0.92)`,f.fillRect(3,6,h-6,4),f.fillRect(3,m-11,h-6,6),f.fillStyle=g?`#ff8ca8`:`#8cffeb`,f.fillRect(6,14,18,3),f.fillRect(h-24,14,18,3),c){let e=f.createLinearGradient(0,10,0,m-6);e.addColorStop(0,`rgba(255, 255, 255, 0.18)`),e.addColorStop(.5,`rgba(255, 255, 255, 0.42)`),e.addColorStop(1,`rgba(255, 255, 255, 0.54)`),f.fillStyle=e,f.fillRect(3,8,h-6,m-14)}else if(l){let e=f.createLinearGradient(0,10,0,m-6);e.addColorStop(0,`rgba(255, 180, 56, 0.36)`),e.addColorStop(.55,`rgba(255, 76, 106, 0.28)`),e.addColorStop(1,`rgba(255, 36, 78, 0.42)`),f.fillStyle=e,f.fillRect(3,8,h-6,m-14)}let v=pf(e,t,n);f.textAlign=`center`,f.textBaseline=`middle`;let y=Math.round(Math.max(108,Math.min(156,98+h*.08)));f.font=`900 ${y}px "Segoe UI", Roboto, system-ui, sans-serif`;let b=Math.max(124,h-38),x=f.measureText(v).width;x>b&&(y=Math.max(72,Math.floor(b/x*y)),f.font=`900 ${y}px "Segoe UI", Roboto, system-ui, sans-serif`),f.lineJoin=`miter`,f.miterLimit=3,f.lineWidth=Math.max(14,Math.round(y*.145)),f.strokeStyle=`#070d16`,f.strokeText(v,h/2,m*.54),f.fillStyle=`#f4fcff`,f.fillText(v,h/2,m*.54),f.restore(),this.texture.needsUpdate=!0}},kf=class{canvas;ctx;texture;lastSignature=``;constructor(){if(typeof document>`u`){this.canvas=null,this.ctx=null,this.texture=Df();return}this.canvas=document.createElement(`canvas`),this.canvas.width=416,this.canvas.height=224;let e=this.canvas.getContext(`2d`);if(!e)throw Error(`2D canvas context unavailable`);this.ctx=e,this.texture=new Wi(this.canvas),this.texture.colorSpace=yt,this.texture.minFilter=oe,this.texture.magFilter=oe}redrawIfDirty(e,t=0){if(!this.ctx||!this.canvas)return;let n=Math.max(0,Math.ceil(e)),r=+(t>.25),i=`${n}:${r}`;if(i===this.lastSignature)return;this.lastSignature=i;let a=this.ctx,o=this.canvas.width,s=this.canvas.height;a.clearRect(0,0,o,s);let c=Tf(n),l=c.length>=5?96:c.length===4?114:c.length===3?132:146,u=o-56,d=s-52;Ef(a,28,26,u,d,24),a.fillStyle=r?`rgba(32, 62, 88, 0.90)`:`rgba(8, 16, 28, 0.86)`,a.fill(),a.lineWidth=6,a.strokeStyle=r?`#ffd25a`:`#28f2d4`,a.stroke(),a.fillStyle=r?`#ffffff`:`#ffb838`,a.fillRect(54,32,44,4),a.fillRect(28+u-70,26+d-10,44,4),a.textAlign=`center`,a.textBaseline=`middle`,a.font=`900 ${l}px "Segoe UI", Roboto, system-ui, sans-serif`,a.lineJoin=`miter`,a.miterLimit=3,a.lineWidth=16,a.strokeStyle=`#050a12`,a.strokeText(c,o/2,s/2+4),a.fillStyle=r?`#fff6c8`:`#eefcff`,a.fillText(c,o/2,s/2+4),this.texture.needsUpdate=!0}},Af=new Map;function jf(e,t=`TACTICAL`){let n=`${t}:${e}`,r=Af.get(n);if(r)return r;if(typeof document>`u`){let e=Df();return Af.set(n,e),e}let i=document.createElement(`canvas`);i.width=336,i.height=96;let a=i.getContext(`2d`);if(!a)throw Error(`2D canvas context unavailable`);let o=Ou(e,t),s=`#${o.colorHex.toString(16).padStart(6,`0`)}`;Ef(a,8,10,320,76,16),a.fillStyle=t===`UNICORN`?`rgba(34, 10, 44, 0.94)`:`rgba(8, 15, 26, 0.94)`,a.fill(),a.lineWidth=5,a.strokeStyle=s,a.stroke();let c=o.shortBadge.toUpperCase(),l=c.length>=13?30:c.length>=11?33:35;a.textAlign=`center`,a.textBaseline=`middle`,a.font=`900 ${l}px "Segoe UI", Roboto, system-ui, sans-serif`,a.fillStyle=s,a.fillText(c,168,49);let u=new Wi(i);return u.colorSpace=yt,Af.set(n,u),u}var Mf=6,Nf=12.08,Pf=2.52,Ff=.04,If=class{root=new H;z=0;active=!1;triggered=!1;isFullSpan=!1;currentSplitX=0;targetSplitX=0;lastStepDecayTicks=0;lastStepDecayValue=0;lastStepFlippedBackToRed=!1;lastStepDecayX=0;appliedSplitX=NaN;centerPostGroup=new H;leftPylonMat;centerPylonMat;rightPylonMat;leftSlot;rightSlot;fullSlot;constructor(e){let t=()=>new Y({color:2087167,emissive:411750,metalness:.22,roughness:.3});this.leftPylonMat=t(),this.centerPylonMat=t(),this.rightPylonMat=t();let n=new W({color:593430,side:1}),r=new G(new Oa(12.6,.48),new W({color:329741,transparent:!0,opacity:.28,depthWrite:!1}));r.rotation.x=-Math.PI/2,r.position.set(0,.018,.06),this.root.add(r);let i=[[-6.08,this.leftPylonMat],[0,this.centerPylonMat],[6.08,this.rightPylonMat]];for(let[e,t]of i){let r=e===0?this.centerPostGroup:this.root,i=e===0?0:e,a=new G(new q(.14,.185,2.72,6),t);a.position.set(i,1.36,0);let o=new G(new q(.188,.232,2.78,6),n);o.position.set(i,1.36,0);let s=new G(new Da(.2,0),t);s.position.set(i,2.78,0);let c=new G(new Da(.25,0),n);c.position.set(i,2.78,0),r.add(a,o,s,c)}this.root.add(this.centerPostGroup),this.leftSlot=this.createGateSlot(e*3+100,`LEFT`,-2.47,Mf,tf,-.04,!1),this.rightSlot=this.createGateSlot(e*3+101,`RIGHT`,2.47,Mf,Ff,nf,!1),this.fullSlot=this.createGateSlot(e*3+102,`LEFT`,0,Nf,tf,nf,!0),this.root.visible=!1}createGateSlot(e,t,n,r,i,a,o){let s=new H;s.position.set(n,0,0);let c=new Of(o),l=new W({map:c.texture,transparent:!0,side:2,depthWrite:!1}),u=new G(new Oa(1,Pf),l);u.scale.x=r,u.position.set(0,1.28,0),s.add(u);let d=rd();return d.position.set(0,2.75,.1),s.add(d),this.root.add(s),{entityId:e,laneTag:t,minX:i,maxX:a,centerX:n,panelWidth:r,group:s,panelMesh:u,padlockGroup:d,labelTex:c,active:!1,operator:`ADD`,initialValue:0,value:0,hitAccumulator:0,damagePerIncrement:1,isLocked:!1,ringProgress:0,flashTimer:0,flashCooldown:0,popTimer:0,timeSinceLastHit:0,decayAccumulator:0,decayPulseTimer:0}}applySlotGeometry(e,t,n){let r=Math.max(1.2,n-t),i=(t+n)*.5;e.minX=t,e.maxX=n,e.centerX=i,e.panelWidth=r,e.group.position.x=i,e.panelMesh.scale.x=r}recomputeTargetSplitX(){if(this.isFullSpan||!this.leftSlot.active||!this.rightSlot.active){this.targetSplitX=0;return}let e=sf(this.leftSlot.operator,this.leftSlot.value,this.leftSlot.isLocked,this.rightSlot.operator,this.rightSlot.value,this.rightSlot.isLocked),t=nf-tf;this.targetSplitX=tf+t*e}applySplitLayout(e){this.appliedSplitX=e,this.centerPostGroup.position.x=e,this.applySlotGeometry(this.leftSlot,tf,e-Ff),this.applySlotGeometry(this.rightSlot,e+Ff,nf)}applyPylonPolarity(e,t){t?(e.color.setHex(16720988),e.emissive.setHex(6031394)):(e.color.setHex(1635016),e.emissive.setHex(414792))}syncPylonColors(){if(this.isFullSpan){let e=ff(this.fullSlot.operator,this.fullSlot.value,this.fullSlot.isLocked);this.applyPylonPolarity(this.leftPylonMat,e),this.applyPylonPolarity(this.rightPylonMat,e);return}let e=this.leftSlot.active?ff(this.leftSlot.operator,this.leftSlot.value,this.leftSlot.isLocked):!1,t=this.rightSlot.active?ff(this.rightSlot.operator,this.rightSlot.value,this.rightSlot.isLocked):!1;this.applyPylonPolarity(this.leftPylonMat,e),this.applyPylonPolarity(this.rightPylonMat,t),this.applyPylonPolarity(this.centerPylonMat,e&&t?!0:t)}configure(e){this.z=e.z,this.active=!0,this.triggered=!1,this.root.position.set(0,0,e.z),this.root.visible=!0,e.full?(this.isFullSpan=!0,this.centerPostGroup.visible=!1,this.currentSplitX=0,this.targetSplitX=0,this.appliedSplitX=0,this.applySlotGeometry(this.fullSlot,-6.04,Nf*.5),this.configureSlot(this.leftSlot,null),this.configureSlot(this.rightSlot,null),this.configureSlot(this.fullSlot,e.full),this.syncPylonColors()):(this.isFullSpan=!1,this.centerPostGroup.visible=!0,this.configureSlot(this.fullSlot,null),this.configureSlot(this.leftSlot,e.left),this.configureSlot(this.rightSlot,e.right),this.syncPylonColors(),this.recomputeTargetSplitX(),this.currentSplitX=this.targetSplitX,this.applySplitLayout(this.currentSplitX),this.leftSlot.active&&this.leftSlot.labelTex.redrawIfDirty(this.leftSlot.operator,this.leftSlot.value,this.leftSlot.isLocked,0,0,this.leftSlot.panelWidth),this.rightSlot.active&&this.rightSlot.labelTex.redrawIfDirty(this.rightSlot.operator,this.rightSlot.value,this.rightSlot.isLocked,0,0,this.rightSlot.panelWidth))}configureSlot(e,t){t?(e.active=!0,e.group.visible=!0,e.operator=t.operator,e.initialValue=t.initialValue,e.value=t.initialValue,e.hitAccumulator=0,e.damagePerIncrement=t.damagePerIncrement,e.isLocked=t.isLocked,e.ringProgress=0,e.flashTimer=0,e.flashCooldown=0,e.popTimer=0,e.timeSinceLastHit=0,e.decayAccumulator=0,e.decayPulseTimer=0,e.panelMesh.scale.y=1,e.panelMesh.position.y=1.28,e.padlockGroup.visible=t.isLocked,e.labelTex.redrawIfDirty(t.operator,t.initialValue,t.isLocked,0,0,e.panelWidth,0)):(e.active=!1,e.group.visible=!1)}hide(){this.active=!1,this.triggered=!0,this.root.visible=!1}getDebugValues(){return{z:this.z,left:this.leftSlot.active?this.leftSlot.value:null,right:this.rightSlot.active?this.rightSlot.value:null,full:this.fullSlot.active?this.fullSlot.value:null,leftInit:this.leftSlot.active?this.leftSlot.initialValue:null,rightInit:this.rightSlot.active?this.rightSlot.initialValue:null,fullInit:this.fullSlot.active?this.fullSlot.initialValue:null}}updateVisuals(e,t){if(this.lastStepDecayTicks=0,this.lastStepFlippedBackToRed=!1,this.active){if(!this.triggered&&t-this.z>128)this.root.visible=!1;else if(this.root.visible=!0,(this.triggered||t<this.z-2)&&(this.triggered=!0,this.root.position.y-=e*18,this.root.position.y<=-3.4||t<this.z-4.8))this.hide();else{if(!this.isFullSpan){let t=1-Math.exp(-18*e);this.currentSplitX+=(this.targetSplitX-this.currentSplitX)*t,Math.abs(this.targetSplitX-this.currentSplitX)<.002&&(this.currentSplitX=this.targetSplitX),Math.abs(this.currentSplitX-this.appliedSplitX)>.001&&this.applySplitLayout(this.currentSplitX)}this.tickSide(this.leftSlot,e),this.tickSide(this.rightSlot,e),this.tickSide(this.fullSlot,e)}}}tickSide(e,t){if(e.active){if(e.flashCooldown>0&&(e.flashCooldown=Math.max(0,e.flashCooldown-t)),e.flashTimer>0&&(e.flashTimer=Math.max(0,e.flashTimer-t*11)),e.decayPulseTimer>0&&(e.decayPulseTimer=Math.max(0,e.decayPulseTimer-t*8.5)),!this.triggered&&!e.isLocked&&t>0&&(e.value>e.initialValue+1e-6||e.hitAccumulator>0)){let n=uf({operator:e.operator,value:e.value,initialValue:e.initialValue,hitAccumulator:e.hitAccumulator,damagePerIncrement:e.damagePerIncrement,isLocked:e.isLocked,timeSinceLastHit:e.timeSinceLastHit,decayAccumulator:e.decayAccumulator},t);e.value=n.value,e.hitAccumulator=n.hitAccumulator,e.timeSinceLastHit=n.timeSinceLastHit,e.decayAccumulator=n.decayAccumulator,e.ringProgress=n.ringProgress,n.deltaDecrements>0&&(e.decayPulseTimer=1,this.lastStepDecayTicks+=n.deltaDecrements,this.lastStepDecayValue=n.value,this.lastStepDecayX=e.centerX,n.flippedBackToNegative&&(this.lastStepFlippedBackToRed=!0),this.syncPylonColors(),this.isFullSpan||this.recomputeTargetSplitX())}if(e.popTimer>0){e.popTimer=Math.max(0,e.popTimer-t*9.5);let n=Math.sin(e.popTimer*Math.PI)*.055;e.panelMesh.scale.y=1+n,e.panelMesh.position.y=1.28+Pf*.5*n}else if(e.decayPulseTimer>0){let t=Math.sin(e.decayPulseTimer*Math.PI)*.068;e.panelMesh.scale.y=1-t,e.panelMesh.position.y=1.28-Pf*.5*t}else e.panelMesh.scale.y=1,e.panelMesh.position.y=1.28;e.labelTex.redrawIfDirty(e.operator,e.value,e.isLocked,e.ringProgress,e.flashTimer,e.panelWidth,e.decayPulseTimer)}}tryBulletHit(e,t,n,r,i){if(!this.active||this.triggered)return null;let a=Math.min(t,n)-.35,o=Math.max(t,n)+.35;if(this.z<a||this.z>o)return null;let s=null;if(this.isFullSpan&&this.fullSlot.active?e>=this.fullSlot.minX&&e<=this.fullSlot.maxX&&(s=this.fullSlot):e>=this.leftSlot.minX&&e<=this.leftSlot.maxX&&this.leftSlot.active?s=this.leftSlot:e>=this.rightSlot.minX&&e<=this.rightSlot.maxX&&this.rightSlot.active&&(s=this.rightSlot),!s||s.entityId===i)return null;s.timeSinceLastHit=0,s.decayAccumulator=0,s.decayPulseTimer=0;let c=lf({operator:s.operator,value:s.value,hitAccumulator:s.hitAccumulator,damagePerIncrement:s.damagePerIncrement,isLocked:s.isLocked},r);return s.value=c.value,s.hitAccumulator=c.hitAccumulator,s.ringProgress=c.ringProgress,c.deltaIncrements>0?(s.popTimer=1,s.flashTimer=1,s.flashCooldown=.12):s.flashCooldown<=0&&(s.flashTimer=.55,s.flashCooldown=.14),this.syncPylonColors(),!this.isFullSpan&&c.deltaIncrements>0&&this.recomputeTargetSplitX(),s.labelTex.redrawIfDirty(s.operator,s.value,s.isLocked,s.ringProgress,s.flashTimer,s.panelWidth,0),{lane:s.laneTag,entityId:s.entityId,hitX:e,hitZ:this.z,newValue:c.value,deltaIncrements:c.deltaIncrements,crossedZeroOrPositive:c.crossedZeroOrPositive,flippedToPositive:c.flippedToPositive,ricochet:c.ricochet,formattedLabel:pf(s.operator,c.value,s.isLocked)}}trySquadCollect(e,t,n){if(!this.active||this.triggered||t>this.z+.48||t<this.z-2.2)return null;let r=null;if(r=this.isFullSpan&&this.fullSlot.active?this.fullSlot:e<this.currentSplitX&&this.leftSlot.active||!this.rightSlot.active?this.leftSlot:this.rightSlot,!r||!r.active)return null;this.triggered=!0,r.active=!1,r.group.visible=!1;let i=df(n,r.operator,r.value,9999),a=df(n,r.operator,r.value),o=a-n,s=pf(r.operator,r.value,r.isLocked);return{lane:r.laneTag,worldX:this.isFullSpan?e:r.centerX,worldZ:this.z,nextSquadCount:a,rawUnclampedCount:i,deltaSquad:o,label:s,positive:i>=n}}},Lf=777,Rf=8.4,zf=34,Bf=.8,Vf=.36,Hf=.72,Uf=1.84;function Wf(e,t,n,r,i,a){e.beginPath(),e.moveTo(t+a,n),e.lineTo(t+r-a,n),e.lineTo(t+r,n+a),e.lineTo(t+r,n+i-a),e.lineTo(t+r-a,n+i),e.lineTo(t+a,n+i),e.lineTo(t,n+i-a),e.lineTo(t,n+a),e.closePath()}function Gf(){let e=new W({color:461586,side:1});return e.customProgramCacheKey=()=>`brute-goliath-outline-v70`,e.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
        attribute vec3 aOutlineNormal;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
        {
          vec3 safeNorm = aOutlineNormal / max(0.0001, length(aOutlineNormal));
          transformed += safeNorm * 0.032;
        }`)},e}var Kf=Gf();function qf(e){let t=[];e.traverse(e=>{e instanceof G&&e.material instanceof Y&&!e.userData.isBruteOutline&&t.push(e)});for(let e=0;e<t.length;e++){let n=t[e],r=n.geometry;r.attributes.aOutlineNormal||(r.attributes.normal||r.computeVertexNormals(),Ru(r));let i=new G(r,Kf);i.userData.isBruteOutline=!0,n.add(i)}}var Jf=class{canvas;ctx;texture;lastSig=``;constructor(){this.canvas=document.createElement(`canvas`),this.canvas.width=512,this.canvas.height=144;let e=this.canvas.getContext(`2d`);if(!e)throw Error(`2D canvas context unavailable`);this.ctx=e,this.texture=new Wi(this.canvas),this.texture.colorSpace=yt,this.texture.minFilter=oe,this.texture.magFilter=oe}redrawIfDirty(e,t,n){let r=Math.max(0,Math.ceil(e)),i=Math.max(0,Math.min(100,Math.round(r/Math.max(1,t)*100))),a=+(n>.28),o=`${r}:${i}:${a}`;if(o===this.lastSig)return;this.lastSig=o;let s=this.ctx,c=this.canvas.width,l=this.canvas.height;s.clearRect(0,0,c,l);let u=c-56;Wf(s,22,30,u+12,84,18),s.fillStyle=`#060b14`,s.fill(),Wf(s,28,36,u,72,14),s.fillStyle=`rgba(14, 22, 36, 0.95)`,s.fill(),s.lineWidth=4,s.strokeStyle=a?`#ffd86b`:`#ff3366`,s.stroke();let d=Math.max(0,Math.round((u-10)*(i/100)));if(d>6){s.save(),Wf(s,33,41,u-10,62,10),s.clip();let e=s.createLinearGradient(0,36,0,108);e.addColorStop(0,a?`#ffe082`:`#ff5277`),e.addColorStop(.55,a?`#ff9f2e`:`#e01e50`),e.addColorStop(1,`#9c0f38`),s.fillStyle=e,s.fillRect(33,41,d,62),s.fillStyle=`rgba(255, 255, 255, 0.24)`,s.fillRect(36,43,Math.max(0,d-8),12),s.restore()}let f=Tf(r);s.textAlign=`center`,s.textBaseline=`middle`,s.font=`900 68px "Segoe UI", Roboto, system-ui, sans-serif`,s.lineJoin=`miter`,s.miterLimit=3,s.lineWidth=16,s.strokeStyle=`#050912`,s.strokeText(f,c/2,74),s.fillStyle=`#f6fcff`,s.fillText(f,c/2,74),this.texture.needsUpdate=!0}},Yf=class{entityId;root=new H;active=!1;defeated=!1;x=0;z=0;maxHp=6500;hp=6500;speed=2.05;clubDamage=9;coinReward=450;name=`SIEGE GOLIATH`;skinTheme=`TACTICAL`;bodyRig=new H;tacticalParts=[];unicornParts=[];leftLegPivot=new H;rightLegPivot=new H;clubArmPivot=new H;leftArmPivot=new H;uniMountPivot=new H;uniFrontLeftLeg=new H;uniFrontRightLeg=new H;uniRearLeftLeg=new H;uniRearRightLeg=new H;uniNeckHeadPivot=new H;dangerZoneGroup=new H;dangerFillMat;dangerTimingDisc;dangerTimingMat;dangerRingMat;chestBarMesh;chestBarTex=new Jf;flashMaterials=[];stridePhase=0;hitFlash=0;hitFlashCooldown=0;attackState=`COOLDOWN`;stateTimer=.7;lockedSmashX=0;constructor(e=0){this.entityId=Lf+e;let t=new G(new Yi(1.82,8),new W({color:329741,transparent:!0,opacity:.58,depthWrite:!1}));t.rotation.x=-Math.PI/2,t.position.set(0,.024,.05),this.root.add(t);let n=new Y({color:14425686,roughness:.28,metalness:.34,emissive:2360336}),r=new Y({color:2432314,roughness:.38,metalness:.38}),i=new Y({color:6059153,roughness:.32,metalness:.44}),a=new Y({color:16757800,roughness:.26,metalness:.42}),o=new Y({color:1317158,roughness:.34,metalness:.46}),s=new Y({color:16726891,emissive:14227016,emissiveIntensity:1.45,roughness:.2,metalness:.3}),c=new W({color:16760370}),l=new Y({color:15923199,roughness:.34,metalness:.1}),u=new Y({color:1730303,roughness:.3,metalness:.24}),d=new Y({color:2018130,roughness:.3,metalness:.24}),f=new Y({color:16765496,emissive:4861952,roughness:.22,metalness:.44}),p=new Y({color:16774840,emissive:16762936,emissiveIntensity:.65,roughness:.18,metalness:.32}),m=new W({color:2686874});this.flashMaterials.push(r,i,a,l,u,d,f);for(let[e,t]of[[-1,this.leftLegPivot],[1,this.rightLegPivot]]){t.position.set(e*.48,1.18,0);let i=new H,a=new G(new K(.5,.68,.52),r);a.position.set(0,-.34,0);let s=new G(new J(.26,.44,4),n);s.rotation.x=Math.PI/2,s.position.set(0,-.58,.28);let c=new G(new q(.28,.24,.58,6),n);c.position.set(0,-.86,0);let l=new G(new K(.54,.3,.78),o);l.position.set(0,-1.05,.12),i.add(a,s,c,l),this.tacticalParts.push(i),t.add(i),this.bodyRig.add(t)}let h=new H,g=new G(new q(.7,.6,.44,6),o);g.scale.set(1.18,1,.9),g.position.set(0,1.28,0),h.add(g);let _=new G(new K(.5,.22,.2),a);_.position.set(0,1.32,.58),h.add(_);let v=new G(new q(.98,.7,1.26,6),r);v.scale.set(1.24,1,.9),v.position.set(0,2.02,0),h.add(v);let y=new G(new K(1.62,.94,.64),n);y.position.set(0,2.08,.24),h.add(y);let b=new G(new q(.24,.24,.14,6),c);b.rotation.x=Math.PI/2,b.position.set(0,2.38,.56),h.add(b);for(let e of[-1,1]){let t=new G(new K(.84,.64,.88),r);t.rotation.z=-e*.2,t.position.set(e*1.22,2.48,.04),h.add(t);let a=new G(new K(.88,.14,.92),n);a.rotation.z=-e*.2,a.position.set(e*1.24,2.76,.04),h.add(a);let o=new G(new J(.16,.52,5),i);o.rotation.z=-e*.42,o.position.set(e*1.42,3.04,.04),h.add(o)}let x=new G(new q(.66,.76,.28,6),o);x.position.set(0,2.66,.06),h.add(x);let S=new G(new q(.56,.68,.68,6),n);S.scale.set(1.08,1,1.12),S.position.set(0,3.04,.06),h.add(S);let C=new G(new K(.22,.28,.88),i);C.position.set(0,3.42,.04),h.add(C);for(let e of[-1,1]){let t=new G(new J(.15,.78,5),i);t.rotation.z=-e*.52,t.rotation.x=-.18,t.position.set(e*.68,3.48,-.02),h.add(t)}let w=new G(new K(.82,.16,.2),c);w.position.set(0,2.98,.66),h.add(w),this.tacticalParts.push(h),this.bodyRig.add(h),this.leftArmPivot.position.set(-1.28,2.38,.06);let T=new H,E=new G(new K(.42,.66,.42),i);E.position.set(-.12,-.34,.12),E.rotation.x=-.38;let D=new G(new K(.5,.58,.52),r);D.position.set(-.16,-.78,.38),D.rotation.x=-.55,T.add(E,D),this.tacticalParts.push(T),this.leftArmPivot.add(T),this.bodyRig.add(this.leftArmPivot),this.clubArmPivot.position.set(1.28,2.42,.08);let O=new H,k=new G(new K(.44,.68,.44),i);k.position.set(.14,-.32,.16),k.rotation.x=-.45;let A=new G(new K(.5,.54,.5),n);A.position.set(.18,-.74,.46),A.rotation.x=-.65;let j=new H;j.position.set(.18,-.82,.64),j.rotation.x=.88;let ee=new G(new q(.095,.085,2.55,6),o);ee.position.set(0,1.02,0),j.add(ee);let M=new G(new q(.115,.115,.58,6),a);M.position.set(0,.15,0),j.add(M);let te=new G(new K(.36,.68,.42),r);te.position.set(0,1.88,0),j.add(te);for(let e of[-1,1]){let t=new G(new K(.14,.88,.58),i);t.position.set(0,1.88,e*.42),j.add(t);let n=new G(new J(.56,.52,4),s);n.scale.set(.18,1,1.25),n.rotation.x=Math.PI/2*e,n.position.set(0,1.88,e*.78),j.add(n)}let ne=new G(new J(.14,.46,5),a);ne.position.set(0,2.46,0),j.add(ne),O.add(k,A,j),this.tacticalParts.push(O),this.clubArmPivot.add(O),this.bodyRig.add(this.clubArmPivot),this.uniMountPivot.position.set(0,0,-.25),this.uniMountPivot.rotation.y=.22;let re=(e,t)=>{let n=new H,r=l,i=new G(new q(.26,.21,.68,8),r);i.position.set(0,-.32,0);let a=new G(new Da(.22,0),e?u:d);a.scale.set(1,.9,1.1),a.position.set(0,-.66,.08);let o=new G(new q(.18,.15,.56,8),l);o.position.set(0,-.96,.02);let s=new G(new q(.19,.21,.14,8),e?d:u);s.position.set(0,-1.2,.03);let c=new G(new q(.21,.26,.22,8),f);return c.position.set(0,-1.35,.06),n.add(i,a,o,s,c),n},N=[[this.uniFrontLeftLeg,-.46,.72,!0,!0],[this.uniFrontRightLeg,.46,.72,!1,!0],[this.uniRearLeftLeg,-.48,-.68,!0,!1],[this.uniRearRightLeg,.48,-.68,!1,!1]];for(let[e,t,n,r,i]of N)e.position.set(t,1.46,n),e.add(re(r,i)),this.uniMountPivot.add(e);let ie=new G(new q(.72,.68,1.65,10),l);ie.rotation.x=Math.PI/2,ie.scale.set(1.06,1,.96),ie.position.set(0,1.64,.02),this.uniMountPivot.add(ie);let ae=new G(new Aa(.76,10,8),l);ae.scale.set(1.06,1.04,.92),ae.position.set(0,1.72,.68),this.uniMountPivot.add(ae);let oe=new G(new Aa(.7,10,8),l);oe.scale.set(1.04,.98,.95),oe.position.set(0,1.68,-.68),this.uniMountPivot.add(oe);let se=new G(new K(1.58,.66,1.18),u);se.position.set(0,1.84,-.02),this.uniMountPivot.add(se);let ce=new G(new K(1.64,.14,1.24),f);ce.position.set(0,1.54,-.02),this.uniMountPivot.add(ce);let le=new G(new K(1.04,.26,.78),d);le.position.set(0,2.22,-.04),this.uniMountPivot.add(le);let ue=new G(new q(.8,.76,.56,8,1,!1,-Math.PI*.45,Math.PI*.9),d);ue.position.set(0,1.74,.7),this.uniMountPivot.add(ue);let de=new G(new Da(.24,0),f);de.position.set(0,1.78,1.48),this.uniMountPivot.add(de);for(let e of[-1,1]){let t=new G(new q(.46,.36,.16,6),e<0?d:u);t.rotation.z=Math.PI/2,t.position.set(e*.8,1.72,.52),this.uniMountPivot.add(t)}let fe=new H;fe.position.set(-.18,1.78,-1.28),fe.rotation.set(-.42,-.35,.18);let pe=[u,d,f];for(let e=0;e<3;e++){let t=new G(new J(.28-e*.04,1.15,7),pe[e]);t.rotation.x=Math.PI*.72+e*.12,t.position.set(-e*.1,-.26-e*.18,-.32-e*.16),fe.add(t)}this.uniMountPivot.add(fe),this.uniNeckHeadPivot.position.set(0,2.02,.78),this.uniNeckHeadPivot.rotation.y=-.2;let me=new G(new q(.38,.54,1.12,8),l);me.rotation.x=.28,me.position.set(0,.48,.12),this.uniNeckHeadPivot.add(me);let he=new G(new ja(.48,.11,6,12),u);he.rotation.x=Math.PI/2+.28,he.position.set(0,.16,.05),this.uniNeckHeadPivot.add(he);let ge=[u,d,f,u,d];for(let e=0;e<5;e++){let t=new G(new J(.18,.52,5),ge[e]);t.rotation.x=-.78,t.rotation.z=(e%2==0?1:-1)*.16,t.position.set(0,.22+e*.22,-.22+e*.05),this.uniNeckHeadPivot.add(t)}let _e=new G(new Aa(.46,10,8),l);_e.scale.set(.92,.96,1.12),_e.position.set(0,1.06,.3),this.uniNeckHeadPivot.add(_e);let ve=new G(new q(.24,.35,.72,8),l);ve.rotation.x=Math.PI/2+.34,ve.position.set(0,.9,.78),this.uniNeckHeadPivot.add(ve);let ye=new G(new Aa(.25,8,8),l);ye.scale.set(1.02,.85,.9),ye.position.set(0,.78,1.08),this.uniNeckHeadPivot.add(ye);let be=new G(new K(.42,.16,.68),u);be.rotation.x=.34,be.position.set(0,1.16,.62),this.uniNeckHeadPivot.add(be);for(let e of[-1,1]){let t=new G(new J(.13,.44,5),l);t.rotation.z=-e*.28,t.rotation.x=-.14,t.position.set(e*.28,1.48,.18),this.uniNeckHeadPivot.add(t);let n=new G(new J(.07,.3,4),e<0?u:d);n.rotation.z=-e*.28,n.rotation.x=-.14,n.position.set(e*.28,1.46,.22),this.uniNeckHeadPivot.add(n);let r=new G(new K(.12,.12,.16),m);r.position.set(e*.38,1.12,.48),this.uniNeckHeadPivot.add(r)}let xe=new G(new ja(.18,.06,6,10),d);xe.rotation.x=Math.PI/2-.62,xe.position.set(0,1.34,.56),this.uniNeckHeadPivot.add(xe);let Se=new G(new J(.18,1.52,8),p);Se.rotation.x=.68,Se.position.set(0,1.88,.98),this.uniNeckHeadPivot.add(Se);for(let e=0;e<4;e++){let t=new G(new ja(.16*(1-e/4*.68),.034,6,10),e%2==0?u:d);t.rotation.x=Math.PI/2-.68,t.position.set(0,1.44+e*.26,.64+e*.21),this.uniNeckHeadPivot.add(t)}this.uniMountPivot.add(this.uniNeckHeadPivot),this.unicornParts.push(this.uniMountPivot),this.bodyRig.add(this.uniMountPivot),qf(this.bodyRig),this.syncSkinRigVisibility(),this.root.add(this.bodyRig),this.chestBarMesh=new G(new Oa(2.75,.78),new W({map:this.chestBarTex.texture,transparent:!0,depthTest:!1,depthWrite:!1})),this.chestBarMesh.renderOrder=12,this.chestBarMesh.position.set(0,1.92,.96),this.root.add(this.chestBarMesh),this.dangerFillMat=new W({color:16720988,transparent:!0,opacity:.22,depthWrite:!1});let Ce=new G(new Yi(Uf,6),this.dangerFillMat);Ce.rotation.x=-Math.PI/2,Ce.position.y=.034,this.dangerTimingMat=new W({color:16736824,transparent:!0,opacity:.44,depthWrite:!1}),this.dangerTimingDisc=new G(new Yi(1.7200000000000002,6),this.dangerTimingMat),Xf(this.dangerTimingDisc),this.dangerRingMat=new W({color:16758832,transparent:!0,opacity:.95,side:2,depthWrite:!1});let we=new G(new ka(1.6800000000000002,Uf,6),this.dangerRingMat);we.rotation.x=-Math.PI/2,we.position.y=.039,this.dangerZoneGroup.add(Ce,this.dangerTimingDisc,we),this.dangerZoneGroup.visible=!1,this.root.add(this.dangerZoneGroup),this.root.visible=!1}setSkinTheme(e){this.skinTheme!==e&&(this.skinTheme=e,this.syncSkinRigVisibility())}syncSkinRigVisibility(){let e=this.skinTheme===`UNICORN`;for(let t=0;t<this.tacticalParts.length;t++)this.tacticalParts[t].visible=!e;for(let t=0;t<this.unicornParts.length;t++)this.unicornParts[t].visible=e;this.dangerFillMat&&(this.dangerFillMat.color.setHex(e?1732351:16720988),this.dangerTimingMat.color.setHex(e?2018130:16736824),this.dangerRingMat.color.setHex(e?16769096:16758832))}configure(e,t=0){e?(this.active=!0,this.defeated=!1,this.name=e.name,this.x=t,this.z=e.z,this.maxHp=Math.max(100,e.maxHp),this.hp=this.maxHp,this.speed=e.speed,this.clubDamage=Math.max(2,e.clubDamage),this.coinReward=e.coinReward,this.stridePhase=0,this.hitFlash=0,this.hitFlashCooldown=0,this.attackState=`COOLDOWN`,this.stateTimer=.35,this.lockedSmashX=t,this.root.position.set(this.x,0,this.z),this.root.visible=!0,this.dangerZoneGroup.visible=!1,this.bodyRig.rotation.set(0,0,0),this.clubArmPivot.rotation.set(0,0,0),this.uniMountPivot.position.set(0,0,-.25),this.uniMountPivot.rotation.set(0,.22,0),this.chestBarTex.redrawIfDirty(this.hp,this.maxHp,0)):this.hide()}hide(){this.active=!1,this.hp=0,this.root.visible=!1,this.dangerZoneGroup.visible=!1}isHaltingMarch(e){if(!this.active||this.defeated||this.hp<=0)return!1;let t=e-this.z;return t<=Rf&&t>-2.5}update(e,t,n,r,i,a=null){if(!this.active||this.defeated||this.hp<=0)return null;let o=n-this.z;if(o>115)return this.root.visible=!1,null;if(this.root.visible=!0,this.hitFlashCooldown>0&&(this.hitFlashCooldown=Math.max(0,this.hitFlashCooldown-e)),this.hitFlash>0){this.hitFlash=Math.max(0,this.hitFlash-e*24);let t=this.hitFlash>.15?.92:this.hitFlash*2.5;for(let e=0;e<this.flashMaterials.length;e++)this.flashMaterials[e].emissive.setRGB(t,t,t)}else for(let e=0;e<this.flashMaterials.length;e++)this.flashMaterials[e].emissive.setRGB(0,0,0);let s=i!==void 0&&this.z<=i+.55,c=s?.45:-4.25,l=s?4.75:4.25,u=i===void 0?Rf:6.3,d=i!==void 0&&!s?3.85:2.35,f=i===void 0&&a!==null&&this.z<=a+1.5,p=!f&&(i===void 0?o<zf:o<105),m=!f&&o<=u+.35&&o>-2.5,h=null,g=0,_=0,v=0;if(p&&!m&&o>u){let n=a!==null&&i===void 0?a-30:1/0;this.z=Math.min(n,this.z+this.speed*e),this.stridePhase+=e*(i===void 0?6.4:7.6);let r=Math.max(c,Math.min(l,t))-this.x;this.x=Math.max(c,Math.min(l,this.x+Math.sign(r)*Math.min(Math.abs(r),d*e))),g=Math.max(-.28,Math.min(.28,Math.atan2(r,Math.max(3.5,o))))}else if(m){if(this.stridePhase+=e*3.8,this.attackState===`COOLDOWN`){this.dangerZoneGroup.visible=!1;let n=Math.max(c,Math.min(l,t))-this.x,r=i===void 0?2.65:3.45;this.x=Math.max(c,Math.min(l,this.x+Math.sign(n)*Math.min(Math.abs(n),r*e))),g=Math.max(-.34,Math.min(.34,Math.atan2(n,Math.max(2.4,o)))),this.clubArmPivot.rotation.x+=(0-this.clubArmPivot.rotation.x)*Math.min(1,e*9),this.stateTimer-=e,this.stateTimer<=0&&(this.attackState=`WINDUP`,this.stateTimer=Bf,this.lockedSmashX=Math.max(-3.35,Math.min(3.35,t)))}else if(this.attackState===`WINDUP`){let i=1-this.stateTimer/Bf;if(i<.36){let n=Math.max(c,Math.min(l,t))-this.x;this.x=Math.max(c,Math.min(l,this.x+Math.sign(n)*Math.min(Math.abs(n),1.95*e))),this.lockedSmashX=Math.max(-3.35,Math.min(3.35,this.x+(t-this.x)*.58))}let a=this.lockedSmashX-this.x;g=Math.max(-.52,Math.min(.52,Math.atan2(a,Math.max(2.2,o)))),this.clubArmPivot.rotation.x=i*1.24,this.clubArmPivot.rotation.z=-i*.18,_=-i*.54,v=i*.42,this.dangerZoneGroup.visible=!0,this.dangerZoneGroup.position.set(a,0,Math.max(2.2,o-.35));let s=.65+.35*Math.sin(i*Math.PI*6),u=.14+Math.max(0,Math.min(1,i))*.86;if(this.dangerTimingDisc.scale.set(u,u,1),this.dangerTimingMat.opacity=.26+i*.38,this.dangerFillMat.opacity=.16+i*.18,this.dangerRingMat.opacity=.72+s*.28,this.stateTimer-=e,this.stateTimer<=0){this.clubArmPivot.rotation.x=-1.35,this.clubArmPivot.rotation.z=.08,this.dangerZoneGroup.visible=!1,this.attackState=`RECOVER`,this.stateTimer=Vf;let e=this.lockedSmashX,i=n-.25,a=Wd(r);h={impactX:e,impactZ:i,playerLosses:r>0&&Math.abs(t-e)<Uf+a*.24?Math.min(r,this.clubDamage):0}}}else{let t=this.lockedSmashX-this.x;g=Math.max(-.52,Math.min(.52,Math.atan2(t,Math.max(2.2,o)))),this.stateTimer-=e;let n=1-Math.max(0,this.stateTimer/Vf);this.clubArmPivot.rotation.x=-1.35*(1-n*.85),this.clubArmPivot.rotation.z=.08*(1-n),_=.3*(1-n),v=-.06*(1-n),this.stateTimer<=0&&(this.attackState=`COOLDOWN`,this.stateTimer=Hf)}}let y=p?Math.sin(this.stridePhase)*.34:0;if(this.leftLegPivot.rotation.x=y,this.rightLegPivot.rotation.x=-y,this.leftArmPivot.rotation.x=-y*.45,this.uniMountPivot.position.y=v,this.uniMountPivot.rotation.x=_,this.attackState===`WINDUP`){let e=Math.sin(this.stridePhase*3.2)*.42;this.uniFrontLeftLeg.rotation.x=-.55+e,this.uniFrontRightLeg.rotation.x=-.55-e,this.uniRearLeftLeg.rotation.x=.38,this.uniRearRightLeg.rotation.x=.38,this.uniNeckHeadPivot.rotation.x=.22}else{let e=p?Math.sin(this.stridePhase)*.36:0,t=p?Math.sin(this.stridePhase+Math.PI)*.36:0;this.uniFrontLeftLeg.rotation.x=e,this.uniRearRightLeg.rotation.x=e,this.uniFrontRightLeg.rotation.x=t,this.uniRearLeftLeg.rotation.x=t,this.uniNeckHeadPivot.rotation.x=this.attackState===`RECOVER`?.34:Math.sin(this.stridePhase*2)*.06}return this.bodyRig.position.y=Math.abs(Math.sin(this.stridePhase))*.09,this.bodyRig.rotation.y+=(g-this.bodyRig.rotation.y)*Math.min(1,e*10),this.bodyRig.rotation.z=Math.sin(this.stridePhase)*.035,this.root.position.set(this.x,0,this.z),this.chestBarTex.redrawIfDirty(this.hp,this.maxHp,this.hitFlash),h}tryBulletHit(e,t,n,r,i,a,o=zf){if(!this.active||this.defeated||this.hp<=0||i===this.entityId||a!==void 0&&a-this.z>o)return`NONE`;let s=Math.min(t,n)-1.15,c=Math.max(t,n)+1.15;return this.z<s||this.z>c||Math.abs(e-this.x)>1.38?`NONE`:(this.hp=Math.max(0,this.hp-r),this.hitFlashCooldown<=0&&(this.hitFlash=1,this.hitFlashCooldown=.14),this.hp<=0?(this.defeated=!0,this.active=!1,this.root.visible=!1,this.dangerZoneGroup.visible=!1,`DEFEATED`):(this.chestBarTex.redrawIfDirty(this.hp,this.maxHp,this.hitFlash),`HIT`))}getActiveDangerSmashX(){return!this.active||this.defeated||this.hp<=0||this.attackState!==`WINDUP`?null:this.lockedSmashX}};function Xf(e){e.rotation.x=-Math.PI/2,e.position.y=.036}var Zf=3.2,Qf=.98;function $f(e){switch(e){case`LEFT`:return-3.85;case`RIGHT`:return 3.85;case`LEFT_MID`:return-1.92;case`RIGHT_MID`:return 1.92;default:return 0}}function ep(e,t,n){if(e<=0)return 0;let r=Math.max(.25,Math.min(1,t/Math.max(1,n))),i=Math.max(1,Math.min(5,Math.ceil(e*.22*(.55+.45*r))));return e>1?Math.min(e-1,i):1}function tp(){let e=new bi(new Uint8Array([255,255,255,255]),1,1);return e.needsUpdate=!0,e}function np(){if(typeof document>`u`)return tp();let e=document.createElement(`canvas`);e.width=256,e.height=256;let t=e.getContext(`2d`),n=t.createLinearGradient(0,0,0,256);n.addColorStop(0,`#2a3c54`),n.addColorStop(.2,`#46607e`),n.addColorStop(.5,`#6280a2`),n.addColorStop(.8,`#46607e`),n.addColorStop(1,`#2a3c54`),t.fillStyle=n,t.fillRect(0,0,256,256);for(let e=0;e<8;e++){let n=e*32;t.fillStyle=e%2==0?`rgba(215, 240, 255, 0.16)`:`rgba(10, 18, 30, 0.22)`,t.fillRect(n,0,32,256),t.fillStyle=`rgba(8, 14, 24, 0.82)`,t.fillRect(n,0,4,256),t.fillStyle=e%2==0?`rgba(64, 248, 224, 0.72)`:`rgba(255, 206, 68, 0.68)`,t.fillRect(n+7,118,20,20),t.fillStyle=`rgba(220, 240, 255, 0.72)`,t.fillRect(n+8,36,5,5),t.fillRect(n+32-12,36,5,5),t.fillRect(n+8,214,5,5),t.fillRect(n+32-12,214,5,5)}let r=new Wi(e);return r.wrapS=te,r.wrapT=ne,r.colorSpace=yt,r}function rp(){let e=e=>{let t=new Ea([new z(0,-1.16-e),new z(.76+e,-1.16-e),new z(.95+e,-.96-e*.35),new z(.98+e,-.42),new z(1.03+e,0),new z(.98+e,.42),new z(.95+e,.96+e*.35),new z(.76+e,1.16+e),new z(0,1.16+e)],12);return t.rotateZ(Math.PI/2),t.computeVertexNormals(),t};return{bodyGeo:e(0),outlineGeo:e(.056)}}function ip(){if(typeof document>`u`)return tp();let e=document.createElement(`canvas`);e.width=128,e.height=128;let t=e.getContext(`2d`);t.clearRect(0,0,128,128);let n=t.createRadialGradient(64,64,4,64,64,60);n.addColorStop(0,`rgba(235, 255, 255, 0.95)`),n.addColorStop(.42,`rgba(72, 238, 255, 0.48)`),n.addColorStop(1,`rgba(20, 160, 220, 0.0)`),t.fillStyle=n,t.fillRect(0,0,128,128),t.save(),t.translate(64,64),t.strokeStyle=`rgba(220, 252, 255, 0.48)`,t.lineWidth=3,t.beginPath();for(let e=0;e<6;e++){let n=e/6*Math.PI*2,r=Math.cos(n)*44,i=Math.sin(n)*44;e===0?t.moveTo(r,i):t.lineTo(r,i)}return t.closePath(),t.stroke(),t.restore(),new Wi(e)}var ap=np(),op=rp(),sp=ip(),cp=(()=>{let e=new q(1.03,1.03,.22,12,1,!0);return e.rotateZ(Math.PI/2),e})(),lp=class{entityId;root=new H;active=!1;broken=!1;x=0;z=0;rollSpeed=Zf;rollAngleX=0;isRolling=!1;initialHp=25;remainingHp=25;rewardType=`COINS`;rewardValue=20;skinTheme=`UNICORN`;drumBodyGroup=new H;drumMat;hoopMat;hpLabelMesh;hpLabelTex;pickupPivot=new H;glowHaloMesh;coinGroup;recruitGroups;weaponRigsByTheme;weaponBadgesByTheme;flashTimer=0;flashCooldown=0;spinAngle=0;constructor(e){this.entityId=300+e;let t=new G(new Yi(1.42,10),new W({color:329741,transparent:!0,opacity:.48,depthWrite:!1}));t.rotation.x=-Math.PI/2,t.position.set(0,.02,.08),this.root.add(t),this.drumMat=new Y({color:16777215,map:ap,roughness:.36,metalness:.34,emissive:0}),this.hoopMat=new Y({color:9086143,roughness:.28,metalness:.48,emissive:0}),this.drumBodyGroup.position.set(0,1.02,0);let n=new G(op.bodyGeo,this.drumMat);this.drumBodyGroup.add(n);for(let e of[-.68,.68]){let t=new G(cp,this.hoopMat);t.position.set(e,0,0),this.drumBodyGroup.add(t)}let r=new G(op.outlineGeo,new W({color:461844,side:1}));this.drumBodyGroup.add(r),this.root.add(this.drumBodyGroup),this.hpLabelTex=new kf,this.hpLabelMesh=new G(new Oa(2.26,1.32),new W({map:this.hpLabelTex.texture,transparent:!0,depthWrite:!1})),this.hpLabelMesh.position.set(0,1.02,1.15),this.root.add(this.hpLabelMesh),this.pickupPivot.position.set(0,2.58,0),this.root.add(this.pickupPivot),this.glowHaloMesh=new G(new Oa(1.95,1.95),new W({map:sp,transparent:!0,blending:2,depthWrite:!1})),this.glowHaloMesh.position.set(0,.04,-.14),this.pickupPivot.add(this.glowHaloMesh),this.coinGroup=ed(),this.pickupPivot.add(this.coinGroup),this.recruitGroups={TACTICAL:td(),UNICORN:nd()},this.recruitGroups.TACTICAL.visible=!1,this.recruitGroups.UNICORN.visible=!1,this.pickupPivot.add(this.recruitGroups.TACTICAL,this.recruitGroups.UNICORN);let i=new Oa(2.05,.6),a=e=>({1:Lu(1,e),2:Lu(2,e),3:Lu(3,e),4:Lu(4,e),5:Lu(5,e)}),o=e=>({1:new G(i,new W({map:jf(1,e),transparent:!0})),2:new G(i,new W({map:jf(2,e),transparent:!0})),3:new G(i,new W({map:jf(3,e),transparent:!0})),4:new G(i,new W({map:jf(4,e),transparent:!0})),5:new G(i,new W({map:jf(5,e),transparent:!0}))});this.weaponRigsByTheme={TACTICAL:a(`TACTICAL`),UNICORN:a(`UNICORN`)},this.weaponBadgesByTheme={TACTICAL:o(`TACTICAL`),UNICORN:o(`UNICORN`)};for(let e of[`TACTICAL`,`UNICORN`])for(let t of[1,2,3,4,5]){let n=this.weaponRigsByTheme[e][t];n.root.scale.setScalar(1.62),n.root.rotation.z=.14,n.root.visible=!1,this.pickupPivot.add(n.root),this.weaponBadgesByTheme[e][t].visible=!1}this.root.visible=!1}setSkinTheme(e){this.skinTheme!==e&&(this.skinTheme=e,this.active&&!this.broken&&this.syncSkinVisuals())}syncSkinVisuals(){let e=this.rewardType===`COINS`,t=this.rewardType===`RECRUIT`,n=this.rewardType===`WEAPON`,r=this.skinTheme===`UNICORN`;n?(this.drumMat.color.setHex(r?16740546:14833276),this.hoopMat.color.setHex(r?16764736:16760379)):t?(this.drumMat.color.setHex(r?16749275:7139056),this.hoopMat.color.setHex(r?16770298:9357567)):(this.drumMat.color.setHex(r?14461183:11060964),this.hoopMat.color.setHex(16758832)),this.coinGroup.visible=e,this.recruitGroups.TACTICAL.visible=t&&!r,this.recruitGroups.UNICORN.visible=t&&r,this.glowHaloMesh.visible=!0;let i=Math.max(1,Math.min(5,Math.round(this.rewardValue)));for(let e of[`TACTICAL`,`UNICORN`])for(let t of[1,2,3,4,5]){let r=n&&e===this.skinTheme&&t===i;this.weaponRigsByTheme[e][t].root.visible=r,this.weaponBadgesByTheme[e][t].visible=!1}n?this.glowHaloMesh.material.color.setHex(Ou(i,this.skinTheme).colorHex):t?this.glowHaloMesh.material.color.setHex(r?16737996:2685148):this.glowHaloMesh.material.color.setHex(16764744)}configure(e){this.active=!0,this.broken=!1,this.z=e.z,this.x=$f(e.lane),this.rollSpeed=e.rollSpeed??3.2,this.rollAngleX=0,this.isRolling=!1,this.initialHp=Math.max(1,e.hp),this.remainingHp=this.initialHp,this.rewardType=e.rewardType,this.rewardValue=e.rewardValue,this.flashTimer=0,this.flashCooldown=0,this.spinAngle=Math.abs(this.x*.45+this.z*.08),this.root.position.set(this.x,0,this.z),this.root.visible=!0,this.drumBodyGroup.rotation.x=0,this.drumBodyGroup.scale.set(1,1,1),this.drumMat.emissive.setRGB(0,0,0),this.hoopMat.emissive.setRGB(0,0,0),this.syncSkinVisuals(),this.hpLabelTex.redrawIfDirty(this.remainingHp,0)}hide(){this.active=!1,this.broken=!0,this.isRolling=!1,this.root.visible=!1}update(e,t,n=null,r=!0){if(!this.active||this.broken)return;if(t-this.z>128&&t>=this.z){this.root.visible=!1,this.isRolling=!1;return}if(this.root.visible=!0,this.z>t+11.5){this.root.position.y-=e*16,(this.root.position.y<=-3.5||this.z>t+14.5)&&this.hide();return}let i=n!==null&&this.z<=n+1.5,a=n===null?1/0:n-14,o=t-this.z,s=r&&!i&&o<=48;if(this.isRolling=s,s&&e>0&&this.rollSpeed>0){let t=Math.min(a,this.z+this.rollSpeed*e),n=Math.max(0,t-this.z);this.z=t,this.root.position.z=this.z,this.rollAngleX+=n/Qf,this.drumBodyGroup.rotation.x=this.rollAngleX}this.spinAngle+=e*2.4;let c=Math.sin(this.spinAngle*1.5)*.08;this.pickupPivot.position.y=2.66+c,this.glowHaloMesh.rotation.z=this.spinAngle*.45;let l=this.recruitGroups[this.skinTheme];if(this.coinGroup.visible)this.coinGroup.rotation.y=Math.sin(this.spinAngle*1.15)*.52;else if(l.visible)l.rotation.y=Math.sin(this.spinAngle*.95)*.44;else{let t=Math.max(1,Math.min(5,Math.round(this.rewardValue))),n=this.weaponRigsByTheme[this.skinTheme][t];n.root.rotation.y=Math.sin(this.spinAngle*.85)*.28,n.spinCluster&&(n.spinCluster.rotation.x+=e*12)}if(this.flashCooldown>0&&(this.flashCooldown=Math.max(0,this.flashCooldown-e)),this.flashTimer>0){this.flashTimer=Math.max(0,this.flashTimer-e*14),this.drumMat.emissive.setRGB(this.flashTimer*.42,this.flashTimer*.42,this.flashTimer*.46),this.hoopMat.emissive.setRGB(this.flashTimer*.42,this.flashTimer*.36,this.flashTimer*.25);let t=1+this.flashTimer*.05;this.drumBodyGroup.scale.set(t,1-this.flashTimer*.03,t)}else this.drumMat.emissive.setRGB(0,0,0),this.hoopMat.emissive.setRGB(0,0,0),this.drumBodyGroup.scale.set(1,1,1);this.hpLabelTex.redrawIfDirty(this.remainingHp,this.flashTimer)}tryBulletHit(e,t,n,r,i){if(!this.active||this.broken||i===this.entityId)return`NONE`;let a=Math.min(t,n)-1.15,o=Math.max(t,n)+1.15;return this.z<a||this.z>o||Math.abs(e-this.x)>1.55?`NONE`:(this.remainingHp-=r,this.flashCooldown<=0&&(this.flashTimer=1,this.flashCooldown=.12),this.remainingHp<=0?(this.remainingHp=0,this.broken=!0,this.active=!1,this.isRolling=!1,this.root.visible=!1,`SHATTERED`):(this.hpLabelTex.redrawIfDirty(this.remainingHp,this.flashTimer),`HIT`))}resolveSquadCollision(e,t,n){if(!this.active||this.broken||n<=0)return null;let r=t-this.z;if(r<-.95||r>1.05||Math.abs(e-this.x)>=1.18)return null;let i=ep(n,this.remainingHp,this.initialHp),a=this.x,o=this.z;return this.broken=!0,this.active=!1,this.isRolling=!1,this.root.visible=!1,{losses:i,x:a,z:o}}},up=-3.5,dp=2.62,fp=4,pp=9.8,mp=7.35,hp=2.34,gp=4.36,_p=2.62,vp=740,yp=14,bp={type:`NONE`},xp=class{root=new H;active=!1;retractedForBoss=!1;sectorBaseZ=0;dividerTipZ=-8.2;siegeDistance=0;siegeColumnSpan=340;marchSpeed=2.45;marchPhase=0;queueCursor=0;queueTotal=0;frontBarrelMaxHp=15;frontBarrelHp=15;unitCountCap=vp;totalTroopers=0;rightAliveCount=0;unitAlive=new Uint8Array(vp);unitRank=new Uint8Array(vp);unitX=new Float32Array(vp);unitZ=new Float32Array(vp);unitSpeedMul=new Float32Array(vp);unitHp=new Float32Array(vp);unitMaxHp=new Float32Array(vp);unitHitFlash=new Float32Array(vp);unitCoins=new Float32Array(vp);lastKill={x:0,z:0,isHeavy:!1,coinReward:0};skinTheme=`TACTICAL`;pylonMat;queueDefs=[];visualSlots=[];slideOffsetZ=0;advanceLockTimer=0;spinClock=0;queueSinkY=0;celebrationGroup=new H;celebrationOuterRingMat;celebrationInnerRingMat;celebrationGlowDiscMat;celebrationSparks=[];celebrationSparkMat;celebrationTimer=0;constructor(){this.pylonMat=new Y({color:1635016,emissive:414792,roughness:.28,metalness:.34});let e=new W({color:461844,side:1}),t=new W({color:461844,side:1}),n=new q(.135,.175,3.36,6),r=new q(.18,.22,3.42,6),i=new Da(.19,0),a=new Da(.24,0),o=new Yi(1.54,8),s=new W({color:329741,transparent:!0,opacity:.48,depthWrite:!1}),c=new Oa(2.12,.62);for(let l=0;l<fp;l++){let u=new H;u.position.set(up,0,-9.8-l*mp);let d=new G(o,s);d.rotation.x=-Math.PI/2,d.position.set(0,.022,.06),u.add(d);let f=new H;f.scale.set(1.16,.94,.94);let p=new Y({color:8187634,map:ap,roughness:.38,metalness:.36,emissive:0}),m=new Y({color:9226495,roughness:.28,metalness:.48,emissive:0}),h=new G(op.bodyGeo,p);h.position.y=.96,f.add(h);for(let e of[-.68,.68]){let t=new G(cp,m);t.position.set(e,.96,0),f.add(t)}let g=new G(op.outlineGeo,t);g.position.y=.96,f.add(g),u.add(f);let _=new kf,v=new G(new Oa(2.48,1.4),new W({map:_.texture,transparent:!0,depthWrite:!1}));v.position.set(0,.98,1.15),u.add(v);let y=new H;y.position.set(0,0,-1.92);for(let t of[-2.22,2.22]){let o=new G(n,this.pylonMat);o.position.set(t,1.68,0);let s=new G(r,e);s.position.set(t,1.68,0);let c=new G(i,this.pylonMat);c.position.set(t,3.42,0);let l=new G(a,e);l.position.set(t,3.42,0),y.add(o,s,c,l)}let b=new Of(!1),x=new G(new Oa(gp,_p),new W({map:b.texture,transparent:!0,side:2,depthWrite:!1}));x.position.set(0,2.08,0),y.add(x),u.add(y);let S=new H;S.position.set(0,2.12,-1.82);let C=new W({map:sp,color:16768870,transparent:!0,blending:2,depthWrite:!1}),w=new G(new Oa(2.35,2.35),C);w.position.set(0,.06,-.16),S.add(w);let T=ed();T.scale.setScalar(1.22),S.add(T);let E=e=>({1:Lu(1,e),2:Lu(2,e),3:Lu(3,e),4:Lu(4,e),5:Lu(5,e)}),D=e=>({1:new G(c,new W({map:jf(1,e),transparent:!0,depthWrite:!1})),2:new G(c,new W({map:jf(2,e),transparent:!0,depthWrite:!1})),3:new G(c,new W({map:jf(3,e),transparent:!0,depthWrite:!1})),4:new G(c,new W({map:jf(4,e),transparent:!0,depthWrite:!1})),5:new G(c,new W({map:jf(5,e),transparent:!0,depthWrite:!1}))}),O={TACTICAL:E(`TACTICAL`),UNICORN:E(`UNICORN`)},k={TACTICAL:D(`TACTICAL`),UNICORN:D(`UNICORN`)};for(let e of[`TACTICAL`,`UNICORN`])for(let t of[1,2,3,4,5]){let n=O[e][t];n.root.scale.setScalar(1.66),n.root.rotation.z=.14,n.root.visible=!1,S.add(n.root);let r=k[e][t];r.position.set(0,.92,.12),r.visible=!1,S.add(r)}u.add(S),u.visible=!1,this.root.add(u),this.visualSlots.push({entityId:620+l,group:u,barrelPivot:f,barrelMat:p,hoopMat:m,hpTex:_,gateArchGroup:y,gateTex:b,rewardPedestalGroup:S,glowHaloMat:C,glowHaloMesh:w,coinGroup:T,weaponRigsByTheme:O,weaponBadgesByTheme:k,boundNodeIndex:-1,flashTimer:0,flashCooldown:0})}this.celebrationGlowDiscMat=new W({color:16765514,transparent:!0,opacity:.35,blending:2,depthWrite:!1});let l=new G(new Yi(2.35,32),this.celebrationGlowDiscMat);l.rotation.x=-Math.PI/2,l.position.y=.045,this.celebrationGroup.add(l),this.celebrationOuterRingMat=new W({color:16770680,transparent:!0,opacity:.95,side:2,blending:2,depthWrite:!1});let u=new G(new ka(2.05,2.48,36),this.celebrationOuterRingMat);u.rotation.x=-Math.PI/2,u.position.y=.055,this.celebrationGroup.add(u),this.celebrationInnerRingMat=new W({color:16777215,transparent:!0,opacity:.85,side:2,blending:2,depthWrite:!1});let d=new G(new ka(1.42,1.66,32),this.celebrationInnerRingMat);d.rotation.x=-Math.PI/2,d.position.y=.062,this.celebrationGroup.add(d),this.celebrationSparkMat=new W({color:16773273,transparent:!0,opacity:.95,blending:2,depthWrite:!1});let f=new Da(.14,0);for(let e=0;e<yp;e++){let e=new G(f,this.celebrationSparkMat);this.celebrationSparks.push(e),this.celebrationGroup.add(e)}this.celebrationGroup.visible=!1,this.root.add(this.celebrationGroup),this.root.visible=!1}setSkinTheme(e){this.skinTheme!==e&&(this.skinTheme=e,e===`UNICORN`?(this.pylonMat.color.setHex(16737996),this.pylonMat.emissive.setHex(6689352)):(this.pylonMat.color.setHex(1635016),this.pylonMat.emissive.setHex(414792)),this.active&&this.bindLeftQueueSlots(!1))}configure(e,t){this.active=!0,this.retractedForBoss=!1,this.sectorBaseZ=t,this.dividerTipZ=t-e.dividerStartZ,this.siegeDistance=0,this.siegeColumnSpan=Math.max(60,e.siegeColumnSpan),this.marchSpeed=Math.max(1.2,e.marchSpeed),this.marchPhase=0,this.slideOffsetZ=0,this.advanceLockTimer=0,this.queueSinkY=0,this.celebrationTimer=0,this.celebrationGroup.visible=!1,this.queueDefs=e.leftQueue,this.queueTotal=e.leftQueue.length,this.queueCursor=0,this.bindLeftQueueSlots(!0);let n=0;for(let r=0;r<e.rightEchelons.length;r++){let i=e.rightEchelons[r],a=Math.max(2,i.cols),o=Math.max(1,i.rows),s=i.rank===2?-.14:-.36,c=i.rank===2?5.3:5.54,l=i.rank===2?1.48:1.06;for(let e=0;e<o;e++)for(let r=0;r<a&&!(n>=vp);r++){let o=a>1?r/(a-1):.5,u=(e%2==0?-.09:.09)+((n*17+3)%7-3)*.032,d=((n*13+5)%9-4)*.065,f=Math.max(s,Math.min(c,s+o*(c-s)+u)),p=t-(i.startZ+e*l+d);this.unitAlive[n]=1,this.unitRank[n]=i.rank,this.unitX[n]=f,this.unitZ[n]=p,this.unitSpeedMul[n]=Math.max(.65,i.speed/this.marchSpeed),this.unitMaxHp[n]=Math.max(4,i.hpPerUnit),this.unitHp[n]=this.unitMaxHp[n],this.unitHitFlash[n]=0,this.unitCoins[n]=i.coinPerKill,n++}}this.totalTroopers=n,this.rightAliveCount=n;for(let e=n;e<vp;e++)this.unitAlive[e]=0;this.root.visible=!0,this.syncQueuePositions()}hide(){this.active=!1,this.retractedForBoss=!1,this.totalTroopers=0,this.rightAliveCount=0,this.celebrationTimer=0,this.celebrationGroup.visible=!1,this.root.visible=!1}retractQueueForBoss(){this.retractedForBoss=!0}bindLeftQueueSlots(e){e&&(this.queueCursor<this.queueTotal?(this.frontBarrelMaxHp=Math.max(1,this.queueDefs[this.queueCursor].barrelHp),this.frontBarrelHp=this.frontBarrelMaxHp):(this.frontBarrelMaxHp=1,this.frontBarrelHp=0));let t=this.skinTheme===`UNICORN`;for(let e=0;e<fp;e++){let n=this.visualSlots[e],r=this.queueCursor+e;if(r>=this.queueTotal){n.boundNodeIndex=-1,n.group.visible=!1;continue}let i=this.queueDefs[r];n.boundNodeIndex=r,n.group.visible=!0,n.flashTimer=0,n.flashCooldown=0,n.barrelMat.emissive.setRGB(0,0,0),n.hoopMat.emissive.setRGB(0,0,0),n.barrelPivot.scale.set(1.16,.94,.94);let a=e===0?this.frontBarrelHp:i.barrelHp;n.hpTex.redrawIfDirty(a,0);let o=i.reward;if(o.kind===`GATE`)n.barrelMat.color.setHex(t?16749275:7139056),n.hoopMat.color.setHex(t?16770298:9357567),n.gateArchGroup.visible=!0,n.rewardPedestalGroup.visible=!1,n.gateTex.redrawIfDirty(o.operator,o.value,!0,0,0,gp);else if(o.kind===`WEAPON`){n.barrelMat.color.setHex(t?16740546:14833276),n.hoopMat.color.setHex(t?16764736:16760379),n.gateArchGroup.visible=!1,n.rewardPedestalGroup.visible=!0,n.coinGroup.visible=!1,n.glowHaloMat.color.setHex(Ou(o.weaponTier,this.skinTheme).colorHex);for(let e of[`TACTICAL`,`UNICORN`])for(let t of[1,2,3,4,5]){let r=e===this.skinTheme&&t===o.weaponTier;n.weaponRigsByTheme[e][t].root.visible=r,n.weaponBadgesByTheme[e][t].visible=r}}else{n.barrelMat.color.setHex(t?14461183:11060964),n.hoopMat.color.setHex(16758832),n.gateArchGroup.visible=!1,n.rewardPedestalGroup.visible=!0,n.coinGroup.visible=!0,n.glowHaloMat.color.setHex(16764744);for(let e of[`TACTICAL`,`UNICORN`])for(let t of[1,2,3,4,5])n.weaponRigsByTheme[e][t].root.visible=!1,n.weaponBadgesByTheme[e][t].visible=!1}}}syncQueuePositions(){let e=this.sectorBaseZ-pp;for(let t=0;t<fp;t++){let n=this.visualSlots[t];if(n.boundNodeIndex<0)continue;let r=e-t*mp-this.slideOffsetZ;n.group.position.set(up,this.queueSinkY,r)}}triggerSquadCelebration(e,t){this.celebrationTimer=.72,this.celebrationGroup.position.set(e,0,t),this.celebrationGroup.visible=!0}update(e,t,n,r){if(!this.active)return;if(this.spinClock+=e*2.4,this.retractedForBoss&&(this.queueSinkY=Math.max(-4.2,this.queueSinkY-e*14),this.queueSinkY<=-4))for(let e=0;e<fp;e++)this.visualSlots[e].group.visible=!1;this.advanceLockTimer>0&&(this.advanceLockTimer=Math.max(0,this.advanceLockTimer-e)),this.slideOffsetZ>.001&&(this.slideOffsetZ*=Math.exp(-8.2*e),this.slideOffsetZ<.008&&(this.slideOffsetZ=0));for(let t=0;t<fp;t++){let n=this.visualSlots[t];if(!(n.boundNodeIndex<0||!n.group.visible)){if(n.flashCooldown>0&&(n.flashCooldown=Math.max(0,n.flashCooldown-e)),n.flashTimer>0){n.flashTimer=Math.max(0,n.flashTimer-e*9.5),n.barrelMat.emissive.setRGB(n.flashTimer*.14,n.flashTimer*.44,n.flashTimer*.5),n.hoopMat.emissive.setRGB(n.flashTimer*.36,n.flashTimer*.28,.06);let t=1+n.flashTimer*.055;n.barrelPivot.scale.set(1.16*t,.94*(1-n.flashTimer*.03),.94*t)}else n.barrelMat.emissive.setRGB(0,0,0),n.hoopMat.emissive.setRGB(0,0,0),n.barrelPivot.scale.set(1.16,.94,.94);if(t===0&&n.hpTex.redrawIfDirty(this.frontBarrelHp,n.flashTimer),n.rewardPedestalGroup.visible){let r=this.spinClock+t*.65;if(n.rewardPedestalGroup.position.y=2.12+Math.sin(r*1.5)*.08,n.glowHaloMesh.rotation.z=r*.45,n.coinGroup.visible)n.coinGroup.rotation.y=Math.sin(r*1.2)*.55;else{let t=n.weaponRigsByTheme[this.skinTheme];for(let n of[1,2,3,4,5]){let i=t[n];i.root.visible&&(i.root.rotation.y=Math.sin(r*.85)*.28,i.spinCluster&&(i.spinCluster.rotation.x+=e*12))}}}}}if(this.syncQueuePositions(),this.celebrationTimer>0){this.celebrationTimer=Math.max(0,this.celebrationTimer-e);let r=1-this.celebrationTimer/.72;this.celebrationGroup.position.set(t,0,n);let i=.55+r*.92;this.celebrationGroup.scale.set(i,1,i);let a=Math.max(0,Math.sin(Math.min(1,r*1.1)*Math.PI));this.celebrationOuterRingMat.opacity=a*.96,this.celebrationInnerRingMat.opacity=a*.82,this.celebrationGlowDiscMat.opacity=a*.36,this.celebrationSparkMat.opacity=a*.95;for(let e=0;e<yp;e++){let t=e/yp*Math.PI*2+r*2.4,n=(1.55+e%3*.34)/Math.max(.4,i),a=.25+r*(1.85+e%4*.32),o=this.celebrationSparks[e];o.position.set(Math.cos(t)*n,a,Math.sin(t)*n),o.rotation.y=t*2,o.rotation.x=r*5;let s=Math.max(.15,1.15-r*.85);o.scale.setScalar(s)}this.celebrationTimer<=0&&(this.celebrationGroup.visible=!1)}if(!r||this.retractedForBoss)return;let i=-999999;for(let e=0;e<this.totalTroopers;e++)this.unitAlive[e]!==0&&this.unitZ[e]>i&&(i=this.unitZ[e]);let a=n-i,o=this.siegeDistance>20&&i>-9e5&&a>16.5?1.58:1,s=this.marchSpeed*o;this.siegeDistance=Math.min(this.siegeColumnSpan,this.siegeDistance+s*e),this.marchPhase+=e*13.2*(o>1?1.28:1);let c=0;for(let r=0;r<this.totalTroopers;r++)if(this.unitAlive[r]!==0){if(this.unitHitFlash[r]>0&&(this.unitHitFlash[r]=Math.max(0,this.unitHitFlash[r]-e*26)),this.unitZ[r]>this.dividerTipZ+.25){let i=t-this.unitX[r],a=Math.max(.35,n+.25-this.unitZ[r]),o=Math.hypot(i,a),c=this.unitRank[r]===2?1.12:1.26,l=s*this.unitSpeedMul[r]*c*e,u=1/Math.max(.001,o);this.unitX[r]=Math.max(-Id,Math.min(Id,this.unitX[r]+i*u*l)),this.unitZ[r]+=Math.max(s*.5*e,a*u*l)}else{let t=s*this.unitSpeedMul[r]*e;this.unitZ[r]+=t}c++}this.rightAliveCount=c}getProgress(){if(this.retractedForBoss||this.totalTroopers>0&&this.rightAliveCount<=0)return 1;let e=Math.min(1,this.siegeDistance/Math.max(1,this.siegeColumnSpan)),t=this.totalTroopers>0?(this.totalTroopers-this.rightAliveCount)/this.totalTroopers:0;return Math.min(.99,Math.max(e*.92,t*.98))}isSiegeComplete(){return!this.active||this.retractedForBoss?!1:this.rightAliveCount<=0||this.siegeDistance>=this.siegeColumnSpan&&this.rightAliveCount<=0}getQueueRemaining(){return Math.max(0,this.queueTotal-this.queueCursor)}getFrontBarrelPosition(){return!this.active||this.retractedForBoss||this.queueCursor>=this.queueTotal?null:{x:up,z:this.sectorBaseZ-pp-this.slideOffsetZ}}getClosestRightTarget(e=52){if(!this.active||this.rightAliveCount<=0)return null;let t=-999999,n=dp,r=this.sectorBaseZ-e;for(let e=0;e<this.totalTroopers;e++){if(this.unitAlive[e]===0)continue;let i=this.unitZ[e];i>=r&&i>t&&(t=i,n=this.unitX[e])}return t<-9e5?null:{x:n,z:t}}checkDividerWallBlock(e,t,n){return!this.active||this.retractedForBoss||t>this.dividerTipZ+.18?!1:Math.abs(e- -.88)<.28||n<-.9&&e>=-.9||n>-.86&&e<=-.86}tryLeftQueueBulletHit(e,t,n,r,i){if(!this.active||this.retractedForBoss||this.queueCursor>=this.queueTotal||e>-1.12)return bp;let a=this.visualSlots[0];if(a.entityId===i||i===699)return bp;let o=this.sectorBaseZ-pp-this.slideOffsetZ,s=Math.min(t,n)-1.18,c=Math.max(t,n)+1.18;if(o<s||o>c||Math.abs(e- -3.5)>hp)return bp;if(this.advanceLockTimer>0||this.slideOffsetZ>1.35)return{type:`BARREL_HIT`,entityId:699,hitX:e,hitZ:o+.85};if(this.frontBarrelHp-=r,a.flashCooldown<=0&&(a.flashTimer=1,a.flashCooldown=.14),this.frontBarrelHp<=0){let e=this.queueDefs[this.queueCursor].reward,t=a.entityId;return this.queueCursor++,this.slideOffsetZ+=mp,this.advanceLockTimer=.56,this.bindLeftQueueSlots(!0),this.syncQueuePositions(),{type:`NODE_CLEARED`,entityId:t,worldX:up,worldZ:o,reward:e}}return a.hpTex.redrawIfDirty(this.frontBarrelHp,a.flashTimer),{type:`BARREL_HIT`,entityId:a.entityId,hitX:e,hitZ:o+.85}}tryRightArmyBulletHit(e,t,n,r,i){if(!this.active||this.rightAliveCount<=0||t<=this.dividerTipZ&&e<-.66)return{status:`MISS`,entityId:-1};let a=-1,o=-999999,s=Math.min(t,n),c=Math.max(t,n),l=this.sectorBaseZ-64;for(let t=0;t<this.totalTroopers;t++){if(this.unitAlive[t]===0)continue;let n=this.unitZ[t];if(n<l||2e4+t===i)continue;let r=this.unitRank[t]===2?.68:.49;n<s-r||n>c+r||Math.abs(e-this.unitX[t])>r||n>o&&(o=n,a=t)}if(a<0)return{status:`MISS`,entityId:-1};let u=2e4+a;return this.unitHitFlash[a]=1,this.unitHp[a]-=r,this.unitHp[a]<=0?(this.unitAlive[a]=0,this.rightAliveCount=Math.max(0,this.rightAliveCount-1),this.lastKill.x=this.unitX[a],this.lastKill.z=this.unitZ[a],this.lastKill.isHeavy=this.unitRank[a]===2,this.lastKill.coinReward=this.unitCoins[a],{status:`KILL`,entityId:u}):{status:`HIT`,entityId:u}}resolveSquadCollision(e,t,n){if(!this.active||this.rightAliveCount<=0||n<=0)return null;let r=Wd(n),i=0,a=e,o=t;for(let s=0;s<this.totalTroopers;s++){if(this.unitAlive[s]===0)continue;let c=this.unitZ[s],l=this.unitX[s],u=this.unitRank[s]===2,d=u?.58:.42,f=Math.abs(c-t)<=.85+d*.4&&Math.abs(l-e)<=r+d,p=c>t+1.35;if((f||p)&&(i+=u?4:2,a=f?l:e,o=f?c:t,this.unitAlive[s]=0,this.rightAliveCount=Math.max(0,this.rightAliveCount-1),i>=n))break}return i<=0?null:{playerLosses:Math.min(n,i),hitX:a,hitZ:o}}pushInstances(e,t){if(!this.active||this.rightAliveCount<=0)return;let n=this.sectorBaseZ-118,r=this.sectorBaseZ+10;for(let i=0;i<this.totalTroopers;i++){if(this.unitAlive[i]===0)continue;let a=this.unitZ[i];if(a<n||a>r)continue;let o=this.unitRank[i];o===2?e.pushHeavyEnemySoldier(this.unitX[i],a,this.marchPhase+i*.55,this.unitHitFlash[i],t):e.pushEnemySoldier(this.unitX[i],a,this.marchPhase+i*.78,this.unitHitFlash[i],t,o===0)}}getFrontLeftBarrelHp(){return this.active&&this.queueCursor<this.queueTotal?this.frontBarrelHp:0}},Sp=7.7,Cp=.6180339887498949,wp={x:0,z:0},Tp={vx:0,vz:-31,maxAge:1.5},Ep=class{logicalCount=1;peakCount=1;weaponTier=1;skinTheme=`UNICORN`;x=0;z=0;marchPhase=0;steerBankAngle=0;legStrafeYaw=0;strafeSpeed=0;recoilImpulse=0;barrelSpinAngle=0;soldierWorldX=new Float32Array(40);soldierWorldZ=new Float32Array(40);soldierVelX=new Float32Array(40);soldierVelZ=new Float32Array(40);soldierFireTimer=new Float32Array(40);soldierBurstTimer=new Float32Array(40);soldierBurstDamage=new Float32Array(40);lastFiredSoldierIndices=new Uint8Array(40);lastFiredMuzzleX=new Float32Array(40);lastFiredMuzzleZ=new Float32Array(40);lastFiredCount=0;resetForRun(e){this.logicalCount=Math.max(1,Math.min(40,Math.floor(e))),this.peakCount=this.logicalCount,this.weaponTier=1,this.x=0,this.z=0,this.marchPhase=0,this.steerBankAngle=0,this.legStrafeYaw=0,this.strafeSpeed=0,this.recoilImpulse=0,this.barrelSpinAngle=0,this.lastFiredCount=0;let t=1/Eu[1].fireRate;for(let e=0;e<40;e++){this.soldierVelX[e]=0,this.soldierVelZ[e]=0;let n=e===0?.04:e*Cp%1;this.soldierFireTimer[e]=n*t,this.soldierBurstTimer[e]=-1,this.soldierBurstDamage[e]=0}let n=Math.min(this.logicalCount,40);for(let e=0;e<n;e++)Ud(e,n,wp),this.soldierWorldX[e]=this.x+wp.x,this.soldierWorldZ[e]=this.z+wp.z}setLogicalCount(e){let t=Math.min(this.logicalCount,40),n=Math.max(0,Math.floor(e)),r=Math.max(0,n-40);this.logicalCount=Math.min(40,n),this.logicalCount>this.peakCount&&(this.peakCount=this.logicalCount),this.x=Gd(this.x,this.logicalCount);let i=1/Math.max(.5,Eu[this.weaponTier].fireRate),a=Math.min(this.logicalCount,40);for(let e=t;e<a;e++)Ud(e,a,wp),this.soldierWorldX[e]=this.x+wp.x*.35,this.soldierWorldZ[e]=this.z+wp.z*.35,this.soldierVelX[e]=0,this.soldierVelZ[e]=0,this.soldierFireTimer[e]=e*Cp%1*i,this.soldierBurstTimer[e]=-1;return r}updateMovement(e,t,n,r,i=!1){if(this.logicalCount<=0)return;let a=this.x;this.x=Gd(this.x+t,this.logicalCount);let o=e>0?(this.x-a)/e:0,s=Math.max(-.14,Math.min(.14,o*.012));this.steerBankAngle+=(s-this.steerBankAngle)*Math.min(1,e*14);let c=Math.max(-.74,Math.min(.74,-o*.088));this.legStrafeYaw+=(c-this.legStrafeYaw)*Math.min(1,e*16);let l=Math.abs(o);if(this.strafeSpeed+=(l-this.strafeSpeed)*Math.min(1,e*14),this.recoilImpulse>0&&(this.recoilImpulse=Math.max(0,this.recoilImpulse-e*9.5)),n&&(this.z-=Sp*e),r||l>.35){let t=r?1.12:Math.min(1.05,.4+l*.12);this.marchPhase+=e*t,this.barrelSpinAngle+=e*(this.weaponTier===4?26:4.2)}else this.marchPhase+=e*.35,this.barrelSpinAngle+=e*3.2;let u=Math.min(this.logicalCount,40);if(e<=0){for(let e=0;e<u;e++)Ud(e,u,wp),this.soldierWorldX[e]=Math.max(-zd,Math.min(zd,this.x+wp.x)),this.soldierWorldZ[e]=this.z+wp.z;return}let d=Math.min(.05,e);for(let e=0;e<u;e++){Ud(e,u,wp);let t=this.x+wp.x,n=this.z+wp.z,r=t-this.soldierWorldX[e],i=n-this.soldierWorldZ[e],a=r*175-this.soldierVelX[e]*23,o=i*218.75-this.soldierVelZ[e]*26.45;this.soldierVelX[e]+=a*d,this.soldierVelZ[e]+=o*d;let s=this.soldierWorldX[e]+this.soldierVelX[e]*d,c=this.soldierWorldZ[e]+this.soldierVelZ[e]*d;s<-7.45?(s=-zd,this.soldierVelX[e]=0):s>7.45&&(s=zd,this.soldierVelX[e]=0),this.soldierWorldX[e]=s,this.soldierWorldZ[e]=c}}funnelAroundStandingObstacle(e,t,n,r,i){let a=Math.min(this.logicalCount,40);if(a<=0)return;let o=this.x>=e?1:-1,s=Math.min(1,i*22),c=n+.32,l=r+.65;for(let n=0;n<a;n++){let r=this.soldierWorldZ[n];if(Math.abs(r-t)>l)continue;let i=this.soldierWorldX[n],a=i-e;if(Math.abs(a)<c){let t=e+o*(c+n%3*.07),r=Math.max(-zd,Math.min(zd,t));this.soldierWorldX[n]+=(r-i)*s}}}updateAutoFire(e,t,n,r,i=48){if(this.lastFiredCount=0,this.logicalCount<=0||e<=0)return!1;let a=Math.min(this.logicalCount,40);if(a<=0)return!1;let o=ju(this.logicalCount,this.weaponTier,t,n),s=Ou(this.weaponTier,this.skinTheme),c=Math.max(.035,o.intervalSeconds),l=o.damagePerProjectile*o.activeEmitters/a,u=s.projectileSpeed,d=.255*Cu,f=.548*Cu,p=-.68*Cu,m=1.22;Tu(u,i,Tp);let h=!1;for(let t=0;t<a;t++){if(this.soldierBurstTimer[t]>=0&&(this.soldierBurstTimer[t]-=e,this.soldierBurstTimer[t]<=0)){this.soldierBurstTimer[t]=-1;let e=Kd(this.soldierWorldX[t]+d,t),n=this.soldierWorldZ[t]+p;r.spawn(e,f,n,0,Tp.vz,this.soldierBurstDamage[t],s.pierceCount,Tp.maxAge,m,this.weaponTier,s.colorHex),this.recordMuzzleEvent(t,e,n),h=!0}if(this.soldierFireTimer[t]-=e,this.soldierFireTimer[t]>0)continue;this.soldierFireTimer[t]+=c,this.soldierFireTimer[t]<=0&&(this.soldierFireTimer[t]=(t*Cp%1*.25+.75)*c);let n=this.soldierWorldX[t]+d,i=Kd(n,t),a=this.soldierWorldZ[t]+p;if(s.pattern===`TWIN_CONVERGE`){let e=Kd(n-.085,t),i=Kd(n+.085,t+1);r.spawn(e,f,a,0,Tp.vz,l,s.pierceCount,Tp.maxAge,m,this.weaponTier,s.colorHex),r.spawn(i,f,a+-.34,0,Tp.vz,l,s.pierceCount,Math.max(.08,Tp.maxAge-.34/u),m,this.weaponTier,s.colorHex)}else r.spawn(i,f,a,0,Tp.vz,l,s.pierceCount,Tp.maxAge,m,this.weaponTier,s.colorHex),s.pattern===`BURST_2`&&(this.soldierBurstTimer[t]=.058,this.soldierBurstDamage[t]=l);this.recordMuzzleEvent(t,i,a),h=!0}return h&&(this.recoilImpulse=.92),h}recordMuzzleEvent(e,t,n){if(this.lastFiredCount<40){let r=this.lastFiredCount++;this.lastFiredSoldierIndices[r]=e,this.lastFiredMuzzleX[r]=t,this.lastFiredMuzzleZ[r]=n}}},Dp=5,Op=1.88;function kp(){let e=document.createElement(`canvas`);e.width=256,e.height=128;let t=e.getContext(`2d`);t.fillStyle=`#243448`,t.fillRect(0,0,256,128);for(let e=0;e<256;e+=32)t.fillStyle=`#3c526e`,t.fillRect(e+3,6,26,48),t.fillRect(e+3,74,26,48),t.fillStyle=`rgba(180, 224, 255, 0.38)`,t.fillRect(e+3,6,26,3),t.fillRect(e+3,74,26,3);t.fillStyle=`#111a26`,t.fillRect(0,58,256,12),t.fillStyle=`#ffb42e`;for(let e=0;e<256;e+=32)t.fillRect(e+4,61,14,6);let n=new Wi(e);return n.wrapS=te,n.wrapT=te,n.repeat.set(3,1),n.colorSpace=yt,n}var Ap=kp(),jp=class{entityId;root=new H;active=!1;broken=!1;x=0;z=0;initialBreakCount=150;remainingBreakCount=150;weaponTier=null;coinReward=40;skinTheme=`TACTICAL`;tierGroups=[];armorMat;coreGlowMat;holoBeamMat;outerHoloRing;plaqueMesh;plaqueTex;pickupPivot=new H;coinPickupGroup;weaponRigsByTheme;badgeMeshesByTheme;flashTimer=0;flashCooldown=0;spinAngle=0;retiring=!1;constructor(e){this.entityId=500+e,this.armorMat=new Y({color:14215416,map:Ap,bumpMap:Ap,bumpScale:.035,roughness:.38,metalness:.42,emissive:0});let t=new Y({color:5401222,roughness:.3,metalness:.48});this.coreGlowMat=new W({color:2421458});let n=new W({color:461586,side:1}),r=new G(new Yi(1.58,6),new W({color:329741,transparent:!0,opacity:.54,depthWrite:!1}));r.rotation.x=-Math.PI/2,r.position.set(0,.02,.08),this.root.add(r);let i=new q(1.18,1.28,.44,6),a=new q(1.25,1.35,.5,6),o=new q(1.25,1.25,.08,6),s=new q(.96,1.12,.08,6);for(let e=0;e<Dp;e++){let r=new H;r.position.set(0,.26+e*.49,0),r.rotation.y=e%2*(Math.PI/6);let c=new G(i,this.armorMat),l=new G(a,n),u=new G(o,this.coreGlowMat),d=new G(s,t);d.position.y=.23,r.add(c,l,u,d),this.tierGroups.push(r),this.root.add(r)}this.plaqueTex=new kf;let c=new W({map:this.plaqueTex.texture,transparent:!0,depthWrite:!1});this.plaqueMesh=new G(new Oa(2.56,1.46),c),this.plaqueMesh.position.set(0,1.12,1.44),this.root.add(this.plaqueMesh),this.root.add(this.pickupPivot),this.holoBeamMat=new W({color:2683604,transparent:!0,opacity:.24,blending:2,side:2,depthWrite:!1});let l=new G(new q(.92,.56,1.05,6,1,!0),this.holoBeamMat);l.position.set(0,.02,0),this.pickupPivot.add(l),this.outerHoloRing=new G(new ka(.76,.88,6),this.holoBeamMat),this.outerHoloRing.rotation.x=Math.PI/2.2,this.outerHoloRing.position.set(0,-.34,0),this.pickupPivot.add(this.outerHoloRing),this.coinPickupGroup=ed(),this.pickupPivot.add(this.coinPickupGroup);let u=new Oa(2.18,.64),d=e=>({1:Lu(1,e),2:Lu(2,e),3:Lu(3,e),4:Lu(4,e),5:Lu(5,e)}),f=e=>({1:new G(u,new W({map:jf(1,e),transparent:!0})),2:new G(u,new W({map:jf(2,e),transparent:!0})),3:new G(u,new W({map:jf(3,e),transparent:!0})),4:new G(u,new W({map:jf(4,e),transparent:!0})),5:new G(u,new W({map:jf(5,e),transparent:!0}))});this.weaponRigsByTheme={TACTICAL:d(`TACTICAL`),UNICORN:d(`UNICORN`)},this.badgeMeshesByTheme={TACTICAL:f(`TACTICAL`),UNICORN:f(`UNICORN`)};for(let e of[`TACTICAL`,`UNICORN`])for(let t of[1,2,3,4,5]){let n=this.weaponRigsByTheme[e][t];n.root.scale.setScalar(1.58),n.root.rotation.z=.14,n.root.visible=!1,this.pickupPivot.add(n.root),this.badgeMeshesByTheme[e][t].visible=!1}this.root.visible=!1}setSkinTheme(e){this.skinTheme!==e&&(this.skinTheme=e,this.armorMat.color.setHex(e===`UNICORN`?16173823:14215416),this.active&&!this.broken&&this.syncSkinVisuals())}syncSkinVisuals(){let e=this.skinTheme===`UNICORN`;this.armorMat.color.setHex(e?16173823:14215416);let t=this.weaponTier!==null,n=!t&&this.coinReward>0;if(this.pickupPivot.visible=t||n,this.coinPickupGroup.visible=n,this.weaponTier){let e=Ou(this.weaponTier,this.skinTheme).colorHex;this.holoBeamMat.color.setHex(e),this.coreGlowMat.color.setHex(e)}else this.holoBeamMat.color.setHex(16764744),this.coreGlowMat.color.setHex(e?16743129:2683604);for(let e of[`TACTICAL`,`UNICORN`])for(let t of[1,2,3,4,5]){let n=e===this.skinTheme&&this.weaponTier===t;this.weaponRigsByTheme[e][t].root.visible=n,this.badgeMeshesByTheme[e][t].visible=!1}}configure(e){this.active=!0,this.broken=!1,this.retiring=!1,this.z=e.z,this.x=e.lane===`LEFT`?-3.88:e.lane===`RIGHT`?3.88:0,this.initialBreakCount=Math.max(1,e.breakCount),this.remainingBreakCount=this.initialBreakCount,this.weaponTier=e.weaponTier??null,this.coinReward=e.coinReward??45,this.flashTimer=0,this.flashCooldown=0,this.root.position.set(this.x,0,this.z),this.root.scale.set(1.18,1,1),this.root.visible=!0,this.syncSkinVisuals(),this.syncStackHeight(),this.plaqueTex.redrawIfDirty(this.remainingBreakCount,0)}hide(){this.active=!1,this.broken=!0,this.root.visible=!1}syncStackHeight(){let e=Math.max(0,this.remainingBreakCount/this.initialBreakCount),t=this.initialBreakCount>=1200?5:this.initialBreakCount>=450?4:3,n=Math.max(1,Math.ceil(e*t));for(let e=0;e<Dp;e++)this.tierGroups[e].visible=e<n;let r=.36+n*.49;this.pickupPivot.position.set(0,r+.72,0),this.plaqueMesh.position.y=Math.max(.75,r*.52)}update(e,t){if(this.active&&!this.broken){if(!this.retiring&&t-this.z>128)this.root.visible=!1;else if(this.root.visible=!0,this.retiring||t<this.z-12.5)this.retiring=!0,this.root.position.y-=e*16,(this.root.position.y<=-3.8||t<this.z-15.2)&&this.hide();else{if(this.spinAngle+=e*2.35,this.outerHoloRing.rotation.z=-this.spinAngle*.85,this.weaponTier){let t=this.weaponRigsByTheme[this.skinTheme][this.weaponTier];t.root.visible&&(t.root.rotation.y=Math.sin(this.spinAngle*.85)*.28,t.root.position.y=.1+Math.sin(this.spinAngle*1.6)*.09,t.spinCluster&&(t.spinCluster.rotation.x+=e*14))}else this.coinPickupGroup.visible&&(this.coinPickupGroup.rotation.y=Math.sin(this.spinAngle*1.15)*.52,this.coinPickupGroup.position.y=Math.sin(this.spinAngle*1.8)*.07);if(this.flashCooldown>0&&(this.flashCooldown=Math.max(0,this.flashCooldown-e)),this.flashTimer>0){this.flashTimer=Math.max(0,this.flashTimer-e*10.5);let t=this.flashTimer*.26;this.armorMat.emissive.setRGB(t*.45,t*.92,t)}else this.armorMat.emissive.setRGB(0,0,0);this.plaqueTex.redrawIfDirty(this.remainingBreakCount,this.flashTimer)}}}tryBulletHit(e,t,n,r,i){if(!this.active||this.broken||this.retiring||i===this.entityId)return`NONE`;let a=Math.min(t,n)-1.25,o=Math.max(t,n)+1.25;return this.z<a||this.z>o||Math.abs(e-this.x)>Op?`NONE`:(this.remainingBreakCount-=r,this.flashCooldown<=0&&(this.flashTimer=1,this.flashCooldown=.14),this.remainingBreakCount<=0?(this.remainingBreakCount=0,this.broken=!0,this.active=!1,this.root.visible=!1,`SHATTERED`):(this.syncStackHeight(),this.plaqueTex.redrawIfDirty(this.remainingBreakCount,this.flashTimer),`HIT`))}checkCoreLaneCrash(e,t){if(!this.active||this.broken||this.retiring)return!1;let n=t-this.z,r=this.x<-1?e<-2.35:this.x>1?e>2.35:Math.abs(e)<1.32;return n>-.22&&n<1.08&&r}};function Mp(e){let t=e>>>0;return()=>{t|=0,t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function Np(e,t,n,r,i,a){e.beginPath(),e.moveTo(t-r,n+i),e.lineTo(t,n),e.lineTo(t+r,n+i),e.lineTo(t+r,n+i+a),e.lineTo(t,n+a),e.lineTo(t-r,n+i+a),e.closePath(),e.fill()}function Pp(){let e=Mp(7015),t=document.createElement(`canvas`);t.width=512,t.height=512;let n=t.getContext(`2d`),r=document.createElement(`canvas`);r.width=512,r.height=512;let i=r.getContext(`2d`),a=document.createElement(`canvas`);a.width=512,a.height=512;let o=a.getContext(`2d`);n.fillStyle=`#4a5c73`,n.fillRect(0,0,512,512),i.fillStyle=`#808080`,i.fillRect(0,0,512,512),o.fillStyle=`#bcbcbc`,o.fillRect(0,0,512,512);let s=n.getImageData(0,0,512,512),c=i.getImageData(0,0,512,512),l=o.getImageData(0,0,512,512);for(let t=0;t<512;t++)for(let n=0;n<512;n++){let r=(t*512+n)*4,i=n/512,a=Math.abs(i-.285),o=Math.abs(i-.715),u=Math.exp(-a*a*180)+Math.exp(-o*o*180),d=Math.floor(n/128),f=Math.floor(t/128),p=((d*7+f*13)%5-2)*3.4,m=(e()-.5)*11+Math.sin(n*.42)*2.5,h=(n+t)%8==0||(n-t+512)%8==0?4.5:0,g=84+p-u*5+m*.55+h;s.data[r]=Math.max(46,Math.min(136,g-12)),s.data[r+1]=Math.max(58,Math.min(156,g+4)),s.data[r+2]=Math.max(74,Math.min(182,g+24)),s.data[r+3]=255;let _=Math.max(0,Math.min(255,128+h*5+m*1.6));c.data[r]=_,c.data[r+1]=_,c.data[r+2]=_,c.data[r+3]=255;let v=Math.max(68,Math.min(224,174-u*54+m*.9));l.data[r]=v,l.data[r+1]=v,l.data[r+2]=v,l.data[r+3]=255}n.putImageData(s,0,0),i.putImageData(c,0,0),o.putImageData(l,0,0);for(let e=128;e<512;e+=128)n.fillStyle=`rgba(18, 26, 38, 0.78)`,n.fillRect(e-2,0,4,512),n.fillStyle=`rgba(148, 192, 228, 0.32)`,n.fillRect(e+2,0,2,512),i.fillStyle=`#282828`,i.fillRect(e-2,0,4,512);for(let e=0;e<512;e+=128){let t=e===0;n.fillStyle=t?`#141d2b`:`rgba(18, 26, 38, 0.76)`,n.fillRect(0,e,512,t?7:4),n.fillStyle=`rgba(154, 198, 236, 0.36)`,n.fillRect(0,e+(t?7:4),512,2),i.fillStyle=`#242424`,i.fillRect(0,e,512,t?7:4),n.fillStyle=`rgba(168, 204, 235, 0.48)`;for(let t=36;t<488;t+=64)n.fillRect(t-2,e+12,4,4),e+112<512&&n.fillRect(t-2,e+112,4,4)}n.fillStyle=`rgba(20, 232, 208, 0.26)`,n.fillRect(14,0,18,512),n.fillRect(480,0,18,512),n.fillStyle=`#2af5d8`,n.fillRect(20,0,6,512),n.fillRect(486,0,6,512);for(let e=20;e<512;e+=128)n.fillStyle=`rgba(42, 245, 216, 0.22)`,n.fillRect(247,e-4,18,84),n.fillStyle=`rgba(196, 244, 255, 0.86)`,n.fillRect(253,e,6,76);for(let e=44;e<512;e+=128)n.fillStyle=`rgba(42, 245, 216, 0.36)`,Np(n,146,e,26,16,8),Np(n,366,e,26,16,8);let u=(e,t,n,r)=>(e.wrapS=te,e.wrapT=te,e.repeat.set(t,n),e.anisotropy=4,r&&(e.colorSpace=yt),e),d=u(new Wi(t),1,4,!0),f=u(new Wi(r),1,4,!1),p=u(new Wi(a),1,4,!1),m=document.createElement(`canvas`);m.width=128,m.height=256;let h=m.getContext(`2d`);h.fillStyle=`#131b26`,h.fillRect(0,0,128,256);for(let e=-128;e<384;e+=64)h.fillStyle=e/64&1?`#ff9e2c`:`#22e6d2`,h.beginPath(),h.moveTo(0,e),h.lineTo(128,e+44),h.lineTo(128,e+70),h.lineTo(0,e+26),h.closePath(),h.fill();h.fillStyle=`rgba(10, 15, 22, 0.25)`;for(let t=0;t<140;t++)h.fillRect(e()*128,e()*256,2+e()*7,2+e()*5);let g=u(new Wi(m),1,14,!0),_=document.createElement(`canvas`);_.width=256,_.height=256;let v=_.getContext(`2d`);v.fillStyle=`#6c7c90`,v.fillRect(0,0,256,256);for(let t=0;t<650;t++){let t=92+Math.floor(e()*44);v.fillStyle=`rgba(${t-6},${t+4},${t+16},0.22)`,v.fillRect(e()*256,e()*256,2+e()*18,1+e()*3)}v.strokeStyle=`rgba(16, 23, 34, 0.65)`,v.lineWidth=3,v.strokeRect(4,4,248,120),v.strokeRect(4,132,248,120),v.fillStyle=`#b4cae0`;for(let e=16;e<248;e+=28)for(let t of[14,114,142,242])v.beginPath(),v.arc(e,t,3,0,Math.PI*2),v.fill();let y=u(new Wi(_),1,4,!1),b=document.createElement(`canvas`);b.width=256,b.height=128;let x=b.getContext(`2d`);x.fillStyle=`#263447`,x.fillRect(0,0,256,128);for(let e=0;e<256;e+=32)x.fillStyle=`#3c5069`,x.fillRect(e+3,8,26,48),x.fillRect(e+3,72,26,48),x.fillStyle=`rgba(166, 212, 248, 0.38)`,x.fillRect(e+3,8,26,3),x.fillRect(e+3,72,26,3);x.fillStyle=`#24f0d2`,x.fillRect(0,61,256,6);let S=u(new Wi(b),3,1,!0),C=document.createElement(`canvas`);C.width=512,C.height=512;let w=C.getContext(`2d`),T=document.createElement(`canvas`);T.width=512,T.height=512;let E=T.getContext(`2d`);w.fillStyle=`#44566d`,w.fillRect(0,0,512,512),E.fillStyle=`#808080`,E.fillRect(0,0,512,512);let D=512/6;for(let e=0;e<8;e++){let t=(e&1)==1?D*.5:0;for(let n=-1;n<=6;n++){let r=n*D+t,i=e*64,a=r+D*.5>219,o=(((n+4)*11+e*17)%7-3)*3.8;w.fillStyle=`rgb(${Math.round((a?76:64)+o)},${Math.round((a?84:86)+o)},${Math.round((a?104:112)+o)})`,w.fillRect(r+2.5,i+2.5,80.33333333333333,59),w.fillStyle=`rgba(172, 214, 248, 0.30)`,w.fillRect(r+2.5,i+2.5,80.33333333333333,2),w.fillStyle=`rgba(16, 23, 34, 0.82)`,w.fillRect(r,i,D,3),w.fillRect(r,i,3,64),E.fillStyle=`#2a2a2a`,E.fillRect(r,i,D,3.5),E.fillRect(r,i,3.5,64)}}w.fillStyle=`#24f2d2`,w.fillRect(18,0,6,512),w.fillStyle=`#ff3864`,w.fillRect(488,0,6,512);for(let e=38;e<512;e+=128)w.fillStyle=`rgba(36, 242, 210, 0.42)`,Np(w,110,e,30,17,9),w.fillStyle=`rgba(255, 56, 100, 0.44)`,w.beginPath(),w.moveTo(328,e),w.lineTo(366,e+18),w.lineTo(404,e),w.lineTo(404,e+9),w.lineTo(366,e+27),w.lineTo(328,e+9),w.closePath(),w.fill();return{albedo:d,bump:f,roughness:p,causewayAlbedo:u(new Wi(C),1,4,!0),causewayBump:u(new Wi(T),1,4,!1),hazardCurb:g,steelPlate:y,tireTread:S}}function Fp(){let e={uTime:{value:0}},t=new G(new Aa(235,36,24),new Va({side:1,depthWrite:!1,fog:!1,uniforms:e,vertexShader:`
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

        // Midnight Storm gradient: abyssal indigo zenith -> electric storm-slate -> cyan/teal horizon
        vec3 zenith = vec3(0.022, 0.048, 0.115);
        vec3 upperStorm = vec3(0.058, 0.125, 0.235);
        vec3 stormBand = vec3(0.095, 0.265, 0.405);
        vec3 horizonGlow = vec3(0.145, 0.395, 0.525);

        float h1 = smoothstep(-0.02, 0.15, y);
        float h2 = smoothstep(0.11, 0.42, y);
        float h3 = smoothstep(0.36, 0.86, y);

        vec3 col = mix(horizonGlow, stormBand, h1);
        col = mix(col, upperStorm, h2);
        col = mix(col, zenith, h3);

        // Subtle distant naval blockade amber-crimson horizon flare on far right
        vec3 siegeDir = normalize(vec3(0.52, 0.06, -0.85));
        float siegeCos = max(0.0001, dot(dir, siegeDir));
        col += vec3(0.62, 0.24, 0.12) * pow(siegeCos, 9.0) * 0.34;

        // Crisp Moonlit Storm-Eye Halo & Pale Ice Moon ahead-left of the viaduct
        vec3 moonDir = normalize(vec3(-0.36, 0.25, -0.89));
        float moonCos = max(0.0001, dot(dir, moonDir));
        col += vec3(0.18, 0.62, 0.85) * pow(moonCos, 6.5) * 0.62;
        col += vec3(1.18, 1.42, 1.58) * smoothstep(0.9968, 0.9993, moonCos);

        // Rolling storm clouds rim-lit by ice-cyan moonlight + subtle distant lightning pulse
        if (y > 0.01) {
          vec2 cloudUv = dir.xz / (y + 0.18) * 1.55 + vec2(uTime * 0.018, -uTime * 0.009);
          float c1 = noise2(cloudUv * 2.3);
          float c2 = noise2(cloudUv * 5.4 - 2.8);
          float cloud = smoothstep(0.45, 0.78, c1 * 0.66 + c2 * 0.34) * smoothstep(0.01, 0.11, y) * (1.0 - smoothstep(0.40, 0.76, y));
          float flash = pow(max(0.0001, 0.5 + 0.5 * sin(uTime * 1.9 + c1 * 4.2)), 14.0) * 0.35;
          vec3 cloudDark = vec3(0.045, 0.082, 0.148);
          vec3 cloudRim = vec3(0.28, 0.78, 0.96) + vec3(0.35, 0.85, 1.0) * flash;
          vec3 cloudCol = mix(cloudDark, cloudRim, pow(moonCos, 2.2) * 0.82 + 0.16);
          col = mix(col, cloudCol, cloud * 0.72);
        }

        // Distant jagged armored bay headlands along horizon
        float ridgeWave =
          0.030 +
          0.025 * sin(dir.x * 4.1 + dir.z * 2.3 + 0.9) +
          0.013 * sin(dir.x * 9.8 - dir.z * 7.1 - 1.4) +
          0.006 * cos(dir.x * 18.5 + dir.z * 12.5);
        float channelClear = smoothstep(0.09, 0.36, abs(dir.x));
        float ridge1 = ridgeWave * channelClear;

        if (y > -0.04 && y < ridge1) {
          vec3 mtnCol = mix(vec3(0.035, 0.062, 0.105), vec3(0.085, 0.175, 0.255), pow(moonCos, 3.0));
          col = mix(col, mtnCol, smoothstep(ridge1, ridge1 - 0.006, y));
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `}));return t.frustumCulled=!1,{mesh:t,uniforms:e}}var Ip=`
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
`,Lp=`
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

    vec3 deepTrough = vec3(0.014, 0.042, 0.088);
    vec3 seaBody = vec3(0.036, 0.125, 0.215);
    vec3 skyReflect = mix(vec3(0.08, 0.19, 0.32), vec3(0.16, 0.52, 0.68), smoothstep(-0.2, 0.85, -V.z));

    float crestMix = smoothstep(-0.38, 0.42, vWaveElev);
    vec3 col = mix(deepTrough, seaBody, crestMix);
    col = mix(col, skyReflect, clamp(fresnel * 0.78 + 0.08, 0.0, 0.88));

    // Moonlit Ice-Cyan Specular Glitter Path across the storm bay
    vec3 moonDir = normalize(vec3(-0.36, 0.25, -0.89));
    vec3 H = normalize(moonDir + V);
    float NoH = max(0.0001, dot(N, H));
    float specTight = pow(NoH, 96.0);
    float specBroad = pow(NoH, 18.0);
    col += vec3(0.95, 1.42, 1.65) * specTight * 1.35;
    col += vec3(0.12, 0.44, 0.58) * specBroad * 0.42;

    // Storm-chop whitecap foam streaks on high wave crests
    float chop = sin(p.x * 0.63 + p.y * 0.39 + uTime * 2.3) * cos(p.x * -0.49 + p.y * 0.71 - uTime * 1.8);
    float whitecap = smoothstep(0.29, 0.54, vWaveElev + chop * 0.24);
    col = mix(col, vec3(0.72, 0.88, 0.96), whitecap * 0.34);

    // Viaduct shadow band directly beneath widened roadway (X in [-7.1, +7.1])
    float underBridge = 1.0 - smoothstep(6.5, 12.2, abs(p.x));
    col *= (1.0 - underBridge * 0.46);

    // Distance atmospheric storm-slate blend
    float dist = length(uCamPos.xz - p);
    float dNorm = dist * 0.0044;
    float fogFactor = 1.0 - exp(-(dNorm * dNorm));
    col = mix(col, vec3(0.068, 0.155, 0.245), clamp(fogFactor, 0.0, 0.92));

    gl_FragColor = vec4(col, 1.0);
  }
`,Rp=40,zp=10;function Bp(e,t){let n=Math.max(0,Math.min(1,-t/Rp)),r=e===0?1-n:n;return 4.2+27.6*r*r}function Vp(e,t){let n=[];for(let r=0;r<=16;r++){let i=-(r/16)*Rp;n.push(new B(t,Bp(e,i),i))}return new Ma(new sa(n),20,.17,8,!1)}var Hp=class{root=new H;textures;deckMat;waterMesh;waterUniforms;chunks=[];bossPlatform;endBulkheadGroup=new H;splitDividerGroup;dividerRetracted=!1;dividerCurrentY=0;finiteTerminusZ=null;atmospherePoints;motePositions;moteCount=160;constructor(){this.textures=Pp(),this.waterUniforms={uTime:{value:0},uCamPos:{value:new B(0,9,14)}};let e=new Oa(420,560,64,84);e.rotateX(-Math.PI/2);let t=new Va({vertexShader:Ip,fragmentShader:Lp,uniforms:this.waterUniforms});this.waterMesh=new G(e,t),this.waterMesh.position.set(0,-4.6,-140),this.root.add(this.waterMesh);let n=new Y({map:this.textures.albedo,bumpMap:this.textures.bump,bumpScale:.045,roughnessMap:this.textures.roughness,roughness:.76,metalness:.24});this.deckMat=n;let r=new Y({color:3688540,bumpMap:this.textures.bump,bumpScale:.03,roughness:.68,metalness:.22}),i=new Y({map:this.textures.hazardCurb,roughness:.48,metalness:.22}),a=new Y({color:4742260,bumpMap:this.textures.steelPlate,bumpScale:.025,roughness:.34,metalness:.44}),o=new Y({color:8033970,roughness:.28,metalness:.48}),s=new Y({color:2372679,bumpMap:this.textures.steelPlate,bumpScale:.035,roughness:.38,metalness:.44}),c=new Y({color:7665919,emissive:1759487,emissiveIntensity:2.3,roughness:.18}),l=new Y({color:16753720,emissive:16736792,emissiveIntensity:2.6,roughness:.2}),u={0:[Vp(0,-7.3),Vp(0,7.3)],1:[Vp(1,-7.3),Vp(1,7.3)]};for(let e=0;e<zp;e++){let t=e%2,d=this.createBridgeChunk(t,u[t],n,r,i,a,o,s,c,l);d.position.z=40-e*Rp,this.chunks.push(d),this.root.add(d)}this.bossPlatform=this.createBossPlatform(n,r,i,a,s,c,l),this.root.add(this.bossPlatform),this.splitDividerGroup=this.createSplitDividerWall(r,i,a,l),this.splitDividerGroup.visible=!1,this.root.add(this.splitDividerGroup),this.motePositions=new Float32Array(this.moteCount*3);let d=new Float32Array(this.moteCount*3),f=new U;for(let e=0;e<this.moteCount;e++)this.motePositions[e*3]=e*37%36-18,this.motePositions[e*3+1]=.4+e*19%11*.85,this.motePositions[e*3+2]=-(e*29%140)+15,e%3==0?f.setHex(3077596):e%5==0?f.setHex(16752440):f.setHex(10410239),d[e*3]=f.r,d[e*3+1]=f.g,d[e*3+2]=f.b;let p=document.createElement(`canvas`);p.width=64,p.height=64;let m=p.getContext(`2d`),h=m.createRadialGradient(32,32,2,32,32,30);h.addColorStop(0,`rgba(255, 255, 255, 1.0)`),h.addColorStop(.38,`rgba(130, 238, 255, 0.68)`),h.addColorStop(1,`rgba(32, 200, 240, 0.0)`),m.fillStyle=h,m.fillRect(0,0,64,64);let g=new Wi(p),_=new Yr;_.setAttribute(`position`,new Pr(this.motePositions,3)),_.setAttribute(`color`,new Pr(d,3));let v=new Ii({size:.24,map:g,vertexColors:!0,transparent:!0,opacity:.78,blending:2,depthWrite:!1});this.atmospherePoints=new Vi(_,v),this.root.add(this.atmospherePoints)}createBridgeChunk(e,t,n,r,i,a,o,s,c,l){let u=new H,d=new G(new K(14.2,.55,Rp),n);d.position.set(0,-.275,-20),d.receiveShadow=!0,u.add(d);let f=new G(new K(15,1.05,Rp),a);f.position.set(0,-1.05,-20),u.add(f);let p=new G(t[0],o),m=new G(t[1],o);p.castShadow=!0,m.castShadow=!0,u.add(p,m);for(let t=0;t<2;t++){let n=t===0?-1:1,s=new G(new K(.36,.18,Rp),i);s.position.set(n*6.42,.09,-20),s.receiveShadow=!0,u.add(s);let l=new G(new K(.46,.52,Rp),r);l.position.set(n*6.78,.26,-20),l.castShadow=!0,l.receiveShadow=!0,u.add(l);let d=new G(new K(.16,.12,Rp),a);d.position.set(n*6.86,.88,-20),u.add(d);for(let e=-3;e>=-38;e-=5){let t=new G(new K(.14,.45,.14),a);t.position.set(n*6.86,.68,e),u.add(t)}for(let t=-4;t>=-37;t-=8){let r=Bp(e,t),i=Math.max(1,r-.5),s=new G(new q(.032,.032,i,6),o);s.position.set(n*7.3,.5+i*.5,t),u.add(s);let c=new G(new q(.22,.22,.24,8),a);c.rotation.x=Math.PI/2,c.position.set(n*7.3,r,t),u.add(c)}let f=new G(new q(.08,.12,6.2,8),a);f.position.set(n*6.96,3.1,-20),f.castShadow=!0,u.add(f);let p=new G(new K(1.45,.1,.12),a);p.position.set(n*6.28,6.12,-20),p.rotation.z=-n*.12,u.add(p);let m=new G(new K(.42,.09,.24),c);m.position.set(n*5.65,6,-20),u.add(m)}if(e===0){let e=new G(new K(18.2,4.2,3.4),r);e.position.set(0,-3.4,0),u.add(e);for(let e of[-1,1]){let t=new G(new K(1.55,25,1.75),s);t.position.set(e*7.3,11,0),t.castShadow=!0,t.receiveShadow=!0,u.add(t);let n=new G(new K(1.22,10.6,1.4),s);n.position.set(e*7.3,28.4,0),n.castShadow=!0,u.add(n);let r=new G(new K(1.35,.55,1.65),a);r.position.set(e*7.3,33.8,0),u.add(r);let i=new G(new Aa(.24,10,8),l);i.position.set(e*7.3,34.3,0),u.add(i)}for(let e of[26.2,29.5,32.8]){let t=new G(new K(16,.9,1.12),s);t.position.set(0,e,0),t.castShadow=!0,u.add(t)}for(let e of[27.85,31.15])for(let t of[-1,1]){let n=new G(new K(14,.26,.34),a);n.position.set(0,e,0),n.rotation.z=t*.24,u.add(n)}}return u}createBossPlatform(e,t,n,r,i,a,o){let s=new H,c=new G(new K(14.26,.84,20),e);c.position.set(0,-.39,12),c.receiveShadow=!0,s.add(c);let l=new G(new K(15.04,1.05,20),r);l.position.set(0,-1.04,12),s.add(l);for(let e of[-1,1]){let r=new G(new K(.38,.2,20),n);r.position.set(e*6.42,.11,12),r.receiveShadow=!0,s.add(r);let i=new G(new K(.48,.54,20),t);i.position.set(e*6.78,.28,12),i.castShadow=!0,i.receiveShadow=!0,s.add(i);let a=new G(new K(2.65,.85,.72),t);a.position.set(e*7.72,.42,2),a.castShadow=!0,s.add(a)}let u=new G(new K(18.6,.84,28),e);u.position.set(0,-.39,-12),u.receiveShadow=!0,s.add(u);let d=new G(new K(19,1.15,28),r);d.position.set(0,-1.08,-12),s.add(d);for(let e of[-1,1]){let o=new G(new K(.75,.85,28),t);o.position.set(e*8.9,.42,-12),o.castShadow=!0,o.receiveShadow=!0,s.add(o);let c=new G(new K(.45,.24,28),n);c.position.set(e*8.35,.12,-12),s.add(c);let l=new G(new K(1.55,10.5,1.65),i);l.position.set(e*8.85,5,-24.6),l.castShadow=!0,s.add(l);let u=new G(new K(1.1,.55,.45),r);u.position.set(e*8.5,9.4,-23.8),u.rotation.x=.35,s.add(u);let d=new G(new Oa(.92,.38),a);d.position.set(e*8.5,9.32,-23.55),d.rotation.x=.35,s.add(d)}let f=new G(new K(18.6,1.05,.85),t);f.position.set(0,.52,-25.6),f.castShadow=!0,f.receiveShadow=!0,this.endBulkheadGroup.add(f);let p=new G(new K(17.2,.28,.48),n);p.position.set(0,.14,-25.02),this.endBulkheadGroup.add(p);let m=new G(new K(18,.16,.22),r);m.position.set(0,1.16,-25.6),this.endBulkheadGroup.add(m);for(let e of[-5.4,0,5.4]){let t=new G(new q(.18,.22,.28,8),r);t.position.set(e,1.32,-25.6),this.endBulkheadGroup.add(t);let n=new G(new Aa(.16,8,6),o);n.position.set(e,1.5,-25.6),this.endBulkheadGroup.add(n)}return s.add(this.endBulkheadGroup),s}createSplitDividerWall(e,t,n,r){let i=new H,a=new Y({color:2238771,bumpMap:this.textures.steelPlate,bumpScale:.03,roughness:.42,metalness:.38}),o=new W({color:593172,side:1}),s=new G(new Oa(.96,96.6),new W({color:329741,transparent:!0,opacity:.46,depthWrite:!1}));s.rotation.x=-Math.PI/2,s.position.set(0,.022,-48),i.add(s);let c=new G(new K(.5,.42,96),e);c.position.set(0,.21,-48),i.add(c);for(let e of[-1,1]){let n=new G(new K(.08,.16,96),t);n.position.set(e*.27,.09,-48),i.add(n)}let l=new G(new K(.24,2.58,96),a);l.position.set(0,1.38,-48),i.add(l);let u=new G(new K(.3,2.66,96.08),o);u.position.set(0,1.38,-48),i.add(u);let d=new W({color:2421458}),f=new W({color:16726891}),p=new G(new K(.025,.09,95.4),d);p.position.set(-.135,1.82,-48);let m=new G(new K(.025,.09,95.4),f);m.position.set(.135,1.82,-48),i.add(p,m);let h=new G(new K(.32,.12,96.1),n);h.position.set(0,2.71,-48),i.add(h);let g=new K(.36,2.48,.18);for(let e=-1.2;e>=-94;e-=6.5){let t=new G(g,n);t.position.set(0,1.38,e),i.add(t)}let _=new G(new q(.2,.3,2.72,6),n);_.position.set(0,1.36,.05),i.add(_);let v=new G(new q(.25,.35,2.78,6),o);v.position.set(0,1.36,.05),i.add(v);let y=new G(new K(.42,.62,.12),t);y.position.set(0,.95,.24),i.add(y);let b=new G(new Da(.17,0),r);return b.position.set(0,2.88,.05),i.add(b),i}configureBoardLayout(e,t=-8.2){let n=e===`SPLIT_CAUSEWAY`,r=n?this.textures.causewayAlbedo:this.textures.albedo,i=n?this.textures.causewayBump:this.textures.bump;this.deckMat.map!==r&&(this.deckMat.map=r,this.deckMat.bumpMap=i,this.deckMat.needsUpdate=!0),this.splitDividerGroup.visible=n,this.dividerRetracted=!1,this.dividerCurrentY=0,this.splitDividerGroup.position.set(Bd,0,t)}setDividerRetracted(e){this.dividerRetracted=e}configureBossPlatformZ(e,t=!0){this.bossPlatform.position.set(0,.01,e+8),this.finiteTerminusZ=t?e-18:null,this.endBulkheadGroup.visible=t;for(let e=0;e<this.chunks.length;e++){let t=this.chunks[e];t.visible=this.finiteTerminusZ===null||t.position.z-Rp>=this.finiteTerminusZ}}update(e,t,n,r){if(this.waterUniforms.uTime.value=t,r&&this.waterUniforms.uCamPos.value.copy(r),this.waterMesh.position.z=n-130,this.splitDividerGroup.visible||this.dividerCurrentY>-3.1){let t=this.dividerRetracted?-3.2:0;this.dividerCurrentY+=(t-this.dividerCurrentY)*Math.min(1,e*6.5),this.splitDividerGroup.position.y=this.dividerCurrentY,this.dividerRetracted&&this.dividerCurrentY<-3.05&&(this.splitDividerGroup.visible=!1)}for(let e=0;e<this.chunks.length;e++){let t=this.chunks[e];t.position.z-Rp>n+50?t.position.z-=400:t.position.z<n-400+50&&(t.position.z+=400),t.visible=this.finiteTerminusZ===null||t.position.z-Rp>=this.finiteTerminusZ}let i=this.atmospherePoints.geometry.getAttribute(`position`);for(let r=0;r<this.moteCount;r++){let i=r*3,a=this.motePositions[i]+e*(.85+r%4*.22);a>18&&(a=-18),this.motePositions[i]=a;let o=this.motePositions[i+1]+Math.sin(t*2+r)*e*.25;o<.3&&(o=8.5),o>9.5&&(o=.4),this.motePositions[i+1]=o;let s=this.motePositions[i+2];s>n+22?s-=145:s<n-125&&(s+=145),this.motePositions[i+2]=s}i.needsUpdate=!0}},Up=32,Wp={x:0,y:0,visible:!1},Gp=class{pool=[];cursor=0;constructor(e){for(let t=0;t<Up;t++){let t=document.createElement(`div`);t.className=`combat-popup`,t.style.opacity=`0`,e.appendChild(t),this.pool.push({el:t,active:!1,worldX:0,worldY:0,worldZ:0,age:0,maxAge:.75,halfWidthPx:64})}}spawn(e,t,n,r,i,a=.82){for(let t=0;t<Up;t++){let r=this.pool[t];r.active&&r.age<.45&&Math.abs(r.worldX-e)<1.6&&Math.abs(r.worldZ-n)<2.8&&(r.worldY+=.56)}let o=this.pool[this.cursor];this.cursor=(this.cursor+1)%Up,o.active=!0,o.worldX=e,o.worldY=t,o.worldZ=n,o.age=0,o.maxAge=a;let s=i===`gold`||i===`cyan`?12.2:10.6;o.halfWidthPx=Math.max(58,Math.min(188,r.length*s*.54+16)),o.el.textContent=r,o.el.className=`combat-popup combat-popup--${i}`}update(e,t){for(let n=0;n<Up;n++){let r=this.pool[n];if(!r.active)continue;if(r.age+=e,r.age>=r.maxAge){r.active=!1,r.el.style.opacity=`0`;continue}let i=r.age/r.maxAge,a=r.worldY+i*1.45;if(t.projectToScreen(r.worldX,a,r.worldZ,Wp),!Wp.visible){r.el.style.opacity=`0`;continue}let o=Math.min(window.innerWidth*.48,r.halfWidthPx),s=Math.max(o,Math.min(Math.max(o,window.innerWidth-o),Wp.x)),c=Math.max(64,Math.min(Math.max(64,window.innerHeight-64),Wp.y)),l=i<.7?1:1-(i-.7)/.3,u=i<.16?.75+i/.16*.35:1.1-i*.12;r.el.style.opacity=l.toFixed(2),r.el.style.transform=`translate3d(${s.toFixed(1)}px, ${c.toFixed(1)}px, 0) translate(-50%, -50%) scale(${u.toFixed(2)})`}}clear(){for(let e=0;e<Up;e++)this.pool[e].active=!1,this.pool[e].el.style.opacity=`0`}},Kp=40,qp=64,Jp=96,Yp=24,Xp=48,Zp=140,Qp=new B,$p=new Yt,em=new kn,tm=new B,nm=new yn,rm=new U,im=new B,am=new B;function om(){let e=[];for(let[t,n,r,i]of[[0,0,0,.56],[.34,.22,.14,.36],[-.36,.18,-.1,.35],[.12,.44,-.16,.32],[-.18,-.14,.32,.3],[.24,-.12,-.28,.3]]){let a=new Ta(i,1);a.translate(t,n,r);let o=a.index?a.toNonIndexed():a;o.deleteAttribute(`uv`),e.push(o),o!==a&&a.dispose()}let t=xu(e,!1);for(let t of e)t.dispose();return t.computeVertexNormals(),Ru(t),t}function sm(e,t){let n=new W({color:725016,side:1}),r=e.toFixed(4);return n.customProgramCacheKey=()=>t,n.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
        attribute vec3 aOutlineNormal;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
        {
          vec3 safeNorm = aOutlineNormal / max(0.0001, length(aOutlineNormal));
          transformed += safeNorm * ${r};
        }`)},n}var cm=class{ringMesh;ringX=new Float32Array(Kp);ringZ=new Float32Array(Kp);ringAge=new Float32Array(Kp);ringMaxAge=new Float32Array(Kp);ringMaxRadius=new Float32Array(Kp);ringR=new Float32Array(Kp);ringG=new Float32Array(Kp);ringB=new Float32Array(Kp);activeRings=0;flashMesh;flashX=new Float32Array(qp);flashY=new Float32Array(qp);flashZ=new Float32Array(qp);flashAge=new Float32Array(qp);flashMaxAge=new Float32Array(qp);flashScale=new Float32Array(qp);flashR=new Float32Array(qp);flashG=new Float32Array(qp);flashB=new Float32Array(qp);activeFlashes=0;splashMesh;splashX=new Float32Array(Jp);splashY=new Float32Array(Jp);splashZ=new Float32Array(Jp);splashAge=new Float32Array(Jp);splashMaxAge=new Float32Array(Jp);splashScale=new Float32Array(Jp);splashR=new Float32Array(Jp);splashG=new Float32Array(Jp);splashB=new Float32Array(Jp);activeSplashes=0;fireballMesh;fireballOutlineMesh;fbX=new Float32Array(Yp);fbY=new Float32Array(Yp);fbZ=new Float32Array(Yp);fbAge=new Float32Array(Yp);fbMaxAge=new Float32Array(Yp);fbScale=new Float32Array(Yp);activeFireballs=0;tireMesh;tireOutlineMesh;tireX=new Float32Array(Xp);tireY=new Float32Array(Xp);tireZ=new Float32Array(Xp);tireVx=new Float32Array(Xp);tireVy=new Float32Array(Xp);tireVz=new Float32Array(Xp);tireRx=new Float32Array(Xp);tireRy=new Float32Array(Xp);tireRz=new Float32Array(Xp);tireSpinX=new Float32Array(Xp);tireSpinY=new Float32Array(Xp);tireAge=new Float32Array(Xp);tireMaxAge=new Float32Array(Xp);activeTires=0;tireSeed=1;coinMesh;coinOutlineMesh;coinX=new Float32Array(Zp);coinY=new Float32Array(Zp);coinZ=new Float32Array(Zp);coinStartX=new Float32Array(Zp);coinStartY=new Float32Array(Zp);coinStartZ=new Float32Array(Zp);coinVx=new Float32Array(Zp);coinVy=new Float32Array(Zp);coinVz=new Float32Array(Zp);coinAge=new Float32Array(Zp);coinPopDur=new Float32Array(Zp);coinMaxAge=new Float32Array(Zp);coinValue=new Int32Array(Zp);coinSpin=new Float32Array(Zp);activeCoins=0;coinSeed=1;constructor(e){let t=new ka(.76,1,28);t.rotateX(-Math.PI/2);let n=new W({color:16777215,side:2,transparent:!0,opacity:.9,blending:2,depthWrite:!1});this.ringMesh=new ki(t,n,Kp),this.ringMesh.instanceMatrix.setUsage(Tt),this.ringMesh.frustumCulled=!1,this.ringMesh.count=0;for(let e=0;e<Kp;e++)this.ringMesh.setColorAt(e,rm.setRGB(1,1,1));e.add(this.ringMesh);let r=new K(.28,.045,.42),i=new K(.045,.28,.42),a=new K(.12,.12,.24),o=r.toNonIndexed(),s=i.toNonIndexed(),c=a.toNonIndexed(),l=new Float32Array((o.attributes.position.count+s.attributes.position.count+c.attributes.position.count)*3);l.set(o.attributes.position.array,0),l.set(s.attributes.position.array,o.attributes.position.array.length),l.set(c.attributes.position.array,o.attributes.position.array.length+s.attributes.position.array.length),r.dispose(),i.dispose(),a.dispose(),o.dispose(),s.dispose(),c.dispose();let u=new Yr;u.setAttribute(`position`,new Pr(l,3)),u.computeVertexNormals();let d=new W({color:16777215,transparent:!0,opacity:.95,blending:2,depthWrite:!1});this.flashMesh=new ki(u,d,qp),this.flashMesh.instanceMatrix.setUsage(Tt),this.flashMesh.frustumCulled=!1,this.flashMesh.count=0;for(let e=0;e<qp;e++)this.flashMesh.setColorAt(e,rm.setRGB(1,1,1));e.add(this.flashMesh);let f=document.createElement(`canvas`);f.width=128,f.height=128;let p=f.getContext(`2d`),m=[[64,64,30],[42,58,22],[86,56,23],[50,82,20],[78,80,21],[64,42,21]];p.fillStyle=`rgba(16, 24, 36, 0.78)`;for(let[e,t,n]of m)p.beginPath(),p.arc(e,t,n+5,0,Math.PI*2),p.fill();p.fillStyle=`rgba(246, 250, 255, 0.97)`;for(let[e,t,n]of m)p.beginPath(),p.arc(e,t,n,0,Math.PI*2),p.fill();p.fillStyle=`rgba(255, 255, 255, 0.96)`;for(let[e,t,n]of m)p.beginPath(),p.arc(e-2,t-3,n*.4,0,Math.PI*2),p.fill();p.save(),p.translate(64,64),p.fillStyle=`rgba(255, 255, 255, 0.92)`;for(let e=0;e<5;e++)p.rotate(Math.PI*2/5),p.beginPath(),p.moveTo(-3.5,-24),p.lineTo(0,-56),p.lineTo(3.5,-24),p.closePath(),p.fill();p.restore();let h=new Wi(f);h.colorSpace=yt;let g=new Oa(1.08,1.08);g.rotateX(-.42);let _=new W({color:16777215,map:h,transparent:!0,opacity:.94,blending:1,toneMapped:!1,alphaTest:.03,side:2,depthWrite:!1});this.splashMesh=new ki(g,_,Jp),this.splashMesh.instanceMatrix.setUsage(Tt),this.splashMesh.frustumCulled=!1,this.splashMesh.count=0;for(let e=0;e<Jp;e++)this.splashMesh.setColorAt(e,rm.setRGB(1,1,1));e.add(this.splashMesh);let v=om(),y=new W({color:16777215,toneMapped:!1});this.fireballMesh=new ki(v,y,Yp),this.fireballMesh.instanceMatrix.setUsage(Tt),this.fireballMesh.frustumCulled=!1,this.fireballMesh.count=0;for(let e=0;e<Yp;e++)this.fireballMesh.setColorAt(e,rm.setRGB(1,.7,.2));e.add(this.fireballMesh);let b=sm(.052,`fireball-outline-v80`);this.fireballOutlineMesh=new ki(v,b,Yp),this.fireballOutlineMesh.instanceMatrix=this.fireballMesh.instanceMatrix,this.fireballOutlineMesh.frustumCulled=!1,this.fireballOutlineMesh.count=0,e.add(this.fireballOutlineMesh);let x=Qu(),S=new Y({vertexColors:!0,roughness:.56,metalness:.22});this.tireMesh=new ki(x,S,Xp),this.tireMesh.instanceMatrix.setUsage(Tt),this.tireMesh.frustumCulled=!1,this.tireMesh.count=0,e.add(this.tireMesh);let C=sm(.032,`tire-debris-outline-v80`);this.tireOutlineMesh=new ki(x,C,Xp),this.tireOutlineMesh.instanceMatrix=this.tireMesh.instanceMatrix,this.tireOutlineMesh.frustumCulled=!1,this.tireOutlineMesh.count=0,e.add(this.tireOutlineMesh);let w=$u(),T=new Y({vertexColors:!0,emissive:6044672,emissiveIntensity:.85,roughness:.22,metalness:.44});this.coinMesh=new ki(w,T,Zp),this.coinMesh.instanceMatrix.setUsage(Tt),this.coinMesh.frustumCulled=!1,this.coinMesh.count=0,e.add(this.coinMesh);let E=sm(.026,`magnet-coin-outline-v80`);this.coinOutlineMesh=new ki(w,E,Zp),this.coinOutlineMesh.instanceMatrix=this.coinMesh.instanceMatrix,this.coinOutlineMesh.frustumCulled=!1,this.coinOutlineMesh.count=0,e.add(this.coinOutlineMesh)}get activeFireballCount(){return this.activeFireballs}get activeTireDebrisCount(){return this.activeTires}get activeMagnetCoinCount(){return this.activeCoins}clear(){this.activeRings=0,this.activeFlashes=0,this.activeSplashes=0,this.activeFireballs=0,this.activeTires=0,this.activeCoins=0,this.ringMesh.count=0,this.flashMesh.count=0,this.splashMesh.count=0,this.fireballMesh.count=0,this.fireballOutlineMesh.count=0,this.tireMesh.count=0,this.tireOutlineMesh.count=0,this.coinMesh.count=0,this.coinOutlineMesh.count=0}spawnShockwave(e,t,n,r,i){if(this.activeRings>=Kp)return;let a=this.activeRings++;this.ringX[a]=e,this.ringZ[a]=t,this.ringAge[a]=0,this.ringMaxAge[a]=Math.max(.08,r),this.ringMaxRadius[a]=n,rm.setHex(i),this.ringR[a]=rm.r*1.45,this.ringG[a]=rm.g*1.45,this.ringB[a]=rm.b*1.45}spawnMuzzleFlash(e,t,n,r,i){if(this.activeFlashes>=qp)return;let a=this.activeFlashes++;this.flashX[a]=e,this.flashY[a]=t,this.flashZ[a]=n,this.flashAge[a]=0,this.flashMaxAge[a]=.055,this.flashScale[a]=r,rm.setHex(i),this.flashR[a]=rm.r*1.9,this.flashG[a]=rm.g*1.7,this.flashB[a]=rm.b*1.4}spawnImpactSplash(e,t,n,r,i){if(this.activeSplashes>=Jp)return;let a=this.activeSplashes++;this.splashX[a]=e,this.splashY[a]=t,this.splashZ[a]=n,this.splashAge[a]=0,this.splashMaxAge[a]=.165,this.splashScale[a]=r,rm.setHex(i),this.splashR[a]=.14+rm.r*.88,this.splashG[a]=.14+rm.g*.88,this.splashB[a]=.14+rm.b*.88}spawnCartoonFireball(e,t,n,r=1.65){if(this.activeFireballs>=Yp)return;let i=this.activeFireballs++;this.fbX[i]=e,this.fbY[i]=t,this.fbZ[i]=n,this.fbAge[i]=0,this.fbMaxAge[i]=.58,this.fbScale[i]=r}spawnTireDebris(e,t,n=5){for(let r=0;r<n;r++){if(this.activeTires>=Xp)return;let i=this.activeTires++,a=this.tireSeed++,o=r/Math.max(1,n)*Math.PI*2+a%5*.31,s=3.2+a*7%9*.36;this.tireX[i]=e+Math.cos(o)*.35,this.tireY[i]=.72+r%3*.38,this.tireZ[i]=t+Math.sin(o)*.25,this.tireVx[i]=Math.cos(o)*s,this.tireVy[i]=7.4+a*13%7*.58,this.tireVz[i]=Math.sin(o)*s*.85-1.2,this.tireRx[i]=a%7*.4,this.tireRy[i]=o,this.tireRz[i]=0,this.tireSpinX[i]=(a%2==0?1:-1)*(8.5+a%5*1.4),this.tireSpinY[i]=(a%2==0?-1:1)*(5.2+a%4*1.1),this.tireAge[i]=0,this.tireMaxAge[i]=.88+r%3*.08}}spawnMagnetizedCoins(e,t,n,r,i){let a=Math.max(1,Math.min(8,r)),o=Math.floor(i/a),s=i-o*a;for(let r=0;r<a;r++){let i=o+ +(s>0);if(s>0&&s--,this.activeCoins>=Zp){this.coinValue[139]+=i;continue}let c=this.activeCoins++,l=this.coinSeed++,u=r/a*Math.PI*2+l%11*.42,d=a===1?.85:1.7+r%3*.55;this.coinX[c]=e,this.coinY[c]=t,this.coinZ[c]=n,this.coinStartX[c]=e,this.coinStartY[c]=t,this.coinStartZ[c]=n,this.coinVx[c]=Math.cos(u)*d,this.coinVy[c]=5.4+l*5%7*.36,this.coinVz[c]=Math.sin(u)*d*.55,this.coinAge[c]=0,this.coinPopDur[c]=.16+r%3*.025,this.coinMaxAge[c]=.5+r%4*.04,this.coinValue[c]=i,this.coinSpin[c]=12+l%5*1.6}}updateAndSync(e,t,n=.82,r=.89,i){let a=0;for(;a<this.activeRings;){let t=this.ringAge[a]+e;if(t>=this.ringMaxAge[a]){let e=this.activeRings-1;a!==e&&(this.ringX[a]=this.ringX[e],this.ringZ[a]=this.ringZ[e],this.ringAge[a]=this.ringAge[e],this.ringMaxAge[a]=this.ringMaxAge[e],this.ringMaxRadius[a]=this.ringMaxRadius[e],this.ringR[a]=this.ringR[e],this.ringG[a]=this.ringG[e],this.ringB[a]=this.ringB[e]),this.activeRings=e;continue}this.ringAge[a]=t;let n=t/this.ringMaxAge[a],r=.35+(1-(1-n)*(1-n))*this.ringMaxRadius[a],i=1-n;Qp.set(this.ringX[a],.06,this.ringZ[a]),$p.identity(),tm.set(r,1,r),nm.compose(Qp,$p,tm),this.ringMesh.setMatrixAt(a,nm),rm.setRGB(this.ringR[a]*i,this.ringG[a]*i,this.ringB[a]*i),this.ringMesh.setColorAt(a,rm),a++}this.ringMesh.count=this.activeRings,this.activeRings>0&&(this.ringMesh.instanceMatrix.needsUpdate=!0,this.ringMesh.instanceColor&&(this.ringMesh.instanceColor.needsUpdate=!0));let o=0;for(;o<this.activeFlashes;){let t=this.flashAge[o]+e;if(t>=this.flashMaxAge[o]){let e=this.activeFlashes-1;o!==e&&(this.flashX[o]=this.flashX[e],this.flashY[o]=this.flashY[e],this.flashZ[o]=this.flashZ[e],this.flashAge[o]=this.flashAge[e],this.flashMaxAge[o]=this.flashMaxAge[e],this.flashScale[o]=this.flashScale[e],this.flashR[o]=this.flashR[e],this.flashG[o]=this.flashG[e],this.flashB[o]=this.flashB[e]),this.activeFlashes=e;continue}this.flashAge[o]=t;let n=1-t/this.flashMaxAge[o],r=this.flashScale[o]*(.65+n*.55);Qp.set(this.flashX[o],this.flashY[o],this.flashZ[o]),em.set(0,0,o*1.1+t*28),$p.setFromEuler(em),tm.set(r,r,r*1.25),nm.compose(Qp,$p,tm),this.flashMesh.setMatrixAt(o,nm),rm.setRGB(this.flashR[o]*n,this.flashG[o]*n,this.flashB[o]*n),this.flashMesh.setColorAt(o,rm),o++}this.flashMesh.count=this.activeFlashes,this.activeFlashes>0&&(this.flashMesh.instanceMatrix.needsUpdate=!0,this.flashMesh.instanceColor&&(this.flashMesh.instanceColor.needsUpdate=!0));let s=0;for(;s<this.activeSplashes;){let t=this.splashAge[s]+e;if(t>=this.splashMaxAge[s]){let e=this.activeSplashes-1;s!==e&&(this.splashX[s]=this.splashX[e],this.splashY[s]=this.splashY[e],this.splashZ[s]=this.splashZ[e],this.splashAge[s]=this.splashAge[e],this.splashMaxAge[s]=this.splashMaxAge[e],this.splashScale[s]=this.splashScale[e],this.splashR[s]=this.splashR[e],this.splashG[s]=this.splashG[e],this.splashB[s]=this.splashB[e]),this.activeSplashes=e;continue}this.splashAge[s]=t,this.splashY[s]+=e*1.35;let n=t/this.splashMaxAge[s],r=n<.28?.44+n/.28*.78:Math.max(.03,1.22*(1-(n-.28)/.72)),i=this.splashScale[s]*r,a=1.06-n*.18;Qp.set(this.splashX[s],this.splashY[s],this.splashZ[s]),em.set(0,0,s*.85+t*8.5),$p.setFromEuler(em),tm.set(i,i,i),nm.compose(Qp,$p,tm),this.splashMesh.setMatrixAt(s,nm),rm.setRGB(this.splashR[s]*a,this.splashG[s]*a,this.splashB[s]*a),this.splashMesh.setColorAt(s,rm),s++}this.splashMesh.count=this.activeSplashes,this.activeSplashes>0&&(this.splashMesh.instanceMatrix.needsUpdate=!0,this.splashMesh.instanceColor&&(this.splashMesh.instanceColor.needsUpdate=!0));let c=0;for(;c<this.activeFireballs;){let t=this.fbAge[c]+e;if(t>=this.fbMaxAge[c]){let e=this.activeFireballs-1;c!==e&&(this.fbX[c]=this.fbX[e],this.fbY[c]=this.fbY[e],this.fbZ[c]=this.fbZ[e],this.fbAge[c]=this.fbAge[e],this.fbMaxAge[c]=this.fbMaxAge[e],this.fbScale[c]=this.fbScale[e]),this.activeFireballs=e;continue}this.fbAge[c]=t;let n=t/this.fbMaxAge[c],r=n<.32?.35+n/.32*1.12:1.47*(1-(n-.32)/.68*.92),i=Math.max(.05,this.fbScale[c]*r);if(Qp.set(this.fbX[c],this.fbY[c]+n*1.35,this.fbZ[c]),em.set(n*2.1,c*1.3+n*4.2,n*1.7),$p.setFromEuler(em),tm.set(i,i*.92,i),nm.compose(Qp,$p,tm),this.fireballMesh.setMatrixAt(c,nm),n<.28){let e=n/.28;rm.setRGB(1,.88-e*.38,.14-e*.12)}else if(n<.66){let e=(n-.28)/.38;rm.setRGB(1,.5-e*.4,.02-e*.015)}else{let e=(n-.66)/.34;rm.setRGB(.85-e*.72,.1-e*.07,.015)}this.fireballMesh.setColorAt(c,rm),c++}this.fireballMesh.count=this.activeFireballs,this.fireballOutlineMesh.count=this.activeFireballs,this.activeFireballs>0&&(this.fireballMesh.instanceMatrix.needsUpdate=!0,this.fireballMesh.instanceColor&&(this.fireballMesh.instanceColor.needsUpdate=!0));let l=0;for(;l<this.activeTires;){let t=this.tireAge[l]+e;if(t>=this.tireMaxAge[l]){let e=this.activeTires-1;l!==e&&(this.tireX[l]=this.tireX[e],this.tireY[l]=this.tireY[e],this.tireZ[l]=this.tireZ[e],this.tireVx[l]=this.tireVx[e],this.tireVy[l]=this.tireVy[e],this.tireVz[l]=this.tireVz[e],this.tireRx[l]=this.tireRx[e],this.tireRy[l]=this.tireRy[e],this.tireRz[l]=this.tireRz[e],this.tireSpinX[l]=this.tireSpinX[e],this.tireSpinY[l]=this.tireSpinY[e],this.tireAge[l]=this.tireAge[e],this.tireMaxAge[l]=this.tireMaxAge[e]),this.activeTires=e;continue}this.tireAge[l]=t,this.tireVy[l]-=22*e,this.tireX[l]+=this.tireVx[l]*e,this.tireY[l]+=this.tireVy[l]*e,this.tireZ[l]+=this.tireVz[l]*e,this.tireRx[l]+=this.tireSpinX[l]*e,this.tireRy[l]+=this.tireSpinY[l]*e,this.tireY[l]<.28&&(this.tireY[l]=.28,this.tireVy[l]=Math.abs(this.tireVy[l])*.42,this.tireVx[l]*=.78,this.tireVz[l]*=.78);let n=1-t/this.tireMaxAge[l],r=n<.28?Math.max(.05,n/.28):1.05;Qp.set(this.tireX[l],this.tireY[l],this.tireZ[l]),em.set(this.tireRx[l],this.tireRy[l],this.tireRz[l]),$p.setFromEuler(em),tm.set(r,r,r),nm.compose(Qp,$p,tm),this.tireMesh.setMatrixAt(l,nm),l++}this.tireMesh.count=this.activeTires,this.tireOutlineMesh.count=this.activeTires,this.activeTires>0&&(this.tireMesh.instanceMatrix.needsUpdate=!0),this.activeCoins>0&&(t?(am.set(n,r,.5).unproject(t),im.copy(am).sub(t.position).normalize(),am.copy(t.position).addScaledVector(im,9.5)):am.set(5.2,8.5,0));let u=0;for(;u<this.activeCoins;){let t=this.coinAge[u]+e;if(t>=this.coinMaxAge[u]){let e=this.coinValue[u],t=this.activeCoins-1;u!==t&&(this.coinX[u]=this.coinX[t],this.coinY[u]=this.coinY[t],this.coinZ[u]=this.coinZ[t],this.coinStartX[u]=this.coinStartX[t],this.coinStartY[u]=this.coinStartY[t],this.coinStartZ[u]=this.coinStartZ[t],this.coinVx[u]=this.coinVx[t],this.coinVy[u]=this.coinVy[t],this.coinVz[u]=this.coinVz[t],this.coinAge[u]=this.coinAge[t],this.coinPopDur[u]=this.coinPopDur[t],this.coinMaxAge[u]=this.coinMaxAge[t],this.coinValue[u]=this.coinValue[t],this.coinSpin[u]=this.coinSpin[t]),this.activeCoins=t,i&&e>0&&i(e);continue}this.coinAge[u]=t;let n=this.coinPopDur[u],r,a,o,s=1.05;if(t<=n)this.coinVy[u]-=18*e,this.coinX[u]+=this.coinVx[u]*e,this.coinY[u]=Math.max(.35,this.coinY[u]+this.coinVy[u]*e),this.coinZ[u]+=this.coinVz[u]*e,this.coinStartX[u]=this.coinX[u],this.coinStartY[u]=this.coinY[u],this.coinStartZ[u]=this.coinZ[u],r=this.coinX[u],a=this.coinY[u],o=this.coinZ[u];else{let e=Math.min(1,(t-n)/Math.max(.05,this.coinMaxAge[u]-n)),i=e*e*(2.2-1.2*e),c=Math.sin(e*Math.PI)*1.85;r=this.coinStartX[u]+(am.x-this.coinStartX[u])*i,a=this.coinStartY[u]+(am.y-this.coinStartY[u])*i+c,o=this.coinStartZ[u]+(am.z-this.coinStartZ[u])*i,this.coinX[u]=r,this.coinY[u]=a,this.coinZ[u]=o,s=1.08-e*.44}Qp.set(r,a,o),em.set(.28,t*this.coinSpin[u],Math.sin(t*8)*.2),$p.setFromEuler(em),tm.set(s,s,s),nm.compose(Qp,$p,tm),this.coinMesh.setMatrixAt(u,nm),u++}this.coinMesh.count=this.activeCoins,this.coinOutlineMesh.count=this.activeCoins,this.activeCoins>0&&(this.coinMesh.instanceMatrix.needsUpdate=!0)}},lm=4,um=.3,dm=class{slots=[];skinTheme=`UNICORN`;constructor(e){let t=new ka(.65,1.02,18);for(let n=0;n<lm;n++){let n=new H;n.visible=!1;let r=new H;n.add(r);let i=new W({color:16768845,transparent:!0,opacity:.82,blending:2,side:2,depthWrite:!1}),a=new G(t,i);n.add(a);let o=e=>({1:Lu(1,e),2:Lu(2,e),3:Lu(3,e),4:Lu(4,e),5:Lu(5,e)}),s={TACTICAL:o(`TACTICAL`),UNICORN:o(`UNICORN`)};for(let e of[`TACTICAL`,`UNICORN`])for(let t of[1,2,3,4,5]){let n=s[e][t];n.root.scale.setScalar(1.92),n.root.visible=!1,r.add(n.root)}e.add(n),this.slots.push({root:n,spinPivot:r,haloMesh:a,haloMat:i,rigsByTheme:s,active:!1,tier:2,startX:0,startY:2.2,startZ:0,age:0,duration:um})}}get activeCount(){let e=0;for(let t=0;t<lm;t++)this.slots[t].active&&e++;return e}setSkinTheme(e){if(this.skinTheme!==e){this.skinTheme=e;for(let e=0;e<lm;e++){let t=this.slots[e];t.active&&this.syncSlotRigVisibility(t)}}}clear(){for(let e=0;e<lm;e++){let t=this.slots[e];t.active=!1,t.root.visible=!1}}launch(e,t,n,r){let i=this.slots[0];for(let e=0;e<lm;e++){if(!this.slots[e].active){i=this.slots[e];break}this.slots[e].age>i.age&&(i=this.slots[e])}i.active=!0,i.tier=e,i.startX=t,i.startY=n,i.startZ=r,i.age=0,i.duration=um,i.root.position.set(t,n,r),i.root.scale.setScalar(1),i.spinPivot.rotation.set(.25,0,.12),i.root.visible=!0,this.syncSlotRigVisibility(i)}syncSlotRigVisibility(e){let t=Ou(e.tier,this.skinTheme).colorHex;e.haloMat.color.setHex(this.skinTheme===`UNICORN`?t:16767053);for(let t of[`TACTICAL`,`UNICORN`])for(let n of[1,2,3,4,5])e.rigsByTheme[t][n].root.visible=t===this.skinTheme&&n===e.tier}update(e,t,n,r,i){for(let a=0;a<lm;a++){let o=this.slots[a];if(!o.active)continue;o.age+=e;let s=Math.min(1,o.age/Math.max(.05,o.duration)),c=s<.5?2*s*s:1-(-2*s+2)**2*.5,l=o.startX+(t-o.startX)*c,u=o.startZ+(n-o.startZ)*c,d=Math.sin(s*Math.PI)*2.15,f=o.startY+(1.15-o.startY)*c+d;o.root.position.set(l,f,u);let p=1+Math.sin(s*Math.PI)*.36;o.root.scale.setScalar(p),o.spinPivot.rotation.y+=e*16.5,o.spinPivot.rotation.x=.25+Math.sin(s*Math.PI*2)*.35,o.haloMesh.rotation.z-=e*9.5,o.haloMesh.rotation.x=-.55;let m=o.rigsByTheme[this.skinTheme][o.tier];if(m.spinCluster&&(m.spinCluster.rotation.x+=e*22),i&&s<.92&&i(l,f,u,o.tier),o.age>=o.duration){let e=o.tier;o.active=!1,o.root.visible=!1,r(e,t,n)}}}},fm=760,pm=240,mm=96,hm=40+fm+pm,gm=1.04,_m=1.26,vm=new B,ym=new Yt,bm=new kn,xm=new B,Sm=new yn,Cm=new U;function wm(){let e=document.createElement(`canvas`);e.width=64,e.height=64;let t=e.getContext(`2d`),n=t.createRadialGradient(32,32,3,32,32,30);return n.addColorStop(0,`rgba(6, 9, 14, 0.82)`),n.addColorStop(.55,`rgba(6, 9, 14, 0.42)`),n.addColorStop(1,`rgba(6, 9, 14, 0.0)`),t.fillStyle=n,t.fillRect(0,0,64,64),new Wi(e)}function Tm(e,t){return`
  {
    float phase = uStrideTime + float(gl_InstanceID) * 0.92;
    float sRaw = sin(phase);
    float effStrideAmp = ${e?`(uStrideAmp * aStrideScale)`:`uStrideAmp`};
    float strideVal = sRaw * effStrideAmp;
    float limbAngle = 0.0;
    float bootLift = 0.0;
    float pivotY = 0.38;
    if (aPartId > 0.5 && aPartId < 1.5) {
      limbAngle = strideVal;
      bootLift = max(0.0, sRaw) * effStrideAmp * 0.065;
    } else if (aPartId > 1.5 && aPartId < 2.5) {
      limbAngle = -strideVal;
      bootLift = max(0.0, -sRaw) * effStrideAmp * 0.065;
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
    ${t?`
    if (abs(uLegStrafeYaw) > 0.002 && aPartId > 0.5 && aPartId < 3.5) {
      float legYaw = aPartId < 2.5 ? uLegStrafeYaw : uLegStrafeYaw * 0.45;
      float cy = cos(legYaw);
      float sy = sin(legYaw);
      float rx = transformed.x * cy + transformed.z * sy;
      float rz = -transformed.x * sy + transformed.z * cy;
      transformed.x = rx;
      transformed.z = rz;
    }
    `:``}
  }
  `}function Em(e,t,n,r=!1,i=!1,a=!1,o=!1){let s=i?`(uStrideAmp * aStrideScale)`:`uStrideAmp`,c=Tm(i,o),l=o?`
          if (abs(uLegStrafeYaw) > 0.002 && aPartId > 0.5 && aPartId < 3.5) {
            float legYawN = aPartId < 2.5 ? uLegStrafeYaw : uLegStrafeYaw * 0.45;
            float cyn = cos(legYawN);
            float syn = sin(legYawN);
            float nx = objectNormal.x * cyn + objectNormal.z * syn;
            float nz = -objectNormal.x * syn + objectNormal.z * cyn;
            objectNormal.x = nx;
            objectNormal.z = nz;
          }
    `:``;e.customProgramCacheKey=()=>n,e.onBeforeCompile=e=>{e.uniforms.uStrideTime=t.uStrideTime,e.uniforms.uStrideAmp=t.uStrideAmp,e.uniforms.uRecoilKick=t.uRecoilKick,o&&t.uLegStrafeYaw&&(e.uniforms.uLegStrafeYaw=t.uLegStrafeYaw),a&&t.uUnicornSkin&&(e.uniforms.uUnicornSkin=t.uUnicornSkin),e.vertexShader=e.vertexShader.replace(`#include <common>`,`
        #include <common>
        attribute float aPartId;
        ${r?`attribute float aHitFlash;
varying float vHitFlash;`:``}
        ${i?`attribute float aStrideScale;`:``}
        ${a?`attribute float aRankTint;
varying float vRankTint;
varying float vLocalY;
varying float vAltOutfit;`:``}
        varying vec3 vToonWorldNormal;
        uniform float uStrideTime;
        uniform float uStrideAmp;
        uniform float uRecoilKick;
        ${o?`uniform float uLegStrafeYaw;`:``}
        `).replace(`#include <beginnormal_vertex>`,`
        #include <beginnormal_vertex>
        {
          float phase = uStrideTime + float(gl_InstanceID) * 0.92;
          float strideVal = sin(phase) * ${s};
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
          ${l}
        }
        `).replace(`#include <begin_vertex>`,`
        #include <begin_vertex>
        ${r?`vHitFlash = aHitFlash;`:``}
        ${a?`vRankTint = aRankTint;
vLocalY = position.y;
vAltOutfit = mod(float(gl_InstanceID), 2.0);`:``}
        ${c}
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
        ${a?`varying float vRankTint;
varying float vLocalY;
varying float vAltOutfit;
uniform float uUnicornSkin;`:``}
        varying vec3 vToonWorldNormal;
        `).replace(`#include <dithering_fragment>`,`
        #include <dithering_fragment>
        ${a?`
        if (uUnicornSkin > 0.5) {
          if (vAltOutfit > 0.5 && max(gl_FragColor.g, gl_FragColor.b) > gl_FragColor.r * 1.18) {
            gl_FragColor.rgb = vec3(gl_FragColor.r, gl_FragColor.b * 0.92, gl_FragColor.g * 1.06);
          }
        } else if (vRankTint < 0.5 && vLocalY < 0.78 && vLocalY > 0.09) {
          vec3 voltSyndicate = gl_FragColor.rgb * vec3(1.18, 0.82, 0.22) + vec3(0.14, 0.07, 0.0);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, voltSyndicate, 0.84);
        }
        `:``}
        {
          // Crisp stylized 2-band cel-saturation lift + moonlit cyan sky rim so characters pop!
          vec3 wn = vToonWorldNormal / max(0.0001, length(vToonWorldNormal));
          float topBand = smoothstep(-0.22, 0.35, wn.y * 0.72 - wn.z * 0.38 - wn.x * 0.25);
          gl_FragColor.rgb *= mix(0.92, 1.18, topBand);
          float skyRim = smoothstep(0.55, 0.92, wn.y);
          gl_FragColor.rgb += vec3(0.04, 0.09, 0.12) * skyRim;
        }
        ${r?`
        if (vHitFlash > 0.05) {
          // Crisp 1-2 frame pure solid-white hit-flash on bullet impact!
          float flashMask = smoothstep(0.08, 0.35, vHitFlash);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.52, 1.52, 1.52), flashMask);
        }
        `:``}
        `)}}function Dm(e,t,n,r=!1,i=!1){let a=new W({color:725016,side:1}),o=t.toFixed(4),s=Tm(r,i);return a.customProgramCacheKey=()=>n,a.onBeforeCompile=t=>{t.uniforms.uStrideTime=e.uStrideTime,t.uniforms.uStrideAmp=e.uStrideAmp,t.uniforms.uRecoilKick=e.uRecoilKick,i&&e.uLegStrafeYaw&&(t.uniforms.uLegStrafeYaw=e.uLegStrafeYaw),t.vertexShader=t.vertexShader.replace(`#include <common>`,`
        #include <common>
        attribute float aPartId;
        attribute vec3 aOutlineNormal;
        ${r?`attribute float aStrideScale;`:``}
        uniform float uStrideTime;
        uniform float uStrideAmp;
        uniform float uRecoilKick;
        ${i?`uniform float uLegStrafeYaw;`:``}
        `).replace(`#include <begin_vertex>`,`
        #include <begin_vertex>
        {
          vec3 safeNorm = aOutlineNormal / max(0.0001, length(aOutlineNormal));
          transformed += safeNorm * ${o};
        }
        ${s}
        `)},a}function Om(e,t,n){let r=Mu.toFixed(4),i=(Nu-.02).toFixed(4);e.customProgramCacheKey=()=>n,e.onBeforeCompile=e=>{e.uniforms.uBarrelSpin=t.uBarrelSpin,e.uniforms.uRecoilKick=t.uRecoilKick,e.vertexShader=e.vertexShader.replace(`#include <common>`,`
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
        `)}}function km(e,t,n){let r=Mu.toFixed(4),i=(Nu-.02).toFixed(4),a=t.toFixed(4),o=new W({color:725016,side:1});return o.customProgramCacheKey=()=>n,o.onBeforeCompile=t=>{t.uniforms.uBarrelSpin=e.uBarrelSpin,t.uniforms.uRecoilKick=e.uRecoilKick,t.vertexShader=t.vertexShader.replace(`#include <common>`,`
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
        `)},o}function Am(e){let t=e.attributes.color;if(t){for(let e=0;e<t.count;e++){let n=t.getX(e),r=t.getY(e),i=t.getZ(e),a=.18+(.299*n+.587*r+.114*i)*.56;t.setXYZ(e,a*.95,a*.99,a*1.05)}t.needsUpdate=!0}}function jm(e,t){let n=new W({color:725016,side:1}),r=e.toFixed(4);return n.customProgramCacheKey=()=>t,n.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace(`#include <common>`,`
        #include <common>
        attribute vec3 aOutlineNormal;
        `).replace(`#include <begin_vertex>`,`
        #include <begin_vertex>
        {
          vec3 safeNorm = aOutlineNormal / max(0.0001, length(aOutlineNormal));
          transformed += safeNorm * ${r};
        }
        `)},n}function Mm(e){let t=new W({color:16777215,vertexColors:!0,transparent:!0,opacity:.98,blending:1,toneMapped:!1,depthWrite:!1});return t.customProgramCacheKey=()=>e,t.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
        attribute float aAlpha;
        varying float vAlpha;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
        vAlpha = aAlpha;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
        varying float vAlpha;`).replace(`#include <dithering_fragment>`,`#include <dithering_fragment>
        gl_FragColor.a *= clamp(vAlpha, 0.0, 1.0);`)},t}var Nm=class{playerMesh;playerOutlineMesh;enemyMesh;enemyOutlineMesh;heavyEnemyMesh;heavyEnemyOutlineMesh;squadWeaponMeshes;squadWeaponOutlineMeshes;playerRagdollMesh;enemyRagdollMesh;enemyRagdollOutlineMesh;bulletMesh;bulletArrowheadMesh;particleMesh;playerGeos;weaponGeos;enemyGeos;heavyGeos;ragdollPlayerGeos;ragdollEnemyGeos;bulletStreakGeos;bulletArrowheadGeos;bulletMat;activeSkinTheme=`TACTICAL`;enemyHitFlashAttr;heavyHitFlashAttr;enemyStrideScaleAttr;heavyStrideScaleAttr;enemyRankTintAttr;playerUniforms={uStrideTime:{value:0},uStrideAmp:{value:0},uRecoilKick:{value:0},uLegStrafeYaw:{value:0}};enemyUniforms={uStrideTime:{value:0},uStrideAmp:{value:.68},uRecoilKick:{value:0},uUnicornSkin:{value:0}};weaponUniforms={uBarrelSpin:{value:0},uRecoilKick:{value:0}};shadowDiscMesh;shadowDiscCursor=0;constructor(e,t,n){this.playerGeos={TACTICAL:Bu(),UNICORN:Uu()};let r=this.playerGeos.TACTICAL,i=new Y({vertexColors:!0,roughness:.4,metalness:.14});Em(i,this.playerUniforms,`commando-player-v80`,!1,!1,!1,!0),this.playerMesh=new ki(r,i,40),this.playerMesh.instanceMatrix.setUsage(Tt),this.playerMesh.frustumCulled=!1,this.playerMesh.count=0,e.add(this.playerMesh);let a=Dm(this.playerUniforms,.023,`commando-player-outline-v80`,!1,!0);this.playerOutlineMesh=new ki(r,a,40),this.playerOutlineMesh.instanceMatrix=this.playerMesh.instanceMatrix,this.playerOutlineMesh.frustumCulled=!1,this.playerOutlineMesh.count=0,e.add(this.playerOutlineMesh);let o=new Y({vertexColors:!0,roughness:.28,metalness:.34});Om(o,this.weaponUniforms,`commando-weapon-v71`);let s=km(this.weaponUniforms,.017,`commando-weapon-outline-v71`);this.weaponGeos={TACTICAL:{1:Fu(1,`TACTICAL`),2:Fu(2,`TACTICAL`),3:Fu(3,`TACTICAL`),4:Fu(4,`TACTICAL`),5:Fu(5,`TACTICAL`)},UNICORN:{1:Fu(1,`UNICORN`),2:Fu(2,`UNICORN`),3:Fu(3,`UNICORN`),4:Fu(4,`UNICORN`),5:Fu(5,`UNICORN`)}};let c={},l={};for(let t of[1,2,3,4,5]){let n=this.weaponGeos.TACTICAL[t],r=new ki(n,o,40);r.instanceMatrix.setUsage(Tt),r.frustumCulled=!1,r.count=0,r.visible=t===1,e.add(r),c[t]=r;let i=new ki(n,s,40);i.instanceMatrix=r.instanceMatrix,i.frustumCulled=!1,i.count=0,i.visible=t===1,e.add(i),l[t]=i}this.squadWeaponMeshes=c,this.squadWeaponOutlineMeshes=l,this.enemyGeos={TACTICAL:Vu(),UNICORN:Wu()},this.enemyHitFlashAttr=new xi(new Float32Array(fm),1),this.enemyHitFlashAttr.setUsage(Tt);let u=new Float32Array(fm);u.fill(1),this.enemyStrideScaleAttr=new xi(u,1),this.enemyStrideScaleAttr.setUsage(Tt);let d=new Float32Array(fm);d.fill(1),this.enemyRankTintAttr=new xi(d,1),this.enemyRankTintAttr.setUsage(Tt);for(let e of[this.enemyGeos.TACTICAL,this.enemyGeos.UNICORN])e.setAttribute(`aHitFlash`,this.enemyHitFlashAttr),e.setAttribute(`aStrideScale`,this.enemyStrideScaleAttr),e.setAttribute(`aRankTint`,this.enemyRankTintAttr);let f=new Y({vertexColors:!0,roughness:.4,metalness:.18});Em(f,this.enemyUniforms,`commando-enemy-v71`,!0,!0,!0);let p=this.enemyGeos.TACTICAL;this.enemyMesh=new ki(p,f,fm),this.enemyMesh.instanceMatrix.setUsage(Tt),this.enemyMesh.frustumCulled=!1,this.enemyMesh.count=0,e.add(this.enemyMesh);let m=Dm(this.enemyUniforms,.023,`commando-enemy-outline-v71`,!0);this.enemyOutlineMesh=new ki(p,m,fm),this.enemyOutlineMesh.instanceMatrix=this.enemyMesh.instanceMatrix,this.enemyOutlineMesh.frustumCulled=!1,this.enemyOutlineMesh.count=0,e.add(this.enemyOutlineMesh),this.heavyGeos={TACTICAL:Hu(),UNICORN:Gu()},this.heavyHitFlashAttr=new xi(new Float32Array(pm),1),this.heavyHitFlashAttr.setUsage(Tt);let h=new Float32Array(pm);h.fill(1),this.heavyStrideScaleAttr=new xi(h,1),this.heavyStrideScaleAttr.setUsage(Tt);for(let e of[this.heavyGeos.TACTICAL,this.heavyGeos.UNICORN])e.setAttribute(`aHitFlash`,this.heavyHitFlashAttr),e.setAttribute(`aStrideScale`,this.heavyStrideScaleAttr);let g=new Y({vertexColors:!0,roughness:.36,metalness:.24});Em(g,this.enemyUniforms,`commando-heavy-v71`,!0,!0);let _=this.heavyGeos.TACTICAL;this.heavyEnemyMesh=new ki(_,g,pm),this.heavyEnemyMesh.instanceMatrix.setUsage(Tt),this.heavyEnemyMesh.frustumCulled=!1,this.heavyEnemyMesh.count=0,e.add(this.heavyEnemyMesh);let v=Dm(this.enemyUniforms,.026,`commando-heavy-outline-v71`,!0);this.heavyEnemyOutlineMesh=new ki(_,v,pm),this.heavyEnemyOutlineMesh.instanceMatrix=this.heavyEnemyMesh.instanceMatrix,this.heavyEnemyOutlineMesh.frustumCulled=!1,this.heavyEnemyOutlineMesh.count=0,e.add(this.heavyEnemyOutlineMesh),this.ragdollPlayerGeos={TACTICAL:Bu(),UNICORN:Uu()};let y=new Y({vertexColors:!0,roughness:.44,metalness:.16});this.playerRagdollMesh=new ki(this.ragdollPlayerGeos.TACTICAL,y,mm),this.playerRagdollMesh.instanceMatrix.setUsage(Tt),this.playerRagdollMesh.frustumCulled=!1,this.playerRagdollMesh.count=0,e.add(this.playerRagdollMesh);let b=Vu();Am(b);let x=Wu();Am(x),this.ragdollEnemyGeos={TACTICAL:b,UNICORN:x};let S=new Y({vertexColors:!0,roughness:.48,metalness:.1});this.enemyRagdollMesh=new ki(this.ragdollEnemyGeos.TACTICAL,S,mm),this.enemyRagdollMesh.instanceMatrix.setUsage(Tt),this.enemyRagdollMesh.frustumCulled=!1,this.enemyRagdollMesh.count=0,e.add(this.enemyRagdollMesh);let C=jm(.022,`ragdoll-enemy-outline-v71`);this.enemyRagdollOutlineMesh=new ki(this.ragdollEnemyGeos.TACTICAL,C,mm),this.enemyRagdollOutlineMesh.instanceMatrix=this.enemyRagdollMesh.instanceMatrix,this.enemyRagdollOutlineMesh.frustumCulled=!1,this.enemyRagdollOutlineMesh.count=0,e.add(this.enemyRagdollOutlineMesh);let w=new Oa(.95,.95);w.rotateX(-Math.PI/2);let T=new W({map:wm(),transparent:!0,depthWrite:!1});this.shadowDiscMesh=new ki(w,T,hm),this.shadowDiscMesh.instanceMatrix.setUsage(Tt),this.shadowDiscMesh.frustumCulled=!1,this.shadowDiscMesh.count=0,e.add(this.shadowDiscMesh),this.bulletStreakGeos={TACTICAL:Xu(),UNICORN:Ju()},this.bulletArrowheadGeos={TACTICAL:Zu(),UNICORN:Yu()},this.bulletMat=Mm(`tapered-projectile-v80`),this.bulletMesh=new ki(this.bulletStreakGeos.TACTICAL,this.bulletMat,t),this.bulletMesh.instanceMatrix.setUsage(Tt),this.bulletMesh.frustumCulled=!1,this.bulletMesh.count=0;for(let e=0;e<t;e++)this.bulletMesh.setColorAt(e,Cm.setRGB(1,1,1));e.add(this.bulletMesh),this.bulletArrowheadMesh=new ki(this.bulletArrowheadGeos.TACTICAL,this.bulletMat,t),this.bulletArrowheadMesh.instanceMatrix.setUsage(Tt),this.bulletArrowheadMesh.frustumCulled=!1,this.bulletArrowheadMesh.count=0;for(let e=0;e<t;e++)this.bulletArrowheadMesh.setColorAt(e,Cm.setRGB(1,1,1));e.add(this.bulletArrowheadMesh);let E=new Zi(.58,0),D=new Y({color:16777215,roughness:.36,metalness:.32});this.particleMesh=new ki(E,D,n),this.particleMesh.instanceMatrix.setUsage(Tt),this.particleMesh.frustumCulled=!1,this.particleMesh.count=0;for(let e=0;e<n;e++)this.particleMesh.setColorAt(e,Cm.setRGB(1,1,1));e.add(this.particleMesh)}setSkinTheme(e){if(this.activeSkinTheme!==e){this.activeSkinTheme=e,this.enemyUniforms.uUnicornSkin.value=+(e===`UNICORN`),this.playerMesh.geometry=this.playerGeos[e],this.playerOutlineMesh.geometry=this.playerGeos[e];for(let t of[1,2,3,4,5]){let n=this.weaponGeos[e][t];this.squadWeaponMeshes[t].geometry=n,this.squadWeaponOutlineMeshes[t].geometry=n}this.enemyMesh.geometry=this.enemyGeos[e],this.enemyOutlineMesh.geometry=this.enemyGeos[e],this.heavyEnemyMesh.geometry=this.heavyGeos[e],this.heavyEnemyOutlineMesh.geometry=this.heavyGeos[e],this.playerRagdollMesh.geometry=this.ragdollPlayerGeos[e],this.enemyRagdollMesh.geometry=this.ragdollEnemyGeos[e],this.enemyRagdollOutlineMesh.geometry=this.ragdollEnemyGeos[e],this.bulletMesh.geometry=this.bulletStreakGeos[e],this.bulletArrowheadMesh.geometry=this.bulletArrowheadGeos[e],this.bulletMat.needsUpdate=!0}}syncPlayerSoldiers(e,t,n,r,i,a,o=0,s=0,c=0,l=0,u=0,d=0,f=0){let p=Math.min(e,40);this.playerMesh.count=p,this.playerOutlineMesh.count=p,this.shadowDiscCursor=0,this.playerUniforms.uStrideTime.value=r*12.2;let m=Math.min(.76,f*.095);this.playerUniforms.uStrideAmp.value=Math.max(i?.66:.035,m),this.playerUniforms.uRecoilKick.value=s,this.playerUniforms.uLegStrafeYaw.value=d,this.weaponUniforms.uBarrelSpin.value=c,this.weaponUniforms.uRecoilKick.value=s,this.enemyUniforms.uStrideTime.value=r*10.6;let h=this.squadWeaponMeshes[a];for(let e of[1,2,3,4,5]){let t=this.squadWeaponMeshes[e],n=this.squadWeaponOutlineMeshes[e];e===a?(t.visible=p>0,t.count=p,n.visible=p>0,n.count=p):(t.visible=!1,t.count=0,n.visible=!1,n.count=0)}let g=Math.sin(u*Math.PI)*.36,_=Cu*(1+Math.sin(u*Math.PI)*.09);for(let e=0;e<p;e++){let a=t[e],s=n[e],c=r*12.2+e*.92,u=i||f>.35,d=(u?Math.abs(Math.sin(c))*.072:Math.sin(r*2.4+e*.7)*.016)+g,p=u?Math.sin(c)*.032:0,m=l;vm.set(a,d,s),bm.set(u?-.06:-.03,m,p-o*.35),ym.setFromEuler(bm),xm.set(_,_,_),Sm.compose(vm,ym,xm),this.playerMesh.setMatrixAt(e,Sm),vm.set(a,d,s),bm.set(u?-.03:-.015,m,p*.35-o*.25),ym.setFromEuler(bm),Sm.compose(vm,ym,xm),h.setMatrixAt(e,Sm),vm.set(a,.022,s),ym.identity();let v=Math.max(.58,.92-d*.85);xm.set(v,1,v),Sm.compose(vm,ym,xm),this.shadowDiscMesh.setMatrixAt(this.shadowDiscCursor++,Sm)}this.playerMesh.instanceMatrix.needsUpdate=!0,h.instanceMatrix.needsUpdate=!0}beginEnemyFrame(){this.enemyMesh.count=0,this.enemyOutlineMesh.count=0,this.heavyEnemyMesh.count=0,this.heavyEnemyOutlineMesh.count=0}pushEnemySoldier(e,t,n,r,i=!0,a=!1){let o=this.enemyMesh.count;if(o>=fm)return;this.enemyMesh.count=o+1,this.enemyOutlineMesh.count=o+1;let s=i?Math.abs(Math.sin(n))*.068:0,c=i?Math.sin(n)*.048:0,l=gm*(a?.96:1)*(1+r*.11);if(vm.set(e,s,t),bm.set(i?.08:.03,0,c),ym.setFromEuler(bm),xm.set(l,l,l),Sm.compose(vm,ym,xm),this.enemyMesh.setMatrixAt(o,Sm),this.enemyHitFlashAttr.setX(o,r),this.enemyStrideScaleAttr.setX(o,i?1:.04),this.enemyRankTintAttr.setX(o,+!a),this.shadowDiscCursor<hm){vm.set(e,.022,t),ym.identity();let n=.88-s*.9;xm.set(n,1,n),Sm.compose(vm,ym,xm),this.shadowDiscMesh.setMatrixAt(this.shadowDiscCursor++,Sm)}}pushHeavyEnemySoldier(e,t,n,r,i=!0){let a=this.heavyEnemyMesh.count;if(a>=pm)return;this.heavyEnemyMesh.count=a+1,this.heavyEnemyOutlineMesh.count=a+1;let o=i?Math.abs(Math.sin(n*.85))*.058:0,s=i?Math.sin(n*.85)*.042:0,c=_m*(1+r*.1);if(vm.set(e,o,t),bm.set(i?.09:.03,0,s),ym.setFromEuler(bm),xm.set(c,c,c),Sm.compose(vm,ym,xm),this.heavyEnemyMesh.setMatrixAt(a,Sm),this.heavyHitFlashAttr.setX(a,r),this.heavyStrideScaleAttr.setX(a,i?1:.04),this.shadowDiscCursor<hm){vm.set(e,.022,t),ym.identity();let n=1.18-o*.9;xm.set(n,1,n),Sm.compose(vm,ym,xm),this.shadowDiscMesh.setMatrixAt(this.shadowDiscCursor++,Sm)}}finishEnemyFrame(){this.enemyMesh.instanceMatrix.needsUpdate=!0,this.enemyHitFlashAttr.needsUpdate=!0,this.enemyStrideScaleAttr.needsUpdate=!0,this.enemyRankTintAttr.needsUpdate=!0,this.heavyEnemyMesh.instanceMatrix.needsUpdate=!0,this.heavyHitFlashAttr.needsUpdate=!0,this.heavyStrideScaleAttr.needsUpdate=!0,this.shadowDiscMesh.count=this.shadowDiscCursor,this.shadowDiscMesh.instanceMatrix.needsUpdate=!0}syncRagdolls(e){let t=0,n=0,r=e.activeCount;for(let i=0;i<r;i++){let r=1-e.age[i]/e.maxAge[i],a=(e.isEnemy[i]===1?gm:Cu)*(r<.3?Math.max(.05,r/.3):1);vm.set(e.x[i],e.y[i],e.z[i]),bm.set(e.rx[i],e.ry[i],e.rz[i]),ym.setFromEuler(bm),xm.set(a,a,a),Sm.compose(vm,ym,xm),e.isEnemy[i]===1?n<mm&&this.enemyRagdollMesh.setMatrixAt(n++,Sm):t<mm&&this.playerRagdollMesh.setMatrixAt(t++,Sm)}this.playerRagdollMesh.count=t,this.enemyRagdollMesh.count=n,this.enemyRagdollOutlineMesh.count=n,t>0&&(this.playerRagdollMesh.instanceMatrix.needsUpdate=!0),n>0&&(this.enemyRagdollMesh.instanceMatrix.needsUpdate=!0)}syncBullets(e){let t=e.activeCount,n=this.activeSkinTheme===`UNICORN`,r=0,i=0;for(let a=0;a<t;a++){let t=e.weaponTier[a];vm.set(e.x[a],e.y[a],e.z[a]);let o=Math.atan2(e.vx[a],e.vz[a]);bm.set(0,o+Math.PI,0),ym.setFromEuler(bm);let s=e.scale[a];if(t<=1)n?xm.set(s*.96,s*.95,s*1.18):xm.set(s*.9,s*.9,s*1.24),Sm.compose(vm,ym,xm),this.bulletMesh.setMatrixAt(r,Sm),this.bulletMesh.setColorAt(r,Cm.setRGB(1.04,1.04,1.04)),r++;else{let e=1+(Math.min(5,t)-2)*.11;n?xm.set(s*1.18*e,s*1.08,s*1.24*e):xm.set(s*1.16*e,s*1.06,s*1.28*e),Sm.compose(vm,ym,xm),this.bulletArrowheadMesh.setMatrixAt(i,Sm);let r=1.04+(Math.min(5,t)-2)*.06;this.bulletArrowheadMesh.setColorAt(i,Cm.setRGB(r,r,r)),i++}}this.bulletMesh.count=r,this.bulletArrowheadMesh.count=i,r>0&&(this.bulletMesh.instanceMatrix.needsUpdate=!0,this.bulletMesh.instanceColor&&(this.bulletMesh.instanceColor.needsUpdate=!0)),i>0&&(this.bulletArrowheadMesh.instanceMatrix.needsUpdate=!0,this.bulletArrowheadMesh.instanceColor&&(this.bulletArrowheadMesh.instanceColor.needsUpdate=!0))}syncParticles(e){let t=e.activeCount;this.particleMesh.count=t;for(let n=0;n<t;n++){let t=1-e.age[n]/e.maxAge[n],r=Math.max(.01,e.baseScale[n]*t);vm.set(e.x[n],e.y[n],e.z[n]);let i=e.age[n]*e.spin[n];bm.set(i,i*.7,i*.35),ym.setFromEuler(bm),xm.set(r,r,r),Sm.compose(vm,ym,xm),this.particleMesh.setMatrixAt(n,Sm);let a=e.colorR[n],o=e.colorG[n],s=e.colorB[n],c=a+o+s>1.35?1.45:1;Cm.setRGB(a*c,o*c,s*c),this.particleMesh.setColorAt(n,Cm)}this.particleMesh.instanceMatrix.needsUpdate=!0,this.particleMesh.instanceColor&&(this.particleMesh.instanceColor.needsUpdate=!0)}},Pm=44,Fm=-12,Im=new B,Lm=new B,Rm=new B,zm=class{scene;camera;renderer;sunLight;rimLight;skyDome;skyUniforms;skinTheme=`UNICORN`;armoryRoot=new H;armoryTurntable=new H;armoryRingMat;armoryOuterRing;armoryWeaponsByTheme;armoryBossesByTheme;latestArmoryBossDef=null;armoryMode=`WEAPONS`;armoryWeaponTier=1;armoryBossChassis=`WARDEN_MECH`;armoryYaw=-.45;armoryDragSpinFreeze=0;shakeTrauma=0;shakeTime=0;smoothCamX=0;elapsedSkyTime=0;portraitFactor=0;currentCamPos=new B(0,7.5,9.85);currentLookAt=new B(0,-1.38,-10.2);lastFramingMode=`LIVE_BRIDGE`;constructor(e){this.scene=new tr,this.scene.background=new U(594722),this.scene.fog=new er(1124157,.0033);let t=Math.max(1,window.innerWidth),n=Math.max(1,window.innerHeight);this.camera=new To(45,t/n,.3,420),this.camera.position.copy(this.currentCamPos),this.camera.lookAt(this.currentLookAt),this.renderer=new ru({antialias:!0,powerPreference:`default`,stencil:!1,alpha:!1});let r=Math.min(window.devicePixelRatio||1,1.75);this.renderer.setPixelRatio(r),this.renderer.setSize(t,n),this.renderer.toneMapping=4,this.renderer.toneMappingExposure=1.2,this.renderer.domElement.addEventListener(`webglcontextlost`,e=>{e.preventDefault()}),e.appendChild(this.renderer.domElement);let i=Fp();this.skyDome=i.mesh,this.skyUniforms=i.uniforms,this.scene.add(this.skyDome);let a=new po(9754879,1911872,1.58);this.scene.add(a),this.sunLight=new Oo(14873599,2.82),this.sunLight.position.set(-18,18,-24),this.scene.add(this.sunLight),this.scene.add(this.sunLight.target),this.rimLight=new Oo(3077596,1.68),this.rimLight.position.set(18,13,18),this.scene.add(this.rimLight),this.scene.add(this.rimLight.target);let o=new Oo(13625087,1.12);o.position.set(0,10,22),this.scene.add(o),this.armoryRoot.position.set(0,Pm,Fm),this.armoryRoot.visible=!1;let s=new G(new q(5.4,5.8,.34,8),new Y({color:989222,roughness:.44,metalness:.44}));s.position.set(0,-1.04,-.4),this.armoryRoot.add(s);let c=new Y({color:1713976,roughness:.34,metalness:.46}),l=new G(new q(1.75,1.98,.28,8),c);l.position.set(0,-.78,0),this.armoryRoot.add(l);let u=new G(new q(1.32,1.44,.14,8),new Y({color:2702162,roughness:.28,metalness:.48}));u.position.set(0,-.6,0),this.armoryRoot.add(u),this.armoryRingMat=new W({color:2683604,transparent:!0,opacity:.74,blending:2,side:2,depthWrite:!1});let d=new G(new ka(3.15,3.24,36),this.armoryRingMat);d.rotation.x=-Math.PI/2,d.position.set(0,-.86,-.2),this.armoryRoot.add(d);let f=new G(new ja(1.22,.032,8,32),this.armoryRingMat);f.rotation.x=Math.PI/2,f.position.set(0,-.5,0),this.armoryRoot.add(f),this.armoryOuterRing=new G(new ka(1.52,1.62,32),this.armoryRingMat),this.armoryOuterRing.rotation.x=-Math.PI/2,this.armoryOuterRing.position.set(0,-.52,0),this.armoryRoot.add(this.armoryOuterRing);let p=new G(new q(1.48,1.18,1.35,24,1,!0),new W({color:3733247,transparent:!0,opacity:.09,blending:2,side:2,depthWrite:!1}));p.position.set(0,.12,0),this.armoryRoot.add(p),this.armoryRoot.add(this.armoryTurntable);let m=e=>({1:Lu(1,e),2:Lu(2,e),3:Lu(3,e),4:Lu(4,e),5:Lu(5,e)});this.armoryWeaponsByTheme={TACTICAL:m(`TACTICAL`),UNICORN:m(`UNICORN`)};for(let e of[`TACTICAL`,`UNICORN`])for(let t of[1,2,3,4,5]){let n=this.armoryWeaponsByTheme[e][t],r=t===1?1.85:t===2?1.55:1.38;n.root.scale.setScalar(r),n.root.position.set(0,.18,0),n.root.rotation.z=.1,this.armoryTurntable.add(n.root)}this.armoryBossesByTheme={TACTICAL:md(),UNICORN:Sd()};for(let e of[`TACTICAL`,`UNICORN`]){let t=this.armoryBossesByTheme[e];for(let n of Object.keys(t)){let r=t[n],i=e===`UNICORN`?n===`SOVEREIGN_TITAN`?.36:.4:n===`SOVEREIGN_TITAN`?.42:.46;r.root.scale.setScalar(i),r.root.position.set(0,-.52,0),r.root.visible=!1,this.armoryTurntable.add(r.root)}}this.scene.add(this.armoryRoot),this.syncArmoryVisibility(),this.applyViewportFraming(),window.addEventListener(`resize`,this.handleResize)}applyViewportFraming(){let e=Math.max(1,window.innerWidth),t=Math.max(1,window.innerHeight),n=e/t,r=Math.min(window.devicePixelRatio||1,1.75);this.camera.aspect=n,this.portraitFactor=Math.max(0,Math.min(1,(.95-n)/.5)),this.camera.fov=46+this.portraitFactor*20.5,this.camera.updateProjectionMatrix(),this.renderer.setPixelRatio(r),this.renderer.setSize(e,t)}handleResize=()=>{this.applyViewportFraming()};applyArmoryBossColors(e){let t=bu(e,this.skinTheme),n=this.armoryBossesByTheme[this.skinTheme][e.chassis];n.primaryMat.color.setHex(t.primaryHex),n.accentMat.color.setHex(t.accentHex),n.trimMat.color.setHex(t.trimHex),n.glowMat.color.setHex(t.trimHex),this.armoryRingMat.color.setHex(t.trimHex)}setSkinTheme(e){this.skinTheme!==e&&(this.skinTheme=e,this.armoryMode===`WEAPONS`?this.armoryRingMat.color.setHex(Ou(this.armoryWeaponTier,this.skinTheme).colorHex):this.latestArmoryBossDef&&this.applyArmoryBossColors(this.latestArmoryBossDef),this.syncArmoryVisibility())}configureArmoryWeapon(e){this.armoryMode=`WEAPONS`,this.armoryWeaponTier=e,this.armoryYaw=-.36,this.armoryRingMat.color.setHex(Ou(e,this.skinTheme).colorHex),this.syncArmoryVisibility()}configureArmoryBoss(e){this.armoryMode=`BOSSES`,this.latestArmoryBossDef=e,this.armoryBossChassis=e.chassis,this.armoryYaw=-.44,this.applyArmoryBossColors(e),this.syncArmoryVisibility()}rotateArmoryTurntable(e){this.armoryYaw+=e,this.armoryDragSpinFreeze=1.6}syncArmoryVisibility(){for(let e of[`TACTICAL`,`UNICORN`]){for(let t of[1,2,3,4,5])this.armoryWeaponsByTheme[e][t].root.visible=this.armoryMode===`WEAPONS`&&e===this.skinTheme&&t===this.armoryWeaponTier;let t=this.armoryBossesByTheme[e];for(let n of Object.keys(t))t[n].root.visible=this.armoryMode===`BOSSES`&&e===this.skinTheme&&n===this.armoryBossChassis}}addShake(e){this.shakeTrauma=Math.min(1,this.shakeTrauma+e)}updateCamera(e,t,n,r){this.elapsedSkyTime+=e,this.skyUniforms.uTime.value=this.elapsedSkyTime,this.shakeTime+=e*38,this.shakeTrauma=Math.max(0,this.shakeTrauma-e*2.6);let i=this.shakeTrauma*this.shakeTrauma*.45,a=Math.sin(this.shakeTime*1.13)*i,o=Math.cos(this.shakeTime*1.71)*i*.75,s=this.portraitFactor,c=r===`ARMORY_INSPECT`;if(this.armoryRoot.visible=c,c){if(this.armoryDragSpinFreeze>0?this.armoryDragSpinFreeze=Math.max(0,this.armoryDragSpinFreeze-e):this.armoryYaw+=e*.52,this.armoryTurntable.rotation.y=this.armoryYaw,this.armoryOuterRing.rotation.z=-this.elapsedSkyTime*.5,this.armoryMode===`WEAPONS`){let t=this.armoryWeaponsByTheme[this.skinTheme][this.armoryWeaponTier];t.root.position.y=.18+Math.sin(this.elapsedSkyTime*2.2)*.05,t.spinCluster&&(t.spinCluster.rotation.x+=e*12)}else{let t=this.armoryBossesByTheme[this.skinTheme][this.armoryBossChassis],n=this.skinTheme===`UNICORN`;for(let r=0;r<t.spinClusters.length;r++)!n&&this.armoryBossChassis===`KRAKEN_WALKER`?t.spinClusters[r].rotation.y+=e*3.5:t.spinClusters[r].rotation.z+=e*9;if(t.wingPylons){let e=Math.sin(this.elapsedSkyTime*2.2)*(n?.11:.06);t.wingPylons[0].rotation.z=.42+e,t.wingPylons[1].rotation.z=-.42-e}}Lm.set(0,44.62,-6.25+s*1.65),Rm.set(0,43.86-s*.3,Fm)}else if(r===`LIVE_BRIDGE`){let r=t*.2;this.smoothCamX+=(r-this.smoothCamX)*Math.min(1,e*6.5);let i=12.4+s*5.4,a=11.4+s*4.8,o=8.4+s*2.8;Lm.set(this.smoothCamX,i,n+a),Rm.set(this.smoothCamX*.65,-.4-s*.4,n-o)}else{let i=r===`BOSS_TACTICAL`,a=t*.2;this.smoothCamX+=(a-this.smoothCamX)*Math.min(1,e*6.5);let o=i?15.2+s*6.8:14.5+s*6.5,c=i?12.8+s*5.8:12.2+s*5.6,l=i?8.9+s*4:8.5+s*3.7,u=i?.2:0;Lm.set(this.smoothCamX,o,n+c),Rm.set(this.smoothCamX*.65,u,n-l)}let l=c!==(this.lastFramingMode===`ARMORY_INSPECT`);if(this.lastFramingMode=r,l)this.currentCamPos.copy(Lm),this.currentLookAt.copy(Rm);else if(r===`RUN_TACTICAL`||r===`BOSS_TACTICAL`){let t=Math.min(1,e*10);this.currentCamPos.x+=(Lm.x-this.currentCamPos.x)*t,this.currentCamPos.y+=(Lm.y-this.currentCamPos.y)*t,this.currentCamPos.z=Lm.z,this.currentLookAt.x+=(Rm.x-this.currentLookAt.x)*t,this.currentLookAt.y+=(Rm.y-this.currentLookAt.y)*t,this.currentLookAt.z=Rm.z}else{let t=Math.min(1,e*8.5);this.currentCamPos.lerp(Lm,t),this.currentLookAt.lerp(Rm,t)}this.camera.position.set(this.currentCamPos.x+a,this.currentCamPos.y+o,this.currentCamPos.z),this.camera.lookAt(this.currentLookAt.x+a*.4,this.currentLookAt.y,this.currentLookAt.z),this.skyDome.position.copy(this.camera.position);let u=c?Fm:n,d=c?Pm:0;this.sunLight.position.set(-19,d+18,u-36),this.sunLight.target.position.set(0,d,u-12),this.rimLight.position.set(18,d+13,u+14),this.rimLight.target.position.set(0,d,u-10)}projectToScreen(e,t,n,r){Im.set(e,t,n),Im.project(this.camera),Im.z>1||Im.z<-1?r.visible=!1:(r.x=(Im.x*.5+.5)*window.innerWidth,r.y=(-Im.y*.5+.5)*window.innerHeight,r.visible=!0)}render(){this.renderer.render(this.scene,this.camera)}},Bm=[`#ff295c`,`#ff8a1e`,`#ffe82e`,`#22eb6a`,`#1ec8ff`,`#3f68ff`,`#d23cff`],Vm=18,Hm=560,Um=16,Wm=1.8,Gm=1.6,Km=class{rootEl;canvas;ctx;bannerEl;kickerEl;titleEl;callbacks;mode=`INACTIVE`;elapsed=0;nextLaunchTimer=0;launchCount=0;hornRecoil=0;muzzleFlash=0;revealCallback=null;viewW=412;viewH=915;dpr=1;rockets=[];sparks=[];rings=[];constructor(e){this.callbacks=e;let t=document.getElementById(`unicorn-celebration-overlay`),n=document.getElementById(`unicorn-celebration-canvas`),r=document.getElementById(`unicorn-splash-banner`),i=document.getElementById(`unicorn-splash-kicker`),a=document.getElementById(`unicorn-splash-title`);if(!t||!n||!r||!i||!a)throw Error(`Missing #unicorn-celebration-overlay DOM elements`);this.rootEl=t,this.canvas=n;let o=n.getContext(`2d`);if(!o)throw Error(`2D context unavailable for UnicornCelebrationOverlay`);this.ctx=o,this.bannerEl=r,this.kickerEl=i,this.titleEl=a;for(let e=0;e<Vm;e++)this.rockets.push({active:!1,x:0,y:0,prevX:0,prevY:0,vx:0,vy:0,age:0,fuseTime:.3,colorIndex:0,style:0});for(let e=0;e<Hm;e++)this.sparks.push({active:!1,x:0,y:0,prevX:0,prevY:0,vx:0,vy:0,age:0,maxAge:1,size:3,color:`#ffffff`,twinklePhase:0,isStar:!1});for(let e=0;e<Um;e++)this.rings.push({active:!1,x:0,y:0,age:0,maxAge:.45,maxRadius:90,color:`#ffe82e`});this.rootEl.addEventListener(`pointerdown`,e=>{this.mode===`VICTORY_SPLASH`&&this.elapsed>=.12&&(e.stopPropagation(),this.revealVictoryCardNow())}),this.handleResize(),window.addEventListener(`resize`,this.handleResize)}get isPreCardSplashActive(){return this.mode===`VICTORY_SPLASH`}get isActive(){return this.mode!==`INACTIVE`}handleResize=()=>{let e=this.rootEl.parentElement?.getBoundingClientRect();this.viewW=Math.max(1,Math.round(e?.width||window.innerWidth||412)),this.viewH=Math.max(1,Math.round(e?.height||window.innerHeight||915)),this.dpr=Math.min(window.devicePixelRatio||1,2),this.canvas.width=Math.round(this.viewW*this.dpr),this.canvas.height=Math.round(this.viewH*this.dpr)};clearPools(){for(let e=0;e<Vm;e++)this.rockets[e].active=!1;for(let e=0;e<Hm;e++)this.sparks[e].active=!1;for(let e=0;e<Um;e++)this.rings[e].active=!1}startVictoryFinale(e,t,n){this.handleResize(),this.clearPools(),this.mode=`VICTORY_SPLASH`,this.elapsed=0,this.nextLaunchTimer=.08,this.launchCount=0,this.hornRecoil=0,this.muzzleFlash=1,this.revealCallback=n,this.kickerEl.textContent=e,this.titleEl.textContent=t,this.bannerEl.classList.remove(`is-hidden`),this.rootEl.classList.remove(`is-hidden`,`is-behind-card`,`is-flyby`),this.rootEl.classList.add(`is-splash-interactive`)}playEndlessWaveFlyby(e){this.handleResize(),this.clearPools(),this.mode=`ENDLESS_FLYBY`,this.elapsed=0,this.nextLaunchTimer=.06,this.launchCount=0,this.hornRecoil=0,this.muzzleFlash=.9,this.revealCallback=null,this.kickerEl.textContent=`ENDLESS WAVE ${e} CLEARED!`,this.titleEl.textContent=`UNICORN FIREWORKS!`,this.bannerEl.classList.remove(`is-hidden`),this.rootEl.classList.remove(`is-hidden`,`is-splash-interactive`,`is-behind-card`),this.rootEl.classList.add(`is-flyby`)}revealVictoryCardNow(){if(this.mode!==`VICTORY_SPLASH`)return;this.mode=`VICTORY_CARD_BG`,this.bannerEl.classList.add(`is-hidden`),this.rootEl.classList.remove(`is-splash-interactive`),this.rootEl.classList.add(`is-behind-card`),this.nextLaunchTimer=.25;let e=this.revealCallback;this.revealCallback=null,e&&e()}stop(){this.mode!==`INACTIVE`&&(this.mode=`INACTIVE`,this.revealCallback=null,this.clearPools(),this.bannerEl.classList.add(`is-hidden`),this.rootEl.classList.add(`is-hidden`),this.rootEl.classList.remove(`is-splash-interactive`,`is-behind-card`,`is-flyby`),this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height))}computeHornGeometry(){let e=this.viewW,t=this.viewH,n=1;if(this.mode===`ENDLESS_FLYBY`){let e=Math.min(1,this.elapsed/.26),t=this.elapsed>1.26?Math.max(0,(Gm-this.elapsed)/.34):1;n=(1-(1-e)**3)*t}else{let e=Math.min(1,this.elapsed/.34);n=1-(1-e)**3+Math.sin(e*Math.PI)*.08}let r=this.mode===`VICTORY_CARD_BG`?Math.min(1,Math.max(0,(this.elapsed-Wm)/.35)):0,i=this.mode===`ENDLESS_FLYBY`?Math.min(250,t*.29):Math.min(355,t*(.39-r*.13)),a=this.hornRecoil*16,o=(1-n)*(i+70),s=Math.sin(this.elapsed*3.4)*.045,c=e*.5,l=t+18+o+a;return{baseX:c,baseY:l,tipX:c+Math.sin(s)*i,tipY:l-Math.cos(s)*i,hornLength:i,baseHalfWidth:Math.max(30,Math.min(54,i*.165)),tiltAngle:s}}spawnRocketVolley(e,t){let n=this.viewW,r=this.viewH,i=this.mode===`VICTORY_SPLASH`&&this.launchCount===0?3:this.mode===`VICTORY_SPLASH`&&this.launchCount===2?2:1;for(let a=0;a<i;a++){let o=this.rockets.find(e=>!e.active);if(!o)break;let s=this.launchCount+a,c,l;if(this.mode===`VICTORY_CARD_BG`)c=s%2==0?n*(.14+s*17%16*.01):n*(.86-s*13%16*.01),l=r*(.15+s*19%24*.01);else if(i===3)c=n*[.22,.5,.78][a],l=r*[.32,.21,.3][a];else{let e=[.5,.24,.76,.34,.66,.2,.8],t=[.23,.31,.28,.2,.22,.36,.34];c=n*e[s%e.length],l=r*t[s%t.length]}let u=this.mode===`VICTORY_CARD_BG`?.34:.25+a%2*.05,d=(c-e)/u,f=(l-t-120*u*u)/u;o.active=!0,o.x=e,o.y=t,o.prevX=e,o.prevY=t,o.vx=d,o.vy=f,o.age=0,o.fuseTime=u,o.colorIndex=s%Bm.length,o.style=s%3}this.hornRecoil=1,this.muzzleFlash=1,this.callbacks.onFireworkLaunchSound(this.launchCount),this.launchCount+=i;for(let n=0;n<10;n++){let r=this.sparks.find(e=>!e.active);if(!r)break;let i=-Math.PI*.5+(n/9-.5)*1.15,a=110+n%4*45;r.active=!0,r.x=e,r.y=t,r.prevX=e,r.prevY=t,r.vx=Math.cos(i)*a,r.vy=Math.sin(i)*a,r.age=0,r.maxAge=.28,r.size=3.2,r.color=n%2==0?`#fff59e`:Bm[n%Bm.length],r.twinklePhase=n*.9,r.isStar=n%3==0}}detonateRocket(e){let t=this.rings.find(e=>!e.active);t&&(t.active=!0,t.x=e.x,t.y=e.y,t.age=0,t.maxAge=.44,t.maxRadius=this.mode===`VICTORY_CARD_BG`?86:112,t.color=Bm[e.colorIndex]);let n=this.mode===`VICTORY_CARD_BG`?34:46,r=e.style===2?20:14;for(let t=0;t<n;t++){let r=this.sparks.find(e=>!e.active);if(!r)break;let i=t/n*Math.PI*2+t%2*.04,a=e.style===1?1+.26*Math.cos(i*5):1,o=(155+t%5*28)*a;r.active=!0,r.x=e.x,r.y=e.y,r.prevX=e.x,r.prevY=e.y,r.vx=Math.cos(i)*o,r.vy=Math.sin(i)*o,r.age=0,r.maxAge=.78+t%4*.12,r.size=t%4==0?4.4:3.1,r.color=e.style===0?Bm[t%Bm.length]:t%3==0?`#fff7ad`:Bm[(e.colorIndex+t%3)%Bm.length],r.twinklePhase=t*.7,r.isStar=t%5==0}for(let t=0;t<r;t++){let n=this.sparks.find(e=>!e.active);if(!n)break;let i=t/r*Math.PI*2+.2,a=72+t%3*22;n.active=!0,n.x=e.x,n.y=e.y,n.prevX=e.x,n.prevY=e.y,n.vx=Math.cos(i)*a,n.vy=Math.sin(i)*a,n.age=0,n.maxAge=.62+t%3*.1,n.size=3.4,n.color=t%2==0?`#ffffff`:`#ffe82e`,n.twinklePhase=t*1.1,n.isStar=t%2==0}}tick(e){if(this.mode===`INACTIVE`)return;let t=Math.min(.05,Math.max(.001,e));if(this.elapsed+=t,this.hornRecoil=Math.max(0,this.hornRecoil-t*5.2),this.muzzleFlash=Math.max(0,this.muzzleFlash-t*6.5),this.mode===`VICTORY_SPLASH`&&this.elapsed>=1.8)this.revealVictoryCardNow();else if(this.mode===`ENDLESS_FLYBY`&&this.elapsed>=Gm){this.stop();return}let n=this.computeHornGeometry();(this.mode===`VICTORY_SPLASH`?this.elapsed<1.62:this.mode!==`ENDLESS_FLYBY`||this.elapsed<1.05)&&(this.nextLaunchTimer-=t,this.nextLaunchTimer<=0&&(this.spawnRocketVolley(n.tipX,n.tipY),this.nextLaunchTimer=this.mode===`VICTORY_SPLASH`?.24:this.mode===`ENDLESS_FLYBY`?.22:.58));for(let e=0;e<Vm;e++){let n=this.rockets[e];if(n.active){if(n.prevX=n.x,n.prevY=n.y,n.vy+=240*t,n.x+=n.vx*t,n.y+=n.vy*t,n.age+=t,Math.floor(n.age*60)%2==0){let t=this.sparks.find(e=>!e.active);t&&(t.active=!0,t.x=n.x,t.y=n.y,t.prevX=n.x,t.prevY=n.y,t.vx=-n.vx*.08+(e%3-1)*18,t.vy=24,t.age=0,t.maxAge=.22,t.size=2.6,t.color=`#ffe97d`,t.twinklePhase=n.age*12,t.isStar=!1)}n.age>=n.fuseTime&&(n.active=!1,this.detonateRocket(n))}}for(let e=0;e<Um;e++){let n=this.rings[e];n.active&&(n.age+=t,n.age>=n.maxAge&&(n.active=!1))}let r=.26**t;for(let e=0;e<Hm;e++){let n=this.sparks[e];n.active&&(n.prevX=n.x,n.prevY=n.y,n.vx*=r,n.vy=n.vy*r+165*t,n.x+=n.vx*t,n.y+=n.vy*t,n.age+=t,n.age>=n.maxAge&&(n.active=!1))}this.render(n)}render(e){let t=this.ctx,n=this.viewW,r=this.viewH;if(t.save(),t.setTransform(this.dpr,0,0,this.dpr,0,0),t.clearRect(0,0,n,r),this.mode!==`ENDLESS_FLYBY`){let e=this.mode===`VICTORY_SPLASH`?.56:.34,i=t.createRadialGradient(n*.5,r*.34,24,n*.5,r*.5,Math.max(n,r)*.85);i.addColorStop(0,`rgba(72, 26, 128, ${(e*.85).toFixed(3)})`),i.addColorStop(.55,`rgba(18, 16, 48, ${e.toFixed(3)})`),i.addColorStop(1,`rgba(7, 10, 24, ${(e*1.18).toFixed(3)})`),t.fillStyle=i,t.fillRect(0,0,n,r)}t.save(),t.globalCompositeOperation=`lighter`;for(let e=0;e<Um;e++){let n=this.rings[e];if(!n.active)continue;let r=n.age/n.maxAge,i=1-(1-r)**3,a=10+n.maxRadius*i,o=(1-r)*.72,s=t.createRadialGradient(n.x,n.y,0,n.x,n.y,a);s.addColorStop(0,`rgba(255, 255, 255, ${(o*.85).toFixed(3)})`),s.addColorStop(.45,`${n.color}66`),s.addColorStop(1,`rgba(0, 0, 0, 0)`),t.fillStyle=s,t.beginPath(),t.arc(n.x,n.y,a,0,Math.PI*2),t.fill(),t.strokeStyle=n.color,t.globalAlpha=o,t.lineWidth=3*(1-r*.6),t.beginPath(),t.arc(n.x,n.y,a*.84,0,Math.PI*2),t.stroke(),t.globalAlpha=1}for(let e=0;e<Vm;e++){let n=this.rockets[e];n.active&&(t.strokeStyle=Bm[n.colorIndex],t.lineWidth=5.2,t.lineCap=`round`,t.beginPath(),t.moveTo(n.prevX-n.vx*.035,n.prevY-n.vy*.035),t.lineTo(n.x,n.y),t.stroke(),t.fillStyle=`#ffffff`,t.beginPath(),t.arc(n.x,n.y,4.5,0,Math.PI*2),t.fill())}t.lineCap=`round`;for(let e=0;e<Hm;e++){let n=this.sparks[e];if(!n.active)continue;let r=1-n.age/n.maxAge,i=.72+.28*Math.sin(this.elapsed*26+n.twinklePhase);if(t.globalAlpha=Math.max(0,Math.min(1,r*1.25))*i,t.strokeStyle=n.color,t.lineWidth=n.size*(.55+r*.55),t.beginPath(),t.moveTo(n.prevX-n.vx*.026,n.prevY-n.vy*.026),t.lineTo(n.x,n.y),t.stroke(),n.isStar&&r>.22){let e=n.size*2.1*r;t.fillStyle=`#ffffff`,t.beginPath(),t.moveTo(n.x,n.y-e),t.lineTo(n.x+e*.28,n.y-e*.28),t.lineTo(n.x+e,n.y),t.lineTo(n.x+e*.28,n.y+e*.28),t.lineTo(n.x,n.y+e),t.lineTo(n.x-e*.28,n.y+e*.28),t.lineTo(n.x-e,n.y),t.lineTo(n.x-e*.28,n.y-e*.28),t.closePath(),t.fill()}else t.fillStyle=n.color,t.beginPath(),t.arc(n.x,n.y,n.size*.65,0,Math.PI*2),t.fill()}t.globalAlpha=1,t.restore(),this.drawGiantUnicornHorn(t,e.baseX,e.baseY,e.hornLength,e.baseHalfWidth,e.tiltAngle),t.restore()}drawGiantUnicornHorn(e,t,n,r,i,a){e.save(),e.translate(t,n),e.rotate(a);let o=e.createRadialGradient(0,-r*.46,12,0,-r*.46,r*.68);o.addColorStop(0,`rgba(255, 232, 110, 0.44)`),o.addColorStop(.45,`rgba(255, 92, 200, 0.26)`),o.addColorStop(1,`rgba(40, 180, 255, 0)`),e.fillStyle=o,e.beginPath(),e.arc(0,-r*.46,r*.68,0,Math.PI*2),e.fill();let s=Math.sin(this.elapsed*5.2)*.09+this.hornRecoil*.12;for(let t of[-1,1]){e.save(),e.translate(t*i*.72,-36),e.scale(t,1),e.rotate(-.22-s);for(let t=3;t>=0;t--){let n=i*(2.35-t*.34),r=26-t*3,a=-t*13;e.fillStyle=t===0?`#ffe45e`:t%2==1?`#fff7ff`:`#ffb8ec`,e.strokeStyle=`#120824`,e.lineWidth=3.2,e.beginPath(),e.moveTo(0,a),e.quadraticCurveTo(n*.62,a-r*1.15,n,a-r*.35),e.quadraticCurveTo(n*.58,a+r*.65,0,a+12),e.closePath(),e.fill(),e.stroke()}e.restore()}for(let t=0;t<8;t++){let n=t/8,a=(t+1)/8,o=-n*r,s=-a*r,c=i*(1-n)**.84+3*(1-n),l=t===7?2.2:i*(1-a)**.84+3*(1-a),u=(t===7?.3:1)*(5.5*(1-n*.65)),d=e.createLinearGradient(-c,(o+s)*.5,c,(o+s)*.5);d.addColorStop(0,`#d8c4ff`),d.addColorStop(.28,`#ffffff`),d.addColorStop(.62,`#fff5d6`),d.addColorStop(1,`#f39ce0`),e.fillStyle=d,e.strokeStyle=`#120824`,e.lineWidth=3.4,e.lineJoin=`round`,e.beginPath(),e.moveTo(-c,o),e.quadraticCurveTo(-c-u,(o+s)*.5,-l,s),e.lineTo(l,s),e.quadraticCurveTo(c+u,(o+s)*.5,c,o),e.closePath(),e.fill(),e.stroke(),t<7&&(e.strokeStyle=Bm[t%Bm.length],e.lineWidth=Math.max(2.6,5.2*(1-n*.55)),e.lineCap=`round`,e.beginPath(),e.moveTo(-c*.88,o-(o-s)*.15),e.quadraticCurveTo(0,(o+s)*.5-5,l*.92,s),e.stroke(),e.strokeStyle=`rgba(255, 255, 255, 0.86)`,e.lineWidth=2,e.beginPath(),e.moveTo(-c*.42,o-3),e.lineTo(-l*.36,s+3),e.stroke())}let c=i*1.28,l=e.createLinearGradient(-c,-20,c,-20);l.addColorStop(0,`#e09112`),l.addColorStop(.35,`#ffe96b`),l.addColorStop(.7,`#ffc928`),l.addColorStop(1,`#c9780b`),e.fillStyle=l,e.strokeStyle=`#120824`,e.lineWidth=3.6,e.beginPath(),e.moveTo(-c,8),e.lineTo(-c*1.06,-28),e.lineTo(-c*.55,-18),e.lineTo(0,-38),e.lineTo(c*.55,-18),e.lineTo(c*1.06,-28),e.lineTo(c,8),e.closePath(),e.fill(),e.stroke();let u=[-.72,-.36,0,.36,.72];for(let t=0;t<u.length;t++){let n=u[t]*c,r=t===2?-14:-10;e.fillStyle=Bm[t*2%Bm.length],e.strokeStyle=`#120824`,e.lineWidth=2.2,e.beginPath(),e.arc(n,r,t===2?7.5:5.5,0,Math.PI*2),e.fill(),e.stroke()}let d=9+this.muzzleFlash*15,f=e.createRadialGradient(0,-r,0,0,-r,d*2.6);f.addColorStop(0,`#ffffff`),f.addColorStop(.35,`rgba(255, 240, 128, 0.92)`),f.addColorStop(.7,`rgba(255, 90, 210, 0.48)`),f.addColorStop(1,`rgba(255, 90, 210, 0)`),e.fillStyle=f,e.beginPath(),e.arc(0,-r,d*2.6,0,Math.PI*2),e.fill();let p=14+this.muzzleFlash*18;e.fillStyle=`#ffffff`,e.beginPath(),e.moveTo(0,-r-p),e.lineTo(p*.24,-r-p*.24),e.lineTo(p,-r),e.lineTo(p*.24,-r+p*.24),e.lineTo(0,-r+p),e.lineTo(-p*.24,-r+p*.24),e.lineTo(-p,-r),e.lineTo(-p*.24,-r-p*.24),e.closePath(),e.fill(),e.restore()}},qm=28,Jm={WARDEN_MECH:`BIPEDAL VULCAN MECH`,SIEGE_TANK:`TRACKED SIEGE JUGGERNAUT`,KRAKEN_WALKER:`QUAD-LEG ARACHNID WALKER`,SOVEREIGN_TITAN:`CROWNED SOVEREIGN TITAN`},Ym={SINGLE:`PARALLEL STREAM AUTO`,BURST_2:`2-ROUND PARALLEL BURST`,TWIN_CONVERGE:`6-BARREL PARALLEL STREAM`,PIERCING:`PLASMA PARALLEL PIERCE (×2)`},Xm={SINGLE:`PARALLEL RAINBOW STREAM`,BURST_2:`TWIN WING RAINBOW BURST`,TWIN_CONVERGE:`6-HORN RAINBOW STREAM`,PIERCING:`ROYAL ALICORN PIERCE (×2)`},Zm={x:0,y:0,visible:!1};function $(e){let t=document.getElementById(e);if(!t)throw Error(`Missing required HUD element #${e}`);return t}var Qm=class{callbacks;gameViewportEl=$(`game-viewport`);hubLeftToolsEl=$(`hub-left-tools`);hubStageBannerEl=$(`hub-stage-banner`);hubSectorKickerEl=$(`hub-sector-kicker`);hubSectorTitleEl=$(`hub-sector-title`);hubBossPreviewEl=$(`hub-boss-preview`);btnHubSkinToggle=$(`btn-hub-skin-toggle`);hubSkinToggleLabelEl=$(`hub-skin-toggle-label`);hubSkinTogglePillEl=$(`hub-skin-toggle-pill`);runProgressCard=$(`run-progress-card`);topWeaponPill=$(`top-weapon-pill`);progressFillEl=$(`track-progress-fill`);progressPctEl=$(`progress-pct-text`);coinCountEl=$(`coin-count`);coinPillEl;liveCoinTickerEl=$(`live-coin-ticker`);btnSettings=$(`btn-settings`);btnPause=$(`btn-pause`);squadPillEl=$(`squad-pill`);squadWeaponEl=$(`squad-weapon-badge`);heavyHpBars=[];heavyHpFills=[];bossHudEl=$(`boss-hud`);bossNameEl=$(`boss-name-text`);bossHpEl=$(`boss-hp-text`);bossFillEl=$(`boss-hp-fill`);bossSegmentsEl=$(`boss-hp-segments`);stagingOverlayEl=$(`pre-run-overlay`);tabPanels;btnStartMarch=$(`start-march-btn`);btnAddSoldier=$(`btn-add-soldier`);recruitBtnTitleEl=$(`recruit-btn-title`);btnArmoryWeapons=$(`btn-armory-weapons`);btnArmoryBosses=$(`btn-armory-bosses`);armorySelectorStrip=$(`armory-selector-strip`);armoryItemKicker=$(`armory-item-kicker`);armoryItemName=$(`armory-item-name`);btnArmoryPreviewEquip=$(`btn-armory-preview-equip`);armoryStatBars=$(`armory-stat-bars`);armoryItemNote=$(`armory-item-note`);mapProgressBadge=$(`map-progress-badge`);sectorMapList=$(`sector-map-list`);settingsDrawerEl=$(`settings-drawer`);badgeSkinEl=$(`badge-skin`);badgeMuteEl=$(`badge-mute`);badgeHapticsEl=$(`badge-haptics`);recordSquadEl=$(`record-squad`);recordSplitEl=$(`record-split`);recordEndlessEl=$(`record-endless`);pauseModalEl=$(`pause-modal`);pauseSquadEl=$(`pause-squad`);pauseWeaponEl=$(`pause-weapon`);pauseProgressEl=$(`pause-progress`);pauseKillsEl=$(`pause-kills`);badgePauseSkinEl=$(`badge-pause-skin`);badgePauseMuteEl=$(`badge-pause-mute`);badgePauseHapticsEl=$(`badge-pause-haptics`);summaryModalEl=$(`run-summary-modal`);summaryKickerEl=$(`summary-kicker`);summaryTitleEl=$(`summary-title`);sumDistanceEl=$(`sum-distance`);sumDrumsEl=$(`sum-drums`);sumEnemiesEl=$(`sum-enemies`);sumLiveCoinsEl=$(`sum-live-coins`);sumBonusCoinsEl=$(`sum-bonus-coins`);sumMultEl=$(`sum-mult`);sumTotalCoinsEl=$(`sum-total-coins`);btnSummaryContinue=$(`btn-summary-continue`);activeTab=`BATTLE`;armorySubTab=`WEAPONS`;selectedArmoryWeapon=1;selectedArmoryBossStage=1;hubPreviewWeaponTier=1;latestSaveSnapshot=null;currentSkinTheme=`UNICORN`;unicornCelebration;lastWeaponTier=-1;lastBossSegments=-1;coinRollupRaf=0;liveTickerAccum=0;displayedWalletCoins=0;lastCoinPopTs=0;constructor(e){this.callbacks=e,this.coinPillEl=this.coinCountEl.closest(`.coin-pill`)??this.coinCountEl,this.unicornCelebration=new Km({onFireworkLaunchSound:e=>{this.callbacks.onFireworkLaunchSound?.(e)}}),this.tabPanels={BATTLE:$(`tab-panel-battle`),ARMORY:$(`tab-panel-armory`),MAP:$(`tab-panel-map`)};for(let e of[`fireRate`,`bulletPower`,`warChest`]){let t=document.querySelector(`[data-pips="${e}"]`);if(t){t.innerHTML=``;for(let e=0;e<5;e++){let e=document.createElement(`span`);e.className=`mini-pips__seg`,t.appendChild(e)}}}let t=$(`world-overlay-layer`);for(let e=0;e<qm;e++){let e=document.createElement(`div`);e.className=`heavy-hp-bar is-hidden`;let n=document.createElement(`div`);n.className=`heavy-hp-bar__fill`,e.appendChild(n),t.appendChild(e),this.heavyHpBars.push(e),this.heavyHpFills.push(n)}this.bindEvents(),this.renderArmoryPanel()}get currentTab(){return this.activeTab}get isSettingsOpen(){return!this.settingsDrawerEl.classList.contains(`is-hidden`)}closeSettingsDrawer(){this.settingsDrawerEl.classList.add(`is-hidden`)}bindEvents(){this.btnStartMarch.addEventListener(`click`,()=>this.callbacks.onStartMarch()),document.querySelectorAll(`[data-upgrade]`).forEach(e=>{let t=e.dataset.upgrade;e.addEventListener(`click`,e=>{e.stopPropagation(),this.callbacks.onBuyUpgrade(t)})}),document.querySelectorAll(`[data-hub-tab]`).forEach(e=>{let t=e.dataset.hubTab;e.addEventListener(`click`,e=>{e.stopPropagation();let n=t!==`BATTLE`&&this.activeTab===t?`BATTLE`:t;this.switchHubTab(n)})}),document.querySelectorAll(`[data-select-mode]`).forEach(e=>{let t=e.dataset.selectMode;e.addEventListener(`click`,e=>{e.stopPropagation(),this.callbacks.onSelectMode(t)})}),this.btnHubSkinToggle.addEventListener(`click`,e=>{e.stopPropagation(),this.callbacks.onToggleSkin()}),$(`btn-toggle-skin`).addEventListener(`click`,e=>{e.stopPropagation(),this.callbacks.onToggleSkin()}),$(`btn-pause-skin`).addEventListener(`click`,e=>{e.stopPropagation(),this.callbacks.onToggleSkin()}),this.btnArmoryWeapons.addEventListener(`click`,()=>{this.armorySubTab=`WEAPONS`,this.renderArmoryPanel(),this.emitHubState()}),this.btnArmoryBosses.addEventListener(`click`,()=>{this.armorySubTab=`BOSSES`,this.renderArmoryPanel(),this.emitHubState()}),this.btnArmoryPreviewEquip.addEventListener(`click`,()=>{this.armorySubTab===`WEAPONS`&&(this.hubPreviewWeaponTier=this.selectedArmoryWeapon,this.renderArmoryPanel(),this.emitHubState())}),this.btnSettings.addEventListener(`click`,e=>{e.stopPropagation(),this.settingsDrawerEl.classList.toggle(`is-hidden`)}),$(`btn-close-settings`).addEventListener(`click`,()=>{this.settingsDrawerEl.classList.add(`is-hidden`)}),this.btnPause.addEventListener(`click`,()=>{this.callbacks.onPauseRequest()}),$(`btn-pause-resume`).addEventListener(`click`,()=>{this.callbacks.onResumeRequest()}),$(`btn-pause-restart`).addEventListener(`click`,()=>{this.callbacks.onRestartRequest()}),$(`btn-pause-retreat`).addEventListener(`click`,()=>{this.callbacks.onRetreatToHubRequest()}),$(`btn-toggle-mute`).addEventListener(`click`,()=>{this.callbacks.onToggleMute()}),$(`btn-pause-mute`).addEventListener(`click`,()=>{this.callbacks.onToggleMute()}),$(`btn-toggle-haptics`).addEventListener(`click`,()=>{this.callbacks.onToggleHaptics()}),$(`btn-pause-haptics`).addEventListener(`click`,()=>{this.callbacks.onToggleHaptics()}),$(`btn-export-save`).addEventListener(`click`,()=>{this.callbacks.onExportSave()}),$(`btn-reset-save`).addEventListener(`click`,()=>{this.callbacks.onResetSave(),this.settingsDrawerEl.classList.add(`is-hidden`)}),this.btnSummaryContinue.addEventListener(`click`,()=>{this.callbacks.onSummaryContinue()})}switchHubTab(e){let t=e===`UPGRADES`?`BATTLE`:e;this.activeTab=t,this.settingsDrawerEl.classList.add(`is-hidden`),this.tabPanels.BATTLE.classList.toggle(`is-hidden`,t!==`BATTLE`),this.tabPanels.ARMORY.classList.toggle(`is-hidden`,t!==`ARMORY`),this.tabPanels.MAP.classList.toggle(`is-hidden`,t!==`MAP`),this.hubStageBannerEl.classList.toggle(`is-hidden`,t!==`BATTLE`),this.hubLeftToolsEl.classList.toggle(`is-hidden`,t!==`BATTLE`),t===`ARMORY`?this.renderArmoryPanel():t===`MAP`&&this.latestSaveSnapshot&&this.renderSectorMap(this.latestSaveSnapshot),this.emitHubState()}emitHubState(){this.callbacks.onHubStateChange({tab:this.activeTab,armorySubTab:this.armorySubTab,armoryWeaponTier:this.selectedArmoryWeapon,armoryBossStage:this.selectedArmoryBossStage,hubPreviewWeaponTier:this.hubPreviewWeaponTier})}syncTopHudForState(e){let t=e===`PRE_RUN`,n=e===`RUNNING`||e===`BOSS_FIGHT`||e===`PAUSED`;this.hubLeftToolsEl.classList.toggle(`is-hidden`,!t||this.activeTab!==`BATTLE`),this.hubStageBannerEl.classList.toggle(`is-hidden`,!t||this.activeTab!==`BATTLE`),this.runProgressCard.classList.toggle(`is-hidden`,t),this.topWeaponPill.classList.toggle(`is-hidden`,t),this.btnPause.classList.toggle(`is-hidden`,!n),t?this.resetLiveCoinTicker():this.settingsDrawerEl.classList.add(`is-hidden`)}setStagingVisible(e){this.stagingOverlayEl.classList.toggle(`is-hidden`,!e),e?this.switchHubTab(`BATTLE`):this.settingsDrawerEl.classList.add(`is-hidden`)}showPauseModal(e,t,n,r){this.pauseSquadEl.textContent=`${e}`,this.pauseWeaponEl.textContent=Ou(t,this.currentSkinTheme).shortBadge,this.pauseProgressEl.textContent=`${Math.round(n*100)}%`,this.pauseKillsEl.textContent=`${r}`,this.pauseModalEl.classList.remove(`is-hidden`)}hidePauseModal(){this.pauseModalEl.classList.add(`is-hidden`)}cachedCoinNdcX=.82;cachedCoinNdcY=.89;cachedNdcViewportW=0;cachedNdcViewportH=0;getCoinPillNdc(e){let t=window.innerWidth,n=window.innerHeight;if(t>0&&n>0&&(t!==this.cachedNdcViewportW||n!==this.cachedNdcViewportH)){let e=this.coinPillEl.getBoundingClientRect();e.width>0&&e.height>0&&(this.cachedCoinNdcX=(e.left+e.width*.5)/t*2-1,this.cachedCoinNdcY=1-(e.top+e.height*.5)/n*2,this.cachedNdcViewportW=t,this.cachedNdcViewportH=n)}e.x=this.cachedCoinNdcX,e.y=this.cachedCoinNdcY}recordMagnetizedCoinArrival(e,t,n){if(e<=0)return;this.displayedWalletCoins=Math.min(t,this.displayedWalletCoins+e),this.liveTickerAccum=Math.min(n,this.liveTickerAccum+e),this.coinCountEl.textContent=wf(this.displayedWalletCoins),this.liveCoinTickerEl.textContent=`+${wf(this.liveTickerAccum)}`,this.liveCoinTickerEl.classList.remove(`is-hidden`);let r=performance.now();r-this.lastCoinPopTs>=85&&(this.lastCoinPopTs=r,this.coinPillEl.classList.remove(`is-coin-pop`),this.liveCoinTickerEl.classList.remove(`is-coin-pop`),this.coinPillEl.offsetWidth,this.coinPillEl.classList.add(`is-coin-pop`),this.liveCoinTickerEl.classList.add(`is-coin-pop`))}flushDisplayedCoins(e,t){this.displayedWalletCoins=e,this.coinCountEl.textContent=wf(e),this.liveTickerAccum=t,t>0?(this.liveCoinTickerEl.textContent=`+${wf(t)}`,this.liveCoinTickerEl.classList.remove(`is-hidden`)):this.liveCoinTickerEl.classList.add(`is-hidden`)}flashLiveCoinGain(e,t){this.displayedWalletCoins=t,this.coinCountEl.textContent=wf(t),e<=0||(this.liveTickerAccum+=e,this.liveCoinTickerEl.textContent=`+${wf(this.liveTickerAccum)}`,this.liveCoinTickerEl.classList.remove(`is-hidden`))}flashUpgradePurchase(e){let t=e===`startingSquad`?this.btnAddSoldier:document.querySelector(`.tactical-upg-card[data-upgrade="${e}"]`);t&&(t.classList.remove(`is-just-bought`),t.offsetWidth,t.classList.add(`is-just-bought`))}resetLiveCoinTicker(){this.liveTickerAccum=0,this.liveCoinTickerEl.classList.add(`is-hidden`)}syncSaveState(e,t,n,r,i=`STANDARD_BRIDGE`){this.latestSaveSnapshot=e,this.displayedWalletCoins=e.coins,this.coinCountEl.textContent=wf(e.coins);let a=e.settings.skinTheme===`UNICORN`?`UNICORN`:`TACTICAL`,o=a===`UNICORN`,s=a!==this.currentSkinTheme;this.currentSkinTheme=a,this.gameViewportEl.dataset.skin=a,this.btnHubSkinToggle.classList.toggle(`is-unicorn`,o),this.btnHubSkinToggle.setAttribute(`aria-pressed`,String(o)),this.hubSkinToggleLabelEl.textContent=o?`SKIN: GIRLS VS BOYS`:`SKIN: TACTICAL`,this.hubSkinTogglePillEl.textContent=o?`RAINBOWS ★ ON`:`TAP: GIRLS VS BOYS`;let c=o?`ON`:`OFF`;this.badgeSkinEl.textContent=c,this.badgeSkinEl.classList.toggle(`is-on`,o),this.badgePauseSkinEl.textContent=c,this.badgePauseSkinEl.classList.toggle(`is-on`,o),this.recruitBtnTitleEl.textContent=o?`PINK GIRL`:`VANGUARD`,this.btnArmoryWeapons.textContent=o?`Horns & Wands (5)`:`Weapons (5)`,this.btnArmoryBosses.textContent=o?`Unicorns (10)`:`Bosses (10)`,s&&(this.lastWeaponTier=-1,this.activeTab===`ARMORY`&&this.renderArmoryPanel()),document.querySelectorAll(`[data-select-mode]`).forEach(t=>{t.classList.toggle(`is-active`,t.dataset.selectMode===e.selectedMode)}),e.selectedMode===`SPLIT_CAUSEWAY`?this.hubSectorKickerEl.textContent=`SPLIT CAUSEWAY • STAGE ${e.splitCausewayStage}`:e.selectedMode===`ENDLESS`?this.hubSectorKickerEl.textContent=i===`SPLIT_CAUSEWAY`?`ENDLESS WAVE ${r} • SPLIT CAUSEWAY`:`ENDLESS WAVE ${r}`:this.hubSectorKickerEl.textContent=i===`SPLIT_CAUSEWAY`?`SECTOR ${e.selectedStage} • SPLIT CAUSEWAY`:`SECTOR ${e.selectedStage}`,this.hubSectorTitleEl.textContent=t.toUpperCase(),this.hubBossPreviewEl.textContent=`BOSS: ${n.toUpperCase()}`;let l=this.btnStartMarch.querySelector(`.drag-launch-pill__text`);l&&(l.textContent=i===`SPLIT_CAUSEWAY`?`SLIDE TO DEFEND CAUSEWAY`:`SLIDE VIADUCT TO DEPLOY`);let u=e.settings.muted?`OFF`:`ON`,d=e.settings.haptics?`ON`:`OFF`;this.badgeMuteEl.textContent=u,this.badgePauseMuteEl.textContent=u,this.badgeHapticsEl.textContent=d,this.badgePauseHapticsEl.textContent=d,this.recordSquadEl.textContent=`${e.highScoreSquad}`,this.recordSplitEl.textContent=`S${e.bestSplitStage}`,this.recordEndlessEl.textContent=`${Math.round(e.bestEndlessDistance)}m`;for(let t of hf){let n=e.upgrades[t],r=gf(t,n),i=xf(t,n);if(t===`startingSquad`){let t=n>=8,i=!t&&e.coins>=r;this.btnAddSoldier.classList.toggle(`is-affordable`,i),this.btnAddSoldier.disabled=t;let a=yf(n),o=document.querySelector(`[data-lvl="startingSquad"]`);o&&(o.textContent=`${a}/9`);let s=document.querySelector(`[data-cost="startingSquad"]`);s&&(s.textContent=t?`MAX`:wf(r));continue}let a=e.coins>=r,o=document.querySelector(`.tactical-upg-card[data-upgrade="${t}"]`);o&&o.classList.toggle(`is-affordable`,a);let s=document.querySelector(`[data-lvl="${t}"]`);s&&(s.textContent=`${n+1}`);let c=document.querySelector(`[data-cost="${t}"]`);c&&(c.textContent=wf(r));let l=document.querySelector(`[data-stat="${t}"]`);l&&(l.textContent=`${i.currentLabel} → ${i.nextLabel}`);let u=document.querySelector(`[data-pips="${t}"]`);if(u){let e=n>0&&n%5==0?5:n%5,t=n>=5,r=u.children;for(let n=0;n<r.length;n++)r[n].classList.toggle(`is-filled`,n<e),r[n].classList.toggle(`is-prestige`,t&&n<e)}}this.mapProgressBadge.textContent=`${e.unlockedStage} / 10`,this.activeTab===`MAP`&&this.renderSectorMap(e)}renderArmoryPanel(){let e=this.armorySubTab===`WEAPONS`,t=this.currentSkinTheme===`UNICORN`;if(this.btnArmoryWeapons.classList.toggle(`is-active`,e),this.btnArmoryBosses.classList.toggle(`is-active`,!e),this.btnArmoryPreviewEquip.classList.toggle(`is-hidden`,!e),this.armorySelectorStrip.innerHTML=``,e){for(let e of[1,2,3,4,5]){let t=document.createElement(`button`);t.type=`button`,t.className=`armory-chip${e===this.selectedArmoryWeapon?` is-active`:``}`,t.textContent=Ou(e,this.currentSkinTheme).shortBadge,t.addEventListener(`click`,()=>{this.selectedArmoryWeapon=e,this.renderArmoryPanel(),this.emitHubState()}),this.armorySelectorStrip.appendChild(t)}let e=Ou(this.selectedArmoryWeapon,this.currentSkinTheme),n=t?Xm:Ym;this.armoryItemKicker.textContent=`TIER ${e.tier} // ${n[e.pattern]}`,this.armoryItemName.textContent=e.name.toUpperCase();let r=this.hubPreviewWeaponTier===e.tier;this.btnArmoryPreviewEquip.classList.toggle(`is-equipped`,r),this.btnArmoryPreviewEquip.textContent=r?`HELD ON BRIDGE ✓`:`HOLD ON BRIDGE`;let i=e.pattern===`BURST_2`||e.pattern===`TWIN_CONVERGE`?2:1,a=e.fireRate*i,o=Math.min(100,Math.round(a/13.2*100)),s=Math.min(100,Math.round(e.damageMultiplier/2.55*100)),c=Math.min(100,Math.round(e.projectileSpeed/44*100)),l=Math.min(100,Math.round(e.bossArmorFactor/1.25*100));this.armoryStatBars.innerHTML=`
        <div class="stat-meter">
          <div class="stat-meter__top"><span>FIRE RATE</span><strong>${a.toFixed(1)}/s</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${o}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>DAMAGE MULT</span><strong>×${e.damageMultiplier.toFixed(2)}</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${s}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>MUZZLE VEL</span><strong>${e.projectileSpeed}m/s</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${c}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>BOSS ARMOR</span><strong>${Math.round(e.bossArmorFactor*100)}%</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${l}%"></div></div>
        </div>
      `;let u=t?`Pink Girl`:`Commando`;this.armoryItemNote.textContent=e.tier===1?t?`Sparkle Star Wand equipped at launch. Breach Pods & Barricades to unlock Spiral Unicorn Horns & Alicorn Wands live!`:`Standard sidearm equipped at launch. Breach Hex Ordnance Pods & Blast Barricades on the viaduct to upgrade live!`:`Weapon Lock Rule: Breaking lower/equal drops keeps this ${t?`magic wand/horn`:`gun`} and awards +25 Coins & +1 ${u} (overflow >40 converts to +10 Coins).`}else{for(let e of fu){let t=document.createElement(`button`);t.type=`button`,t.className=`armory-chip${e.stageNumber===this.selectedArmoryBossStage?` is-active`:``}`,t.textContent=`S${String(e.stageNumber).padStart(2,`0`)}`,t.addEventListener(`click`,()=>{this.selectedArmoryBossStage=e.stageNumber,this.renderArmoryPanel(),this.emitHubState()}),this.armorySelectorStrip.appendChild(t)}let e=fu[this.selectedArmoryBossStage-1],n=e.boss,r=bu(n,this.currentSkinTheme);this.armoryItemKicker.textContent=`SECTOR ${e.stageNumber} // ${t?r.archetypeLabel:Jm[n.chassis]}`,this.armoryItemName.textContent=r.name.toUpperCase();let i=Math.min(100,Math.max(10,Math.round(n.maxHp/138e3*100))),a=Math.round(n.segments/10*100),o=Math.min(100,Math.round(n.advanceSpeed/1.72*100)),s=Math.min(100,Math.round(n.rewardCoins/2800*100)),c=e.boardLayout===`SPLIT_CAUSEWAY`?`Split Causeway Siege`:`${e.trackLength}m Viaduct`;this.armoryStatBars.innerHTML=`
        <div class="stat-meter">
          <div class="stat-meter__top"><span>ARMOR HP</span><strong>${Tf(n.maxHp)}</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${i}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>LANE SALVO</span><strong>${n.salvoLanes}x (-${n.salvoDamage})</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${a}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>MARCH SPEED</span><strong>${n.advanceSpeed.toFixed(2)}m/s</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${o}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>CLEAR BOUNTY</span><strong>+${wf(n.rewardCoins)}</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${s}%"></div></div>
        </div>
      `,this.armoryItemNote.textContent=t?`Guarding ${e.title} (${c}). Charges its giant spiral horn to launch ${n.salvoLanes}-lane star-magic salvos every ${n.salvoInterval.toFixed(2)}s — steer into the open lane!`:`Guarding ${e.title} (${c}). Fires ${n.salvoLanes}-lane telegraphed plasma salvos every ${n.salvoInterval.toFixed(2)}s — steer into the open lane!`}}renderSectorMap(e){this.sectorMapList.innerHTML=``;let t=document.createElement(`button`);t.type=`button`;let n=e.selectedMode===`SPLIT_CAUSEWAY`;t.className=`sector-node${n?` is-selected`:``}`,t.innerHTML=`
      <div class="sector-node__num">⇄</div>
      <div class="sector-node__info">
        <span class="sector-node__title">SPLIT CAUSEWAY SIEGE</span>
        <span class="sector-node__sub">Left Ordnance Pod Queue vs Right Battalions • Stage ${e.splitCausewayStage} (Best: S${e.bestSplitStage})</span>
      </div>
      <span class="sector-node__status">${n?`ACTIVE`:`DEPLOY`}</span>
    `,t.addEventListener(`click`,()=>{this.callbacks.onSelectMode(`SPLIT_CAUSEWAY`),this.switchHubTab(`BATTLE`)}),this.sectorMapList.appendChild(t);let r=document.createElement(`button`);r.type=`button`;let i=e.selectedMode===`ENDLESS`;r.className=`sector-node${i?` is-selected`:``}`,r.innerHTML=`
      <div class="sector-node__num">∞</div>
      <div class="sector-node__info">
        <span class="sector-node__title">ENDLESS BRIDGE GAUNTLET</span>
        <span class="sector-node__sub">4x Marathon Bridges &amp; Split Sieges • Best: ${Math.round(e.bestEndlessDistance)}m</span>
      </div>
      <span class="sector-node__status">${i?`ACTIVE`:`DEPLOY`}</span>
    `,r.addEventListener(`click`,()=>{this.callbacks.onSelectMode(`ENDLESS`),this.switchHubTab(`BATTLE`)}),this.sectorMapList.appendChild(r);for(let t of fu){let n=t.stageNumber<=e.unlockedStage,r=t.stageNumber<e.unlockedStage,i=e.selectedMode===`CAMPAIGN`&&e.selectedStage===t.stageNumber,a=t.boardLayout===`SPLIT_CAUSEWAY`?`[SPLIT CAUSEWAY]`:`[${t.trackLength}m]`,o=bu(t.boss,this.currentSkinTheme).name,s=document.createElement(`button`);s.type=`button`,s.disabled=!n,s.className=[`sector-node`,i?`is-selected`:``,r&&!i?`is-cleared`:``,n?``:`is-locked`].filter(Boolean).join(` `);let c=n?i?`ACTIVE`:r?`CLEARED ✓`:`READY`:`LOCKED`;s.innerHTML=`
        <div class="sector-node__num">${String(t.stageNumber).padStart(2,`0`)}</div>
        <div class="sector-node__info">
          <span class="sector-node__title">${t.title.toUpperCase()}</span>
          <span class="sector-node__sub">${a} ${o} • +${wf(t.boss.rewardCoins)} Clear Coins</span>
        </div>
        <span class="sector-node__status">${c}</span>
      `,n&&s.addEventListener(`click`,()=>{this.callbacks.onSelectStageDirect(t.stageNumber),this.switchHubTab(`BATTLE`)}),this.sectorMapList.appendChild(s)}}updateCoins(e){this.displayedWalletCoins=e,this.coinCountEl.textContent=wf(e)}updateTrackProgress(e,t,n,r,i=1){let a=Math.max(0,Math.min(100,e*100));this.progressFillEl.style.width=`${a.toFixed(1)}%`,this.progressPctEl.textContent=t===`ENDLESS`?`W${r} • ${Math.round(a)}%`:t===`SPLIT_CAUSEWAY`?`S${i} • ${Math.round(a)}%`:`${Math.round(a)}%`}updateWorldOverlays(e,t,n,r,i,a,o,s,c,l,u,d,f){let p=t===`RUNNING`||t===`BOSS_FIGHT`;a!==this.lastWeaponTier&&(this.lastWeaponTier=a,this.squadWeaponEl.textContent=Ou(a,this.currentSkinTheme).shortBadge),this.squadPillEl.classList.add(`is-hidden`);let m=0;if(p)for(let t=0;t<2&&m<qm;t++){let n=+(t===0);for(let t=0;t<o.length&&m<qm;t++){let i=o[t];if(!i||!i.active||i.aliveCount<=0)continue;let a=i.getConfiguredCount();for(let t=0;t<a&&m<qm;t++){if(i.unitAlive[t]===0||i.unitIsHeavy[t]!==n||i.unitHp[t]>=i.unitMaxHp[t]-.01)continue;let a=i.unitZ[t],o=r-a;if(o>34||o<-3)continue;let s=n===1,c=s?1.98:1.56;if(e.projectToScreen(i.unitX[t],c,a,Zm),!Zm.visible)continue;let l=this.heavyHpBars[m],u=this.heavyHpFills[m],d=Math.max(0,Math.min(1,i.unitHp[t]/Math.max(1,i.unitMaxHp[t])));l.classList.remove(`is-hidden`),l.classList.toggle(`heavy-hp-bar--elite`,s),l.style.transform=`translate3d(${Zm.x.toFixed(1)}px, ${Zm.y.toFixed(1)}px, 0) translate(-50%, -100%)`,u.style.width=`${(d*100).toFixed(1)}%`,m++}}if(f&&f.active&&f.rightAliveCount>0&&m<qm){let t=f.totalTroopers;for(let i=0;i<t&&m<qm;i++){let t=+(f.unitRank[i]===2);if(f.unitAlive[i]===0||t!==n||f.unitHp[i]>=f.unitMaxHp[i]-.01)continue;let a=f.unitZ[i],o=r-a;if(o>38||o<-3)continue;let s=n===1,c=s?1.98:1.56;if(e.projectToScreen(f.unitX[i],c,a,Zm),!Zm.visible)continue;let l=this.heavyHpBars[m],u=this.heavyHpFills[m],d=Math.max(0,Math.min(1,f.unitHp[i]/Math.max(1,f.unitMaxHp[i])));l.classList.remove(`is-hidden`),l.classList.toggle(`heavy-hp-bar--elite`,s),l.style.transform=`translate3d(${Zm.x.toFixed(1)}px, ${Zm.y.toFixed(1)}px, 0) translate(-50%, -100%)`,u.style.width=`${(d*100).toFixed(1)}%`,m++}}}for(let e=m;e<qm;e++)this.heavyHpBars[e].classList.add(`is-hidden`);if(s&&l>0){this.bossHudEl.classList.remove(`is-hidden`),this.bossNameEl.textContent=c.toUpperCase();let e=Math.max(0,Math.ceil(l));this.bossHpEl.textContent=`${Tf(e)} / ${Tf(u)}`;let t=Math.max(0,Math.min(100,l/Math.max(1,u)*100));if(this.bossFillEl.style.width=`${t.toFixed(1)}%`,d!==this.lastBossSegments){this.lastBossSegments=d,this.bossSegmentsEl.innerHTML=``;for(let e=1;e<d;e++){let e=document.createElement(`div`);e.className=`boss-hud__seg-tick`,this.bossSegmentsEl.appendChild(e)}}}else this.bossHudEl.classList.add(`is-hidden`)}get isUnicornPreCardSplashActive(){return this.unicornCelebration.isPreCardSplashActive}revealUnicornVictoryCardEarly(){this.unicornCelebration.revealVictoryCardNow()}tickCelebrationOverlay(e){this.unicornCelebration.tick(e)}triggerUnicornVictoryCelebration(e){let t=e.mode===`SPLIT_CAUSEWAY`?`SPLIT CAUSEWAY ${e.stageNumber}`:`SECTOR ${e.stageNumber}`;this.summaryModalEl.classList.add(`is-hidden`),this.unicornCelebration.startVictoryFinale(`${t} CLEARED!`,`UNICORN VICTORY!`,()=>{this.showSummaryModal(e,!0)})}triggerEndlessUnicornFlyby(e){this.unicornCelebration.playEndlessWaveFlyby(e)}showSummaryModal(e,t=!1){let n=e.outcome===`VICTORY`,r=e.mode===`ENDLESS`?`ENDLESS WAVE ${e.stageNumber}`:e.mode===`SPLIT_CAUSEWAY`?`SPLIT CAUSEWAY ${e.stageNumber}`:`SECTOR ${e.stageNumber}`;this.summaryKickerEl.textContent=n?`${r} CLEARED!`:`${r} — ${Math.round(e.progressRatio*100)}% PROGRESS`,this.summaryTitleEl.textContent=n?t?`UNICORN VICTORY!`:`VICTORY!`:`RUN COMPLETE`,this.summaryTitleEl.classList.toggle(`summary-card__title--victory`,n),this.summaryTitleEl.classList.toggle(`summary-card__title--defeat`,!n),this.summaryModalEl.classList.toggle(`is-unicorn-victory`,t),this.sumDistanceEl.textContent=`${Math.round(e.distanceMeters)}m`,this.sumDrumsEl.textContent=`${e.drumsBroken}`,this.sumEnemiesEl.textContent=`${e.enemiesDefeated}`;let i=Math.max(0,e.totalCoinsEarned-e.liveCoinsEarned);this.sumLiveCoinsEl.textContent=`+${wf(e.liveCoinsEarned)}`,this.sumBonusCoinsEl.textContent=`+${wf(i)}`,this.sumMultEl.textContent=`×${e.warChestMultiplier.toFixed(2)}`,this.btnSummaryContinue.textContent=`NEXT`,this.coinRollupRaf&&=(cancelAnimationFrame(this.coinRollupRaf),0);let a=e.totalCoinsEarned,o=performance.now();if(this.sumTotalCoinsEl.textContent=`+${wf(a)}`,a>0){let e=t=>{let n=Math.min(1,(t-o)/420),r=1-(1-n)**3,i=Math.round(a*r);this.sumTotalCoinsEl.textContent=`+${wf(i)}`,n<1?this.coinRollupRaf=requestAnimationFrame(e):(this.sumTotalCoinsEl.textContent=`+${wf(a)}`,this.coinRollupRaf=0)};this.coinRollupRaf=requestAnimationFrame(e)}this.summaryModalEl.classList.remove(`is-hidden`)}hideSummaryModal(){this.coinRollupRaf&&=(cancelAnimationFrame(this.coinRollupRaf),0),this.summaryModalEl.classList.remove(`is-unicorn-victory`),this.summaryModalEl.classList.add(`is-hidden`),this.unicornCelebration.stop()}},$m=1/60,eh=.1,th=class{onFixedUpdate;onRender;accumulator=0;lastTimestamp=0;rafId=0;running=!1;constructor(e,t){this.onFixedUpdate=e,this.onRender=t}start(){this.running||(this.running=!0,this.lastTimestamp=performance.now(),this.rafId=requestAnimationFrame(this.tick))}stop(){this.running=!1,cancelAnimationFrame(this.rafId)}tick=e=>{if(!this.running)return;let t=Math.max(0,(e-this.lastTimestamp)/1e3);this.lastTimestamp=e;let n=Math.min(eh,t);for(this.accumulator+=n;this.accumulator>=$m;)this.onFixedUpdate($m),this.accumulator-=$m;let r=this.accumulator/$m;this.onRender(n,r),this.rafId=requestAnimationFrame(this.tick)}},nh=.8,rh=.28,ih=class{current=`PRE_RUN`;pausedFromState=`RUNNING`;wipeoutTimer=0;wipeoutModalReady=!1;listeners=[];get state(){return this.current}get resumeTargetState(){return this.pausedFromState}get isWipeoutModalReady(){return this.current===`DEFEAT`&&this.wipeoutModalReady}get timeScale(){return this.current===`PAUSED`?0:this.current===`DEFEAT`&&!this.wipeoutModalReady?rh:1}onChange(e){this.listeners.push(e)}pause(){return this.current!==`RUNNING`&&this.current!==`BOSS_FIGHT`?!1:(this.pausedFromState=this.current,this.transitionTo(`PAUSED`),!0)}resume(){return this.current===`PAUSED`&&(this.transitionTo(this.pausedFromState),!0)}transitionTo(e){if(this.current===e)return;let t=this.current;this.current=e,e===`DEFEAT`?(this.wipeoutTimer=nh,this.wipeoutModalReady=!1):e!==`PAUSED`&&(this.wipeoutTimer=0,this.wipeoutModalReady=!1);for(let n=0;n<this.listeners.length;n++)this.listeners[n](e,t)}tickRealTime(e){return this.current===`DEFEAT`&&!this.wipeoutModalReady&&(this.wipeoutTimer-=e,this.wipeoutTimer<=0)&&(this.wipeoutTimer=0,this.wipeoutModalReady=!0,!0)}},ah=class{callbacks;leftPressed=!1;rightPressed=!1;pointerActive=!1;activePointerId=-1;lastPointerClientX=0;accumulatedDragDeltaWorldX=0;constructor(e,t){this.callbacks=t,this.bindEvents(e)}bindEvents(e){window.addEventListener(`keydown`,e=>{if(!(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement))switch(this.callbacks.onFirstGesture(),e.code){case`ArrowLeft`:case`KeyA`:this.leftPressed=!0,this.callbacks.onBridgePointerLaunch();break;case`ArrowRight`:case`KeyD`:this.rightPressed=!0,this.callbacks.onBridgePointerLaunch();break;case`Space`:e.preventDefault(),this.callbacks.onStartRequest(),this.callbacks.onContinueModal();break;case`Enter`:this.callbacks.onContinueModal();break;case`Escape`:case`KeyP`:this.callbacks.onTogglePause();break;case`Digit1`:case`Numpad1`:this.callbacks.onUpgradeShortcut(0);break;case`Digit2`:case`Numpad2`:this.callbacks.onUpgradeShortcut(1);break;case`Digit3`:case`Numpad3`:this.callbacks.onUpgradeShortcut(2);break;case`Digit4`:case`Numpad4`:this.callbacks.onUpgradeShortcut(3)}}),window.addEventListener(`keyup`,e=>{switch(e.code){case`ArrowLeft`:case`KeyA`:this.leftPressed=!1;break;case`ArrowRight`:case`KeyD`:this.rightPressed=!1}}),e.addEventListener(`pointerdown`,t=>{this.callbacks.onFirstGesture(),this.pointerActive=!0,this.activePointerId=t.pointerId,this.lastPointerClientX=t.clientX;try{e.setPointerCapture(t.pointerId)}catch{}this.callbacks.onBridgePointerLaunch()}),window.addEventListener(`pointermove`,e=>{if(!this.pointerActive||this.activePointerId!==-1&&e.pointerId!==this.activePointerId)return;let t=e.clientX-this.lastPointerClientX;this.lastPointerClientX=e.clientX,this.callbacks.onMenuCanvasDrag(t),Math.abs(t)>=2&&this.callbacks.onBridgePointerLaunch();let n=Math.max(320,window.innerWidth),r=Fd*2,i=n>768?1.55:1.34;this.accumulatedDragDeltaWorldX+=t/n*r*i});let t=e=>{(this.activePointerId===-1||e.pointerId===this.activePointerId)&&(this.pointerActive=!1,this.activePointerId=-1)};window.addEventListener(`pointerup`,t),window.addEventListener(`pointercancel`,t),window.addEventListener(`blur`,()=>{this.leftPressed=!1,this.rightPressed=!1,this.pointerActive=!1,this.activePointerId=-1})}consumeHorizontalDelta(e){let t=this.accumulatedDragDeltaWorldX;this.accumulatedDragDeltaWorldX=0;let n=0;if(this.leftPressed&&--n,this.rightPressed&&(n+=1),typeof navigator.getGamepads==`function`){let e=navigator.getGamepads();for(let t=0;t<e.length;t++){let r=e[t];if(!r||!r.connected)continue;let i=r.axes[0]??0;Math.abs(i)>.14&&(n+=i,this.callbacks.onBridgePointerLaunch()),r.buttons[14]?.pressed&&(--n,this.callbacks.onBridgePointerLaunch()),r.buttons[15]?.pressed&&(n+=1,this.callbacks.onBridgePointerLaunch());break}}return t+=Math.max(-1,Math.min(1,n))*14*e,t}resetFrameDeltas(){this.accumulatedDragDeltaWorldX=0}},oh=class{capacity;activeCount=0;x;y;z;vx;vz;damage;age;maxAge;scale;pierceLeft;lastHitEntityId;weaponTier;colorR;colorG;colorB;constructor(e=1200){this.capacity=e,this.x=new Float32Array(e),this.y=new Float32Array(e),this.z=new Float32Array(e),this.vx=new Float32Array(e),this.vz=new Float32Array(e),this.damage=new Float32Array(e),this.age=new Float32Array(e),this.maxAge=new Float32Array(e),this.scale=new Float32Array(e),this.pierceLeft=new Int16Array(e),this.lastHitEntityId=new Int32Array(e),this.weaponTier=new Uint8Array(e),this.colorR=new Float32Array(e),this.colorG=new Float32Array(e),this.colorB=new Float32Array(e)}spawn(e,t,n,r,i,a,o,s,c,l,u){if(this.activeCount>=this.capacity)return-1;let d=this.activeCount++;return this.x[d]=e,this.y[d]=t,this.z[d]=n,this.vx[d]=r,this.vz[d]=i,this.damage[d]=a,this.age[d]=0,this.maxAge[d]=s,this.scale[d]=c,this.pierceLeft[d]=o,this.lastHitEntityId[d]=-1,this.weaponTier[d]=l,this.colorR[d]=(u>>16&255)/255,this.colorG[d]=(u>>8&255)/255,this.colorB[d]=(u&255)/255,d}deactivate(e){if(e<0||e>=this.activeCount)return;let t=--this.activeCount;e!==t&&(this.x[e]=this.x[t],this.y[e]=this.y[t],this.z[e]=this.z[t],this.vx[e]=this.vx[t],this.vz[e]=this.vz[t],this.damage[e]=this.damage[t],this.age[e]=this.age[t],this.maxAge[e]=this.maxAge[t],this.scale[e]=this.scale[t],this.pierceLeft[e]=this.pierceLeft[t],this.lastHitEntityId[e]=this.lastHitEntityId[t],this.weaponTier[e]=this.weaponTier[t],this.colorR[e]=this.colorR[t],this.colorG[e]=this.colorG[t],this.colorB[e]=this.colorB[t])}clear(){this.activeCount=0}},sh=class{capacity;activeCount=0;x;y;z;vx;vy;vz;gravity;age;maxAge;baseScale;spin;colorR;colorG;colorB;constructor(e=900){this.capacity=e,this.x=new Float32Array(e),this.y=new Float32Array(e),this.z=new Float32Array(e),this.vx=new Float32Array(e),this.vy=new Float32Array(e),this.vz=new Float32Array(e),this.gravity=new Float32Array(e),this.age=new Float32Array(e),this.maxAge=new Float32Array(e),this.baseScale=new Float32Array(e),this.spin=new Float32Array(e),this.colorR=new Float32Array(e),this.colorG=new Float32Array(e),this.colorB=new Float32Array(e)}spawn(e,t,n,r,i,a,o,s,c,l){if(this.activeCount>=this.capacity)return;let u=this.activeCount++;this.x[u]=e,this.y[u]=t,this.z[u]=n,this.vx[u]=r,this.vy[u]=i,this.vz[u]=a,this.gravity[u]=o,this.age[u]=0,this.maxAge[u]=s,this.baseScale[u]=c,this.spin[u]=u%7*.9-2.7,this.colorR[u]=(l>>16&255)/255,this.colorG[u]=(l>>8&255)/255,this.colorB[u]=(l&255)/255}spawnBurst(e,t,n,r,i,a,o=.16,s=.48,c=-16){for(let l=0;l<r;l++){let u=l/r*Math.PI*2+this.activeCount*.37,d=i*(.45+l*17%11*.06),f=i*(.4+l*13%9*.08);this.spawn(e,t,n,Math.cos(u)*d,f,Math.sin(u)*d,c,s,o,a)}}update(e){let t=0;for(;t<this.activeCount;){let n=this.age[t]+e;n>=this.maxAge[t]?this.deactivate(t):(this.age[t]=n,this.vy[t]+=this.gravity[t]*e,this.x[t]+=this.vx[t]*e,this.y[t]+=this.vy[t]*e,this.z[t]+=this.vz[t]*e,this.y[t]<.04&&(this.y[t]=.04,this.vy[t]=Math.abs(this.vy[t])*.35),t++)}}deactivate(e){if(e<0||e>=this.activeCount)return;let t=--this.activeCount;e!==t&&(this.x[e]=this.x[t],this.y[e]=this.y[t],this.z[e]=this.z[t],this.vx[e]=this.vx[t],this.vy[e]=this.vy[t],this.vz[e]=this.vz[t],this.gravity[e]=this.gravity[t],this.age[e]=this.age[t],this.maxAge[e]=this.maxAge[t],this.baseScale[e]=this.baseScale[t],this.spin[e]=this.spin[t],this.colorR[e]=this.colorR[t],this.colorG[e]=this.colorG[t],this.colorB[e]=this.colorB[t])}clear(){this.activeCount=0}},ch=class{capacity;activeCount=0;x;y;z;vx;vy;vz;rx;ry;rz;spinX;spinY;spinZ;age;maxAge;isEnemy;seedCounter=1;constructor(e=96){this.capacity=e,this.x=new Float32Array(e),this.y=new Float32Array(e),this.z=new Float32Array(e),this.vx=new Float32Array(e),this.vy=new Float32Array(e),this.vz=new Float32Array(e),this.rx=new Float32Array(e),this.ry=new Float32Array(e),this.rz=new Float32Array(e),this.spinX=new Float32Array(e),this.spinY=new Float32Array(e),this.spinZ=new Float32Array(e),this.age=new Float32Array(e),this.maxAge=new Float32Array(e),this.isEnemy=new Uint8Array(e)}spawnKnockback(e,t,n,r=1){this.activeCount>=this.capacity&&this.deactivate(0);let i=this.activeCount++,a=this.seedCounter++,o=a%2==0?1:-1,s=o*(1.25+a*7%11*.26)*r;this.x[i]=e+(a*5%7-3)*.08,this.y[i]=.26,this.z[i]=t,this.vx[i]=s,this.vy[i]=(5.6+a*13%9*.34)*r,this.vz[i]=(n?-1:1)*(6.8+a*11%9*.44)*r,this.rx[i]=0,this.ry[i]=n?0:Math.PI,this.rz[i]=0,this.spinX[i]=(n?-1:1)*(9.2+a%5*1.4),this.spinY[i]=o*(3.4+a%4*1.1),this.spinZ[i]=-o*(5.8+a%6*.9),this.age[i]=0,this.maxAge[i]=.68,this.isEnemy[i]=+!!n}update(e){let t=0;for(;t<this.activeCount;){let n=this.age[t]+e;n>=this.maxAge[t]?this.deactivate(t):(this.age[t]=n,this.vy[t]-=21*e,this.x[t]+=this.vx[t]*e,this.y[t]+=this.vy[t]*e,this.z[t]+=this.vz[t]*e,this.rx[t]+=this.spinX[t]*e,this.ry[t]+=this.spinY[t]*e,this.rz[t]+=this.spinZ[t]*e,this.y[t]<.16&&(this.y[t]=.16,this.vy[t]=Math.abs(this.vy[t])*.34,this.vx[t]*=.72,this.vz[t]*=.72,this.spinX[t]*=.68),t++)}}deactivate(e){if(e<0||e>=this.activeCount)return;let t=--this.activeCount;e!==t&&(this.x[e]=this.x[t],this.y[e]=this.y[t],this.z[e]=this.z[t],this.vx[e]=this.vx[t],this.vy[e]=this.vy[t],this.vz[e]=this.vz[t],this.rx[e]=this.rx[t],this.ry[e]=this.ry[t],this.rz[e]=this.rz[t],this.spinX[e]=this.spinX[t],this.spinY[e]=this.spinY[t],this.spinZ[e]=this.spinZ[t],this.age[e]=this.age[t],this.maxAge[e]=this.maxAge[t],this.isEnemy[e]=this.isEnemy[t])}clear(){this.activeCount=0}},lh=`bridge_blitz_save_v1`;function uh(){return{version:1,coins:0,unlockedStage:1,selectedStage:1,selectedMode:`CAMPAIGN`,splitCausewayStage:1,bestSplitStage:1,upgrades:{fireRate:0,bulletPower:0,startingSquad:0,warChest:0},highScoreSquad:1,bestEndlessDistance:0,settings:{muted:!1,haptics:!0,skinTheme:`UNICORN`,skinDefaultV72Applied:!0}}}function dh(e,t){return typeof e!=`number`||!Number.isFinite(e)?t:Math.max(0,Math.floor(e))}function fh(e){let t=uh();if(!e||typeof e!=`object`)return t;let n=e,r=n.upgrades&&typeof n.upgrades==`object`?n.upgrades:{},i=n.settings&&typeof n.settings==`object`?n.settings:{},a=Math.min(10,Math.max(1,dh(n.unlockedStage,1))),o=Math.min(a,Math.max(1,dh(n.selectedStage,a))),s=Math.max(1,dh(n.splitCausewayStage,1)),c=Math.max(s,dh(n.bestSplitStage,1)),l=n.selectedMode===`ENDLESS`?`ENDLESS`:n.selectedMode===`SPLIT_CAUSEWAY`?`SPLIT_CAUSEWAY`:`CAMPAIGN`,u=i.skinTheme===`TACTICAL`?`TACTICAL`:i.skinTheme===`UNICORN`?`UNICORN`:t.settings.skinTheme;return{version:1,coins:dh(n.coins,t.coins),unlockedStage:a,selectedStage:o,selectedMode:l,splitCausewayStage:s,bestSplitStage:c,upgrades:{fireRate:dh(r.fireRate,0),bulletPower:dh(r.bulletPower,0),startingSquad:dh(r.startingSquad,0),warChest:dh(r.warChest,0)},highScoreSquad:Math.max(1,dh(n.highScoreSquad,1)),bestEndlessDistance:dh(n.bestEndlessDistance,0),settings:{muted:typeof i.muted==`boolean`?i.muted:t.settings.muted,haptics:typeof i.haptics==`boolean`?i.haptics:t.settings.haptics,skinTheme:u,skinDefaultV72Applied:typeof i.skinDefaultV72Applied==`boolean`&&i.skinDefaultV72Applied}}}var ph=class{data;constructor(){this.data=this.load()}getData(){return this.data}load(){try{let e=window.localStorage.getItem(lh);if(!e)return uh();let t=fh(JSON.parse(e));if(!t.settings.skinDefaultV72Applied){t.settings.skinTheme=`UNICORN`,t.settings.skinDefaultV72Applied=!0;try{window.localStorage.setItem(lh,JSON.stringify(t))}catch{}}return t}catch{return uh()}}save(e){e&&(this.data=fh({...e,settings:{...e.settings,skinDefaultV72Applied:!0}}));try{window.localStorage.setItem(lh,JSON.stringify(this.data))}catch{}}update(e){let t={...this.data,upgrades:{...this.data.upgrades},settings:{...this.data.settings,skinDefaultV72Applied:!0}};return e(t),this.save(t),this.data}exportJson(){return JSON.stringify(this.data,null,2)}reset(){let e=uh();return this.save(e),this.data}},mh=28,hh=6,gh=12,_h=6,vh=2,yh=[16722268,16747546,16771115,2288490,2399743,12073983],bh=class{saveManager=new ph;stateMachine=new ih;sound;sceneManager;bridgeEnv;bulletPool=new oh(1800);particlePool=new sh(1200);ragdollPool=new ch(96);batchRenderer;vfx;flyingWeapons;combatText;squad=new Ep;supplyDrums=[];gatePairs=[];tireStacks=[];enemyWaves=[];midBrutes=[new Yf(0),new Yf(1)];splitCauseway=new xp;boss;hud;input;loop;activeStageDef;activeMenuTab=`BATTLE`;hubPreviewWeaponTier=1;commandoFacingYaw=0;nextDrumCursor=0;nextGateCursor=0;nextTireCursor=0;nextWaveCursor=0;nextBruteCursor=0;sectorBaseZ=0;endlessWave=1;elapsedTime=0;coinFountainTimer=0;celebrateHopTimer=0;bulletSparkTick=0;simulatedSteerDelta=0;coinTargetNdc={x:.82,y:.89};debugProjLeft={x:0,y:0,visible:!1};debugProjRight={x:0,y:0,visible:!1};handleMagnetCoinArrived=e=>{let t=this.saveManager.getData().coins;this.hud.recordMagnetizedCoinArrival(e,t,this.liveCoinsThisRun),this.sound.playCoinPickup()};handleFlyingWeaponArrived=(e,t,n)=>{let r=this.saveManager.getData().settings.skinTheme===`UNICORN`;this.celebrateHopTimer=.42,this.sceneManager.addShake(.28),this.vfx.spawnShockwave(t,n,4.3,.44,r?16732072:16767053),this.vfx.spawnShockwave(t,n,2.9,.32,r?16770125:3733247),this.vfx.spawnImpactSplash(t,1.38,n,2.15,r?16752360:16770155),r?this.spawnRainbowSparkles(t,1.45,n,24,7.2):this.spawnGoldConfettiShower(t,1.32,n,20),this.applyWeaponDrop(e,t,n)};handleFlyingWeaponTrailSpark=(e,t,n,r)=>{if(this.particlePool.activeCount>=1080)return;let i=this.saveManager.getData().settings.skinTheme===`UNICORN`?yh[this.rainbowSparkCursor++%yh.length]:r>=4?3733247:16768845;this.particlePool.spawn(e,t,n,0,1.2,.6,-4.5,.24,.16,i)};liveCoinsThisRun=0;drumsBrokenThisRun=0;enemiesDefeatedThisRun=0;gatesFlippedThisRun=0;tiresBrokenThisRun=0;weaponLocksThisRun=0;bossSalvosDodgedThisRun=0;pendingSummary=null;constructor(){let e=document.getElementById(`canvas-container`),t=document.getElementById(`combat-text-layer`);if(!e||!t)throw Error(`Required root DOM containers missing`);let n=this.saveManager.getData();this.sound=new M(n.settings),this.sceneManager=new zm(e),this.bridgeEnv=new Hp,this.sceneManager.scene.add(this.bridgeEnv.root),this.batchRenderer=new Nm(this.sceneManager.scene,this.bulletPool.capacity,this.particlePool.capacity),this.vfx=new cm(this.sceneManager.scene),this.flyingWeapons=new dm(this.sceneManager.scene),this.combatText=new Gp(t);for(let e=0;e<mh;e++){let t=new lp(e);this.supplyDrums.push(t),this.sceneManager.scene.add(t.root)}for(let e=0;e<hh;e++){let t=new If(e);this.gatePairs.push(t),this.sceneManager.scene.add(t.root)}for(let e=0;e<gh;e++){let t=new jp(e);this.tireStacks.push(t),this.sceneManager.scene.add(t.root)}for(let e=0;e<_h;e++)this.enemyWaves.push(new Jd(e));for(let e=0;e<vh;e++)this.sceneManager.scene.add(this.midBrutes[e].root);this.sceneManager.scene.add(this.splitCauseway.root),this.boss=new jd(this.sceneManager.scene),this.activeStageDef=pu(n.selectedStage),this.hud=new Qm({onStartMarch:()=>this.startRunIfStaging(),onBuyUpgrade:e=>this.handleBuyUpgrade(e),onSelectMode:e=>this.handleSelectMode(e),onSelectStageDirect:e=>this.handleSelectStageDirect(e),onHubStateChange:e=>{if(this.activeMenuTab=e.tab,this.hubPreviewWeaponTier=e.hubPreviewWeaponTier,e.tab===`ARMORY`){if(e.armorySubTab===`WEAPONS`)this.sceneManager.configureArmoryWeapon(e.armoryWeaponTier);else{let t=Math.max(0,Math.min(fu.length-1,e.armoryBossStage-1));this.sceneManager.configureArmoryBoss(fu[t].boss)}}},onPauseRequest:()=>this.handlePauseRequest(),onResumeRequest:()=>this.handleResumeRequest(),onRestartRequest:()=>this.handleRestartSector(),onRetreatToHubRequest:()=>this.handleRetreatToHub(),onToggleSkin:()=>this.handleToggleSkin(),onToggleMute:()=>this.handleToggleMute(),onToggleHaptics:()=>this.handleToggleHaptics(),onExportSave:()=>this.handleExportSave(),onResetSave:()=>this.handleResetSave(),onSummaryContinue:()=>this.handleSummaryContinue(),onFireworkLaunchSound:e=>this.sound.playUnicornFireworkBurst(e)}),this.stateMachine.onChange(e=>{this.hud.syncTopHudForState(e)}),this.input=new ah(e,{onStartRequest:()=>this.startRunIfStaging(),onBridgePointerLaunch:()=>{this.stateMachine.state===`PRE_RUN`&&(this.hud.isSettingsOpen?this.hud.closeSettingsDrawer():this.activeMenuTab===`BATTLE`&&this.startRunIfStaging())},onMenuCanvasDrag:e=>{this.stateMachine.state===`PRE_RUN`&&this.activeMenuTab===`ARMORY`&&this.sceneManager.rotateArmoryTurntable(e*.012)},onTogglePause:()=>{this.stateMachine.state===`PAUSED`?this.handleResumeRequest():(this.stateMachine.state===`RUNNING`||this.stateMachine.state===`BOSS_FIGHT`)&&this.handlePauseRequest()},onUpgradeShortcut:e=>{this.stateMachine.state===`PRE_RUN`&&this.handleBuyUpgrade(hf[e])},onFirstGesture:()=>this.sound.unlockOnGesture(),onContinueModal:()=>{this.hud.isUnicornPreCardSplashActive?this.hud.revealUnicornVictoryCardEarly():(this.stateMachine.state===`VICTORY`||this.stateMachine.isWipeoutModalReady)&&this.handleSummaryContinue()}}),this.applySkinTheme(n.settings.skinTheme),this.prepareStagingArea(),this.loop=new th(e=>this.fixedUpdate(e),e=>this.renderFrame(e)),this.loop.start()}get activeBoardLayout(){return this.activeStageDef.boardLayout??`STANDARD_BRIDGE`}getActiveBossDisplayName(e){return bu(this.activeStageDef.boss,e).name}getStageBruteDefs(e){return e.boardLayout===`SPLIT_CAUSEWAY`&&e.splitCauseway?e.splitCauseway.goliathSpawns:e.midBrutes&&e.midBrutes.length>0?e.midBrutes:e.midBrute?[e.midBrute]:[]}anyBruteAlive(){for(let e=0;e<vh;e++){let t=this.midBrutes[e];if(t.active&&!t.defeated&&t.hp>0)return!0}return!1}isAnyBruteHaltingMarch(e){if(this.activeBoardLayout===`SPLIT_CAUSEWAY`)return!1;for(let t=0;t<vh;t++)if(this.midBrutes[t].isHaltingMarch(e))return!0;return!1}getPrimaryBruteTelemetry(){let e=null,t=-999999;for(let n=0;n<vh;n++){let r=this.midBrutes[n];r.active&&!r.defeated&&r.hp>0&&r.z>t&&(e=r,t=r.z)}return e?{hp:e.hp,maxHp:e.maxHp}:{hp:0,maxHp:this.midBrutes[0].maxHp}}computeSectorProgressRatio(){let e=this.stateMachine.state;return e===`VICTORY`?1:this.activeBoardLayout===`SPLIT_CAUSEWAY`?(e===`PAUSED`?this.stateMachine.resumeTargetState:e)===`BOSS_FIGHT`||this.splitCauseway.retractedForBoss?1:this.splitCauseway.getProgress():Math.max(0,Math.min(1,(this.sectorBaseZ-this.squad.z)/this.activeStageDef.trackLength))}computeRunDistanceMeters(){let e=Math.max(0,-this.squad.z);return this.activeBoardLayout===`SPLIT_CAUSEWAY`?Math.round(e+this.computeSectorProgressRatio()*this.activeStageDef.trackLength):e}prepareStagingArea(){let e=this.saveManager.getData();this.endlessWave=1,this.sectorBaseZ=0,this.liveCoinsThisRun=0,this.drumsBrokenThisRun=0,this.enemiesDefeatedThisRun=0,this.gatesFlippedThisRun=0,this.tiresBrokenThisRun=0,this.weaponLocksThisRun=0,this.bossSalvosDodgedThisRun=0,this.pendingSummary=null,this.coinFountainTimer=0,this.celebrateHopTimer=0,this.commandoFacingYaw=0,this.bulletPool.clear(),this.particlePool.clear(),this.ragdollPool.clear(),this.vfx.clear(),this.flyingWeapons.clear(),this.combatText.clear(),this.input.resetFrameDeltas(),this.simulatedSteerDelta=0,this.activeStageDef=e.selectedMode===`ENDLESS`?_u(1):e.selectedMode===`SPLIT_CAUSEWAY`?gu(e.splitCausewayStage):pu(e.selectedStage);let t=yf(e.upgrades.startingSquad);this.squad.resetForRun(t),this.populateSectorEntities(this.activeStageDef,0),this.applySkinTheme(e.settings.skinTheme),this.stateMachine.transitionTo(`PRE_RUN`),this.hud.hidePauseModal(),this.hud.hideSummaryModal(),this.hud.setStagingVisible(!0),this.hud.syncTopHudForState(`PRE_RUN`),this.hud.syncSaveState(e,this.activeStageDef.title,this.getActiveBossDisplayName(e.settings.skinTheme),this.endlessWave,this.activeBoardLayout),this.hud.updateTrackProgress(0,e.selectedMode,0,this.endlessWave,e.splitCausewayStage)}populateSectorEntities(e,t){if(e.boardLayout===`SPLIT_CAUSEWAY`&&e.splitCauseway&&e.splitCauseway){for(let e=0;e<mh;e++)this.supplyDrums[e].hide();for(let e=0;e<hh;e++)this.gatePairs[e].hide();for(let e=0;e<gh;e++)this.tireStacks[e].hide();for(let e=0;e<_h;e++)this.enemyWaves[e].hide();for(let e=0;e<vh;e++)this.midBrutes[e].hide();this.nextDrumCursor=0,this.nextGateCursor=0,this.nextTireCursor=0,this.nextWaveCursor=0,this.nextBruteCursor=0,this.splitCauseway.configure(e.splitCauseway,t),this.bridgeEnv.configureBoardLayout(`SPLIT_CAUSEWAY`,this.splitCauseway.dividerTipZ),this.bridgeEnv.configureBossPlatformZ(t-420,!1),this.boss.configure(e.boss,-t+e.trackLength),this.boss.hide(),this.squad.x=up,this.squad.z=t,this.squad.updateMovement(0,0,!1,!1,!0);return}this.splitCauseway.hide(),this.bridgeEnv.configureBoardLayout(`STANDARD_BRIDGE`);for(let n=0;n<mh;n++){let r=e.supplyDrums[n];r?this.supplyDrums[n].configure({...r,z:t+r.z}):this.supplyDrums[n].hide()}this.nextDrumCursor=Math.min(mh,e.supplyDrums.length);for(let n=0;n<hh;n++){let r=e.gatePairs[n];r?this.gatePairs[n].configure({...r,z:t+r.z}):this.gatePairs[n].hide()}this.nextGateCursor=Math.min(hh,e.gatePairs.length);for(let n=0;n<gh;n++){let r=e.tireStacks[n];r?this.tireStacks[n].configure({...r,z:t+r.z}):this.tireStacks[n].hide()}this.nextTireCursor=Math.min(gh,e.tireStacks.length);for(let n=0;n<_h;n++){let r=e.enemyWaves[n];r?this.enemyWaves[n].configure({...r,z:t+r.z}):this.enemyWaves[n].hide()}this.nextWaveCursor=Math.min(_h,e.enemyWaves.length);let n=this.getStageBruteDefs(e);for(let e=0;e<vh;e++){let r=n[e];r?this.midBrutes[e].configure({...r,z:t+r.z}):this.midBrutes[e].hide()}this.nextBruteCursor=Math.min(vh,n.length);let r=-t+e.trackLength,i=this.saveManager.getData().selectedMode===`CAMPAIGN`;this.bridgeEnv.configureBossPlatformZ(t-e.trackLength,i),this.boss.configure(e.boss,r)}streamUpcomingEntities(){let e=this.activeStageDef,t=this.sectorBaseZ;if(this.activeBoardLayout===`SPLIT_CAUSEWAY`){let n=e.splitCauseway?.goliathSpawns??[];if(this.splitCauseway.retractedForBoss||this.nextBruteCursor>=n.length)return;let r=n[this.nextBruteCursor],i=Math.max(12,Math.abs(r.z)-38);if(!(this.splitCauseway.siegeDistance>=i||this.splitCauseway.rightAliveCount<=14))return;for(let e=0;e<vh;e++){let n=this.midBrutes[e];if(!n.active||n.defeated){let e=this.splitCauseway.rightAliveCount<=14?t-26:t-38;n.configure({...r,z:e},dp),this.nextBruteCursor++;break}}return}for(let n=0;n<mh&&this.nextDrumCursor<e.supplyDrums.length;n++){let r=this.supplyDrums[n];if(!r.active||r.z>this.squad.z+10){let n=e.supplyDrums[this.nextDrumCursor++];r.configure({...n,z:t+n.z})}}for(let n=0;n<hh&&this.nextGateCursor<e.gatePairs.length;n++){let r=this.gatePairs[n];if(!r.active||r.z>this.squad.z+9){let n=e.gatePairs[this.nextGateCursor++];r.configure({...n,z:t+n.z})}}for(let n=0;n<gh&&this.nextTireCursor<e.tireStacks.length;n++){let r=this.tireStacks[n];if(!r.active||r.z>this.squad.z+10){let n=e.tireStacks[this.nextTireCursor++];r.configure({...n,z:t+n.z})}}for(let n=0;n<_h&&this.nextWaveCursor<e.enemyWaves.length;n++){let r=this.enemyWaves[n];if(!r.active||r.aliveCount<=0||r.z>this.squad.z+12){let n=e.enemyWaves[this.nextWaveCursor++];r.configure({...n,z:t+n.z})}}let n=this.getStageBruteDefs(e);for(let e=0;e<vh&&this.nextBruteCursor<n.length;e++){let r=this.midBrutes[e];if(!r.active||r.defeated||r.z>this.squad.z+12){let e=n[this.nextBruteCursor++];r.configure({...e,z:t+e.z})}}}startRunIfStaging(){this.stateMachine.state===`PRE_RUN`&&(this.sound.unlockOnGesture(),this.squad.weaponTier=1,this.hud.setStagingVisible(!1),this.stateMachine.transitionTo(`RUNNING`))}awardLiveCoins(e,t,n,r,i=2){if(e<=0)return 0;let a=bf(this.saveManager.getData().upgrades.warChest),o=Math.max(1,Math.round(e*a));this.liveCoinsThisRun+=o;let s=this.saveManager.update(e=>{e.coins+=o}),c=this.stateMachine.state;return i>0&&(c===`RUNNING`||c===`BOSS_FIGHT`)?this.vfx.spawnMagnetizedCoins(t,1.15,n,i,o):(this.hud.flashLiveCoinGain(o,s.coins),this.sound.playCoinPickup()),r&&this.combatText.spawn(t,1.95,n,`+${wf(o)}`,`gold`,.82),o}applySquadCountWithOverflow(e,t,n){let r=this.squad.setLogicalCount(e);if(r>0){let e=Math.min(240,r*10),i=this.awardLiveCoins(e,t,n,!1,3);this.combatText.spawn(t,2.2,n,`MAX 40! +${wf(i)}`,`gold`,.95)}}handlePauseRequest(){if(!this.stateMachine.pause())return;this.hud.flushDisplayedCoins(this.saveManager.getData().coins,this.liveCoinsThisRun);let e=this.computeSectorProgressRatio();this.hud.showPauseModal(this.squad.logicalCount,this.squad.weaponTier,e,this.enemiesDefeatedThisRun)}handleResumeRequest(){this.stateMachine.resume()&&this.hud.hidePauseModal()}handleRestartSector(){this.hud.hidePauseModal(),this.prepareStagingArea(),this.startRunIfStaging()}handleRetreatToHub(){this.hud.hidePauseModal(),this.prepareStagingArea()}handleBuyUpgrade(e){if(this.stateMachine.state!==`PRE_RUN`)return;this.sound.unlockOnGesture();let t=this.saveManager.getData(),n=Cf(t.coins,t.upgrades,e);if(!n.purchased)return;let r=this.saveManager.update(e=>{e.coins=n.remainingCoins,e.upgrades=n.nextUpgrades}),i=r.upgrades[e];if(this.sound.playUpgradeBuy(i),this.hud.flashUpgradePurchase(e),this.celebrateHopTimer=.38,e===`startingSquad`){let e=yf(r.upgrades.startingSquad);this.squad.setLogicalCount(e);let t=r.settings.skinTheme===`UNICORN`,n=t?16735416:3928200,i=t?16751584:5701533;this.vfx.spawnShockwave(this.squad.x,this.squad.z,2.7,.38,n),this.vfx.spawnImpactSplash(this.squad.x,1.1,this.squad.z,1.45,i),this.particlePool.spawnBurst(this.squad.x,.9,this.squad.z,18,5.2,n),this.combatText.spawn(this.squad.x,1.95,this.squad.z,t?`+1 PINK GIRL!`:`+1 SOLDIER!`,`positive`,.85)}else{let t=e===`fireRate`?2685148:e===`bulletPower`?16731501:16763192;this.vfx.spawnShockwave(this.squad.x,this.squad.z,2.5,.36,t),this.vfx.spawnImpactSplash(this.squad.x,1.1,this.squad.z,1.35,t),this.particlePool.spawnBurst(this.squad.x,.9,this.squad.z,14,4.6,t);let n=e===`fireRate`?`+6% FIRE RATE!`:e===`bulletPower`?`+10% ORDNANCE!`:`+10% BOUNTY!`;this.combatText.spawn(this.squad.x,1.95,this.squad.z,n,e===`warChest`?`gold`:`cyan`,.82)}this.hud.syncSaveState(r,this.activeStageDef.title,this.getActiveBossDisplayName(r.settings.skinTheme),this.endlessWave,this.activeBoardLayout)}handleSelectMode(e){this.stateMachine.state===`PRE_RUN`&&(this.saveManager.update(t=>{t.selectedMode=e}),this.prepareStagingArea())}handleSelectStageDirect(e){this.stateMachine.state===`PRE_RUN`&&(this.saveManager.update(t=>{t.selectedMode=`CAMPAIGN`,t.selectedStage=Math.max(1,Math.min(t.unlockedStage,e))}),this.prepareStagingArea())}applySkinTheme(e){this.squad.skinTheme=e,this.batchRenderer.setSkinTheme(e),this.sceneManager.setSkinTheme(e),this.flyingWeapons.setSkinTheme(e),this.splitCauseway.setSkinTheme(e),this.boss.setSkinTheme(e);for(let t=0;t<mh;t++)this.supplyDrums[t].setSkinTheme(e);for(let t=0;t<gh;t++)this.tireStacks[t].setSkinTheme(e);for(let t=0;t<vh;t++)this.midBrutes[t].setSkinTheme(e)}handleToggleSkin(){this.sound.unlockOnGesture();let e=this.saveManager.update(e=>{e.settings.skinTheme=e.settings.skinTheme===`UNICORN`?`TACTICAL`:`UNICORN`}),t=e.settings.skinTheme===`UNICORN`;this.applySkinTheme(e.settings.skinTheme),this.sound.playGateFlipChime(),this.celebrateHopTimer=.36;let n=t?16732088:2685148,r=t?16769126:6485247;this.vfx.spawnShockwave(this.squad.x,this.squad.z,3.1,.42,n),this.vfx.spawnImpactSplash(this.squad.x,1.15,this.squad.z,1.6,r),this.particlePool.spawnBurst(this.squad.x,1,this.squad.z,22,5.8,n,.16,.48),this.stateMachine.state!==`PAUSED`&&this.combatText.spawn(this.squad.x,2.05,this.squad.z,t?`UNICORN MAGIC ON!`:`TACTICAL OPS ON!`,t?`gold`:`cyan`,.92),this.hud.syncSaveState(e,this.activeStageDef.title,this.getActiveBossDisplayName(e.settings.skinTheme),this.endlessWave,this.activeBoardLayout),this.stateMachine.state===`PAUSED`&&this.hud.showPauseModal(this.squad.logicalCount,this.squad.weaponTier,this.computeSectorProgressRatio(),this.enemiesDefeatedThisRun)}handleToggleMute(){let e=this.saveManager.update(e=>{e.settings.muted=!e.settings.muted});this.sound.updateSettings(e.settings),this.hud.syncSaveState(e,this.activeStageDef.title,this.getActiveBossDisplayName(e.settings.skinTheme),this.endlessWave,this.activeBoardLayout)}handleToggleHaptics(){let e=this.saveManager.update(e=>{e.settings.haptics=!e.settings.haptics});this.sound.updateSettings(e.settings),this.hud.syncSaveState(e,this.activeStageDef.title,this.getActiveBossDisplayName(e.settings.skinTheme),this.endlessWave,this.activeBoardLayout)}handleExportSave(){let e=this.saveManager.exportJson();try{let t=new Blob([e],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`bridge-blitz-save.json`,r.click(),URL.revokeObjectURL(n)}catch{}}handleResetSave(){let e=this.saveManager.reset();this.sound.updateSettings(e.settings),this.applySkinTheme(e.settings.skinTheme),this.prepareStagingArea()}handleSummaryContinue(){this.prepareStagingArea()}spawnVolleyMuzzleVfx(){let e=this.squad.lastFiredCount;if(e<=0)return;let t=this.squad.weaponTier,n=this.saveManager.getData().settings.skinTheme,r=Ou(t,n)?.colorHex??6485247,i=t>=4?1.42:1.08,a=Math.min(4,e),o=Math.floor(this.elapsedTime*60),s=.548*Cu;for(let e=0;e<a;e++){let t=this.squad.lastFiredMuzzleX[e],a=this.squad.lastFiredMuzzleZ[e];this.vfx.spawnMuzzleFlash(t,s,a,i,r),e===0&&n!==`UNICORN`&&this.particlePool.spawn(t+.08,s,a+.24,1.9+o%3*.45,2.6,.6,-14,.34,.075,16103470)}}computeCameraFramingMode(){let e=this.stateMachine.state;if(e===`PRE_RUN`)return this.activeMenuTab===`ARMORY`?`ARMORY_INSPECT`:`LIVE_BRIDGE`;let t=e===`PAUSED`?this.stateMachine.resumeTargetState:e;return t===`BOSS_FIGHT`||t===`VICTORY`?`BOSS_TACTICAL`:`RUN_TACTICAL`}findBlockingGateZ(e){if(this.activeBoardLayout===`SPLIT_CAUSEWAY`)return null;let t=null;for(let n=0;n<hh;n++){let r=this.gatePairs[n];r.active&&!r.triggered&&r.z>=e-1.5&&r.z<=this.squad.z+1.5&&(t===null||r.z<t)&&(t=r.z)}return t}fixedUpdate(e){let t=e*this.stateMachine.timeScale,n=this.stateMachine.state;if(n===`PAUSED`){this.input.resetFrameDeltas(),this.simulatedSteerDelta=0;return}this.elapsedTime+=t,this.celebrateHopTimer>0&&(this.celebrateHopTimer=Math.max(0,this.celebrateHopTimer-t));let r=this.saveManager.getData(),i=this.activeBoardLayout===`SPLIT_CAUSEWAY`,a=i&&!this.splitCauseway.retractedForBoss,o=i?46:42;n===`RUNNING`&&this.streamUpcomingEntities();let s=(n===`RUNNING`||n===`BOSS_FIGHT`?this.input.consumeHorizontalDelta(t):0)+this.simulatedSteerDelta;this.simulatedSteerDelta=0,n!==`RUNNING`&&n!==`BOSS_FIGHT`&&this.input.resetFrameDeltas(),this.commandoFacingYaw=0;let c=n===`RUNNING`&&this.isAnyBruteHaltingMarch(this.squad.z);if(n===`PRE_RUN`)this.squad.updateMovement(t,0,!1,!1,a),i&&this.splitCauseway.update(t,this.squad.x,this.squad.z,!1);else if(n===`RUNNING`){let e=!i&&!c;if(this.squad.updateMovement(t,s,e,!0,a),i&&(this.squad.z=this.sectorBaseZ),this.squad.updateAutoFire(t,_f(r.upgrades.fireRate),vf(r.upgrades.bulletPower),this.bulletPool,o)&&(this.sound.playGunfire(this.squad.weaponTier,this.squad.logicalCount),this.spawnVolleyMuzzleVfx()),i){if(this.splitCauseway.update(t,this.squad.x,this.squad.z,!0),this.squad.logicalCount>0){let e=this.splitCauseway.resolveSquadCollision(this.squad.x,this.squad.z,this.squad.logicalCount);if(e&&e.playerLosses>0){let t=e.playerLosses;this.squad.setLogicalCount(this.squad.logicalCount-t);let n=Math.min(4,t);for(let e=0;e<n;e++)this.ragdollPool.spawnKnockback(this.squad.x,this.squad.z,!1,.95);this.sceneManager.addShake(.28),this.sound.playEnemyPop(),this.particlePool.spawnBurst(e.hitX,.8,e.hitZ,14,5.4,16729943),this.combatText.spawn(this.squad.x,1.6,this.squad.z,`-${t}`,`negative`,.68),this.squad.logicalCount<=0&&this.triggerRunDefeat()}}let e=this.activeStageDef.splitCauseway?.goliathSpawns.length??0;this.stateMachine.state===`RUNNING`&&this.splitCauseway.isSiegeComplete()&&this.nextBruteCursor>=e&&!this.anyBruteAlive()&&(this.splitCauseway.retractQueueForBoss(),this.bridgeEnv.setDividerRetracted(!0),this.boss.configure(this.activeStageDef.boss,-this.squad.z+6.5),this.stateMachine.transitionTo(`BOSS_FIGHT`),this.sceneManager.addShake(.34),this.vfx.spawnShockwave(0,this.squad.z-8.2,4.2,.42,16756290),this.combatText.spawn(0,2.6,this.boss.z,`${this.boss.name.toUpperCase()}!`,`negative`,1.1))}else this.sectorBaseZ-this.squad.z>=this.activeStageDef.trackLength&&(this.squad.z=this.sectorBaseZ-this.activeStageDef.trackLength,this.stateMachine.transitionTo(`BOSS_FIGHT`),this.combatText.spawn(0,2.6,this.boss.z,`${this.boss.name.toUpperCase()}!`,`negative`,1.1))}else n===`BOSS_FIGHT`&&(this.squad.updateMovement(t,s,!1,!0,!1),i&&this.splitCauseway.update(t,this.squad.x,this.squad.z,!1),this.squad.updateAutoFire(t,_f(r.upgrades.fireRate),vf(r.upgrades.bulletPower),this.bulletPool,o)&&(this.sound.playGunfire(this.squad.weaponTier,this.squad.logicalCount),this.spawnVolleyMuzzleVfx()));if((n===`RUNNING`||n===`BOSS_FIGHT`)&&this.flyingWeapons.update(t,this.squad.x,this.squad.z,this.handleFlyingWeaponArrived,this.handleFlyingWeaponTrailSpark),!i){for(let e=0;e<mh;e++){let r=this.supplyDrums[e],i=this.findBlockingGateZ(r.z);if(r.update(t,this.squad.z,i,n===`RUNNING`),n===`RUNNING`&&this.squad.logicalCount>0){let e=r.resolveSquadCollision(this.squad.x,this.squad.z,this.squad.logicalCount);if(e&&e.losses>0){let t=Math.min(this.squad.logicalCount,e.losses);this.squad.setLogicalCount(this.squad.logicalCount-t);let n=Math.min(4,t);for(let e=0;e<n;e++)this.ragdollPool.spawnKnockback(this.squad.x+(e%3-1)*.35,this.squad.z,!1,1.08);this.sceneManager.addShake(.36),this.vfx.spawnShockwave(e.x,e.z,2.9,.34,16734774),this.vfx.spawnImpactSplash(e.x,1.05,e.z,1.5,16755268),this.particlePool.spawnBurst(e.x,.9,e.z,16,5.6,6061214),this.sound.playBarrelCrash(),this.combatText.spawn(this.squad.x,1.82,this.squad.z,`-${t} BARREL!`,`negative`,.88),this.squad.logicalCount<=0&&this.triggerRunDefeat()}}}for(let e=0;e<hh;e++){let r=this.gatePairs[e];if(r.updateVisuals(t,this.squad.z),r.lastStepDecayTicks>0&&n===`RUNNING`&&(this.sound.playGateDecayTick(r.lastStepDecayValue),r.lastStepFlippedBackToRed&&this.vfx.spawnShockwave(r.lastStepDecayX,r.z,2.7,.32,16726876)),n===`RUNNING`&&this.squad.logicalCount>0){let e=r.trySquadCollect(this.squad.x,this.squad.z,this.squad.logicalCount);if(e){if(e.deltaSquad<0){let t=Math.min(6,Math.abs(e.deltaSquad));for(let e=0;e<t;e++)this.ragdollPool.spawnKnockback(this.squad.x,this.squad.z,!1,.95)}this.applySquadCountWithOverflow(e.rawUnclampedCount,e.worldX,e.worldZ),this.sound.playGateCollect(e.positive);let t=e.positive?3733247:16729943;this.vfx.spawnShockwave(e.worldX,e.worldZ,2.9,.34,t),this.particlePool.spawnBurst(e.worldX,1.2,e.worldZ,18,5.8,t);let n=e.deltaSquad>=0?`+`:``;this.combatText.spawn(e.worldX,1.9,e.worldZ,`${e.label} (${n}${e.deltaSquad})`,e.positive?`positive`:`negative`),this.squad.logicalCount<=0&&this.triggerRunDefeat()}}}for(let e=0;e<gh;e++){let r=this.tireStacks[e];if(r.update(t,this.squad.z),n===`RUNNING`&&this.squad.logicalCount>0){if(r.checkCoreLaneCrash(this.squad.x,this.squad.z)){let e=Math.min(12,this.squad.logicalCount);for(let t=0;t<e;t++)this.ragdollPool.spawnKnockback(this.squad.x+(t%3-1)*.45,this.squad.z,!1,1.18);this.sceneManager.addShake(.55),this.vfx.spawnShockwave(r.x,r.z,3.2,.38,16726870),this.particlePool.spawnBurst(r.x,.95,r.z,22,5.8,2962752),this.sound.playEnemyPop(),this.combatText.spawn(r.x,1.85,r.z,`BARRICADE!`,`negative`,1),this.triggerRunDefeat()}else r.active&&!r.broken&&this.squad.funnelAroundStandingObstacle(r.x,r.z,1.28,1.14,t)}}for(let e=0;e<_h;e++){let r=this.enemyWaves[e];if(n===`RUNNING`||n===`BOSS_FIGHT`){let e=this.findBlockingGateZ(r.z);if(r.update(t,this.squad.x,this.squad.z,e),this.squad.logicalCount>0){let e=r.resolveSquadCollision(this.squad.x,this.squad.z,this.squad.logicalCount);if(e&&e.playerLosses>0){let t=e.playerLosses;this.squad.setLogicalCount(this.squad.logicalCount-t);let n=Math.min(4,t);for(let e=0;e<n;e++)this.ragdollPool.spawnKnockback(this.squad.x,this.squad.z,!1,.95);this.sceneManager.addShake(.28),this.sound.playEnemyPop(),this.particlePool.spawnBurst(e.hitX,.8,e.hitZ,14,5.4,16729943),this.combatText.spawn(this.squad.x,1.6,this.squad.z,`-${t}`,`negative`,.65),this.squad.logicalCount<=0&&this.triggerRunDefeat()}}}}}if(this.stateMachine.state===`RUNNING`){let e=a?this.splitCauseway.dividerTipZ:void 0;for(let n=0;n<vh;n++){let r=this.midBrutes[n];if(!r.active||r.defeated)continue;i&&this.squad.z-r.z>24&&!this.splitCauseway.getClosestRightTarget(24)&&(r.z+=r.speed*1.15*t);let a=i?null:this.findBlockingGateZ(r.z),o=r.update(t,this.squad.x,this.squad.z,this.squad.logicalCount,e,a);if(o){if(this.sceneManager.addShake(.48),this.vfx.spawnShockwave(o.impactX,o.impactZ,3.4,.36,16726092),this.particlePool.spawnBurst(o.impactX,.7,o.impactZ,18,6.2,16729943),o.playerLosses>0&&this.squad.logicalCount>0){let e=Math.min(this.squad.logicalCount,o.playerLosses),t=Math.min(5,e);for(let e=0;e<t;e++)this.ragdollPool.spawnKnockback(this.squad.x,this.squad.z,!1,1.25);this.squad.setLogicalCount(this.squad.logicalCount-e),this.sound.playBossSalvoImpact(!1),this.combatText.spawn(this.squad.x,1.85,this.squad.z,`-${e} MAUL!`,`negative`,.95),this.squad.logicalCount<=0&&this.triggerRunDefeat()}else this.squad.logicalCount>0&&(this.sound.playBossSalvoImpact(!0),this.combatText.spawn(this.squad.x,1.75,this.squad.z,`DODGED!`,`cyan`,.78))}}}if(this.stateMachine.state===`RUNNING`||this.stateMachine.state===`BOSS_FIGHT`){if(this.boss.update(t,this.stateMachine.state===`BOSS_FIGHT`,this.squad.x,this.squad.z,this.squad.logicalCount),this.boss.lastStepSalvoWarning&&(this.sound.playBossSalvoWarning(),this.combatText.spawn(this.squad.x,1.95,this.squad.z-1.2,`DODGE LANE!`,`gold`,.75)),this.boss.lastStepSalvoLaunched&&(this.sceneManager.addShake(.22),this.vfx.spawnShockwave(this.boss.x,this.boss.z+1.4,2.8,.26,16735787)),this.boss.lastStepSalvoHitDamage>0&&this.squad.logicalCount>0){let e=Math.min(this.squad.logicalCount,this.boss.lastStepSalvoHitDamage),t=Math.min(3,e);for(let e=0;e<t;e++)this.ragdollPool.spawnKnockback(this.squad.x,this.squad.z,!1,1.3);this.squad.setLogicalCount(this.squad.logicalCount-e),this.sound.playBossSalvoImpact(!1),this.sceneManager.addShake(.46),this.vfx.spawnShockwave(this.boss.lastStepSalvoHitX,this.squad.z,3.6,.36,16723532),this.particlePool.spawnBurst(this.boss.lastStepSalvoHitX,.9,this.squad.z,20,6.6,16726092),this.combatText.spawn(this.squad.x,1.8,this.squad.z,`-${e} SALVO!`,`negative`,.95),this.squad.logicalCount<=0&&this.triggerRunDefeat()}else this.boss.lastStepSalvoDodgedCount>0&&this.squad.logicalCount>0&&(this.bossSalvosDodgedThisRun+=this.boss.lastStepSalvoDodgedCount,this.sound.playBossSalvoImpact(!0),this.vfx.spawnShockwave(this.boss.lastStepSalvoDodgeX,this.squad.z+.3,2.2,.26,16752451),this.particlePool.spawnBurst(this.boss.lastStepSalvoDodgeX,.6,this.squad.z+.3,10,4.4,16756290),this.combatText.spawn(this.squad.x,1.7,this.squad.z,`DODGED!`,`cyan`,.75));if(this.boss.lastStepTriggeredShake){let e=this.boss.lastStepSlamDamage>0;this.sceneManager.addShake(e?.55:.16),this.vfx.spawnShockwave(this.boss.x,this.boss.z+.4,e?4.2:2.5,e?.38:.28,16729943)}if(this.boss.lastStepSlamDamage>0&&this.squad.logicalCount>0){let e=Math.min(this.squad.logicalCount,this.boss.lastStepSlamDamage),t=Math.min(3,e);for(let e=0;e<t;e++)this.ragdollPool.spawnKnockback(this.squad.x,this.squad.z,!1,1.35);this.squad.setLogicalCount(this.squad.logicalCount-e),this.sound.playEnemyPop(),this.particlePool.spawnBurst(this.squad.x,.9,this.squad.z,18,6.8,16726072),this.combatText.spawn(this.squad.x,1.75,this.squad.z,`-${e} SLAM!`,`negative`),this.squad.logicalCount<=0&&this.triggerRunDefeat()}}if(this.updateBullets(t),this.stateMachine.state===`VICTORY`&&(this.coinFountainTimer-=t,this.coinFountainTimer<=0)){this.coinFountainTimer=.055;for(let e=0;e<3;e++){let t=(this.elapsedTime*7+e*2.1)%(Math.PI*2);this.particlePool.spawn(Math.cos(t)*.8,.9,this.squad.z-5.5,Math.cos(t)*4.5,9.8+e%3*1.4,Math.sin(t)*3.5,-18,1.1,.22,16765286)}}this.particlePool.update(t),this.ragdollPool.update(t),this.sceneManager.updateCamera(t,this.squad.x,this.squad.z,this.computeCameraFramingMode()),this.bridgeEnv.update(t,this.elapsedTime,this.squad.z,this.sceneManager.camera.position)}updateBullets(e){let t=this.bulletPool,n=Eu[this.squad.weaponTier].bossArmorFactor,r=this.saveManager.getData().settings.skinTheme,i=r===`UNICORN`,a=this.activeBoardLayout===`SPLIT_CAUSEWAY`,o=a?46:42;this.bulletSparkTick=this.bulletSparkTick+1&15;let s=0;for(;s<t.activeCount;){let c=t.age[s]+e;if(c>=t.maxAge[s]){t.deactivate(s);continue}let l=t.x[s],u=t.z[s],d=l+t.vx[s]*e,f=u+t.vz[s]*e;if(f<this.squad.z-o){t.deactivate(s);continue}t.age[s]=c,t.x[s]=d,t.z[s]=f;let p=t.weaponTier[s]||this.squad.weaponTier;if(p>=2&&this.particlePool.activeCount<1020&&!(s+this.bulletSparkTick&3)){let e=i?s&1?16770142:yh[(s+this.bulletSparkTick)%yh.length]:s&1?16758840:16769126;this.particlePool.spawn(d,t.y[s],f+.42,(s%3-1)*.45,.35,1.4,-1.5,.14,p>=4?.13:.1,e)}if(a&&this.splitCauseway.checkDividerWallBlock(d,f,l)){this.vfx.spawnImpactSplash(Bd,1.05,f,.55,16769126),this.particlePool.spawnBurst(Bd,1.05,f,2,3.4,16769126,.08,.18),t.deactivate(s);continue}let m=t.damage[s],h=t.lastHitEntityId[s],g=Ou(p,r)?.colorHex??6485247,_=!1;if(a&&!this.splitCauseway.retractedForBoss){let e=this.splitCauseway.tryLeftQueueBulletHit(d,f,u,m,h);if(e.type===`BARREL_HIT`?(t.lastHitEntityId[s]=e.entityId,_=!0,this.vfx.spawnImpactSplash(e.hitX,1.08,e.hitZ,.94,g),this.particlePool.spawnBurst(e.hitX,1.02,e.hitZ,2,4,g,.09,.22)):e.type===`NODE_CLEARED`&&(t.lastHitEntityId[s]=e.entityId,_=!0,this.handleSplitNodeCleared(e.worldX,e.worldZ,e.reward)),!_&&!(f<=this.splitCauseway.dividerTipZ&&d<-.66))for(let e=0;e<vh;e++){let n=this.midBrutes[e];if(!n.active||n.defeated)continue;let r=n.tryBulletHit(d,f,u,m,h,this.squad.z,42);if(r!==`NONE`){t.lastHitEntityId[s]=n.entityId,_=!0,r===`HIT`?(this.vfx.spawnImpactSplash(d,1.55,n.z+.85,1.06,g),this.particlePool.spawnBurst(d,1.5,n.z+.6,3,4.4,g,.11,.24)):r===`DEFEATED`&&this.handleMidBruteDefeated(n);break}}if(!_){let e=this.splitCauseway.tryRightArmyBulletHit(d,f,u,m,h);if(e.status!==`MISS`){if(t.lastHitEntityId[s]=e.entityId,_=!0,e.status===`KILL`){let e=this.splitCauseway.lastKill;this.enemiesDefeatedThisRun+=1,this.sound.playEnemyPop(),this.vfx.spawnImpactSplash(e.x,.96,e.z,e.isHeavy?1.48:1.02,16777215),this.particlePool.spawnBurst(e.x,.96,e.z,e.isHeavy?14:7,e.isHeavy?6.4:4.8,i?2399743:16729943,.15,.38),this.awardLiveCoins(e.coinReward,e.x,e.z,e.isHeavy,e.isHeavy?4:2)}else this.vfx.spawnImpactSplash(d,.94,f,.78,g)}}}else if(!a){for(let e=0;e<mh;e++){let n=this.supplyDrums[e],r=n.tryBulletHit(d,f,u,m,h);if(r!==`NONE`){t.lastHitEntityId[s]=n.entityId,_=!0,r===`HIT`?(this.vfx.spawnImpactSplash(d,1.04,n.z+.95,.92,g),this.particlePool.spawnBurst(d,1,n.z,2,4,g,.09,.22)):r===`SHATTERED`&&this.handleSupplyDrumShattered(n);break}}if(!_)for(let e=0;e<vh;e++){let n=this.midBrutes[e];if(!n.active||n.defeated)continue;let r=n.tryBulletHit(d,f,u,m,h,this.squad.z);if(r!==`NONE`){t.lastHitEntityId[s]=n.entityId,_=!0,r===`HIT`?(this.vfx.spawnImpactSplash(d,1.55,n.z+.85,1.06,g),this.particlePool.spawnBurst(d,1.5,n.z+.6,3,4.4,g,.11,.24)):r===`DEFEATED`&&this.handleMidBruteDefeated(n);break}}if(!_)for(let e=0;e<hh;e++){let n=this.gatePairs[e].tryBulletHit(d,f,u,m,h);if(n){t.lastHitEntityId[s]=n.entityId,_=!0,n.ricochet?(this.sound.playRicochet(),this.vfx.spawnImpactSplash(n.hitX,.52,n.hitZ,.55,16769126),this.particlePool.spawnBurst(n.hitX,.52,n.hitZ,3,4,16769126,.09,.22)):(this.vfx.spawnImpactSplash(n.hitX,.46,n.hitZ,.56,g),this.particlePool.spawnBurst(n.hitX,.48,n.hitZ,2,3.2,g,.09,.2),n.flippedToPositive?(this.gatesFlippedThisRun++,this.sound.playGateFlipChime(),this.sceneManager.addShake(.2),this.vfx.spawnShockwave(n.hitX,n.hitZ,3.2,.38,3601407),this.particlePool.spawnBurst(n.hitX,1.5,n.hitZ,20,6.5,3601407,.18,.55),this.combatText.spawn(n.hitX,2.3,n.hitZ,`${n.formattedLabel}!`,`cyan`,.95)):n.deltaIncrements>0&&this.sound.playGateTick(n.newValue));break}}if(!_)for(let e=0;e<gh;e++){let n=this.tireStacks[e],r=n.tryBulletHit(d,f,u,m,h);if(r!==`NONE`){t.lastHitEntityId[s]=n.entityId,_=!0,r===`HIT`?(this.vfx.spawnImpactSplash(d,1.08,n.z+1.15,.94,g),this.particlePool.spawnBurst(d,.95,n.z,2,4,g,.1,.22)):r===`SHATTERED`&&this.handleTireStackShattered(n);break}}if(!_)for(let e=0;e<_h;e++){let n=this.enemyWaves[e],r=n.tryBulletHit(d,f,u,m,h);if(!(r<0)){if(t.lastHitEntityId[s]=n.entityId,_=!0,r>0&&n.lastKillCount>0){let e=n.lastKills[0];this.enemiesDefeatedThisRun+=r,this.sound.playEnemyPop(),this.vfx.spawnImpactSplash(e.x,.96,e.z,e.isHeavy?1.48:1.02,16777215),this.particlePool.spawnBurst(e.x,.96,e.z,e.isHeavy?14:7,e.isHeavy?6.4:4.8,i?2399743:16729943,.15,.38),this.awardLiveCoins(e.coinReward*r,e.x,e.z,e.isHeavy,e.isHeavy?4:2)}else this.vfx.spawnImpactSplash(d,.94,f,.78,g);break}}}let v=this.boss.active&&!this.boss.defeated&&(this.stateMachine.state===`BOSS_FIGHT`||this.stateMachine.state===`RUNNING`&&this.squad.z-this.boss.z<=28);if(!_&&v){let e=this.boss.tryBulletHit(d,f,u,m,n,h);if(e!==`NONE`){if(t.lastHitEntityId[s]=this.boss.entityId,_=!0,this.vfx.spawnImpactSplash(d,1.45,this.boss.z+.95,1.02,g),this.particlePool.spawnBurst(d,1.4,this.boss.z+.6,3,4.6,g,.12,.26),this.boss.lastStepSegmentBroken){this.sound.playTireBreak(!1),this.sceneManager.addShake(.28),this.vfx.spawnShockwave(this.boss.x,this.boss.z+.5,3.4,.34,16758832),this.spawnGoldConfettiShower(this.boss.x,2.2,this.boss.z+.6,14);let e=this.awardLiveCoins(25,this.boss.x,this.boss.z+.8,!1,5);this.combatText.spawn(this.boss.x,3.9,this.boss.z,`ARMOR BREAK! +${wf(e)}`,`gold`,.78)}e===`DEFEATED`&&this.handleBossDefeated()}}_&&(i&&this.spawnRainbowSparkles(d,1.06,f,3,4.4),--t.pierceLeft[s],t.pierceLeft[s]<=0)?t.deactivate(s):s++}}rainbowSparkCursor=0;spawnRainbowSparkles(e,t,n,r,i=4.6){for(let a=0;a<r;a++){let o=(this.rainbowSparkCursor+a)%yh.length,s=yh[o],c=a/Math.max(1,r)*Math.PI*2+this.elapsedTime*5.3+o*.65,l=i*(.65+a%3*.24);this.particlePool.spawn(e+Math.cos(c)*.14,t,n+Math.sin(c)*.14,Math.cos(c)*l,3.2+a%4*1.15,Math.sin(c)*l*.85,-13.5,.34,.15,s)}this.rainbowSparkCursor=(this.rainbowSparkCursor+r)%yh.length}spawnGoldConfettiShower(e,t,n,r){for(let i=0;i<r;i++){let a=i/r*Math.PI*2+this.elapsedTime*3.1,o=2.6+i%3*1.35;this.particlePool.spawn(e+Math.cos(a)*.25,t,n+Math.sin(a)*.25,Math.cos(a)*o,5.8+i%4*1.15,Math.sin(a)*o*.85,-16.5,.72,.19,i%2==0?16768845:16773273)}}handleSplitNodeCleared(e,t,n){if(this.drumsBrokenThisRun++,this.celebrateHopTimer=.38,this.splitCauseway.triggerSquadCelebration(this.squad.x,this.squad.z),this.sceneManager.addShake(.24),this.vfx.spawnShockwave(e,t,2.8,.36,2685148),this.vfx.spawnImpactSplash(e,1.25,t+.5,1.65,7405544),this.particlePool.spawnBurst(e,1,t,20,6.2,7112356,.18,.5),n.kind===`GATE`){this.gatesFlippedThisRun++;let r=this.squad.logicalCount,i=df(r,n.operator,n.value),a=i-r,o=pf(n.operator,n.value,!0);this.applySquadCountWithOverflow(i,this.squad.x,this.squad.z),this.sound.playGateCollect(!0),this.vfx.spawnShockwave(e,t-1.6,3.1,.36,1635016),this.particlePool.spawnBurst(this.squad.x,1.15,this.squad.z,18,5.8,2685148,.16,.48);let s=a>0?` (+${a})`:``;this.combatText.spawn(this.squad.x,2.05,this.squad.z,`${o}!${s}`,`positive`,1.02)}else n.kind===`WEAPON`?(this.sound.playTireBreak(!1),this.flyingWeapons.launch(n.weaponTier,e,2.35,t-1.5)):(this.sound.playTireBreak(!1),this.spawnGoldConfettiShower(e,1.45,t,12),this.awardLiveCoins(n.coins,e,t,!0,5))}handleMidBruteDefeated(e){this.enemiesDefeatedThisRun+=1,this.sound.playBossDefeat(),this.sceneManager.addShake(.56);let t=this.saveManager.getData().settings.skinTheme===`UNICORN`,n=t?1929471:16723548;this.vfx.spawnShockwave(e.x,e.z,5.2,.5,n),this.vfx.spawnImpactSplash(e.x,1.8,e.z,2.2,16760379),this.particlePool.spawnBurst(e.x,1.7,e.z,34,8.4,n,.22,.72),t&&this.spawnRainbowSparkles(e.x,2,e.z,20,7.6),this.spawnGoldConfettiShower(e.x,1.8,e.z,18);let r=this.awardLiveCoins(e.coinReward,e.x,e.z,!1,7);this.combatText.spawn(e.x,2.7,e.z,`${t?`WAR-UNICORN DOWN!`:`GOLIATH DOWN!`} +${wf(r)}`,`gold`,1.15)}applyWeaponDrop(e,t,n){let r=this.saveManager.getData().settings.skinTheme,i=ku(this.squad.weaponTier,e,r);if(this.sound.playTireBreak(i.upgraded),i.upgraded){this.squad.weaponTier=i.equippedTier;let e=Ou(i.equippedTier,r).colorHex;this.particlePool.spawnBurst(this.squad.x,1.2,this.squad.z,20,6,e,.18,.55),this.combatText.spawn(t,2.15,n,i.bannerText,i.equippedTier===5?`cyan`:`gold`,1.1)}else{this.weaponLocksThisRun++;let e=this.awardLiveCoins(i.bonusCoins,t,n,!1,4);this.applySquadCountWithOverflow(this.squad.logicalCount+i.bonusSquad,t,n),this.spawnGoldConfettiShower(t,1.4,n,12),this.combatText.spawn(t,2.25,n,`${r===`UNICORN`?`MAGIC LOCK!`:`WEAPON LOCK!`} +${wf(e)}`,`gold`,1.1)}}handleSupplyDrumShattered(e){this.drumsBrokenThisRun++,this.sceneManager.addShake(.24);let t=this.saveManager.getData().settings.skinTheme===`UNICORN`;if(this.vfx.spawnShockwave(e.x,e.z,2.7,.34,t?16735416:2685148),this.vfx.spawnImpactSplash(e.x,1.25,e.z+.5,1.6,t?16755432:7405544),this.particlePool.spawnBurst(e.x,1,e.z,20,6.2,t?14257384:7112356,.18,.5),e.rewardType===`COINS`)this.sound.playTireBreak(!1),this.spawnGoldConfettiShower(e.x,1.45,e.z,12),this.awardLiveCoins(e.rewardValue,e.x,e.z,!0,4);else if(e.rewardType===`RECRUIT`){this.sound.playGateCollect(!0),this.particlePool.spawnBurst(e.x,1.4,e.z,18,5.5,t?16737988:3733247,.18,.55),this.applySquadCountWithOverflow(this.squad.logicalCount+e.rewardValue,e.x,e.z);let n=t?`PINK GIRL`:`COMMANDO`;this.combatText.spawn(e.x,2.05,e.z,`+${e.rewardValue} ${n}${e.rewardValue>1?`S`:``}!`,`positive`,1)}else{let t=Math.max(1,Math.min(5,Math.round(e.rewardValue)));this.sound.playTireBreak(!1),this.flyingWeapons.launch(t,e.x,2.35,e.z)}}handleTireStackShattered(e){this.tiresBrokenThisRun++,this.sceneManager.addShake(.38);let t=this.saveManager.getData().settings.skinTheme,n=e.weaponTier?Ou(e.weaponTier,t).colorHex:16766023;this.vfx.spawnCartoonFireball(e.x,1.18,e.z,2.35),this.vfx.spawnShockwave(e.x,e.z,3.9,.44,n),this.vfx.spawnShockwave(e.x,e.z,2.5,.28,16742946),this.vfx.spawnImpactSplash(e.x,1.35,e.z+.8,1.75,n),this.vfx.spawnTireDebris(e.x,e.z,6),this.particlePool.spawnBurst(e.x,1.1,e.z,24,6.8,16747556,.2,.55),e.weaponTier===null?(this.sound.playTireBreak(!1),this.spawnGoldConfettiShower(e.x,1.5,e.z,14),this.awardLiveCoins(e.coinReward,e.x,e.z,!0,5)):(this.sound.playTireBreak(!1),this.flyingWeapons.launch(e.weaponTier,e.x,2.45,e.z))}endlessSplitClearedMeters=0;handleBossDefeated(){let e=this.saveManager.getData(),t=e.settings.skinTheme===`UNICORN`;if(t?this.sound.playUnicornVictoryFanfare():this.sound.playBossDefeat(),this.sceneManager.addShake(.68),this.vfx.spawnShockwave(this.boss.x,this.boss.z,6.5,.62,t?16732072:16756290),this.vfx.spawnShockwave(this.boss.x,this.boss.z,4.2,.44,t?2399743:16726092),t?(this.spawnRainbowSparkles(this.boss.x,2.3,this.boss.z,36,9.2),this.spawnGoldConfettiShower(this.boss.x,2.1,this.boss.z,24)):(this.particlePool.spawnBurst(this.boss.x,2,this.boss.z,46,9.5,16756290,.26,.85),this.particlePool.spawnBurst(this.boss.x,2.2,this.boss.z,32,8,16726092,.24,.75)),e.selectedMode===`ENDLESS`){this.endlessWave===1&&(this.endlessSplitClearedMeters=0),this.activeBoardLayout===`SPLIT_CAUSEWAY`&&(this.endlessSplitClearedMeters+=this.activeStageDef.trackLength);let e=this.awardLiveCoins(this.boss.rewardCoins,0,this.squad.z-4,!1,8);this.hud.flushDisplayedCoins(this.saveManager.getData().coins,this.liveCoinsThisRun);let n=this.endlessWave;this.combatText.spawn(0,2.6,this.squad.z-4,`WAVE ${n} CLEARED! +${wf(e)}`,`gold`,1.3),t&&this.hud.triggerEndlessUnicornFlyby(n),this.endlessWave+=1,this.sectorBaseZ=this.squad.z,this.activeStageDef=_u(this.endlessWave),this.populateSectorEntities(this.activeStageDef,this.sectorBaseZ),this.stateMachine.transitionTo(`RUNNING`);return}let n=this.finalizeRunRewards(`VICTORY`,!0);this.pendingSummary=n,this.stateMachine.transitionTo(`VICTORY`),t?this.hud.triggerUnicornVictoryCelebration(n):this.hud.showSummaryModal(n)}triggerRunDefeat(){if(this.stateMachine.state===`DEFEAT`||this.stateMachine.state===`VICTORY`)return;this.squad.setLogicalCount(0),this.sceneManager.addShake(.55);let e=this.finalizeRunRewards(`DEFEAT`,!1);this.pendingSummary=e,this.stateMachine.transitionTo(`DEFEAT`)}finalizeRunRewards(e,t){let n=this.saveManager.getData(),r=t?1:this.computeSectorProgressRatio(),i=this.computeRunDistanceMeters()+(n.selectedMode===`ENDLESS`&&this.endlessWave>1?this.endlessSplitClearedMeters:0),a=n.selectedMode===`ENDLESS`?i/1160:t?1:r,o=n.selectedMode===`ENDLESS`?this.endlessWave:n.selectedMode===`SPLIT_CAUSEWAY`?n.splitCausewayStage:n.selectedStage,s=Sf({progressRatio:a,stageNumber:this.activeStageDef.stageNumber,enemiesDefeated:0,bonusCoinsCollected:0,bossRewardCoins:this.boss.rewardCoins,clearedStage:t,warChestLevel:n.upgrades.warChest}),c=this.liveCoinsThisRun+s.totalCoinsEarned,l={outcome:e,mode:n.selectedMode,stageNumber:o,distanceMeters:t&&n.selectedMode!==`ENDLESS`?this.activeStageDef.trackLength:i,progressRatio:r,enemiesDefeated:this.enemiesDefeatedThisRun,drumsBroken:this.drumsBrokenThisRun,gatesFlipped:this.gatesFlippedThisRun,peakSquad:this.squad.peakCount,liveCoinsEarned:this.liveCoinsThisRun,distanceCoins:s.distanceCoins,killCoins:s.killCoins,bonusCoins:s.bonusCoins,warChestMultiplier:s.warChestMultiplier,totalCoinsEarned:c},u=this.saveManager.update(e=>{e.coins+=s.totalCoinsEarned,e.highScoreSquad=Math.max(e.highScoreSquad,this.squad.peakCount),e.selectedMode===`ENDLESS`?e.bestEndlessDistance=Math.max(e.bestEndlessDistance,Math.round(i)):e.selectedMode===`SPLIT_CAUSEWAY`?(t&&(e.splitCausewayStage+=1),e.bestSplitStage=Math.max(e.bestSplitStage,e.splitCausewayStage)):t&&(e.selectedStage>=e.unlockedStage&&e.unlockedStage<10&&(e.unlockedStage+=1),e.selectedStage<10&&(e.selectedStage+=1))});return this.hud.flushDisplayedCoins(u.coins,this.liveCoinsThisRun),l}renderFrame(e){this.stateMachine.tickRealTime(e)&&this.pendingSummary&&this.hud.showSummaryModal(this.pendingSummary);let t=this.stateMachine.state,n=t===`RUNNING`||t===`BOSS_FIGHT`,r=t===`PRE_RUN`?this.hubPreviewWeaponTier:this.squad.weaponTier,i=this.celebrateHopTimer>0?1-this.celebrateHopTimer/.42:0;if(this.batchRenderer.syncPlayerSoldiers(this.squad.logicalCount,this.squad.soldierWorldX,this.squad.soldierWorldZ,this.squad.marchPhase,n,r,this.squad.steerBankAngle,this.squad.recoilImpulse,this.squad.barrelSpinAngle,this.commandoFacingYaw,i,this.squad.legStrafeYaw,this.squad.strafeSpeed),this.batchRenderer.beginEnemyFrame(),this.activeBoardLayout===`SPLIT_CAUSEWAY`)this.splitCauseway.pushInstances(this.batchRenderer,n);else for(let e=0;e<_h;e++)this.enemyWaves[e].pushInstances(this.batchRenderer,n);this.batchRenderer.finishEnemyFrame(),this.batchRenderer.syncRagdolls(this.ragdollPool),this.batchRenderer.syncBullets(this.bulletPool),this.batchRenderer.syncParticles(this.particlePool),this.hud.getCoinPillNdc(this.coinTargetNdc),this.vfx.updateAndSync(e*this.stateMachine.timeScale,this.sceneManager.camera,this.coinTargetNdc.x,this.coinTargetNdc.y,this.handleMagnetCoinArrived),this.sceneManager.render();let a=this.saveManager.getData(),o=this.computeSectorProgressRatio();this.hud.updateTrackProgress(o,a.selectedMode,this.computeRunDistanceMeters(),this.endlessWave,a.splitCausewayStage);let s=t===`PAUSED`?this.stateMachine.resumeTargetState:t,c=s===`RUNNING`&&this.boss.active&&(this.boss.currentHp<this.boss.maxHp-.01||this.squad.z-this.boss.z<=28),l=this.boss.active&&!this.boss.defeated&&(s===`BOSS_FIGHT`||c);this.hud.updateWorldOverlays(this.sceneManager,t,this.squad.x,this.squad.z,this.squad.logicalCount,this.squad.weaponTier,this.enemyWaves,l,this.boss.name,this.boss.currentHp,this.boss.maxHp,this.boss.segments,this.splitCauseway),t!==`PAUSED`&&(this.combatText.update(e,this.sceneManager),this.hud.tickCelebrationOverlay(e))}advanceSimulation(e,t,n=!1){let r=1/60,i=Math.max(1,Math.round(e/r));this.hud.getCoinPillNdc(this.coinTargetNdc);for(let e=0;e<i;e++){if(typeof t==`number`){let e=t-this.squad.x;this.simulatedSteerDelta=Math.sign(e)*Math.min(Math.abs(e),15*r)}else this.simulatedSteerDelta=0;this.fixedUpdate(r),e<i-1&&(this.vfx.updateAndSync(r*this.stateMachine.timeScale,this.sceneManager.camera,this.coinTargetNdc.x,this.coinTargetNdc.y,this.handleMagnetCoinArrived),this.stateMachine.state!==`PAUSED`&&(this.combatText.update(r,this.sceneManager),this.hud.tickCelebrationOverlay(r)),this.stateMachine.tickRealTime(r)&&this.pendingSummary&&this.hud.showSummaryModal(this.pendingSummary))}return n?(this.vfx.updateAndSync(r*this.stateMachine.timeScale,this.sceneManager.camera,this.coinTargetNdc.x,this.coinTargetNdc.y,this.handleMagnetCoinArrived),this.stateMachine.state!==`PAUSED`&&this.hud.tickCelebrationOverlay(r),this.stateMachine.tickRealTime(r)&&this.pendingSummary&&this.hud.showSummaryModal(this.pendingSummary)):this.renderFrame(r),this.getTelemetrySnapshot()}getTelemetrySnapshot(){let e=this.saveManager.getData(),t=this.computeSectorProgressRatio(),n=this.getPrimaryBruteTelemetry(),r=e.selectedMode===`ENDLESS`?this.endlessWave:e.selectedMode===`SPLIT_CAUSEWAY`?e.splitCausewayStage:e.selectedStage,i=this.boss.getRecommendedSafeLaneX(this.squad.x);if(i===null&&this.stateMachine.state===`RUNNING`)for(let e=0;e<vh;e++){let t=this.midBrutes[e].getActiveDangerSmashX();if(t!==null&&this.squad.z-this.midBrutes[e].z<=12){i=t>=0?-2.45:3.15;break}}let a=null;if(this.activeBoardLayout===`SPLIT_CAUSEWAY`&&!this.splitCauseway.retractedForBoss){let e=this.splitCauseway.getClosestRightTarget(64);e&&(a=e.z);for(let e=0;e<vh;e++){let t=this.midBrutes[e];t.active&&!t.defeated&&t.z>=this.sectorBaseZ-64&&(a===null||t.z>a)&&(a=t.z)}}return{state:this.stateMachine.state,mode:e.selectedMode,boardLayout:this.activeBoardLayout,skinTheme:e.settings.skinTheme,stage:r,coins:e.coins,liveCoinsThisRun:this.liveCoinsThisRun,logicalSquad:this.squad.logicalCount,visualSquad:Math.min(this.squad.logicalCount,40),squadX:this.squad.x,squadZ:this.squad.z,progress:t,weaponTier:this.squad.weaponTier,weaponBadge:Ou(this.squad.weaponTier,e.settings.skinTheme).shortBadge,bossHp:this.boss.currentHp,bossMaxHp:this.boss.maxHp,bruteHp:n.hp,bruteMaxHp:n.maxHp,marchHaltedByBrute:this.stateMachine.state===`RUNNING`&&this.isAnyBruteHaltingMarch(this.squad.z),recommendedDodgeX:i,splitQueueRemaining:this.activeBoardLayout===`SPLIT_CAUSEWAY`?this.splitCauseway.getQueueRemaining():0,splitRightAlive:this.activeBoardLayout===`SPLIT_CAUSEWAY`?this.splitCauseway.rightAliveCount:0,splitClosestThreatZ:a,drumsBrokenThisRun:this.drumsBrokenThisRun,gatesFlippedThisRun:this.gatesFlippedThisRun,tiresBrokenThisRun:this.tiresBrokenThisRun,weaponLocksTriggeredThisRun:this.weaponLocksThisRun,enemiesDefeatedThisRun:this.enemiesDefeatedThisRun,bossSalvosDodgedThisRun:this.bossSalvosDodgedThisRun,activeBullets:this.bulletPool.activeCount,activeParticles:this.particlePool.activeCount,upgrades:{...e.upgrades}}}getDebugProbe(){let e=Math.min(this.squad.logicalCount,40),t=this.squad.x,n=this.squad.x;if(e>0){t=1/0,n=-1/0;for(let r=0;r<e;r++){let e=this.squad.soldierWorldX[r];e<t&&(t=e),e>n&&(n=e)}}let r=0,i=0,a=0,o=this.bulletPool.activeCount;for(let e=0;e<o;e++){let t=this.bulletPool.x[e],n=Math.abs(this.bulletPool.vx[e]),o=Math.abs(t);r+=t,n>i&&(i=n),o>a&&(a=o)}let s=null,c=null,l=null;if(this.activeBoardLayout!==`SPLIT_CAUSEWAY`)for(let e=0;e<hh;e++){let t=this.gatePairs[e];if(!(!t.active||t.triggered||t.z>this.squad.z+1.5)){(s===null||t.z>s)&&(s=t.z,l=t);for(let e=0;e<_h;e++){let n=this.enemyWaves[e];if(!n.active||n.aliveCount<=0||n.z>t.z+2)continue;let r=t.z-n.z;(c===null||r<c)&&(c=r)}}}let u=0,d=null,f=0;if(this.activeBoardLayout!==`SPLIT_CAUSEWAY`)for(let e=0;e<mh;e++){let t=this.supplyDrums[e];t.active&&!t.broken&&(t.isRolling&&u++,t.z<=this.squad.z+2&&(d===null||t.z>d)&&(d=t.z,f=t.rollAngleX))}this.sceneManager.camera.updateMatrixWorld();let p=this.sceneManager.camera.matrixWorld.elements,m=Math.asin(Math.max(-1,Math.min(1,p[9])))*(180/Math.PI);return this.sceneManager.projectToScreen(-6.86,.55,this.squad.z,this.debugProjLeft),this.sceneManager.projectToScreen(6.86,.55,this.squad.z,this.debugProjRight),{commandoFacingYaw:this.commandoFacingYaw,legStrafeYaw:this.squad.legStrafeYaw,strafeSpeed:this.squad.strafeSpeed,minSoldierX:t,maxSoldierX:n,squadWidth:n-t,meanBulletX:o>0?r/o:null,maxBulletAbsVx:i,maxBulletAbsX:a,cameraX:this.sceneManager.camera.position.x,cameraY:this.sceneManager.camera.position.y,cameraDeltaZ:this.sceneManager.camera.position.z-this.squad.z,cameraFov:this.sceneManager.camera.fov,cameraPitchDeg:m,leftGuardrailScreenX:this.debugProjLeft.x,rightGuardrailScreenX:this.debugProjRight.x,viewportWidth:window.innerWidth,splitDividerX:Bd,splitFrontLeftBarrelHp:this.splitCauseway.getFrontLeftBarrelHp(),nextUncollectedGateZ:s,minBehindGateWaveDist:c,nextGateDebug:l?l.getDebugValues():null,activeRollingBarrels:u,frontBarrelZ:d,frontBarrelRotX:f,activeFlyingWeapons:this.flyingWeapons.activeCount,activeMagnetCoins:this.vfx.activeMagnetCoinCount,activeTireDebris:this.vfx.activeTireDebrisCount,activeFireballs:this.vfx.activeFireballCount}}};j();var xh=new bh;window.__BRIDGE_BLITZ__={getSnapshot:()=>xh.getTelemetrySnapshot(),getProbe:()=>xh.getDebugProbe(),step:(e,t,n)=>xh.advanceSimulation(e,t,n)};export{y as n,o as r,v as t};