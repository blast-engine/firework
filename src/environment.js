const NODE_ENV = process.env.NODE_ENV
export const env = {
  isDev: NODE_ENV === 'development',
  isTest: NODE_ENV === 'test',
  isProd: NODE_ENV !== 'development' && NODE_ENV !== 'test',
}