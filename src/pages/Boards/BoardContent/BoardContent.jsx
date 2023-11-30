import Box from '@mui/system/Box'
import ListColumn from './ListColumn/ListColumn'
import { mapOrder } from '~/utils/sort'

function BoardContent({ board }) {
  const orderedColumns = mapOrder(board?.columns, board.columnOrderIds, '_id')
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
      <ListColumn columns={orderedColumns} />
    </Box>
  )
}

export default BoardContent
