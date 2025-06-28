class ApiResponse {
    constructor(statusCode, data, message = 'Success') {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }

    static success(data, message = 'Operation successful') {
        return new ApiResponse(200, data, message);
    }

    static created(data, message = 'Resource created successfully') {
        return new ApiResponse(201, data, message);
    }

    static noContent(message = 'No content') {
        return new ApiResponse(204, null, message);
    }

    static badRequest(message = 'Bad request', errors = null) {
        const response = new ApiResponse(400, null, message);
        if (errors) {response.errors = errors;}
        return response;
    }

    static unauthorized(message = 'Unauthorized') {
        return new ApiResponse(401, null, message);
    }

    static forbidden(message = 'Forbidden') {
        return new ApiResponse(403, null, message);
    }

    static notFound(message = 'Resource not found') {
        return new ApiResponse(404, null, message);
    }

    static conflict(message = 'Resource already exists') {
        return new ApiResponse(409, null, message);
    }

    static validationError(errors, message = 'Validation failed') {
        const response = new ApiResponse(422, null, message);
        response.errors = errors;
        return response;
    }

    static error(error, message = 'Internal server error') {
        const response = new ApiResponse(500, null, message);
        if (process.env.NODE_ENV === 'development') {
            response.stack = error.stack;
        }
        return response;
    }

    toJSON() {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
            ...(this.errors && { errors: this.errors }),
            ...(this.stack && { stack: this.stack }),
        };
    }
}

const sendResponse = (res, response) => {
    if (response instanceof ApiResponse) {
        return res.status(response.statusCode).json(response.toJSON());
    }

    // Handle non-ApiResponse objects
    const apiResponse = new ApiResponse(200, response);
    return res.status(apiResponse.statusCode).json(apiResponse.toJSON());
};

// Response middleware
const responseMiddleware = (req, res, next) => {
    res.apiResponse = (data, statusCode = 200, message) => {
        const response = new ApiResponse(statusCode, data, message);
        return res.status(statusCode).json(response.toJSON());
    };

    res.apiSuccess = (data, message = 'Operation successful') => {
        const response = ApiResponse.success(data, message);
        return res.status(response.statusCode).json(response.toJSON());
    };

    res.apiCreated = (data, message = 'Resource created successfully') => {
        const response = ApiResponse.created(data, message);
        return res.status(response.statusCode).json(response.toJSON());
    };

    res.apiNoContent = (message = 'No content') => {
        const response = ApiResponse.noContent(message);
        return res.status(response.statusCode).json(response.toJSON());
    };

    res.apiBadRequest = (message = 'Bad request', errors = null) => {
        const response = ApiResponse.badRequest(message, errors);
        return res.status(response.statusCode).json(response.toJSON());
    };

    res.apiUnauthorized = (message = 'Unauthorized') => {
        const response = ApiResponse.unauthorized(message);
        return res.status(response.statusCode).json(response.toJSON());
    };

    res.apiForbidden = (message = 'Forbidden') => {
        const response = ApiResponse.forbidden(message);
        return res.status(response.statusCode).json(response.toJSON());
    };

    res.apiNotFound = (message = 'Resource not found') => {
        const response = ApiResponse.notFound(message);
        return res.status(response.statusCode).json(response.toJSON());
    };

    res.apiConflict = (message = 'Resource already exists') => {
        const response = ApiResponse.conflict(message);
        return res.status(response.statusCode).json(response.toJSON());
    };

    res.apiValidationError = (errors, message = 'Validation failed') => {
        const response = ApiResponse.validationError(errors, message);
        return res.status(response.statusCode).json(response.toJSON());
    };

    res.apiError = (error, message = 'Internal server error') => {
        const response = ApiResponse.error(error, message);
        return res.status(response.statusCode).json(response.toJSON());
    };

    next();
};

module.exports = {
    ApiResponse,
    sendResponse,
    responseMiddleware,
};
