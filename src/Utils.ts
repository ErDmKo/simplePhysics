/*
export const pipe = (...funcList: Array<Function>) =>
    (x) => funcList.reduce((returnedValue: any, nextFn: Function) => nextFn(returnedValue), x);
*/
export const intersectSafe = <A>(a: A[], b: A[]) => {
  return a.slice().filter((e) => b.includes(e));
};
