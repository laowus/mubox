

export const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWSYZabcdefghijklmnopqrstuvwsyz'
export const ALPHABET_NUMS = ALPHABETS + '01234567890'

/** 随机字符串
 * @param src 限定组成元素的字符串，如：ABCDEFGHIJKLMNOPQRSTUVWSYZ
 * @param len 长度
 */
export const randomText = (src, len) => {
    let result = []
    for (let i = 0; i < len; i++) {
        const index = Math.floor(Math.random() * (src.length - 1))
        result.push(src.charAt(index))
    }
    return result.join('')
}

/** 随机字符串: 只有大小写字母组成 */
export const randomTextWithinAlphabet = (len) => (randomText(ALPHABETS, len))

/** 随机字符串: 大小写字母和数字组成 */
export const randomTextWithinAlphabetNums = (len) => (randomText(ALPHABET_NUMS, len))

export const toTrimString = (value) => {
    value = value === 0 ? '0' : value
    return (value || '').toString().trim()
}



export const nextInt = (max) => {
    const limit = max < 1024 ? 1024 : max
    return parseInt(Math.random() * limit) % max
}