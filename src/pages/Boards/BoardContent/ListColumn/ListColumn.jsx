import Box from '@mui/system/Box'
import Column from './Column/Column'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import Button from '@mui/material/Button'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'

function ListColumn({ columns }) {
  // biến đổi thành dạng ['column-id-01', 'column-id-02', 'column-id-03'](thư viện yêu cầu về dạng này)
  const items = columns?.map((column) => column._id)

  return (
    <SortableContext items={items} strategy={horizontalListSortingStrategy}>
      <Box
        sx={{
          display: 'flex',
          overflowY: 'hidden',
          overflowX: 'auto',
          width: '100%',
          height: '100%',
          bgcolor: 'inherit',
          '&::-webkit-scrollbar-track': { m: 2 }
        }}
      >
        {/* Box Column Test 01 */}

        {columns?.map((column) => (
          <Column key={column._id} column={column} />
        ))}

        {/* Box add new column */}
        <Box
          sx={{
            minWidth: '200px',
            maxWidth: '200px',
            mx: 2,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: '#ffffff3d'
          }}
        >
          <Button
            sx={{
              color: 'white',
              width: '100%',
              justifyContent: 'flex-start',
              pl: 2.5,
              py: 1
            }}
            startIcon={<NoteAddIcon />}
          >
            Add column
          </Button>
        </Box>
      </Box>
    </SortableContext>
  )
}

export default ListColumn
