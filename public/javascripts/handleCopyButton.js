export function handleCopyButton(element) {
    event.preventDefault();

    const tempInput = document.createElement('input');
    tempInput.value = window.location.href;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    const icon = element.querySelector('i');
    const originalContent = icon.textContent;
    icon.textContent = 'done_all';

    setTimeout(() => {
        icon.textContent = originalContent;
    }, 3000);
}