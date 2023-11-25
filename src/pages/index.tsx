import { Box, Button, Grid, Text, useColorModeValue } from "@chakra-ui/react";
import Head from "next/head";
import { FormEvent, useContext, useState } from "react";
import Chat from "../components/Chat";
import Header from "../components/Header";
import Intro from "../components/Intro";
import { PusherContext } from "../context/pusherContext";

export default function Home() {
  const backgroundColor = useColorModeValue("orange.50", "gray.800");
  const [redirectToChat, setRedirectToChat] = useState(false);
  const [chatType, setChatType] = useState(''); // 'group' or 'single'

  const { setStartPusher } = useContext(PusherContext);

  const onSubmit = (chatTypeSelected: string) => (event: FormEvent) => {
    event.preventDefault();
    setStartPusher(true);
    setChatType(chatTypeSelected);
    setRedirectToChat(true);
    return Promise.resolve(); // Explicitly return a resolved Promise
  };
  return (
    <>
      <Head>
        <title>Babble: Talk to strangers!</title>
        <link rel="icon" href="/icon.png" type="image/png" />
        <meta
          name="description"
          content="The Internet is full of cool strangers; Babble lets you meet them. When you use babble, we pick someone else at random so you can have a one-on-one chat."
        />
      </Head>
      <Grid
        templateRows="max-content 1fr"
        minHeight="100vh"
        backgroundColor={backgroundColor}
      >
        <Header />
        {redirectToChat 
        ? <Chat chatType={chatType} />
        : <Intro onSubmit={onSubmit} />
        }
      </Grid>
    </>
  );
}
