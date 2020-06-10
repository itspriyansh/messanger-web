const BigInt = require("big-integer");

const base = 256;
let set = '';

for(let i=0;i<base;i++){
	set += String.fromCharCode(i);
}

exports.Encryption = (num, obj) => {
	let x = BigInt(num, base, set, true);
	let publicKey = BigInt(obj.public, base, set, true);
	let n = BigInt(obj.n, base, set, true);
	let y = x.modPow(publicKey, n).toString(base, set);
	return y;
};

exports.Decryption = (num, obj) => {
	let y = BigInt(num, base, set, true);
	let privateKey = BigInt(obj.private, base, set, true);
	let n = BigInt(obj.n, base, set, true);
	let z = y.modPow(privateKey, n).toString(base, set);
	return z;
};