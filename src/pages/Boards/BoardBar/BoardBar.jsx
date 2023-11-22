import Box from '@mui/system/Box'

function BoardBar() {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      backgroundColor: 'primary.dark'
    }}>
      Board Bar
    </Box>
  )
}

export default BoardBar
