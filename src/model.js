export async function setupModel(path) {
    function processModel(rawModel) {
        return {
        ...rawModel,
        bounds: {
            lr: getBounds(rawModel, "lr"),
            fb: getBounds(rawModel, "fb"),
            to: getBounds(rawModel, "to")
        }}
    }

    return fetch(path)
        .then(response => response.json())
        .then(data => processModel(data))
        .catch(error => console.error('Error fetching JSON:', error));
}

function getBounds(rawModel, key) {
    const sts = rawModel.statements;
    return [sts.map(x => x[key][0]), sts.map(x => x[key][1])]
}
