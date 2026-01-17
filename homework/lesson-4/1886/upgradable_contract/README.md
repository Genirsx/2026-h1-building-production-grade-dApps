# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

### 部署V1交易Hash

- MyContractV1Module#MyContractV1_Implementation - 0x922C65464E237a2C15BFc4c3E6267551A3E14899
- MyContractV1Module#MyContractV1_Proxy - 0xe1Eb85FC44A20FDc6516e8a081806a0A29DB86c0
- MyContractV1Module#MyContractV1_ProxyInterface - 0xe1Eb85FC44A20FDc6516e8a081806a0A29DB86c0

🌐 网络: polkadotTestnet (Chain ID: 420420422n )

# 📋 部署信息:

代理地址: 0xe1Eb85FC44A20FDc6516e8a081806a0A29DB86c0
V1 实现: 0x922C65464E237a2C15BFc4c3E6267551A3E14899
V2 实现: (未升级)
=====================================

## 📊 当前合约状态:

✓ 版本号: 1
✓ myValue: 0

## 📌 当前版本: V1

🧪 测试合约交互.. .

1️⃣ 设置 myValue = 888.. .
✓ 交易哈希: 0xea2798b7fe61c1df25033e6634723f658da956b30dfcb8a69875ab8e408f4122
✓ Gas 使用: 6664
✓ 新值: 888

2️⃣ 设置消息...
✓ 交易哈希: 0xc68e2e959cbbea97061438b10d3e3ae67235b59a2be03a21733577b8001942e8
✓ Gas 使用: 7317
✓ 消息: Hello UUPS on Polkadot!

3️⃣ 测试 V2 功能 - 批量设置值...

⚠️ V2 功能不可用（当前为 V1）

# 📊 最终状态摘要:

版本: 1
myValue: 888
(V2 功能未启用)
=====================================

✅ 验证完成!

### 升级V2交易Hash
