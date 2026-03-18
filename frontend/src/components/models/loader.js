const loader = (p) => {
    if (p) {
        document.getElementById('loader').classList.remove('hidden');
    } else {
        document.getElementById('loader').classList.add('hidden');
    }
}

export default loader;