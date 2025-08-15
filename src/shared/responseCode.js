export const Code = {
    Success : { status: 200, message: "Success" },
    Created : { status: 201, message: "Created" },
    NoContent : { status: 204, message: "No Content" },
    BadRequest : { status: 400, message: "Bad Request" },
    Unauthorized : { status: 401, message: "Unauthorized" },
    NotFound : { status: 404, message: "Not Found" },
    Forbidden : { status: 403, message: "Forbidden" },
    Conflict : { status: 409, message: "Conflict" },
    UnprocessableEntity : { status: 422, message: "Unprocessable Entity" },
    TooManyRequests : { status: 429, message: "Too Many Requests" },
    ValidationError : { status: 400, message: "Validation Error" },
    InternalServerError : { status: 500, message: "Internal Server Error" }
}