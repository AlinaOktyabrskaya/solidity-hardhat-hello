import { network } from "hardhat";
import { ethers as ethersV6 } from "ethers"; // Для утилит типа parseEther, если нужно

async function main() {


  const connection = await network.connect("localhost");
  const ethers = connection.ethers;

  // 1. Получаем аккаунт, который деплоил контракт (первый в списке)
  const [deployer, user1] = await ethers.getSigners();

  // 2. Вычисляем адрес контракта
  const deployerAddress = deployer.address;
  
  // В Ethers v6 метод getCreateAddress находится в объекте ethers
  const contractAddress = ethers.getCreateAddress({
    from: deployerAddress,
    nonce: 0 
  });

  console.log(`🔍 Динамически вычисленный адрес контракта: ${contractAddress}`);

  // 3. Подключаемся к контракту по его имени и адресу
  const contract = await ethers.getContractAt("Switch", contractAddress);

  // 4. Пополняем контракт (передаем deployer как Signer)
  await depositToContract(deployer, contractAddress, "100");

  // 5. Проверяем баланс. В Ethers v6 метод .connect() возвращает новый инстанс контракта
   const balance = await (contract as any).connect(user1).getContractBalance(); 
   console.log(`[ЧТЕНИЕ] Новое значение переменной: ${balance.toString()}`);

  // В Ethers v6 для форматирования BigInt в понятный ETH используется formatEther
  console.log(`[ЧТЕНИЕ] Баланс контракта: ${ethers.formatEther(balance)} ETH`);
}

// Изменяем тип signer на любой совместимый с Hardhat/Ethers Signer
async function depositToContract(signer: any, contractAddress: string, amountEth: string) {
    // Отправляем транзакцию напрямую через signer
    const tx = await signer.sendTransaction({
        to: contractAddress,
        value: ethersV6.parseEther(amountEth) 
    });

    await tx.wait();
    console.log(`Контракт успешно пополнен на ${amountEth} ETH через receive()`);
}

// Запуск скрипта с отловом ошибок
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
