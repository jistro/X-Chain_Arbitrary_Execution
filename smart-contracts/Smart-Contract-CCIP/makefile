-include .env

.PHONY: all

DEFAULT_ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

help:
	@echo ""
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░gm Fam!░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"
	@echo ""
	@echo "-------------------------------------=Usage=-------------------------------------"
	@echo "  make install    install dependencies"
	@echo "  make format     format code"
	@echo "  make anvil      run anvil"
	@echo "  make compile    compile contracts"
	@echo "---------------------------------------------------------------------------------"
	@echo ""
	@echo "-----------------------=Deployers for anvils local testnet=----------------------"
	@echo "  make deployTest           deploy ALL contracts in anvil local testnet"
	@echo "  make deployTestToken      deploy ONLY the token deployer in anvil local testnet"
	@echo "---------------------------------------------------------------------------------"
	@echo ""
	@echo "-------------------------=Deployers for testnets GmFam=--------------------------"
	@echo "  make deployGmFamEthTest   deploy the protocol in Ethereum Sepolia testnet"
	@echo "  make deployGmFamArbTest   deploy the protocol in Arbitrum Goerli testnet"
	@echo "  make deployGmFamAvaxTest  deploy the protocol in Avalanche Fuji testnet"
	@echo "  make deployGmFamMaticTest deploy the protocol in Polygon Mumbai testnet"
	@echo "---------------------------------------------------------------------------------"
	@echo ""
	@echo "-------------------------=Deployers for testnets Cherry=-------------------------"
	@echo "  make deployCherryEthTest   deploy the NFT in Ethereum Sepolia testnet"
	@echo "  make deployCherryArbTest   deploy the NFT in Arbitrum Goerli testnet"
	@echo "  make deployCherryAvaxTest  deploy the NFT in Avalanche Fuji testnet"
	@echo "  make deployCherryMaticTest deploy the NFT in Polygon Mumbai testnet"
	@echo "---------------------------------------------------------------------------------"

	
all: clean remove install update build 

install:
	@echo "Installing libraries"
	@npm install
	@forge compile

format :; forge fmt

anvil :
	@echo "Starting Anvil, remember use another terminal to run tests"
	@anvil -m 'test test test test test test test test test test test junk' --steps-tracing

NETWORK_ARGS := --rpc-url http://localhost:8545 --private-key $(DEFAULT_ANVIL_KEY) --broadcast

ETH_SEPOLIA_TESTNET_ARGS := --rpc-url $(RPC_URL_ETH_SEPOLIA) --private-key $(PRIVATE) --broadcast --verify --etherscan-api-key $(API_KEY_ETH) -vvvv
ARB_GOERLI_TESTNET_ARGS := --rpc-url $(RPC_URL_ARB_GOERLI) --private-key $(PRIVATE) --broadcast --verify --etherscan-api-key $(API_KEY_ARB) -vvvv
AVAX_FUJI_TESTNET_ARGS := --rpc-url $(RPC_URL_AVAX_FUJI) --private-key $(PRIVATE) --broadcast --verify --verifier-url 'https://api.routescan.io/v2/network/testnet/evm/43113/etherscan' --etherscan-api-key "verifyContract" -vvvv
MATIC_MUMBAI_TESTNET_ARGS := --rpc-url $(RPC_URL_MATIC_MUMBAI) --private-key $(PRIVATE) --broadcast --verify --etherscan-api-key $(API_KEY_MATIC) -vvvv


compile:
	forge compile

deployTest:
	@echo "█░Deploying test Contracts in anvil local testnet░█████████████████████████████████"
	@forge script script/DeployAll__InternalTest.s.sol:DeployAll__InternalTest $(NETWORK_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"

deployGmFamEthTest:
	@echo "█░Deploying protocol Contracts in Ethereum Sepolia testnet░███████████████████████"
	@forge script script/DeployProtocol.s.sol:DeployProtocol $(ETH_SEPOLIA_TESTNET_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"

deployGmFamArbTest:
	@echo "█░Deploying protocol Contracts in Arbitrum Goerli testnet░████████████████████████"
	@forge script script/DeployProtocol.s.sol:DeployProtocol $(ARB_GOERLI_TESTNET_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"

deployGmFamAvaxTest:
	@echo "█░Deploying protocol Contracts in Avalanche Fuji testnet░█████████████████████████"
	@forge script script/DeployProtocol.s.sol:DeployProtocol $(AVAX_FUJI_TESTNET_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"

deployGmFamMaticTest:
	@echo "█░Deploying protocol Contracts in Polygon Mumbai testnet░█████████████████████████"
	@forge script script/DeployProtocol.s.sol:DeployProtocol $(MATIC_MUMBAI_TESTNET_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"

deployCherryEthTest:
	@echo "█░Deploying NFT Contracts in Ethereum Sepolia testnet░████████████████████████████"
	@forge script script/DeployNFT.s.sol:DeployNFT $(ETH_SEPOLIA_TESTNET_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"

deployCherryArbTest:
	@echo "█░Deploying NFT Contracts in Arbitrum Goerli testnet░█████████████████████████████"
	@forge script script/DeployNFT.s.sol:DeployNFT $(ARB_GOERLI_TESTNET_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"

deployCherryAvaxTest:
	@echo "█░Deploying NFT Contracts in Avalanche Fuji testnet░██████████████████████████████"
	@forge script script/DeployNFT.s.sol:DeployNFT $(AVAX_FUJI_TESTNET_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"

deployCherryMaticTest:
	@echo "█░Deploying NFT Contracts in Polygon Mumbai testnet░██████████████████████████████"
	@forge script script/DeployNFT.s.sol:DeployNFT $(MATIC_MUMBAI_TESTNET_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"

deployProtocolAllTestNets:
	@echo "█░Deploying protocol Contracts in all testnets░███████████████████████████████████"
	@echo ""
	@echo "█░ETH Sepolia░██████"
	@forge script script/DeployProtocol.s.sol:DeployProtocol $(ETH_SEPOLIA_TESTNET_ARGS)
	@echo "█░ARB Goerli░███████"
	@forge script script/DeployProtocol.s.sol:DeployProtocol $(ARB_GOERLI_TESTNET_ARGS)
	@echo "█░AVAX Fuji░████████"
	@forge script script/DeployProtocol.s.sol:DeployProtocol $(AVAX_FUJI_TESTNET_ARGS)
	@echo "█░MATIC Mumbai░█████"
	@forge script script/DeployProtocol.s.sol:DeployProtocol $(MATIC_MUMBAI_TESTNET_ARGS)
	@echo ""
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"

deployCcipDemo:
	@echo "█░Preparing demo SCs for CCIP░████████████"
	@echo " "
	@echo "█████████████████████████████████████████████████████████████████████████████████████████████████████"
	@echo "████████████████████████████████░Deploying in Original chain (AVAX)░████████████████████████████████"
	@echo "█████████████████████████████████████████████████████████████████████████████████████████████████████"
	@forge script script/DeployCCIPOriginalChain.s.sol:DeployCCIPOriginalChain $(AVAX_FUJI_TESTNET_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"
	@echo "█████████████████████████████████████████████████████████████████████████████████████████████████████"
	@echo "███████████████████████████████░Deploying in New chain (ETH Sepolia)░███████████████████████████████"
	@echo "█████████████████████████████████████████████████████████████████████████████████████████████████████"
	@forge script script/DeployCCIPNewChain.s.sol:DeployCCIPNewChain $(ETH_SEPOLIA_TESTNET_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"
	@echo " "
	