import {Options} from "swagger-jsdoc";
import { Constants } from "./constants";

export const swaggerOptions : Options = {
    definition: {
        openapi: "3.1.0",
        info: {
          title: "twitter backend swagger",
          version: "0.1.0",
          description:
            "This is a training api that has the basic functionality of Twitter",
          license: {
            name: "MIT",
            url: "https://spdx.org/licenses/MIT.html",
          },
        },
        servers: [
          {
            url: `http://localhost:${Constants.PORT}`,
          },
        ],
      },
      apis: ["../../router/index.ts"],
}