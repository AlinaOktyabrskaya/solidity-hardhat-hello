import { network } from "hardhat";

async function main() {
  const connection = await network.connect("localhost");
  const ethers = connection.ethers;

  // 1. Получаем аккаунт, который деплоил контракт (первый в списке)
  const [deployer] = await ethers.getSigners();

  // 2. Вычисляем адрес контракта динамически!
  // Контракт деплоится на nonce = 0 (если это была первая транзакция после старта npx hardhat node)
  const deployerAddress = deployer.address;
  const contractAddress = ethers.getCreateAddress({
    from: deployerAddress,
    nonce: 0 // Укажите 1, 2 и т.д., если вы деплоили несколько раз подряд
  });

  console.log(`🔍 Динамически вычисленный адрес контракта: ${contractAddress}`);

  // 3. Подключаемся к контракту
  const contract = await ethers.getContractAt("Counter", contractAddress);

  // ====================================================
  // ВЗАИМОДЕЙСТВИЕ
  // ====================================================
  try {
    let value = await (contract as any).count(); 
    console.log(`Текущее значение счетчика: ${value.toString()}`);
  } catch (e) {
    console.error("Контракт не найден по этому адресу или еще не деплоился!");
  }

  try {
    await (contract as any).inc(); 
    await (contract as any).inc(); 
    await (contract as any).dec();  // + 2 - 1
    let value = await (contract as any).count(); 
    console.log(`Текущее значение счетчика: ${value.toString()}`);
  } catch (e) {
    console.error("Контракт не найден по этому адресу или еще не деплоился!");
  }


  try {
    await (contract as any).dec(); 
    console.log(`Текущее значение счетчика: ${await (contract as any).get()}`);
  } catch (e) {
    console.error("Контракт не найден по этому адресу или еще не деплоился!");
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
