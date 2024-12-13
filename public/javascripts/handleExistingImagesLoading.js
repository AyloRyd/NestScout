export function handleExistingImagesLoading() {
    const dropArea = document.querySelector(".edit-listing-drop-area");
    if (!dropArea) return;

    const imageGallery = dropArea.querySelector("#image-gallery");
    const uploadDiv = dropArea.querySelector(".upload");
    const imagePathsInput = dropArea.querySelector("#image-paths");

    if (!imagePathsInput || !imagePathsInput.value) return;

    const imagePaths = JSON.parse(imagePathsInput.value);

    function updateUploadDiv() {
        const currentImageCount = imageGallery.querySelectorAll(".image-container").length;
        const existingUploadDiv = imageGallery.querySelector(".upload");
        if (existingUploadDiv) {
            existingUploadDiv.remove();
        }

        if (currentImageCount < 5) {
            imageGallery.appendChild(uploadDiv);
        }
    }

    function createImageElement(path) {
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("image-container");

        const img = document.createElement("img");
        img.src = path;

        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = '<i style="font-size: 16px;">close</i>';
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", () => {
            imageContainer.remove();
            updateUploadDiv();

            const currentPaths = JSON.parse(document.querySelector("#existing-images").value);
            const updatedPaths = currentPaths.filter(p => p !== path);
            document.querySelector("#existing-images").value = JSON.stringify(updatedPaths);
        });

        imageContainer.appendChild(img);
        imageContainer.appendChild(deleteButton);

        imageGallery.appendChild(imageContainer);
        updateUploadDiv();
    }

    imagePaths.forEach(path => createImageElement(path));
    updateUploadDiv();
}