declare module "bun" {
    interface Env {
        BOOTSTRAP_HOST: string;
        BOOTSTRAP_PORT: number;
    }
}