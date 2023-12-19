import Box from '@mui/system/Box'
import ListColumn from './ListColumn/ListColumn'
import { mapOrder } from '~/utils/sort'
import { cloneDeep } from 'lodash'
import {
  DndContext,
  // PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
  MouseSensor,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import { useEffect, useState } from 'react'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

import { arrayMove } from '@dnd-kit/sortable'
import Column from './ListColumn/Column/Column'
import Card from './ListColumn/Column/ListCard/Card/Card'

function BoardContent({ board }) {
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

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

  // Tại 1 thời điểm chỉ có 1 phần tử đang được kéo(column hoặc card)
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board.columnOrderIds, '_id'))
  }, [board])

  // khi bắt đầu kéo
  const handleDragStart = (event) => {
    setActiveDragItemId(event?.active.id)
    setActiveDragItemType(
      event?.active.data.current.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    )
    setActiveDragItemData(event?.active.data.current)
  }

  // sau khi kéo và thả xong thì sẽ lấy được event(chứa 1 vài thông số quan trọng)
  const handleDragEnd = (event) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) return

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

    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
  }

  const handleDragOver = (event) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    const { active, over } = event

    if (!active || !over) return

    // Lấy thông số của card đang được kéo
    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCardData }
    } = active

    // lấy thông số của card được kéo qua mà đang được tương tác với cái card đang được kéo ở bên trên
    const {
      id: overCardId,
      data: { current: overDraggingCardData }
    } = over

    // Tìm 2 cái column theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    if (!activeColumn || !overColumn) return

    // Xử lý logic chỉ khi kéo card sang 1 column khác
    if (activeColumn._id !== overColumn._id) {
      // Tìm index của overcard
      // Khi kéo card sang cột khác và chuẩn bị cho nó over vào chỗ của 1 card khác

      setOrderedColumns((prevColumns) => {
        const overCardIndex = overColumn?.cards?.findIndex((card) => card._id === overCardId)

        // Tính toán "cardIndex mới"(trên hoặc dưới của overCard)
        let newCardIndex
        const isBelowOverItem =
          active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height

        const modifier = isBelowOverItem ? 1 : 0

        newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards.length + 1

        const nextColumns = cloneDeep(prevColumns)

        // Clone column active và column over
        const nextActiveColumn = nextColumns.find((column) => column._id === activeColumn._id)
        const nextOverColumn = nextColumns.find((column) => column._id === overColumn._id)

        // Xoá card ở column cũ sau khi kéo sang 1 column khác
        if (nextActiveColumn) {
          // Xoá card ở column cũ sau khi kéo sang 1 column khác
          nextActiveColumn.cards = nextActiveColumn.cards.filter((card) => card._id !== activeDraggingCardId)

          // Cập nhật lại mảng cardOrderIds
          nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map((card) => card._id)
        }

        if (nextOverColumn) {
          //Kiểm tra xem card đang kéo nó có tồn tại ở overColumn chưa nếu có thì cần xoá nó trước
          nextOverColumn.cards = nextOverColumn.cards.filter((card) => card._id !== activeDraggingCardId)

          // console.log(nextOverColumn.cards.splice(9, 0, 4))
          nextOverColumn.cards.splice(newCardIndex, 0, activeDraggingCardData)
        }

        return nextColumns
      })
    }
  }

  const findColumnByCardId = (cardId) => {
    return orderedColumns.find((column) => column.cards.map((card) => card._id)?.includes(cardId))
  }

  // Animation khi thả (drop) phần tử (không bị mất overlay khi chưa về đúng vị trí)
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }

  // bat su kien onDragOver

  return (
    // dùng sensors={mySensors}
    <DndContext onDragEnd={handleDragEnd} onDragOver={handleDragOver} sensors={mySensors} onDragStart={handleDragStart}>
      <Box
        sx={{
          width: '100%',
          p: '10px 0',
          height: (theme) => theme.trello.boardContentHeight,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2')
        }}
      >
        <ListColumn columns={orderedColumns} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && <Column column={activeDragItemData} />}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && <Card card={activeDragItemData} />}
        </DragOverlay>
        ,
      </Box>
    </DndContext>
  )
}

export default BoardContent
