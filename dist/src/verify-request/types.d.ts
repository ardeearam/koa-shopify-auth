import { AccessMode } from "../types";
export interface Routes {
    authRoute: string;
    fallbackRoute: string;
}
declare type VerifyRequestOptions = {
    accessMode: AccessMode;
};
export declare type Options = Partial<VerifyRequestOptions> & Partial<Routes>;
export {};
//# sourceMappingURL=types.d.ts.map