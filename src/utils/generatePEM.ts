/**
 * These functions were copied and updated from:
 * https://github.com/AzureAD/passport-azure-ad/blob/dev/lib/aadutils.js
 *
 * Copyright (c) Microsoft Corporation
 *  All Rights Reserved
 *  MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT
 * OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const prepadSigned = (hexStr: string) => {
	const msb = hexStr[0]
	if (msb < "0" || msb > "7") {
		return `00${hexStr}`
	}
	return hexStr
}
const toHex = (num: number) => {
	const nstr = num.toString(16)
	if (nstr.length % 2) {
		return `0${nstr}`
	}
	return nstr
}
// encode ASN.1 DER length field
// if <=127, short form
// if >=128, long form
const encodeLengthHex = (n: number) => {
	if (n <= 127) {
		return toHex(n)
	}
	const nHex = toHex(n)
	const lengthOfLengthByte = 128 + nHex.length / 2 // 0x80+numbytes
	return toHex(lengthOfLengthByte) + nHex
}

/**
 * Generates a public key based on the given modulus and exponent as base 64 encoded values.
 * @param modulusB64
 * @param exponentB64
 * @returns The public key as a string
 */
export const generatePEM = (modulusB64: string, exponentB64: string) => {
	// new Buffer replaced with Buffer.from
	// https://nodejs.org/fr/docs/guides/buffer-constructor-deprecation/
	const modulus = Buffer.from(modulusB64, "base64")
	const exponent = Buffer.from(exponentB64, "base64")

	const modulusHex = prepadSigned(modulus.toString("hex"))
	const exponentHex = prepadSigned(exponent.toString("hex"))

	const modlen = modulusHex.length / 2
	const explen = exponentHex.length / 2

	const encodedModlen = encodeLengthHex(modlen)
	const encodedExplen = encodeLengthHex(explen)
	const encodedPubkey = `30${encodeLengthHex(
					modlen +
					explen +
					encodedModlen.length / 2 +
					encodedExplen.length / 2 + 2
				)}02${encodedModlen}${modulusHex}02${encodedExplen}${exponentHex}`

	const derB64 = Buffer.from(encodedPubkey, "hex").toString("base64")

	const pem = `-----BEGIN RSA PUBLIC KEY-----\n${derB64.match(/.{1,64}/g)!.join("\n")}\n-----END RSA PUBLIC KEY-----\n`
	return pem
}
