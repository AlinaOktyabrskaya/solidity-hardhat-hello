import { network } from "hardhat";


const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


async function main() {
  const connection = await network.connect("localhost");
  const ethers = connection.ethers;

  // 1. Получаем аккаунт, который деплоил контракт (первый в списке)
  const [deployer, user1, user2, user3] = await ethers.getSigners();

  // 2. Вычисляем адрес контракта динамически!
  // Контракт деплоится на nonce = 0 (если это была первая транзакция после старта npx hardhat node)
  const deployerAddress = deployer.address;
  const contractAddress = ethers.getCreateAddress({
    from: deployerAddress,
    nonce: 0 // Укажите 1, 2 и т.д., если вы деплоили несколько раз подряд
  });

  console.log(`🔍 Динамически вычисленный адрес контракта: ${contractAddress}`);

  // 3. Подключаемся к контракту
  const contract = await ethers.getContractAt("Switch", contractAddress);

  // ====================================================
  // ВЗАИМОДЕЙСТВИЕ
  // ====================================================


    const value = await (contract as any).currentMsg(); 
    console.log(`[ЧТЕНИЕ] Значение переменной should be none: ${value.toString()}`);
    console.log("Вызываем функцию от имени user...");
    let balance = await (contract as any).connect(user1).getContractBalance(); 
    console.log(`[ЧТЕНИЕ] initial balance of the contract should be 100 ETH: ${balance.toString()}`);

  /// user1 broadcast his msg 
    await (contract as any).connect(user1).changeMsg("I am on air", 
      "0x39f1dbc060b4179a5f23209c4d494d4aa395e0a6f07f46f868365c0723245d07", { value: ethers.parseEther("10")}); 
    let msg_value =  await (contract as any).currentMsg(); 
    console.log(`[ЧТЕНИЕ] user1 broadcasted (reding from public var): ${msg_value.toString()}`);

    await sleep(10000);  // 10 seconds 
  ///changing msg 
    await (contract as any).connect(user2).changeMsg("Here we are", 
      "0xf93d93e9a327d64bede843d311e520f8731cf7e73645fa247eb754561e45668e", { value: ethers.parseEther("20") }); 
    msg_value = await (contract as any).readMsg();
    console.log(`[ЧТЕНИЕ] user2 broadcasted (reding from read function): ${msg_value.toString()}`);
  
  //user1 claims reward for 10 seconds   
    await (contract as any).connect(user1).claimReward("0x39f1dbc060b4179a5f23209c4d494d4aa395e0a6f07f46f868365c0723245d07","0xd48f40e19f8ef3b2ddb6a7827396af14ed4c7232e32996bd11da5237e54ac7220315c4ca2b869804e0d706285bf0a5eb88648329cc27093de17fc0535cc8bd151b");
    console.log("user1 claimed his reward");


   balance = await (contract as any).connect(user1).getContractBalance(); 
   console.log(`[ЧТЕНИЕ] Новое значение переменной: ${balance.toString()}`);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
