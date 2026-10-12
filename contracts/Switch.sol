// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Switch {
    // Публичная переменная для хранения текущего сообщения
    string public currentMsg;
    bytes32 private lastHash;  //I did not find better way to update time in unclaimedRewards
    bytes32 private currentHash; 

    // Маппинг для хранения времени публикации (хэш подписи => таймстемп)
    // Сделан private, чтобы никто не мог прочесть награды снаружи напрямую
    mapping(bytes32 => uint256) private unclaimedRewards;

    // Минимальная стоимость смены сообщения (например, 0.01 ether)
    uint256 public constant CHANGE_FEE = 1 ether;

    // Базовая ставка награды за секунду удержания сообщения
    uint256 public constant REWARD_PER_SECOND = 0.01 ether;

    event MsgChanged(string newMsg, bytes32 indexed signatureHash, uint256 timestamp);
    event RewardClaimed(address indexed recipient, uint256 amount);

    // Функция смены сообщения. Требует оплаты ETH.
    // Передается новое сообщение и хэш подписи, которую пользователь сгенерировал офчейн
    function changeMsg(string calldata _newMsg, bytes32 _signatureHash) external payable {
        require(msg.value >= CHANGE_FEE, "Insufficient ETH sent to change message");
        require(unclaimedRewards[_signatureHash] == 0, "Signature hash already used");


        // update rewards for previous msg broadcasted 
        uint256 t = unclaimedRewards[lastHash];
        unclaimedRewards[lastHash] = block.timestamp - t;

        currentMsg = _newMsg;
        currentHash = _signatureHash;
        
        // Фиксируем время публикации для этого хэша подписи
        unclaimedRewards[_signatureHash] = block.timestamp;
        lastHash = _signatureHash;

        emit MsgChanged(_newMsg, _signatureHash, block.timestamp);
    }

    // Функция получения награды. Требует верификации подписи.
    // Пользователь передает оригинальный хэш подписи, который он зафиксировал, и саму подпись (sig)
    function claimReward(bytes32 _signatureHash, bytes calldata _sig) external {

        address payable recipient = payable(msg.sender);
        uint256 broadcastTime = unclaimedRewards[_signatureHash];
        require(broadcastTime > 0, "No rewards or already claimed");
        require(currentHash != _signatureHash, "msg still on air"); //protects to be claimed while broadcasting
        // this condition we can change to something like if else if msg still on air, we update it to none, 
        //then rewards are claimed. but it is not a point here so I leave as it is. 

        // Проверяем, что тот, кто вызывает функцию, действительно является автором подписи
        // Для этого подписывается временная метка или сам хэш
        bytes32 messageHash = keccak256(abi.encodePacked(_signatureHash));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        
        address signer = recoverSigner(ethSignedMessageHash, _sig);
        require(signer == msg.sender, "Signature verification failed");

        // Расчет награды пропорционально времени, прошедшему с момента публикации
        uint256 reward = broadcastTime * REWARD_PER_SECOND;

        require(reward > 0, "Reward is zero");
        require(address(this).balance >= reward, "Contract out of funds");

        // Удаляем награду перед отправкой (защита от Reentrancy)
        delete unclaimedRewards[_signatureHash];

        // Отправка награды
        (bool success, ) = recipient.call{value: reward}("");
        require(success, "Transfer failed");

        emit RewardClaimed(msg.sender, reward);
    }

    // Функция для проверки баланса контракта (доступна всем)
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    //function to read msg 
    function readMsg() external view returns (string memory) {
        return currentMsg;
    }

    // Вспомогательная функция для восстановления адреса из подписи (ECDSA)
    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _sig) internal pure returns (address) {
        require(_sig.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    // Возможность пополнять баланс контракта напрямую для пула наград
    receive() external payable {}
}
