***Part 1***

In this part, I try to compile and deploy simple contract Counter.sol from solidity-by-example.org 


ENVIROMENT SETTINGS AND DEPLOY (RAM)
The problem here is that empty compiled hardhat project does not work properly unless we install right dependencies and run proper commands. What worked from scratch: 


1 in empty folder, run basic commands like 
npm init -y
npm install --save-dev hardhat
npx hardhat --init

choose basic hardhat configuration and say yes to ESM module (if no, installation will exit)

2 this config does not create any folders automatically, so I create folders contracts, tests, and scripts. I place Counter.sol in contracts folder. I place interact.ts in scripts folder. 

3 change file tsconfig.json and files hardhat.config.ts 

4 also, need to run commands to install extra dependencies 
in bash: 
npx hardhad clean (to clean cash  from previously compiled contracts)
npx hardhad compile (compiles from contracts)
npm install --save-dev @types/node
npm install --save-dev @nomicfoundation/hardhat-toolbox-mocha-ethers

5 now then i run npx hardhat run scripts/interact.ts it works 

contract compiled and deployed to local node.js process. It lives in RAM until scrript is finished. 
I want to make it like local blockchain? 

DEPLOY CONTRACT TO LOCALHOST 

Objective: I want to deploy contract in a way it lives until I close vs code session. 

1 split terminal and run npx hardhat node 

it creates local node which lives as this terminal open (everytime need to deploy on local node, run this command again)

2 create file deploy.ts which only purpose is to deploy contract to local node 

3 use command 
npx hardhat run scripts/deploy.ts --network localhost

enjoy logs in first terminal where node is running 

--network localhost is needed for hardhat to call local node from the first terminal. If not use it, it will behave as in previous case - just live on RAM. (? not sure)


INTERACT WITH CONTACT ON LOCAL HOST 

Objective: now I want to interact with contract which already has been deployed. As an example, call functions, and observe, how state variables changing. 

I have one variable count, and 3 functions get(), dec(), inc()

1 created file interact2.ts 

2 as contract is already deployed on local chain, I do not need to deploy it again. I can calculate contract address from deployer address, as local node can show, what transactions and when deployer made, and who is deployer 

by default, deployer is the first account on the list. 
if I run deploy only once, nonce will be 0 (it is the first and only transaction for deployer)

3 I add more interaction with contract in interact2.ts file after line 33 


4 run npx hardhat run scripts/interact2.ts --network localhost   anytime

here we are. Please note, what while node is running, contract is keeping values we store in contract. say, if you run inc() command, and count = 1, next time you run interact2.ts count will be still one, and inc() again will give you count = 2, you got it... 
Otherwise, values refresh every time we start the node. This includes values of variables, balance of contract, balance of users, and so on.




***Part 2*** 
Now, when we learn enough about enviroment set up, there is no need to do it all again from scratch. To grasp new concepts, we need to add more functional. I create contract Variables.sol, for now it is just copy of variables.sol code from solidity-by-example, but will be modified in the process. Objectives I want to know now - who is msg.sender? Can I save blockchain state of local node, so if I need to return to the same state later, I can download from file? Can I make a copy of it? 

MSG.SENDER 

0 compiled with npx hardhat compile, so variables.sol also there 
to check, which contract were compiled, open artifacts/contracts, the name will be there. after npx hardhat clean, it will be empty 

created file variables-interact.ts and copied deploy.ts contect there. tested without --localhost first, it was deployed successfully. Now I am gonna make changes inside this script. 


1 from ts script, I can read text and num, as they are public state variables, but I cannot read i, time, or address, because the function does not return it neither they are saved on blockchain(as it is local by nature)


2 add new function to Variables.sol and new call in variables-interact.ts
deploy on local node. 
msg.sender is deployer. why? it is not because we are still deployer, no. It is because by default, if not specified, transactions sent from the first address on the list. And as we did not specify neither deployer, nor msg.sender, both of them are first address. 


3 to change it, use .connect()
add user in line 9, and connect(user) in line 41

SAVING STATE OF BLOCKCHAIN 

Objective: I want to know, if I can save blockchain state of local node, so later on I can return to it with the same values. 


Google answer:use build in RPC-commands EVM: evm_snapshot (make snapshot of the state) and evm_revert (return to snapshot). But this snapshots are active only while session is active (also can be useful, though)

Solutions to save blockchain state on disk: 
1 seed script - one script which deploy contract and assign all values, to prepare enviroment for work 

2 use Anvil as alternative to hardhat - Anvil can save state to json file. Anvil is a part of foundry, not hardhat, but competibe with hardhat. Say, node runs on Anvil, scripts made for hardhat will work. (?)

But for now, we do not go that far. 




***Part3*** 
 
Objective: operations written in blockchain through transactions. Transactions require gas. In this project, I want to explore transaction costs to extent available for me. 

-changing state variable value require to send a transaction. To read state variable - transaction and consequentely gas - is not needed. Only from view function? Or just call variable also just reading? 

-verifying and creating signatures (signatures created off-chain)

-operations with eth - transfer, get balance and so on. 


let's create a structure of contracts designed this way: 

*contract called switch has variable msg, and also mapping of unclaimed rewards (mapping hash - timestamps)
*user who call switch can change msg to anything, and broadcast it to blockchain 
*user needs to transfer some amount of eth to contract to change msg 
*anybody can read msg, but changing it requires to pay eth to contract 
*anybody can see what is contract balance, but not rewards 
*user sign msg, using their private key (contract is not keeping track on who send msg, only rewards)
*after msg changed, user can claim reward from contract, proportional to time msg were broadcasted
*to claim his reward, user need to verify signature 

indeed, this design contains all I want to know, the only thing is to write it. 


0 i asked gemini to write it by my design, and also changed some parts afterward 
compile and deploy on localhost from deploySwitch.ts
add some balance to contract from deployer account - in initialbalance.ts

all functions in contract: recieve(), getContractBalance(), readMsg(), claimReward(), changeMsg(), 
all variables in contract: public msg, private mapping, lastHash, currentHash

operations on the scope: 
changing variables - in changeMsg()
reading variables - call msg to console, read from readMsg() function 
verifying signature - in claimReward()
signing - separate contract 
transfer - claimReward(), recieve(), changeMsg()
read balance - getContractBalance()


0a created sign.ts script, which will generate hash and signature for chosen user. From npx hardhat node we have pairs of private and public keys, msg also has to be copied to generate hash. 

In sign.ts hash is generated solely based on msg. It is not ideal solution, and there are better ways to do it; as well as there other ways to generate signature, as from metamask wallet. But as it is not an object of the scope, we just use simpliest option available. 

Using sign.ts we generate several pairs of hash-signature plus user (this we need to know to act from user side):

account 0: 
msg: "HELLO"
created hash:  0x1a5d6cb6ecd5059e65b5a6e8117beede444b8b1152787f00a4d98dca32f02fd4
signature: 0x0ecb398ce9a0f2143d01190bd2e5f1ef8e4019854f1b0305242ccbc30d96baf039ae726b1d98f55651a37d21611f85c9721304067d132424b8965f6a2b8397b21b


account 1: 
msg: "I am on air"
created hash:  0x39f1dbc060b4179a5f23209c4d494d4aa395e0a6f07f46f868365c0723245d07
signature: 0xd48f40e19f8ef3b2ddb6a7827396af14ed4c7232e32996bd11da5237e54ac7220315c4ca2b869804e0d706285bf0a5eb88648329cc27093de17fc0535cc8bd151b

msg: "Oh my"
created hash:  0xb40db5052f9d872e727701fbc5409cd24b34965f15e9c8b119a7396e0d7252c5
signature: 0x12ee0d8c81c8805856401967ffbb728ce2b73589e836455befcf6c6c2f22441e128ac1e6fd36371cb05401c291abdebc7a20bf75461306793f5632b53fa9659c1c


account 2: 
msg: "Here we are"
created hash:  0xf93d93e9a327d64bede843d311e520f8731cf7e73645fa247eb754561e45668e
signature: 0x32ac5ec9378a4d6c63f9c17d0053f46b6e4012a10185d4e5ba9b2b06d8823b600f114579d68fa57ca8b2dbaba74d3a4af73bedbee126089fcc915ee3807b7d131b


1 finally set-up is ready to be tested!
interactSwitch1.ts just test functionality of the contract. Everything is allright so far. 

Now, we talk about gas fees. As we can see from math in interactSwitch1.ts, for every call users pay. One goal now is to define, how much they pay and for that. 


2 well, it was closer than expected...  If we open node logs - the same terminal there npx hardhat node is - then every call to contract is written there, and gas, if used, also specified. 
From logs, reading variable does not cost gas - does not metter, is it reading of variable directly or readMsg() function. To view balance of the contract also free. Both deployment and recieve() from deployer cost gas, changeMsg() and claimReward() as well, changeMsg() is more costly, though, 20 ETH to send here cheaper than to send 10ETH, why? 
Ok, the math here is that when we need to make new record to blockchain (change default 0 to something else), is cost like 20k of gas, but if we change the value and delete previous record, it cost around 3k. As sending 10ETH were first transaction on blockchain, all variables used, cost something together significantly more than than all next transactions, so we can expect, that each next changeMsg() call will cost around same 70k, versus 140k call for the first time. This code is not gas-optimized, but was not designed to be such. 
There is a thing like gas refund, if we delete recording, gas is refunded. That's why, my guess, claimReward() costs less - we delete hash in mapping for already claimed record. 




***The end***