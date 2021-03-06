import nanoid from "nanoid"

/**
 * Generates a unique string that can serve as an id or nonce.
 * This is an alias for nanoid to abstract away the library dependency.
 */
export const createUid = () => (
	nanoid()
)
