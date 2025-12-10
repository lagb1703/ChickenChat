export class HttpException extends Error {
	status: number;
	detail: unknown;
	headers?: Record<string, string>;

	constructor(detail: unknown = 'Internal Server Error', status = 500, headers?: Record<string, string>) {
		super(typeof detail === 'string' ? detail : JSON.stringify(detail));
		this.status = status;
		this.detail = detail;
		this.headers = headers;
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export function formatErrorResponse(err: unknown): Response {
	if (err instanceof HttpException) {
		const body = JSON.stringify({ detail: err.detail, status: err.status });
		const headers = { 'Content-Type': 'application/json', ...(err.headers || {}) };
		return new Response(body, { status: err.status, headers });
	}

	// Unhandled / unexpected error
	// Log for server-side debugging
	// In a production system you might want to hide stack traces or send to a monitoring service
	// eslint-disable-next-line no-console
	console.error('Unhandled error:', err);
	const body = JSON.stringify({ detail: 'Internal Server Error', status: 500 });
	return new Response(body, { status: 500, headers: { 'Content-Type': 'application/json' } });
}

export function withErrorHandling<T extends (req: Request) => Promise<Response> | Response>(
	handler: T,
) {
	return async function (request: Request) {
		try {
			const result = await handler(request);
			return result;
		} catch (err) {
			return formatErrorResponse(err);
		}
	};
}

export default HttpException;
