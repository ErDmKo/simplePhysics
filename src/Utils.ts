/*
export const pipe = (...funcList: Array<Function>) =>
    (x) => funcList.reduce((returnedValue: any, nextFn: Function) => nextFn(returnedValue), x);
*/
export const intersectSafe = (a, b) => {
    return a.slice()
            .filter(e => b.includes(e));
}
