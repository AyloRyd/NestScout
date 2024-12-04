export function handleListingSaving() {
    const favoriteIcon = document.querySelector('#favorite-icon');
    const userId = document.getElementById('user-data').getAttribute('data-user-id');
    const listingId = document.getElementById('listing-data').getAttribute('data-listing-id');
    let isSaved = favoriteIcon.classList.contains('saved');

    favoriteIcon.addEventListener('click', async () => {
        try {
            if (isSaved) {
                const response = await axios.delete('/saved-listings/remove', {
                    data: {
                        userId: userId,
                        listingId: listingId,
                    },
                });

                console.log(response.data.message);
                favoriteIcon.classList.remove('saved');
                favoriteIcon.textContent = 'favorite';
                isSaved = false;
            } else {
                const response = await axios.post('/saved-listings/save', {
                    userId: userId,
                    listingId: listingId,
                });

                console.log(response.data.message);
                favoriteIcon.classList.add('saved');
                favoriteIcon.textContent = 'favorite_border';
                isSaved = true;
            }
        } catch (error) {
            console.error('Error saving/removing listing:', error);
            alert('Error processing the request.');
        }
    })
}