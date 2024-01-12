import {
  Box,
  Button,
  Flex,
  Input,
  Link,
  Text,
  Tooltip,
  useColorModeValue,
  useMediaQuery,
} from "@chakra-ui/react";
import { useRouter } from 'next/router';
import React, { FormEvent } from 'react';
import { useChatType } from '../context/chatTypeContext';

type IntroProps = {
  onSubmit: (type: string) => (event: FormEvent) => Promise<void>;
};

function Intro({ onSubmit }: IntroProps) {
  const { setChatType } = useChatType();
  const borderColor = useColorModeValue("gray.400", "gray.900");
  const backgroundColor = useColorModeValue("white", "gray.700");
  const warningBackgroundColor = useColorModeValue("blue.50", "whiteAlpha.50");
  const router = useRouter();

  const handleButtonClick = (type: 'SINGLE' | 'GROUP') => (event: FormEvent) => {
    setChatType(type);
      onSubmit(type)(event);
  };


  return (
    <Flex
      direction={{ md: "column", base: "column-reverse" }}
      width="100%"
      maxWidth={"768px"}
      margin="auto"
      mt={10}
      backgroundColor={backgroundColor}
      borderRadius={10}
      px={{ md: 5, base: 2 }}
      py={8}
      border="1px solid"
      borderColor={borderColor}
    >
      <Text fontWeight="bold" fontSize="sm" textAlign="center">
        Click on the Text button to start.
      </Text>

      <br />

      <Text>
      Users are randomly joined together into a chat room.
      </Text>

      <br />

      <Text>
      This is a work in progress anon chat app. 
      </Text>

      <br />

      <Box
        margin="0 auto"
        p={4}
        borderRadius={10}
        border="1px solid"
        backgroundColor={warningBackgroundColor}
        borderColor={borderColor}
      >
        <Text textAlign="center">
          Developed by Dec3ptor, Check out the{" "}
          <Link
            href="https://github.com/Dec3ptor"
            rel="noreferrer"
            target="_blank"
          >
            Source Code. May be hidden for now.
          </Link>
        </Text>
      </Box>

      <br />

      <Flex justifyContent={"space-between"} gap={5}>
        <Box width="100%" display={{ md: "unset", base: "none" }}>
          <Text fontSize={"lg"} mb={2} textAlign={"center"}>
            What do you wanna talk about?
          </Text>

          <Tooltip label="This feature is unavailable at the moment...">
            <Input
              disabled
              placeholder="Add your interests (Optional)"
              height="60px"
            />
          </Tooltip>
        </Box>

              <Box width="100%">
        <Text fontSize={"lg"} mb={2} textAlign={"center"}>
          Start chatting:
        </Text>
        <Flex justifyContent={"center"} gap={2}>
          <Button
            height={"60px"}
            width={"150px"}
            border={"1px solid"}
            onClick={handleButtonClick('SINGLE')}            
            backgroundColor={"blue.500"}
            color="white"
          >
            Single Chat
          </Button>

          <Text mt={4} fontWeight="bold">
            or
          </Text>

          <Flex direction={"column"}>
            <Tooltip label="Still in development...">
              <Button
                height={"60px"}
                width={"150px"}
                border={"1px solid"}
                onClick={handleButtonClick('GROUP')}
                backgroundColor={"blue.500"}
                color="white"
                // disabled
              >
                Group Chat
              </Button>
            </Tooltip>
          </Flex>
        </Flex>
      </Box>

      </Flex>
    </Flex>
  );
}

export default Intro;
