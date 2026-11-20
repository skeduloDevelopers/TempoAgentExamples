import { FunctionRoute } from "@skedulo/sdk-utilities";
import * as pathToRegExp from "path-to-regexp";

const EXAMPLE_STOCK = {
  supplier: "Example Parts Co",
  parts: [
    { partNumber: "HWS-250", name: "250 L hot water cylinder", quantityNeeded: 1, quantityInStock: 4 },
    { partNumber: "PRV-15", name: "15 mm pressure relief valve", quantityNeeded: 1, quantityInStock: 12 },
    { partNumber: "THM-EL2", name: "Element thermostat", quantityNeeded: 1, quantityInStock: 0, backOrderDays: 5 },
  ],
};

export function getCompiledRoutes() {
  return getRoutes().map((route) => ({
    regex: pathToRegExp(route.path),
    method: route.method,
    handler: route.handler,
  }));
}

function getRoutes(): FunctionRoute[] {
  return [
    {
      method: "get",
      path: "/stock",
      handler: async () => ({ status: 200, body: EXAMPLE_STOCK }),
    },
  ];
}
