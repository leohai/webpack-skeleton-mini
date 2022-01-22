module.exports = {
    sleep: (duration) => {
        return new Promise((resolve) => {
            setTimeout(resolve, duration)
        })
    }
} 