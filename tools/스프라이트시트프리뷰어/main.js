/**
 * Sprite Sheet Previewer - main.js
 * 스프라이트 시트 이미지를 불러와 Canvas로 애니메이션 미리보기
 */

// ─── DOM 요소 ───────────────────────────────────────────────────────
const dropZone       = document.getElementById('drop-zone');
const fileInput      = document.getElementById('file-input');
const fileInfo       = document.getElementById('file-info');
const infoDim        = document.getElementById('info-dim');
const infoFrames     = document.getElementById('info-frames');
const infoName       = document.getElementById('info-name');

const previewSection = document.getElementById('preview-section');
const sheetSection   = document.getElementById('sheet-section');

const animCanvas     = document.getElementById('anim-canvas');
const animCtx        = animCanvas.getContext('2d');

const sheetCanvas    = document.getElementById('sheet-canvas');
const sheetCtx       = sheetCanvas.getContext('2d');

const highlightCanvas = document.getElementById('highlight-canvas');
const hlCtx           = highlightCanvas.getContext('2d');

const frameCounter   = document.getElementById('frame-counter');
const playPauseBtn   = document.getElementById('play-pause-btn');
const playIcon       = document.getElementById('play-icon');
const pauseIcon      = document.getElementById('pause-icon');
const prevFrameBtn   = document.getElementById('prev-frame-btn');
const nextFrameBtn   = document.getElementById('next-frame-btn');

const frameWInput    = document.getElementById('frame-w');
const frameHInput    = document.getElementById('frame-h');
const frameCountInput = document.getElementById('frame-count');
const fpsInput       = document.getElementById('fps-input');
const applyBtn       = document.getElementById('apply-btn');
const calcHint       = document.getElementById('calc-hint');

// ─── 상태 ────────────────────────────────────────────────────────────
let srcImage  = null;   // 업로드된 HTMLImageElement
let frameW    = 64;
let frameH    = 64;
let frameCount = 1;
let fps        = 12;
let currentFrame = 0;
let isPlaying  = false;
let animTimer  = null;

// 시트에서 열/행 정보
let cols = 1;
let rows = 1;

// ─── 유틸 ─────────────────────────────────────────────────────────────
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function autoCalcFrames(img, fw, fh) {
    const c = Math.floor(img.width  / fw);
    const r = Math.floor(img.height / fh);
    return Math.max(1, c * r);
}

// ─── 업로드 처리 ──────────────────────────────────────────────────────
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
});

fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) loadFile(fileInput.files[0]);
});

function loadFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('PNG 또는 JPG 이미지 파일만 지원합니다.');
        return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
        srcImage = img;

        // 파일 정보 표시
        infoDim.textContent    = `${img.width} × ${img.height}`;
        infoName.textContent   = file.name;

        // 기본 프레임 크기로 자동 계산
        const fw = parseInt(frameWInput.value) || 64;
        const fh = parseInt(frameHInput.value) || 64;
        const auto = autoCalcFrames(img, fw, fh);
        infoFrames.textContent = auto;
        frameCountInput.value  = auto;

        fileInfo.classList.remove('hidden');

        // 설정 적용 및 시트 그리기
        applySettings();

        // 섹션 표시
        previewSection.classList.remove('hidden');
        sheetSection.classList.remove('hidden');

        // 자동 재생
        startPlay();
    };
    img.src = url;
}

// ─── 설정 적용 ────────────────────────────────────────────────────────
applyBtn.addEventListener('click', applySettings);

frameWInput.addEventListener('input', updateHint);
frameHInput.addEventListener('input', updateHint);

function updateHint() {
    if (!srcImage) return;
    const fw = parseInt(frameWInput.value) || 1;
    const fh = parseInt(frameHInput.value) || 1;
    const auto = autoCalcFrames(srcImage, fw, fh);
    calcHint.textContent = `이미지 크기 기준 자동 계산: ${auto} 프레임`;
}

function applySettings() {
    if (!srcImage) return;

    frameW = clamp(parseInt(frameWInput.value)     || 64, 1, srcImage.width);
    frameH = clamp(parseInt(frameHInput.value)     || 64, 1, srcImage.height);
    fps    = clamp(parseInt(fpsInput.value)        || 12, 1, 120);

    cols = Math.max(1, Math.floor(srcImage.width  / frameW));
    rows = Math.max(1, Math.floor(srcImage.height / frameH));

    const maxFrames = cols * rows;
    frameCount = clamp(parseInt(frameCountInput.value) || maxFrames, 1, maxFrames);
    frameCountInput.value = frameCount;

    // 범위 벗어남 방지
    if (currentFrame >= frameCount) currentFrame = 0;

    // 힌트 업데이트
    calcHint.textContent = `열 ${cols}개 × 행 ${rows}개 = 최대 ${maxFrames} 프레임`;

    // 스프라이트 시트 전체 그리기
    drawSheet();

    // 현재 프레임 그리기
    drawFrame(currentFrame);
    drawHighlight(currentFrame);
    updateCounter();

    // 재생 중이면 타이머 재시작 (fps 변경 반영)
    if (isPlaying) {
        stopPlay();
        startPlay();
    }
}

// ─── 스프라이트 시트 전체 그리기 ─────────────────────────────────────
function drawSheet() {
    sheetCanvas.width  = srcImage.width;
    sheetCanvas.height = srcImage.height;
    highlightCanvas.width  = srcImage.width;
    highlightCanvas.height = srcImage.height;
    sheetCtx.drawImage(srcImage, 0, 0);
}

// ─── 단일 프레임 그리기 (애니메이션 캔버스) ───────────────────────────
function drawFrame(index) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const sx  = col * frameW;
    const sy  = row * frameH;

    // 캔버스 크기를 프레임 크기에 맞춤 (최대 표시 크기 제한)
    const maxDisplay = 320;
    const scale = Math.min(1, maxDisplay / Math.max(frameW, frameH));
    const dispW = Math.round(frameW * scale);
    const dispH = Math.round(frameH * scale);

    animCanvas.width  = dispW;
    animCanvas.height = dispH;

    animCtx.clearRect(0, 0, dispW, dispH);
    animCtx.imageSmoothingEnabled = false;
    animCtx.drawImage(srcImage, sx, sy, frameW, frameH, 0, 0, dispW, dispH);
}

// ─── 하이라이트 그리기 ─────────────────────────────────────────────
function drawHighlight(index) {
    hlCtx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);

    const col = index % cols;
    const row = Math.floor(index / cols);
    const hx  = col * frameW;
    const hy  = row * frameH;

    // 나머지 프레임 어둡게
    hlCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    hlCtx.fillRect(0, 0, highlightCanvas.width, highlightCanvas.height);

    // 현재 프레임 영역 클리어 (밝게)
    hlCtx.clearRect(hx, hy, frameW, frameH);

    // 테두리
    hlCtx.strokeStyle = '#6366f1';
    hlCtx.lineWidth   = 2;
    hlCtx.shadowColor = '#6366f1';
    hlCtx.shadowBlur  = 8;
    hlCtx.strokeRect(hx + 1, hy + 1, frameW - 2, frameH - 2);
    hlCtx.shadowBlur = 0;
}

// ─── 카운터 업데이트 ──────────────────────────────────────────────────
function updateCounter() {
    frameCounter.textContent = `${currentFrame + 1} / ${frameCount}`;
}

// ─── 재생 제어 ────────────────────────────────────────────────────────
playPauseBtn.addEventListener('click', () => {
    if (isPlaying) stopPlay();
    else startPlay();
});

prevFrameBtn.addEventListener('click', () => {
    stopPlay();
    currentFrame = (currentFrame - 1 + frameCount) % frameCount;
    drawFrame(currentFrame);
    drawHighlight(currentFrame);
    updateCounter();
});

nextFrameBtn.addEventListener('click', () => {
    stopPlay();
    currentFrame = (currentFrame + 1) % frameCount;
    drawFrame(currentFrame);
    drawHighlight(currentFrame);
    updateCounter();
});

function startPlay() {
    if (!srcImage) return;
    isPlaying = true;
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');

    const interval = 1000 / fps;
    animTimer = setInterval(() => {
        currentFrame = (currentFrame + 1) % frameCount;
        drawFrame(currentFrame);
        drawHighlight(currentFrame);
        updateCounter();
    }, interval);
}

function stopPlay() {
    isPlaying = false;
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    clearInterval(animTimer);
    animTimer = null;
}
