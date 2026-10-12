import { network } from "hardhat";

async function main() {
  // Подключаемся к запущенной локальной ноде (localhost)
  const connection = await network.connect("localhost");
  const ethers = connection.ethers;

  // Получаем первый тестовый аккаунт из тех 20, что выдала нода
  const [deployer] = await ethers.getSigners();
  console.log(`Деплоим контракт от имени: ${deployer.address}`);

  // Получаем фабрику контракта Counter и деплоим его
  const ContractFactory = await ethers.getContractFactory("Counter");
  const contract = await ContractFactory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`\n🚀 [УСПЕХ] Контракт Counter успешно развернут!`);
  console.log(`📍 Адрес контракта: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
