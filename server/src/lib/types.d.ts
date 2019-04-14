declare module "twin-bcrypt" {
    export function genSalt(cost: number): string;
    export function hash(
        data: string, salt: string, progress: (p: number) => any, callback: (hash: string) => any,
    ): void;
    export function compare(
        pass: string, refhash: string, progress: (p: number) => any, callback: (result: boolean) => any,
    ): void;
    export function compareSync(pass: string, refhash: string): boolean;
}

declare module "podcast";

declare module "express-es6-template-engine";
