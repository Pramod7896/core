import { AsyncLocalStorage } from "node:async_hooks";

export const requestContext = new AsyncLocalStorage();

export const runWithRequestContext = (store, fn) => requestContext.run(store, fn);

export const getRequestContext = () => requestContext.getStore();

