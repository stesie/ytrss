import { AnyAction, Middleware } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "../store";

export const loggerMiddleware: Middleware<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  RootState,
  ThunkDispatch<RootState, undefined, AnyAction>
> = (storeApi) => (next) => (action) => {
  console.log("dispatching", action);
  const result = next(action);
  console.log("next state", storeApi.getState());

  return result;
};
