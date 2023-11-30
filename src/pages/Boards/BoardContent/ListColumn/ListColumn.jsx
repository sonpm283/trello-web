import Box from '@mui/system/Box'
import Column from './Column/Column'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import Button from '@mui/material/Button'

function ListColumn({ columns }) {
  return (
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
  )
}

export default ListColumn
