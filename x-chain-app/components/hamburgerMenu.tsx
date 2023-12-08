import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { FaBars } from "react-icons/fa6";
import { ConnectButton } from "@rainbow-me/rainbowkit";

type HamburgerMenuProps = {
  numberBlocker: number;
};

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ numberBlocker }) => {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignContent: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            marginRight: "1vw",
            marginLeft: "auto",
          }}
        >
          <ConnectButton
            showBalance={{
              smallScreen: false,
              largeScreen: false,
            }}
            chainStatus={{
              smallScreen: "icon",
              largeScreen: "full",
            }}
          />
        </div>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<FaBars color="#16355C" size={"3vw"}/>}
            colorScheme="none"
          />
          <MenuList>
            <MenuItem
              onClick={() => numberBlocker != 1 && (window.location.href = "/")}
              backgroundColor={numberBlocker === 1 ? "gray.500" : ""}
              color={numberBlocker === 1 ? "white" : ""}
            >
              NFT Wrapping (Original Chain)
            </MenuItem>
            <MenuItem
              onClick={() =>
                numberBlocker != 2 && (window.location.href = "/newChain")
              }
              backgroundColor={numberBlocker === 2 ? "gray.500" : ""}
              color={numberBlocker === 2 ? "white" : ""}
            >
              NFT Unwrapping (New Chain)
            </MenuItem>
          </MenuList>
        </Menu>
      </div>
    </>
  );
};

export default HamburgerMenu;
