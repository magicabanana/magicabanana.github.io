document.addEventListener('DOMContentLoaded', () => {
    const mainFileInput = document.getElementById('main-file-input');
    const dropZone = document.getElementById('drop-zone');
    const applyBtn = document.getElementById('apply-btn');
    const downloadBtn = document.getElementById('download-btn');
    const outputCanvas = document.getElementById('output-canvas');
    const previewSection = document.getElementById('preview-section');
    const ctx = outputCanvas.getContext('2d');

    let mainImg = null;
    let wmImg = null;
    let currentPos = 'mc';
    let currentTab = 'text';

    // UI Logic
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
            currentTab = btn.dataset.tab;
        });
    });

    document.querySelectorAll('.pos-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pos-btn').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            currentPos = btn.dataset.pos;
        });
    });

    document.getElementById('wm-opacity').addEventListener('input', (e) => {
        document.getElementById('opacity-val').textContent = e.target.value;
    });

    dropZone.addEventListener('click', () => mainFileInput.click());
    mainFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                mainImg = new Image();
                mainImg.onload = () => applyBtn.disabled = false;
                mainImg.src = ev.target.result;
                document.getElementById('main-file-info').style.display = 'block';
                document.getElementById('main-file-name').textContent = file.name;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('wm-file-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                wmImg = new Image();
                wmImg.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    applyBtn.addEventListener('click', () => {
        if (!mainImg) return;

        outputCanvas.width = mainImg.width;
        outputCanvas.height = mainImg.height;
        ctx.drawImage(mainImg, 0, 0);

        const opacity = document.getElementById('wm-opacity').value / 100;
        ctx.globalAlpha = opacity;

        if (currentTab === 'text') {
            const text = document.getElementById('wm-text').value || 'Watermark';
            const color = document.getElementById('wm-color').value;
            const size = parseInt(document.getElementById('wm-font-size').value);
            
            ctx.font = `bold ${size}px serif`;
            ctx.fillStyle = color;
            ctx.textBaseline = 'middle';
            
            const metrics = ctx.measureText(text);
            const w = metrics.width;
            const h = size;
            
            const pos = getXY(currentPos, w, h, mainImg.width, mainImg.height, 20);
            ctx.fillText(text, pos.x, pos.y + h/2);
        } else if (wmImg) {
            const w = wmImg.width;
            const h = wmImg.height;
            const pos = getXY(currentPos, w, h, mainImg.width, mainImg.height, 20);
            ctx.drawImage(wmImg, pos.x, pos.y);
        }

        ctx.globalAlpha = 1.0;
        previewSection.style.display = 'block';
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'watermarked_image.png';
        link.href = outputCanvas.toDataURL();
        link.click();
    });

    function getXY(pos, w, h, dw, dh, margin) {
        let x, y;
        const middleX = (dw - w) / 2;
        const middleY = (dh - h) / 2;

        switch (pos) {
            case 'tl': x = margin; y = margin; break;
            case 'tc': x = middleX; y = margin; break;
            case 'tr': x = dw - w - margin; y = margin; break;
            case 'ml': x = margin; y = middleY; break;
            case 'mc': x = middleX; y = middleY; break;
            case 'mr': x = dw - w - margin; y = middleY; break;
            case 'bl': x = margin; y = dh - h - margin; break;
            case 'bc': x = middleX; y = dh - h - margin; break;
            case 'br': x = dw - w - margin; y = dh - h - margin; break;
        }
        return { x, y };
    }
});
