document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log(document.querySelector('a.link img').setAttribute('src', '/assets/images/logo-light.png'))
    }, 1)
})
