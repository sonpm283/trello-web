import Box from '@mui/system/Box'
import ListColumn from './ListColumn/ListColumn'
import { mapOrder } from '~/utils/sort'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
  MouseSensor
} from '@dnd-kit/core'
import { useEffect, useState } from 'react'

import { arrayMove } from '@dnd-kit/sortable'

function BoardContent({ board }) {
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  // nhần và kéo 10px thì drag mới hoạt động còn nếu chỉ click thì không hoạt động
  //Chuột
  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 10
    }
  })
  //Ngón tay, bút
  const touchSensor = useSensor(TouchSensor, {
    // Press delay of 250ms, with tolerance of 5px of movement
    activationConstraint: {
      delay: 250,
      tolerance: 5
    }
  })
  // kết hợp mouse và touch
  const mySensors = useSensors(touchSensor, mouseSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board.columnOrderIds, '_id'))
  }, [board])

  // sau khi kéo và thả xong thì sẽ lấy được event(chứa 1 vài thông số quan trọng)
  const handleDragEnd = (event) => {
    console.log('handleDragEnd', event)

    const { active, over } = event

    if (!over) return

    // sau khi kéo sang 1 vị trí khác và thả ra
    if (active.id !== over.id) {
      // lấy index trước khi thả ra dựa trên active.id
      const oldIndex = orderedColumns.findIndex((column) => column._id === active.id)
      // lấy index sau khi thả ra dựa trên over.id
      const newIndex = orderedColumns.findIndex((column) => column._id === over.id)
      // sử dụng arrayMove để cập lấy mảng các column sau khi kéo thả
      const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex)

      // sau này xử lý gọi api
      // const dndOrderedColumnsIds = dndOrderedColumns.map((column) => column._id)
      // console.log('dndOrderedColumns', dndOrderedColumns)
      // console.log('dndOrderedColumnsIds', dndOrderedColumnsIds)

      setOrderedColumns(dndOrderedColumns)
    }
  }

  return (
    // dùng sensors={mySensors}
    <DndContext onDragEnd={handleDragEnd} sensors={mySensors}>
      <Box
        sx={{
          width: '100%',
          p: '10px 0',
          height: (theme) => theme.trello.boardContentHeight,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2')
        }}
      >
        <ListColumn columns={orderedColumns} />
      </Box>
    </DndContext>
  )
}

export default BoardContent
