from flask import jsonify

class ApiResponse:
    def __init__(self, code=200, message="Success", result=None):
        self.code = code
        self.message = message
        self.result = result if result is not None else {}

    def to_dict(self):
        """
        Convert the response to a dictionary.
        """
        return {
            "code": self.code,
            "message": self.message,
            "result": self.result
        }

    def to_json(self):
        """
        Convert the response to a JSON format.
        """
        return jsonify(self.to_dict())

    @staticmethod
    def success(message="Success", result=None):
        """
        Return a success response.
        """
        return ApiResponse(code=200, message=message, result=result).to_json()

    @staticmethod
    def error(message="Error", code=500, result=None):
        """
        Return an error response.
        """
        return ApiResponse(code=code, message=message, result=result).to_json()
