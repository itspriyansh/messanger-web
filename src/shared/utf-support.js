const UtfString = require('utfstring');
// const LZUTF8 = require('lzutf8');

const utf8Limit = 256;

const getGroupCount = (encoding) => {
    return (encoding === 'utf-16' ? 2 : (encoding === 'utf-24' ? 3 : 4));
}

exports.encodeString = (string, encoding) => {
    if(encoding === 'utf-8') return string;
    let encoded = '';
    const group = getGroupCount(encoding);
    for(let i=0;i<string.length;i+=group) {
        let charCode = 0;
        for(let j=0;j<group;j++){
            charCode = charCode*utf8Limit + string.charCodeAt(i+j);
        }
        encoded += UtfString.fromCharCode(charCode);
    }
    return encoded;
}

exports.decodeString= (string, encoding) => {
    if(encoding === 'utf-8') return string;
    let decoded = '';
    const group = getGroupCount(encoding);
    for(let i=0;i<UtfString.length(string);i++) {
        const charCode = UtfString.charCodeAt(string, i);
        for(let j=group;j>0;j--) {
            decoded += String.fromCharCode((charCode%Math.pow(utf8Limit, j))/Math.pow(utf8Limit, j-1));
        }
    }
    return decoded;
}