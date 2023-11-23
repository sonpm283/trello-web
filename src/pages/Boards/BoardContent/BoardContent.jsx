import Box from '@mui/system/Box'

function BoardContent() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: (theme) =>
          `calc(100vh - ${theme.trello.appBarHeight} - ${theme.trello.boardBarHeight})`,
        backgroundColor: 'primary.main'
      }}
    >
      Board Content
    </Box>
  )
}

export default BoardContent
