document.addEventListener('DOMContentLoaded', () => {
    const modalFiles = [
        'news.html',
        'ssc.html',
        'cms.html',
        'lms.html',
        'safe.html',
        'submarine.html',
        'utility-apps.html',
        'sav-e.html',
        'freenet.html',
        'chikka.html',
        'paymaya-sdk.html',
        'powerapp.html',
        'parkplus.html',
        'mypal.html',
        'safezone.html',
        'smartnet.html'
    ];

    const modalContainer = document.createElement('div');
    modalContainer.id = 'modal-container';
    document.body.appendChild(modalContainer);

    modalFiles.forEach(file => {
        fetch(`modals/${file}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load modal: ${file}`);
                }
                return response.text();
            })
            .then(html => {
                modalContainer.insertAdjacentHTML('beforeend', html);
            })
            .catch(error => {
                console.error('Error loading modal:', error);
            });
    });
});
