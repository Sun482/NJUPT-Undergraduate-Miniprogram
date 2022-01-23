import { useState, useEffect } from "rax";
import "./index.less";

const Index = () => {
  const toSecondPage = () => {
    wx.navigateTo({
      url: "/pages/subpackage-1/secondPage/index"
    });
  };
  const getInstance = () => {
    const appInstance = getApp();
    console.log(appInstance);
    appInstance.b.c += 1;
  };
  const [count, setCount] = useState(0);
  const addCount = (count: number) => {
    setCount(count + 1);
    getInstance();
  };
  useEffect(() => {
    console.log("count:", count);
  }, [count]);
  return (
    <view className="rax-demo">
      Hello World, I am firstPage!
      <view>{count}</view>
      <view>
        <button onClick={() => addCount(count)}>点击+1</button>
      </view>
      <button onClick={toSecondPage}>to secondPage</button>
    </view>
  );
};

export default Index;
