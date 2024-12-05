export function handleChipsInListingCreating() {
    const amenityButtons = document.querySelectorAll('.amenity');

    amenityButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('fill')) {
                button.classList.remove('fill');
            } else {
                button.classList.add('fill');
            }
        });
    });

    const form = document.querySelector('.listing-create-form');
    form.addEventListener('submit', () => {
        const selectedAmenities = [];

        amenityButtons.forEach(button => {
            if (button.classList.contains('fill')) {
                selectedAmenities.push(button.getAttribute('data-amenity-id'));
            }
        });

        const existingAmenitiesInput = form.querySelector('input[name="amenities[]"]');
        if (existingAmenitiesInput) {
            existingAmenitiesInput.remove();
        }

        const amenitiesInput = document.createElement('input');
        amenitiesInput.type = 'hidden';
        amenitiesInput.name = 'amenities[]';
        amenitiesInput.value = selectedAmenities.join(',');

        form.appendChild(amenitiesInput);
    });
}