import Box from '@mui/system/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

const MENU_STYLE = {
  color: 'primary.main',
  bgcolor: 'white',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '& .MuiSvgIcon-root': {
    color: 'primary.main'
  },
  '&:hover': {
    // bgcolor: 'primary.light'
  }
}

function BoardBar() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        px: 2,
        overflow: 'auto',
        gap: 2,
        borderTop: '1px solid #1976d2',
        height: (theme) => theme.trello.boardBarHeight
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          sx={MENU_STYLE}
          icon={<DashboardIcon />}
          label='Kanban Board'
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<VpnLockIcon />}
          label='Public/Private Workspace'
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<AddToDriveIcon />}
          label='Add To Google Drive'
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<BoltIcon />}
          label='Automation'
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<FilterListIcon />}
          label='Filters'
          clickable
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant='outlined'
          href='#contained-buttons'
          startIcon={<PersonAddIcon />}
        >
          Invite
        </Button>
        <AvatarGroup
          max={5}
          sx={{
            '& .MuiAvatar-root': {
              width: 36,
              height: 36,
              fontSize: 14
            }
          }}
        >
          <Tooltip title='Remy Sharp'>
            <Avatar
              alt='Remy Sharp'
              src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwiVqpNd0zv349lznWpZI0-KKoEyp-sFiA_g&usqp=CAU'
            />
          </Tooltip>
          <Tooltip title='Travis Howard'>
            <Avatar
              alt='Travis Howard'
              src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPfO37MK81JIyR1ptwqr_vYO3w4VR-iC2wqQ&usqp=CAU'
            />
          </Tooltip>
          <Tooltip title='Cindy Baker'>
            <Avatar
              alt='Cindy Baker'
              src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRcSSgBmnBcCa7g5aZjn9sIQf7mZd-EuknoA&usqp=CAU'
            />
          </Tooltip>
          <Tooltip title='Agnes Walker'>
            <Avatar
              alt='Agnes Walker'
              src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkTCtx2w5KuPMeLNATOcy058HV24Al5jMs4Q&usqp=CAU'
            />
          </Tooltip>
          <Tooltip title='Trevor Henderson'>
            <Avatar
              alt='Trevor Henderson'
              src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVlSeT7A5KG31a13jmIjpo9iXlLRG52rexjQ&usqp=CAU'
            />
          </Tooltip>
          <Tooltip title='Trevor Henderson'>
            <Avatar
              alt='Trevor Henderson'
              src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVlSeT7A5KG31a13jmIjpo9iXlLRG52rexjQ&usqp=CAU'
            />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar
