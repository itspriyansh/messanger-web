const tables = require('./tables');
const UtfSupport = require('./utf-support');

const AddKey = (obj, begin) => {
	let text = '';
	for(let i=0;i<16;i++){
		text += String.fromCharCode(obj.text.charCodeAt(i) ^ obj.key.charCodeAt(begin+i));
	}
	obj.text = text;
};

const ByteSub = (obj) => {
	let text = '';
	for(let i=0;i<16;i++){
		text += String.fromCharCode(tables.sbox[obj.text.charCodeAt(i)]);
	}
	obj.text = text;
};

const ShiftRows = (obj) => {
	let result = '';
	// 1st Column
	result += obj.text[0];
	result += obj.text[5];
	result += obj.text[10];
	result += obj.text[15];

	// 2nd Column
	result += obj.text[4];
	result += obj.text[9];
	result += obj.text[14];
	result += obj.text[3];

	// 3rd Column
	result += obj.text[8];
	result += obj.text[13];
	result += obj.text[2];
	result += obj.text[7];

	// 4rt Column
	result += obj.text[12];
	result += obj.text[1];
	result += obj.text[6];
	result += obj.text[11];

	return result;
};

const MixCol = (obj) => {
	let tmp = '';
	tmp += String.fromCharCode(tables.mul2[obj.text.charCodeAt(0)] ^ tables.mul3[obj.text.charCodeAt(1)] ^ obj.text.charCodeAt(2) ^ obj.text.charCodeAt(3));
	tmp += String.fromCharCode(obj.text.charCodeAt(0) ^ tables.mul2[obj.text.charCodeAt(1)] ^ tables.mul3[obj.text.charCodeAt(2)] ^ obj.text.charCodeAt(3));
	tmp += String.fromCharCode(obj.text.charCodeAt(0) ^ obj.text.charCodeAt(1) ^ tables.mul2[obj.text.charCodeAt(2)] ^ tables.mul3[obj.text.charCodeAt(3)]);
	tmp += String.fromCharCode(tables.mul3[obj.text.charCodeAt(0)] ^ obj.text.charCodeAt(1) ^ obj.text.charCodeAt(2) ^ tables.mul2[obj.text.charCodeAt(3)]);

	tmp += String.fromCharCode(tables.mul2[obj.text.charCodeAt(4)] ^ tables.mul3[obj.text.charCodeAt(5)] ^ obj.text.charCodeAt(6) ^ obj.text.charCodeAt(7));
	tmp += String.fromCharCode(obj.text.charCodeAt(4) ^ tables.mul2[obj.text.charCodeAt(5)] ^ tables.mul3[obj.text.charCodeAt(6)] ^ obj.text.charCodeAt(7));
	tmp += String.fromCharCode(obj.text.charCodeAt(4) ^ obj.text.charCodeAt(5) ^ tables.mul2[obj.text.charCodeAt(6)] ^ tables.mul3[obj.text.charCodeAt(7)]);
	tmp += String.fromCharCode(tables.mul3[obj.text.charCodeAt(4)] ^ obj.text.charCodeAt(5) ^ obj.text.charCodeAt(6) ^ tables.mul2[obj.text.charCodeAt(7)]);

	tmp += String.fromCharCode(tables.mul2[obj.text.charCodeAt(8)] ^ tables.mul3[obj.text.charCodeAt(9)] ^ obj.text.charCodeAt(10) ^ obj.text.charCodeAt(11));
	tmp += String.fromCharCode(obj.text.charCodeAt(8) ^ tables.mul2[obj.text.charCodeAt(9)] ^ tables.mul3[obj.text.charCodeAt(10)] ^ obj.text.charCodeAt(11));
	tmp += String.fromCharCode(obj.text.charCodeAt(8) ^ obj.text.charCodeAt(9) ^ tables.mul2[obj.text.charCodeAt(10)] ^ tables.mul3[obj.text.charCodeAt(11)]);
	tmp += String.fromCharCode(tables.mul3[obj.text.charCodeAt(8)] ^ obj.text.charCodeAt(9) ^ obj.text.charCodeAt(10) ^ tables.mul2[obj.text.charCodeAt(11)]);

	tmp += String.fromCharCode(tables.mul2[obj.text.charCodeAt(12)] ^ tables.mul3[obj.text.charCodeAt(13)] ^ obj.text.charCodeAt(14) ^ obj.text.charCodeAt(15));
	tmp += String.fromCharCode(obj.text.charCodeAt(12) ^ tables.mul2[obj.text.charCodeAt(13)] ^ tables.mul3[obj.text.charCodeAt(14)] ^ obj.text.charCodeAt(15));
	tmp += String.fromCharCode(obj.text.charCodeAt(12) ^ obj.text.charCodeAt(13) ^ tables.mul2[obj.text.charCodeAt(14)] ^ tables.mul3[obj.text.charCodeAt(15)]);
	tmp += String.fromCharCode(tables.mul3[obj.text.charCodeAt(12)] ^ obj.text.charCodeAt(13) ^ obj.text.charCodeAt(14) ^ tables.mul2[obj.text.charCodeAt(15)]);

	return tmp;
};

const Round = (obj, begin) => {
	ByteSub(obj);
	obj.text = ShiftRows(obj);
	obj.text = MixCol(obj);
	AddKey(obj, begin);
};

const FinalRound = (obj, begin) => {
	ByteSub(obj);
	obj.text = ShiftRows(obj);
	AddKey(obj, begin);
};

const AESEncrypt = (obj) => {
	let numRounds = 13;
	AddKey(obj, 0);
	// Rounds 1-13
	for(let i=0;i<numRounds;i++){
		Round(obj, 16*(i+1));
	}
	FinalRound(obj, 224);
	return obj.text;
};

const InvByteSub = (obj) => {
	let text = '';
	for(let i=0;i<16;i++){
		text += String.fromCharCode(tables.invSbox[obj.text.charCodeAt(i)]);
	}
	obj.text = text;
};

const InvShiftRows = (obj) => {
	let result = '';
	result += obj.text[0];
	result += obj.text[13];
	result += obj.text[10];
	result += obj.text[7];

	// 2nd Column
	result += obj.text[4];
	result += obj.text[1];
	result += obj.text[14];
	result += obj.text[11];

	// 3rd Column
	result += obj.text[8];
	result += obj.text[5];
	result += obj.text[2];
	result += obj.text[15];

	// 4rt Column
	result += obj.text[12];
	result += obj.text[9];
	result += obj.text[6];
	result += obj.text[3];

	return result;
};

const InvMixCol = (obj) => {
	let tmp = '';
	tmp += String.fromCharCode(tables.mul14[obj.text.charCodeAt(0)] ^ tables.mul11[obj.text.charCodeAt(1)] ^ tables.mul13[obj.text.charCodeAt(2)] ^ tables.mul9[obj.text.charCodeAt(3)]);
	tmp += String.fromCharCode(tables.mul9[obj.text.charCodeAt(0)] ^ tables.mul14[obj.text.charCodeAt(1)] ^ tables.mul11[obj.text.charCodeAt(2)] ^ tables.mul13[obj.text.charCodeAt(3)]);
	tmp += String.fromCharCode(tables.mul13[obj.text.charCodeAt(0)] ^ tables.mul9[obj.text.charCodeAt(1)] ^ tables.mul14[obj.text.charCodeAt(2)] ^ tables.mul11[obj.text.charCodeAt(3)]);
	tmp += String.fromCharCode(tables.mul11[obj.text.charCodeAt(0)] ^ tables.mul13[obj.text.charCodeAt(1)] ^ tables.mul9[obj.text.charCodeAt(2)] ^ tables.mul14[obj.text.charCodeAt(3)]);

	tmp += String.fromCharCode(tables.mul14[obj.text.charCodeAt(4)] ^ tables.mul11[obj.text.charCodeAt(5)] ^ tables.mul13[obj.text.charCodeAt(6)] ^ tables.mul9[obj.text.charCodeAt(7)]);
	tmp += String.fromCharCode(tables.mul9[obj.text.charCodeAt(4)] ^ tables.mul14[obj.text.charCodeAt(5)] ^ tables.mul11[obj.text.charCodeAt(6)] ^ tables.mul13[obj.text.charCodeAt(7)]);
	tmp += String.fromCharCode(tables.mul13[obj.text.charCodeAt(4)] ^ tables.mul9[obj.text.charCodeAt(5)] ^ tables.mul14[obj.text.charCodeAt(6)] ^ tables.mul11[obj.text.charCodeAt(7)]);
	tmp += String.fromCharCode(tables.mul11[obj.text.charCodeAt(4)] ^ tables.mul13[obj.text.charCodeAt(5)] ^ tables.mul9[obj.text.charCodeAt(6)] ^ tables.mul14[obj.text.charCodeAt(7)]);

	tmp += String.fromCharCode(tables.mul14[obj.text.charCodeAt(8)] ^ tables.mul11[obj.text.charCodeAt(9)] ^ tables.mul13[obj.text.charCodeAt(10)] ^ tables.mul9[obj.text.charCodeAt(11)]);
	tmp += String.fromCharCode(tables.mul9[obj.text.charCodeAt(8)] ^ tables.mul14[obj.text.charCodeAt(9)] ^ tables.mul11[obj.text.charCodeAt(10)] ^ tables.mul13[obj.text.charCodeAt(11)]);
	tmp += String.fromCharCode(tables.mul13[obj.text.charCodeAt(8)] ^ tables.mul9[obj.text.charCodeAt(9)] ^ tables.mul14[obj.text.charCodeAt(10)] ^ tables.mul11[obj.text.charCodeAt(11)]);
	tmp += String.fromCharCode(tables.mul11[obj.text.charCodeAt(8)] ^ tables.mul13[obj.text.charCodeAt(9)] ^ tables.mul9[obj.text.charCodeAt(10)] ^ tables.mul14[obj.text.charCodeAt(11)]);

	tmp += String.fromCharCode(tables.mul14[obj.text.charCodeAt(12)] ^ tables.mul11[obj.text.charCodeAt(13)] ^ tables.mul13[obj.text.charCodeAt(14)] ^ tables.mul9[obj.text.charCodeAt(15)]);
	tmp += String.fromCharCode(tables.mul9[obj.text.charCodeAt(12)] ^ tables.mul14[obj.text.charCodeAt(13)] ^ tables.mul11[obj.text.charCodeAt(14)] ^ tables.mul13[obj.text.charCodeAt(15)]);
	tmp += String.fromCharCode(tables.mul13[obj.text.charCodeAt(12)] ^ tables.mul9[obj.text.charCodeAt(13)] ^ tables.mul14[obj.text.charCodeAt(14)] ^ tables.mul11[obj.text.charCodeAt(15)]);
	tmp += String.fromCharCode(tables.mul11[obj.text.charCodeAt(12)] ^ tables.mul13[obj.text.charCodeAt(13)] ^ tables.mul9[obj.text.charCodeAt(14)] ^ tables.mul14[obj.text.charCodeAt(15)]);

	return tmp;
};

const InvRound = (obj, begin) => {
	AddKey(obj, begin);
	obj.text = InvMixCol(obj);
	obj.text = InvShiftRows(obj);
	InvByteSub(obj);
};

const InvFirstRound = (obj, begin) => {
	AddKey(obj, begin);
	obj.text = InvShiftRows(obj);
	InvByteSub(obj);
};

const AESDecrypt = (obj) => {
	let numRounds = 13;
	InvFirstRound(obj, 224);
	// Rounds 2-14
	for(let i=numRounds-1;i>=0;i--){
		InvRound(obj, 16*(i+1));
	}
	AddKey(obj, 0);
	return obj.text;
};

exports.EncryptMain = (obj, encoding='utf-8') => {
	let text = UtfSupport.decodeString(obj.text, encoding);
	let count = 0;
	while(text.length%16 !== 0){
		text += String.fromCharCode(0);
		count++;
	}
	let subKeys = tables.KeyWhitening_256(obj.key);
	let cipher = '';
	let context = {key: subKeys};
	for(let i=0;i<text.length;i+=16){
		context.text = text.slice(i, i+16);
		cipher += AESEncrypt(context);
	}
	cipher += String.fromCharCode(count);
	return cipher;
};

exports.DecryptMain = (obj, encoding='utf-8') => {
	let count = obj.text.charCodeAt(obj.text.length-1);
	obj.text = obj.text.slice(0, -1);
	let subKeys = tables.KeyWhitening_256(obj.key);
	let data = '';
	let context = {key: subKeys};
	for(let i=0;i<obj.text.length;i+=16){
		context.text = obj.text.slice(i, i+16);
		data += AESDecrypt(context);
	}
	if(count>0) data = data.slice(0, -1*count);
	data = UtfSupport.encodeString(data, encoding);
	return data;
};

exports.generateRandomKey = () => {
	let key = '';
	for(let i=0;i<32;i++) {
		const charCode = Math.floor(Math.random() * 128);
		key += String.fromCharCode(charCode);
	}
	return key;
}