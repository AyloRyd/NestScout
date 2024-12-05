export function handleCopyButton() {
    const copyButton = document.querySelector('.listing-page__copy-container');
    copyButton.addEventListener('click', function(event) {
        event.preventDefault();

        const tempInput = document.createElement('input');
        tempInput.value = window.location.href;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        const icon = this.querySelector('i');
        const originalContent = icon.textContent;
        icon.textContent = 'done_all';

        setTimeout(() => {
            icon.textContent = originalContent;
        }, 3000);
    });
}