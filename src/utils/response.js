export const successResponse = (reply, message, data, status = 200) => {
  return reply.status(status).send({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (reply, message, error = null, status = 400) => {
  const stack_trace = error?.stack ?? error?.message ?? error ?? null;

  return reply.status(status).send({
    success: false,
    message,
    stack_trace,
  });
};
