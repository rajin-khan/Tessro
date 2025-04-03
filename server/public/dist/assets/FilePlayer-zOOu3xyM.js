import{r as q,a as G,b as X,g as W}from"./index-BjOBMk5G.js";function z(u,h){for(var f=0;f<h.length;f++){const p=h[f];if(typeof p!="string"&&!Array.isArray(p)){for(const d in p)if(d!=="default"&&!(d in u)){const y=Object.getOwnPropertyDescriptor(p,d);y&&Object.defineProperty(u,d,y.get?y:{enumerable:!0,get:()=>p[d]})}}}return Object.freeze(Object.defineProperty(u,Symbol.toStringTag,{value:"Module"}))}var S,A;function J(){if(A)return S;A=1;var u=Object.create,h=Object.defineProperty,f=Object.getOwnPropertyDescriptor,p=Object.getOwnPropertyNames,d=Object.getPrototypeOf,y=Object.prototype.hasOwnProperty,I=(s,e,t)=>e in s?h(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t,D=(s,e)=>{for(var t in e)h(s,t,{get:e[t],enumerable:!0})},b=(s,e,t,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of p(e))!y.call(s,o)&&o!==t&&h(s,o,{get:()=>e[o],enumerable:!(r=f(e,o))||r.enumerable});return s},w=(s,e,t)=>(t=s!=null?u(d(s)):{},b(!s||!s.__esModule?h(t,"default",{value:s,enumerable:!0}):t,s)),M=s=>b(h({},"__esModule",{value:!0}),s),i=(s,e,t)=>(I(s,typeof e!="symbol"?e+"":e,t),t),_={};D(_,{default:()=>g}),S=M(_);var P=w(q()),a=G(),v=X();const E=typeof navigator<"u",k=E&&navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1,O=E&&(/iPad|iPhone|iPod/.test(navigator.userAgent)||k)&&!window.MSStream,U=E&&/^((?!chrome|android).)*safari/i.test(navigator.userAgent)&&!window.MSStream,F="https://cdn.jsdelivr.net/npm/hls.js@VERSION/dist/hls.min.js",N="Hls",j="https://cdnjs.cloudflare.com/ajax/libs/dashjs/VERSION/dash.all.min.js",H="dashjs",V="https://cdn.jsdelivr.net/npm/flv.js@VERSION/dist/flv.min.js",T="flvjs",C=/www\.dropbox\.com\/.+/,m=/https:\/\/watch\.cloudflarestream\.com\/([a-z0-9]+)/,B="https://videodelivery.net/{id}/manifest/video.m3u8";class g extends P.Component{constructor(){super(...arguments),i(this,"onReady",(...e)=>this.props.onReady(...e)),i(this,"onPlay",(...e)=>this.props.onPlay(...e)),i(this,"onBuffer",(...e)=>this.props.onBuffer(...e)),i(this,"onBufferEnd",(...e)=>this.props.onBufferEnd(...e)),i(this,"onPause",(...e)=>this.props.onPause(...e)),i(this,"onEnded",(...e)=>this.props.onEnded(...e)),i(this,"onError",(...e)=>this.props.onError(...e)),i(this,"onPlayBackRateChange",e=>this.props.onPlaybackRateChange(e.target.playbackRate)),i(this,"onEnablePIP",(...e)=>this.props.onEnablePIP(...e)),i(this,"onDisablePIP",e=>{const{onDisablePIP:t,playing:r}=this.props;t(e),r&&this.play()}),i(this,"onPresentationModeChange",e=>{if(this.player&&(0,a.supportsWebKitPresentationMode)(this.player)){const{webkitPresentationMode:t}=this.player;t==="picture-in-picture"?this.onEnablePIP(e):t==="inline"&&this.onDisablePIP(e)}}),i(this,"onSeek",e=>{this.props.onSeek(e.target.currentTime)}),i(this,"mute",()=>{this.player.muted=!0}),i(this,"unmute",()=>{this.player.muted=!1}),i(this,"renderSourceElement",(e,t)=>typeof e=="string"?P.default.createElement("source",{key:t,src:e}):P.default.createElement("source",{key:t,...e})),i(this,"renderTrack",(e,t)=>P.default.createElement("track",{key:t,...e})),i(this,"ref",e=>{this.player&&(this.prevPlayer=this.player),this.player=e})}componentDidMount(){this.props.onMount&&this.props.onMount(this),this.addListeners(this.player);const e=this.getSource(this.props.url);e&&(this.player.src=e),(O||this.props.config.forceDisableHls)&&this.player.load()}componentDidUpdate(e){this.shouldUseAudio(this.props)!==this.shouldUseAudio(e)&&(this.removeListeners(this.prevPlayer,e.url),this.addListeners(this.player)),this.props.url!==e.url&&!(0,a.isMediaStream)(this.props.url)&&!(this.props.url instanceof Array)&&(this.player.srcObject=null)}componentWillUnmount(){this.player.removeAttribute("src"),this.removeListeners(this.player),this.hls&&this.hls.destroy()}addListeners(e){const{url:t,playsinline:r}=this.props;e.addEventListener("play",this.onPlay),e.addEventListener("waiting",this.onBuffer),e.addEventListener("playing",this.onBufferEnd),e.addEventListener("pause",this.onPause),e.addEventListener("seeked",this.onSeek),e.addEventListener("ended",this.onEnded),e.addEventListener("error",this.onError),e.addEventListener("ratechange",this.onPlayBackRateChange),e.addEventListener("enterpictureinpicture",this.onEnablePIP),e.addEventListener("leavepictureinpicture",this.onDisablePIP),e.addEventListener("webkitpresentationmodechanged",this.onPresentationModeChange),this.shouldUseHLS(t)||e.addEventListener("canplay",this.onReady),r&&(e.setAttribute("playsinline",""),e.setAttribute("webkit-playsinline",""),e.setAttribute("x5-playsinline",""))}removeListeners(e,t){e.removeEventListener("canplay",this.onReady),e.removeEventListener("play",this.onPlay),e.removeEventListener("waiting",this.onBuffer),e.removeEventListener("playing",this.onBufferEnd),e.removeEventListener("pause",this.onPause),e.removeEventListener("seeked",this.onSeek),e.removeEventListener("ended",this.onEnded),e.removeEventListener("error",this.onError),e.removeEventListener("ratechange",this.onPlayBackRateChange),e.removeEventListener("enterpictureinpicture",this.onEnablePIP),e.removeEventListener("leavepictureinpicture",this.onDisablePIP),e.removeEventListener("webkitpresentationmodechanged",this.onPresentationModeChange),this.shouldUseHLS(t)||e.removeEventListener("canplay",this.onReady)}shouldUseAudio(e){return e.config.forceVideo||e.config.attributes.poster?!1:v.AUDIO_EXTENSIONS.test(e.url)||e.config.forceAudio}shouldUseHLS(e){return U&&this.props.config.forceSafariHLS||this.props.config.forceHLS?!0:O||this.props.config.forceDisableHls?!1:v.HLS_EXTENSIONS.test(e)||m.test(e)}shouldUseDASH(e){return v.DASH_EXTENSIONS.test(e)||this.props.config.forceDASH}shouldUseFLV(e){return v.FLV_EXTENSIONS.test(e)||this.props.config.forceFLV}load(e){const{hlsVersion:t,hlsOptions:r,dashVersion:o,flvVersion:L}=this.props.config;if(this.hls&&this.hls.destroy(),this.dash&&this.dash.reset(),this.shouldUseHLS(e)&&(0,a.getSDK)(F.replace("VERSION",t),N).then(n=>{if(this.hls=new n(r),this.hls.on(n.Events.MANIFEST_PARSED,()=>{this.props.onReady()}),this.hls.on(n.Events.ERROR,(l,c)=>{this.props.onError(l,c,this.hls,n)}),m.test(e)){const l=e.match(m)[1];this.hls.loadSource(B.replace("{id}",l))}else this.hls.loadSource(e);this.hls.attachMedia(this.player),this.props.onLoaded()}),this.shouldUseDASH(e)&&(0,a.getSDK)(j.replace("VERSION",o),H).then(n=>{this.dash=n.MediaPlayer().create(),this.dash.initialize(this.player,e,this.props.playing),this.dash.on("error",this.props.onError),parseInt(o)<3?this.dash.getDebug().setLogToBrowserConsole(!1):this.dash.updateSettings({debug:{logLevel:n.Debug.LOG_LEVEL_NONE}}),this.props.onLoaded()}),this.shouldUseFLV(e)&&(0,a.getSDK)(V.replace("VERSION",L),T).then(n=>{this.flv=n.createPlayer({type:"flv",url:e}),this.flv.attachMediaElement(this.player),this.flv.on(n.Events.ERROR,(l,c)=>{this.props.onError(l,c,this.flv,n)}),this.flv.load(),this.props.onLoaded()}),e instanceof Array)this.player.load();else if((0,a.isMediaStream)(e))try{this.player.srcObject=e}catch{this.player.src=window.URL.createObjectURL(e)}}play(){const e=this.player.play();e&&e.catch(this.props.onError)}pause(){this.player.pause()}stop(){this.player.removeAttribute("src"),this.dash&&this.dash.reset()}seekTo(e,t=!0){this.player.currentTime=e,t||this.pause()}setVolume(e){this.player.volume=e}enablePIP(){this.player.requestPictureInPicture&&document.pictureInPictureElement!==this.player?this.player.requestPictureInPicture():(0,a.supportsWebKitPresentationMode)(this.player)&&this.player.webkitPresentationMode!=="picture-in-picture"&&this.player.webkitSetPresentationMode("picture-in-picture")}disablePIP(){document.exitPictureInPicture&&document.pictureInPictureElement===this.player?document.exitPictureInPicture():(0,a.supportsWebKitPresentationMode)(this.player)&&this.player.webkitPresentationMode!=="inline"&&this.player.webkitSetPresentationMode("inline")}setPlaybackRate(e){try{this.player.playbackRate=e}catch(t){this.props.onError(t)}}getDuration(){if(!this.player)return null;const{duration:e,seekable:t}=this.player;return e===1/0&&t.length>0?t.end(t.length-1):e}getCurrentTime(){return this.player?this.player.currentTime:null}getSecondsLoaded(){if(!this.player)return null;const{buffered:e}=this.player;if(e.length===0)return 0;const t=e.end(e.length-1),r=this.getDuration();return t>r?r:t}getSource(e){const t=this.shouldUseHLS(e),r=this.shouldUseDASH(e),o=this.shouldUseFLV(e);if(!(e instanceof Array||(0,a.isMediaStream)(e)||t||r||o))return C.test(e)?e.replace("www.dropbox.com","dl.dropboxusercontent.com"):e}render(){const{url:e,playing:t,loop:r,controls:o,muted:L,config:n,width:l,height:c}=this.props,x=this.shouldUseAudio(this.props)?"audio":"video",K={width:l==="auto"?l:"100%",height:c==="auto"?c:"100%"};return P.default.createElement(x,{ref:this.ref,src:this.getSource(e),style:K,preload:"auto",autoPlay:t||void 0,controls:o,muted:L,loop:r,...n.attributes},e instanceof Array&&e.map(this.renderSourceElement),n.tracks.map(this.renderTrack))}}return i(g,"displayName","FilePlayer"),i(g,"canPlay",v.canPlay.file),S}var R=J();const $=W(R),Z=z({__proto__:null,default:$},[R]);export{Z as F};
