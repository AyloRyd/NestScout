export function handleDragAndDrop() {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const imageGallery = document.getElementById('image-gallery');
    const uploadDiv = document.querySelector('.upload');

    dropArea.addEventListener('click', (e) => {
        const currentImageCount = imageGallery.querySelectorAll('.image-container').length;
        if (currentImageCount >= 5) {
            e.stopPropagation();
            return;
        }
        if (
            e.target.tagName === 'IMG' ||
            e.target.closest('.delete-button')
        ) {
            e.stopPropagation();
            return;
        }
        fileInput.click();
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFiles, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropArea.classList.add('drag-over');
    }

    function unhighlight() {
        dropArea.classList.remove('drag-over');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        files = files.target ? files.target.files : files;

        const currentImageCount = imageGallery.querySelectorAll('.image-container').length;
        const filesToAdd = Math.min(files.length, 5 - currentImageCount);

        const dataTransfer = new DataTransfer();

        for (let i = 0; i < filesToAdd; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;

            dataTransfer.items.add(file);

            const reader = new FileReader();
            reader.onload = function (e) {
                const imageContainer = document.createElement('div');
                imageContainer.classList.add('image-container');

                const img = document.createElement('img');
                img.src = e.target.result;

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i style="font-size: 16px;">close</i>';
                deleteButton.classList.add('delete-button');
                deleteButton.addEventListener('click', () => {
                    imageContainer.remove();
                    updateUploadDiv();
                });

                imageContainer.appendChild(img);
                imageContainer.appendChild(deleteButton);

                const existingUploadDiv = imageGallery.querySelector('.upload');
                if (existingUploadDiv) {
                    existingUploadDiv.remove();
                }

                imageGallery.appendChild(imageContainer);
                updateUploadDiv();
            };
            reader.readAsDataURL(file);
        }

        fileInput.files = dataTransfer.files;
    }

    function updateUploadDiv() {
        const currentImageCount = imageGallery.querySelectorAll('.image-container').length;

        const existingUploadDiv = imageGallery.querySelector('.upload');
        if (existingUploadDiv) {
            existingUploadDiv.remove();
        }

        if (currentImageCount < 5) {
            imageGallery.appendChild(uploadDiv);
        }
    }

    updateUploadDiv();
}