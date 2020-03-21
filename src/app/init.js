if ('serviceWorker' in navigator) {
    console.log('Registering Service Worker ...');
    navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
            console.log('... Registration succeeded. Scope is', reg.scope);
        }).catch((error) => {
            console.log('... Registration failed with', error);
        });
} else {
    console.log("Service Workers are not available");
}
