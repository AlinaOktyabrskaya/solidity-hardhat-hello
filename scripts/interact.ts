import { network } from "hardhat";

async function main() {
  // 1. Создаем явное сетевое соединение (по умолчанию используется локальная сеть)
  const connection = await network.create();

  // 2. Достаем объект ethers ИМЕННО из созданного соединения
  const ethers = connection.ethers;

  // 3. Получаем аккаунт
  const [deployer] = await ethers.getSigners();
  console.log(`Исполнитель: ${deployer.address}`);

  // 4. Разворачиваем ваш контракт Counter
  const ContractFactory = await ethers.getContractFactory("Counter");
  const contract = await ContractFactory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`contract address: ${address}`);

  // ====================================================
  // ВЗАИМОДЕЙСТВИЕ
  // ====================================================
  try {
    // Вызываем вашу public переменную или метод count()
    const value = await (contract as any).count(); 
    console.log(`Текущее значение счетчика: ${value.toString()}`);
  } catch (e) {
    console.log("Метод .count() не найден. Проверьте имя переменной в Counter.sol");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
