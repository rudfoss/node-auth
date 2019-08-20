// First we import the dependencies we need
const express = require("express")
const https = require("https")
const { MemoryStore } = require("express-session")
const { setupAuthFlowStrategy, generateCertificate } = require("@veracity/node-auth/helpers")

// Create our express instance
const app = express()

setupAuthFlowStrategy({
	appOrRouter: app,
	loginPath: "/login",
	strategySettings: { // Fill these inn with values from your Application Credential
		clientId: "",
		clientSecret: "",
		replyUrl: ""
	},
	sessionSettings: {
		secret: "ce4dd9d9-cac3-4728-a7d7-d3e6157a06d9", // Replace this with your own secret
		store: new MemoryStore() // Use memory store for local development
	}
})

// The root endpoint will return our user data so we can inspect it.
app.get("/", (req, res) => {
	res.send(req.user)
})

// Set up the HTTPS development server
const server = https.createServer({
	...generateCertificate() // Generate self-signed certificates for development
}, app)
server.on("error", (error) => { // If an error occurs halt the application
	console.error(error)
	process.exit(1)
})
server.listen(3000, () => { // Begin listening for connections
	console.log("Listening for connections on port 3000")
})