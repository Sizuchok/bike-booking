export class HttpError extends Error {
  constructor(readonly status: number | undefined, readonly message: string) {
    super(message)
  }
}
