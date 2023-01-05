
const fun = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ "name": "123", "name2": "345" })
        }, 10000);
    })
}

export default fun