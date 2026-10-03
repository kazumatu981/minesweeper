export class TestAssertionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = TestAssertionError.name;
    }
}
