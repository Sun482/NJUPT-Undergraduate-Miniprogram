import { useCallback, useEffect, useState } from "rax";
import { createAppHook } from "state";

const { useAppState } = createAppHook(useState, useEffect, useCallback);
const Index = () => {
  const [count, setCount] = useAppState("count");

  return (
    <view
      onClick={() => {
        setCount((prev) => prev - 1);
      }}
    >
      页面通信示范:count为{count}
    </view>
  );
};

export default Index;
