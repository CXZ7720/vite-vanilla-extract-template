import { AppShell, Burger, Flex, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconVideo } from '@tabler/icons-react';
import { Link, Outlet } from '@tanstack/react-router';



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

      <AppShell.Navbar>
        <Link to='/'>
          <NavLink label="Home" component='button'/>
        </Link>
        <Link to='/convert'>
          <NavLink label="Convert Video" component='button'/>
        </Link>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
    )
}
