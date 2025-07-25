import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import React, { useMemo } from "react";
import { useSettingsContext } from "../context";
import {
  CppArrayVariableType,
  CppCharVariableType,
  CppGeneralVariableType,
  CppPointerVariableType,
  CppPrimitiveVariableType,
  CppStructVariableType,
  UNINITIALIZED,
} from "../types";
import CppUtils from "../utils";

const valueToString = (v: CppGeneralVariableType | string): string => {
  if (typeof v === "string") {
    if (v === UNINITIALIZED) return "?";
    return v;
  } else if (CppUtils.isPointer(v)) {
    return v.value === UNINITIALIZED ? "?" : (v.value as string);
  }
  switch (v.kind) {
    case "C_DATA":
      return v.value === UNINITIALIZED
        ? "?"
        : String((v as CppPrimitiveVariableType).value);
    case "C_ARRAY":
      return `[${(v as CppArrayVariableType<any>).value.length}]`;
    case "C_STRUCT":
      return `{${(v as CppStructVariableType).metadata.name}}`;
    default:
      return "?";
  }
};

const buildClasses = (colour: string) => {
  const bgMap: Record<string, string> = {
    blue: "bg-blue-950 border-blue-700 text-blue-100",
    green: "bg-green-900 border-green-600 text-green-100",
    yellow: "bg-yellow-900 border-yellow-700 text-yellow-100",
    purple: "bg-purple-900 border-purple-600 text-purple-100",
  };
  const elemMap: Record<string, string> = {
    blue: "bg-blue-800 border-blue-600",
    green: "bg-green-800 border-green-600",
    yellow: "bg-yellow-800 border-yellow-600",
    purple: "bg-purple-800 border-purple-600",
  };

  return {
    container: `rounded-lg shadow-md min-w-[250px] border-2 ${bgMap[colour]}`,
    header: `px-4 py-2 font-semibold border-b border-white/10`,
    elem: `rounded border p-1 text-sm ${elemMap[colour]}`,
  };
};

interface ElemHandleProps {
  anchorId: string;
  position: Position;
  small?: boolean;
  isSource?: boolean;
}
const ElemHandle: React.FC<ElemHandleProps> = ({
  anchorId,
  position,
  small = true,
  isSource = false,
}) => (
  <Handle
    type={isSource ? "source" : "target"}
    position={position}
    id={anchorId}
    className={
      small
        ? "!w-1 !h-1 !bg-white !rounded-full !border-none"
        : "!w-3 !h-3 !bg-red-500 !border-2 !border-red-700 !rounded-full"
    }
    style={
      position === Position.Left
        ? { left: 2, top: "50%", transform: "translateY(-50%)", zIndex: 1001 }
        : { right: -6, top: "50%", transform: "translateY(-50%)", zIndex: 1001 }
    }
  />
);

const ArrayItemRenderer = ({
  idx,
  item,
  elemCls,
}: {
  item: CppGeneralVariableType;
  idx: number;
  elemCls: string;
}) => {
  const { showMemory } = useSettingsContext();
  const isPtr = CppUtils.isPointer(item);
  const ptrVal = isPtr ? (item as CppPointerVariableType).value : null;
  const handleBase = CppUtils.getVariableNodeId(item);
  const renderValue = useMemo(() => {
    if (isPtr && ptrVal) {
      return valueToString(ptrVal);
    }
    return valueToString(item);
  }, [isPtr, ptrVal, item]);
  return (
    <div className={`${elemCls} relative`}>
      <ElemHandle anchorId={handleBase} position={Position.Left} />
      <div className="text-[11px] font-mono text-gray-300 font-bold">
        [{idx}]
      </div>
      {showMemory && (
        <div className="text-[10px] font-mono text-gray-400">
          {item.address}
        </div>
      )}
      <div className="font-semibold">{renderValue}</div>
      {isPtr && ptrVal && ptrVal !== UNINITIALIZED && (
        <ElemHandle
          anchorId={handleBase}
          position={Position.Right}
          small={false}
          isSource={true}
        />
      )}
    </div>
  );
};

const ArrayRenderer: React.FC<{
  arr: CppArrayVariableType<any>;
  id: string;
  elemCls: string;
  isReadOnly: boolean;
}> = ({ arr, elemCls, isReadOnly }) => {
  return (
    <div className="p-2">
      <div className="grid grid-cols-3 gap-1">
        {arr.value.map((el, idx) => (
          <ArrayItemRenderer key={idx} item={el} elemCls={elemCls} idx={idx} />
        ))}
      </div>
      {isReadOnly && (
        <div className="text-xs text-red-400 mt-2 italic">
          (this is in read-only storage, not the heap)
        </div>
      )}
    </div>
  );
};

const PrimitiveRenderer: React.FC<{
  prim: CppPrimitiveVariableType | CppCharVariableType | CppPointerVariableType;
}> = ({ prim }) => (
  <div className="p-2">
    <div className="flex flex-col gap-1 items-start">
      <div className="text-xs font-mono text-gray-300">
        {(prim as any).type}
      </div>
      <div className="font-semibold text-sm">{String(prim.value)}</div>
    </div>
  </div>
);

interface HeapVariableData extends Record<string, any> {
  heap: ReturnType<typeof CppUtils.cppConvertHeap>;
}
export type HeapNodeType = Node<HeapVariableData>;

export const HeapNode: React.FC<NodeProps<HeapNodeType>> = ({ data, id }) => {
  const { value: variable, kind: heapKind } = data.heap;
  const { showMemory } = useSettingsContext();
  const isReadOnly = heapKind === "readonly_memory";

  const colour = useMemo(() => {
    if (isReadOnly) return "green";
    if (variable.kind === "C_ARRAY") return "yellow";
    if (variable.kind === "C_STRUCT") return "purple";
    return "blue";
  }, [isReadOnly, variable.kind]);

  const cls = useMemo(() => buildClasses(colour), [colour]);

  const body = useMemo(() => {
    switch (variable.kind) {
      case "C_ARRAY":
        return (
          <ArrayRenderer
            arr={variable as CppArrayVariableType<any>}
            id={id}
            elemCls={cls.elem}
            isReadOnly={isReadOnly}
          />
        );
      default:
        return <PrimitiveRenderer prim={variable as any} />;
    }
  }, [variable, id, cls.elem, isReadOnly]);

  return (
    <div className={cls.container} style={{ zIndex: 1 }}>
      <div className={cls.header}>
        <div className="flex justify-between items-center">
          <span>{data.label}</span>
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-input`}
            className="!w-0 !h-0 !opacity-0"
            style={{ left: -6, zIndex: 1001 }}
          />
        </div>
        {showMemory && (
          <div className="text-xs font-mono text-gray-300">{data.address}</div>
        )}
      </div>
      {body}
    </div>
  );
};
