import Box from '@mui/system/Box'
import ListColumn from './ListColumn/ListColumn'
import { mapOrder } from '~/utils/sort'
import { cloneDeep, indexOf, isBuffer } from 'lodash'
import {
  DndContext,
  // PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
  MouseSensor,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  closestCenter
} from '@dnd-kit/core'
import { useCallback, useEffect, useRef, useState } from 'react'

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
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)
  const lastOverId = useRef(null)

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board.columnOrderIds, '_id'))
  }, [board])

  //Tìm kiếm colums theo cardId
  const findColumnByCardId = (cardId) => {
    return orderedColumns.find((column) => column.cards.map((card) => card._id)?.includes(cardId))
  }

  // Cập nhật lại Data khi kéo thả card giữa các column
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    setOrderedColumns((prevColumns) => {
      const overCardIndex = overColumn?.cards?.findIndex((card) => card._id === overCardId)

      // Tính toán "cardIndex mới"(trên hoặc dưới của overCard)
      let newCardIndex
      const isBelowOverItem =
        active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards.length + 1

      //clone prevColumns lodash
      const nextColumns = cloneDeep(prevColumns)

      // Clone column active và column over
      const nextActiveColumn = nextColumns.find((column) => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find((column) => column._id === overColumn._id)

      //nextActiveColumn: Column cũ
      // Xoá card ở column cũ sau khi kéo sang 1 column khác
      if (nextActiveColumn) {
        // Xoá card ở column cũ sau khi kéo sang 1 column khác
        nextActiveColumn.cards = nextActiveColumn.cards.filter((card) => card._id !== activeDraggingCardId)
        // Cập nhật lại mảng cardOrderIds
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map((card) => card._id)
      }

      //nextOverColumn: Column cũ
      if (nextOverColumn) {
        //Kiểm tra xem card đang kéo nó có tồn tại ở overColumn chưa nếu có thì cần xoá nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter((card) => card._id !== activeDraggingCardId)

        // clone lại activeDraggingCardData và cập nhật lại columnId phù hợp sau khi kéo thả sang column khác
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }
        // Thêm card mới vào column mới
        nextOverColumn.cards.splice(newCardIndex, 0, rebuild_activeDraggingCardData)
        // Cập nhật lại mảng cardOrderIds
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map((card) => card._id)
      }

      return nextColumns
    })
  }

  // Trigger khi bắt đầu kéo
  const handleDragStart = (event) => {
    setActiveDragItemId(event?.active.id)
    setActiveDragItemType(
      event?.active.data.current.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    )
    setActiveDragItemData(event?.active.data.current)

    if (event?.active.data.current.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active.id))
    }
  }

  //Trigger trong quá trình kéo
  const handleDragOver = (event) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    //Lấy ra item đang được kéo và item được kéo qua
    const { active, over } = event
    if (!active || !over) return

    // Lấy thông số của card đang được kéo id và data
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
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      )
    }
  }

  // sau khi kéo và thả xong thì sẽ lấy được event(chứa 1 vài thông số quan trọng)
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!active || !over) return

    // xử lý khi kéo thả card //  code
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      //Lấy ra item đang được kéo và item được kéo qua
      const { active, over } = event
      if (!active || !over) return

      // Lấy thông số của card đang được kéo id và data
      const {
        id: activeDraggingCardId,
        data: { current: activeDraggingCardData }
      } = active

      // lấy thông số của card được kéo qua mà đang được tương tác với cái card đang được kéo ở bên trên
      const {
        id: overCardId,
        data: { current: overDraggingCardData }
      } = over

      // Tìm 2 cái column theo card active Id và card over Id
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      if (!activeColumn || !overColumn) return

      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        )
      } else {
        const oldCardIndex = oldColumnWhenDraggingCard?.cards.findIndex((card) => card._id === activeDragItemId)
        const newCardIndex = overColumn?.cards.findIndex((card) => card._id === overCardId)
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)

        setOrderedColumns((prevColumns) => {
          const nextColumns = cloneDeep(prevColumns)
          const targetColumn = nextColumns.find((column) => column._id === overColumn._id)

          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map((card) => card._id)

          return nextColumns
        })
      }
    }

    // xử lý khi kéo thả column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && active.id !== over.id) {
      // Sau khi kéo sang 1 vị trí khác và thả ra
      // Sau khi thả Columns
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
    setOldColumnWhenDraggingCard(null)
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

  // Custom thuật toán phát hiện va chạm(fix lỗi flicking khi kéo thả card giữa các column)
  const collisionDetectionStrategy = useCallback(
    // TRẢ VỀ 1 MẢNG CHỨA ID VA CHẠM
    (args) => {
      // Nếu là kéo cột thì sử dụng closestCorners như bình thường
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        return closestCorners({ ...args })
      }

      //Tìm các điểm giao nhau, va chạm - intersections với con trỏ
      const pointerIntersections = pointerWithin(args)

      //Thuật toán phát hiện va chạm sẽ trả về 1 mảng các va chạm
      const intersections = !!pointerIntersections?.length ? pointerIntersections : rectIntersection(agrs)
      //Tìm overId đầu tiên trong intersections
      let overId = getFirstCollision(intersections, 'id')

      if (overId) {
        const checkColumn = orderedColumns.find((column) => column._id === overId)

        // khi kéo mà chạm vào cạnh của column thì thả luôn vào card(không xử lý ở va chạm với column)
        if (checkColumn) {
          overId = closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) => container.id !== overId && checkColumn?.cardOrderIds.includes(container.id)
            )
          })[0]?.id
        }
        lastOverId.current = overId
        return [{ id: overId }]
      }

      // nếu overId là null thì trả về mảng rỗng - tránh bug crash trang
      return lastOverId ? [{ id: lastOverId }] : []
    },
    [activeDragItemType]
  )

  return (
    // dùng sensors={mySensors}
    <DndContext
      // phát hiện va chạm ở border của card khi kéo thả
      collisionDetection={collisionDetectionStrategy}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      sensors={mySensors}
      onDragStart={handleDragStart}
    >
      <Box
        sx={{
          width: '100%',
          p: '10px 0',
          height: (theme) => theme.trello.boardContentHeight,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2')
        }}
      >
        <ListColumn hidden={true} columns={orderedColumns} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && <Column column={activeDragItemData} />}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && <Card card={activeDragItemData} />}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
