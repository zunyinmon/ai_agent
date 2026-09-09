import {
    Box,
    Divider, 
    Drawer,
    List, 
    ListItem, 
    ListItemButton, 
    ListItemIcon,
    ListItemText, } from '@mui/material'

import {grey} from '@mui/material/colors'

import { useApp } from './AppProvider.jsx'

import { 
    Home as HomeIcon, 
    Person as PersonIcon, 
    Login as LoginIcon, 
    Logout as LogoutIcon, 
    PersonAdd as RegisterIcon } from '@mui/icons-material'


export default function AppDrawer(){
    const { openDrawer, setOpenDrawer } = useApp()

    return <Drawer 
        open={openDrawer} 
        onClick={() => setOpenDrawer(false)}
        onClose={() => setOpenDrawer(false)}    
        >
        <Box sx={{ width: 240, height: 200, bgcolor: 'grey.600' }} role="presentation">
            <div> cLick here to close </div>
        </Box>
        <List>
            <ListItem>
                <ListItemButton>
                    <ListItemIcon><HomeIcon /></ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>
            </ListItem>
            </List>
            <Divider/>
            <List>
            <ListItem>
                <ListItemButton>
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText primary="Profile" />
                </ListItemButton>
            </ListItem>
            <ListItem>
                <ListItemButton>
                    <ListItemIcon><LoginIcon /></ListItemIcon>
                    <ListItemText primary="Login" />
                </ListItemButton>
            </ListItem>            
            <ListItem>
                <ListItemButton>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </ListItem>
            <ListItem>
                <ListItemButton>
                    <ListItemIcon><RegisterIcon /></ListItemIcon>
                    <ListItemText primary="Register" />
                </ListItemButton>
            </ListItem>

        </List>
    </Drawer>
}
