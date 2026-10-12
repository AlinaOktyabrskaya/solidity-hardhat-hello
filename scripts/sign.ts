import { ethers } from "ethers";

async function createHash(newMsg: string): Promise<string> {
    const signatureHash = ethers.keccak256(ethers.toUtf8Bytes(newMsg));
    console.log("created hash: ", signatureHash);
    return signatureHash; 
}

async function createSignature(privateKey: string, signatureHash: string) {
    // 1. Создаем объект кошелька из приватного ключа
    const wallet = new ethers.Wallet(privateKey);

    // 2. Хэшируем signatureHash так же, как это делает контракт в первой строчке: 
    // bytes32 messageHash = keccak256(abi.encodePacked(_signatureHash));
    const messageHash = ethers.solidityPackedKeccak256(["bytes32"], [signatureHash]);

    // 3. Подписываем полученный messageHash.
    // wallet.signMessage автоматически добавляет префикс "\x19Ethereum Signed Message:\n32"
    // контракту останется только восстановить адрес!
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));

    console.log("signature:", signature);
    return signature;
}


// how-to
const privateKey = "0xPRIVATE_KEY..."; //copy private key here 
const Msg = "HELLO" //copy msg here 

const newHash = await createHash(Msg);
await createSignature(privateKey, newHash);
