import { CoreOptions, UrlOptions } from "request"
import request from "request-promise-native"
import { mockAuthFlowStrategySettings } from "../../test/mockAuthFlowStrategySettings"
import {
	endpointJWK,
	endpointMeta,
	mockFullMetadata,
	mockJWKResponse,
	mockMetaResponse
} from "../../test/mockB2CResponses"
import { IB2CLoginRequestParamaters, IVeracityAuthFlowSessionData } from "../interfaces"
import { VeracityAuthFlowStrategyContext } from "./VeracityAuthFlowStrategyContext"

const verifier: jest.Mock = mockAuthFlowStrategySettings.verifier as any

jest.mock("request-promise-native")
const requestMock: jest.Mock = request as any
requestMock.mockImplementation((options: UrlOptions & CoreOptions) => {
	const {url} = options
	if (url === endpointMeta) {
		return Promise.resolve(JSON.stringify(mockMetaResponse))
	}
	if (url === endpointJWK) {
		return Promise.resolve(JSON.stringify(mockJWKResponse))
	}

	throw new Error(`Endpoint url not mocked "${url}"`)
})

const mockRequest = {
	body: "",
	session: {}
} as any

describe("VeracityAuthFlowStrategyContext", () => {
	beforeEach(() => {
		verifier.mockReset()
		mockRequest.body = ""
		mockRequest.session = {}
	})
	test("is defined", () => {
		expect(typeof VeracityAuthFlowStrategyContext).toBe("function")
	})
	test("can be instansiated", () => {
		expect(() => (
			new VeracityAuthFlowStrategyContext(mockRequest, mockAuthFlowStrategySettings)
		)).not.toThrow()
	})
	test("nonce that is not recomputed", () => {
		const context = new VeracityAuthFlowStrategyContext(mockRequest, mockAuthFlowStrategySettings)
		const nonce = context.nonce
		expect(typeof nonce).toBe("string")
		const nextNonce = context.nonce
		expect(nonce).toBe(nextNonce)
	})
	test("state that is not recomputed", () => {
		const context = new VeracityAuthFlowStrategyContext(mockRequest, mockAuthFlowStrategySettings)
		const state = context.state
		expect(typeof state).toBe("string")
		const nextState = context.state
		expect(state).toBe(nextState)
	})
	describe("initial state", () => {
		let context: VeracityAuthFlowStrategyContext = {} as any
		beforeEach(() => {
			context = new VeracityAuthFlowStrategyContext(mockRequest, mockAuthFlowStrategySettings)
		})
		test("idToken returns nothing", () => {
			expect(context.idToken).not.toBeDefined()
		})
		test("readyTokens returns empty array", () => {
			expect(context.readyTokens).toEqual([])
		})
		test("nextAPIScope returns the first scope", () => {
			expect(context.nextAPIScope).toEqual(mockAuthFlowStrategySettings.apiScopes![0])
		})
		test("nextAPIScope returns undefiend if no api scopess are defined", () => {
			const contextWithoutScopes = new VeracityAuthFlowStrategyContext(mockRequest, {
				...mockAuthFlowStrategySettings,
				apiScopes: undefined
			} as any)
			expect(contextWithoutScopes.nextAPIScope).not.toBeDefined()
		})
		test("hasMoreAPIScopes returns true if there are any api scopes", () => {
			expect(context.hasMoreAPIScopes).toBe(true)
		})
		test("loginParams produce correct parameters", () => {
			const expected: IB2CLoginRequestParamaters = {
				client_id: mockAuthFlowStrategySettings.clientId,
				nonce: context.nonce,
				state: context.state,
				scope: `openid offline_access ${mockAuthFlowStrategySettings.apiScopes![0]}`,
				redirect_uri: mockAuthFlowStrategySettings.redirectUri,
				response_mode: "form_post",
				response_type: "code id_token"
			}
			expect(context.loginParams).toEqual(expected)
		})
		test("isB2CLoginResponse returns false", () => {
			expect(context.isB2CLoginResponse).toBe(false)
		})
		test("isB2CFailureResponse returns false", () => {
			expect(context.isB2CFailureResponse).toBe(false)
		})
		test("getClosestMetadata", async () => {
			const meta = await context.getClosestMetadata()
			const expected = mockFullMetadata
			expect(meta).toEqual(expected)
		})
		test("next", async () => {
			const nextResult = await context.next()
			expect(typeof nextResult).toBe("string")
			// tslint:disable-next-line: max-line-length
			expect(nextResult).toEqual(`https://login.microsoftonline.com/dummy-tenant-id/oauth2/v2.0/authorize?p=dummy-policy&client_id=dummy-client-id&redirect_uri=https%3A%2F%2Fdummy-redirect-uri.com&response_type=code%20id_token&response_mode=form_post&scope=openid%20offline_access%20mock-scope-1&state=${context.state}&nonce=${context.nonce}`)
		})
	})
	describe("login return state", () => {
		beforeEach(() => {
			const sessionData: IVeracityAuthFlowSessionData = {
				lastIdToken: undefined,
				lastIdTokenDecoded: undefined,
				metadata: mockFullMetadata,
				state: "dummy-state",
				nonce: "dummy-nonce"
			} as any
			mockRequest.body = {}
			mockRequest.session.veracity_session_authflow = {
			}
		})
		test("")
	})
})
