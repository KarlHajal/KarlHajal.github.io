(function(){'use strict';const GAME_WIDTH=960;const GAME_HEIGHT=640;async function loadGames(){const response=await fetch('content/games/games.yaml');return jsyaml.load(await response.text());}
function lines(value){return Array.isArray(value)?value:(value?[value]:[]);}
function el(tag,className,html){const node=document.createElement(tag);if(className)node.className=className;if(html!==undefined)node.innerHTML=html;return node;}
function buildConsole(){const wrap=el('div','gba-wrap');wrap.innerHTML=`
            <div class="gba-stage">
            <div class="gba-spacer"></div>
            <div class="cartridge" aria-hidden="true">
                <img class="cartridge-art" src="content/games/cartridge.svg" alt="">
                <div class="cartridge-label" id="cart-title"></div>
            </div>
            <div class="gba" tabindex="0" role="application" aria-label="Game console. Use the arrow keys to choose a game and Enter to play.">
                <img class="gba-art" src="content/games/gba.svg" alt="">
                <div class="gba-screen" id="gba-screen"></div>
                <button class="gba-btn up" data-key="up" aria-label="Up">Up</button>
                <button class="gba-btn down" data-key="down" aria-label="Down">Down</button>
                <button class="gba-btn left" data-key="left" aria-label="Left">Left</button>
                <button class="gba-btn right" data-key="right" aria-label="Right">Right</button>
                <button class="gba-btn a" data-key="a" aria-label="A, play the selected game">A</button>
                <button class="gba-btn b" data-key="b" aria-label="B, back to the menu">B</button>
                <button class="gba-btn start" data-key="start" aria-label="Start, play the selected game">Start</button>
                <button class="gba-btn select" data-key="select" aria-label="Select, toggle full screen">Select</button>
            </div>
            </div>
            <p class="games-note">A or Start plays. B goes back. Select toggles full screen.</p>`;return wrap;}
function init(games){const host=document.getElementById('games-list');if(!host||!games||games.length===0)return;const wrap=buildConsole();const bar=el('div','game-bar');bar.hidden=true;host.appendChild(wrap);host.appendChild(bar);const body=wrap.querySelector('.gba');const screen=wrap.querySelector('#gba-screen');const cartTitle=wrap.querySelector('#cart-title');let selected=0;let frameHolder=null;function fitFrame(){if(!frameHolder)return;const frame=frameHolder.querySelector('.game-frame');const scale=Math.min(screen.clientWidth/GAME_WIDTH,screen.clientHeight/GAME_HEIGHT);frame.style.transform=`scale(${scale})`;frame.style.left=`${(screen.clientWidth - GAME_WIDTH * scale) / 2}px`;frame.style.top=`${(screen.clientHeight - GAME_HEIGHT * scale) / 2}px`;}
new ResizeObserver(fitFrame).observe(screen);document.addEventListener('fullscreenchange',()=>setTimeout(fitFrame,50));function renderBar(){const game=games[selected];bar.hidden=!frameHolder;if(!frameHolder){bar.innerHTML='';return;}
const controls=(game.controls||[]).map(line=>`<li>${line}</li>`).join('');bar.innerHTML=`
                <div class="game-bar-main">
                    <h2>${game.title}</h2>
                    <p class="game-bar-meta">${game.year || ''}</p>
                    ${lines(game.description).map(line => `<p>${line}</p>`).join('')}
                </div>
                ${controls ? `<ul>${controls}</ul>` : ''}
                <div class="game-bar-actions">
                    <button type="button" class="game-button primary" data-action="exit">Exit game</button>
                    <button type="button" class="game-button" data-action="fullscreen">Full screen</button>
                </div>`;bar.querySelectorAll('[data-action]').forEach(button=>{button.addEventListener('click',()=>{if(button.dataset.action==='exit')back();else toggleFullscreen();});});}
function renderMenu(){screen.innerHTML='';frameHolder=null;wrap.classList.remove('is-playing');const menu=el('div','menu');menu.appendChild(el('h2','menu-title','SELECT GAME'));const list=el('ul','menu-list');list.setAttribute('role','listbox');list.setAttribute('aria-label','Games');games.forEach((game,i)=>{const item=el('li','menu-item'+(i===selected?' is-selected':''),`<span>${game.title}</span><span>${game.year || ''}</span>`);item.setAttribute('role','option');item.setAttribute('aria-selected',String(i===selected));item.addEventListener('click',()=>{selected=i;renderMenu();});item.addEventListener('dblclick',play);list.appendChild(item);});menu.appendChild(list);const game=games[selected];const detail=el('div','menu-detail');lines(game.description).forEach(line=>detail.appendChild(el('p','',line)));(game.controls||[]).forEach(line=>detail.appendChild(el('p','',line)));menu.appendChild(detail);menu.appendChild(el('p','menu-hint','A: play'));screen.appendChild(menu);cartTitle.textContent=game.title;renderBar();}
function play(){const game=games[selected];screen.innerHTML='';wrap.classList.add('is-playing');frameHolder=el('div','game-frame-holder');const frame=el('iframe','game-frame');frame.src=game.url;frame.title=game.title;frame.allow='fullscreen; autoplay';frame.setAttribute('scrolling','no');frameHolder.appendChild(frame);frameHolder.appendChild(el('div','game-status','Loading...'));frame.addEventListener('load',()=>{const status=frameHolder&&frameHolder.querySelector('.game-status');if(status)status.remove();frame.focus();});screen.appendChild(frameHolder);fitFrame();renderBar();}
function back(){if(frameHolder)renderMenu();}
function toggleFullscreen(){if(document.fullscreenElement)document.exitFullscreen();else if(screen.requestFullscreen)screen.requestFullscreen();}
function press(key){const playing=Boolean(frameHolder);if(key==='up'&&!playing){selected=(selected-1+games.length)%games.length;renderMenu();}
else if(key==='down'&&!playing){selected=(selected+1)%games.length;renderMenu();}
else if((key==='a'||key==='start')&&!playing)play();else if(key==='b')back();else if(key==='select')toggleFullscreen();}
wrap.querySelectorAll('[data-key]').forEach(button=>{button.addEventListener('click',()=>press(button.dataset.key));});body.addEventListener('keydown',event=>{const map={ArrowUp:'up',ArrowDown:'down',Enter:'a',' ':'a',Escape:'b',Backspace:'b'};const key=map[event.key];if(!key||event.target.closest('[data-key]'))return;event.preventDefault();press(key);});renderMenu();}
loadGames().then(init).catch(error=>console.error('Error loading games:',error));})();