import { network } from "hardhat";

async function main() {
  // Подключаемся к запущенной локальной ноде (localhost)
  const connection = await network.connect("localhost");
  const ethers = connection.ethers;

  // Получаем первый тестовый аккаунт из тех 20, что выдала нода
  const [deployer, user] = await ethers.getSigners();
  console.log(`Деплоим контракт от имени: ${deployer.address}`);
  console.log(`user address: ${user.address}`);

  // Получаем фабрику контракта Counter и деплоим его
  const ContractFactory = await ethers.getContractFactory("Variables");
  const contract = await ContractFactory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`\n🚀 [УСПЕХ] Контракт Variables успешно развернут!`);
  console.log(`📍 Адрес контракта: ${address}`);



  // ====================================================
  // ВЗАИМОДЕЙСТВИЕ ПРЯМО ЗДЕСЬ (ПОСЛЕ ДЕПЛОЯ)
  // ====================================================
  console.log("\n--- Начинаем взаимодействие ---");

  try {
    // 1. Пример чтения public-переменной (getter)
    // Замените 'myVariable' на реальное имя вашей переменной в контракте Variables
    const value = await (contract as any).text(); 
    console.log(`[ЧТЕНИЕ] Значение переменной: ${value.toString()}`);

    // 2. what is in the function?? 
    await (contract as any).doSomething(); 
    // const newValue = await (contract as any).i();  I cannot do it, bcs i is not state variable nor return value 
    

    // 3. who they are? 
    console.log("Вызываем функцию от имени user...");
    const [i, timestamp, sender] = await (contract as any).connect(user).doSomethingElse(); 
    console.log(`[ЧТЕНИЕ] Новое значение переменной: ${sender.toString()}`);

  } catch (error) {
    console.error("❌ Ошибка при вызове функций контракта:", error);
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
