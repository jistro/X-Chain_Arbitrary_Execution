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
	@echo "  make deployTest       deploy ALL contracts in anvil local testnet"
	@echo "---------------------------------------------------------------------------------"
	@echo ""
	@echo "-------------------------=Deployers for testnets GmFam=--------------------------"
	@echo "  make deployGmFamA 	   deploy the protocol in Amplify subnet testnet"
	@echo "  make deployGmFamB 	   deploy the protocol in Bulletin subnet testnet"
	@echo "  make deployGmFamC 	   deploy the protocol in Conduit subnet testnet"
	@echo "---------------------------------------------------------------------------------"
	@echo ""
	@echo "-------------------------=Deployers for testnets Cherry=-------------------------"
	@echo "  make deployNft 	   deploy the NFT contracts in Amplify subnet testnet"
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

AMPLIFY_ARGS := --rpc-url $(RPC_URL_AMPLIFY) --private-key $(PRIVATE) --broadcast 
BULLETIN_ARGS := --rpc-url $(RPC_URL_BULLETIN) --private-key $(PRIVATE) --broadcast
CONDUIT_ARGS := --rpc-url $(RPC_URL_CONDUIT) --private-key $(PRIVATE) --broadcast


compile:
	forge compile

deployNft:
	@echo "█░Deploying NFT Contracts in Amplify subnet testnet░█████████████████████████████████"
	@forge script script/DeployNFT.s.sol:DeployNFT $(AMPLIFY_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"

deployTest:
	@echo "█░Deploying test Contracts in anvil local testnet░█████████████████████████████████"
	@forge script script/DeployAll__InternalTest.s.sol:DeployAll__InternalTest $(NETWORK_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"

deployGmFamA:
	@echo "█░Deploying protocol Contracts in Amplify subnet testnet░██████████████████████████"
	@forge script script/DeployProtocol.s.sol:DeployProtocol $(AMPLIFY_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"

deployGmFamB:
	@echo "█░Deploying protocol Contracts in Bulletin subnet testnet░█████████████████████████"
	@forge script script/DeployProtocol.s.sol:DeployProtocol $(BULLETIN_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"

deployGmFamC:
	@echo "█░Deploying protocol Contracts in Conduit subnet testnet░██████████████████████████"
	@forge script script/DeployProtocol.s.sol:DeployProtocol $(CONDUIT_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"

deployProtocolAllSubnetTestnets:
	@echo "█░Deploying protocol Contracts in all subnet testnets░█████████████████████████████"
	@echo ""
	@echo "█░Amplify░█████████████"
	@forge script script/DeployProtocol.s.sol:DeployProtocol $(AMPLIFY_ARGS)
	@echo "█░Bulletin░████████████"
	@forge script script/DeployProtocol.s.sol:DeployProtocol $(BULLETIN_ARGS)
	@echo "█░Conduit░█████████████"
	@forge script script/DeployProtocol.s.sol:DeployProtocol $(CONDUIT_ARGS)
	@echo ""
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"

deployTeleporterTest:
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"
	@echo "███████████████████████████████░Deploying in chain A░█████████████████████████████"
	@forge script script/DeployTeleporterOriginalSubnet.s.sol:DeployTeleporterOriginalSubnet $(AMPLIFY_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"
	@echo "███████████████████████████████░Deploying in chain B░█████████████████████████████"
	@forge script script/DeployTeleporterNewSubnet.s.sol:DeployTeleporterNewSubnet $(BULLETIN_ARGS)
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"
	@echo "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"
	