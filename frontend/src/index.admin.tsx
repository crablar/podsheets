import webpack = require("webpack");

// tslint:disable-next-line:no-namespace
declare global {
    // tslint:disable-next-line:interface-name
    interface NodeModule {
        hot: {
            accept(dependencies: string[], callback: (updatedDependencies: string[]) => void): void;
            accept(dependency: string, callback: () => void): void;
            accept(errHandler?: (err: any) => void): void;
            // tslint:disable-next-line:unified-signatures
            decline(dependencies: string[]): void;
            // tslint:disable-next-line:unified-signatures
            decline(dependency: string): void;
            decline(): void;

            dispose(callback: (data: any) => void): void;
            addDisposeHandler(callback: (data: any) => void): void;

            removeDisposeHandler(callback: (data: any) => void): void;
        };
    }
}

import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./components/admin/App";

ReactDOM.render(App, document.getElementById("root"));

// HMR interface
if (module.hot) {
    module.hot.accept("./components/admin/App", () => {
        const NextApp = require("./components/admin/App").default;
        ReactDOM.render(NextApp , document.getElementById("root"));
    });
}
