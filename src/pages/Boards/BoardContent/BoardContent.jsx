import Box from '@mui/system/Box'
import ListColumn from './ListColumn/ListColumn'

function BoardContent() {
  return (
    <Box
      sx={{
        width: '100%',
        p: '10px 0',
        height: (theme) => theme.trello.boardContentHeight,
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'
      }}
    >
      <ListColumn />
    </Box>
  )
}

export default BoardContent
