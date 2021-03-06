import { NextFunction, Request, Response } from "express"
import { VIDPWebAppStrategyVerifier } from "../api"
import { VIDPError } from "../errors"
import { IMakeSessionConfigObjectOptions } from "../helpers"
import { IRouterLike } from "./IRouterLike"
import { IVIDPWebAppStrategySettings } from "./IVIDPWebAppStrategySettings"

export interface ISetupWebAppAuthSettings {
	/**
	 * An optional name for the strategy when registering with passport.
	 */
	name?: string
	/**
	 * The express application to configure or the router instance.
	 */
	app: IRouterLike
	/**
	 * Session configuration
	 */
	session: IMakeSessionConfigObjectOptions
	/**
	 * Configuration for the strategy you want to use.
	 */
	strategy: IVIDPWebAppStrategySettings

	/**
	 * The path where login will be configured
	 */
	loginPath?: string
	/**
	 * The path where logout will be configured
	 */
	logoutPath?: string

	/**
	 * Provide a function that executes before the login process starts.
	 * It executes as a middleware so remember to call next() when you are done.
	 */
	onBeforeLogin?: (req: Request & {veracityAuthState?: any}, res: Response, next: NextFunction) => void
	/**
	 * The verifier function passed to the strategy.
	 * If not defined will be a passthrough verifier that stores everything from the strategy on `req.user`.
	 */
	onVerify?: VIDPWebAppStrategyVerifier
	/**
	 * A route handler to execute once the login is completed.
	 * The default will route the user to the returnTo query parameter path or to the root path.
	 */
	onLoginComplete?: (req: Request & {veracityAuthState?: any}, res: Response, next: NextFunction) => void,
	/**
	 * A route handler to execute once the user tries to log out.
	 * The default handler will call `req.logout()` and redirect to the default Veracity central logout endpoint.
	 */
	onLogout?: (req: Request & {veracityAuthState?: any}, res: Response, next: NextFunction) => void,
	/**
	 * An error handler that is called if an error response is received from the Veracity IDP authentication redirect.
	 * If not defined will pass the error on to the default error handler in the app or router.
	 */
	onLoginError?: (error: VIDPError, req: Request, res: Response, next: NextFunction) => void
}
