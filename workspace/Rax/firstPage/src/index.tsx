import { useCallback, useEffect, useState } from "rax";
import { createAppHook } from "state";
import "./index.less";
const { useAppInstance, useAppState } = createAppHook(useState, useEffect, useCallback);
const Index = () => {
  const toSecondPage = () => {
    wx.navigateTo({
      url: "/pages/subpackage-1/secondPage/index"
    });
  };
  const [count, setCount] = useAppState("count", 123);
  return (
    <view className="rax-demo">
      Hello World, I am {count}
      <button
        onClick={() => {
          setCount((prev) => prev + 1);
        }}
      ></button>
      <button onClick={toSecondPage}>to secondPage</button>
    </view>
  );
};

export default Index;
