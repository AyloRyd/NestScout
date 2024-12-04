import { handleListingImagesCarousel } from './handleListingImagesCarousel.js';
import { handleCopyButton } from './handleCopyButton.js';
import { handleListingSaving } from './handleListingSaving.js';

document.addEventListener('DOMContentLoaded', function() {
    handleListingImagesCarousel();

    const copyButton = document.querySelector('.listing-page__copy-container');
    copyButton.addEventListener('click', function(event) {
        handleCopyButton(this);
    });

    handleListingSaving();
});