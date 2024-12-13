import { handleListingImagesCarousel } from './handleListingImagesCarousel.js';
import { handleCopyButton } from './handleCopyButton.js';
import { handleListingSaving } from './handleListingSaving.js';
import { handleChipsInListingCreating } from './handleChipsInListingCreating.js';
import { handleListingTotalPriceCalculation } from './handleListingTotalPriceCalculation.js';
import { handleDragAndDrop } from './handleDragAndDrop.js';
import { handleExistingImagesLoading } from "./handleExistingImagesLoading.js";

document.addEventListener('DOMContentLoaded', handleListingImagesCarousel);
document.addEventListener('DOMContentLoaded', handleCopyButton);
document.addEventListener('DOMContentLoaded', handleListingSaving);
document.addEventListener('DOMContentLoaded', handleChipsInListingCreating);
document.addEventListener('DOMContentLoaded', handleListingTotalPriceCalculation);
document.addEventListener('DOMContentLoaded', handleDragAndDrop);
document.addEventListener('DOMContentLoaded', handleExistingImagesLoading);