import React from "react";
import { createElement, memo } from "react";

const DragDrop = ({
  children,
  dragRef,
  id = "default",
  array = [],
  onClick = () => {},
  setArray = () => {},
  index,
  element = "div",
  draggable = true,
  itemKey,
}) => {
  const dragStart = () => {
    dragRef.current.start = index;
  };

  const dragEnter = () => {
    dragRef.current.enter = index;
  };

  const dragOver = (e) => {
    e.preventDefault();
  };

  const drop = () => {
    const { start, enter } = dragRef.current;
    if (start === -1 || enter === -1 || start === enter) return;

    const updated = [...array];
    const [moved] = updated.splice(start, 1);
    updated.splice(enter, 0, moved);

    dragRef.current.start = -1;
    dragRef.current.enter = -1;

    setArray(updated);
  };

  return createElement(
    element,
    {
      className: `dragItem dragItem_${id}`,
      draggable,
      onDragStart: dragStart,
      onDragEnter: dragEnter,
      onDragOver: dragOver,
      onDragEnd: drop,
      onClick,
      key: itemKey,
    },
    children
  );
};

export default memo(DragDrop);
