/**
 * This is a helper function that generates developer certificates using node-forge.
 * It is NOT intended for production use.
 */

import forge from "node-forge"

/**
 * Generates a {key, pem} self-signed certificate set for use with development only!
 * Requires dependency node-forge
 */
export const generateCertificate = () => {
	if (process.env.NODE_ENV === "production") {
		console.warn("The generateCertificate utility should not be used for production code.")
	}

	const pki = forge.pki
	const keys = pki.rsa.generateKeyPair(2048)
	const cert = pki.createCertificate()

	cert.publicKey = keys.publicKey
	cert.serialNumber = Date.now().toString()
	cert.validity.notBefore = new Date()
	cert.validity.notAfter = new Date()
	cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)

	const attrs = [
		{
			name: "commonName",
			value: "veracity"
		},
		{
			name: "countryName",
			value: "NO"
		},
		{
			name: "localityName",
			value: "Hovik"
		},
		{
			name: "organizationName",
			value: "Veracity"
		}
	]

	cert.setSubject(attrs)
	cert.setIssuer(attrs)
	cert.setExtensions([
		{
			name: "basicConstraints",
			cA: true
		},
		{
			name: "keyUsage",
			keyCertSign: true,
			digitalSignature: true,
			nonRepudiation: true,
			keyEncipherment: true,
			dataEncipherment: true
		},
		{
			name: "extKeyUsage",
			serverAuth: true,
			clientAuth: true,
			codeSigning: true,
			emailProtection: true,
			timeStamping: true
		},
		{
			name: "nsCertType",
			client: true,
			server: true,
			email: true,
			objsign: true,
			sslCA: true,
			emailCA: true,
			objCA: true
		},
		{
			name: "subjectAltName",
			altNames: [
				{
					type: 6, // URI
					value: "http://example.org/webid#me"
				},
				{
					type: 7, // IP
					ip: "127.0.0.1"
				}
			]
		},
		{
			name: "subjectKeyIdentifier"
		}
	])

	cert.sign(keys.privateKey, forge.md.sha256.create())
	const privPem = pki.privateKeyToPem(keys.privateKey)
	const certPem = pki.certificateToPem(cert)

	return {
		key: privPem,
		cert: certPem
	}
}

export default generateCertificate
