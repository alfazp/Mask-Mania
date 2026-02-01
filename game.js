// AUDIO GLOBAL
const clickAudio = new Audio("assets/sfx/click.wav"); // semua tombol
const pointAudio = new Audio("assets/sfx/point.mp3"); // klik topeng/tikus tanah

function playClick() {
    clickAudio.currentTime = 0;
    clickAudio.play();
}

function playPoint() {
    pointAudio.currentTime = 0;
    pointAudio.play();
}

// ===== VARS =====
let currentMode = null;
let score = 0;
let highScore = localStorage.getItem("mr_drapul_highscore") || 0;
let timeLeft = 60;
let gameTimer = null;
let spawnTimer = null;

// SCREENS
const screens = {
    menu: document.getElementById("menu"),
    mode: document.getElementById("modeSelect"),
    howto: document.getElementById("howto"),
    game: document.getElementById("game"),
    gameover: document.getElementById("gameover")
};

const highScoreText = document.getElementById("highScoreText");
const scoreText = document.getElementById("scoreText");
const timeText = document.getElementById("timeText");
const finalScore = document.getElementById("finalScore");

highScoreText.innerText = highScore;

// ===== BUTTONS =====
const playBtn = document.getElementById("playBtn");
const modeGambling = document.getElementById("modeGambling");
const modeTikus = document.getElementById("modeTikus");
const startGameBtn = document.getElementById("startGameBtn");
const backBtns = document.querySelectorAll(".backBtn");
const retryBtn = document.getElementById("retryBtn");
const backMenuBtn = document.getElementById("backMenuBtn");

// GAME AREAS
const gamblingArea = document.getElementById("gamblingArea");
const maskContainer = document.getElementById("maskContainer");
const tikusArea = document.getElementById("tikusArea");
const holes = document.querySelectorAll(".hole");

// ===== HELPER FUNCTIONS =====
function showScreen(screenName){
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screens[screenName].classList.add("active");
}

function resetGameDisplay(){
    gamblingArea.style.display="none";
    tikusArea.style.display="none";
    holes.forEach(h=>{
        const e = h.querySelector(".entity");
        e.dataset.active="0";
        e.classList.remove("show","hide");
        e.style.backgroundImage="";
    });
}

// ===== MENU MASK =====
const menuMask = document.getElementById("menuMask");
const maskPaths = [
    "assets/masks/mask1.png",
    "assets/masks/mask2.png",
    "assets/masks/mask3.png",
    "assets/masks/mask4.png",
    "assets/masks/mask5.png"
];

setInterval(() => {
    const randIndex = Math.floor(Math.random() * maskPaths.length);
    menuMask.src = maskPaths[randIndex];
}, 800);

// ===== MENU =====
playBtn.onclick = ()=>{
    clickAudio.play(); // unlock audio
    pointAudio.play(); // unlock audio
    showScreen("mode");
};

// BACK BUTTONS
backBtns.forEach(b => b.onclick = ()=>{
    playClick();
    showScreen("menu");
});

// ===== MODE SELECTION =====
modeGambling.onclick = ()=>{
    playClick();
    currentMode = "gambling";
    document.getElementById("howtoText").innerHTML =
        "<p>Pilih topeng yang benar.<br>salah akan Game Over<br>benar akan lanjut dan topeng akan bertambah</p>";
    showScreen("howto");
};

modeTikus.onclick = ()=>{
    playClick();
    currentMode = "tikus";
    document.getElementById("howtoText").innerHTML =
        "<p>Klik topeng yang muncul.<br>tiap topeng akan memberi poin 1 hingga 3 poin<br>sampah akan mengurangi 2 poin<br>Waktunya 60 detik</p>";
    showScreen("howto");
};

// ===== START GAME =====
startGameBtn.onclick = ()=>{
    playClick();
    if(!currentMode) return;
    resetGame();
    resetGameDisplay();
    showScreen("game");
    if(currentMode==="gambling") startGambling();
    if(currentMode==="tikus") startTikus();
    startTimer();
};

// ===== RESET GAME =====
function resetGame(){
    score=0;
    timeLeft=60;
    scoreText.innerText=score;
    timeText.innerText=timeLeft;
    clearInterval(gameTimer);
    clearInterval(spawnTimer);
}

// ===== TIMER =====
function startTimer(){
    gameTimer = setInterval(()=>{
        timeLeft--;
        timeText.innerText = timeLeft;
        if(timeLeft<=0) endGame();
    },1000);
}

// ===== END GAME =====
function endGame(){
    clearInterval(gameTimer);
    clearInterval(spawnTimer);
    finalScore.innerText = score;
    if(score>highScore){
        highScore=score;
        localStorage.setItem("mr_drapul_highscore", highScore);
        highScoreText.innerText = highScore;
    }
    showScreen("gameover");
}

// ===== RETRY / BACK =====
retryBtn.onclick = ()=>{
    playClick();
    startGameBtn.click();
};

backMenuBtn.onclick = ()=>{
    playClick();
    resetGame();
    resetGameDisplay();
    showScreen("menu");
};

// ===== GAMBLING MODE =====
let gamblingCount = 2;
let correctIndex = 0;

function startGambling(){
    gamblingArea.style.display="flex";
    tikusArea.style.display="none";
    gamblingCount = 2;
    spawnGambling();
}

function spawnGambling(){
    maskContainer.innerHTML = "";
    correctIndex = Math.floor(Math.random()*gamblingCount);

    for(let i=0;i<gamblingCount;i++){
        const img = document.createElement("img");
        img.src = `assets/masks/mask${Math.floor(Math.random()*5)+1}.png`;
        img.className = "gambleMask";
        img.onclick = ()=>{
            if(i===correctIndex){
                playPoint();
                score++;
                scoreText.innerText=score;
                gamblingCount++;
                spawnGambling();
            } else {
                playClick();
                endGame();
            }
        };
        maskContainer.appendChild(img);
    }
}

// ===== TIKUS TANAH MODE =====
const maskProb = [
    {type:"mask1", point:1, chance:40},
    {type:"mask2", point:1.5, chance:20},
    {type:"mask3", point:2, chance:15},
    {type:"mask4", point:2.5, chance:10},
    {type:"mask5", point:3, chance:5},
    {type:"sampah", point:-2, chance:30}
];

function startTikus(){
    tikusArea.style.display="flex";
    gamblingArea.style.display="none";
    holes.forEach(h=>{
        const e = h.querySelector(".entity");
        e.dataset.active="0";
        e.classList.remove("show","hide");
        e.style.backgroundImage="";
    });
    spawnTimer=setInterval(spawnEntity,400);
}

function spawnEntity(){
    const available = [...holes].filter(h=>{
        const e = h.querySelector(".entity");
        if(e.dataset.active==="1" && !e.classList.contains("show")) e.dataset.active="0";
        return e.dataset.active!=="1";
    });
    if(available.length===0) return;

    const spawnCount = Math.random()<0.25?2:1;
    for(let s=0;s<spawnCount;s++){
        if(available.length===0) return;
        const hole = available.splice(Math.floor(Math.random()*available.length),1)[0];
        const entity = hole.querySelector(".entity");

        const result = rollEntity();
        entity.dataset.type = result.type;
        entity.dataset.point = result.point;
        entity.dataset.active = "1";

        entity.style.backgroundImage = result.type==="sampah"
            ? `url("assets/sampah/sampah.png")`
            : `url("assets/masks/${result.type}.png")`;

        entity.classList.add("show");

        entity.onclick = ()=>{
            if(entity.dataset.active!=="1") return;

            let point = parseFloat(entity.dataset.point) || 0;
            score += point;
            score = Math.round(score*10)/10;
            scoreText.innerText = score;

            // AUDIO FIX
            if(point > 0){
                playPoint();   // topeng
            }else{
                playClick();   // sampah
            }

            showScorePopup(hole, point);
            hideEntity(entity);
        };

        setTimeout(()=>{
            if(entity.dataset.active==="1") hideEntity(entity);
        },700+Math.random()*300);
    }
}

function rollEntity(){
    let total = maskProb.reduce((s,e)=>s+e.chance,0);
    let rand = Math.random()*total;
    for(let item of maskProb){
        if(rand<item.chance) return item;
        rand -= item.chance;
    }
    return maskProb[0];
}

function hideEntity(entity){
    entity.classList.remove("show");
    entity.classList.add("hide");
    setTimeout(()=>{
        entity.dataset.active="0";
        entity.style.backgroundImage="";
        entity.classList.remove("hide");
    },250);
}

// ===== SCORE POPUP =====
function showScorePopup(hole, point){
    const popup = document.createElement("div");
    popup.className = "scorePopup";
    popup.innerText = (point>0?"+":"") + point;
    hole.appendChild(popup);

    setTimeout(()=>{
        popup.remove();
    },600);
}