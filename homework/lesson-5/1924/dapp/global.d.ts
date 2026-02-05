// dapp/global.d.ts
export {}; // 确保这是一个模块文件

declare global {
  interface Window {
    ethereum?: any; // 使用 any 可以避开所有第三方库的类型冲突
  }
}