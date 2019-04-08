!function(e){var t={};function n(o){if(t[o])return t[o].exports;var i=t[o]={i:o,l:!1,exports:{}};return e[o].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(o,i,function(t){return e[t]}.bind(null,i));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=2)}([function(e,t){e.exports="precision highp float;\n\nattribute vec2 a_position;\n\nuniform float aspectRatio;\nuniform vec2 center;\nuniform float scale;\n\nvarying vec2 coordinates;\n\nvoid main() {\n    coordinates = a_position;\n    gl_Position = vec4((a_position - center) * vec2(1, aspectRatio) * scale, 0, 1);\n}\n"},function(e,t){e.exports="precision highp float;\n\nuniform vec2 seed;\nuniform int iterationLimit;\n\nuniform sampler2D prevTexture;\nuniform sampler2D currTexture;\n\nuniform int textureSize;\nuniform float textureRatio;\n\nvarying vec2 coordinates;\n\nvoid main() {\n    vec2 z = coordinates;\n\n    float iterationCount = 0.0;\n\n    for (int i = 0; i < 1000; i++) {\n        if (i >= iterationLimit) {\n            break;\n        }\n\n        float x = (z.x * z.x - z.y * z.y) + seed.x;\n        float y = (z.y * z.x + z.x * z.y) + seed.y;\n\n        if ((x * x + y * y) > 4.0) {\n            break;\n        }\n\n        z.x = x;\n        z.y = y;\n\n        iterationCount = float(i);\n    }\n\n    float level = iterationCount / float(iterationLimit);\n\n    float step = 1.0 / float(textureSize);\n    level = level * (1.0 - step) + step / 2.0;\n\n    vec4 prevColor = texture2D(prevTexture, vec2(level, 0.5));\n    vec4 currColor = texture2D(currTexture, vec2(level, 0.5));\n\n    gl_FragColor = mix(prevColor, currColor, textureRatio);\n}\n"},function(e,t,n){"use strict";n.r(t);var o=function(){function e(e,t){this.x=e,this.y=t}return e.prototype.add=function(t){return new e(this.x+t.x,this.y+t.y)},e.prototype.sub=function(t){return new e(this.x-t.x,this.y-t.y)},e.prototype.mul=function(t){return new e(this.x*t,this.y*t)},e.prototype.length=function(){return Math.sqrt(this.x*this.x+this.y*this.y)},e.prototype.clamp=function(t,n,o,i){return new e(u(this.x,t,n),u(this.y,o,i))},e}(),i=9,r=8e3,s=.25,c=25,a=100;function u(e,t,n){return Math.max(Math.min(e,n),t)}function h(e){var t=e[1].x-e[0].x,n=e[1].y-e[0].y;return Math.sqrt(t*t+n*n)}function f(e){return new o((e[0].x+e[1].x)/2,(e[0].y+e[1].y)/2)}function d(e){return[new o(e.touches[0].clientX,e.touches[0].clientY),new o(e.touches[1].clientX,e.touches[1].clientY)]}function p(e){return 2===e.touches.length&&h([new o(e.touches[0].clientX,e.touches[0].clientY),new o(e.touches[1].clientX,e.touches[1].clientY)])<a}function l(e,t){var n=h([f(e),f(t)]);return Math.abs(h(e)-h(t))>n}var v=function(){return function(e){var t=this;this.onGestureStart=function(e){e.preventDefault(),t.gestureStartZoom=t.scope.getZoom()},this.onGestureEnd=function(e){e.preventDefault()},this.onGestureChange=function(e){e.preventDefault();var n=e.scale>1?e.scale-1:-1/e.scale+1,i=new o(e.clientX,e.clientY),r=t.scope.unproject(i);t.scope.setZoom(t.gestureStartZoom+n);var s=t.scope.unproject(i),c=t.scope.getCenter().add(r).sub(s);t.scope.setCenter(c),t.scope.fire("zoom")},this.scope=e,this.gestureStartZoom=0,this.scope.getContainer().addEventListener("gesturestart",this.onGestureStart),this.scope.getContainer().addEventListener("gesturechange",this.onGestureChange),this.scope.getContainer().addEventListener("gestureend",this.onGestureEnd)}}(),m=function(){function e(e){var t=this;this.handle=function(e){if(e.preventDefault(),t.startOrStop(e),t.isActive){var n=t.scope.unproject(t.touchStartPoint),o=t.scope.unproject(f(d(e))).sub(n).mul(s),i=t.touchStartSeed.add(o);t.scope.setSeed(i),t.scope.fire("morph")}},this.scope=e,this.touchStartPoint=new o(0,0),this.touchStartSeed=new o(0,0),this.isActive=!1,this.scope.getContainer().addEventListener("touchstart",this.handle),this.scope.getContainer().addEventListener("touchend",this.handle),this.scope.getContainer().addEventListener("touchmove",this.handle)}return e.prototype.startOrStop=function(e){var t=2===e.touches.length?d(e):void 0,n=void 0===this.prevTouchPoints||void 0===t||!l(this.prevTouchPoints,t);this.canRun(e)&&n&&!this.isActive?(this.touchStartSeed=this.scope.getSeed(),this.touchStartPoint=f(d(e)),this.isActive=!0):this.canRun(e)&&n||!this.isActive||(this.isActive=!1,this.prevTouchPoints=void 0),this.prevTouchPoints=t},e.prototype.canRun=function(e){return 2===e.touches.length&&!p(e)},e}(),g=function(){return function(e){var t=this;this.onMouseDown=function(e){e.preventDefault(),((e.ctrlKey||e.metaKey)&&0===e.button||1===e.button||2===e.button)&&(t.mouseDownSeed=t.scope.getSeed(),t.mouseDownPoint=new o(e.clientX,e.clientY),t.scope.getContainer().classList.add("morphing"),document.addEventListener("mousemove",t.onMouseMove),document.addEventListener("mouseup",t.onMouseUp))},this.onMouseUp=function(e){e.preventDefault(),t.scope.getContainer().classList.remove("morphing"),document.removeEventListener("mousemove",t.onMouseMove),document.removeEventListener("mouseup",t.onMouseUp)},this.onMouseMove=function(e){e.preventDefault();var n=t.scope.unproject(t.mouseDownPoint),i=t.scope.unproject(new o(e.clientX,e.clientY)).sub(n).mul(s),r=t.mouseDownSeed.add(i);t.scope.setSeed(r),t.scope.fire("morph")},this.scope=e,this.mouseDownSeed=new o(0,0),this.mouseDownPoint=new o(0,0),this.scope.getContainer().addEventListener("mousedown",this.onMouseDown),this.scope.getContainer().addEventListener("contextmenu",function(e){return e.preventDefault()})}}(),y=function(){return function(e){var t=this;this.onMouseDown=function(e){e.preventDefault(),0!==e.button||e.ctrlKey||e.metaKey||(t.mouseDownCenter=t.scope.getCenter(),t.mouseDownPoint=new o(e.clientX,e.clientY),t.scope.getContainer().classList.add("dragging"),document.addEventListener("mousemove",t.onMouseMove),document.addEventListener("mouseup",t.onMouseUp))},this.onMouseUp=function(e){e.preventDefault(),t.scope.getContainer().classList.remove("dragging"),document.removeEventListener("mousemove",t.onMouseMove),document.removeEventListener("mouseup",t.onMouseUp)},this.onMouseMove=function(e){e.preventDefault();var n=t.scope.unproject(t.mouseDownPoint),i=t.scope.unproject(new o(e.clientX,e.clientY)),r=t.mouseDownCenter.sub(i).add(n);t.scope.setCenter(r),t.scope.fire("drag")},this.scope=e,this.mouseDownCenter=new o(0,0),this.mouseDownPoint=new o(0,0),this.scope.getContainer().addEventListener("mousedown",this.onMouseDown)}}(),w=function(){function e(e){var t=this;this.onWheel=function(e){e.preventDefault();var n=new o(e.clientX,e.clientY),i=t.scope.unproject(n);t.scope.setZoom(t.scope.getZoom()+t.getDelta(e));var r=t.scope.unproject(n),s=t.scope.getCenter().add(i).sub(r);t.scope.setCenter(s),t.scope.fire("zoom")},this.scope=e,this.scope.getContainer().addEventListener("wheel",this.onWheel)}return e.prototype.getDelta=function(e){return e.ctrlKey?.025*-e.deltaY:1===e.deltaMode?.05*-e.deltaY:.0025*-e.deltaY},e}(),b=function(){function e(e){var t=this;this.handle=function(e){if(e.preventDefault(),t.startStop(e),t.isActive){var n=t.scope.unproject(t.touchStartPoint),o=t.scope.unproject(t.getTouchPoint(e)),i=t.touchStartCenter.sub(o).add(n);t.scope.setCenter(i),t.scope.fire("drag")}},this.scope=e,this.touchStartCenter=new o(0,0),this.touchStartPoint=new o(0,0),this.isActive=!1,this.scope.getContainer().addEventListener("touchstart",this.handle),this.scope.getContainer().addEventListener("touchend",this.handle),this.scope.getContainer().addEventListener("touchmove",this.handle)}return e.prototype.startStop=function(e){this.canRun(e)&&!this.isActive?(this.touchStartCenter=this.scope.getCenter(),this.touchStartPoint=this.getTouchPoint(e),this.isActive=!0):!this.canRun(e)&&this.isActive&&(this.isActive=!1)},e.prototype.canRun=function(e){return 1===e.touches.length||p(e)},e.prototype.getTouchPoint=function(e){return 1===e.touches.length?new o(e.touches[0].clientX,e.touches[0].clientY):f(d(e))},e}(),x=function(){function e(e){var t=this;this.handle=function(e){if(e.preventDefault(),t.startOrStop(e),t.isActive){var n=d(e),o=h(t.touchStartPoints),i=h(n),r=Math.log(i/o)/Math.log(2),s=f(n),c=t.scope.unproject(s);t.scope.setZoom(t.touchStartZoom+r);var a=t.scope.unproject(s);t.scope.setCenter(t.scope.getCenter().add(c).sub(a)),t.scope.fire("zoom")}},this.scope=e,this.touchStartPoints=[new o(0,0),new o(0,0)],this.touchStartZoom=0,this.isActive=!1,this.scope.getContainer().addEventListener("touchstart",this.handle),this.scope.getContainer().addEventListener("touchend",this.handle),this.scope.getContainer().addEventListener("touchmove",this.handle)}return e.prototype.startOrStop=function(e){var t=2===e.touches.length?d(e):void 0,n=void 0===this.prevTouchPoints||void 0===t||l(this.prevTouchPoints,t);this.canRun(e)&&n&&!this.isActive?(this.touchStartPoints=d(e),this.touchStartZoom=this.scope.getZoom(),this.isActive=!0):this.canRun(e)&&n||!this.isActive||(this.isActive=!1,this.prevTouchPoints=void 0),this.prevTouchPoints=t},e.prototype.canRun=function(e){return 2===e.touches.length&&!p(e)},e}(),S=function(){function e(e){this.size=e,this.values=[]}return e.prototype.push=function(e){this.values.push(e),this.values.length>this.size&&this.values.shift()},e.prototype.getMean=function(){return this.values.reduce(function(e,t){return e+t})/this.values.length},e}(),T=[["#004529","#006837","#238443","#41ab5d","#78c679","#addd8e","#d9f0a3","#f7fcb9","#ffffe5"],["#081d58","#253494","#225ea8","#1d91c0","#41b6c4","#7fcdbb","#c7e9b4","#edf8b1","#ffffd9"],["#084081","#0868ac","#2b8cbe","#4eb3d3","#7bccc4","#a8ddb5","#ccebc5","#e0f3db","#f7fcf0"],["#00441b","#006d2c","#238b45","#41ae76","#66c2a4","#99d8c9","#ccece6","#e5f5f9","#f7fcfd"],["#014636","#016c59","#02818a","#3690c0","#67a9cf","#a6bddb","#d0d1e6","#ece2f0","#fff7fb"],["#023858","#045a8d","#0570b0","#3690c0","#74a9cf","#a6bddb","#d0d1e6","#ece7f2","#fff7fb"],["#4d004b","#810f7c","#88419d","#8c6bb1","#8c96c6","#9ebcda","#bfd3e6","#e0ecf4","#f7fcfd"],["#49006a","#7a0177","#ae017e","#dd3497","#f768a1","#fa9fb5","#fcc5c0","#fde0dd","#fff7f3"],["#67001f","#980043","#ce1256","#e7298a","#df65b0","#c994c7","#d4b9da","#e7e1ef","#f7f4f9"],["#7f0000","#b30000","#d7301f","#ef6548","#fc8d59","#fdbb84","#fdd49e","#fee8c8","#fff7ec"],["#800026","#bd0026","#e31a1c","#fc4e2a","#fd8d3c","#feb24c","#fed976","#ffeda0","#ffffcc"],["#662506","#993404","#cc4c02","#ec7014","#fe9929","#fec44f","#fee391","#fff7bc","#ffffe5"],["#3f007d","#54278f","#6a51a3","#807dba","#9e9ac8","#bcbddc","#dadaeb","#efedf5","#fcfbfd"],["#08306b","#08519c","#2171b5","#4292c6","#6baed6","#9ecae1","#c6dbef","#deebf7","#f7fbff"],["#00441b","#006d2c","#238b45","#41ab5d","#74c476","#a1d99b","#c7e9c0","#e5f5e0","#f7fcf5"],["#7f2704","#a63603","#d94801","#f16913","#fd8d3c","#fdae6b","#fdd0a2","#fee6ce","#fff5eb"],["#67000d","#a50f15","#cb181d","#ef3b2c","#fb6a4a","#fc9272","#fcbba1","#fee0d2","#fff5f0"],["#000000","#252525","#525252","#737373","#969696","#bdbdbd","#d9d9d9","#f0f0f0","#ffffff"]];function E(){for(var e,t=Math.floor(Math.random()*T.length),n=T[t],o=new Uint8Array(4*i),r=0;r<i;r++){var s=(e=n[r],[parseInt(e.slice(1,3),16),parseInt(e.slice(3,5),16),parseInt(e.slice(5,7),16),255]);o[4*r+0]=s[0],o[4*r+1]=s[1],o[4*r+2]=s[2],o[4*r+3]=s[3]}return o}var C=function(){function e(e,t,n,o){this.gl=e,this.type=o,this.location=e.getUniformLocation(t,n)}return e.prototype.set=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];var n=this.gl,o=this.location;switch(this.type){case"1i":n.uniform1i(o,e[0]);break;case"1f":n.uniform1f(o,e[0]);break;case"2f":n.uniform2f(o,e[0],e[1])}},e}(),A=n(0),R=n.n(A),D=n(1),L=n.n(D),P=function(){function e(e,t){var n=this;this.resetSize=function(){var e=n,t=e.gl,o=e.canvas,i=e.container,r=i.clientWidth,s=i.clientHeight,c=r*window.devicePixelRatio,a=s*window.devicePixelRatio;o.width=c,o.height=a,t.viewport(0,0,c,a),n.aspectRatioUniform.set(r/s),n.width=r,n.height=s},this.switchPalette=function(){var e=n.gl,t=0===n.currTextureIndex?1:0,o=n.currTextureIndex,r=E();e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,n.textures[t]),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,i,1,0,e.RGBA,e.UNSIGNED_BYTE,r),n.currTextureUniform.set(t),n.prevTextureUniform.set(o),n.prevPalette=n.currPalette,n.currPalette=r,n.currTextureIndex=t,n.paletteSetTime=Date.now()},this.render=function(){var e=n.gl;requestAnimationFrame(n.render),n.updateIterationLimit(),n.updateTextureRatio(),n.updateSeed(),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLES,0,6)},this.container=e,this.canvas=document.createElement("canvas"),e.appendChild(this.canvas),window.addEventListener("resize",this.resetSize);var s=this.canvas.getContext("webgl"),a=s.createProgram(),u=s.createTexture(),h=s.createTexture();this.gl=s,this.program=a,this.textures=[u,h],this.audioElement=t,this.volumeWindow=new S(c),this.initShaders(),this.seedUniform=new C(s,a,"seed","2f"),this.centerUniform=new C(s,a,"center","2f"),this.scaleUniform=new C(s,a,"scale","1f"),this.aspectRatioUniform=new C(s,a,"aspectRatio","1f"),this.iterationLimitUniform=new C(s,a,"iterationLimit","1i"),this.textureRatioUniform=new C(s,a,"textureRatio","1f"),this.textureSizeUniform=new C(s,a,"textureSize","1i"),this.prevTextureUniform=new C(s,a,"prevTexture","1i"),this.currTextureUniform=new C(s,a,"currTexture","1i"),this.paletteSetTime=Date.now(),this.currTextureIndex=0,this.prevPalette=new Uint8Array(0),this.currPalette=new Uint8Array(0),this.switchPalette(),window.setInterval(this.switchPalette,r),this.center=new o(0,0),this.seed=new o(0,0),this.zoom=0,this.eventHandlers={},this.width=0,this.height=0,this.canvas.style.width="100%",this.canvas.style.height="100%",this.resetSize(),this.initGeometry(),this.initTextures(),this.initState(),this.initHandlers(),this.render()}return e.prototype.getContainer=function(){return this.container},e.prototype.getSize=function(){return new o(this.width,this.height)},e.prototype.setCenter=function(e){this.center=e.clamp(-3,3,-2,2),this.centerUniform.set(this.center.x,this.center.y)},e.prototype.getCenter=function(){return this.center},e.prototype.setZoom=function(e){this.zoom=u(e,-4,16),this.scaleUniform.set(Math.pow(2,this.zoom))},e.prototype.getZoom=function(){return this.zoom},e.prototype.setSeed=function(e){this.seed=e.clamp(-1.5,1,-1,1)},e.prototype.getSeed=function(){return this.seed},e.prototype.unproject=function(e){var t=this.getSize(),n=t.x/t.y;return new o(e.x/t.x*2-1,((t.y-e.y)/t.y*2-1)/n).mul(1/Math.pow(2,this.zoom)).add(this.center)},e.prototype.playAudio=function(){void 0===this.analyser&&this.initAudio(),this.audioElement.play()},e.prototype.pauseAudio=function(){this.audioElement.pause()},e.prototype.on=function(e,t){this.eventHandlers[e]=t},e.prototype.off=function(e){delete this.eventHandlers[e]},e.prototype.fire=function(e){var t=this.eventHandlers[e];void 0!==t&&t()},e.prototype.initShaders=function(){var e=this.gl,t=this.program,n=e.createShader(e.VERTEX_SHADER);e.shaderSource(n,R.a),e.compileShader(n);var o=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(o,L.a),e.compileShader(o),e.attachShader(t,n),e.attachShader(t,o),e.linkProgram(t),e.useProgram(t)},e.prototype.initTextures=function(){var e=E();this.initTexture(0,e),this.initTexture(1,e),this.prevPalette=e,this.currPalette=e,this.textureSizeUniform.set(i),this.prevTextureUniform.set(0),this.currTextureUniform.set(1)},e.prototype.initTexture=function(e,t){var n=this.gl;n.activeTexture(n.TEXTURE0+e),n.bindTexture(n.TEXTURE_2D,this.textures[e]),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,i,1,0,n.RGBA,n.UNSIGNED_BYTE,t)},e.prototype.initGeometry=function(){var e=this.gl,t=new Float32Array([-3,-2,3,-2,-3,2,-3,2,3,-2,3,2]),n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW);var o=e.getAttribLocation(this.program,"a_position");e.enableVertexAttribArray(o),e.vertexAttribPointer(o,2,e.FLOAT,!1,0,0)},e.prototype.initState=function(){this.setCenter(new o(-.52,.252)),this.setSeed(new o(-.529,.524)),this.setZoom(2),this.iterationLimitUniform.set(150)},e.prototype.initHandlers=function(){new y(this),new w(this),new g(this),new b(this),new x(this),new m(this),new v(this)},e.prototype.initAudio=function(){var e=window.AudioContext||window.webkitAudioContext;if(void 0!==e){var t=new e,n=t.createAnalyser();t.createMediaElementSource(this.audioElement).connect(n),n.connect(t.destination),this.analyser=n}},e.prototype.updateIterationLimit=function(){if(void 0!==this.analyser){this.volumeWindow.push(function(e){var t=new Uint8Array(e.frequencyBinCount);e.getByteTimeDomainData(t);for(var n=0,o=0;o<t.length;o++){var i=Math.abs(t[o]-128)/128;i>n&&(n=i)}return n}(this.analyser));var e=this.volumeWindow.getMean();this.iterationLimitUniform.set(150-125*e)}},e.prototype.updateTextureRatio=function(){var e=this.gl,t=this.prevPalette,n=this.currPalette,o=u((Date.now()-this.paletteSetTime)/3e3,0,1);this.textureRatioUniform.set(o);var i,r,s,c=(i=[t[0],t[1],t[2],t[3]],r=[n[0],n[1],n[2],n[3]],s=o,[i[0]*(1-s)+r[0]*s,i[1]*(1-s)+r[1]*s,i[2]*(1-s)+r[2]*s,i[3]*(1-s)+r[3]*s]);e.clearColor(c[0]/255,c[1]/255,c[2]/255,c[3]/255)},e.prototype.updateSeed=function(){var e=this.seed,t=this.zoom,n=Math.pow(2,t),o=Date.now();this.seedUniform.set(e.x+.01*Math.cos(12/13*o/1500)/n,e.y+.5*Math.sin(o/1500)*.01/n)},e}();function M(){return void 0!==window.orientation||-1!==navigator.userAgent.toLowerCase().indexOf("mobile")}!function(){try{return"WebGLRenderingContext"in window&&!!document.createElement("canvas").getContext("webgl",{failIfMajorPerformanceCaveat:!0})}catch(e){return!1}}()?document.getElementById("no-webgl").style.display="table":function(){document.body.classList.add(M()?"mobile":"desktop");var e=M()?".tips.touch":".tips.mouse",t=document.querySelector(e+" .drag"),n=document.querySelector(e+" .zoom"),o=document.querySelector(e+" .morph"),i=window.scope=new P(document.querySelector(".display"),document.querySelector(".audio")),r=i.getSeed(),s=i.getCenter(),c=i.getZoom();i.on("drag",function(){i.getCenter().sub(s).length()>.05&&(t.classList.add("hidden"),i.off("drag"))}),i.on("zoom",function(){Math.abs(i.getZoom()-c)>.25&&(n.classList.add("hidden"),i.off("zoom"))}),i.on("morph",function(){var e=.04/Math.pow(2,i.getZoom());i.getSeed().sub(r).length()>e&&(o.classList.add("hidden"),i.off("morph"))});var a=document.querySelector(".sound-button"),u=a.querySelector(".on"),h=a.querySelector(".off"),f=!1;a.addEventListener("click",function(){f?(i.pauseAudio(),u.classList.add("hidden"),h.classList.remove("hidden"),a.setAttribute("title","Enable audio"),f=!1):(i.playAudio(),u.classList.remove("hidden"),h.classList.add("hidden"),a.setAttribute("title","Disable audio"),f=!0)})}()}]);