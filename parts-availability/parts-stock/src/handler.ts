import {
  Function,
  FunctionPayload,
  FunctionResponse,
} from "@skedulo/sdk-utilities";

import { createSkedContext } from "@skedulo/function-utilities";
import { getCompiledRoutes } from "./routes";

const customHandler = async (
  payload: FunctionPayload
): Promise<FunctionResponse<any>> => {
  const start = Date.now();

  try {
    const { method, path, headers, body, querystring } = payload;
    const skedContext = createSkedContext(headers);
    const matchedRoute = getCompiledRoutes()
      .filter((route) => route.method === method.toLowerCase())
      .find((route) => !!route.regex.exec(path));

    if (matchedRoute) {
      return await matchedRoute.handler(
        body,
        headers,
        method,
        path,
        skedContext,
        querystring
      );
    } else {
      return {
        status: 404,
      };
    }
  } catch (e: any) {
    console.error(e);

    return {
      status: 400,
      body: {
        error: e.message,
      },
    };
  } finally {
    console.info(`${payload.method}: ${payload.path}: ${Date.now() - start}ms`);
  }
};

const skeduloFunction = new Function({ handler: customHandler });

// Required: the platform loads the handler from module.exports
skeduloFunction.attachHandler(module.exports);
