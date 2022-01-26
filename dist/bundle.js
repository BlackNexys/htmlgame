(()=>{"use strict";class t{constructor({gameArea:t,spriteSrc:i="./assets/null.png"}){this.width=64,this.height=64,this.sprite=new Image,this.spriteSrc=i,this.gameArea=t,this.sprite.src=this.spriteSrc}spawn({x:t,y:i}){this.x=t,this.y=i,this.x2=this.x+this.width,this.y2=this.y+this.height}render(){this.x2=this.x+this.width,this.y2=this.y+this.height,this.gameArea.context.drawImage(this.sprite,this.x,this.y,this.width,this.height)}}class i extends t{constructor(t){var i=function(t,i){var s={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&i.indexOf(e)<0&&(s[e]=t[e]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var h=0;for(e=Object.getOwnPropertySymbols(t);h<e.length;h++)i.indexOf(e[h])<0&&Object.prototype.propertyIsEnumerable.call(t,e[h])&&(s[e[h]]=t[e[h]])}return s}(t,[]);super(Object.assign({spriteSrc:"./assets/wall.png"},i))}}class s{constructor({x:t,y:i}){this.x=t,this.y=i}}class e{constructor({TL:t,TR:i,TC:s,BL:e,BR:h,BC:n,CL:o,CR:c}){this.TL=t,this.TR=i,this.TC=s,this.BL=e,this.BR=h,this.BC=n,this.CL=o,this.CR=c}}class h{}class n extends t{constructor(){super(...arguments),this.movement=8,this.isJumping=!1,this.fallAccel=-1,this.fallSpeed=0,this.cords=new e({TL:new s({x:this.x,y:this.y}),TR:new s({x:this.x2,y:this.y}),TC:new s({x:this.x2-this.width/2,y:this.y}),BL:new s({x:this.x,y:this.y2}),BR:new s({x:this.x2,y:this.y2}),BC:new s({x:this.x2-this.width/2,y:this.y2}),CL:new s({x:this.x,y:this.y2-this.height/2}),CR:new s({x:this.x2,y:this.y2-this.height/2})}),this.collisions=new h}jump(){this.collisions.top||(this.fallSpeed=this.fallSpeed-4,this.y=this.y-2*this.height)}checkCollisions(t){const i=[this.x-128,this.x2+128,this.y-128,this.y2+128];this.cords=new e({TL:new s({x:this.x,y:this.y}),TR:new s({x:this.x2,y:this.y}),TC:new s({x:this.x2-this.width/2,y:this.y}),BL:new s({x:this.x,y:this.y2}),BR:new s({x:this.x2,y:this.y2}),BC:new s({x:this.x2-this.width/2,y:this.y2}),CL:new s({x:this.x,y:this.y2-this.height/2}),CR:new s({x:this.x2,y:this.y2-this.height/2})});const h=t.filter((t=>this!=t&&t.x>i[0]&&t.x2<i[1]&&t.y>i[2]&&t.y2<i[3])).map(((t,i)=>new e({TL:new s({x:t.x,y:t.y}),TR:new s({x:t.x2,y:t.y}),TC:new s({x:t.x2-t.width/2,y:t.y}),BL:new s({x:t.x,y:t.y2}),BR:new s({x:t.x2,y:t.y2}),BC:new s({x:t.x2-t.width/2,y:t.y2}),CL:new s({x:t.x,y:t.y2-t.height/2}),CR:new s({x:t.x2,y:t.y2-t.height/2})})));this.collisions.top=h.filter((t=>t.BL.x<=this.cords.TC.x&&t.BR.x>=this.cords.TC.x&&this.cords.TC.y==t.BC.y)).length>0,this.collisions.bottom=h.filter((t=>t.TL.x<=this.cords.BC.x&&t.TR.x>=this.cords.BC.x&&this.cords.BC.y==t.TC.y)).length>0,this.collisions.left=h.filter((t=>!1)).length>0,this.collisions.right=h.filter((t=>t.BL.x>this.cords.TC.x&&t.BR.x<this.cords.TC.x&&this.cords.TC.y==t.BC.y)).length>0,this.gravityHandler(h)}gravityHandler(t){if(this.collisions.bottom)this.fallSpeed=0;else{this.fallSpeed=this.fallSpeed+1;const i=this.y-Math.max(this.fallAccel*this.fallSpeed^2,-16),s=t.filter((t=>t.TL.x<=this.cords.BC.x&&t.TR.x>=this.cords.BC.x&&t.TC.y>=i+this.height));this.y=s.length>0?s[0].TC.y-this.height:i}}moveX(t){!t||this.collisions.right?t||this.collisions.left||(this.x=this.x+this.movement):this.x=this.x-this.movement}render(){return t=this,i=void 0,e=function*(){this.x2=this.x+this.width,this.y2=this.y+this.height,this.gameArea.context.drawImage(this.sprite,this.x,this.y,this.width,this.height)},new((s=void 0)||(s=Promise))((function(h,n){function o(t){try{r(e.next(t))}catch(t){n(t)}}function c(t){try{r(e.throw(t))}catch(t){n(t)}}function r(t){var i;t.done?h(t.value):(i=t.value,i instanceof s?i:new s((function(t){t(i)}))).then(o,c)}r((e=e.apply(t,i||[])).next())}));var t,i,s,e}}class o extends n{constructor(t){var i=function(t,i){var s={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&i.indexOf(e)<0&&(s[e]=t[e]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var h=0;for(e=Object.getOwnPropertySymbols(t);h<e.length;h++)i.indexOf(e[h])<0&&Object.prototype.propertyIsEnumerable.call(t,e[h])&&(s[e[h]]=t[e[h]])}return s}(t,[]);super(Object.assign({spriteSrc:"./assets/ghostman idel/pixil-frame-0.png"},i))}init(){window.addEventListener("keydown",(t=>{this.keyHandler({code:t.code})}),!1),window.addEventListener("keyup",(t=>{this.keyHandler({code:t.code})}),!1)}keyHandler({code:t}){switch(t){case"KeyS":case"ArrowDown":break;case"KeyW":case"ArrowUp":this.jump();break;case"KeyA":case"ArrowLeft":this.moveX(!0);break;case"KeyD":case"ArrowRight":this.moveX(!1)}}}class c{constructor({map:t}){this.tileSize=64,this.map=t}place(t){for(let i=0;i<this.map.length;i++)for(let s=0;s<this.map[i].length;s++)t({type:parseInt(this.map[i][s]),x:s*this.tileSize,y:i*this.tileSize})}}const r=[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,2,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,1,1,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,1],[1,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]];const a=new class{constructor(){this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d"),this.width=720,this.height=480}init(t){this.setSize(),document.getElementById("game").appendChild(this.canvas),setInterval((()=>{return i=this,s=void 0,h=function*(){yield this.clear(),yield t()},new((e=void 0)||(e=Promise))((function(t,n){function o(t){try{r(h.next(t))}catch(t){n(t)}}function c(t){try{r(h.throw(t))}catch(t){n(t)}}function r(i){var s;i.done?t(i.value):(s=i.value,s instanceof e?s:new e((function(t){t(s)}))).then(o,c)}r((h=h.apply(i,s||[])).next())}));var i,s,e,h}),15)}setSize(){this.canvas.width=this.width,this.canvas.height=this.height}clear(){this.context.clearRect(0,0,this.canvas.width,this.canvas.height)}};window.onload=function(){const t=[],s=new o({gameArea:a});new c({map:r}).place((function({type:e,x:h,y:n}){switch(e){case 1:const e=new i({gameArea:a});e.spawn({x:h,y:n}),t.push(e);break;case 2:s.spawn({x:h,y:n})}})),s.init(),a.init((()=>{return i=this,e=void 0,o=function*(){const i=[s,...t];for(let t=0;t<i.length;t++){const s=i[t];s instanceof n&&(yield s.checkCollisions(i)),yield s.render()}},new((h=void 0)||(h=Promise))((function(t,s){function n(t){try{r(o.next(t))}catch(t){s(t)}}function c(t){try{r(o.throw(t))}catch(t){s(t)}}function r(i){var s;i.done?t(i.value):(s=i.value,s instanceof h?s:new h((function(t){t(s)}))).then(n,c)}r((o=o.apply(i,e||[])).next())}));var i,e,h,o}))}})();