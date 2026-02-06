## 可升级合约（UUPS）作业

本项目实现一个简单的可升级合约，部署在波卡 Hub 测试网，并完成升级验证。

### 合约与脚本

- 合约（V1/V2）：[contracts/UpgradableContract.sol](contracts/UpgradableContract.sol)
	- `UpgradableContract`（V1）
	- `UpgradableContractV2`（V2）
- Ignition 部署模块：[ignition/modules/UpgradableContract.ts](ignition/modules/UpgradableContract.ts)
- 升级 + 读存储脚本：[scripts/upgrade-and-check.ts](scripts/upgrade-and-check.ts)
- 测试：[test/UpgradableContract.ts](test/UpgradableContract.ts)

### 运行前准备

在项目根目录配置环境变量（已写入 .env）：

- `POLKADOT_HUB_RPC_URL`
- `POLKADOT_HUB_PRIVATE_KEY`

### 部署（Ignition）

部署代理合约到波卡 Hub 测试网：

- 命令：npx hardhat ignition deploy --network polkadotHubTest ignition/modules/UpgradableContract.ts

部署完成后记录输出的 Proxy 地址，用于后续升级脚本。

### 升级 + 存储对比（TypeScript）

运行升级脚本，部署 V2、升级代理、初始化 V2，并读取升级前后存储：

- 命令：PROXY_ADDRESS=0x... npx hardhat run --network polkadotHubTest scripts/upgrade-and-check.ts

脚本会打印升级前后关键存储：

- 变化：`version`（V1 为 1，升级后为 2）
- 不变：`name`、`value`
- 新增：`newValue`、`newFeatureEnabled`

### 测试

- 命令：npx hardhat test

### 结果记录（请填写）

部署交易 Hash（Proxy）：
- 0x(Ignition 自动部署，见 ignition/deployments/chain-420420417)

Proxy 地址：
- 0x3F52D4950638Ed676aCda1623267c89b05ba36DD

V1 实现合约地址：
- 0x037615aB62133Cd30dBe0D23F3B75fede3fDC567

V2 实现合约地址：
- 0xaadbead11fa9cce751b2a91ba037ead3acf3eff0

升级交易 Hash（upgradeToAndCall）：
- 0xc546cb10163154f88f09cc9ef5ccc8a66b0ef801d0ae4d9d5e1cf5e626fc4650

初始化 V2 交易 Hash（initializeV2）：
- 0x9db8aeac75d957599aebfd7d808823b97f4b7babf4d984929d6e5c60338eba88

TypeScript 输出（升级前后存储）：

- Before upgrade:
  - name: V1 (unchanged)
  - value: 1n (unchanged)
  - version: 1n (changed to 2n after upgrade)
- After upgrade:
  - name: V1 ✓
  - value: 1n ✓
  - version: 2n ✓
  - newValue: 0n (new)
  - newFeatureEnabled: true (new)
