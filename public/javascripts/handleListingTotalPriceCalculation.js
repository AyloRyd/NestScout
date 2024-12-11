export function handleListingTotalPriceCalculation() {
    const pricePerNight = document.getElementById('listing-data').getAttribute('data-listing-price_per_night');
    const totalPriceElement = document.getElementById('total-price');
    const checkInInput = document.getElementById('check_in');
    const checkOutInput = document.getElementById('check_out');

    function calculateTotalPrice() {
        const checkInDate = new Date(checkInInput.value);
        const checkOutDate = new Date(checkOutInput.value);

        const nights = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);

        if (nights > 0) {
            totalPriceElement.textContent = `$${(pricePerNight * nights).toFixed(2)} total`;
        } else {
            totalPriceElement.textContent = '$0 total';
        }
    }

    checkInInput.addEventListener('change', calculateTotalPrice);
    checkOutInput.addEventListener('change', calculateTotalPrice);
}