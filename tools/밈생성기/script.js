document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const outputCanvas = document.getElementById('output-canvas');
    const previewSection = document.getElementById('preview-section');
    const ctx = outputCanvas.getContext('2d');

    let baseImg = null;

    document.getElementById('font-size').addEventListener('input', (e) => {
        document.getElementById('font-size-val').textContent = e.target.value;
    });

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                baseImg = new Image();
                baseImg.onload = () => generateBtn.disabled = false;
                baseImg.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    generateBtn.addEventListener('click', () => {
        if (!baseImg) return;

        outputCanvas.width = baseImg.width;
        outputCanvas.height = baseImg.height;
        ctx.drawImage(baseImg, 0, 0);

        const topText = document.getElementById('top-text').value.toUpperCase();
        const bottomText = document.getElementById('bottom-text').value.toUpperCase();
        const fontSize = parseInt(document.getElementById('font-size').value);
        const color = document.getElementById('text-color').value;

        ctx.font = `bold ${fontSize}px Impact, sans-serif`;
        ctx.fillStyle = color;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = fontSize / 15;
        ctx.textAlign = 'center';

        if (topText) {
            ctx.textBaseline = 'top';
            ctx.fillText(topText, outputCanvas.width / 2, 20);
            ctx.strokeText(topText, outputCanvas.width / 2, 20);
        }

        if (bottomText) {
            ctx.textBaseline = 'bottom';
            ctx.fillText(bottomText, outputCanvas.width / 2, outputCanvas.height - 20);
            ctx.strokeText(bottomText, outputCanvas.width / 2, outputCanvas.height - 20);
        }

        previewSection.style.display = 'block';
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'meme.png';
        link.href = outputCanvas.toDataURL();
        link.click();
    });
});
