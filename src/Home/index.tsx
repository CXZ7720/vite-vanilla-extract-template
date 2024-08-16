import { AppShell, Burger, Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconVideo } from '@tabler/icons-react';



export const Home = () => {

    const [opened, { toggle }] = useDisclosure();
    return (
        <AppShell
      header={{ height: 60, }}
      navbar={{
        width: 200,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding={{ base: "md", sm: "lg"}}
    >
      <AppShell.Header>
        <Flex px={16}>
        <Flex hiddenFrom='sm' mih={60} align="center">
        <Burger
          opened={opened}
          onClick={toggle}
          size="md"
        />
        </Flex>
        <Flex visibleFrom='sm' mih={60} align="center">
            <IconVideo size={48}/>
        </Flex>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

      <AppShell.Main>Main</AppShell.Main>
    </AppShell>
    )
}
