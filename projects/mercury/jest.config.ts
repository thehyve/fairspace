/** @type {import('ts-jest').JestConfigWithTsJest} */
import type {Config} from 'jest';
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "axios": "axios/dist/node/axios.cjs"
  },
  transformIgnorePatterns: [
    "\\.pnp\\.[^\\/]+$",
    "node_modules/(?!(axios)/)"
  ],
};

// const config: Config = {
//   verbose: true,
//   setupFilesAfterEnv: ["jest.setup.ts"]

// };

// export default config;