

// Display username on page load
window.onload = () => {
    const username = localStorage.getItem('username');
    if (username) {
        const welcomeUser  = document.getElementById('welcomeUser ');
        if (welcomeUser ) {
            welcomeUser .textContent = `Welcome, ${username}`;
            welcomeUser .style.display = 'block';
        }
        ['loginNav', 'registerNav'].forEach((id) => {
            const navElement = document.getElementById(id);
            if (navElement) navElement.style.display = 'none';
        });
    }
};





// Menu toggle functionality
document.querySelector('#menu-btn')?.onclick = () => {
    document.querySelector('.header .menu')?.classList.toggle('active');
};

// Remove menu on scroll
window.onscroll = () => {
    document.querySelector('.header .menu')?.classList.remove('active');
};

// Limit input length for number inputs
document.querySelectorAll('input[type="number"]').forEach((inputNumber) => {
    inputNumber.oninput = () => {
        if (inputNumber.value.length > inputNumber.maxLength) {
            inputNumber.value = inputNumber.value.slice(0, inputNumber.maxLength);
        }
    };
});

// Thumbnail image click to change main image
document.querySelectorAll('.view-property .details .thumb .small-images img').forEach((images) => {
    images.onclick = () => {
        const src = images.getAttribute('src');
        document.querySelector('.view-property .details .thumb .big-image img').src = src;
    };
});

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = messageg;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}
