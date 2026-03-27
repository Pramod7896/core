import { runWithRequestContext } from "../utils/requestContext.js";

export const requestContextMiddleware = (req, res, next) => {
  const store = {
    requestId: req.requestId,
    auditLogged: false,
  };

  req.requestContext = store;

  runWithRequestContext(store, () => next());
};

