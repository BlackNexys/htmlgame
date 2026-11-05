export interface AnimationScheduler {
    request(callback: (time: number) => void): number;
    cancel(id: number): void;
    now(): number;
}
