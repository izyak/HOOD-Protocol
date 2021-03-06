// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const path = require("path");

function BigN(n) {
    return ethers.BigNumber.from(n.toString())
}
async function main() {

  // get deployer account
  const [deployer] = await ethers.getSigners();

  contracts = {}

  const AddressProvider = await ethers.getContractFactory("AddressProvider")

  const Config = await ethers.getContractFactory("Config")
  config = await Config.deploy()
  contracts['config'] = config.address

  const Core = await ethers.getContractFactory("LendingPoolCore", {
    libraries: {
        Config: contracts['config']
    }
  })

  const Asset = await ethers.getContractFactory("Asset")
  const Oracle = await ethers.getContractFactory("Oracle")
  const Pool = await ethers.getContractFactory("LendingPool")
  const DataProvider = await ethers.getContractFactory("LendingPoolDataProvider")
  const ReserveInitializer = await ethers.getContractFactory("ReserveInitializer")
  const Rewards = await ethers.getContractFactory("RewardDistribution")
  const Hood = await ethers.getContractFactory("HoodToken")

  addressProvider = await AddressProvider.deploy()
  ap = addressProvider.address
  contracts['addressProvider'] = ap
  core = await Core.deploy(ap)
  contracts['lendingPoolCore'] = core.address
  pool = await Pool.deploy(ap)
  contracts['lendingPool'] = pool.address
  data = await DataProvider.deploy(ap)
  contracts['dataProvider'] = data.address
  initializer = await ReserveInitializer.deploy(ap)
  contracts['initializer'] = initializer.address
  oracle = await Oracle.deploy()
  contracts['oracle'] = oracle.address
  rewards = await Rewards.deploy(ap)
  contracts['reward'] = rewards.address
  hood = await Hood.deploy(ap)
  contracts['hoodToken'] = hood.address

  await addressProvider.setLendingPool(pool.address)
  await addressProvider.setLendingPoolCore(core.address)
  await addressProvider.setLendingPoolDataProvider(data.address)
  await addressProvider.setETHAddress('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
  await addressProvider.setReserveInitializer(initializer.address)
  await addressProvider.setConfigLibrary(config.address)
  await addressProvider.setPriceOracle(oracle.address)
  await addressProvider.setHoodToken(hood.address)
  await addressProvider.setRewardDistribution(rewards.address)

  await core.initialize()
  await data.initialize()
  await pool.initialize()
  await initializer.initialize()
  await rewards.initialize()

  asset1 = await Asset.deploy("United States Dollar", "USD", 18);
  asset1Addr = asset1.address;
  contracts['usd'] = asset1Addr

  asset2 = await Asset.deploy("Nepali Rupees", "NRS", 18);
  asset2Addr = asset2.address;
  contracts['nrs'] = asset2Addr

  asset3 = await Asset.deploy("Indigo", "INDG", 18);
  asset3Addr = asset3.address;
  contracts['indg'] = asset3Addr

  console.table(contracts)

  let deployerAddr = deployer.address;
  await asset1.mint(deployerAddr, BigN(999 * 10 ** 18))
  await asset2.mint(deployerAddr, BigN(999 * 10 ** 18))
  await asset3.mint(deployerAddr, BigN(999 * 10 ** 18))

  console.log('minting done!')

  const tx = await initializer.initializeReserve(contracts['usd']);
  const receipt = await tx.wait()
  await initializer.initializeReserve(contracts['nrs']);
  await initializer.initializeReserve(contracts['indg']);
  console.log("reserve initialized")
  
  await rewards.initializeAssetConfig(await core.getReserveHTokenAddress(asset1.address),  BigN(20 * 10 ** 16))
  await rewards.initializeAssetConfig(await core.getReserveDTokenAddress(asset1.address),  BigN(10 * 10 ** 16))
  await rewards.initializeAssetConfig(await core.getReserveHTokenAddress(asset2.address),  BigN(20 * 10 ** 16))
  await rewards.initializeAssetConfig(await core.getReserveDTokenAddress(asset2.address),  BigN(10 * 10 ** 16))
  await rewards.initializeAssetConfig(await core.getReserveHTokenAddress(asset3.address),  BigN(20 * 10 ** 16))
  await rewards.initializeAssetConfig(await core.getReserveDTokenAddress(asset3.address),  BigN(10 * 10 ** 16))

  // // set prices of assets    
  const newtPrice = ethers.BigNumber.from(`${parseInt(5 * 10 ** 18)}`); 
  const usdPrice = ethers.BigNumber.from(`${parseInt(1 * 10 ** 18)}`); 
  const nrsPrice = ethers.BigNumber.from(`${parseInt((10 ** 18)/120)}`); 

  await oracle.set_reference_data(contracts['usd'], usdPrice); // [usd][usd] = 1
  await oracle.set_reference_data(contracts['nrs'], nrsPrice); // [nrs][usd] = 1/120
  await oracle.set_reference_data(contracts['indg'], newtPrice); // [newt][usd] = 5


  await asset1.approve(contracts['lendingPoolCore'], BigN(200 * 10 ** 18))
  await asset2.approve(contracts['lendingPoolCore'], BigN(200 * 10 ** 18))
  await asset3.approve(contracts['lendingPoolCore'], BigN(200 * 10 ** 18))
  console.log('approvals done!')

  await pool.connect(deployer).deposit(contracts['usd'], BigN(200 * 10 ** 18))
  await pool.connect(deployer).deposit(contracts['nrs'], BigN(200 * 10 ** 18))
  await pool.connect(deployer).deposit(contracts['indg'], BigN(200 * 10 ** 18))
  
  console.log('Deposits done')
  console.log("setup complete")
  saveContractAdresses(contracts)

}

function saveContractAdresses(contractAddresses) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "consts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contractAddresses.json"),
    JSON.stringify(contractAddresses, undefined, 2)
  );
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
