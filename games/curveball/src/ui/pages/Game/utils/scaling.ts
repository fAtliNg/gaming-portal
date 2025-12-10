export function makeScale(depth: number, gamma: number, target: number) {
  return (i: number) => Math.pow(target, Math.pow(i / (depth - 1), gamma))
}

