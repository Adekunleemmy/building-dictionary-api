// helpers/dbErrorHandler.js

const uniqueMessage = (error) => {
  let output;

  // Use keyValue if available (newer MongoDB/Mongoose)
  if (error.keyValue) {
    const field = Object.keys(error.keyValue)[0];
    output = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    try {
      const fieldName = error.message.substring(
        error.message.lastIndexOf("index:") + 7,
        error.message.lastIndexOf("_1")
      );
      output =
        fieldName.charAt(0).toUpperCase() +
        fieldName.slice(1) +
        " already exists";
    } catch (ex) {
      output = "Unique field already exists";
    }
  }

  return output;
};

export const errorHandler = (error) => {
  let message = "";

  if (error.code) {
    switch (error.code) {
      case 11000:
      case 11001:
        message = uniqueMessage(error);
        break;
      default:
        message = "Something went wrong with the database operation";
    }
  } else if (error.errors) {
    // Collect all validation messages instead of just one
    const messages = Object.values(error.errors).map((val) => val.message);
    message = messages.join(", ");
  } else if (error.message) {
    // Fall back to the error's own message
    message = error.message;
  } else {
    message = "Unknown server error";
  }

  return message;
};
