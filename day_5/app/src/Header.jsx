import {AppBar, Badge, IconButton, Toolbar, Typography} from '@mui/material'
import {
    Menu as MenuIcon,
    Notifications as NotifiIcon,
    DarkMode as DarkModeIcon,
} from '@mui/icons-material'

import { useApp } from './AppProvider.jsx'

export default function Header(){
    const { setOpenDrawer } = useApp()

    return <AppBar position="static">
        <Toolbar>
            <IconButton edge="start"
                onClick={() => setOpenDrawer(true)}            
                color="inherit" 
                aria-label="menu"
                sx={{ mr: 2 }}
                >
                <MenuIcon />
            </IconButton>

            <Typography sx={{ flexGrow: 1 }}>
                Social
            </Typography>

            <IconButton edge="end" color="inherit" aria-label="notifications" sx={{ mr: 1 }}>
                <Badge badgeContent={10} color="error">
                    <NotifiIcon />
                </Badge>
            </IconButton>

            <IconButton edge="end" color="inherit" aria-label="darkmode">
                <DarkModeIcon />
            </IconButton>

        </Toolbar>
    </AppBar>
}