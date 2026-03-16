document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const originalName = document.getElementById('original-name');
    const originalSize = document.getElementById('original-size');
    
    const qualityRange = document.getElementById('quality-range');
    const qualityValue = document.getElementById('quality-value');
    const scaleRange = document.getElementById('scale-range');
    const scaleValue = document.getElementById('scale-value');
    const formatSelect = document.getElementById('format-select');
    
    const compressBtn = document.getElementById('compress-btn');
    const downloadBtn = document.getElementById('download-btn');
    const previewSection = document.getElementById('preview-section');
    
    const outputCanvas = document.getElementById('output-canvas');
    const ctx = outputCanvas.getContext('2d');
    
    const newSizeLabel = document.getElementById('new-size');
    const reductionLabel = document.getElementById('reduction-percent');

    let originalImage = null;
    let fileName = '';
    let originalByteSize = 0;

    // UI Events
    dropZone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--border)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    qualityRange.addEventListener('input', () => {
        qualityValue.textContent = qualityRange.value;
    });

    scaleRange.addEventListener('input', () => {
        scaleValue.textContent = scaleRange.value;
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) return;
        
        fileName = file.name;
        originalByteSize = file.size;
        originalName.textContent = fileName;
        originalSize.textContent = (originalByteSize / 1024).toFixed(2) + ' KB';
        fileInfo.style.display = 'flex';
        
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage = new Image();
            originalImage.onload = () => {
                compressBtn.disabled = false;
            };
            originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    compressBtn.addEventListener('click', () => {
        if (!originalImage) return;

        const scale = scaleRange.value / 100;
        const quality = qualityRange.value / 100;
        const format = formatSelect.value;

        const targetWidth = originalImage.width * scale;
        const targetHeight = originalImage.height * scale;

        outputCanvas.width = targetWidth;
        outputCanvas.height = targetHeight;
        
        ctx.clearRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);

        outputCanvas.toBlob((blob) => {
            const newByteSize = blob.size;
            newSizeLabel.textContent = `줄어든 용량: ${(newByteSize / 1024).toFixed(2)} KB`;
            
            const reduction = ((1 - newByteSize / originalByteSize) * 100).toFixed(1);
            reductionLabel.textContent = `(-${reduction}%)`;
            
            previewSection.style.display = 'block';
            
            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.download = `compressed_${fileName.split('.')[0]}.${format.split('/')[1]}`;
                link.href = URL.createObjectURL(blob);
                link.click();
            };
        }, format, quality);
    });
});
