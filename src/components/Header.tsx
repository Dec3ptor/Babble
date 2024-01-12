import {
  Button,
  Flex,
  Image,
  Text,
  Tooltip,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";

function Header() {
  const headerBackgroundColor = useColorModeValue("white", "gray.700");
  const { toggleColorMode, colorMode } = useColorMode();

  return (
    <Flex
      height={{ base: "auto", md: "20" }}
      boxShadow="lg"
      backgroundColor={headerBackgroundColor}
      as="header"
      zIndex={1}
      // position="fixed" 
    >
      <Flex
        width="100%"
        maxWidth={{ base: "1440px", md: "auto" }}
        py={"3"}
        px={"5"}
        alignItems="center"
        margin="0 auto"
        direction={{ base: "column", md: "row" }}
      >
        <Flex gap={2} alignItems="center">
          <Image src="/logo2.png" alt="" blockSize={{ md: "14", base: "12" }} />
          <Text
                as="span"
                fontSize={"4xl"}
                fontWeight={"normal"}
                textColor="black.200"
              >
Just a Chat App              </Text>
          {/* <Image src="/logo.png" alt="" blockSize={{ md: "14", base: "12" }} /> */}

          <Button onClick={toggleColorMode}>
            {colorMode === "dark" ? "Light" : "Dark"}
          </Button>
        </Flex>

        <Flex
          ml="16"
          my="1"
          alignItems="center"
          display={{ md: "unset", base: "none" }}
        >
          <Text
            fontWeight={"bold"}
            fontSize="2xl"
            sx={{ transform: "rotate(-4deg)" }}
          >
            Talk to Strangers!
          </Text>
        </Flex>
        <Flex ml={"auto"} display={{ base: "none", md: "unset" }}>
          <Tooltip label=" ">
            <Text fontSize={"4xl"} fontWeight="bold" textColor={"blue.400"}>
              {" "}
              <Text
                as="span"
                fontSize={"2xl"}
                fontWeight={"normal"}
                textColor="blue.200"
              >
                "Users"
              </Text>
            </Text>
          </Tooltip>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default Header;
